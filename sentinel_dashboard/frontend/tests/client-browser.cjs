// Optional integration check. Requires Playwright plus the isolated verify_runtime services.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const state = process.env.SENTINEL_E2E_STATE;
if (!state || !path.basename(state).startsWith('verification-')) throw Error('Use an isolated endpoint.verify_runtime state directory.');
const fixture = JSON.parse(fs.readFileSync(path.join(state, 'verification.json'), 'utf8'));
const output = process.env.SENTINEL_E2E_ARTIFACTS || state;
async function clients() { return (await (await fetch(fixture.relay + '/operator/clients', { headers: { Authorization: 'Bearer ' + fixture.operatorKey } })).json()).clients; }

(async () => {
  assert.equal((await fetch('http://127.0.0.1:3001/api/fleet')).status, 403);
  assert.equal((await fetch('http://127.0.0.1:3001/api/readiness')).status, 403);
  const redirected = await fetch('http://127.0.0.1:3001/clients', { redirect: 'manual' });
  assert.equal(redirected.status, 307);
  assert.ok(redirected.headers.get('location').endsWith('/client'));
  const denied = await fetch('http://127.0.0.1:3001/api/client', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://external.test' }, body: JSON.stringify({ action: 'pause' }) });
  assert.equal(denied.status, 403);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1512, height: 1050 }, reducedMotion: 'reduce' });
    const external = new Set(), errors = [];
    await context.route('**/*', route => {
      const host = new URL(route.request().url()).hostname;
      if (['127.0.0.1', 'localhost'].includes(host)) return route.continue();
      external.add(host); return route.abort();
    });
    const operator = await context.newPage();
    operator.on('pageerror', error => errors.push(error.message));
    // The UI is real; its relay calls go to the isolated test store, never the production store.
    await operator.route('**/api/fleet', async route => {
      const body = route.request().method() === 'POST' ? route.request().postDataJSON() : null;
      const target = body ? '/operator/' + body.action : '/operator/clients';
      const response = await fetch(fixture.relay + target, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + fixture.operatorKey, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
      await route.fulfill({ status: response.status, contentType: 'application/json', body: await response.text() });
    });
    await operator.goto('http://127.0.0.1:3000/clients', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await operator.getByRole('button', { name: 'Enroll client', exact: true }).click();
    const deviceName = 'Verification client (local test)';
    await operator.getByLabel('Client name', { exact: true }).fill(deviceName);
    await operator.getByRole('button', { name: 'Create client key', exact: true }).click();
    const key = await operator.getByLabel('One-time pairing key', { exact: true }).inputValue();
    assert.ok(key.length >= 30);
    const client = await context.newPage();
    client.on('pageerror', error => errors.push(error.message));
    await client.goto('http://127.0.0.1:3001/client', { waitUntil: 'domcontentloaded' });
    await client.getByRole('button', { name: 'Connection', exact: true }).click();
    await client.getByLabel('Private relay address', { exact: true }).fill(fixture.relay);
    await client.getByLabel('Client pairing key', { exact: true }).fill(key);
    const paired = client.waitForResponse(response => response.url().endsWith('/api/client') && response.request().method() === 'POST');
    await client.getByRole('button', { name: 'Pair this computer', exact: true }).click();
    const pairing = await paired;
    assert.equal(pairing.status(), 200, await pairing.text());
    await client.locator('.endpoint-state').getByText('Connected to Sentinel', { exact: true }).waitFor({ timeout: 25000 });
    console.log('Passed: client UI pairing and accepted real health reports');
    await client.getByRole('button', { name: 'Overview', exact: true }).click();
    await client.getByRole('heading', { name: deviceName, exact: true }).waitFor();
    await client.screenshot({ path: path.join(output, 'sentinel-client-desktop.png'), fullPage: false });
    await operator.getByRole('button', { name: 'Client overview', exact: true }).click();
    await operator.getByRole('button', { name: 'Refresh', exact: true }).click();
    await operator.getByRole('button', { name: 'Inspect ' + deviceName, exact: true }).click();
    await operator.getByText('online', { exact: true }).waitFor();
    await operator.screenshot({ path: path.join(output, 'sentinel-clients-fleet.png'), fullPage: false });
    await client.getByRole('button', { name: 'Mereoleona', exact: true }).click();
    await client.getByRole('button', { name: 'Pause sharing', exact: false }).last().click();
    await client.locator('.endpoint-state').getByText('Sharing paused', { exact: true }).waitFor({ timeout: 15000 });
    const before = (await clients()).find(device => device.name === deviceName && device.status !== 'revoked').lastSeen;
    await new Promise(resolve => setTimeout(resolve, 6000));
    assert.equal((await clients()).find(device => device.name === deviceName && device.status !== 'revoked').lastSeen, before);
    console.log('Passed: reports paused at relay while local collection continued');
    await client.getByLabel('Message client guide', { exact: true }).fill('Resume sharing');
    await client.getByRole('button', { name: 'Send to client guide', exact: true }).click();
    await client.locator('.endpoint-state').getByText('Connected to Sentinel', { exact: true }).waitFor({ timeout: 20000 });
    assert.ok((await clients()).find(device => device.name === deviceName && device.status !== 'revoked').lastSeen > before);
    await client.getByRole('button', { name: 'Close client guide', exact: true }).click();
    await client.setViewportSize({ width: 390, height: 844 });
    assert.ok(await client.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Client mobile overflow');
    await client.screenshot({ path: path.join(output, 'sentinel-client-mobile.png'), fullPage: false });
    await operator.getByRole('button', { name: 'Revoke client access', exact: true }).click();
    await operator.getByRole('dialog').getByRole('button', { name: 'Revoke access', exact: true }).click();
    await client.locator('.endpoint-state').getByText('Access needs renewal', { exact: true }).waitFor({ timeout: 25000 });
    console.log('Passed: operator revocation was reflected at the client');
    await client.getByRole('button', { name: 'Connection', exact: true }).click();
    await client.getByRole('button', { name: 'Disconnect', exact: true }).click();
    await client.getByRole('dialog').getByRole('button', { name: 'Disconnect', exact: true }).click();
    await client.locator('.endpoint-state').getByText('Not paired yet', { exact: true }).waitFor({ timeout: 15000 });
    assert.ok(!JSON.parse(fs.readFileSync(path.join(state, 'client', 'connection.json'), 'utf8')).token);
    assert.deepEqual(errors, []);
    assert.deepEqual([...external], []);
    console.log('Passed: disconnect removed key; no browser errors or external requests; operator APIs and cross-site controls denied');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.stack); process.exit(1); });

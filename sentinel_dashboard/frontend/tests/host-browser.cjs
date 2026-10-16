// Functional host checks against local services. No real mitigation commands are sent.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.SENTINEL_E2E_HOST || 'http://127.0.0.1:3000';
const output = process.env.SENTINEL_E2E_ARTIFACTS;
if (!output) throw Error('Set SENTINEL_E2E_ARTIFACTS to a local output directory.');
fs.mkdirSync(output, { recursive: true });
const results = [], errors = [], external = new Set();
let page, context;
async function check(name, run) {
  if (process.env.SENTINEL_E2E_FILTER && !new RegExp(process.env.SENTINEL_E2E_FILTER).test(name) && !name.startsWith('First-run')) return;
  try { await run(); results.push({ name, passed: true }); console.log('PASS ' + name); }
  catch (error) { results.push({ name, passed: false, error: error.message }); console.log('FAIL ' + name + ': ' + error.message.slice(0, 400)); await page.screenshot({ path: path.join(output, 'failure-' + results.length + '.png') }).catch(() => {}); }
}
async function nav(label) { await page.locator('.workspace-sidebar nav button').filter({ hasText: label }).first().click(); }
async function command(text) {
  if (!await page.getByLabel('Message Mereoleona', { exact: true }).isVisible()) await page.getByRole('button', { name: 'Toggle Mereoleona assistant', exact: true }).click();
  const response = page.waitForResponse(r => r.url().endsWith('/api/assistant') && r.request().method() === 'POST', { timeout: 110000 });
  await page.getByLabel('Message Mereoleona', { exact: true }).fill(text);
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  const data = await (await response).json();
  await page.locator('.thinking-indicator').waitFor({ state: 'hidden', timeout: 110000 });
  assert.ok(data.reply); return data;
}
async function snapshot() {
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export snapshot', exact: true }).click();
  const file = await download;
  return JSON.parse(fs.readFileSync(await file.path(), 'utf8'));
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    context = await browser.newContext({ viewport: { width: 1536, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (['127.0.0.1', 'localhost'].includes(url.hostname) || ['blob:', 'data:'].includes(url.protocol)) return route.continue();
      external.add(url.hostname); return route.abort();
    });
    page = await context.newPage(); page.setDefaultTimeout(12000);
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await check('First-run welcome and complete five-step tour', async () => {
      await page.getByRole('dialog').getByRole('button', { name: 'Show me around', exact: true }).click();
      for (let i = 0; i < 4; i++) await page.locator('.tour-card').getByRole('button', { name: 'Next', exact: true }).click();
      await page.locator('.tour-card').getByRole('button', { name: "Let's explore", exact: true }).click();
      assert.equal(await page.locator('.tour-card').count(), 0);
    });
    await check('Demo overview, chart, real JSON download and provenance', async () => {
      const data = await snapshot(); assert.equal(data.source, 'generated-demo'); assert.ok(data.events.length >= 28 && data.events.length <= 50); assert.ok(data.exportedAt); assert.equal(data.domain, 'Network_Traffic');
      await page.getByRole('img', { name: /Anomaly scores for/ }).waitFor();
    });
    await check('Pause holds observations; resume restarts feed', async () => {
      await page.getByRole('button', { name: 'Pause', exact: true }).click(); const before = await snapshot();
      await page.waitForTimeout(2700); const after = await snapshot(); assert.deepEqual(after.events, before.events); assert.equal(after.paused, true);
      await page.getByRole('button', { name: 'Resume', exact: true }).click(); await page.waitForTimeout(2500);
      assert.notEqual((await snapshot()).events[0].id, before.events[0].id);
    });
    await check('Every main page and navigation Undo', async () => {
      for (const label of ['Network & devices', 'Incidents', 'Intelligence', 'Response', 'Evidence & audit', 'Settings', 'Overview']) { await nav(label); assert.ok((await page.locator('h1').innerText()).length); }
      await nav('Intelligence'); await page.getByRole('button', { name: 'Undo last workspace change', exact: true }).click(); assert.ok(page.url().endsWith('#overview'));
    });
    await check('All 13 demo domains reset to matching observations', async () => {
      await nav('Network & devices'); const cards = page.locator('.domain-card'); assert.equal(await cards.count(), 13);
      for (let i = 0; i < 13; i++) { await cards.nth(i).click(); await page.waitForTimeout(120); const data = await snapshot(); assert.ok(data.events.length); assert.ok(data.events.every(e => e.domain === data.domain)); }
      await cards.first().click();
    });
    await check('Search shortcut, no-results state, and filter reset', async () => {
      await page.keyboard.press('Control+k'); assert.equal(await page.getByLabel('Search observations', { exact: true }).evaluate(e => e === document.activeElement), true);
      await page.getByLabel('Search observations', { exact: true }).fill('no-such-observation-qa'); await page.getByLabel('Search observations', { exact: true }).press('Enter');
      await page.getByText('No observations match these filters.', { exact: true }).waitFor();
      await page.getByLabel('Search observations', { exact: true }).fill('');
      for (const filter of ['Flagged', 'Normal', 'All observations']) await page.getByRole('button', { name: filter, exact: true }).click();
      assert.ok(await page.locator('.event-row').count());
    });
    await check('Simulate confirmation, cancel, confirmed anomaly and inspection', async () => {
      await nav('Settings'); await page.getByRole('button', { name: 'Simulate an anomaly', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
      await page.getByRole('button', { name: 'Simulate an anomaly', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Run demonstration', exact: true }).click();
      await page.locator('#selected-observation').waitFor(); assert.ok((await snapshot()).events.some(e => e.isAnomaly));
      await page.getByRole('button', { name: 'Close observation details', exact: true }).click();
      await page.locator('.event-row').first().click(); await page.locator('#selected-observation').waitFor();
    });
    await check('Evidence mappings and evidence download', async () => { await nav('Evidence & audit'); assert.ok(await page.locator('.evidence-list > div').count()); const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export evidence', exact: true }).click(); assert.ok((await download).suggestedFilename().endsWith('.json')); });
    await check('Assistant commands, history, navigation, pause and Undo', async () => {
      assert.equal((await command('show Modbus')).action.domain, 'IoT_Modbus'); await page.waitForTimeout(150); assert.ok(page.url().endsWith('#network'));
      await command('pause the telemetry feed'); await page.locator('.workspace-footer').getByText('Updates paused', { exact: true }).waitFor();
      await command('undo that'); assert.equal((await snapshot()).paused, false);
      await command('open incidents'); assert.ok(page.url().endsWith('#incidents'));
      const messages = await page.locator('.chat-message').count(); await page.getByRole('button', { name: 'Close assistant', exact: true }).click(); await page.getByRole('button', { name: 'Toggle Mereoleona assistant', exact: true }).click(); assert.equal(await page.locator('.chat-message').count(), messages);
      assert.ok(!(await command('do not pause the telemetry feed')).action);
    });
    await check('Natural local-model reply and multi-turn context', async () => {
      const first = await command('My workshop is called Cedar. Please acknowledge that in one sentence.'); assert.equal(first.source, 'ollama');
      const second = await command('What is my workshop called?'); assert.equal(second.source, 'ollama'); assert.match(second.reply, /Cedar/i);
    });
    await check('Private microphone fallback and local speech toggle', async () => {
      await page.getByRole('button', { name: 'Use private microphone', exact: true }).click(); await page.locator('.voice-notice').waitFor();
      await page.getByRole('button', { name: 'Enable local spoken replies', exact: true }).click(); await page.getByRole('button', { name: 'Disable spoken replies', exact: true }).click();
    });
    await check('Assistant unavailable fallback keeps command controls usable', async () => {
      await page.route('**/api/assistant', r => r.abort());
      await page.getByLabel('Message Mereoleona', { exact: true }).fill('open settings'); await page.getByRole('button', { name: 'Send message', exact: true }).click();
      await page.waitForURL('**/#settings'); await page.locator('.voice-notice').getByText(/built-in guide/).waitFor(); await page.unroute('**/api/assistant');
    });
    await check('Readiness UI recheck and service status', async () => { await nav('Settings'); await page.getByRole('button', { name: 'Recheck local services', exact: true }).waitFor({ state: 'visible' }); await page.getByRole('button', { name: 'Recheck local services', exact: true }).click(); await page.getByText('Backend reachable', { exact: true }).first().waitFor(); });
    await check('Real backend observations, pause, reconnect and demo return', async () => {
      await nav('Network & devices'); await page.locator('.domain-card').first().click(); await nav('Settings');
      await page.getByRole('button', { name: /Local backend Connect to/ }).click();
      await page.locator('.source-badge').getByText('Backend connected', { exact: true }).waitFor({ timeout: 35000 });
      await nav('Incidents'); await page.locator('.event-row').first().waitFor({ timeout: 40000 });
      const data = await snapshot(); assert.equal(data.source, 'local-backend'); assert.ok(data.events.length);
      await nav('Research lab'); await page.locator('.lab-tabs').getByRole('button', { name: 'Robustness', exact: true }).click(); assert.equal(await page.getByRole('button', { name: 'SWITCH TO DEMO TO SIMULATE', exact: true }).isDisabled(), true);
      await page.locator('.lab-tabs').getByRole('button', { name: 'Threat lab', exact: true }).click(); await page.getByRole('button', { name: /SCENARIO #01/ }).click(); await page.getByText(/Scenario requested from the research backend/).waitFor();
      await command('pause the telemetry feed'); assert.equal((await snapshot()).paused, true); await command('resume the telemetry feed');
      await nav('Settings'); await page.getByRole('button', { name: 'Reconnect feed', exact: true }).click(); await page.locator('.source-badge').getByText('Backend connected', { exact: true }).waitFor({ timeout: 25000 });
      await page.getByRole('button', { name: /Demo workspace Explore/ }).click(); assert.equal((await snapshot()).source, 'generated-demo');
    });
    await check('Legacy research tabs mount without runtime errors', async () => {
      await nav('Research lab'); const inventory = {};
      for (const tab of ['Threat lab', 'XAI', 'Robustness', 'Remediation', 'GRC', 'Asset priority', 'Audit console', 'Playbooks']) {
        await page.locator('.lab-tabs').getByRole('button', { name: tab, exact: true }).click(); await page.locator('.legacy-workspace > div').waitFor({ timeout: 30000 });
        await page.waitForTimeout(350); inventory[tab] = await page.locator('.legacy-workspace button').allTextContents(); assert.ok((await page.locator('.legacy-workspace').innerText()).length > 100);
      }
      fs.writeFileSync(path.join(output, 'research-controls.json'), JSON.stringify(inventory, null, 2));
    });
    await check('Welcome replay and skip', async () => { await nav('Settings'); await page.getByRole('button', { name: 'Replay welcome', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Skip welcome', exact: true }).click(); assert.equal(await page.getByRole('dialog').count(), 0); });
    await check('Threat scenarios stay in demo and packet drawer controls work', async () => {
      await nav('Research lab'); await page.locator('.lab-tabs').getByRole('button', { name: 'Threat lab', exact: true }).click();
      const backendPosts = []; const listener = r => { if (r.method() === 'POST' && r.url().includes(':8000/')) backendPosts.push(r.url()); }; page.on('request', listener);
      await page.getByRole('button', { name: /SCENARIO #01/ }).click(); await page.getByText(/Generated scenario added to the demo/).waitFor(); assert.ok((await snapshot()).events.some(event => event.predictedClass === 'injection' && event.remediationAction.startsWith('Generated scenario only.'))); assert.deepEqual(backendPosts, []); page.off('request', listener);
      await page.getByRole('button', { name: 'Packet Dissector', exact: true }).click(); await page.getByTitle('Close Sniffer Overlay', { exact: true }).waitFor();
      await page.getByRole('button', { name: /Pause$/ }).click(); await page.getByRole('button', { name: /Clear$/ }).click(); await page.getByRole('button', { name: /Resume$/ }).click(); await page.getByTitle('Close Sniffer Overlay', { exact: true }).click();
    });
    await check('SOC analyst tabs and close control', async () => {
      await page.getByRole('button', { name: 'Agentic SOC Analyst', exact: true }).click();
      for (const name of [/SIGMA RULE/, /YARA SIGNATURE/, /WAR ROOM/]) await page.getByRole('button', { name }).click();
      await page.getByTitle('Close Analyst Room', { exact: true }).click();
    });
    await check('XAI modes and attention-head controls', async () => {
      await page.locator('.lab-tabs').getByRole('button', { name: 'XAI', exact: true }).click();
      for (const name of ['Input × Grad', 'IntGrad (m=50)', 'SmoothGrad', 'Attn Map', 'Head #1', 'Head #2', 'Head #3', 'Head #4']) await page.getByRole('button', { name, exact: true }).click();
    });
    await check('Robustness demo simulation and unavailable-kernel guard', async () => {
      await page.locator('.lab-tabs').getByRole('button', { name: 'Robustness', exact: true }).click(); await page.getByRole('button', { name: '1-Step FGSM', exact: true }).click();
      await page.getByRole('button', { name: 'SIMULATE FGSM OBSERVATION', exact: true }).click(); await page.getByRole('button', { name: 'SIMULATE FGSM OBSERVATION', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Carlini-Wagner', exact: true }).click(); assert.equal(await page.getByRole('button', { name: 'THIS KERNEL IS NOT IMPLEMENTED', exact: true }).isDisabled(), true);
      await page.getByRole('button', { name: 'DeepFool', exact: true }).click(); assert.equal(await page.getByRole('button', { name: 'THIS KERNEL IS NOT IMPLEMENTED', exact: true }).isDisabled(), true);
      await page.getByRole('button', { name: /PGD-20/ }).click();
    });
    await check('Research interlock validates badge and cancels locally', async () => {
      await page.locator('.lab-tabs').getByRole('button', { name: 'Remediation', exact: true }).click(); await page.getByRole('button', { name: 'TEST INTERLOCK (30s)', exact: true }).click();
      await page.getByLabel('AUTHORIZED OPERATOR BADGE ID:', { exact: true }).fill(''); await page.getByRole('button', { name: 'OVERRIDE & CANCEL SHUTDOWN', exact: true }).click(); await page.getByText(/Operator badge ID is required/).waitFor();
      await page.getByLabel('AUTHORIZED OPERATOR BADGE ID:', { exact: true }).fill('TEST-OPERATOR'); await page.getByRole('button', { name: 'OVERRIDE & CANCEL SHUTDOWN', exact: true }).click(); await page.getByText(/Research interlock canceled locally/).waitFor();
      const revoke = page.getByRole('button', { name: /^Revoke rule/ }).first(); if (await revoke.count()) { await revoke.click(); await page.getByText(/Demo rule revoked locally/).waitFor(); }
    });
    await check('GRC filters, illustrative audit bundle and CLI navigation', async () => {
      await page.locator('.lab-tabs').getByRole('button', { name: 'GRC', exact: true }).click();
      for (const name of ['NIST', 'ISO', 'IEC', 'ALL (7)']) await page.getByRole('button', { name, exact: true }).click();
      const popup = page.waitForEvent('popup'); await page.getByRole('button', { name: /Print observation report \/ PDF/ }).click(); const report = await popup; await report.getByRole('heading', { name: 'Sentinel observation report', exact: true }).waitFor(); assert.match(await report.locator('body').innerText(), /not a compliance certificate/); await report.close();
      await page.getByRole('button', { name: /External Audit Report/ }).click(); const dialog = page.getByRole('dialog', { name: 'Cryptographic Audit Verification Report Modal', exact: true }); await dialog.waitFor();
      const download = page.waitForEvent('download'); await dialog.getByRole('button', { name: 'EXPORT AUDIT BUNDLE', exact: true }).click(); assert.ok(JSON.parse(fs.readFileSync(await (await download).path(), 'utf8')));
      await dialog.getByRole('button', { name: 'LAUNCH AUDIT CLI', exact: true }).click(); await page.getByRole('button', { name: 'RUN ALL CHECKS', exact: true }).waitFor();
      await page.getByRole('button', { name: 'RUN ALL CHECKS', exact: true }).click(); await page.getByRole('button', { name: 'RUN ALL CHECKS', exact: true }).waitFor();
      for (const name of ['> VERIFY ZK PROOF', '> INSPECT MERKLE BRANCH', '> ATTEST TPM PCRS']) await page.getByRole('button', { name, exact: true }).click();
      const cliDownload = page.waitForEvent('download'); await page.getByRole('button', { name: '> EXPORT JSON', exact: true }).click(); const cliData = JSON.parse(fs.readFileSync(await (await cliDownload).path(), 'utf8')); assert.equal(cliData.source, 'research-simulation');
    });
    await check('Playbook filtering, dry run, policy tabs and simulated signing', async () => {
      await page.locator('.lab-tabs').getByRole('button', { name: 'Playbooks', exact: true }).click();
      for (const name of ['ICS', 'eBPF', 'SCADA', 'Air-Gap', 'ALL']) await page.getByRole('button', { name, exact: true }).click();
      await page.getByRole('button', { name: /Simulate \(Dry-Run\)/ }).click(); await page.waitForTimeout(3800);
      await page.getByRole('button', { name: /Safety Policies/ }).click(); await page.getByRole('button', { name: /C \/ eBPF Dissection/ }).click(); await page.getByRole('button', { name: /Compile & Sign/ }).click();
    });
    await check('Asset priority search, filters, triage and registration form', async () => {
      await page.locator('.lab-tabs').getByRole('button', { name: 'Asset priority', exact: true }).click();
      const search = page.getByPlaceholder('Search IP, name, protocol...', { exact: true }); await search.fill('no-matching-asset-qa'); assert.equal(await page.getByRole('button', { name: 'TEST PING', exact: true }).count(), 0); await search.fill('');
      await page.getByRole('button', { name: 'TRIAGE', exact: true }).first().click(); await page.locator('.legacy-workspace select').first().waitFor();
      await page.getByRole('button', { name: 'CONNECT DEVICE MANUALLY', exact: true }).click(); await page.getByPlaceholder('e.g. SCADA Pressure Valve 09', { exact: true }).fill('Verification asset (form only)');
      // Inspect and cancel: never register test assets in the production backend.
      await page.getByRole('button', { name: 'CANCEL', exact: true }).click(); assert.equal(await page.getByPlaceholder('e.g. SCADA Pressure Valve 09', { exact: true }).count(), 0);
    });
    await check('Desktop and mobile layouts, navigation and assistant', async () => {
      await nav('Overview'); await page.screenshot({ path: path.join(output, 'host-desktop.png') });
      for (const width of [390, 768, 1024]) {
        await page.setViewportSize({ width, height: 900 }); if (await page.getByRole('button', { name: 'Close assistant', exact: true }).isVisible()) await page.getByRole('button', { name: 'Close assistant', exact: true }).click();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow at ' + width);
        if (await page.getByRole('button', { name: 'Open navigation', exact: true }).isVisible()) await page.getByRole('button', { name: 'Open navigation', exact: true }).click(); await nav('Settings');
        assert.ok(page.url().endsWith('#settings')); await page.getByRole('button', { name: 'Toggle Mereoleona assistant', exact: true }).click(); await page.getByLabel('Message Mereoleona', { exact: true }).waitFor(); await page.getByRole('button', { name: 'Close assistant', exact: true }).click();
      }
      await page.setViewportSize({ width: 390, height: 844 }); await page.screenshot({ path: path.join(output, 'host-mobile.png') });
      await page.setViewportSize({ width: 1536, height: 1000 });
    });
    await check('Direct routes load and preserve requested workspace', async () => { for (const route of ['/audit', '/execute', '/priority', '/voice']) { const response = await page.goto(base + route, { waitUntil: 'domcontentloaded' }); assert.equal(response.status(), 200); await page.locator('h1').waitFor(); } });
    await check('Invalid assistant requests and cross-site fleet controls are rejected', async () => {
      for (const body of [null, {}, { query: '' }, { query: 'a'.repeat(2001) }]) { const response = await fetch(base + '/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); assert.equal(response.status, 400); }
      const response = await fetch(base + '/api/fleet', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://external.test' }, body: JSON.stringify({ action: 'enroll', name: 'Denied test' }) }); assert.equal(response.status, 403);
    });
    await check('Disconnected backend keeps an empty backend window; readiness errors recover', async () => {
      const offline = await browser.newContext({ reducedMotion: 'reduce' });
      try {
        await offline.addInitScript(() => { localStorage.setItem('sentinel_source', 'backend'); sessionStorage.setItem('sentinel_welcomed', 'true'); });
        await offline.routeWebSocket('ws://127.0.0.1:8000/ws/telemetry', socket => socket.close());
        const disconnected = await offline.newPage(); disconnected.on('pageerror', error => errors.push(error.message)); await disconnected.goto(base + '/#incidents'); await disconnected.locator('.source-badge').getByText('Backend offline', { exact: true }).waitFor(); assert.equal(await disconnected.locator('.event-row').count(), 0);
        await disconnected.route('**/api/readiness', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })); await disconnected.locator('.workspace-sidebar nav button').filter({ hasText: 'Settings' }).click(); await disconnected.getByRole('alert').getByText(/check could not finish/).waitFor();
        await disconnected.unroute('**/api/readiness'); await disconnected.getByRole('button', { name: 'Recheck local services', exact: true }).click(); await disconnected.getByText('Backend reachable', { exact: true }).first().waitFor();
      } finally { await offline.close(); }
    });
    await check('Host fleet outage state, disabled enrollment and recovery', async () => {
      await page.route('**/api/fleet', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Isolated outage check' }) })); await page.goto(base + '/clients'); await page.getByRole('alert').getByText('The client relay is unavailable', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Enroll client', exact: true }).click(); await page.getByLabel('Client name', { exact: true }).fill('Must not enroll while unavailable'); assert.equal(await page.getByRole('button', { name: 'Create client key', exact: true }).isDisabled(), true);
      await page.unroute('**/api/fleet'); await page.getByRole('button', { name: 'Refresh', exact: true }).click(); await page.getByText('Private relay available', { exact: true }).waitFor();
    });
    await check('No uncaught browser errors or external browser requests', async () => { assert.deepEqual(errors, []); assert.deepEqual([...external], []); });
  } finally {
    fs.writeFileSync(path.join(output, process.env.SENTINEL_E2E_FILTER ? 'host-results-focused.json' : 'host-results.json'), JSON.stringify({ results, errors, external: [...external] }, null, 2));
    await browser.close();
  }
  console.log(`${results.filter(r => r.passed).length}/${results.length} host checks passed`);
  if (results.some(r => !r.passed)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });

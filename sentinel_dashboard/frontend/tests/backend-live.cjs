// Local integration check; restores the backend's original playback settings.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = 'http://127.0.0.1:8000';
const results = [];
async function check(name, run) { try { await run(); results.push({ name, passed: true }); console.log('PASS ' + name); } catch (error) { results.push({ name, passed: false, error: error.message }); console.log('FAIL ' + name + ': ' + error.message); } }
(async () => {
  const original = await (await fetch(root + '/api/status')).json();
  const metadata = await (await fetch(root + '/api/domains')).json();
  const socket = new WebSocket(root.replace('http:', 'ws:') + '/ws/telemetry');
  let waiter, frames = [];
  socket.addEventListener('message', message => { const packet = JSON.parse(message.data); frames.push(packet); waiter?.(packet); });
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  const send = body => socket.send(JSON.stringify(body));
  const receive = predicate => new Promise((resolve, reject) => {
    const timer = setTimeout(() => { waiter = null; reject(Error('No matching telemetry received within 25 seconds')); }, 25000);
    waiter = packet => { if (predicate(packet)) { clearTimeout(timer); waiter = null; resolve(packet); } };
  });
  try {
    for (const route of ['/api/status', '/api/domains', '/api/host-metrics', '/api/audit-log', '/api/benchmarks', '/api/adversarial/status', '/api/soar/playbooks', '/api/packets/live', '/api/copilot/rag/status', '/api/priority/assets']) {
      await check('GET ' + route, async () => { const response = await fetch(root + route); assert.equal(response.status, 200); assert.ok(await response.json()); });
    }
    send({ action: 'SET_MODE', mode: 'simulator' }); send({ action: 'SET_PLAYBACK', is_playing: true, speed: 1 });
    assert.equal(Object.keys(metadata.domains).length, 13);
    for (const domain of Object.keys(metadata.domains)) {
      await check('Conformer prediction and explanation: ' + domain, async () => {
        const pending = receive(packet => packet.type === 'TELEMETRY_UPDATE' && packet.data.domain === domain && packet.data.inference);
        send({ action: 'SET_DOMAIN', domain });
        const { data } = await pending; const inference = data.inference;
        assert.ok(Number.isFinite(inference.anomaly_probability) && inference.anomaly_probability >= 0 && inference.anomaly_probability <= 1);
        assert.equal(typeof inference.forensic_label, 'string'); assert.ok(inference.saliency_attributions);
        assert.equal(data.mode, 'simulator'); assert.equal(data.buffered_steps, 10);
      });
    }
    await check('Backend pause, single-step and resume', async () => {
      send({ action: 'SET_PLAYBACK', is_playing: false }); await new Promise(resolve => setTimeout(resolve, 800)); const before = frames.length;
      await new Promise(resolve => setTimeout(resolve, 800)); assert.equal(frames.length, before);
      const step = receive(packet => packet.type === 'TELEMETRY_UPDATE'); send({ action: 'SET_PLAYBACK', step: true }); await step;
      const resume = receive(packet => packet.type === 'TELEMETRY_UPDATE'); send({ action: 'SET_PLAYBACK', is_playing: true }); await resume;
    });
  } finally {
    send({ action: 'SET_DOMAIN', domain: original.active_domain }); send({ action: 'SET_MODE', mode: original.mode }); send({ action: 'SET_PLAYBACK', is_playing: original.playback.is_playing, speed: original.playback.speed });
    await new Promise(resolve => setTimeout(resolve, 300)); socket.close();
    if (process.env.SENTINEL_E2E_ARTIFACTS) fs.writeFileSync(path.join(process.env.SENTINEL_E2E_ARTIFACTS, 'backend-results.json'), JSON.stringify(results, null, 2));
  }
  console.log(`${results.filter(result => result.passed).length}/${results.length} backend checks passed`);
  if (results.some(result => !result.passed)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });

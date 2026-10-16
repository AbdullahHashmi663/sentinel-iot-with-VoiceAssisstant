import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { controlKey, directory, loadModel, wav, defaultVoice, speechChunks } from './runtime.mjs';
await readFile(path.join(directory, 'ready.json'));
const token = await controlKey();
// All model/voice files must already be installed. Block outbound HTTP at runtime.
globalThis.fetch = async () => { throw Error('Voice runtime is offline; outbound fetch is disabled.'); };
let model, busy = false;
const server = http.createServer(async (request, response) => {
  const json = (status, data) => { response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); response.end(JSON.stringify(data)); };
  if (request.url === '/health' && request.method === 'GET') return json(200, { service: 'sentinel-voice', ready: true, engine: 'kokoro', voice: defaultVoice, offline: true });
  const supplied = Buffer.from(request.headers.authorization || ''), expected = Buffer.from('Bearer ' + token);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return json(401, { error: 'Local voice credential required.' });
  if (request.method !== 'POST' || request.url !== '/speak') return json(404, { error: 'Unknown voice route.' });
  if (busy) return json(429, { error: 'The local voice is already preparing a reply.' });
  busy = true;
  try {
    let body = ''; for await (const chunk of request) { body += chunk; if (Buffer.byteLength(body) > 10000) return json(413, { error: 'Voice request too long.' }); }
    let input; try { input = JSON.parse(body); } catch { return json(400, { error: 'Invalid voice request.' }); }
    if (typeof input.text !== 'string' || !input.text.trim() || input.text.length > 1600 || !['af_heart', 'af_bella'].includes(input.voice || defaultVoice)) return json(400, { error: 'Choose an installed voice and 1–1600 characters.' });
    model ||= loadModel(false).catch(error => { model = null; throw error; });
    const tts = await model;
    const parts = [];
    for (const text of speechChunks(input.text)) {
      const audio = await tts.generate(text, { voice: input.voice || defaultVoice, speed: 0.96 });
      parts.push(audio.audio);
    }
    const samples = new Float32Array(parts.reduce((n, value) => n + value.length, 0));
    let offset = 0; for (const part of parts) { samples.set(part, offset); offset += part.length; }
    const output = wav(samples);
    if (response.destroyed) return;
    response.writeHead(200, { 'Content-Type': 'audio/wav', 'Content-Length': output.length, 'Cache-Control': 'no-store' }); response.end(output);
  } catch { if (!response.headersSent) json(503, { error: 'Local neural voice could not generate speech. Check the voice runtime log.' }); }
  finally { busy = false; }
});
server.requestTimeout = 120000;
server.listen(8012, '127.0.0.1', () => console.log('Mereoleona neural voice ready locally on port 8012. Outbound requests disabled.'));

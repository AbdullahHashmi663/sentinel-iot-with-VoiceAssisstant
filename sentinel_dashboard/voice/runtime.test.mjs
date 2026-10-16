import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wav, speechChunks } from './runtime.mjs';
test('Long replies are split into bounded chunks without losing trailing words', () => {
  const text = 'A sentence about your dashboard. '.repeat(30) + 'Final words.';
  const chunks = speechChunks(text);
  assert.ok(chunks.every(chunk => chunk.length <= 240));
  assert.equal(chunks.join(' '), text.replace(/\s+/g, ' ').trim());
});
test('WAV encoding produces valid mono 24 kHz PCM and clips extreme samples', () => {
  const output = wav(new Float32Array([-2, -0.5, 0, 0.5, 2]));
  assert.equal(output.toString('ascii', 0, 4), 'RIFF');
  assert.equal(output.toString('ascii', 8, 12), 'WAVE');
  assert.equal(output.readUInt32LE(24), 24000);
  assert.equal(output.readUInt16LE(22), 1);
  assert.equal(output.readUInt32LE(40), 10);
  assert.equal(output.readInt16LE(44), -32767);
  assert.equal(output.readInt16LE(52), 32767);
});

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const state = process.env.SENTINEL_STATE_DIR || path.join(root, '.local');
export const directory = path.join(state, 'voice');
export const cache = path.join(directory, 'models');
export const modelId = 'onnx-community/Kokoro-82M-v1.0-ONNX';
export const defaultVoice = 'af_heart';
export function speechChunks(text, max = 240) {
  const chunks = []; let chunk = '';
  for (const word of text.trim().split(/\s+/)) {
    if (chunk && chunk.length + word.length + 1 > max) { chunks.push(chunk); chunk = ''; }
    if (word.length > max) {
      if (chunk) { chunks.push(chunk); chunk = ''; }
      for (let i = 0; i < word.length; i += max) chunks.push(word.slice(i, i + max));
    } else chunk += (chunk ? ' ' : '') + word;
    if (/[.!?]$/.test(word) && chunk.length >= 80) { chunks.push(chunk); chunk = ''; }
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}
export async function controlKey() {
  await mkdir(directory, { recursive: true });
  const name = path.join(directory, 'control.key');
  try { await writeFile(name, randomBytes(32).toString('base64url'), { flag: 'wx', mode: 0o600 }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  return (await readFile(name, 'utf8')).trim();
}
export async function loadModel(download = false) {
  const { env } = await import('@huggingface/transformers');
  env.cacheDir = cache;
  env.allowRemoteModels = download;
  // At runtime use the local cache only. This must never fetch a model on demand.
  const { KokoroTTS } = await import('kokoro-js');
  return KokoroTTS.from_pretrained(modelId, { dtype: 'q8', device: 'cpu' });
}
export function wav(samples, rate = 24000) {
  const out = Buffer.alloc(44 + samples.length * 2);
  out.write('RIFF'); out.writeUInt32LE(out.length - 8, 4); out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
  out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36); out.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
  return out;
}

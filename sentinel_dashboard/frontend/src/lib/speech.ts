export interface LocalVoice { name: string; voiceURI: string; lang: string; localService: boolean }

// Web Speech has no gender field. Prefer recognizable adult female voices by name,
// without ever selecting remote services. The user can audition other local voices.
export function preferredVoice<T extends LocalVoice>(voices: T[], selected?: string): T | undefined {
  const local = voices.filter(voice => voice.localService && /^en(?:-|_)/i.test(voice.lang));
  const explicit = local.find(voice => voice.voiceURI === selected);
  if (explicit) return explicit;
  const priorities = [/jenny/i, /aria/i, /samantha/i, /hazel/i, /susan/i, /zira/i, /karen/i, /moira/i, /tessa/i, /female/i];
  return priorities.map(pattern => local.find(voice => pattern.test(voice.name))).find(Boolean) || local[0];
}

export function speechText(text: string): string {
  return text.replace(/```[\s\S]*?```/g, ' Code is shown in the conversation. ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' the address shown on screen ')
    .replace(/[*_`#]/g, '').replace(/→/g, ', then ').replace(/\bIoT\b/g, 'I O T')
    .replace(/\bCPU\b/g, 'C P U').replace(/\bJSON\b/g, 'jay son').replace(/\s+/g, ' ').trim();
}

export interface PackInstaller {
  available?: (options: { langs: string[]; processLocally: boolean }) => Promise<string>;
  install?: (options: { langs: string[] }) => Promise<boolean>;
}

export async function installEnglishPack(engine: PackInstaller | undefined): Promise<string> {
  if (!engine?.available || !engine.install) throw Error('This browser does not support installing private speech packs. Use a browser with on-device speech recognition; text input remains available.');
  const status = await engine.available({ langs: ['en-US'], processLocally: true });
  if (status === 'available') return 'English speech pack is installed. The microphone is ready for private recognition.';
  if (status === 'unavailable') throw Error('This browser cannot download an English on-device pack on this installation. No audio was sent. Try a supported Chrome installation; text input remains available.');
  if (!['downloadable', 'downloading'].includes(status)) throw Error('The browser did not report a supported speech-pack state.');
  if (!await engine.install({ langs: ['en-US'] })) throw Error('The browser could not install the English pack. Check its download permissions and internet connection, then try again.');
  if (await engine.available({ langs: ['en-US'], processLocally: true }) !== 'available') throw Error('The download finished, but the browser has not made the English pack available yet. Retry after restarting the browser.');
  return 'English speech pack installed. Choose the microphone to begin private recognition.';
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, AudioLines, Check, ChevronDown, Mic, Plus, ShieldCheck, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import SentinelOrb from "./SentinelOrb";
import { guideAnswer, resolveCommand, type AssistantAction, type AssistantContext, type AssistantReply } from "@/lib/assistant";
import { installEnglishPack, preferredVoice, speechText } from "@/lib/speech";

interface Message { role: "user" | "assistant"; content: string; source?: string }
interface LocalRecognition {
  processLocally: boolean; lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: { results: { transcript: string }[][] }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
  start(): void; stop(): void;
}
interface RecognitionConstructor { new(): LocalRecognition; available?: (options: { langs: string[]; processLocally: boolean }) => Promise<string>; install?: (options: { langs: string[] }) => Promise<boolean> }

export default function SentinelAssistant({ context, onAction, onClose, seed, onStatus, open }: {
  context: AssistantContext; onAction: (action: AssistantAction) => string | void; onClose: () => void;
  seed?: { text: string; id: number }; onStatus: (status: { mode: string; model: string | null }) => void; open: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hello, I'm Mereoleona. Think of me as your guide to Sentinel. I can show you around, explain an alert, or help you set things up. Where would you like to start?", source: "local-guide" }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState(false);
  const [notice, setNotice] = useState("");
  const [mode, setMode] = useState("local-guide");
  const [voiceSettings, setVoiceSettings] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [installingPack, setInstallingPack] = useState(false);
  const [neuralReady, setNeuralReady] = useState(false);
  const [preparingVoice, setPreparingVoice] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string | null>(null);
  const speechRequest = useRef<AbortController | null>(null);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const recognition = useRef<LocalRecognition | null>(null);
  const controller = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const seedSeen = useRef(0);
  const alive = useRef(true);
  const openRef = useRef(open);

  useEffect(() => {
    const synthesis = window.speechSynthesis;
    if (!synthesis) return;
    const refresh = () => setVoices(synthesis.getVoices().filter(voice => voice.localService && /^en(?:-|_)/i.test(voice.lang)));
    refresh(); synthesis.addEventListener("voiceschanged", refresh);
    return () => synthesis.removeEventListener("voiceschanged", refresh);
  }, []);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; controller.current?.abort(); speechRequest.current?.abort(); audio.current?.pause(); if (audioUrl.current) URL.revokeObjectURL(audioUrl.current); recognition.current?.stop(); window.speechSynthesis?.cancel(); };
  }, []);
  useEffect(() => {
    openRef.current = open;
    if (!open) {
      recognition.current?.stop(); speechRequest.current?.abort(); audio.current?.pause(); window.speechSynthesis?.cancel();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Mirror stopped external audio when the panel is hidden.
      setSpeaking(false); setPreparingVoice(false);
      return;
    }
    const abort = new AbortController();
    fetch("/api/assistant", { signal: abort.signal }).then(r => r.json()).then(status => { setMode(status.mode); onStatus(status); }).catch(() => {});
    fetch("/api/speech", { signal: abort.signal }).then(r => r.json()).then(status => setNeuralReady(status.ready === true)).catch(() => setNeuralReady(false));
    return () => abort.abort();
  }, [open, onStatus]);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" }); }, [messages, thinking]);

  const stopSpeech = () => {
    speechRequest.current?.abort(); audio.current?.pause();
    if (audioUrl.current) { URL.revokeObjectURL(audioUrl.current); audioUrl.current = null; }
    window.speechSynthesis?.cancel(); setSpeaking(false); setPreparingVoice(false);
  };
  const speak = async (text: string, preview = false) => {
    if ((!voice && !preview) || !openRef.current) return;
    stopSpeech();
    if (neuralReady && (!selectedVoice || selectedVoice.startsWith("af_"))) {
      const request = new AbortController(); speechRequest.current = request; setPreparingVoice(true);
      try {
        const response = await fetch("/api/speech", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: speechText(text).slice(0, 1600), voice: selectedVoice || "af_heart" }), signal: request.signal });
        if (!response.ok) throw Error("Voice not ready");
        const blob = await response.blob();
        if (request.signal.aborted || !openRef.current || !alive.current) return;
        const url = URL.createObjectURL(blob); audioUrl.current = url;
        const player = new Audio(url); audio.current = player;
        player.onended = () => { if (alive.current && audio.current === player) setSpeaking(false); URL.revokeObjectURL(url); };
        player.onerror = () => { if (alive.current) { setSpeaking(false); setNotice("Audio playback was unavailable. Try Preview voice again."); } URL.revokeObjectURL(url); };
        await player.play(); setSpeaking(true);
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setNotice("The neural voice could not play. Using the local system voice for this reply.");
      } finally { if (alive.current && speechRequest.current === request) setPreparingVoice(false); }
    }
    if (!window.speechSynthesis) return;
    const localVoice = preferredVoice(window.speechSynthesis.getVoices(), selectedVoice);
    if (!localVoice) { setNotice("No local English voice is available. Text replies are ready."); return; }
    window.speechSynthesis.cancel();
    const reply = new SpeechSynthesisUtterance(speechText(text));
    reply.voice = localVoice; reply.lang = localVoice.lang; reply.rate = 0.96; reply.pitch = 1; reply.volume = 1;
    reply.onstart = () => setSpeaking(true);
    reply.onend = () => { if (alive.current && utterance.current === reply) setSpeaking(false); };
    reply.onerror = () => { if (alive.current && utterance.current === reply) setSpeaking(false); };
    utterance.current = reply;
    window.speechSynthesis.speak(reply);
  };
  const send = async (text: string) => {
    if (!text.trim() || busy.current) return;
    busy.current = true;
    setThinking(true); setInput(""); setNotice("");
    recognition.current?.stop(); stopSpeech();
    const history = messages.slice(-8);
    setMessages(prev => [...prev, { role: "user", content: text }]);
    controller.current = new AbortController();
    try {
      const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.current.signal, body: JSON.stringify({ query: text, context, history }) });
      if (!response.ok) throw new Error("Assistant unavailable");
      const data: AssistantReply = await response.json();
      if (!alive.current) return;
      const actionReply = data.action ? onAction(data.action) : undefined;
      const reply = actionReply || data.reply;
      setMessages(prev => [...prev, { role: "assistant", content: reply, source: data.source }]);
      if (data.source === "ollama") {
        setMode("ollama");
        onStatus({ mode: "ollama", model: data.model || null });
      } else if (!resolveCommand(text)) {
        setMode("local-guide");
        onStatus({ mode: "local-guide", model: null });
        setNotice("Using the built-in guide. The local model is not ready or could not reply.");
      }
      void speak(reply);
    } catch (error) {
      if ((error as Error).name === "AbortError" || !alive.current) return;
      const fallback = resolveCommand(text) || guideAnswer(text, context);
      const actionReply = fallback.action ? onAction(fallback.action) : undefined;
      setMessages(prev => [...prev, { role: "assistant", content: actionReply || fallback.reply, source: "local-guide" }]);
      setMode("local-guide");
      onStatus({ mode: "local-guide", model: null });
      setNotice("Using the built-in guide. The local model service is unavailable.");
    } finally { busy.current = false; if (alive.current) setThinking(false); }
  };

  useEffect(() => {
    if (seed && seed.id !== seedSeen.current) { seedSeen.current = seed.id; void send(seed.text); }
    // A seed represents a discrete user action, not an automatic resend when context updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const startMicrophone = async () => {
    if (listening) { recognition.current?.stop(); return; }
    const browser = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Recognition?.available) { setNotice("This browser doesn't support private, on-device recognition. Please type your message; no audio is sent to a cloud service."); return; }
    try {
      const pack = await Recognition.available({ langs: ["en-US"], processLocally: true });
      if (pack !== "available") { setVoiceSettings(true); setNotice(pack === "unavailable" ? "This browser cannot provide the English on-device pack. Open Voice settings for details; text input remains available." : "Install the English speech pack in Voice settings below. The download needs internet; recognition then stays on this device."); return; }
      stopSpeech();
      const rec = new Recognition();
      rec.processLocally = true; rec.lang = "en-US"; rec.continuous = false; rec.interimResults = false;
      rec.onresult = event => { const text = event.results[0]?.[0]?.transcript; if (text) setInput(text); };
      rec.onerror = () => { setNotice("Microphone access was unavailable. You can still type."); setListening(false); };
      rec.onend = () => setListening(false);
      recognition.current = rec; rec.start(); setListening(true); setNotice("Listening on this device. Review the transcript before sending.");
    } catch { setNotice("Private speech recognition isn't available. Please use text."); }
  };

  const installPack = async () => {
    if (installingPack) return;
    setInstallingPack(true); setNotice("Preparing the English speech-pack download. No microphone audio is uploaded.");
    const browser = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    try { setNotice(await installEnglishPack(browser.SpeechRecognition || browser.webkitSpeechRecognition)); }
    catch (error) { setNotice((error as Error).message); }
    finally { if (alive.current) setInstallingPack(false); }
  };

  return <aside className="assistant-panel" aria-label="Mereoleona assistant">
    <div className="assistant-top"><div><Sparkles size={15} /><span>YOUR AI COMPANION</span></div><button className="icon-btn" onClick={() => setVoiceSettings(!voiceSettings)} aria-label="Voice settings" aria-expanded={voiceSettings}><Volume2 size={16} /></button><button className="icon-btn" onClick={onClose} aria-label="Close assistant"><X size={17} /></button></div>
    {voiceSettings && <section className="assistant-voice-settings" aria-label="Private voice settings">
      <h3>Mereoleona’s voice</h3><p>A calm adult female voice, generated on this computer. You can also choose an installed English system voice.</p>
      <label htmlFor="mereoleona-voice">Local voice</label>
      <select id="mereoleona-voice" value={selectedVoice} onChange={event => { setSelectedVoice(event.target.value); stopSpeech(); }}>
        <option value="">Automatic · {neuralReady ? "Mereoleona / neural female" : preferredVoice(voices)?.name || "Waiting for a local voice"}</option>
        {neuralReady && <><option value="af_heart">Mereoleona · Heart / neural female</option><option value="af_bella">Mereoleona · Bella / neural female</option></>}
        {voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}</option>)}
      </select>
      <div><button type="button" className="subtle-button" onClick={() => void speak("Hello, I’m Mereoleona. I’m here to help you understand your system, one step at a time.", true)}>Preview voice</button>{(speaking || preparingVoice) && <button type="button" className="text-button" onClick={stopSpeech}>Stop speech</button>}</div>
      <p>{neuralReady ? "Kokoro neural speech runs locally. No speech text is sent to a cloud service." : "System voice quality depends on the local engine. Host setup adds the neural female voice."}</p>
      <h3>Private microphone</h3><p>The English recognition pack belongs to this browser. Downloading it needs internet; it is separate from the speaking voice.</p>
      <button type="button" className="subtle-button" disabled={installingPack} onClick={() => void installPack()}>{installingPack ? "Installing English pack…" : "Install English speech pack"}</button>
    </section>}
    <div className="assistant-identity"><SentinelOrb active={thinking || speaking || listening || preparingVoice} /><h2>Mereoleona<span>.</span></h2><p><i className="status-dot" />{listening ? "Listening locally" : preparingVoice ? "Preparing her voice locally" : speaking ? "Speaking" : thinking ? "Thinking with you" : "Here to make it simple"}</p><span className="assistant-mode"><ShieldCheck size={11} />{mode === "ollama" ? "LOCAL AI MODEL" : "BUILT-IN LOCAL GUIDE"}<ChevronDown size={10} /></span></div>
    <div className="assistant-messages" ref={log} role="log" aria-live="polite" aria-relevant="additions text">
      {messages.map((message, i) => <div key={i} className={`chat-message ${message.role}`}><span className="message-author">{message.role === "user" ? "YOU" : "MEREOLEONA"}{message.source === "ollama" && <Sparkles size={10} />}</span><p>{message.content}</p>{message.role === "assistant" && i > 0 && <span className="message-source"><Check size={10} />{message.source === "ollama" ? "On-device model" : "Project guide"}</span>}</div>)}
      {thinking && <div className="thinking-indicator" role="status"><span /><span /><span /><small>Working on it…</small></div>}
    </div>
    {messages.length < 4 && <div className="assistant-suggestions">{["Give me a tour", "Summarize my telemetry", "Explain the latest alert"].map(text => <button disabled={thinking} key={text} onClick={() => void send(text)}><Plus size={12} />{text}</button>)}</div>}
    <div className="assistant-compose">{notice && <p className="voice-notice" role="status">{notice}</p>}<form onSubmit={e => { e.preventDefault(); void send(input); }}><label className="sr-only" htmlFor="assistant-message">Message Mereoleona</label><textarea id="assistant-message" value={input} maxLength={2000} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(input); } }} placeholder="Ask me anything about Sentinel…" rows={2} /><div><button type="button" className={`icon-btn ${listening ? "coral" : ""}`} aria-pressed={listening} aria-label={listening ? "Stop listening" : "Use private microphone"} onClick={() => void startMicrophone()}><Mic size={16} /></button><button type="button" className="icon-btn" aria-pressed={voice} aria-label={voice ? "Disable spoken replies" : "Enable local spoken replies"} onClick={() => { setVoice(!voice); if (voice) stopSpeech(); }} >{voice ? <Volume2 size={16} /> : <VolumeX size={16} />}</button><span>Enter to send</span><button className="send-btn" disabled={!input.trim() || thinking} aria-label="Send message"><ArrowUp size={17} /></button></div></form><p><AudioLines size={11} /> Private by design. Runs on your machine.</p></div>
  </aside>;
}

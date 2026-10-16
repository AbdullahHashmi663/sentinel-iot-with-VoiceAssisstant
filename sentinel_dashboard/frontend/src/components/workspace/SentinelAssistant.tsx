"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, AudioLines, Check, ChevronDown, Mic, Plus, ShieldCheck, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import SentinelOrb from "./SentinelOrb";
import { guideAnswer, resolveCommand, type AssistantAction, type AssistantContext, type AssistantReply } from "@/lib/assistant";

interface Message { role: "user" | "assistant"; content: string; source?: string }
interface LocalRecognition {
  processLocally: boolean; lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: { results: { transcript: string }[][] }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
  start(): void; stop(): void;
}
interface RecognitionConstructor { new(): LocalRecognition; available?: (options: { langs: string[]; processLocally: boolean }) => Promise<string> }

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
  const log = useRef<HTMLDivElement>(null);
  const recognition = useRef<LocalRecognition | null>(null);
  const controller = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const seedSeen = useRef(0);
  const alive = useRef(true);
  const openRef = useRef(open);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; controller.current?.abort(); recognition.current?.stop(); window.speechSynthesis?.cancel(); };
  }, []);
  useEffect(() => {
    openRef.current = open;
    if (!open) { recognition.current?.stop(); window.speechSynthesis?.cancel(); return; }
    const abort = new AbortController();
    fetch("/api/assistant", { signal: abort.signal }).then(r => r.json()).then(status => { setMode(status.mode); onStatus(status); }).catch(() => {});
    return () => abort.abort();
  }, [open, onStatus]);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" }); }, [messages, thinking]);

  const speak = (text: string) => {
    if (!voice || !openRef.current || !window.speechSynthesis) return;
    const localVoice = window.speechSynthesis.getVoices().find(v => v.localService && v.lang.startsWith("en"));
    if (!localVoice) { setNotice("No local English voice is available. Text replies are ready."); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = localVoice; utterance.rate = 1.02;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => { if (alive.current) setSpeaking(false); };
    utterance.onerror = () => { if (alive.current) setSpeaking(false); };
    window.speechSynthesis.speak(utterance);
  };
  const send = async (text: string) => {
    if (!text.trim() || busy.current) return;
    busy.current = true;
    setThinking(true); setInput(""); setNotice("");
    recognition.current?.stop(); window.speechSynthesis?.cancel(); setSpeaking(false);
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
      speak(reply);
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
      if (await Recognition.available({ langs: ["en-US"], processLocally: true }) !== "available") { setNotice("An on-device English speech pack isn't installed. You can enable it in your browser settings, or use text."); return; }
      window.speechSynthesis?.cancel(); setSpeaking(false);
      const rec = new Recognition();
      rec.processLocally = true; rec.lang = "en-US"; rec.continuous = false; rec.interimResults = false;
      rec.onresult = event => { const text = event.results[0]?.[0]?.transcript; if (text) setInput(text); };
      rec.onerror = () => { setNotice("Microphone access was unavailable. You can still type."); setListening(false); };
      rec.onend = () => setListening(false);
      recognition.current = rec; rec.start(); setListening(true); setNotice("Listening on this device. Review the transcript before sending.");
    } catch { setNotice("Private speech recognition isn't available. Please use text."); }
  };

  return <aside className="assistant-panel" aria-label="Mereoleona assistant">
    <div className="assistant-top"><div><Sparkles size={15} /><span>YOUR AI COMPANION</span></div><button className="icon-btn" onClick={onClose} aria-label="Close assistant"><X size={17} /></button></div>
    <div className="assistant-identity"><SentinelOrb active={thinking || speaking || listening} /><h2>Mereoleona<span>.</span></h2><p><i className="status-dot" />{listening ? "Listening locally" : speaking ? "Speaking" : thinking ? "Thinking with you" : "Here to make it simple"}</p><span className="assistant-mode"><ShieldCheck size={11} />{mode === "ollama" ? "LOCAL AI MODEL" : "BUILT-IN LOCAL GUIDE"}<ChevronDown size={10} /></span></div>
    <div className="assistant-messages" ref={log} role="log" aria-live="polite" aria-relevant="additions text">
      {messages.map((message, i) => <div key={i} className={`chat-message ${message.role}`}><span className="message-author">{message.role === "user" ? "YOU" : "MEREOLEONA"}{message.source === "ollama" && <Sparkles size={10} />}</span><p>{message.content}</p>{message.role === "assistant" && i > 0 && <span className="message-source"><Check size={10} />{message.source === "ollama" ? "On-device model" : "Project guide"}</span>}</div>)}
      {thinking && <div className="thinking-indicator" role="status"><span /><span /><span /><small>Working on it…</small></div>}
    </div>
    {messages.length < 4 && <div className="assistant-suggestions">{["Give me a tour", "Summarize my telemetry", "Explain the latest alert"].map(text => <button disabled={thinking} key={text} onClick={() => void send(text)}><Plus size={12} />{text}</button>)}</div>}
    <div className="assistant-compose">{notice && <p className="voice-notice" role="status">{notice}</p>}<form onSubmit={e => { e.preventDefault(); void send(input); }}><label className="sr-only" htmlFor="assistant-message">Message Mereoleona</label><textarea id="assistant-message" value={input} maxLength={2000} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(input); } }} placeholder="Ask me anything about Sentinel…" rows={2} /><div><button type="button" className={`icon-btn ${listening ? "coral" : ""}`} aria-pressed={listening} aria-label={listening ? "Stop listening" : "Use private microphone"} onClick={() => void startMicrophone()}><Mic size={16} /></button><button type="button" className="icon-btn" aria-pressed={voice} aria-label={voice ? "Disable spoken replies" : "Enable local spoken replies"} onClick={() => { setVoice(!voice); if (voice) { window.speechSynthesis?.cancel(); setSpeaking(false); } }} >{voice ? <Volume2 size={16} /> : <VolumeX size={16} />}</button><span>Enter to send</span><button className="send-btn" disabled={!input.trim() || thinking} aria-label="Send message"><ArrowUp size={17} /></button></div></form><p><AudioLines size={11} /> Private by design. Runs on your machine.</p></div>
  </aside>;
}

"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Each refresh starts a cancellable local service probe. */
import { useEffect, useState } from "react";
import { Activity, ArrowRight, Check, ChevronDown, Cpu, FlaskConical, Radio, RefreshCw, Sparkles } from "lucide-react";
import { domainLabel, type AssistantContext } from "@/lib/assistant";
import { feedReadiness, type SystemReadiness as ReadinessResult } from "@/lib/readiness";

export default function SystemReadiness({ context, feed, expandedDefault = false, onReconnect, onDemo, onBackend, onAssistant, onStatus }: {
  context: AssistantContext;
  feed: { ready: boolean; stale: boolean; lastSeen: number | null };
  expandedDefault?: boolean;
  onReconnect: () => void; onDemo: () => void; onBackend: () => void; onAssistant: () => void;
  onStatus: (status: { mode: string; model: string | null }) => void;
}) {
  const [expanded, setExpanded] = useState(expandedDefault);
  const [data, setData] = useState<ReadinessResult | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setChecking(true);
    fetch("/api/readiness", { cache: "no-store", signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Check unavailable");
      const result: ReadinessResult = await response.json();
      if (controller.signal.aborted) return;
      setData(result); setError(false);
      onStatus({ mode: result.assistant.state === "ready" ? "ollama" : "local-guide", model: result.assistant.model });
    }).catch(() => { if (!controller.signal.aborted) { setError(true); setData(null); } })
      .finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, [refresh, onStatus]);
  useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden) setRefresh(value => value + 1); }, 30000);
    return () => clearInterval(timer);
  }, []);

  const telemetry = feedReadiness({ ...context, ...feed });
  const backend = data?.backend;
  const assistant = data?.assistant;
  const unknown = error ? "Check unavailable" : "Checking";
  const backendLabel = !backend ? unknown : backend.reachable ? "Backend reachable" : context.demo ? "Backend optional in demo" : "Backend unavailable";
  const assistantLabel = !assistant ? unknown : assistant.state === "ready" ? "Local AI available" : assistant.state === "missing-model" ? "Local model missing" : "Project guide available";
  const loaded = backend?.loadedDomains.includes(context.domain);
  const detectionLabel = context.demo ? "Demo illustration" : !backend ? unknown : !backend.reachable ? "Awaiting backend" : loaded ? "Detection model loaded" : "Model not loaded yet";

  return <section className="system-readiness" aria-label="System readiness">
    <div className="readiness-heading">
      <button className="readiness-toggle" aria-expanded={expanded} aria-controls="readiness-details" onClick={() => setExpanded(value => !value)}><span className="readiness-emblem"><Activity size={17} /></span><span><strong>System check</strong><small>Your local services, at a glance</small></span><ChevronDown size={15} className={expanded ? "turned" : ""} /></button>
      <button className="subtle-button compact" disabled={checking} onClick={() => setRefresh(value => value + 1)} aria-label="Recheck local services"><RefreshCw size={13} className={checking ? "readiness-spinning" : ""} />{checking ? "Checking…" : "Check again"}</button>
    </div>
    <div className="readiness-summary"><span className={backend?.reachable ? "ready" : "neutral"}><Radio size={11} />{backendLabel}</span><span className={assistant?.state === "ready" ? "ready" : "neutral"}><Sparkles size={11} />{assistantLabel}</span><span className={telemetry.tone}><Activity size={11} />{telemetry.label}</span></div>
    {error && <p className="readiness-error" role="alert">The check could not finish. Your workspace is still available. Choose “Check again” to retry.</p>}
    {expanded && <div id="readiness-details" className="readiness-details">
      <div className="readiness-grid">
        <article><span className="readiness-card-title"><Radio size={15} />Local backend</span><strong>{backendLabel}</strong><p>{!backend ? "Checking the local service without starting or changing it." : backend.reachable ? `The local service responded.${backend.mode === "simulator" ? " It is configured for dataset replay." : backend.mode === "live_host" ? " It is configured for host telemetry." : " Its data mode was not reported."} This does not verify physical devices.` : "Run START_SENTINEL_DASHBOARD.bat in the project folder, then check again. Demo mode works while the backend is offline."}</p>{context.demo ? <button className="text-button" onClick={onBackend}>Use local backend <ArrowRight size={12} /></button> : <button className="text-button" onClick={onDemo}>Explore demo <FlaskConical size={12} /></button>}</article>
        <article><span className="readiness-card-title"><Cpu size={15} />Detection engine</span><strong>{detectionLabel}</strong><p>{context.demo ? "These observations are generated examples. The Conformer detection engine is used when you connect the backend." : loaded ? `The backend reports ${domainLabel(context.domain)} loaded. Look for arriving observations to confirm predictions are reaching this workspace.` : "Connect the backend and resume the feed to request predictions. If the model stays unloaded, check the backend terminal for model-file or dependency errors."}</p><span className="readiness-footnote">Selected domain · {domainLabel(context.domain)}</span></article>
        <article><span className="readiness-card-title"><Sparkles size={15} />Mereoleona</span><strong>{assistantLabel}</strong><p>{!assistant ? "Checking whether the configured chat model is available locally. This does not start a conversation." : assistant.state === "ready" ? `${assistant.model} is installed locally. The first reply can take a moment while it loads. No test conversation is sent by this check.` : assistant.state === "missing-model" ? "Ollama responded, but the configured local chat model is missing or unsuitable. Check the model setup below. The built-in guide still works." : "Start the project launcher to run private Ollama, then check again. The built-in guide can still help with navigation and telemetry."}</p><button className="text-button" onClick={onAssistant}>Talk to Mereoleona <ArrowRight size={12} /></button></article>
        <article><span className="readiness-card-title"><Activity size={15} />Telemetry feed</span><strong>{telemetry.label}</strong><p>{telemetry.detail}</p>{!context.demo && <><button className="text-button" onClick={onReconnect}>Reconnect feed <RefreshCw size={12} /></button><span className="readiness-footnote">Reconnecting starts a fresh observation window.</span></>}</article>
      </div>
      <div className="readiness-caption"><span><Check size={12} />Local checks only · no model generation</span><span>{data ? `Last checked ${new Date(data.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Not checked yet"}</span></div>
    </div>}
  </section>;
}

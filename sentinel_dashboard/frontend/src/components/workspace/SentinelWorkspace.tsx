"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Hydrate the URL and session preferences only after browser APIs become available. */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Activity, ArrowDownToLine, ArrowRight, ArrowUpRight, AudioLines, Bell, Undo2, BookOpen, Braces, Check, CheckCheck, ChevronDown, ChevronRight, CircleHelp, Command, Cpu, FlaskConical, LayoutDashboard, Menu, Network, Pause, Play, Radio, Search, Settings2, Shield, ShieldCheck, SlidersHorizontal, Sparkles, Workflow, X } from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import { mockTelemetry } from "@/services/mockTelemetryService";
import { domainLabel, domains, sections, type AssistantAction, type AssistantContext, type Section } from "@/lib/assistant";
import type { TelemetryEvent } from "@/types/sentinel";
import { useSentinelFeed } from "./useSentinelFeed";
import NetworkMap from "./NetworkMap";
import SentinelOrb from "./SentinelOrb";
import SentinelAssistant from "./SentinelAssistant";
import SystemReadiness from "./SystemReadiness";
import { workspaceChange, undoPatch, undoMessage, type WorkspacePatch, type WorkspaceChange, type WorkspaceSnapshot } from "@/lib/workspace-history";

const loading = () => <div className="empty-state">Loading research workspace…</div>;
const XaiConsole = dynamic(() => import("@/components/consoles/XaiConsole"), { loading });
const ThreatLabConsole = dynamic(() => import("@/components/consoles/ThreatLabConsole"), { loading });
const AdversarialConsole = dynamic(() => import("@/components/consoles/AdversarialConsole"), { loading });
const RemediationConsole = dynamic(() => import("@/components/consoles/RemediationConsole"), { loading });
const ComplianceConsole = dynamic(() => import("@/components/consoles/ComplianceConsole"), { loading });
const PriorityConsole = dynamic(() => import("@/components/consoles/PriorityConsole"), { loading });
const AuditConsole = dynamic(() => import("@/components/consoles/CryptographicAuditBundleConsole"), { loading });
const Playbooks = dynamic(() => import("@/components/SOARPlaybookBuilder"), { loading });
const PacketDrawer = dynamic(() => import("@/components/LivePacketSnifferDrawer"));
const AnalystModal = dynamic(() => import("@/components/AgenticSocAnalystModal"));
const AuditReport = dynamic(() => import("@/components/modals/CryptographicAuditReportModal"));

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard }, { id: "network", label: "Network & devices", icon: Network },
  { id: "incidents", label: "Incidents", icon: Shield }, { id: "intelligence", label: "Intelligence", icon: Sparkles },
  { id: "response", label: "Response", icon: Workflow }, { id: "compliance", label: "Evidence & audit", icon: CheckCheck },
] as const;
const titles: Record<Section, [string, string]> = {
  overview: ["Your perimeter. In perspective.", "A clearer view of everything Sentinel sees."],
  network: ["Every source. One shared view.", "Explore the telemetry domains behind your perimeter."],
  incidents: ["Find the signal in the noise.", "Review observations, understand anomalies, and decide what comes next."],
  intelligence: ["See why. Then decide.", "Make sense of the features behind a model prediction."],
  response: ["A considered response.", "Understand reported containment and keep people in control."],
  compliance: ["Evidence you can follow.", "Trace observed events to their reported control mappings."],
  settings: ["Make Sentinel yours.", "Manage your data source and private assistant."],
  lab: ["Go a little deeper.", "The original research tools, together in one workspace."],
};
const tourSteps: { section: Section; title: string; text: string }[] = [
  { section: "overview", title: "01 / The big picture", text: "This is your overview. The source badge tells you whether you are exploring generated demo data or connected to the backend. The cards describe only the observations currently retained." },
  { section: "network", title: "02 / Choose what to watch", text: "Sentinel understands 13 telemetry domains. Select one to change the feed. The diagram illustrates the architecture; it isn't a scan of your physical network." },
  { section: "incidents", title: "03 / Look at an observation", text: "An anomaly is something the model found unusual. Select an observation to see its score, source, and explanation. A high score needs investigation; it isn't proof of an attack." },
  { section: "intelligence", title: "04 / Understand the reason", text: "Feature attribution shows which measurements influenced the latest prediction. Ask Mereoleona to explain the latest alert whenever the terminology feels unfamiliar." },
  { section: "overview", title: "You're ready to explore.", text: "You can always ask for help, pause the feed, or open the research tools. Try ‘show Modbus’, ‘summarize my telemetry’, or ‘simulate a threat’ in the assistant." },
];

function Eye({ small = false }: { small?: boolean }) {
  return <svg className={small ? "brand-eye small" : "brand-eye"} viewBox="0 0 96 64" fill="none" aria-hidden="true"><path d="M6 32C17 18 31 10 48 10S79 18 90 32" stroke="#b3df93" strokeWidth="3.5" /><path d="M90 32C79 46 65 54 48 54S17 46 6 32" stroke="#f1efe8" strokeWidth="3.5" /><circle cx="48" cy="32" r="14" stroke="#b3df93" strokeWidth="3" /><path d="m48 24 8 8-8 8-8-8Z" fill="#ff9985" /><path d="M17 19H8v-5M79 45h9v5" stroke="#b3df93" strokeWidth="2" /></svg>;
}
function Panel({ title, eyebrow, action, children, className = "" }: { title: string; eyebrow?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`workspace-panel ${className}`}><div className="panel-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action}</div>{children}</section>;
}
function FeedChart({ events }: { events: TelemetryEvent[] }) {
  const values = events.slice(0, 30).reverse();
  const points = values.map((e, i) => `${24 + i * (592 / Math.max(values.length - 1, 1))},${140 - e.anomalyProbability * 113}`).join(" ");
  return <div className="feed-chart"><div className="chart-key"><span><i />Anomaly score</span><span><i />Model threshold · 85%</span></div><svg viewBox="0 0 640 170" role="img" aria-label={`Anomaly scores for the last ${values.length} observations. Dashed line shows the 85 percent threshold.`}><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#b3df93" stopOpacity=".22" /><stop offset="1" stopColor="#b3df93" stopOpacity="0" /></linearGradient></defs>{[28, 66, 104, 140].map((y, i) => <g key={y}><line x1="24" y1={y} x2="616" y2={y} stroke="#414239" strokeWidth=".6" /><text x="0" y={y + 3} fill="#a8a99b" fontSize="8">{[100, 66, 33, 0][i]}</text></g>)}<line x1="24" y1="44" x2="616" y2="44" stroke="#ff9985" strokeOpacity=".6" strokeDasharray="4 5" />{values.length > 0 && <><polygon points={`24,140 ${points} ${24 + (values.length - 1) * (592 / Math.max(values.length - 1, 1))},140`} fill="url(#chart-fill)" /><polyline points={points} fill="none" stroke="#b3df93" strokeWidth="1.6" strokeLinejoin="round" />{values.map((e, i) => e.isAnomaly && <circle key={e.id} cx={24 + i * (592 / Math.max(values.length - 1, 1))} cy={140 - e.anomalyProbability * 113} r="3" fill="#ff9985"><title>{e.predictedClass}: {(e.anomalyProbability * 100).toFixed(1)}%</title></circle>)}</>}<text x="24" y="163" fill="#a8a99b" fontSize="8">OLDER OBSERVATIONS</text><text x="616" y="163" textAnchor="end" fill="#a8a99b" fontSize="8">LATEST</text></svg>{!values.length && <p className="chart-empty">Waiting for observations</p>}</div>;
}

export default function SentinelWorkspace({ initialSection = "overview", initialAssistant = false }: { initialSection?: Section; initialAssistant?: boolean }) {
  const store = useTelemetryStore();
  const feed = useSentinelFeed();
  const [section, setSection] = useState<Section>(initialSection);
  const sectionRef = useRef<Section>(initialSection);
  const history = useRef<WorkspaceChange[]>([]);
  const [lastChange, setLastChange] = useState<WorkspaceChange | null>(null);
  const [readinessRequest, setReadinessRequest] = useState(0);
  const setActiveConsole = store.setActiveConsole;
  useEffect(() => {
    const timer = setInterval(() => useTelemetryStore.getState().tickInterlock(), 1000);
    return () => clearInterval(timer);
  }, []);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [tour, setTour] = useState<number | null>(null);
  const [seed, setSeed] = useState<{ text: string; id: number }>();
  const [assistantStatus, setAssistantStatus] = useState<{ mode: string; model: string | null }>({ mode: "local-guide", model: null });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<TelemetryEvent | null>(null);
  const [confirmDemo, setConfirmDemo] = useState(false);
  const [labTool, setLabTool] = useState("threat");
  const [toast, setToast] = useState("");
  const welcomeDialog = useRef<HTMLDialogElement>(null);
  const confirmation = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const events = store.events;
  const anomalies = events.filter(e => e.isAnomaly);
  const latest = store.latestEvent;
  const navigateRaw = useCallback((next: Section) => { sectionRef.current = next; setSection(next); setMobileNav(false); window.history.replaceState(null, "", `#${next}`); window.scrollTo({ top: 0 }); }, []);
  const snapshot = (): WorkspaceSnapshot => ({ section: sectionRef.current, domain: useTelemetryStore.getState().activeDomain, demo: useTelemetryStore.getState().isMockMode, paused: feed.getPaused() });
  const clearHistory = () => { history.current = []; setLastChange(null); };
  const applyPatch = (patch: WorkspacePatch) => {
    const current = snapshot();
    if (patch.demo !== undefined && patch.demo !== current.demo) { setSelected(null); store.setIsMockMode(patch.demo); }
    if (patch.domain !== undefined && patch.domain !== current.domain) { setSelected(null); store.setActiveDomain(patch.domain); }
    if (patch.paused !== undefined) feed.setPaused(patch.paused, patch.demo === undefined || patch.demo === current.demo);
    if (patch.section !== undefined) navigateRaw(patch.section);
  };
  const changeWorkspace = (patch: WorkspacePatch, label: string) => {
    const change = workspaceChange(snapshot(), patch, label);
    if (!change) return;
    history.current = [...history.current.slice(-9), change];
    setLastChange(change);
    applyPatch(patch);
  };
  const navigate = (next: Section) => changeWorkspace({ section: next }, `Opening ${next}`);
  const changeDomain = (domain: TelemetryEvent["domain"]) => changeWorkspace({ domain }, `Selecting ${domainLabel(domain)}`);
  const changePaused = (paused: boolean) => changeWorkspace({ paused }, paused ? "Pausing telemetry" : "Resuming telemetry");
  const undoLastChange = () => {
    const change = history.current.at(-1);
    if (!change) return "There is no reversible workspace change to undo. I can undo navigation, source, domain, and pause changes made in this page session. Downloads and generated observations cannot be undone.";
    const patch = undoPatch(snapshot(), change);
    if (!patch) { clearHistory(); return "The workspace has changed since that action, so I did not overwrite your current settings. Make a new change to start a fresh undo history."; }
    history.current = history.current.slice(0, -1);
    setLastChange(history.current.at(-1) || null);
    applyPatch(patch);
    const reply = undoMessage(change);
    setToast(reply);
    return reply;
  };
  const statusCallback = useCallback((status: { mode: string; model: string | null }) => setAssistantStatus(status), []);
  const ask = (text: string) => { setAssistantOpen(true); setSeed({ text, id: Date.now() }); };
  useEffect(() => {
    const hash = location.hash.slice(1);
    if (sections.includes(hash as Section)) { sectionRef.current = hash as Section; setSection(hash as Section); }
    if (!sessionStorage.getItem("sentinel_welcomed")) setWelcome(true);
    setAssistantOpen(initialAssistant || !matchMedia("(max-width: 1080px)").matches);
    const shortcut = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); searchRef.current?.focus(); } };
    const hashChange = () => { const next = location.hash.slice(1); if (sections.includes(next as Section)) { sectionRef.current = next as Section; setSection(next as Section); } };
    window.addEventListener("keydown", shortcut); window.addEventListener("hashchange", hashChange);
    return () => { window.removeEventListener("keydown", shortcut); window.removeEventListener("hashchange", hashChange); };
  }, [initialAssistant]);
  useEffect(() => { if (welcome) welcomeDialog.current?.showModal(); else welcomeDialog.current?.close(); }, [welcome]);
  useEffect(() => { if (confirmDemo) confirmation.current?.showModal(); else confirmation.current?.close(); }, [confirmDemo]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 4500); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { const map = { network: "execute", incidents: "threat_lab", intelligence: "xai", response: "remediation", compliance: "compliance" } as const; setActiveConsole(section in map ? map[section as keyof typeof map] : "overview"); }, [section, setActiveConsole]);
  const dismissWelcome = () => { setWelcome(false); sessionStorage.setItem("sentinel_welcomed", "true"); };
  const startTour = () => { dismissWelcome(); setTour(0); navigate("overview"); if (matchMedia("(max-width: 1080px)").matches) setAssistantOpen(false); };
  const changeSource = (demo: boolean) => { if (demo !== useTelemetryStore.getState().isMockMode) changeWorkspace({ demo, paused: false }, demo ? "Switching to demo" : "Connecting the backend"); };
  const exportSnapshot = () => {
    clearHistory();
    const blob = new Blob([JSON.stringify({ source: store.isMockMode ? "generated-demo" : "local-backend", backendConnected: store.isConnected, paused: feed.paused, exportedAt: new Date().toISOString(), domain: store.activeDomain, note: "Observation snapshot. Not a certified audit or proof of enforcement.", events }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `sentinel-snapshot-${new Date().toISOString().slice(0, 10)}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setToast("Observation snapshot downloaded.");
  };
  const onAction = (action: AssistantAction) => {
    switch (action.type) {
      case "navigate": navigate(action.section); break;
      case "mode": changeSource(action.demo); break;
      case "playback": changePaused(action.paused); break;
      case "domain": changeWorkspace({ domain: action.domain, section: "network" }, `Selecting ${domainLabel(action.domain)}`); break;
      case "undo": return undoLastChange();
      case "readiness": navigate("settings"); setReadinessRequest(value => value + 1); break;
      case "tour": startTour(); break;
      case "simulate": setConfirmDemo(true); break;
      case "export": exportSnapshot(); break;
    }
  };
  const context: AssistantContext = { demo: store.isMockMode, connected: store.isConnected, paused: feed.paused, domain: store.activeDomain, section, events: events.length, anomalies: anomalies.length, latest, selected };
  const sourceLabel = store.isMockMode ? "Demo workspace" : !store.isConnected ? "Backend offline" : feed.stale ? "Backend · stale" : "Backend connected";
  const filteredEvents = events.filter(e => (filter === "all" || (filter === "anomaly" ? e.isAnomaly : !e.isAnomaly)) && `${e.predictedClass} ${e.sourceIp} ${e.domain}`.toLowerCase().includes(search.toLowerCase()));
  const inspect = (event: TelemetryEvent) => { setSelected(event); navigate("incidents"); requestAnimationFrame(() => document.getElementById("selected-observation")?.scrollIntoView({ block: "center" })); };
  const timedResponses = events.filter(e => e.mttrLatencyMs > 0);
  const latency = timedResponses.length ? (timedResponses.reduce((sum, e) => sum + e.mttrLatencyMs, 0) / timedResponses.length).toFixed(1) : "—";
  const blocked = events.filter(e => e.remediationStatus === "ACTIVE_BLOCKED").length;
  const eventList = (limit = 5) => <div className="event-list">{filteredEvents.slice(0, limit).map(event => <button className="event-row" key={event.id} onClick={() => inspect(event)}><span className={`event-symbol ${event.isAnomaly ? "anomaly" : "normal"}`}>{event.isAnomaly ? <Shield size={15} /> : <Activity size={15} />}</span><span className="event-info"><strong>{event.isAnomaly ? `${event.predictedClass.charAt(0).toUpperCase() + event.predictedClass.slice(1)} anomaly` : "Normal observation"}</strong><small>{event.sourceIp} <span>·</span> {domainLabel(event.domain)}</small></span><span className={`event-score ${event.isAnomaly ? "coral" : "mint"}`}>{(event.anomalyProbability * 100).toFixed(1)}%<small>ANOMALY SCORE</small></span><ChevronRight size={14} /></button>)}{!filteredEvents.length && <div className="empty-state">{search || filter !== "all" ? "No observations match these filters." : "No observations yet. Try demo mode or connect the backend."}</div>}</div>;

  return <div className={`sentinel-workspace ${assistantOpen ? "with-assistant" : ""}`}>
    <a className="skip-to-content" href="#workspace-main">Skip to workspace</a>
    <aside className={`workspace-sidebar ${mobileNav ? "mobile-open" : ""}`} aria-label="Main navigation"><Link className="workspace-brand" href="/" aria-label="Sentinel IoT home"><Eye /><span>sentinel<span>iot</span><i /></span></Link><button className="workspace-switch" onClick={() => navigate("settings")}><span className="workspace-avatar">S</span><span>Sentinel workspace<small>LOCAL RESEARCH ENVIRONMENT</small></span><ChevronDown size={13} /></button><span className="nav-caption">WORKSPACE</span><nav>{navigation.map(({ id, label, icon: Icon }) => <button className={section === id ? "active" : ""} aria-current={section === id ? "page" : undefined} key={id} onClick={() => navigate(id)}><Icon size={17} /><span>{label}</span>{id === "incidents" && anomalies.length > 0 && <b>{anomalies.length}</b>}</button>)}<Link className="client-machines-link" href="/clients"><Network size={17} />Client machines<ArrowUpRight size={12} /></Link></nav><span className="nav-caption second">EXPLORE</span><nav><button className={section === "lab" ? "active" : ""} onClick={() => navigate("lab")}><FlaskConical size={17} />Research lab<ArrowUpRight size={12} /></button><button onClick={() => ask("Give me a tour")}><BookOpen size={17} />Getting started</button><button className={section === "settings" ? "active" : ""} onClick={() => navigate("settings")}><Settings2 size={17} />Settings</button></nav><div className="sidebar-bottom"><div className="sidebar-assistant"><span className="eyebrow">A LITTLE GUIDANCE?</span><p>Complex systems.<br />Simple conversations.</p><button onClick={() => { setAssistantOpen(true); ask("What can you help me do?"); }}>Meet your assistant <ArrowUpRight size={15} /></button></div><button className="local-profile" onClick={() => navigate("settings")}><span>SO</span><div>Local operator<small>Private workspace</small></div><SlidersHorizontal size={15} /></button></div></aside>
    {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
    <div className="workspace-body"><header className="workspace-header"><div className="breadcrumb"><button className="icon-btn mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(!mobileNav)}><Menu size={19} /></button><span>Workspace</span><ChevronRight size={12} /><strong>{navigation.find(n => n.id === section)?.label || (section === "lab" ? "Research lab" : "Settings")}</strong></div><div className="header-actions"><form className="workspace-search" onSubmit={e => { e.preventDefault(); navigate("incidents"); }}><Search size={14} /><input ref={searchRef} aria-label="Search observations" placeholder="Search observations" value={search} onChange={e => setSearch(e.target.value)} /><kbd><Command size={9} /> K</kbd></form><button className="icon-btn notifications-btn" aria-label={`Review ${anomalies.length} flagged observations`} onClick={() => { setFilter("anomaly"); navigate("incidents"); }}><Bell size={17} />{anomalies.length > 0 && <i />}</button><span className="header-divider" /><button className={`assistant-toggle ${assistantOpen ? "active" : ""}`} aria-label="Toggle Mereoleona assistant" onClick={() => setAssistantOpen(!assistantOpen)} aria-pressed={assistantOpen}><Sparkles size={14} /><span>Assistant</span></button></div></header>
    <main id="workspace-main" className="workspace-main" tabIndex={-1}>
      <div className="workspace-brow"><span className="eyebrow"><i className="status-dot" />SENTINEL / CONTROL ROOM</span><button className={`source-badge ${!store.isMockMode && !store.isConnected ? "offline" : ""}`} onClick={() => navigate("settings")}><i className="status-dot" />{sourceLabel}<ChevronDown size={11} /></button></div>
      <div className="page-title"><div><h1>{titles[section][0]}</h1><p>{titles[section][1]}</p></div><button className="subtle-button export-button" aria-label="Export snapshot" onClick={exportSnapshot}><ArrowDownToLine size={14} /><span>Export snapshot</span></button></div>
      {lastChange && <div className="workspace-undo-bar"><span><Undo2 size={13} />Last change: {lastChange.label}</span><button onClick={() => { setToast(undoLastChange()); }} aria-label="Undo last workspace change">Undo <Undo2 size={12} /></button></div>}
      {(section === "overview" || section === "settings") && <SystemReadiness key={`${section}-${readinessRequest}`} context={context} feed={feed} expandedDefault={section === "settings"} onReconnect={() => { clearHistory(); feed.reconnect(); setToast("Reconnecting the feed. The observation window starts fresh."); }} onDemo={() => changeSource(true)} onBackend={() => changeSource(false)} onAssistant={() => setAssistantOpen(true)} onStatus={statusCallback} />}
      {tour !== null && <section className="tour-card" aria-live="polite"><span><Sparkles size={17} /></span><div><strong>{tourSteps[tour].title}</strong><p>{tourSteps[tour].text}</p></div><div className="tour-actions"><button className="text-button" onClick={() => setTour(null)}>End tour</button><button className="primary-button" onClick={() => { if (tour === tourSteps.length - 1) setTour(null); else { const next = tour + 1; setTour(next); navigate(tourSteps[next].section); } }}>{tour === tourSteps.length - 1 ? "Let's explore" : "Next"}<ArrowRight size={13} /></button></div></section>}
      {!store.isMockMode && !store.isConnected && <div className="connection-notice" role="status"><Radio size={16} /><span>Your local backend is offline. Start the project launcher or explore with generated demo data.</span><button onClick={() => changeSource(true)}>Try demo <ArrowRight size={13} /></button></div>}
      {section === "overview" && <>
        <div className="metric-grid">{[
          { label: "OBSERVATIONS", value: String(events.length).padStart(2, "0"), icon: Activity, detail: "In the current window", color: "mint" },
          { label: "FLAGGED ANOMALIES", value: String(anomalies.length).padStart(2, "0"), icon: Shield, detail: anomalies.length ? "Ready for a closer look" : "No flags in this window", color: "coral" },
          { label: "REPORTED CONTAINMENT", value: String(blocked).padStart(2, "0"), icon: ShieldCheck, detail: store.isMockMode ? "Simulated responses" : "Backend reported · verify", color: "mint" },
          { label: "RESPONSE LATENCY", value: latency, unit: timedResponses.length ? "ms" : "", icon: Cpu, detail: store.isMockMode ? "Illustrative sample timing" : "Mean reported timing", color: "cream" },
        ].map(({ label, value, icon: Icon, detail, color, unit }) => <div className="metric-card" key={label}><div><span>{label}</span><Icon size={15} /></div><strong>{value}<small>{unit}</small></strong><p><i className={`tiny-dot ${color}`} />{detail}</p></div>)}</div>
        <div className="overview-grid"><Panel title="Connected by intelligence." eyebrow="YOUR SENTINEL ECOSYSTEM" className="ecosystem-panel" action={<button className="icon-btn" aria-label="Expand network architecture" onClick={() => navigate("network")}><ArrowUpRight size={18} /></button>}><div className="ecosystem-meta"><span><i className="status-dot" />13 supported domains</span><span>1 shared detection pipeline</span></div><NetworkMap domain={store.activeDomain} onSelect={changeDomain} onNavigate={navigate} /></Panel><Panel title="A moment of clarity." eyebrow="YOUR WORKSPACE BRIEF" className="brief-panel"><span className="brief-orbit"><Eye small /></span><span className="brief-status">{store.isMockMode ? "DEMO OBSERVATIONS" : store.isConnected ? "BACKEND OBSERVATIONS" : "AWAITING CONNECTION"}</span><h3>{anomalies.length ? <>A few signals<br />deserve your attention<span>.</span></> : <>A quieter view.<br />A clearer perspective<span>.</span></>}</h3><p>{events.length ? `${anomalies.length} of your ${events.length} retained observations are flagged. I can help you understand what the model noticed.` : "Connect your backend or start a demonstration to explore how Sentinel works."}</p><button onClick={() => ask("Summarize my telemetry")} className="brief-button">Break it down for me <Sparkles size={15} /></button><div className="brief-foot"><ShieldCheck size={12} />Local intelligence. Human perspective.</div></Panel></div>
        <div className="overview-bottom"><Panel title="The shape of your telemetry" eyebrow="DETECTION ACTIVITY" action={<button className="subtle-button compact" aria-pressed={feed.paused} onClick={() => changePaused(!feed.paused)}>{feed.paused ? <Play size={12} /> : <Pause size={12} />}{feed.paused ? "Resume" : "Pause"}</button>}><FeedChart events={events} /><div className="panel-foot"><span>{events.length ? `${Math.min(events.length, 30)} most recent observations` : "No observations"}</span><span>{feed.paused ? "UPDATES PAUSED" : feed.stale ? "DATA IS STALE" : store.isMockMode ? "GENERATED DEMO" : "BACKEND SOURCE"}</span></div></Panel><Panel title="Recent observations" eyebrow="THE ACTIVITY FEED" action={<button className="icon-btn" aria-label="View all observations" onClick={() => navigate("incidents")}><ArrowUpRight size={16} /></button>}>{eventList(4)}<button className="panel-link" onClick={() => navigate("incidents")}>View all observations <ArrowRight size={13} /></button></Panel></div>
      </>}
      {section === "network" && <><Panel title="An ecosystem, explained." eyebrow="ARCHITECTURE OVERVIEW"><NetworkMap domain={store.activeDomain} onSelect={changeDomain} /></Panel><div className="section-heading"><div><h2>Choose a telemetry source</h2><p>Selection resets the observation window.</p></div><span className="eyebrow">13 DOMAINS</span></div><div className="domain-grid">{domains.map((domain, i) => <button key={domain} className={`domain-card ${domain === store.activeDomain ? "selected" : ""}`} aria-pressed={domain === store.activeDomain} onClick={() => changeDomain(domain)}><span className="domain-number">{String(i + 1).padStart(2, "0")}</span><span className="domain-icon">{i === 0 ? <Network size={21} /> : i < 8 ? <Radio size={21} /> : <Cpu size={21} />}</span><strong>{domainLabel(domain)}</strong><small>{i === 0 ? "Network telemetry" : i < 8 ? "IoT sensor telemetry" : "Host telemetry"}</small><span className="domain-status">{domain === store.activeDomain ? <><Check size={12} />Selected source</> : "Select source →"}</span></button>)}</div></>}
      {section === "incidents" && <><div className="filter-bar"><div className="segmented" aria-label="Filter observations">{[["all", "All observations"], ["anomaly", "Flagged"], ["normal", "Normal"]].map(([id, label]) => <button key={id} aria-pressed={filter === id} className={filter === id ? "selected" : ""} onClick={() => setFilter(id)}>{label}</button>)}</div><span>{filteredEvents.length} observations</span><button className="subtle-button" onClick={() => changePaused(!feed.paused)}>{feed.paused ? <Play size={13} /> : <Pause size={13} />}{feed.paused ? "Resume" : "Pause"}</button></div><Panel title="Observation timeline" eyebrow={store.isMockMode ? "GENERATED DEMO DATA" : "LOCAL BACKEND DATA"}>{eventList(50)}</Panel>{selected && <div id="selected-observation"><Panel title={`${selected.predictedClass} · ${selected.sourceIp}`} eyebrow="SELECTED OBSERVATION" action={<button className="icon-btn" onClick={() => setSelected(null)} aria-label="Close observation details"><X size={16} /></button>}><div className="detail-grid"><div><span>Anomaly score</span><strong>{(selected.anomalyProbability * 100).toFixed(1)}%</strong></div><div><span>Model confidence</span><strong>{(selected.confidence * 100).toFixed(1)}%</strong></div><div><span>Response record</span><strong>{selected.remediationStatus.replaceAll("_", " ")}</strong></div></div><p className="detail-copy">{selected.remediationAction}</p><p className="detail-copy">Observed {new Date(selected.timestamp).toLocaleString()} · {domainLabel(selected.domain)}</p><div className="feature-list">{selected.saliencyTopFeatures.map(f => <div key={f.featureName}><span>{f.featureName}</span><strong>{f.importanceScore.toFixed(1)}%</strong></div>)}</div><button className="subtle-button" onClick={() => ask(`Explain this observation: ${selected.predictedClass}, anomaly score ${(selected.anomalyProbability * 100).toFixed(1)}%, source ${selected.sourceIp}. Its top features are ${selected.saliencyTopFeatures.map(f => f.featureName).join(", ")}.`)}><Sparkles size={14} />Explain this observation</button></Panel></div>}</>}
      {section === "intelligence" && <><div className="intelligence-intro"><span className="intelligence-icon"><Sparkles size={30} /></span><div><span className="eyebrow">EXPLAINABLE BY DESIGN</span><h2>A prediction shouldn’t be a black box.</h2><p>These are the features that influenced the latest observation. Higher attribution means a stronger influence on this prediction, not proof of cause.</p></div></div><div className="two-column"><Panel title="What influenced the prediction" eyebrow="GRADIENT SALIENCY">{latest?.saliencyTopFeatures.length ? <div className="saliency-bars">{latest.saliencyTopFeatures.map((feature, i) => <div key={feature.featureName}><div><span><b>{String(i + 1).padStart(2, "0")}</b>{feature.featureName}</span><strong>{feature.importanceScore.toFixed(1)}%</strong></div><div className="bar-track"><i style={{ width: `${Math.max(0, Math.min(100, feature.importanceScore))}%` }} /></div></div>)}</div> : <div className="empty-state">Feature attribution will appear after an observation is received.</div>}<button className="panel-link" onClick={() => ask("Explain the latest alert in simple terms")}><Sparkles size={14} />Explain this in plain English <ArrowRight size={13} /></button></Panel><Panel title="The latest model reading" eyebrow="PREDICTION CONTEXT"><div className={`large-score ${latest?.isAnomaly ? "coral" : "mint"}`}>{latest ? (latest.anomalyProbability * 100).toFixed(1) : "—"}<small>{latest ? "%" : ""}</small></div><span className="eyebrow">ANOMALY SCORE</span><div className="reading-list"><div><span>Classification</span><strong>{latest?.predictedClass || "Awaiting data"}</strong></div><div><span>Confidence</span><strong>{latest ? `${(latest.confidence * 100).toFixed(1)}%` : "—"}</strong></div><div><span>Attribution latency</span><strong>{latest?.xaiLatencyMs ? `${latest.xaiLatencyMs.toFixed(2)} ms` : "Not reported"}</strong></div><div><span>Source</span><strong>{store.isMockMode ? "Generated demonstration" : "Local backend"}</strong></div></div></Panel></div><Panel title="From observation to understanding" eyebrow="HOW SENTINEL THINKS"><div className="pipeline">{[["01", "Observe", "A telemetry source supplies measurements."], ["02", "Connect", "Ten time steps form a sequence."], ["03", "Detect", "The Conformer estimates unusual activity."], ["04", "Explain", "Saliency highlights influential features."]].map(([n, title, text]) => <div key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></div>)}</div></Panel></>}
      {section === "response" && <><div className="principle-card"><ShieldCheck size={29} /><div><h2>Intelligence informs. People decide.</h2><p>These are response statuses reported by the {store.isMockMode ? "demo generator" : "backend"}. Verify actual enforcement before treating a threat as contained. Chat cannot execute firewall changes or shut down devices.</p></div><button className="subtle-button" onClick={() => ask("How does response and containment work?")}>Help me understand <ArrowUpRight size={14} /></button></div><Panel title="Reported response activity" eyebrow={store.isMockMode ? "SIMULATED CONTAINMENT" : "BACKEND RESPONSE RECORDS"}><div className="response-list">{events.filter(e => e.remediationStatus !== "NONE").map(e => <div key={e.id}><span className="event-symbol"><ShieldCheck size={17} /></span><div><strong>{e.predictedClass} · {e.sourceIp}</strong><p>{e.remediationAction}</p><small>{store.isMockMode ? "DEMO RECORD" : "REPORTED · VERIFY ENFORCEMENT"}</small></div><span className="status-pill">{e.remediationStatus === "ACTIVE_BLOCKED" ? "Containment reported" : e.remediationStatus.replaceAll("_", " ")}</span></div>)}{!events.some(e => e.remediationStatus !== "NONE") && <div className="empty-state">No response records in this window.</div>}</div></Panel><button className="subtle-button" onClick={() => { setLabTool("playbooks"); navigate("lab"); }}><Workflow size={15} />Open research playbook editor <ArrowUpRight size={14} /></button></>}
      {section === "compliance" && <><div className="principle-card"><Braces size={30} /><div><h2>A traceable record, one event at a time.</h2><p>Control mappings come from observation records. They are not a compliance certification or verification of a cryptographic chain.</p></div><button className="primary-button" onClick={exportSnapshot}><ArrowDownToLine size={14} />Export evidence</button></div><Panel title="Control mappings" eyebrow="OBSERVED EVIDENCE"><div className="evidence-list">{Array.from(new Set(events.map(e => e.compliance.nistControlId))).map(control => { const matched = events.filter(e => e.compliance.nistControlId === control); return <div key={control}><span className="evidence-icon"><CheckCheck size={18} /></span><div><strong>{control}</strong><p>{matched[0].compliance.nistControlName || "Description not provided"}</p></div><span>{matched.length} records</span></div>; })}{!events.length && <div className="empty-state">No control mappings available. Connect a source to begin.</div>}</div></Panel><div className="two-column"><Panel title="What your export includes" eyebrow="OBSERVATION SNAPSHOT"><ul className="plain-list"><li><Check size={14} />Retained observations, up to 50 events</li><li><Check size={14} />Data provenance and export timestamp</li><li><Check size={14} />Scores, feature attributions, response records</li><li><Check size={14} />Control mappings returned by the source</li></ul></Panel><Panel title="Need the research tools?" eyebrow="ADVANCED AUDIT WORKSPACE"><p className="detail-copy">Explore the original cryptographic verification console in the lab. Its outputs need independent validation.</p><button className="subtle-button" onClick={() => { setLabTool("audit"); navigate("lab"); }}>Open audit lab <ArrowUpRight size={14} /></button></Panel></div></>}
      {section === "settings" && <><Panel title="Your telemetry source" eyebrow="DATA & CONNECTION"><div className="source-options"><button className={store.isMockMode ? "selected" : ""} aria-pressed={store.isMockMode} onClick={() => changeSource(true)}><FlaskConical size={23} /><strong>Demo workspace</strong><p>Explore with generated observations. No devices are changed.</p><span>{store.isMockMode ? "Selected" : "Use demo"}<Check size={14} /></span></button><button className={!store.isMockMode ? "selected" : ""} aria-pressed={!store.isMockMode} onClick={() => changeSource(false)}><Radio size={23} /><strong>Local backend</strong><p>Connect to the existing FastAPI engine on this computer.</p><span>{!store.isMockMode ? sourceLabel : "Connect backend"}<ArrowRight size={14} /></span></button></div><p className="detail-copy">Start <code>START_SENTINEL_DASHBOARD.bat</code> in the project folder to run the local stack. The backend uses its configured dataset replay or host monitor.</p></Panel><Panel title="A private conversation" eyebrow="MEREOLEONA / LOCAL AI"><div className="reading-list"><div><span>Assistant engine</span><strong>{assistantStatus.mode === "ollama" ? assistantStatus.model : "Built-in project guide"}</strong></div><div><span>Cloud AI</span><strong>Disabled</strong></div><div><span>Conversation storage</span><strong>Current page memory only</strong></div><div><span>Voice input</span><strong>On-device recognition only</strong></div><div><span>Spoken replies</span><strong>Local English system voices only</strong></div></div><div className="setup-note"><h3>{assistantStatus.mode === "ollama" ? "Your local model is connected" : "Connect a local language model"}</h3><p>The Windows dashboard launcher starts private Ollama automatically when installed. Reopen the assistant to check its connection. The built-in guide remains available while the model is offline.</p><code>ollama pull qwen2.5:1.5b</code><p>To choose a particular installed model, set <code>SENTINEL_OLLAMA_MODEL</code> in <code>frontend/.env.local</code> and restart the frontend.</p></div><button className="subtle-button" onClick={() => ask("How do I set up the private assistant?")}><CircleHelp size={14} />Walk me through setup</button></Panel><Panel title="Workspace controls" eyebrow="YOUR EXPERIENCE"><div className="settings-actions"><button className="subtle-button" onClick={() => setWelcome(true)}>Replay welcome <Play size={13} /></button><button className="subtle-button" onClick={startTour}>Start guided tour <ArrowRight size={13} /></button><button className="subtle-button" onClick={() => { setConfirmDemo(true); }}>Simulate an anomaly <FlaskConical size={13} /></button></div></Panel></>}
      {section === "lab" && <><div className="connection-notice"><FlaskConical size={17} /><span>Original research tools. Some panels contain illustrative metrics and legacy simulations; verify all results independently.</span></div><div className="lab-tabs" aria-label="Research tools">{[["threat", "Threat lab"], ["xai", "XAI"], ["adversarial", "Robustness"], ["response", "Remediation"], ["compliance", "GRC"], ["priority", "Asset priority"], ["audit", "Audit console"], ["playbooks", "Playbooks"]].map(([id, label]) => <button key={id} onClick={() => setLabTool(id)} aria-pressed={labTool === id} className={labTool === id ? "selected" : ""}>{label}</button>)}</div><div className="legacy-workspace">{labTool === "threat" ? <ThreatLabConsole /> : labTool === "xai" ? <XaiConsole /> : labTool === "adversarial" ? <AdversarialConsole /> : labTool === "response" ? <RemediationConsole /> : labTool === "compliance" ? <ComplianceConsole /> : labTool === "priority" ? <PriorityConsole /> : labTool === "audit" ? <AuditConsole /> : <Playbooks />}</div></>}
      <footer className="workspace-footer"><span><Eye small />SENTINEL IOT <i>/</i> CLARITY AT THE EDGE.</span><span>{feed.paused ? "Updates paused" : feed.lastSeen ? `Last observation ${new Date(feed.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Awaiting observations"}<i className="status-dot" /></span></footer>
    </main></div>
    <div className="assistant-host" hidden={!assistantOpen}><SentinelAssistant open={assistantOpen} context={context} onAction={onAction} onClose={() => setAssistantOpen(false)} seed={seed} onStatus={statusCallback} /></div>
    {!assistantOpen && <button className="floating-assistant" onClick={() => setAssistantOpen(true)}><Sparkles size={18} />Ask Mereoleona</button>}
    <dialog aria-labelledby="welcome-title" className="welcome-dialog" ref={welcomeDialog} onCancel={() => dismissWelcome()}><div className="welcome-top"><span><Eye small />SENTINEL IOT / YOUR CONTROL ROOM</span><button className="icon-btn" onClick={dismissWelcome} aria-label="Skip welcome"><X size={20} /></button></div><div className="welcome-orb"><SentinelOrb /><span className="orb-coordinate left">LOCAL INTELLIGENCE<br />HUMAN PERSPECTIVE</span><span className="orb-coordinate right">MEREOLEONA<br />YOUR SENTINEL COMPANION</span></div><span className="eyebrow">COMPLEXITY, MEET CLARITY.</span><h2 id="welcome-title">A watchful system.<br />A familiar voice<span>.</span></h2><p>I’m Mereoleona, your guide to Sentinel.<br />Let’s make sense of your connected world, together.</p><div className="welcome-actions"><button className="primary-button" onClick={startTour}>Show me around <ArrowRight size={16} /></button><button className="subtle-button" onClick={() => { dismissWelcome(); setAssistantOpen(true); ask("Hello, what can you help me do?"); }}>Let’s talk <AudioLines size={16} /></button></div><button className="welcome-skip" onClick={dismissWelcome}>I know my way around <ArrowUpRight size={12} /></button><div className="welcome-bottom"><span><ShieldCheck size={12} />LOCAL & PRIVATE BY DESIGN</span><span>START WITH A DEMO. CONNECT WHEN YOU’RE READY.</span></div></dialog>
    <dialog aria-labelledby="demo-title" className="confirm-dialog" ref={confirmation} onCancel={() => setConfirmDemo(false)}><span className="eyebrow">SAFE DEMONSTRATION</span><h2 id="demo-title">See a detection in action.</h2><p>This adds a generated threat observation to the demo. If you are connected to the backend, it will switch to demo first. No real traffic or devices will be affected.</p><div className="settings-actions"><button className="subtle-button" onClick={() => setConfirmDemo(false)}>Cancel</button><button className="primary-button" onClick={() => { const add = () => { if (!useTelemetryStore.getState().isMockMode) { setToast("Demonstration canceled because the telemetry source changed."); return; } const event = mockTelemetry.triggerAdversarialEvent(0.05, "PGD_20"); store.addEvent(event); inspect(event); clearHistory(); setToast("Simulated anomaly added. No device or network was changed."); }; clearHistory(); if (!store.isMockMode) { applyPatch({ demo: true, paused: false }); setTimeout(add, 300); } else add(); setConfirmDemo(false); }}>Run demonstration <ArrowRight size={14} /></button></div></dialog>
    {toast && <div className="workspace-toast" role="status"><Check size={16} />{toast}</div>}
    {store.isPacketSnifferOpen && <PacketDrawer isOpen onClose={store.closePacketSniffer} />}
    {store.isAgenticSocOpen && <AnalystModal isOpen onClose={store.closeAgenticSoc} incident={store.agenticIncident || latest} />}
    {store.isAuditReportModalOpen && <AuditReport />}
    {store.isSoarBuilderOpen && <Playbooks isModal onClose={store.closeSoarBuilder} />}
  </div>;
}

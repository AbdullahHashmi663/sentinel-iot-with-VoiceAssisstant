// ==============================================================================
// SENTINEL-IOT: PERSISTENT HEADER & MULTI-CONSOLE NAVIGATION (SECTION 5.1 & T-02)
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Activity,
  Clock,
  Radio,
  Sliders,
  FileSpreadsheet,
  AlertOctagon,
  Eye,
  CheckCircle2,
  XCircle,
  Cpu,
  Zap,
  Flame,
  ShieldCheck,
  FileCheck,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";

interface HeaderProps {
  theme: string;
  setTheme: (t: string) => void;
  onOpenResearch: () => void;
}

export const THEMES = [
  { id: "cyberpunk", name: "Cyberpunk 2077", icon: "🌌", color: "#00f3ff" },
  { id: "matrix", name: "Matrix Terminal", icon: "📟", color: "#00ff66" },
  { id: "stealth", name: "Midnight Stealth", icon: "🛡️", color: "#2d79ff" },
  { id: "solar", name: "Solar Flare SCADA", icon: "🌋", color: "#ff7700" },
  { id: "crimson", name: "Crimson Protocol", icon: "🚨", color: "#ff1744" },
  { id: "synthwave", name: "Synthwave Horizon", icon: "🌆", color: "#e024c3" },
  { id: "arctic", name: "Arctic Frost Light", icon: "❄️", color: "#0d6efd" },
  { id: "cosmos", name: "Deep Cosmos", icon: "🔮", color: "#a855f7" },
];

export default function Header({
  theme,
  setTheme,
  onOpenResearch
}: HeaderProps) {
  const {
    activeConsole,
    setActiveConsole,
    isConnected,
    isMockMode,
    setIsMockMode,
    isLockdownActive,
    toggleEmergencyLockdown,
    mttrCurrentMs,
    events
  } = useTelemetryStore();

  const [currentTime, setCurrentTime] = useState<string>("");
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(" ")[0]);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    const uptimeTimer = setInterval(() => setUptimeSeconds((prev) => prev + 1), 1000);
    return () => {
      clearInterval(timer);
      clearInterval(uptimeTimer);
    };
  }, []);

  const formatUptime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <header className="cyber-card w-full border-b border-[var(--border-color)] px-4 py-2.5 sticky top-0 z-40 space-y-2.5">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* BRAND & LOGO */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-[var(--border-color)] shadow-[var(--border-glow)] flex items-center justify-center bg-black/40">
              <img
                src="/sentinel_shield_logo.jpg"
                alt="Sentinel Shield"
                className="w-full h-full object-cover transition-transform duration-300"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[var(--bg-primary)] bg-[var(--alert-nominal)] radar-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Orbitron'] font-black tracking-wider text-xl text-[var(--accent-primary)] drop-shadow-[0_0_12px_var(--accent-glow)]">
                SENTINEL-IOT
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--border-color)]">
                FYP-II v2.4
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] font-['Rajdhani'] font-semibold tracking-wide hidden sm:block">
              Autonomous Explainable XDR & NIST/ISO Cryptographic Compliance SOC
            </p>
          </div>
        </div>

        {/* PERSISTENT STATUS INDICATORS */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {/* LIVE MTTR COUNTER (TABLE 10.1 T-02 & FIG 5.1) */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--alert-nominal)]/15 border border-[var(--alert-nominal)] text-xs font-['JetBrains_Mono']">
            <Zap className="w-3.5 h-3.5 text-[var(--alert-nominal)] fill-[var(--alert-nominal)]" />
            <span className="text-[var(--text-muted)] text-[10px]">MTTR:</span>
            <span className="text-[var(--alert-nominal)] font-bold">{mttrCurrentMs.toFixed(1)} ms</span>
            <span className="text-[9px] text-[var(--text-muted)] hidden md:inline">AVG TIME TO RESPOND</span>
          </div>

          {/* WS STATUS & MOCK TOGGLE */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-['JetBrains_Mono']">
            <div className={`w-2 h-2 rounded-full ${isConnected || isMockMode ? "bg-[var(--alert-nominal)] shadow-[0_0_8px_var(--alert-nominal)]" : "bg-[var(--alert-critical)]"}`} />
            <button
              onClick={() => setIsMockMode(!isMockMode)}
              className="flex items-center gap-1 text-[11px] hover:text-[var(--brand-cyan)] transition-colors"
              title="Click to toggle between Live WebSocket & Offline Synthetic Mock mode"
            >
              <span className="text-[var(--text-muted)] font-medium">MODE:</span>
              <span className={isMockMode ? "text-[var(--brand-cyan)] font-bold" : isConnected ? "text-[var(--alert-nominal)] font-bold" : "text-[var(--alert-critical)] font-bold"}>
                {isMockMode ? "OFFLINE MOCK" : isConnected ? "LIVE WS" : "RECONNECTING"}
              </span>
            </button>
          </div>

          {/* CLOCK & INGESTION STATS */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-['JetBrains_Mono'] px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[var(--accent-primary)]" />
              <span className="text-[var(--text-primary)] font-bold">{currentTime || "00:00:00"}</span>
              <span className="text-[var(--text-muted)] text-[9px]">UTC</span>
            </div>
            <div className="text-[var(--text-muted)] text-[11px] border-l border-[var(--border-color)] pl-2">
              EVENTS: <span className="text-[var(--brand-cyan)] font-bold">{events.length}</span>
            </div>
          </div>

          {/* THEME PICKER */}
          <select
            value={theme}
            aria-label="Theme Selection"
            onChange={(e) => {
              const newT = e.target.value;
              setTheme(newT);
              document.documentElement.setAttribute("data-theme", newT);
            }}
            className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-['Space_Grotesk'] text-[var(--text-primary)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none transition-colors"
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#0f1226] text-white">
                {t.icon} {t.name}
              </option>
            ))}
          </select>

          {/* RESEARCH GALLERY */}
          <button
            onClick={onOpenResearch}
            aria-label="Open Research Gallery"
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--accent-primary)]/15 text-[var(--text-primary)] hover:text-[var(--accent-primary)] text-xs font-['Rajdhani'] font-bold uppercase transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none"
            title="View Research Figures, Confusion Matrices & Statistical Tests"
          >
            <Eye className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span className="hidden sm:inline">Research</span>
          </button>

          {/* EMERGENCY LOCKDOWN BUTTON */}
          <button
            onClick={toggleEmergencyLockdown}
            aria-label={isLockdownActive ? "Cancel Emergency Fleet Lockdown" : "Initiate Emergency Fleet Lockdown"}
            className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-['Orbitron'] font-bold uppercase tracking-wider transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-[var(--alert-critical)] focus-visible:outline-none ${
              isLockdownActive
                ? "bg-[var(--alert-critical)] text-white animate-pulse shadow-[0_0_18px_var(--alert-critical)]"
                : "border border-[var(--alert-critical)] bg-[var(--alert-critical)]/15 text-[var(--alert-critical)] hover:bg-[var(--alert-critical)] hover:text-white"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{isLockdownActive ? "LOCKDOWN ACTIVE" : "LOCKDOWN"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

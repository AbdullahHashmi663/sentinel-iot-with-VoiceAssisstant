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
    <header className="relative w-full border-b border-[var(--border-color)] border-t border-t-white/15 px-4 sm:px-6 py-3 sticky top-0 z-40 bg-[var(--bg-canvas)]/80 backdrop-blur-2xl shadow-[0_16px_40px_-10px_rgba(0,0,0,0.85)]">
      {/* Specular Top Light Accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* BRAND & LOGO */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/25 shadow-[0_0_20px_var(--accent-glow)] flex items-center justify-center bg-black/60 backdrop-blur-md p-0.5 transition-all duration-300 group-hover:scale-105 group-hover:border-[var(--accent-primary)]">
              <img
                src="/sentinel_shield_logo.jpg"
                alt="Sentinel Shield"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-primary)] bg-[var(--alert-nominal)] shadow-[0_0_10px_#10b981] radar-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-['Orbitron'] font-black tracking-widest text-xl text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--accent-primary)] to-[var(--brand-cyan)] drop-shadow-[0_0_14px_var(--accent-glow)]">
                SENTINEL-IOT
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-['JetBrains_Mono'] font-bold uppercase bg-white/5 border border-white/20 text-[var(--accent-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                FYP-II v2.4
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] font-['Space_Grotesk'] font-medium tracking-wide hidden sm:block">
              Autonomous Explainable XDR & NIST/ISO Cryptographic Compliance SOC
            </p>
          </div>
        </div>

        {/* PERSISTENT STATUS INDICATORS */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {/* LIVE MTTR COUNTER */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] text-xs font-['JetBrains_Mono']">
            <Zap className="w-3.5 h-3.5 text-[var(--alert-nominal)] fill-[var(--alert-nominal)]" />
            <span className="text-[var(--text-muted)] text-[10px] font-semibold">MTTR:</span>
            <span className="text-[var(--alert-nominal)] font-black">{mttrCurrentMs.toFixed(1)} ms</span>
            <span className="text-[9px] text-[var(--text-muted)] hidden md:inline">AVG RESP</span>
          </div>

          {/* WS STATUS & MOCK TOGGLE */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] text-xs font-['JetBrains_Mono']">
            <div className={`w-2 h-2 rounded-full ${isConnected || isMockMode ? "bg-[var(--alert-nominal)] shadow-[0_0_10px_var(--alert-nominal)]" : "bg-[var(--alert-critical)] shadow-[0_0_10px_var(--alert-critical)]"}`} />
            <button
              onClick={() => setIsMockMode(!isMockMode)}
              className="flex items-center gap-1.5 text-[11px] hover:text-[var(--brand-cyan)] transition-colors"
              title="Click to toggle between Live WebSocket & Offline Synthetic Mock mode"
            >
              <span className="text-[var(--text-muted)] font-medium">MODE:</span>
              <span className={isMockMode ? "text-[var(--brand-cyan)] font-bold" : isConnected ? "text-[var(--alert-nominal)] font-bold" : "text-[var(--alert-critical)] font-bold"}>
                {isMockMode ? "OFFLINE MOCK" : isConnected ? "LIVE WS" : "RECONNECTING"}
              </span>
            </button>
          </div>

          {/* CLOCK & INGESTION STATS */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-['JetBrains_Mono'] px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span className="text-[var(--text-primary)] font-bold">{currentTime || "00:00:00"}</span>
              <span className="text-[var(--text-muted)] text-[9px]">UTC</span>
            </div>
            <div className="text-[var(--text-muted)] text-[11px] border-l border-white/10 pl-2.5">
              EVENTS: <span className="text-[var(--brand-cyan)] font-black">{events.length}</span>
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
            className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs font-['Space_Grotesk'] text-[var(--text-primary)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-white/30"
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#0b0f19] text-white">
                {t.icon} {t.name}
              </option>
            ))}
          </select>

          {/* RESEARCH GALLERY */}
          <button
            onClick={onOpenResearch}
            aria-label="Open Research Gallery"
            className="cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-[var(--accent-primary)]/15 hover:border-[var(--accent-primary)]/50 text-[var(--text-primary)] hover:text-[var(--accent-primary)] text-xs font-['Orbitron'] font-bold uppercase transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-95"
            title="View Research Figures, Confusion Matrices & Statistical Tests"
          >
            <Eye className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span className="hidden sm:inline">Research</span>
          </button>

          {/* EMERGENCY LOCKDOWN BUTTON */}
          <button
            onClick={toggleEmergencyLockdown}
            aria-label={isLockdownActive ? "Cancel Emergency Fleet Lockdown" : "Initiate Emergency Fleet Lockdown"}
            className={`cursor-pointer flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-['Orbitron'] font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
              isLockdownActive
                ? "bg-[var(--alert-critical)] text-white animate-pulse shadow-[0_0_25px_var(--alert-critical)] border border-red-300"
                : "border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]"
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

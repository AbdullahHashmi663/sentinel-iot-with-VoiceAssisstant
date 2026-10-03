// ==============================================================================
// SENTINEL-IOT: TACTICAL HUD PERSISTENT HEADER (STITCH FUTURISTIC EDITION)
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldAlert,
  Clock,
  Radio,
  Eye,
  Zap,
  Play,
  Pause,
  SkipForward,
  Lock,
  Layers,
  User,
  Activity,
  Mic,
  AlertOctagon
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import { DomainType } from "@/types/sentinel";

interface HeaderProps {
  theme?: string;
  setTheme?: (t: string) => void;
  onOpenResearch: () => void;
}

export const THEMES = [
  { id: "cyberpunk", name: "Obsidian Cyber HUD", icon: "🌌" },
  { id: "alabaster", name: "Alabaster Platinum Light", icon: "☀️" },
  { id: "matrix", name: "Matrix Terminal", icon: "📟" },
  { id: "stealth", name: "Midnight Stealth", icon: "🛡️" },
  { id: "solar", name: "Solar Flare SCADA", icon: "🌋" },
  { id: "crimson", name: "Crimson Biohazard", icon: "🚨" },
  { id: "synthwave", name: "Synthwave Horizon", icon: "🌆" },
  { id: "arctic", name: "Arctic Frost Light", icon: "❄️" },
  { id: "cosmos", name: "Deep Cosmos", icon: "🔮" },
];

const DOMAINS_LIST: { id: DomainType; label: string }[] = [
  { id: "IoT_Modbus", label: "Modbus Industrial PLC (ToN_IoT #04) // CRITICAL SUBSTATION" },
  { id: "Network_Traffic", label: "Network Core Telemetry (ToN_IoT #01)" },
  { id: "IoT_Thermostat", label: "SCADA Thermostat Rig (ToN_IoT #07)" },
  { id: "IoT_Fridge", label: "Smart Fridge Environment (ToN_IoT #03)" },
  { id: "IoT_GPS_Tracker", label: "Industrial GPS Fleet Tracker (ToN_IoT #05)" },
  { id: "IoT_Garage_Door", label: "Automated Facility Access (ToN_IoT #06)" },
  { id: "IoT_Motion_Light", label: "ICS Robotic Actuator / Light (ToN_IoT #09)" },
  { id: "IoT_Weather", label: "Weather Sensing Array Rig (ToN_IoT #12)" },
  { id: "Linux_process", label: "Linux Kernel Process Scheduling (Auditd)" },
  { id: "Linux_disk", label: "Linux Storage Block & Disk I/O" },
  { id: "Linux_memory", label: "Linux Virtual Memory Management" },
  { id: "Windows_10", label: "Windows 10 Workstation Telemetry" },
  { id: "Windows_7", label: "Legacy Windows 7 SCADA HMI" }
];

export default function Header({
  theme = "cyberpunk",
  setTheme,
  onOpenResearch
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    activeConsole,
    setActiveConsole,
    activeDomain,
    setActiveDomain,
    isConnected,
    isMockMode,
    setIsMockMode,
    isLockdownActive,
    toggleEmergencyLockdown,
    mttrCurrentMs,
    events
  } = useTelemetryStore();

  const [utcTime, setUtcTime] = useState<string>("14:22:09.412");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);

  const isLightMode = theme === "alabaster" || theme === "arctic" || theme === "light";

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hrs = String(now.getUTCHours()).padStart(2, "0");
      const mins = String(now.getUTCMinutes()).padStart(2, "0");
      const secs = String(now.getUTCSeconds()).padStart(2, "0");
      const ms = String(now.getUTCMilliseconds()).padStart(3, "0");
      setUtcTime(`${hrs}:${mins}:${secs}.${ms}`);
    }, 85);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-xl transition-colors duration-200 ${
        isLightMode
          ? "bg-[#fafaff]/95 border-b border-[#daddd8] shadow-[0_4px_20px_rgba(28,28,28,0.06)]"
          : "bg-[#03070c]/95 border-b border-[#162536] shadow-[0_4px_30px_rgba(0,0,0,0.85)]"
      }`}
    >
      {/* Top Cyber Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff]/60 to-transparent pointer-events-none" />

      {/* Row 1: Master Status & SOC Telemetry Bar */}
      <div
        className={`min-h-[56px] h-14 px-3 sm:px-6 flex items-center justify-between border-b relative gap-3 flex-nowrap ${
          isLightMode ? "border-[#daddd8]" : "border-[#162536]/80"
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Brand Logo / Insignia */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center relative shadow-[0_0_12px_rgba(0,240,255,0.35)] shrink-0">
              <span className="material-symbols-outlined text-[#00f0ff] text-[19px] animate-pulse">security</span>
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#00f0ff] rounded-full shadow-[0_0_6px_#00f0ff]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`font-['Orbitron'] font-bold text-[15px] tracking-wider leading-none font-mono ${
                    isLightMode ? "text-[#0284c7]" : "text-[#00f0ff] text-glow-cyan"
                  }`}
                >
                  SENTINEL-IoT
                </span>
                <span
                  className={`text-[9px] font-mono tracking-widest px-1 py-0.2 border rounded ${
                    isLightMode
                      ? "border-[#daddd8] bg-[#eef0f2] text-[#525252]"
                      : "border-[#162536] bg-[#070d14] text-[#64748b]"
                  }`}
                >
                  HEX://0x7FA2
                </span>
              </div>
              <span className="font-mono text-[9px] text-[#00ff66] tracking-widest text-glow-emerald mt-0.5 uppercase">
                TACTICAL SOC // ICS DEFENSE MATRIX
              </span>
            </div>
          </div>

          {/* Operational Status Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-[#00ff66]/30 bg-[#00ff66]/10 shadow-[0_0_10px_rgba(0,255,102,0.15)] shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff66]" />
            </span>
            <span className="font-mono text-[10px] text-[#00ff66] font-bold tracking-wider">
              FYP-II v2.4 OPERATIONAL
            </span>
          </div>

          {/* LIVE MTTR COUNTER (PREVIOUS TOGGLE STYLING) */}
          <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] text-xs font-mono shrink-0">
            <Zap className="w-3.5 h-3.5 text-[#00ff66] fill-[#00ff66]" />
            <span className="text-[#64748b] text-[10px] font-semibold">MTTR:</span>
            <span className="text-[#00ff66] font-black">{mttrCurrentMs.toFixed(1)} ms</span>
            <span className="text-[9px] text-[#64748b] hidden md:inline">AVG RESP</span>
          </div>
        </div>

        {/* Right HUD Controls (PREVIOUS TOGGLE STYLING) - NEVER WRAPS */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap shrink-0">
          {/* WS STATUS & MOCK TOGGLE (PREVIOUS TOGGLE STYLING) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] text-xs font-mono shrink-0">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected || isMockMode
                  ? "bg-[#00ff66] shadow-[0_0_10px_#00ff66]"
                  : "bg-[#ff2a5f] shadow-[0_0_10px_#ff2a5f]"
              }`}
            />
            <button
              type="button"
              onClick={() => setIsMockMode(!isMockMode)}
              className="flex items-center gap-1.5 text-[11px] hover:text-[#00f0ff] transition-colors cursor-pointer"
              title="Click to toggle between Live WebSocket & Offline Synthetic Mock mode"
            >
              <span className="text-[#64748b] font-medium">MODE:</span>
              <span
                className={
                  isMockMode
                    ? "text-[#00f0ff] font-bold"
                    : isConnected
                    ? "text-[#00ff66] font-bold"
                    : "text-[#ff2a5f] font-bold"
                }
              >
                {isMockMode ? "OFFLINE MOCK" : isConnected ? "LIVE WS" : "RECONNECTING"}
              </span>
            </button>
          </div>

          {/* Tactical UTC & Throughput Counter (Full on xl+, Compact on md) */}
          <div className="hidden xl:flex items-center gap-3 text-xs font-mono px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] shrink-0">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span className="text-white font-bold">{utcTime || "00:00:00"}</span>
              <span className="text-[#64748b] text-[9px]">UTC</span>
            </div>
            <div className="text-[#64748b] text-[11px] border-l border-white/10 pl-2.5">
              EVENTS: <span className="text-[#00f0ff] font-black">{events.length}</span>
            </div>
          </div>
          <div className="hidden md:flex xl:hidden items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 shrink-0">
            <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="text-white font-bold">{utcTime}</span>
          </div>

          {/* RESEARCH GALLERY (PREVIOUS TOGGLE STYLING) */}
          <button
            type="button"
            onClick={onOpenResearch}
            aria-label="Open Research Gallery"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-[#00f0ff]/15 hover:border-[#00f0ff]/50 text-[#dee3eb] hover:text-[#00f0ff] text-xs font-['Orbitron'] font-bold uppercase transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-95 shrink-0"
            title="View Research Figures, Confusion Matrices & Statistical Tests"
          >
            <Eye className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Research</span>
          </button>

          {/* EMERGENCY LOCKDOWN BUTTON (PREVIOUS TOGGLE STYLING) */}
          <button
            type="button"
            onClick={toggleEmergencyLockdown}
            aria-label={isLockdownActive ? "Cancel Emergency Fleet Lockdown" : "Initiate Emergency Fleet Lockdown"}
            className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-['Orbitron'] font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 shrink-0 ${
              isLockdownActive
                ? "bg-[#ff2a5f] text-white animate-pulse shadow-[0_0_25px_#ff2a5f] border border-red-300"
                : "border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{isLockdownActive ? "LOCKDOWN ACTIVE" : "LOCKDOWN"}</span>
          </button>

          {/* Operator Profile Avatar */}
          <div className="w-8 h-8 rounded-xl border border-[#00f0ff]/40 bg-[#00f0ff]/10 flex items-center justify-center text-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.25)] shrink-0">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Row 2: Tactical Telemetry & Domain Context Sub-Ribbon */}
      <div
        className={`h-9 px-3 sm:px-6 flex items-center justify-between border-b font-mono text-[11px] transition-colors ${
          isLightMode
            ? "bg-[#eef0f2] border-[#daddd8] text-[#1c1c1c]"
            : "bg-[#04080c]/95 border-[#162536] text-[#dee3eb]"
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold tracking-wider uppercase text-[10px] ${
                isLightMode ? "text-[#0284c7]" : "text-[#00f0ff]"
              }`}
            >
              DOMAIN:
            </span>
            <select
              value={activeDomain}
              aria-label="Active Telemetry Domain Selection"
              onChange={(e) => setActiveDomain(e.target.value as DomainType)}
              className={`border text-[11px] font-mono px-2 py-0.5 rounded focus:outline-none max-w-[220px] sm:max-w-md truncate transition-colors ${
                isLightMode
                  ? "bg-[#fafaff] border-[#daddd8] text-[#1c1c1c] focus:border-[#0284c7]"
                  : "bg-[#0b131e] border-[#162536] text-[#00f0ff] focus:border-[#00f0ff]"
              }`}
            >
              {DOMAINS_LIST.map((d) => (
                <option
                  key={d.id}
                  value={d.id}
                  className={isLightMode ? "bg-[#fafaff] text-[#1c1c1c]" : "bg-[#070d14] text-white"}
                >
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className={`p-1 rounded border transition-colors cursor-pointer ${
                isPlaying
                  ? isLightMode
                    ? "bg-[#0284c7]/20 text-[#0284c7] border-[#0284c7]/50"
                    : "bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/50"
                  : isLightMode
                  ? "bg-[#fafaff] text-[#525252] border-[#daddd8] hover:text-[#1c1c1c]"
                  : "bg-[#0b131e] text-[#64748b] border-[#162536] hover:text-white"
              }`}
              title="Play Stream"
            >
              <Play className="w-3 h-3 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className={`p-1 rounded border transition-colors cursor-pointer ${
                !isPlaying
                  ? isLightMode
                    ? "bg-[#0284c7]/20 text-[#0284c7] border-[#0284c7]/50"
                    : "bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/50"
                  : isLightMode
                  ? "bg-[#fafaff] text-[#525252] border-[#daddd8] hover:text-[#1c1c1c]"
                  : "bg-[#0b131e] text-[#64748b] border-[#162536] hover:text-white"
              }`}
              title="Pause Stream"
            >
              <Pause className="w-3 h-3 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSimSpeed((prev) => (prev >= 5 ? 0.5 : prev * 2));
              }}
              className={`px-1.5 py-0.5 border text-[10px] font-bold rounded cursor-pointer transition-colors ${
                isLightMode
                  ? "bg-[#fafaff] border-[#daddd8] text-[#059669] hover:border-[#059669]/50"
                  : "bg-[#0b131e] border-[#162536] text-[#00ff66] hover:border-[#00ff66]/50"
              }`}
              title="Cycle Speed"
            >
              {simSpeed}x LIVE
            </button>
          </div>
        </div>

        {/* Right Indicators */}
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className={isLightMode ? "text-[#525252]" : "text-[#64748b]"}>TENSOR:</span>
            <span
              className={`font-bold border px-1.5 py-0.2 rounded ${
                isLightMode
                  ? "bg-[#fafaff] border-[#daddd8] text-[#0284c7]"
                  : "text-[#00f0ff] bg-[#0b131e] border-[#162536]"
              }`}
            >
              [B, 10, D] READY
            </span>
          </div>

          <div
            className={`hidden md:flex items-center gap-1.5 font-bold ${
              isLightMode ? "text-[#059669]" : "text-[#00ff66]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLightMode
                  ? "bg-[#059669] shadow-[0_0_6px_#059669]"
                  : "bg-[#00ff66] shadow-[0_0_6px_#00ff66]"
              }`}
            />
            <span>SHM: SYNCHRONIZED</span>
          </div>
        </div>
      </div>
    </header>
  );
}

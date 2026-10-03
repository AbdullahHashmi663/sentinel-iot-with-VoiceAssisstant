// ==============================================================================
// SENTINEL-IOT: LEFT TACTICAL NAVIGATION RAIL (EXTRA OPTIONS & ADVANCED TOOLS)
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Cpu,
  Mic,
  Terminal,
  FileCheck,
  Radio,
  BrainCircuit,
  Sliders,
  Eye,
  Lock,
  Database,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";

interface LeftSidebarNavProps {
  onOpenResearch?: () => void;
}

export default function LeftSidebarNav({ onOpenResearch }: LeftSidebarNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const {
    activeConsole,
    setActiveConsole,
    latestEvent,
    isLockdownActive,
    toggleEmergencyLockdown,
    isMockMode,
    setIsMockMode,
    isPacketSnifferOpen,
    openPacketSniffer,
    isAgenticSocOpen,
    openAgenticSoc,
    isSoarBuilderOpen,
    openSoarBuilder,
    isAuditReportModalOpen,
    openAuditReportModal,
    theme,
    toggleTheme,
  } = useTelemetryStore();

  const isLightMode = theme === "alabaster" || theme === "arctic" || theme === "light";

  const handleRoute = (path: string, consoleId?: any) => {
    if (consoleId) {
      setActiveConsole(consoleId);
    }
    if (pathname !== path) {
      router.push(path);
    }
  };

  const navItems = [
    {
      id: "priority",
      label: "ASSET PRIORITY MATRIX",
      sublabel: "2D Criticality-Risk Matrix & Sensible Shutdown",
      icon: <Sliders className="w-4 h-4" />,
      color: "#00f0ff",
      isActive: pathname === "/priority" || activeConsole === "priority",
      badge: "TRIAGE",
      onClick: () => handleRoute("/priority", "priority"),
    },
    {
      id: "execute",
      label: "PCB SILICON CANVAS",
      sublabel: "Hardware IC Flow & Conformer Pipeline",
      icon: <Cpu className="w-4 h-4" />,
      color: "#00ff66",
      isActive: pathname === "/execute" || activeConsole === "execute",
      badge: "CANVAS",
      onClick: () => handleRoute("/execute", "execute"),
    },
    {
      id: "voice",
      label: "VOICE ASSISTANT HUD",
      sublabel: "Mereoleona 3D Holographic Acoustic Sphere",
      icon: <Mic className="w-4 h-4" />,
      color: "#00f0ff",
      isActive: pathname === "/voice" || activeConsole === "voice",
      badge: "AI 3D",
      onClick: () => handleRoute("/voice", "voice"),
    },
    {
      id: "audit",
      label: "AUDIT BUNDLE CLI",
      sublabel: "Cryptographic Merkle Ledger & NIST SP 800-53 TTY",
      icon: <Terminal className="w-4 h-4" />,
      color: "#00ff66",
      isActive: pathname === "/audit" || activeConsole === "audit",
      badge: "CLI",
      onClick: () => handleRoute("/audit", "audit"),
    },
    {
      id: "audit_report",
      label: "OFFICIAL AUDIT REPORT",
      sublabel: "NIST / ISO Cryptographic SHA-256 Certificate",
      icon: <FileCheck className="w-4 h-4" />,
      color: "#a855f7",
      isActive: isAuditReportModalOpen,
      badge: "PDF/SHA",
      onClick: () => openAuditReportModal(),
    },
    {
      id: "sniffer",
      label: "PACKET SNIFFER",
      sublabel: "Wireshark-Grade Layer 2-7 Protocol Dissector",
      icon: <Radio className="w-4 h-4" />,
      color: "#00f0ff",
      isActive: isPacketSnifferOpen,
      badge: "L2-L7",
      onClick: () => openPacketSniffer(),
    },
    {
      id: "agentic_soc",
      label: "AGENTIC SOC ANALYST",
      sublabel: "Autonomous Tier-2/3 AI Incident Response",
      icon: <BrainCircuit className="w-4 h-4" />,
      color: "#38bdf8",
      isActive: isAgenticSocOpen,
      badge: "AI SOC",
      onClick: () => openAgenticSoc(latestEvent),
    },
    {
      id: "soar_builder",
      label: "SOAR PLAYBOOK STUDIO",
      sublabel: "Automated Orchestration & Mitigation Canvas",
      icon: <Sliders className="w-4 h-4" />,
      color: "#fcee0a",
      isActive: isSoarBuilderOpen,
      badge: "SOAR",
      onClick: () => openSoarBuilder(),
    },
    {
      id: "research",
      label: "EMPIRICAL RESEARCH",
      sublabel: "11 Statistical Proof Figures & Confusion Matrices",
      icon: <Eye className="w-4 h-4" />,
      color: "#c084fc",
      isActive: false,
      badge: "11 FIGS",
      onClick: () => onOpenResearch?.(),
    },
    {
      id: "lockdown",
      label: "AIR-GAP LOCKDOWN",
      sublabel: "Hardware Zero-Trust Quarantine Interlock",
      icon: <Lock className="w-4 h-4" />,
      color: "#ff2a5f",
      isActive: isLockdownActive,
      badge: isLockdownActive ? "ARMED" : "TRIP",
      onClick: () => toggleEmergencyLockdown(),
    },
    {
      id: "mode_toggle",
      label: "INGESTION STREAM MODE",
      sublabel: isMockMode ? "Switch to Live FastAPI WebSocket" : "Switch to Synthetic Multi-Device Mock",
      icon: <Database className="w-4 h-4" />,
      color: isMockMode ? "#00f0ff" : "#00ff66",
      isActive: true,
      badge: isMockMode ? "MOCK" : "LIVE WS",
      onClick: () => setIsMockMode(!isMockMode),
    },
    {
      id: "theme_toggle",
      label: isLightMode ? "SWITCH TO DARK THEME" : "ALABASTER LIGHT THEME",
      sublabel: isLightMode
        ? "Return to Obsidian Cyberpunk HUD (Dark Mode)"
        : "Switch to Alabaster Platinum Enterprise Light Theme (Carbon Black, Alabaster Grey, Soft Linen, Platinum, Ghost White)",
      icon: isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
      color: isLightMode ? "#00f0ff" : "#f59e0b",
      isActive: isLightMode,
      badge: isLightMode ? "LIGHT" : "DARK",
      onClick: () => toggleTheme(),
    },
  ];

  return (
    <aside
      aria-label="Left Tactical Navigation Rail"
      className="fixed left-2 sm:left-3 top-1/2 -translate-y-1/2 z-[70] select-none pointer-events-auto transition-all duration-300"
    >
      {/* Collapsed Pill Trigger */}
      {isCollapsed ? (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className={`flex flex-col items-center gap-2 py-3 px-1.5 rounded-r-xl backdrop-blur-xl border border-l-0 shadow-[0_8px_30px_rgba(0,0,0,0.85)] transition-all cursor-pointer group ${
            isLightMode
              ? "bg-[#eef0f2]/95 border-[#daddd8] text-[#1c1c1c] hover:border-[#0284c7]"
              : "bg-[#03070c]/90 border-[#162536] text-[#00f0ff] hover:border-[#00f0ff]/50"
          }`}
          title="Expand Tactical Rail (Extra Options)"
        >
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          <span className="font-['Orbitron'] text-[9px] font-bold tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 opacity-70 group-hover:opacity-100">
            EXTRA TOOLS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
        </button>
      ) : (
        /* Expanded Tactical Rail */
        <div
          className={`relative flex flex-col items-center py-2 px-1.5 rounded-2xl backdrop-blur-2xl border transition-colors gap-1.5 ${
            isLightMode
              ? "bg-[#eef0f2]/95 border-[#daddd8] shadow-[0_12px_40px_rgba(28,28,28,0.12)] text-[#1c1c1c]"
              : "bg-[#03070c]/90 border-[#162536] shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-[#dee3eb]"
          }`}
        >
          {/* Subtle Top Specular Accent */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00f0ff]/60 to-transparent pointer-events-none rounded-t-2xl" />

          {/* Header & Collapse Toggle */}
          <div
            className={`w-full flex items-center justify-between px-1.5 pb-1 mb-0.5 border-b ${
              isLightMode ? "border-[#daddd8] text-[#525252]" : "border-[#162536]/80 text-[#64748b]"
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] shadow-[0_0_6px_#00ff66]" />
              <span className="font-['Orbitron'] text-[8px] font-bold tracking-wider uppercase">
                OPS
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="p-0.5 rounded opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors cursor-pointer"
              title="Minimize Left Tactical Rail"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Nav Items List */}
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isHovered = hoveredId === item.id;
              return (
                <div
                  key={item.id}
                  className="relative flex items-center"
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <button
                    type="button"
                    onClick={item.onClick}
                    aria-label={item.label}
                    className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      item.isActive
                        ? isLightMode
                          ? "bg-white border shadow-[0_2px_8px_rgba(0,0,0,0.08)] scale-105"
                          : "bg-white/10 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] scale-105"
                        : isLightMode
                          ? "border border-[#daddd8] bg-[#ecebe4] hover:border-[#0284c7]/50 hover:bg-white hover:scale-105"
                          : "border border-[#162536] bg-[#070d14]/70 hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/10 hover:scale-105"
                    }`}
                    style={{
                      borderColor: item.isActive ? item.color : undefined,
                      boxShadow: item.isActive
                        ? `0 0 14px ${item.color}55, inset 0 1px 0 rgba(255,255,255,0.25)`
                        : undefined,
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{ color: item.isActive ? item.color : isLightMode ? "#525252" : "#94a3b8" }}
                      className="transition-colors"
                    >
                      {item.icon}
                    </div>

                    {/* Active Halo Dot */}
                    {item.isActive && (
                      <span
                        className="absolute -bottom-0.5 w-1.5 h-1 rounded-full shadow-[0_0_6px_currentColor]"
                        style={{ backgroundColor: item.color }}
                      />
                    )}

                    {/* Notification / State Pill Badge */}
                    {item.badge && (
                      <span
                        className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full font-mono text-[7px] font-black tracking-tight border border-black/30 text-black shadow-sm"
                        style={{
                          backgroundColor: item.color,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Popout Explanatory Tooltip to the Right */}
                  {isHovered && (
                    <div
                      role="tooltip"
                      className={`absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3 py-2 rounded-xl border whitespace-nowrap z-[100] pointer-events-none flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150 ${
                        isLightMode
                          ? "bg-[#fafaff] border-[#daddd8] text-[#1c1c1c] shadow-[0_12px_40px_rgba(28,28,28,0.22)]"
                          : "bg-[#070d14] border-[#162536] text-[#dee3eb] shadow-[0_12px_40px_rgba(0,0,0,0.95)]"
                      }`}
                      style={{
                        borderColor: `${item.color}50`,
                        boxShadow: `0 8px 30px rgba(0,0,0,0.85), 0 0 16px ${item.color}25`,
                      }}
                    >
                      {/* Tech Arrow */}
                      <div
                        className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 border-l border-b ${
                          isLightMode ? "bg-[#fafaff] border-[#daddd8]" : "bg-[#070d14] border-[#162536]"
                        }`}
                        style={{ borderColor: `${item.color}50` }}
                      />

                      <div className="flex items-center gap-2">
                        <span
                          className="font-['Orbitron'] font-bold text-xs tracking-wider"
                          style={{ color: item.color }}
                        >
                          {item.label}
                        </span>
                        {item.isActive && (
                          <span
                            className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${item.color}20`,
                              color: item.color,
                            }}
                          >
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <p
                        className={`font-['Space_Grotesk'] text-[10px] max-w-[280px] ${
                          isLightMode ? "text-[#525252]" : "text-[#94a3b8]"
                        }`}
                      >
                        {item.sublabel}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>


          {/* Bottom Activity Pulse Dot */}
          <div className="pt-1 border-t border-[#162536]/80 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
          </div>
        </div>
      )}
    </aside>
  );
}

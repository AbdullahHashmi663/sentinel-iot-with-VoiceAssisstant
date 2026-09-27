// ==============================================================================
// CONSOLE 1: EXECUTIVE OVERVIEW & COMMAND CENTER (STITCH FUTURISTIC HUD)
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

"use client";

import React, { useMemo } from "react";
import {
  ShieldCheck,
  Zap,
  Activity,
  Award,
  AlertTriangle,
  Server,
  Network,
  Cpu,
  Layers,
  CheckCircle2,
  ExternalLink,
  Radio,
  BrainCircuit,
  Workflow,
  Sparkles,
  Lock,
  Flame
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";

export default function OverviewConsole() {
  const {
    theme,
    events,
    latestEvent,
    ingestionVelocity,
    threatsContainedCount,
    activeProtectedNodesCount,
    nistCsfScore,
    mttrCurrentMs,
    setActiveConsole,
    startInterlockCountdown,
    openPacketSniffer,
    openAgenticSoc
  } = useTelemetryStore();

  const isLightMode = theme === "alabaster" || theme === "arctic" || theme === "light";

  // --------------------------------------------------------------------------
  // FIVE-SPOKE RADAR PLOT CALCULATIONS (NIST SP 800-53)
  // --------------------------------------------------------------------------
  const radarMetrics = [
    { label: "SC (Comms)", value: 0.98, full: "SC-5 DoS Protection" },
    { label: "SI (Integrity)", value: 0.95, full: "SI-3 Malicious Code" },
    { label: "AU (Audit)", value: 1.0, full: "AU-9 Cryptographic Ledger" },
    { label: "IA (Auth)", value: 0.92, full: "IA-5 Authenticator Mgmt" },
    { label: "RA (Risk)", value: 0.94, full: "RA-3 Vulnerability Scan" }
  ];

  const radarPoints = useMemo(() => {
    const center = 110;
    const radius = 80;
    const total = radarMetrics.length;

    return radarMetrics.map((m, i) => {
      const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
      const r = radius * m.value;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, angle, label: m.label, value: m.value };
    });
  }, [radarMetrics]);

  const radarPolygonPath = useMemo(() => {
    return radarPoints.map((p) => `${p.x},${p.y}`).join(" ");
  }, [radarPoints]);

  return (
    <div className="space-y-4">
      {/* 1. METADATA SUB-BAR */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 rounded font-mono text-[11px] shadow-sm border transition-colors ${
          isLightMode
            ? "bg-[#eef0f2] border-[#daddd8] text-[#1c1c1c]"
            : "bg-[#070d14]/90 border-[#162536] text-[#dee3eb]"
        }`}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isLightMode ? "bg-[#0284c7] animate-ping" : "bg-[#00f0ff] animate-ping"
              }`}
            />
            <span
              className={`font-bold tracking-wider ${
                isLightMode ? "text-[#0284c7]" : "text-[#00f0ff] text-glow-cyan"
              }`}
            >
              DEFCON 4 // ACTIVE SYNCHRONY
            </span>
          </div>
          <span className={isLightMode ? "text-[#daddd8]" : "text-[#162536]"}>/</span>
          <div className={`flex items-center gap-1 ${isLightMode ? "text-[#525252]" : "text-[#64748b]"}`}>
            <span>SECTOR:</span>
            <span className={isLightMode ? "text-[#0284c7] font-bold" : "text-[#00f0ff] font-bold"}>
              DISTRIBUTED SCADA CELL #7
            </span>
          </div>
          <span className={isLightMode ? "text-[#daddd8]" : "text-[#162536]"}>/</span>
          <div className={`flex items-center gap-1 ${isLightMode ? "text-[#525252]" : "text-[#64748b]"}`}>
            <span>SHM PIPELINE:</span>
            <span className={isLightMode ? "text-[#059669] font-bold" : "text-[#00ff66] font-bold"}>
              ring_buffer_0: OK (0.00% drop)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={isLightMode ? "text-[#525252]" : "text-[#64748b]"}>INFERENCE ENGINE:</span>
          <span
            className={`px-2 py-0.5 rounded border font-bold ${
              isLightMode
                ? "bg-[#fafaff] text-[#0284c7] border-[#daddd8]"
                : "bg-[#0b131e] text-[#00f0ff] border-[#162536]"
            }`}
          >
            CONFORMER DUAL-CORE [FP16]
          </span>
        </div>
      </div>

      {/* 2. TOP 5 KPI TELEMETRY RIBBON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Protected Nodes */}
        <div className="hud-box p-3.5 rounded flex flex-col justify-between relative overflow-hidden group">
          <span className="hud-corner-tr">┐</span>
          <span className="hud-corner-bl">└</span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748b] uppercase tracking-wider">
              Protected IoT/OT Nodes
            </span>
            <Server className="w-4 h-4 text-[#00f0ff]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono">
            <div className="text-2xl font-bold text-white text-glow-cyan font-['Orbitron']">
              {activeProtectedNodesCount}/13
            </div>
            <span className="text-[10px] text-[#00ff66] bg-[#00ff66]/10 border border-[#00ff66]/30 px-1.5 py-0.5 rounded font-bold">
              ONLINE
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 pt-1 border-t border-[#162536]">
            {Array.from({ length: 13 }).map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#00ff66] shadow-[0_0_5px_#00ff66] animate-pulse"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Card 2: Ingestion Velocity */}
        <div className="hud-box p-3.5 rounded flex flex-col justify-between relative overflow-hidden group">
          <span className="hud-corner-tr">┐</span>
          <span className="hud-corner-bl">└</span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748b] uppercase tracking-wider">
              Ingestion Velocity
            </span>
            <Zap className="w-4 h-4 text-[#00f0ff]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono">
            <div className="text-2xl font-bold text-[#00f0ff] font-['Orbitron']">
              {ingestionVelocity.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#00f0ff] font-bold">EVT/S</span>
          </div>
          <div className="mt-2 h-5 w-full flex items-center">
            <svg className="w-full h-full text-[#00f0ff]" fill="none" viewBox="0 0 160 28" preserveAspectRatio="none">
              <path d="M0,18 L15,14 L30,22 L45,10 L60,16 L75,6 L90,19 L105,12 L120,24 L135,8 L150,15 L160,11" stroke="currentColor" strokeWidth="1.8" />
              <path d="M0,18 L15,14 L30,22 L45,10 L60,16 L75,6 L90,19 L105,12 L120,24 L135,8 L150,15 L160,11 L160,28 L0,28 Z" fill="currentColor" fillOpacity="0.12" />
            </svg>
          </div>
        </div>

        {/* Card 3: Threats Contained */}
        <div className="hud-box p-3.5 rounded flex flex-col justify-between relative overflow-hidden group">
          <span className="hud-corner-tr">┐</span>
          <span className="hud-corner-bl">└</span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748b] uppercase tracking-wider">
              Autonomous Blocks
            </span>
            <ShieldCheck className="w-4 h-4 text-[#ff2a5f]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono">
            <div className="text-2xl font-bold text-[#ff2a5f] font-['Orbitron']">
              {threatsContainedCount}
            </div>
            <span className="text-[10px] text-[#ff2a5f] bg-[#ff2a5f]/10 border border-[#ff2a5f]/30 px-1.5 py-0.5 rounded font-bold">
              CONTAINED
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#64748b] pt-1 border-t border-[#162536]">
            <span>AUTONOMOUS MTTR</span>
            <span className="text-[#00f0ff] font-bold">{mttrCurrentMs.toFixed(1)} ms</span>
          </div>
        </div>

        {/* Card 4: NIST CSF 2.0 Posture */}
        <div className="hud-box p-3.5 rounded flex flex-col justify-between relative overflow-hidden group">
          <span className="hud-corner-tr">┐</span>
          <span className="hud-corner-bl">└</span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748b] uppercase tracking-wider">
              NIST CSF Posture
            </span>
            <Award className="w-4 h-4 text-[#00ff66]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono">
            <div className="text-2xl font-bold text-[#00ff66] font-['Orbitron']">
              {nistCsfScore}%
            </div>
            <span className="text-[10px] text-[#00ff66] bg-[#00ff66]/10 border border-[#00ff66]/30 px-1.5 py-0.5 rounded font-bold">
              TIER 4 ADAPTIVE
            </span>
          </div>
          <div className="mt-2 w-full bg-[#162536] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#00ff66] h-full rounded-full shadow-[0_0_8px_#00ff66] transition-all duration-500"
              style={{ width: `${nistCsfScore}%` }}
            />
          </div>
        </div>

        {/* Card 5: eBPF XDP Line-Rate Drop */}
        <div className="hud-box p-3.5 rounded flex flex-col justify-between relative overflow-hidden group">
          <span className="hud-corner-tr">┐</span>
          <span className="hud-corner-bl">└</span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748b] uppercase tracking-wider">
              eBPF Mitigation
            </span>
            <Activity className="w-4 h-4 text-[#00f0ff]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono">
            <div className="text-2xl font-bold text-[#00f0ff] font-['Orbitron']">
              0.082 <span className="text-xs font-normal">ms</span>
            </div>
            <span className="text-[10px] text-[#00ff66] bg-[#00ff66]/10 border border-[#00ff66]/30 px-1.5 py-0.5 rounded font-bold">
              LINE-RATE
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#64748b] pt-1 border-t border-[#162536]">
            <span>KERNEL HOOK</span>
            <span className="text-[#00ff66] font-bold">xdp_drop on eth0</span>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE ROW: BLAST RADIUS TOPOLOGY & NIST RADAR (7 / 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* BLAST RADIUS & PROVENANCE TOPOLOGY (7 COLS) */}
        <div className="lg:col-span-7 hud-box p-4 rounded flex flex-col justify-between">
          <span className="hud-corner-tr">┐</span>
          <span className="hud-corner-bl">└</span>
          <div className="flex items-center justify-between border-b border-[#162536] pb-2 mb-2 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#00f0ff] glow-cyan" />
              <h3 className="font-['Orbitron'] font-bold text-xs uppercase text-white tracking-wide">
                BLAST RADIUS &amp; LATERAL PROVENANCE TOPOLOGY
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff2a5f]/15 border border-[#ff2a5f]/40 text-[#ff2a5f] shadow-[0_0_8px_rgba(255,42,95,0.3)] animate-pulse">
              CONTAINMENT ACTIVE
            </span>
          </div>

          {/* Topology Canvas */}
          <div
            className={`relative w-full h-[250px] rounded border flex items-center justify-center overflow-hidden transition-colors ${
              isLightMode ? "bg-[#fafaff] border-[#daddd8]" : "bg-[#03070c] border-[#162536]"
            }`}
          >
            <svg className="w-full h-full" viewBox="0 0 700 240">
              <defs>
                <pattern id="grid-pattern" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path
                    d="M 28 0 L 0 0 0 28"
                    fill="none"
                    stroke={isLightMode ? "rgba(28, 28, 28, 0.08)" : "rgba(0, 240, 255, 0.04)"}
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />

              {/* Connecting Traces */}
              <line x1="120" y1="120" x2="270" y2="120" stroke="#ff2a5f" strokeWidth="2.5" strokeDasharray="6 4" />
              <line x1="330" y1="120" x2="470" y2="70" stroke="#ffb700" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="330" y1="120" x2="470" y2="170" stroke="#00ff66" strokeWidth="2" />
              <line x1="530" y1="170" x2="630" y2="170" stroke="#00ff66" strokeWidth="2" />

              {/* Firewall Barrier iptables DROP */}
              <line x1="300" y1="20" x2="300" y2="220" stroke="#ff2a5f" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.85" />
              <rect
                x="245"
                y="8"
                width="110"
                height="22"
                rx="4"
                fill={isLightMode ? "#ecebe4" : "#070d14"}
                stroke="#ff2a5f"
                strokeWidth="1.2"
              />
              <text x="300" y="23" fill="#ff2a5f" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
                iptables DROP
              </text>

              {/* Node 1: Adversary Source */}
              <g transform="translate(100, 120)">
                <circle r="26" fill={isLightMode ? "#ecebe4" : "#070d14"} stroke="#ff2a5f" strokeWidth="2" />
                <circle r="34" fill="none" stroke="#ff2a5f" strokeWidth="1" opacity="0.4" className="animate-ping" />
                <text x="0" y="-35" fill="#ff2a5f" fontSize="10" fontFamily="Orbitron" textAnchor="middle" fontWeight="bold">
                  ATTACK SOURCE
                </text>
                <text x="0" y="4" fill={isLightMode ? "#1c1c1c" : "#ffffff"} fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
                  192.168.100.45
                </text>
                <text x="0" y="16" fill={isLightMode ? "#525252" : "#64748b"} fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
                  [DDoS / Modbus]
                </text>
              </g>

              {/* Node 2: Gateway Boundary */}
              <g transform="translate(300, 120)">
                <rect
                  x="-24"
                  y="-24"
                  width="48"
                  height="48"
                  rx="8"
                  fill={isLightMode ? "#eef0f2" : "#0b131e"}
                  stroke="#00f0ff"
                  strokeWidth="2"
                />
                <text x="0" y="-32" fill={isLightMode ? "#0284c7" : "#00f0ff"} fontSize="9" fontFamily="Orbitron" textAnchor="middle" fontWeight="bold">
                  GATEWAY FIREWALL
                </text>
                <text x="0" y="4" fill={isLightMode ? "#0284c7" : "#00f0ff"} fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
                  eth0 / Wazuh
                </text>
              </g>

              {/* Node 3: Host OS Process */}
              <g transform="translate(500, 70)">
                <rect
                  x="-22"
                  y="-22"
                  width="44"
                  height="44"
                  rx="6"
                  fill={isLightMode ? "#eef0f2" : "#0b131e"}
                  stroke="#ffb700"
                  strokeWidth="2"
                />
                <text x="0" y="-28" fill="#d97706" fontSize="9" fontFamily="Orbitron" textAnchor="middle" fontWeight="bold">
                  HOST OS PROCESS
                </text>
                <text x="0" y="4" fill={isLightMode ? "#1c1c1c" : "#ffffff"} fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
                  PID 4120
                </text>
                <text x="0" y="16" fill={isLightMode ? "#525252" : "#64748b"} fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
                  [Terminated]
                </text>
              </g>

              {/* Node 4: Isolated Physical PLC */}
              <g transform="translate(500, 170)">
                <rect
                  x="-22"
                  y="-22"
                  width="44"
                  height="44"
                  rx="6"
                  fill={isLightMode ? "#eef0f2" : "#0b131e"}
                  stroke="#00ff66"
                  strokeWidth="2"
                />
                <text x="0" y="-28" fill="#059669" fontSize="9" fontFamily="Orbitron" textAnchor="middle" fontWeight="bold">
                  PHYSICAL PLC
                </text>
                <text x="0" y="4" fill={isLightMode ? "#1c1c1c" : "#ffffff"} fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
                  Modbus Node 01
                </text>
                <text x="0" y="16" fill="#059669" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
                  [100% Safe]
                </text>
              </g>

              {/* Node 5: OT Actuator */}
              <g transform="translate(640, 170)">
                <circle r="18" fill={isLightMode ? "#ecebe4" : "#070d14"} stroke="#00ff66" strokeWidth="2" />
                <text x="0" y="-24" fill="#059669" fontSize="8" fontFamily="Orbitron" textAnchor="middle" fontWeight="bold">
                  SCADA COIL
                </text>
                <text x="0" y="4" fill={isLightMode ? "#1c1c1c" : "#ffffff"} fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
                  RELAY
                </text>
              </g>
            </svg>
          </div>

          <div
            className={`flex items-center justify-between text-xs font-mono pt-2 border-t ${
              isLightMode ? "border-[#daddd8] text-[#525252]" : "border-[#162536] text-[#64748b]"
            }`}
          >
            <span>Containment Radius: Edge Perimeter Isolated</span>
            <button
              type="button"
              onClick={() => startInterlockCountdown("192.168.100.45")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all font-mono text-[11px] cursor-pointer border ${
                isLightMode
                  ? "bg-[#0284c7]/10 border-[#0284c7]/30 text-[#0284c7] hover:bg-[#0284c7]/20"
                  : "bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/20"
              }`}
            >
              <span>Test IEC 62443 Safety Override</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* NIST SP 800-53 FIVE-SPOKE RADAR (5 COLS) */}
        <div className="lg:col-span-5 hud-box p-4 rounded flex flex-col justify-between">
          <span className="hud-corner-tr">┐</span>
          <span className="hud-corner-bl">└</span>
          <div
            className={`flex items-center justify-between border-b pb-2 mb-2 font-mono ${
              isLightMode ? "border-[#daddd8]" : "border-[#162536]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#00ff66] glow-emerald" />
              <h3
                className={`font-['Orbitron'] font-bold text-xs uppercase tracking-wide ${
                  isLightMode ? "text-[#1c1c1c]" : "text-white"
                }`}
              >
                NIST SP 800-53 COMPLIANCE RADAR
              </h3>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                isLightMode
                  ? "bg-[#059669]/15 border-[#059669]/40 text-[#059669]"
                  : "bg-[#00ff66]/15 border-[#00ff66]/40 text-[#00ff66]"
              }`}
            >
              96.4% AUDITED
            </span>
          </div>

          <div className="flex items-center justify-center py-1">
            <svg width="220" height="210" viewBox="0 0 220 210">
              {/* Concentric Pentagons */}
              {[0.25, 0.5, 0.75, 1.0].map((level) => (
                <circle
                  key={level}
                  cx="110"
                  cy="105"
                  r={80 * level}
                  fill="none"
                  stroke={isLightMode ? "rgba(28, 28, 28, 0.12)" : "rgba(0, 240, 255, 0.12)"}
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
              ))}

              {/* Axis Spoke Lines */}
              {radarPoints.map((p, idx) => (
                <line
                  key={idx}
                  x1="110"
                  y1="105"
                  x2={110 + 80 * Math.cos(p.angle)}
                  y2={105 + 80 * Math.sin(p.angle)}
                  stroke={isLightMode ? "rgba(28, 28, 28, 0.15)" : "rgba(0, 240, 255, 0.15)"}
                  strokeWidth="1"
                />
              ))}

              {/* Filled Polygon */}
              <polygon
                points={radarPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                fill={isLightMode ? "rgba(2, 132, 199, 0.18)" : "rgba(0, 240, 255, 0.22)"}
                stroke={isLightMode ? "#0284c7" : "#00f0ff"}
                strokeWidth="2"
              />

              {/* Nodes */}
              {radarPoints.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill={isLightMode ? "#059669" : "#00ff66"}
                    stroke={isLightMode ? "#1c1c1c" : "#ffffff"}
                    strokeWidth="1"
                  />
                  <text
                    x={110 + 96 * Math.cos(p.angle)}
                    y={105 + 96 * Math.sin(p.angle) + 4}
                    fill={isLightMode ? "#1c1c1c" : "#64748b"}
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div
            className={`grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t ${
              isLightMode ? "border-[#daddd8]" : "border-[#162536]"
            }`}
          >
            <div
              className={`flex items-center justify-between p-2 rounded border ${
                isLightMode ? "bg-[#ecebe4] border-[#daddd8]" : "bg-[#070d14] border-[#162536]"
              }`}
            >
              <span className={isLightMode ? "text-[#525252]" : "text-[#64748b]"}>SC (Comms):</span>
              <span className={isLightMode ? "text-[#059669] font-bold" : "text-[#00ff66] font-bold"}>98%</span>
            </div>
            <div
              className={`flex items-center justify-between p-2 rounded border ${
                isLightMode ? "bg-[#ecebe4] border-[#daddd8]" : "bg-[#070d14] border-[#162536]"
              }`}
            >
              <span className={isLightMode ? "text-[#525252]" : "text-[#64748b]"}>SI (Integrity):</span>
              <span className={isLightMode ? "text-[#059669] font-bold" : "text-[#00ff66] font-bold"}>95%</span>
            </div>
            <div
              className={`flex items-center justify-between p-2 rounded border ${
                isLightMode ? "bg-[#ecebe4] border-[#daddd8]" : "bg-[#070d14] border-[#162536]"
              }`}
            >
              <span className={isLightMode ? "text-[#525252]" : "text-[#64748b]"}>AU (Audit AU-9):</span>
              <span className={isLightMode ? "text-[#059669] font-bold" : "text-[#00ff66] font-bold"}>100%</span>
            </div>
            <div
              className={`flex items-center justify-between p-2 rounded border ${
                isLightMode ? "bg-[#ecebe4] border-[#daddd8]" : "bg-[#070d14] border-[#162536]"
              }`}
            >
              <span className={isLightMode ? "text-[#525252]" : "text-[#64748b]"}>IA (Auth):</span>
              <span className={isLightMode ? "text-[#059669] font-bold" : "text-[#00ff66] font-bold"}>92%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. REAL-TIME INCIDENT INGESTION STREAM TABLE */}
      <div className="hud-box p-4 rounded space-y-3">
        <span className="hud-corner-tr">┐</span>
        <span className="hud-corner-bl">└</span>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#162536] pb-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#00f0ff] glow-cyan" />
            <h3 className="font-['Orbitron'] font-bold text-xs uppercase text-white tracking-wide">
              REAL-TIME HIGH-DENSITY INCIDENT INGESTION STREAM
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openPacketSniffer}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#00f0ff]/15 border border-[#00f0ff]/50 text-[#00f0ff] hover:bg-[#00f0ff]/25 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>PACKET SNIFFER</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveConsole("remediation")}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#00ff66]/15 border border-[#00ff66]/50 text-[#00ff66] hover:bg-[#00ff66]/25 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer"
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>SOAR PLAYBOOKS</span>
            </button>
          </div>
        </div>

        <div
          className={`overflow-x-auto max-h-[320px] rounded border transition-colors ${
            isLightMode ? "bg-[#fafaff] border-[#daddd8]" : "bg-[#03070c] border-[#162536]"
          }`}
        >
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr
                className={`border-b text-[10px] uppercase font-bold transition-colors ${
                  isLightMode
                    ? "bg-[#ecebe4] border-[#daddd8] text-[#1c1c1c]"
                    : "bg-[#070d14] border-[#162536] text-[#64748b]"
                }`}
              >
                <th scope="col" className="py-2.5 px-3">Timestamp</th>
                <th scope="col" className="py-2.5 px-3">Incident ID</th>
                <th scope="col" className="py-2.5 px-3">Domain</th>
                <th scope="col" className="py-2.5 px-3">Source IP / PID</th>
                <th scope="col" className="py-2.5 px-3">Class &amp; Severity</th>
                <th scope="col" className="py-2.5 px-3">Tau Score</th>
                <th scope="col" className="py-2.5 px-3">Autonomous Action</th>
                <th scope="col" className="py-2.5 px-3">NIST Control</th>
                <th scope="col" className="py-2.5 px-3 text-right">Forensic Action</th>
              </tr>
            </thead>
            <tbody className={isLightMode ? "divide-y divide-[#daddd8]" : "divide-y divide-[#162536]/50"}>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#64748b] italic">
                    Listening for telemetry stream... (Start stream in header or use Mock mode)
                  </td>
                </tr>
              ) : (
                events.map((evt) => {
                  const isCrit = evt.isAnomaly || evt.anomalyProbability > 0.85;
                  const isWarn = evt.anomalyProbability >= 0.60 && !isCrit;

                  const badgeStyle = isCrit
                    ? "bg-[#ff2a5f]/20 text-[#ff2a5f] border-[#ff2a5f]/40 shadow-[0_0_8px_rgba(255,42,95,0.3)]"
                    : isWarn
                    ? "bg-[#ffb700]/20 text-[#ffb700] border-[#ffb700]/40"
                    : "bg-[#00ff66]/15 text-[#00ff66] border-[#00ff66]/30";

                  return (
                    <tr
                      key={evt.id}
                      className={`transition-colors ${
                        isLightMode ? "hover:bg-[#ecebe4]/80" : "hover:bg-[#00f0ff]/5"
                      }`}
                    >
                      <td
                        className={`py-2 px-3 text-[11px] whitespace-nowrap ${
                          isLightMode ? "text-[#525252]" : "text-[#64748b]"
                        }`}
                      >
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td
                        className={`py-2 px-3 font-bold text-[11px] whitespace-nowrap ${
                          isLightMode ? "text-[#1c1c1c]" : "text-white"
                        }`}
                      >
                        {evt.id}
                      </td>
                      <td
                        className={`py-2 px-3 text-[11px] whitespace-nowrap font-bold ${
                          isLightMode ? "text-[#0284c7]" : "text-[#00f0ff]"
                        }`}
                      >
                        {evt.domain}
                      </td>
                      <td
                        className={`py-2 px-3 text-[11px] whitespace-nowrap ${
                          isLightMode ? "text-[#1c1c1c]" : "text-[#dee3eb]"
                        }`}
                      >
                        {evt.sourceIp} {evt.processId ? `(PID: ${evt.processId})` : ""}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${badgeStyle}`}>
                          {evt.predictedClass} {isCrit ? "CRITICAL" : isWarn ? "WARNING" : "NORMAL"}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-[11px] whitespace-nowrap">
                        <span style={{ color: isCrit ? "#ff2a5f" : isWarn ? "#ffb700" : "#00ff66" }}>
                          τ = {evt.anomalyProbability.toFixed(3)}
                        </span>
                      </td>
                      <td
                        className={`py-2 px-3 text-[11px] font-mono whitespace-nowrap ${
                          isLightMode ? "text-[#525252]" : "text-[#64748b]"
                        }`}
                      >
                        {evt.remediationAction}
                      </td>
                      <td
                        className={`py-2 px-3 text-[11px] whitespace-nowrap font-bold ${
                          isLightMode ? "text-[#0284c7]" : "text-[#00f0ff]"
                        }`}
                      >
                        {evt.compliance?.nistControlId || "AU-9"}
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openAgenticSoc(evt)}
                          aria-label={`Analyze incident ${evt.id} with Agentic SOC`}
                          className={`px-2.5 py-1 rounded border font-bold text-[10px] tracking-wider transition-all cursor-pointer ${
                            isLightMode
                              ? "border-[#daddd8] bg-[#ecebe4] hover:bg-[#fafaff] hover:border-[#0284c7] text-[#1c1c1c]"
                              : "border-[#162536] bg-[#070d14] hover:border-[#00f0ff] text-[#dee3eb] hover:text-[#00f0ff]"
                          }`}
                        >
                          ANALYZE
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

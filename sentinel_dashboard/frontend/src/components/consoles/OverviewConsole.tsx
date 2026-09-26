// ==============================================================================
// CONSOLE 1: EXECUTIVE OVERVIEW & COMMAND CENTER (SECTION 5.2)
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
  XCircle,
  ExternalLink,
  Radio,
  BrainCircuit,
  Workflow,
  Sparkles
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";

export default function OverviewConsole() {
  const {
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
    openAgenticSoc,
    openSoarBuilder
  } = useTelemetryStore();

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
      
      {/* 1. TOP KPI RIBBON (SECTION 5.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Protected Nodes */}
        <div className="cyber-card p-4 flex items-center justify-between border-l-4 border-l-[var(--brand-cyan)]">
          <div className="space-y-1">
            <span className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-secondary)] uppercase tracking-wider">
              Protected Fleet Nodes
            </span>
            <div className="text-2xl font-black font-['Orbitron'] text-[var(--text-primary)]">
              {activeProtectedNodesCount}/13 <span className="text-xs text-[var(--alert-nominal)] font-normal">ONLINE</span>
            </div>
            <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--brand-cyan)]">
              100% Industrial Coverage
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[var(--brand-cyan)]/15 text-[var(--brand-cyan)]">
            <Server className="w-6 h-6" />
          </div>
        </div>

        {/* Ingestion Velocity */}
        <div className="cyber-card p-4 flex items-center justify-between border-l-4 border-l-[var(--brand-primary)]">
          <div className="space-y-1">
            <span className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-secondary)] uppercase tracking-wider">
              Ingestion Velocity
            </span>
            <div className="text-2xl font-black font-['Orbitron'] text-[var(--brand-primary)]">
              {ingestionVelocity.toLocaleString()} <span className="text-xs text-[var(--text-muted)] font-normal">EVT/S</span>
            </div>
            <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">
              Sub-25ms WebSocket Stream
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Threats Contained */}
        <div className="cyber-card p-4 flex items-center justify-between border-l-4 border-l-[var(--alert-critical)]">
          <div className="space-y-1">
            <span className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-secondary)] uppercase tracking-wider">
              Autonomous Blocks
            </span>
            <div className="text-2xl font-black font-['Orbitron'] text-[var(--alert-critical)]">
              {threatsContainedCount} <span className="text-xs text-[var(--alert-critical)] font-normal">MITIGATED</span>
            </div>
            <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--alert-critical)]">
              Zero Human Delay (MTTR {mttrCurrentMs}ms)
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[var(--alert-critical)]/15 text-[var(--alert-critical)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* NIST CSF Score */}
        <div className="cyber-card p-4 flex items-center justify-between border-l-4 border-l-[var(--alert-nominal)]">
          <div className="space-y-1">
            <span className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-secondary)] uppercase tracking-wider">
              NIST CSF 2.0 Score
            </span>
            <div className="text-2xl font-black font-['Orbitron'] text-[var(--alert-nominal)]">
              {nistCsfScore}% <span className="text-xs text-[var(--alert-nominal)] font-normal">AUDITED</span>
            </div>
            <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--alert-nominal)]">
              Continuous Cryptographic AU-9
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[var(--alert-nominal)]/15 text-[var(--alert-nominal)]">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: BLAST RADIUS TOPOLOGY & NIST 5-SPOKE RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* BLAST RADIUS & LATERAL PROVENANCE GRAPH (7 COLS) */}
        <div className="lg:col-span-7 cyber-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-[var(--brand-cyan)]" />
              <h3 className="font-['Orbitron'] font-bold text-xs uppercase text-[var(--text-primary)]">
                Blast Radius & Lateral Provenance Topology
              </h3>
            </div>
            <span className="text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[var(--alert-critical)]/15 text-[var(--alert-critical)] border border-[var(--alert-critical)]/30">
              CONTAINMENT ACTIVE
            </span>
          </div>

          <div className="relative w-full h-[250px] bg-[var(--bg-canvas)] rounded-lg border border-[var(--border-color)] flex items-center justify-center overflow-hidden p-2">
            <svg className="w-full h-full" viewBox="0 0 700 240">
              <defs>
                <linearGradient id="containment-pulse" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Connecting Traces */}
              {/* Node 1 to Node 2 */}
              <line x1="120" y1="120" x2="270" y2="120" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6 4" />
              {/* Node 2 to Node 3 */}
              <line x1="330" y1="120" x2="470" y2="70" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
              {/* Node 2 to Node 4 */}
              <line x1="330" y1="120" x2="470" y2="170" stroke="#10b981" strokeWidth="2" />
              {/* Node 4 to Node 5 */}
              <line x1="530" y1="170" x2="630" y2="170" stroke="#10b981" strokeWidth="2" />

              {/* Firewall Quarantine Barrier */}
              <line x1="300" y1="30" x2="300" y2="210" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 6" opacity="0.8" />
              <rect x="250" y="8" width="100" height="20" rx="4" fill="#070D17" stroke="#ef4444" strokeWidth="1" />
              <text x="300" y="22" fill="#ef4444" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                iptables DROP
              </text>

              {/* Node 1: Adversary Source */}
              <g transform="translate(100, 120)">
                <circle r="26" fill="#0F172A" stroke="#ef4444" strokeWidth="2" />
                <circle r="34" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.4" className="animate-ping" />
                <text x="0" y="-35" fill="#ef4444" fontSize="10" fontFamily="Orbitron" textAnchor="middle" fontWeight="bold">
                  ATTACK SOURCE
                </text>
                <text x="0" y="4" fill="#F8FAFC" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  192.168.100.45
                </text>
                <text x="0" y="16" fill="#94A3B8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  [DDoS Vector]
                </text>
              </g>

              {/* Node 2: Network Gateway Boundary */}
              <g transform="translate(300, 120)">
                <rect x="-24" y="-24" width="48" height="48" rx="8" fill="#1E293B" stroke="#0284c7" strokeWidth="2" />
                <text x="0" y="-32" fill="#0284c7" fontSize="10" fontFamily="Orbitron" textAnchor="middle" fontWeight="bold">
                  GATEWAY FIREWALL
                </text>
                <text x="0" y="4" fill="#00f3ff" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  eth0 / Wazuh
                </text>
              </g>

              {/* Node 3: Host OS Process */}
              <g transform="translate(500, 70)">
                <rect x="-22" y="-22" width="44" height="44" rx="6" fill="#1E293B" stroke="#f59e0b" strokeWidth="2" />
                <text x="0" y="-28" fill="#f59e0b" fontSize="10" fontFamily="Orbitron" textAnchor="middle" fontWeight="bold">
                  HOST OS PROCESS
                </text>
                <text x="0" y="4" fill="#F8FAFC" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  PID 4120
                </text>
                <text x="0" y="16" fill="#94A3B8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  [Terminated]
                </text>
              </g>

              {/* Node 4: Isolated Physical PLC */}
              <g transform="translate(500, 170)">
                <rect x="-22" y="-22" width="44" height="44" rx="6" fill="#1E293B" stroke="#10b981" strokeWidth="2" />
                <text x="0" y="-28" fill="#10b981" fontSize="10" fontFamily="Orbitron" textAnchor="middle" fontWeight="bold">
                  PHYSICAL PLC
                </text>
                <text x="0" y="4" fill="#F8FAFC" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  Modbus Node 01
                </text>
                <text x="0" y="16" fill="#10b981" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  [100% Safe]
                </text>
              </g>

              {/* Node 5: OT Actuator */}
              <g transform="translate(640, 170)">
                <circle r="18" fill="#0F172A" stroke="#10b981" strokeWidth="2" />
                <text x="0" y="-24" fill="#10b981" fontSize="9" fontFamily="Orbitron" textAnchor="middle" fontWeight="bold">
                  SCADA COIL
                </text>
                <text x="0" y="4" fill="#F8FAFC" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  RELAY
                </text>
              </g>
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs font-['JetBrains_Mono'] text-[var(--text-secondary)] px-1">
            <span>Containment Radius: Isolated to Ingress Edge</span>
            <button
              onClick={() => startInterlockCountdown("192.168.100.45")}
              aria-label="Launch IEC 62443 Safety Override Modal"
              className="cursor-pointer text-[var(--brand-cyan)] hover:text-white hover:underline flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)] focus-visible:outline-none rounded px-1.5 py-0.5 transition-colors"
            >
              <span>Test IEC 62443 Safety Override</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* NIST SP 800-53 FIVE-SPOKE RADAR (5 COLS) */}
        <div className="lg:col-span-5 cyber-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[var(--alert-nominal)]" />
              <h3 className="font-['Orbitron'] font-bold text-xs uppercase text-[var(--text-primary)]">
                NIST SP 800-53 Compliance Radar
              </h3>
            </div>
            <span className="text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[var(--alert-nominal)]/15 text-[var(--alert-nominal)] border border-[var(--alert-nominal)]/30">
              96.4% COMPLIANT
            </span>
          </div>

          <div className="flex items-center justify-center p-2">
            <svg width="220" height="220" viewBox="0 0 220 220">
              {/* Concentric Guide Circles */}
              {[0.25, 0.5, 0.75, 1.0].map((level) => (
                <circle
                  key={level}
                  cx="110"
                  cy="110"
                  r={80 * level}
                  fill="none"
                  stroke="var(--border-color)"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
              ))}

              {/* Axis Spoke Lines */}
              {radarPoints.map((p, idx) => (
                <line
                  key={idx}
                  x1="110"
                  y1="110"
                  x2={110 + 80 * Math.cos(p.angle)}
                  y2={110 + 80 * Math.sin(p.angle)}
                  stroke="var(--border-color)"
                  strokeWidth="0.8"
                />
              ))}

              {/* Radar Filled Polygon */}
              <polygon
                points={radarPolygonPath}
                fill="var(--brand-cyan)"
                fillOpacity="0.25"
                stroke="var(--brand-cyan)"
                strokeWidth="2"
              />

              {/* Radar Data Nodes */}
              {radarPoints.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="4" fill="var(--brand-primary)" stroke="#F8FAFC" strokeWidth="1" />
                  <text
                    x={110 + 96 * Math.cos(p.angle)}
                    y={110 + 96 * Math.sin(p.angle) + 4}
                    fill="var(--text-secondary)"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-['JetBrains_Mono'] text-[var(--text-secondary)]">
            <div className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-surface)]">
              <span>SC (Comms):</span>
              <span className="text-[var(--alert-nominal)] font-bold">98%</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-surface)]">
              <span>SI (Integrity):</span>
              <span className="text-[var(--alert-nominal)] font-bold">95%</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-surface)]">
              <span>AU (Audit AU-9):</span>
              <span className="text-[var(--alert-nominal)] font-bold">100%</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-surface)]">
              <span>IA (Auth):</span>
              <span className="text-[var(--alert-nominal)] font-bold">92%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: REAL-TIME INCIDENT STREAM (HIGH DENSITY TABLE) */}
      <div className="cyber-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-2.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--brand-primary)]" />
            <h3 className="font-['Orbitron'] font-bold text-xs uppercase text-[var(--text-primary)]">
              Real-Time High-Density Incident Ingestion Stream
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* LIVE PACKET SNIFFER QUICK LAUNCHER (UPGRADE 3) */}
            <button
              type="button"
              onClick={openPacketSniffer}
              aria-label="Launch Live Hardware Packet Sniffer Drawer"
              className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--brand-cyan)]/15 border border-[var(--brand-cyan)] text-[var(--brand-cyan)] hover:bg-[var(--brand-cyan)]/25 text-[10px] font-['Orbitron'] font-bold uppercase transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)]"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>PACKET SNIFFER</span>
            </button>

            {/* SOAR PLAYBOOKS QUICK LAUNCHER (UPGRADE 2) */}
            <button
              type="button"
              onClick={() => setActiveConsole("remediation")}
              aria-label="Open SOAR Playbook Builder"
              className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--alert-nominal)]/15 border border-[var(--alert-nominal)] text-[var(--alert-nominal)] hover:bg-[var(--alert-nominal)]/25 text-[10px] font-['Orbitron'] font-bold uppercase transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--alert-nominal)]"
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>SOAR PLAYBOOKS</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full text-left text-xs font-['JetBrains_Mono'] border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] text-[10px] uppercase">
                <th scope="col" className="py-2 px-2.5">Timestamp</th>
                <th scope="col" className="py-2 px-2.5">Incident ID</th>
                <th scope="col" className="py-2 px-2.5">Domain</th>
                <th scope="col" className="py-2 px-2.5">Source IP / PID</th>
                <th scope="col" className="py-2 px-2.5">Class & Severity</th>
                <th scope="col" className="py-2 px-2.5">Tau Score</th>
                <th scope="col" className="py-2 px-2.5">Autonomous Action</th>
                <th scope="col" className="py-2 px-2.5">NIST Control</th>
                <th scope="col" className="py-2 px-2.5">Forensic Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]/30">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-[var(--text-muted)] italic">
                    Listening for telemetry stream... (Press Play in Telemetry Controls or start Mock Mode)
                  </td>
                </tr>
              ) : (
                events.map((evt) => {
                  const isCrit = evt.isAnomaly || evt.anomalyProbability > 0.85;
                  const isWarn = evt.anomalyProbability >= 0.60 && !isCrit;

                  const badgeBg = isCrit
                    ? "bg-[var(--alert-critical)]/15 text-[var(--alert-critical)] border-[var(--alert-critical)]/40"
                    : isWarn
                    ? "bg-[var(--alert-warning)]/15 text-[var(--alert-warning)] border-[var(--alert-warning)]/40"
                    : "bg-[var(--alert-nominal)]/15 text-[var(--alert-nominal)] border-[var(--alert-nominal)]/40";

                  return (
                    <tr key={evt.id} className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                      <td className="py-1.5 px-2.5 text-[var(--text-muted)] text-[11px]">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-1.5 px-2.5 text-[var(--text-primary)] font-bold text-[11px]">
                        {evt.id}
                      </td>
                      <td className="py-1.5 px-2.5 text-[var(--brand-cyan)] text-[11px]">
                        {evt.domain}
                      </td>
                      <td className="py-1.5 px-2.5 text-[var(--text-primary)] text-[11px]">
                        {evt.sourceIp} {evt.processId ? `(PID: ${evt.processId})` : ""}
                      </td>
                      <td className="py-1.5 px-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${badgeBg}`}>
                          {evt.predictedClass} {isCrit ? "CRITICAL" : isWarn ? "WARNING" : "NORMAL"}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5 font-bold text-[11px]" style={{ color: isCrit ? "var(--alert-critical)" : isWarn ? "var(--alert-warning)" : "var(--alert-nominal)" }}>
                        τ = {evt.anomalyProbability.toFixed(3)}
                      </td>
                      <td className="py-1.5 px-2.5 text-[11px] text-[var(--text-secondary)] font-mono">
                        {evt.remediationAction}
                      </td>
                      <td className="py-1.5 px-2.5 text-[11px] text-[var(--brand-primary)]">
                        {evt.compliance?.nistControlId || "AU-9"}
                      </td>
                      <td className="py-1.5 px-2.5">
                        {/* AGENTIC SOC FORENSIC BUTTON (UPGRADE 4) */}
                        <button
                          type="button"
                          onClick={() => openAgenticSoc(evt)}
                          aria-label={`Analyze incident ${evt.id} with Agentic SOC`}
                          className="cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/25 text-[10px] font-['Orbitron'] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
                        >
                          <BrainCircuit className="w-3 h-3" />
                          <span>ANALYZE</span>
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

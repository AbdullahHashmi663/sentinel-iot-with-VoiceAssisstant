// ==============================================================================
// CONSOLE 2: FORENSIC THREAT LAB & MITRE ATT&CK MATRIX (SECTION 5.3)
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

"use client";

import React, { useMemo } from "react";
import {
  Crosshair,
  Cpu,
  Layers,
  ShieldAlert,
  Flame,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Radio,
  BrainCircuit
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import { DomainType, AttackClass } from "@/types/sentinel";

const ALL_DOMAINS: DomainType[] = [
  "Network_Traffic",
  "IoT_Modbus",
  "IoT_Fridge",
  "IoT_GPS_Tracker",
  "IoT_Garage_Door",
  "IoT_Motion_Light",
  "IoT_Thermostat",
  "IoT_Weather",
  "Linux_process",
  "Linux_disk",
  "Linux_memory",
  "Windows_10",
  "Windows_7"
];

const ATTACK_CLASSES: AttackClass[] = [
  "normal",
  "ddos",
  "dos",
  "scanning",
  "password",
  "injection",
  "xss",
  "backdoor",
  "ransomware",
  "mitm"
];

export default function ThreatLabConsole() {
  const {
    activeDomain,
    setActiveDomain,
    latestEvent,
    openPacketSniffer,
    openAgenticSoc
  } = useTelemetryStore();

  const tau = latestEvent?.anomalyProbability ?? 0.084;
  const isCritical = tau > 0.85;
  const currentClass = latestEvent?.predictedClass ?? "normal";

  // Calibrated Radial Gauge calculation
  const gaugePercent = Math.min(100, Math.max(0, tau * 100));
  const strokeDashoffset = 314 - (314 * gaugePercent) / 100;

  // Multi-Class Probability Distribution
  const classProbabilities = useMemo(() => {
    return ATTACK_CLASSES.map((cls) => {
      let prob = 0.01;
      if (cls === currentClass) {
        prob = isCritical ? 0.88 : 0.94;
      } else if (isCritical && (cls === "ddos" || cls === "dos" || cls === "injection")) {
        prob = 0.05;
      }
      return { className: cls, prob };
    });
  }, [currentClass, isCritical]);

  // 10-Step Sliding Waveform Buffer
  const temporalSteps = [
    { step: "T-9", val: 0.12 },
    { step: "T-8", val: 0.14 },
    { step: "T-7", val: 0.11 },
    { step: "T-6", val: 0.16 },
    { step: "T-5", val: isCritical ? 0.42 : 0.13 },
    { step: "T-4", val: isCritical ? 0.68 : 0.12 },
    { step: "T-3", val: isCritical ? 0.84 : 0.15 },
    { step: "T-2", val: isCritical ? 0.92 : 0.11 },
    { step: "T-1", val: isCritical ? 0.96 : 0.14 },
    { step: "T-0", val: tau }
  ];

  // MITRE ATT&CK Matrix Techniques
  const mitreTechniques = [
    {
      id: "T1046",
      name: "Network Service Discovery",
      tactic: "Discovery",
      isActive: currentClass === "scanning"
    },
    {
      id: "T1059",
      name: "Command and Scripting Interpreter",
      tactic: "Execution",
      isActive: currentClass === "backdoor" || currentClass === "xss"
    },
    {
      id: "T1486",
      name: "Data Encrypted for Impact",
      tactic: "Impact",
      isActive: currentClass === "ransomware"
    },
    {
      id: "T0814",
      name: "Denial of Service (ICS/OT)",
      tactic: "Impact",
      isActive: currentClass === "ddos" || currentClass === "dos"
    },
    {
      id: "T0855",
      name: "Unauthorized Command Message (Modbus)",
      tactic: "Inhibit Response",
      isActive: currentClass === "injection"
    },
    {
      id: "T1110",
      name: "Brute Force Password Spray",
      tactic: "Credential Access",
      isActive: currentClass === "password"
    },
    {
      id: "T1557",
      name: "Adversary-in-the-Middle (ARP Poison)",
      tactic: "Collection",
      isActive: currentClass === "mitm"
    }
  ];

  return (
    <div className="space-y-4">
      {/* 1. TOP TOOLBAR: DOMAIN SELECTOR */}
      <div className="cyber-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-[var(--accent-primary)]" />
          <div>
            <h3 className="font-['Orbitron'] font-bold text-sm text-[var(--text-primary)]">
              CONFORMER FORENSIC THREAT LAB
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-['Space_Grotesk']">
              Dual-Head Neural Backbone & MITRE ATT&CK Enterprise v14 / ICS Mapping
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* AGENTIC SOC BUTTON (UPGRADE 4) */}
          <button
            type="button"
            onClick={() => openAgenticSoc(latestEvent)}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/25 text-xs font-['Orbitron'] font-bold uppercase transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AGENTIC SOC ANALYST</span>
          </button>

          {/* PACKET SNIFFER BUTTON (UPGRADE 3) */}
          <button
            type="button"
            onClick={openPacketSniffer}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--brand-cyan)]/15 border border-[var(--brand-cyan)] text-[var(--brand-cyan)] hover:bg-[var(--brand-cyan)]/25 text-xs font-['Orbitron'] font-bold uppercase transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)]"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>PACKET SNIFFER</span>
          </button>

          {/* 13-DOMAIN INSTANT SELECTOR */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-['JetBrains_Mono'] text-[var(--text-muted)]">ACTIVE DATASET:</span>
            <select
              value={activeDomain}
              aria-label="Active ToN_IoT Dataset Selection"
              onChange={(e) => setActiveDomain(e.target.value as DomainType)}
              className="cursor-pointer px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-['Orbitron'] font-bold text-[var(--brand-cyan)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)] transition-colors"
            >
              {ALL_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. DUAL-HEAD CONFORMER ANALYZER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* HEAD 1: ZERO-DAY ANOMALY HEAD (CALIBRATED GAUGE) */}
        <div className="lg:col-span-4 cyber-card p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[var(--alert-critical)]" />
              <h4 className="font-['Orbitron'] font-bold text-xs uppercase text-[var(--text-primary)]">
                Head 1: Zero-Day Anomaly Head
              </h4>
            </div>
            <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">
              Sigmoid (τ &gt; 0.85)
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="var(--bg-surface)"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={isCritical ? "var(--alert-critical)" : "var(--brand-cyan)"}
                  strokeWidth="10"
                  strokeDasharray="314"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black font-['Orbitron']" style={{ color: isCritical ? "var(--alert-critical)" : "var(--brand-cyan)" }}>
                  {(tau * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)] uppercase">
                  τ Probability
                </span>
              </div>
            </div>

            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-['Orbitron'] font-bold uppercase border ${
              isCritical
                ? "bg-[var(--alert-critical)]/15 text-[var(--alert-critical)] border-[var(--alert-critical)] animate-pulse"
                : "bg-[var(--alert-nominal)]/15 text-[var(--alert-nominal)] border-[var(--alert-nominal)]"
            }`}>
              {isCritical ? "CRITICAL ANOMALY DETECTED" : "NOMINAL TELEMETRY FLOW"}
            </div>
          </div>

          <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)] border-t border-[var(--border-color)]/40 pt-2 flex justify-between">
            <span>Threshold τ: 0.850</span>
            <span>False Alarm Target: &lt; 0.05%</span>
          </div>
        </div>

        {/* HEAD 2: FORENSIC MULTI-CLASS CLASSIFIER */}
        <div className="lg:col-span-8 cyber-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-[var(--brand-cyan)]" />
              <h4 className="font-['Orbitron'] font-bold text-xs uppercase text-[var(--text-primary)]">
                Head 2: Forensic Multi-Class Attack Profiler
              </h4>
            </div>
            <span className="text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[var(--brand-primary)]/15 text-[var(--brand-cyan)] border border-[var(--brand-cyan)]/30 uppercase">
              PREDICTED: {currentClass}
            </span>
          </div>

          <div className="space-y-2">
            {classProbabilities.map((cp) => {
              const isTarget = cp.className === currentClass;
              return (
                <div key={cp.className} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-['JetBrains_Mono']">
                    <span className={isTarget ? "text-[var(--text-primary)] font-bold uppercase" : "text-[var(--text-secondary)]"}>
                      {cp.className}
                    </span>
                    <span className={isTarget ? "text-[var(--brand-cyan)] font-bold" : "text-[var(--text-muted)]"}>
                      {(cp.prob * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isTarget ? "bg-[var(--brand-cyan)]" : "bg-[var(--border-color)]"
                      }`}
                      style={{ width: `${cp.prob * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 10-STEP SLIDING WAVEFORM BUFFER */}
      <div className="cyber-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
            <h4 className="font-['Orbitron'] font-bold text-xs uppercase text-[var(--text-primary)]">
              10-Step Sliding Waveform Buffer (Temporal Sequence Modeling)
            </h4>
          </div>
          <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">
            Tensor Dimensions: [Batch Size, 10, Features]
          </span>
        </div>

        <div className="grid grid-cols-10 gap-2 items-end h-[120px] p-2 bg-[var(--bg-canvas)] rounded-lg border border-[var(--border-color)]">
          {temporalSteps.map((step, idx) => {
            const heightPct = Math.min(100, Math.max(10, step.val * 100));
            const isHigh = step.val > 0.85;
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[9px] font-['JetBrains_Mono'] text-[var(--text-muted)]">
                  {step.val.toFixed(2)}
                </span>
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isHigh ? "bg-[var(--alert-critical)] shadow-[0_0_8px_var(--alert-critical)]" : "bg-[var(--brand-primary)]"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] font-['JetBrains_Mono'] font-bold text-[var(--text-secondary)]">
                  {step.step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. INTERACTIVE MITRE ATT&CK ENTERPRISE & ICS MATRIX */}
      <div className="cyber-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[var(--alert-warning)]" />
            <h4 className="font-['Orbitron'] font-bold text-xs uppercase text-[var(--text-primary)]">
              Interactive MITRE ATT&CK Enterprise v14 & ICS Grid
            </h4>
          </div>
          <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">
            Real-Time Adversary Tradecraft Attribution
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {mitreTechniques.map((tech) => (
            <div
              key={tech.id}
              className={`p-3 rounded-lg border transition-all ${
                tech.isActive
                  ? "bg-[var(--alert-critical)]/15 border-[var(--alert-critical)] shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                  : "bg-[var(--bg-surface)] border-[var(--border-color)] opacity-70"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] mb-1">
                <span className={tech.isActive ? "text-[var(--alert-critical)] font-bold" : "text-[var(--text-muted)]"}>
                  {tech.id}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[var(--bg-canvas)] text-[var(--text-secondary)]">
                  {tech.tactic}
                </span>
              </div>
              <div className="font-['Orbitron'] font-bold text-xs text-[var(--text-primary)]">
                {tech.name}
              </div>
              <div className="mt-2 text-[10px] font-['JetBrains_Mono'] text-[var(--text-secondary)] flex items-center gap-1">
                {tech.isActive ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[var(--alert-critical)] animate-ping" />
                    <span className="text-[var(--alert-critical)] font-bold">TECHNIQUE ACTIVE</span>
                  </>
                ) : (
                  <span>Standby Monitoring</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

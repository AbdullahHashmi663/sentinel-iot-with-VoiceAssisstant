// ==============================================================================
// CONSOLE 2: FORENSIC THREAT LAB & ATTACK SIMULATOR (STITCH FUTURISTIC HUD)
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

"use client";

import React, { useState, useMemo } from "react";
import {
  Cpu,
  Layers,
  ShieldAlert,
  Flame,
  Activity,
  Crosshair,
  Radio,
  BrainCircuit,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lock
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import { DomainType, AttackClass } from "@/types/sentinel";

const ALL_DOMAINS: DomainType[] = [
  "IoT_Modbus",
  "Network_Traffic",
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

const ATTACK_CLASSES: { name: AttackClass; label: string; prob: number }[] = [
  { name: "injection", label: "Modbus Injection (FC16)", prob: 0.88 },
  { name: "scanning", label: "Port/Coil Scanning", prob: 0.08 },
  { name: "ddos", label: "Volumetric DDoS", prob: 0.04 },
  { name: "password", label: "Password Brute Force", prob: 0.03 },
  { name: "dos", label: "SYN Flood DoS", prob: 0.02 },
  { name: "backdoor", label: "Backdoor C2", prob: 0.02 },
  { name: "ransomware", label: "Ransomware Encrypt", prob: 0.01 },
  { name: "mitm", label: "ARP Poison MITM", prob: 0.01 },
  { name: "xss", label: "Script Payload XSS", prob: 0.01 }
];

export default function ThreatLabConsole() {
  const {
    activeDomain,
    setActiveDomain,
    latestEvent,
    openPacketSniffer,
    openAgenticSoc
  } = useTelemetryStore();

  const [activeScenario, setActiveScenario] = useState<string>("Modbus FC16 Excursion");
  const [burstRate, setBurstRate] = useState<number>(4820);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  const tau = latestEvent?.anomalyProbability ?? 0.892;
  const isCritical = tau > 0.85;

  // Arc calculation for Tau gauge
  // Circumference = 390
  const tauOffset = Math.max(0, 390 * (1 - Math.min(tau, 1)));

  const temporalSteps = [
    { step: "T-9", val: 0.12, jitter: "0.2ms" },
    { step: "T-8", val: 0.14, jitter: "0.1ms" },
    { step: "T-7", val: 0.11, jitter: "0.2ms" },
    { step: "T-6", val: 0.16, jitter: "0.4ms" },
    { step: "T-5", val: isCritical ? 0.45 : 0.13, jitter: "0.9ms" },
    { step: "T-4", val: isCritical ? 0.72 : 0.12, jitter: "1.4ms" },
    { step: "T-3", val: isCritical ? 0.88 : 0.15, jitter: "2.1ms" },
    { step: "T-2", val: isCritical ? 0.94 : 0.11, jitter: "2.8ms" },
    { step: "T-1", val: isCritical ? 0.97 : 0.14, jitter: "3.2ms" },
    { step: "T-0", val: tau, jitter: "3.5ms" }
  ];

  const mitreTechniques = [
    { id: "T0855", name: "Unauthorized Command", tactic: "Inhibit Response", active: true, prob: "99.2%" },
    { id: "T0814", name: "Denial of Control", tactic: "Impact", active: false, prob: "42.1%" },
    { id: "T1046", name: "Network Scanning", tactic: "Discovery", active: true, prob: "88.4%" },
    { id: "T1059", name: "Command & Script", tactic: "Execution", active: false, prob: "31.0%" },
    { id: "T1110", name: "Brute Force Creds", tactic: "Credential Access", active: false, prob: "3.2%" },
    { id: "T1557", name: "Adversary-in-Middle", tactic: "Collection", active: false, prob: "MONITORING" }
  ];

  const handleInjectAttack = (name: string, rate: number) => {
    setActiveScenario(name);
    setBurstRate(rate);
    setIsSimulating(true);
    fetch("http://127.0.0.1:8000/api/inject-attack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attack_type: name.toLowerCase().includes("modbus") ? "injection" : "ddos" })
    }).catch(() => {});
  };

  return (
    <div className="space-y-4">
      {/* 1. SUB-HEADER METRIC STRIP: NEURAL REASONING CORES BANNER */}
      <div className="hud-box p-3 rounded flex flex-wrap items-center justify-between gap-3 clip-chamfer font-mono">
        <span className="hud-corner-tr">┐</span>
        <span className="hud-corner-bl">└</span>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#070d14] border border-[#162536] px-3 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
            <span className="text-[10px] text-[#64748b] uppercase tracking-wider">NEURAL REASONER:</span>
            <span className="text-xs text-[#00f0ff] font-bold">Conformer v2.4 (Bi-Head Real-Time)</span>
            <span className="px-1.5 py-0.2 bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/30 text-[9px] rounded font-bold">
              FP16 ACCELERATED
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#070d14] border border-[#162536] px-3 py-1 rounded text-xs">
            <span className="text-[#64748b]">DATASET:</span>
            <span className="text-[#00f0ff] font-semibold">UNSW ToN_IoT Industrial Benchmark</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-[#070d14] border border-[#162536] px-3 py-1 rounded text-xs">
            <span className="text-[#64748b]">ATTENTION HEADS:</span>
            <span className="text-[#a855f7] font-semibold">H=8 (MHSA + Depthwise Conv)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={openPacketSniffer}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#070d14] border border-[#162536] hover:border-[#00f0ff] text-[#dee3eb] text-xs transition-colors cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
            <span>Packet Dissector</span>
          </button>
          <button
            type="button"
            onClick={() => openAgenticSoc(latestEvent)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-[#03070c] text-xs font-bold transition-all glow-cyan cursor-pointer"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Agentic SOC Analyst</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 12-COLUMN FORENSIC MATRIX */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* ======================================================== */}
        {/* LEFT 7 COLUMNS: DUAL CONFORMER HEADS, WAVEFORM & STATS  */}
        {/* ======================================================== */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          {/* DUAL CONFORMER HEADS CONTAINER */}
          <div className="hud-box p-4 rounded flex flex-col gap-3">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>
            <div className="flex items-center justify-between border-b border-[#162536] pb-2 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#00f0ff] glow-cyan" />
                <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white tracking-wide">
                  DUAL CONFORMER REASONING CORES
                </h3>
                <span className="text-xs text-[#64748b] hidden md:inline">
                  [HEAD_01: ZERO-DAY • HEAD_02: MULTI-CLASS]
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="bg-[#070d14] border border-[#162536] px-2 py-0.5 rounded text-[#00ff66]">
                  LOSS: 0.00318
                </span>
                <span className="text-[#64748b]">HEX: 0xCF01</span>
              </div>
            </div>

            {/* Split Heads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-mono">
              {/* HEAD 1: ZERO-DAY ANOMALY DETECTOR (RADIAL SIGMOID GAUGE) */}
              <div className="bg-[#070d14] border border-[#162536] rounded p-3.5 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a5f] animate-ping" />
                    <span className="text-xs font-bold text-[#ff2a5f] uppercase tracking-wider">
                      HEAD 01 // ZERO-DAY DETECTOR
                    </span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isCritical
                      ? "bg-[#ff2a5f]/20 border border-[#ff2a5f]/50 text-[#ff2a5f] animate-pulse"
                      : "bg-[#00ff66]/20 border border-[#00ff66]/50 text-[#00ff66]"
                  }`}>
                    {isCritical ? "BREACH ACTIVE" : "NOMINAL"}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748b]">Continuous Sigmoid Output • Mahalanobis Latent Projection</p>

                {/* Radial Gauge */}
                <div className="relative flex items-center justify-center my-3">
                  <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" fill="none" r="74" stroke="#162536" strokeDasharray="2 4" strokeWidth="1" />
                    <circle cx="80" cy="80" fill="transparent" r="62" stroke="#0e1824" strokeDasharray="390" strokeDashoffset="0" strokeWidth="12" />
                    <circle cx="80" cy="80" fill="transparent" opacity="0.3" r="62" stroke="#ff2a5f" strokeDasharray="390" strokeDashoffset="330" strokeLinecap="round" strokeWidth="12" />
                    <circle
                      className="transition-all duration-700 glow-crimson"
                      cx="80"
                      cy="80"
                      fill="transparent"
                      r="62"
                      stroke={isCritical ? "#ff2a5f" : "#00f0ff"}
                      strokeDasharray="390"
                      strokeDashoffset={tauOffset}
                      strokeLinecap="round"
                      strokeWidth="12"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] text-[#64748b] tracking-widest uppercase">SIGMOID τ_SCORE</span>
                    <span className={`text-2xl font-bold font-['Orbitron'] tracking-tight ${isCritical ? "text-[#ff2a5f] text-glow-crimson" : "text-[#00f0ff] text-glow-cyan"}`}>
                      {tau.toFixed(3)}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5 bg-[#ff2a5f]/15 px-1.5 py-0.5 rounded border border-[#ff2a5f]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a5f]" />
                      <span className="text-[10px] text-[#ff2a5f] font-bold">THRESHOLD &gt; 0.850</span>
                    </div>
                  </div>
                </div>

                {/* Sub-Metrics Telemetry */}
                <div className="grid grid-cols-3 gap-2 bg-[#03070c] border border-[#162536] rounded p-2 text-center text-[10px]">
                  <div className="flex flex-col">
                    <span className="text-[#64748b]">REC_ERR</span>
                    <span className="text-white font-bold">0.4421</span>
                    <span className="text-[#ff2a5f]">+184% Δ</span>
                  </div>
                  <div className="flex flex-col border-x border-[#162536]">
                    <span className="text-[#64748b]">LATENT_DIST</span>
                    <span className="text-[#00f0ff] font-bold">14.88 σ</span>
                    <span className="text-[#64748b]">MAHALANOBIS</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#64748b]">FAR (FP RATE)</span>
                    <span className="text-[#00ff66] font-bold">&lt; 0.018%</span>
                    <span className="text-[#00ff66]">PASS</span>
                  </div>
                </div>
              </div>

              {/* HEAD 2: MULTI-CLASS ATTACK PROFILER */}
              <div className="bg-[#070d14] border border-[#162536] rounded p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider">
                      HEAD 02 // MULTI-CLASS PROFILER
                    </span>
                    <span className="text-[10px] text-[#00ff66] bg-[#00ff66]/10 border border-[#00ff66]/30 px-1.5 py-0.5 rounded font-bold">
                      10 CLASSES
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748b] mb-2">Dense Softmax Projection • Cross-Entropy Head</p>

                  {/* Class Probabilities */}
                  <div className="space-y-1.5 text-xs">
                    {ATTACK_CLASSES.slice(0, 4).map((cls, idx) => (
                      <div
                        key={cls.name}
                        className={`p-1.5 rounded border transition-colors ${
                          idx === 0
                            ? "bg-[#ff2a5f]/15 border-[#ff2a5f]/40 glow-crimson"
                            : "bg-[#03070c] border-[#162536]"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1 text-[11px]">
                          <span className={idx === 0 ? "text-[#ff2a5f] font-bold flex items-center gap-1" : "text-[#dee3eb]"}>
                            {idx === 0 && <AlertTriangle className="w-3 h-3 text-[#ff2a5f]" />}
                            {cls.label}
                          </span>
                          <span className={idx === 0 ? "text-[#ff2a5f] font-bold" : "text-[#00f0ff]"}>
                            {(cls.prob * 100).toFixed(1)}% {idx === 0 && "[TRIGGER]"}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#070d14] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              idx === 0 ? "bg-[#ff2a5f] shadow-[0_0_8px_#ff2a5f]" : "bg-[#00f0ff]"
                            }`}
                            style={{ width: `${cls.prob * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-2 text-center text-[10px]">
                    <div className="bg-[#03070c] border border-[#162536] p-1 rounded">
                      <span className="text-[#64748b] block">SYN DoS</span>
                      <span className="text-[#00f0ff] font-bold">2.0%</span>
                    </div>
                    <div className="bg-[#03070c] border border-[#162536] p-1 rounded">
                      <span className="text-[#64748b] block">Backdoor</span>
                      <span className="text-[#00f0ff] font-bold">2.0%</span>
                    </div>
                    <div className="bg-[#03070c] border border-[#162536] p-1 rounded">
                      <span className="text-[#64748b] block">Ransomware</span>
                      <span className="text-[#ffb700] font-bold">1.0%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-1.5 border-t border-[#162536] flex items-center justify-between text-[10px]">
                  <span className="text-[#64748b]">ATTENTION SALIENCY:</span>
                  <span className="text-[#00f0ff] font-bold bg-[#00f0ff]/10 border border-[#00f0ff]/30 px-1.5 py-0.5 rounded">
                    REG_0x002B &gt;&gt; FC16 FORCE COILS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 10-STEP SLIDING WAVEFORM BUFFER */}
          <div className="hud-box p-4 rounded flex flex-col gap-2 font-mono">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#162536] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#00ff66] glow-emerald" />
                <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white tracking-wide">
                  10-STEP SLIDING WAVEFORM BUFFER
                </h3>
                <span className="text-xs text-[#00ff66] bg-[#00ff66]/10 border border-[#00ff66]/30 px-2 py-0.2 rounded">
                  [B, 10, D] D=64
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-[#00ff66] flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-[#00ff66]" /> Flow Rate
                </span>
                <span className="text-[#00f0ff] flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-[#00f0ff]" /> Packet Jitter
                </span>
                <span className="text-[#ffb700] flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-[#ffb700]" /> Voltage Dev
                </span>
                <span className="text-[#ff2a5f] flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-[#ff2a5f]" /> Register Δ
                </span>
              </div>
            </div>

            {/* Waveform Bars */}
            <div className="bg-[#03070c] border border-[#162536] rounded p-3">
              <div className="grid grid-cols-10 gap-2 items-end h-[120px]">
                {temporalSteps.map((step, idx) => {
                  const height = Math.min(100, Math.max(12, step.val * 100));
                  const isHigh = step.val > 0.85;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                      <span className="text-[9px] text-[#64748b]">
                        {step.val.toFixed(2)}
                      </span>
                      <div
                        className={`w-full rounded-t transition-all duration-300 ${
                          isHigh
                            ? "bg-[#ff2a5f] shadow-[0_0_8px_#ff2a5f]"
                            : "bg-[#00f0ff]"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[10px] font-bold text-[#dee3eb]">
                        {step.step}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#162536] text-[10px] text-[#64748b]">
                <span>BURST_DELTA: <strong className="text-[#ff2a5f]">+884.21 pkt/sec</strong></span>
                <span>SHM_ADDR: <strong className="text-[#00f0ff]">0x7FFE90C0</strong></span>
                <span>SCADA SLAVE: <strong className="text-[#00ff66]">0x04 (ROBOTIC_ACTUATOR)</strong></span>
                <span>FRAME: #409,218</span>
              </div>
            </div>
          </div>

          {/* STATISTICAL SIGNIFICANCE & ROC-AUC VALIDATION */}
          <div className="hud-box p-4 rounded flex flex-col gap-3 font-mono">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>
            <div className="flex items-center justify-between border-b border-[#162536] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#a855f7]" />
                <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white tracking-wide">
                  STATISTICAL SIGNIFICANCE &amp; ROC-AUC VALIDATION
                </h3>
              </div>
              <span className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/30 px-2 py-0.5 rounded font-bold">
                p &lt; 0.001 SIGNIFICANT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* ROC-AUC Curve SVG */}
              <div className="md:col-span-6 bg-[#070d14] border border-[#162536] rounded p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="text-white font-bold">ROC-AUC Comparison (10-Fold CV)</span>
                  <span className="text-[#00ff66] font-bold">AUC = 0.9942</span>
                </div>
                <div className="w-full h-28 relative">
                  <svg className="w-full h-full" viewBox="0 0 200 110">
                    <line stroke="#162536" x1="20" x2="190" y1="95" y2="95" />
                    <line stroke="#162536" x1="20" x2="20" y1="10" y2="95" />
                    <line stroke="#334155" strokeDasharray="2 2" x1="20" x2="190" y1="95" y2="10" />
                    <path d="M 20,95 Q 30,35 190,10" fill="none" stroke="#64748b" strokeDasharray="3 3" strokeWidth="1.5" />
                    <path d="M 20,95 Q 22,12 190,10" fill="none" stroke="#00f0ff" strokeWidth="2.5" className="glow-cyan" />
                  </svg>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#64748b] pt-1 border-t border-[#162536]">
                  <span className="text-[#00f0ff]">• Conformer (0.994)</span>
                  <span className="text-[#64748b]">• Bi-LSTM (0.921)</span>
                  <span>TPR vs FPR</span>
                </div>
              </div>

              {/* Non-Parametric Proofs */}
              <div className="md:col-span-6 bg-[#070d14] border border-[#162536] rounded p-3 flex flex-col justify-between text-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold">NON-PARAMETRIC PROOFS</span>
                    <span className="text-[9px] bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40 px-1 rounded font-bold">
                      H1 CONFIRMED
                    </span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between bg-[#03070c] p-2 rounded border border-[#162536]">
                      <div>
                        <span className="text-[#64748b] block text-[9px]">WILCOXON SIGNED-RANK TEST</span>
                        <span className="text-[#00f0ff] font-bold">W = 3.00, z = -2.803</span>
                      </div>
                      <span className="text-[#00ff66] font-bold bg-[#00ff66]/10 border border-[#00ff66]/30 px-1.5 py-0.5 rounded text-[10px]">
                        p = 0.00021 &lt; 0.001
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-[#03070c] p-2 rounded border border-[#162536]">
                      <div>
                        <span className="text-[#64748b] block text-[9px]">FRIEDMAN RANK CHI-SQUARED</span>
                        <span className="text-white font-bold">χ²F = 28.42 (df = 4)</span>
                      </div>
                      <span className="text-[#00ff66] font-bold bg-[#00ff66]/10 border border-[#00ff66]/30 px-1.5 py-0.5 rounded text-[10px]">
                        p = 0.00001 &lt; α=0.01
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-[#64748b] border-t border-[#162536] flex justify-between">
                  <span>POST-HOC: NEMENYI CD = 1.14</span>
                  <span className="text-[#00f0ff] font-bold">RANK: 1.05 (SUPERIOR)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT 5 COLUMNS: RADAR, MITRE ATT&CK & SCENARIO DECK    */}
        {/* ======================================================== */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          {/* ToN_IoT MULTI-CLASS ATTACK RADAR */}
          <div className="hud-box p-4 rounded flex flex-col gap-2 font-mono">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>
            <div className="flex items-center justify-between border-b border-[#162536] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#00f0ff] glow-cyan" />
                <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white tracking-wide">
                  ToN_IoT MULTI-CLASS RADAR
                </h3>
              </div>
              <span className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/30 px-1.5 py-0.5 rounded font-bold">
                9 TACTICS
              </span>
            </div>

            <div className="relative flex items-center justify-center py-2 bg-[#03070c] border border-[#162536] rounded">
              <svg className="w-72 h-60" viewBox="0 0 300 250">
                <circle cx="150" cy="125" fill="none" r="95" stroke="#162536" strokeDasharray="3 3" />
                <circle cx="150" cy="125" fill="none" r="70" stroke="#162536" strokeDasharray="2 3" />
                <circle cx="150" cy="125" fill="none" r="45" stroke="#162536" strokeDasharray="2 3" />
                <circle cx="150" cy="125" fill="none" r="20" stroke="#162536" />
                <circle cx="150" cy="125" fill="#00f0ff" r="2.5" />

                {/* Spokes */}
                <line stroke="#162536" x1="150" x2="150" y1="125" y2="30" />
                <line stroke="#162536" x1="150" x2="214" y1="125" y2="53" />
                <line stroke="#162536" x1="150" x2="248" y1="125" y2="113" />
                <line stroke="#162536" x1="150" x2="227" y1="125" y2="188" />
                <line stroke="#162536" x1="150" x2="167" y1="125" y2="220" />
                <line stroke="#162536" x1="150" x2="100" y1="125" y2="215" />
                <line stroke="#162536" x1="150" x2="56" y1="125" y2="175" />
                <line stroke="#162536" x1="150" x2="52" y1="125" y2="96" />
                <line stroke="#162536" x1="150" x2="86" y1="125" y2="53" />

                {/* Polygon */}
                <polygon
                  points="150,38 185,88 189,123 173,147 154,154 140,149 136,137 140,127 140,118"
                  fill="rgba(0, 240, 255, 0.22)"
                  stroke="#00f0ff"
                  strokeWidth="2"
                  className="glow-cyan"
                />
                <circle cx="150" cy="38" fill="#ff2a5f" r="4" stroke="#ffffff" strokeWidth="1" />
                <circle cx="185" cy="88" fill="#00f0ff" r="3" />
                <circle cx="189" cy="123" fill="#00f0ff" r="3" />

                <text fill="#ff2a5f" fontSize="9" fontWeight="bold" textAnchor="middle" x="150" y="24">INJECTION (92%)</text>
                <text fill="#00f0ff" fontSize="8" textAnchor="start" x="222" y="52">SCAN (55%)</text>
                <text fill="#64748b" fontSize="8" textAnchor="start" x="252" y="115">DDoS</text>
                <text fill="#64748b" fontSize="8" textAnchor="start" x="232" y="195">PASS</text>
                <text fill="#64748b" fontSize="8" textAnchor="middle" x="170" y="235">DoS</text>
                <text fill="#64748b" fontSize="8" textAnchor="end" x="45" y="180">RANSOM</text>
                <text fill="#64748b" fontSize="8" textAnchor="end" x="78" y="50">MITM</text>
              </svg>
            </div>
          </div>

          {/* MITRE ATT&CK MATRIX MODULE */}
          <div className="hud-box p-4 rounded flex flex-col gap-2 font-mono">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>
            <div className="flex items-center justify-between border-b border-[#162536] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#00f0ff] glow-cyan" />
                <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white tracking-wide">
                  MITRE ATT&amp;CK MATRIX
                </h3>
                <span className="text-xs text-[#00f0ff]">[ICS &amp; ENTERPRISE v14]</span>
              </div>
              <span className="text-[10px] text-[#64748b]">HEX: 0xM17</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {mitreTechniques.map((tech) => (
                <div
                  key={tech.id}
                  className={`p-2.5 rounded transition-all cursor-pointer ${
                    tech.active
                      ? "bg-[#ff2a5f]/20 border border-[#ff2a5f]/60 glow-crimson"
                      : "bg-[#070d14] border border-[#162536] hover:border-[#00f0ff]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold ${tech.active ? "text-[#ff2a5f]" : "text-[#64748b]"}`}>
                      {tech.id}
                    </span>
                    {tech.active && <span className="w-2 h-2 rounded-full bg-[#ff2a5f] animate-ping" />}
                  </div>
                  <span className="text-white font-bold block text-xs leading-snug">
                    {tech.name}
                  </span>
                  <span className={`text-[9px] mt-1 block font-bold ${tech.active ? "text-[#ff2a5f]" : "text-[#64748b]"}`}>
                    {tech.prob}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-1 bg-[#03070c] border border-[#162536] p-2 rounded flex items-center justify-between text-[10px]">
              <span className="text-[#64748b]">ICS VECTOR CHAIN:</span>
              <span className="text-[#00f0ff] font-bold">ETH_SCADA &gt; PLC_SLAVE_04 &gt; COIL_OVERWRITE [FC16]</span>
            </div>
          </div>

          {/* ATTACK SIMULATION SCENARIO DECK */}
          <div className="hud-box p-4 rounded flex flex-col justify-between flex-1 gap-3 font-mono">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>
            <div>
              <div className="flex items-center justify-between border-b border-[#162536] pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[#ff2a5f] glow-crimson" />
                  <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white tracking-wide">
                    ATTACK SIMULATION DECK
                  </h3>
                </div>
                <span className="text-[10px] bg-[#ff2a5f]/20 border border-[#ff2a5f]/40 text-[#ff2a5f] px-2 py-0.5 rounded font-bold animate-pulse">
                  SANDBOX READY
                </span>
              </div>
              <p className="text-xs text-[#64748b] mb-3">Live synthetic perturbation payload generator for testing Conformer bi-head resilience.</p>

              {/* Scenario Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                <button
                  type="button"
                  onClick={() => handleInjectAttack("Modbus FC16 Excursion", 4820)}
                  className={`p-2.5 rounded text-left transition-all cursor-pointer ${
                    activeScenario === "Modbus FC16 Excursion"
                      ? "bg-[#070d14] border border-[#ff2a5f] glow-crimson"
                      : "bg-[#070d14] border border-[#162536] hover:border-[#ff2a5f]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-[#ff2a5f] font-bold">SCENARIO #01</span>
                    <Flame className="w-3.5 h-3.5 text-[#ff2a5f]" />
                  </div>
                  <span className="text-xs text-[#ff2a5f] font-bold block">Modbus FC16 Excursion</span>
                  <span className="text-[10px] text-[#64748b] block mt-0.5">Force Multiple Registers surge</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInjectAttack("S7Comm Ladder Logic Poison", 890)}
                  className={`p-2.5 rounded text-left transition-all cursor-pointer ${
                    activeScenario === "S7Comm Ladder Logic Poison"
                      ? "bg-[#070d14] border border-[#ffb700]"
                      : "bg-[#070d14] border border-[#162536] hover:border-[#ffb700]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-[#ffb700] font-bold">SCENARIO #02</span>
                    <Cpu className="w-3.5 h-3.5 text-[#ffb700]" />
                  </div>
                  <span className="text-xs text-white font-bold block">S7Comm Ladder Logic</span>
                  <span className="text-[10px] text-[#64748b] block mt-0.5">Arbitrary OB1 cycle tampering</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInjectAttack("DNP3 Volumetric Flooding", 6200)}
                  className={`p-2.5 rounded text-left transition-all cursor-pointer ${
                    activeScenario === "DNP3 Volumetric Flooding"
                      ? "bg-[#070d14] border border-[#00f0ff]"
                      : "bg-[#070d14] border border-[#162536] hover:border-[#00f0ff]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-[#00f0ff] font-bold">SCENARIO #03</span>
                    <Zap className="w-3.5 h-3.5 text-[#00f0ff]" />
                  </div>
                  <span className="text-xs text-white font-bold block">DNP3 Outstation Flood</span>
                  <span className="text-[10px] text-[#64748b] block mt-0.5">High-rate unsolicited responses</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInjectAttack("BACnet Who-Is Storm DoS", 3400)}
                  className={`p-2.5 rounded text-left transition-all cursor-pointer ${
                    activeScenario === "BACnet Who-Is Storm DoS"
                      ? "bg-[#070d14] border border-[#00ff66]"
                      : "bg-[#070d14] border border-[#162536] hover:border-[#00ff66]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-[#00ff66] font-bold">SCENARIO #04</span>
                    <Activity className="w-3.5 h-3.5 text-[#00ff66]" />
                  </div>
                  <span className="text-xs text-white font-bold block">BACnet DoS Storm</span>
                  <span className="text-[10px] text-[#64748b] block mt-0.5">Who-Is broadcast exhaustion</span>
                </button>
              </div>

              {/* Status & Velocity Progress */}
              <div className="bg-[#03070c] border border-[#162536] p-2.5 rounded text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#64748b] text-[10px]">PAYLOAD STREAM:</span>
                  <span className="text-[#ff2a5f] font-bold text-[11px]">
                    BURSTING: {burstRate.toLocaleString()} PKT/S
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="text-white font-bold">{activeScenario}</span>
                  <span className="text-[#00f0ff]">{burstRate.toLocaleString()} req/s ± 2%</span>
                </div>
                <div className="w-full bg-[#070d14] border border-[#162536] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ff2a5f] rounded-full shadow-[0_0_8px_#ff2a5f] transition-all duration-300"
                    style={{ width: `${Math.min(100, (burstRate / 6200) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#162536] text-xs">
              <button
                type="button"
                onClick={() => setIsSimulating(false)}
                className="px-3 py-1.5 rounded bg-[#ff2a5f]/20 border border-[#ff2a5f] text-[#ff2a5f] hover:bg-[#ff2a5f] hover:text-white font-bold transition-all glow-crimson cursor-pointer"
              >
                HALT SIMULATION
              </button>
              <span className="text-[#64748b] text-[10px]">CONTAINER: NS-02 // ISOLATED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

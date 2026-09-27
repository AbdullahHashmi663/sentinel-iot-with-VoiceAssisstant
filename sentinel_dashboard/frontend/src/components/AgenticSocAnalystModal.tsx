// ==============================================================================
// SENTINEL-IOT: AGENTIC SOC ANALYST BRIEFING & WAR ROOM (MODAL)
// Stitch Agentic SOC Analyst Briefing Modal Futuristic HUD
// Autonomous Agent Swarm Deliberation, MITRE ATT&CK for ICS, CoT Trace & Remediation Approver
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useTelemetryStore } from "@/store/useTelemetryStore";

interface AgenticSocAnalystModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident?: any;
}

export default function AgenticSocAnalystModal({
  isOpen,
  onClose,
  incident
}: AgenticSocAnalystModalProps) {
  const [activeTab, setActiveTab] = useState<"warroom" | "sigma" | "yara">("warroom");
  const [isExecutingTrip, setIsExecutingTrip] = useState<boolean>(false);
  const [tripExecuted, setTripExecuted] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const { startInterlockCountdown } = useTelemetryStore();

  const incidentId = incident?.id || "INC-2025-0842-X";
  const targetIp = incident?.sourceIp || "192.168.100.45";

  if (!isOpen) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleExecuteTrip = () => {
    setIsExecutingTrip(true);
    startInterlockCountdown(targetIp);
    setTimeout(() => {
      setIsExecutingTrip(false);
      setTripExecuted(true);
    }, 1000);
  };

  const sigmaContent = `title: Autonomous Sentinel-IoT Detection - Modbus FC16 Excursion
id: 98a72b01-modbus-fc16-excursion
status: production
description: Generated autonomously by Sentinel-IoT Conformer Engine based on gradient attribution.
author: Sentinel-IoT Autonomous SOC Agent
date: ${new Date().toISOString().split("T")[0]}
references:
    - https://sentinel-iot.internal/audit/${incidentId}
logsource:
    category: industrial_network
    product: modbus_tcp
detection:
    selection:
        Source_IP: '${targetIp}'
        Function_Code: 16
        Coil_Address: '0x002B'
        Anomaly_Tau_gte: 0.850
    condition: selection
level: critical
tags:
    - attack.impact
    - attack.t0855
    - nist.sc-5
    - iec62443.sl3`;

  const yaraContent = `rule Sentinel_IoT_Modbus_Actuator_Excursion {
    meta:
        description = "Autonomous memory & wire signature for ${incidentId}"
        author = "Sentinel-IoT Conformer Engine"
        date = "${new Date().toISOString().split("T")[0]}"
        hash_proof = "d3b07384d113edec49eaa6238ad5ff00"
        severity = "SEV-1 CRITICAL"
        tau_anomaly = "0.942"

    strings:
        $fc16_header = { 00 00 00 00 00 0D 01 10 00 2B 00 06 0C }
        $excessive_pressure = { 44 7A 00 00 7F FF 00 00 80 00 00 00 }
        $target_ip = "${targetIp}" ascii

    condition:
        uint16(0) == 0x0000 and (2 of ($fc16_header, $excessive_pressure, $target_ip))
}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#03070c]/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="hud-box w-full max-w-7xl bg-[#0b131e]/95 backdrop-blur-2xl border border-[#00f0ff]/40 rounded-lg shadow-[0_0_40px_rgba(0,240,255,0.18)] p-4 lg:p-6 flex flex-col gap-4 relative overflow-hidden my-4 max-h-[95vh] overflow-y-auto">
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />

        {/* Ambient glow backgrounds */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#ff2a5f]/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* TOP HEADER */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-[#162536] relative z-10">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#ff2a5f]/20 border border-[#ff2a5f] text-[#ff2a5f] shadow-[0_0_15px_rgba(255,42,95,0.35)]">
                <span className="w-2 h-2 rounded-full bg-[#ff2a5f] animate-ping"></span>
                <span className="font-mono text-[10px] font-bold tracking-wider">
                  SEV-1 CRITICAL // ZERO-DAY ACTUATOR EXCURSION
                </span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#070d14] border border-[#162536] text-[#00f0ff]">
                <span className="material-symbols-outlined text-[13px]">token</span>
                <span className="font-mono text-[10px] font-bold">{incidentId}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#070d14] border border-[#00ff66]/40 text-[#00ff66] font-mono text-[10px] shadow-[0_0_10px_rgba(0,255,102,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse"></span>
                <span>QUORUM REACHED: 99.82% SWARM CONFIDENCE</span>
              </div>
              <span className="text-[10px] font-mono text-[#64748b]">0x7F2A::SYS</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mt-1">
              <h1 className="font-['Orbitron'] text-lg md:text-xl text-[#dbfcff] tracking-tight font-bold m-0 leading-tight">
                SENTINEL AGENTIC SOC <span className="text-[#00f0ff] font-mono text-base">// AUTONOMOUS WAR ROOM</span>
              </h1>
              <span className="font-mono text-[10px] text-[#dee3eb] bg-[#070d14] px-2 py-0.5 rounded border border-[#162536]">
                TARGET: Modbus Industrial PLC [ToN_IoT #04 - Hydro Turbine Actuator]
              </span>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            {/* View Switchers */}
            <div className="flex items-center gap-1 bg-[#070d14] p-1 rounded border border-[#162536]">
              <button
                onClick={() => setActiveTab("warroom")}
                className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold transition-all ${
                  activeTab === "warroom"
                    ? "bg-[#00f0ff] text-[#00363d]"
                    : "text-[#64748b] hover:text-[#dee3eb]"
                }`}
              >
                WAR ROOM
              </button>
              <button
                onClick={() => setActiveTab("sigma")}
                className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold transition-all ${
                  activeTab === "sigma"
                    ? "bg-[#00f0ff] text-[#00363d]"
                    : "text-[#64748b] hover:text-[#dee3eb]"
                }`}
              >
                SIGMA RULE
              </button>
              <button
                onClick={() => setActiveTab("yara")}
                className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold transition-all ${
                  activeTab === "yara"
                    ? "bg-[#00f0ff] text-[#00363d]"
                    : "text-[#64748b] hover:text-[#dee3eb]"
                }`}
              >
                YARA SIGNATURE
              </button>
            </div>

            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded bg-[#070d14] border border-[#162536] hover:border-[#ff2a5f] hover:bg-[#ff2a5f]/20 text-[#64748b] hover:text-[#ff2a5f] transition-all ml-1"
              title="Close Analyst Room"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* 4-CARD FORENSIC SNAPSHOT STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 rounded bg-[#070d14] border border-[#162536]">
          <div className="flex flex-col px-2 py-1 border-r border-[#162536]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[#64748b]">ATTACK INGRESS</span>
              <span className="font-mono text-[9px] text-[#64748b]">0x01</span>
            </div>
            <span className="font-mono text-xs text-[#ff2a5f] font-bold">{targetIp}:502</span>
            <span className="font-mono text-[9px] text-[#64748b]">MAC 00:1a:2b:3c:4d:5e</span>
          </div>

          <div className="flex flex-col px-2 py-1 border-r border-[#162536]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[#64748b]">FUNCTION CODE</span>
              <span className="font-mono text-[9px] text-[#64748b]">0x02</span>
            </div>
            <span className="font-mono text-xs text-[#00f0ff] font-bold">FC16 (Write Mult Regs)</span>
            <span className="font-mono text-[9px] text-[#64748b]">Coil Reg 0x002B</span>
          </div>

          <div className="flex flex-col px-2 py-1 border-r border-[#162536]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[#64748b]">ANOMALY MAGNITUDE</span>
              <span className="font-mono text-[9px] text-[#64748b]">0x03</span>
            </div>
            <span className="font-mono text-xs text-[#ff2a5f] font-bold">4,800 kPa vs 2,200 kPa</span>
            <span className="font-mono text-[9px] text-[#ff2a5f] font-bold">+118.18% Delta Breach</span>
          </div>

          <div className="flex flex-col px-2 py-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[#64748b]">CURRENT SYSTEM STATE</span>
              <span className="font-mono text-[9px] text-[#64748b]">0x04</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse"></span>
              <span className="font-mono text-xs text-[#00ff66] font-bold">L1 AUTO-CONTAINED</span>
            </div>
            <span className="font-mono text-[9px] text-[#00f0ff]">Dual-Custody Gate Active</span>
          </div>
        </div>

        {/* TAB 1: WAR ROOM MAIN WORKSPACE */}
        {activeTab === "warroom" && (
          <div className="grid grid-cols-12 gap-4">
            {/* LEFT 7 COLS: Autonomous Agent Swarm Deliberation */}
            <div className="col-span-12 xl:col-span-7 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00f0ff] text-[18px]">neurology</span>
                  <span className="font-['Orbitron'] text-xs md:text-sm text-[#dbfcff] font-bold">
                    Autonomous Agent Swarm Deliberation
                  </span>
                </div>
                <span className="font-mono text-[9px] text-[#00f0ff] bg-[#070d14] px-2 py-0.5 rounded border border-[#162536]">
                  CYCLE #49 // CONVERGED [τ=0.942]
                </span>
              </div>

              {/* Swarm Agents Cards */}
              <div className="flex flex-col gap-2">
                {/* Agent 1: Neural Forensic Agent */}
                <div className="p-3 rounded bg-[#070d14] border border-[#ff2a5f]/40 flex flex-col gap-1.5 shadow-[0_0_15px_rgba(255,42,95,0.08)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-[#ff2a5f]/20 border border-[#ff2a5f]/50 flex items-center justify-center text-[#ff2a5f]">
                        <span className="material-symbols-outlined text-[15px]">memory</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#dbfcff]">
                          <span>Neural Forensic Agent</span>
                          <span className="text-[#00f0ff] font-normal text-[10px]">(Conformer v2.4 FP16)</span>
                        </div>
                        <span className="font-mono text-[9px] text-[#64748b]">
                          Temporal Waveform Latent Space Analyzer
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#ff2a5f]/20 border border-[#ff2a5f] text-[#ff2a5f] font-mono text-[9px] font-bold">
                      BREACH DETECTED (99.4%)
                    </span>
                  </div>
                  <p className="font-['Space_Grotesk'] text-[11px] text-[#dee3eb] leading-relaxed pt-1">
                    Temporal attention entropy spiked to{" "}
                    <span className="font-mono text-[#ff2a5f] font-bold bg-[#ff2a5f]/20 px-1 py-0.2 rounded border border-[#ff2a5f]/30">
                      1.42 nats
                    </span>{" "}
                    across timesteps <span className="font-mono text-[#00f0ff]">T-2 to T-0</span>. FC16 Write Multiple Registers payload targets coil register{" "}
                    <span className="font-mono text-[#00ff66] font-bold">0x002B</span> with an out-of-bounds pressure setpoint of{" "}
                    <span className="font-mono text-[#ff2a5f] font-bold">4,800 kPa</span> (nominal safety threshold: 2,200 kPa max). Synthetic packet injection confirmed.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-[9px] text-[#64748b]">
                    <span className="text-[#00f0ff]">INFERENCE LATENCY: 0.78ms</span>
                    <span>•</span>
                    <span>ATTN-HEAD: #6 (TIMESTEP Δ)</span>
                    <span>•</span>
                    <span className="text-[#ff2a5f] font-bold">BACKPROP SALIENCY: 0.961</span>
                  </div>
                </div>

                {/* Agent 2: eBPF Kernel Telemetry Agent */}
                <div className="p-3 rounded bg-[#070d14] border border-[#00f0ff]/30 flex flex-col gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.06)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-[#00f0ff]/20 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
                        <span className="material-symbols-outlined text-[15px]">terminal</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#dbfcff]">
                          <span>eBPF Kernel Telemetry Agent</span>
                          <span className="text-[#00f0ff] font-normal text-[10px]">(sockops kprobe #812)</span>
                        </div>
                        <span className="font-mono text-[9px] text-[#64748b]">
                          Ring0 Syscall & Socket Interceptor
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#00ff66]/20 border border-[#00ff66] text-[#00ff66] font-mono text-[9px] font-bold">
                      CORROBORATED (99.9%)
                    </span>
                  </div>
                  <p className="font-['Space_Grotesk'] text-[11px] text-[#dee3eb] leading-relaxed pt-1">
                    Kernel ring buffer captured line-rate anomalous burst from rogue MAC{" "}
                    <span className="font-mono text-[#00f0ff] font-bold">00:1a:2b:3c:4d:5e</span> (IP {targetIp}). Socket pair bypass detected on PID 4921. Surge recorded at{" "}
                    <span className="font-mono text-[#ff2a5f] font-bold">14,820 pkts/s</span> with zero TCP window scale flags, indicating raw frame injection targeting the Modbus serial bridge.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-[9px] text-[#64748b]">
                    <span className="text-[#00f0ff]">INODE: 492104</span>
                    <span>•</span>
                    <span className="text-[#00f0ff]">AF_XDP UMEM: 256MB SYNCED</span>
                    <span>•</span>
                    <span className="text-[#00ff66] font-bold">CGROUP_V2: RESTRICTED</span>
                  </div>
                </div>

                {/* Agent 3: Safety & Compliance Governor */}
                <div className="p-3 rounded bg-[#070d14] border border-[#ffb700]/40 flex flex-col gap-1.5 shadow-[0_0_15px_rgba(255,183,0,0.06)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-[#ffb700]/20 border border-[#ffb700]/50 flex items-center justify-center text-[#ffb700]">
                        <span className="material-symbols-outlined text-[15px]">verified_user</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#dbfcff]">
                          <span>Safety & Compliance Governor</span>
                          <span className="text-[#ffb700] font-normal text-[10px]">(IEC 62443 / NIST SC-5)</span>
                        </div>
                        <span className="font-mono text-[9px] text-[#64748b]">
                          Deterministic Operational Safety Engine
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#ffb700]/20 border border-[#ffb700] text-[#ffb700] font-mono text-[9px] font-bold">
                      FOUR-EYES INTERLOCK REQUIRED
                    </span>
                  </div>
                  <p className="font-['Space_Grotesk'] text-[11px] text-[#dee3eb] leading-relaxed pt-1">
                    Mitigation enforces the <span className="font-mono text-[#00f0ff] font-bold">Four-Eyes Principle</span> under IEC 62443-4-2 SR 3.1. Air-gap physical tripping of Coil Actuator #3 is mathematically verified safe to execute without cascading downstream electrical grid blackout. Requires human token signature before relay actuation.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-[9px] text-[#64748b]">
                    <span className="text-[#ffb700] font-bold">STANDARD: IEC 62443 SL-3</span>
                    <span>•</span>
                    <span className="text-[#00ff66]">NIST 800-82R3: SC-5 COMPLIANT</span>
                    <span>•</span>
                    <span className="text-[#ff2a5f] font-bold">RISK SCORE: 8.9/10</span>
                  </div>
                </div>
              </div>

              {/* MITRE ATT&CK Correlation Grid */}
              <div className="p-3 rounded bg-[#070d14] border border-[#162536] flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#dbfcff] font-bold">
                    MITRE ATT&CK for ICS Framework Correlation
                  </span>
                  <span className="font-mono text-[9px] text-[#ff2a5f] font-bold bg-[#ff2a5f]/15 px-2 py-0.5 rounded border border-[#ff2a5f]/30">
                    ATTRIBUTION: SANDWORM / APT-33 EMULATION
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                  <div className="p-2 rounded bg-[#0b131e] border border-[#162536] flex flex-col">
                    <span className="font-mono text-[9px] text-[#64748b]">TACTIC</span>
                    <span className="font-mono text-[11px] text-[#dbfcff] font-bold">Impair Process Control</span>
                    <span className="font-mono text-[10px] text-[#00f0ff]">TA0106</span>
                  </div>
                  <div className="p-2 rounded bg-[#0b131e] border border-[#ff2a5f]/40 flex flex-col">
                    <span className="font-mono text-[9px] text-[#64748b]">TECHNIQUE</span>
                    <span className="font-mono text-[11px] text-[#ff2a5f] font-bold">Unauthorized Command</span>
                    <span className="font-mono text-[10px] text-[#ff2a5f]">T0855 (Modbus FC16)</span>
                  </div>
                  <div className="p-2 rounded bg-[#0b131e] border border-[#162536] flex flex-col">
                    <span className="font-mono text-[9px] text-[#64748b]">SECONDARY</span>
                    <span className="font-mono text-[11px] text-[#00ff66] font-bold">Modify Parameter</span>
                    <span className="font-mono text-[10px] text-[#00ff66]">T0836 & T0814</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT 5 COLS: CoT Execution Trace & Remediation Approver */}
            <div className="col-span-12 xl:col-span-5 flex flex-col gap-3">
              {/* Chain-of-Thought Execution Trace */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#00ff66] text-[18px]">conversion_path</span>
                    <span className="font-['Orbitron'] text-xs md:text-sm text-[#dbfcff] font-bold">
                      Chain-of-Thought Execution Trace
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#00f0ff] bg-[#070d14] border border-[#00f0ff]/30 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(0,240,255,0.2)]">
                    21.5 ms MTTR
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 bg-[#070d14] border border-[#162536] p-2.5 rounded font-mono text-[10px]">
                  <div className="flex items-start gap-2 p-1.5 rounded bg-[#0b131e] border border-[#162536]">
                    <span className="text-[#00f0ff] font-bold shrink-0">14:22:07.189</span>
                    <div>
                      <span className="px-1 rounded bg-[#00ff66]/20 text-[#00ff66] font-bold mr-1 border border-[#00ff66]/30">
                        [INGEST]
                      </span>
                      <span className="text-[#dbfcff] font-bold">AF_XDP captures malformed FC16 frame</span>
                      <div className="text-[#64748b] text-[9px]">eth0 socket ring buffer • duration: 3.80ms</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-1.5 rounded bg-[#0b131e] border border-[#ff2a5f]/30">
                    <span className="text-[#ff2a5f] font-bold shrink-0">14:22:07.193</span>
                    <div>
                      <span className="px-1 rounded bg-[#ff2a5f]/20 text-[#ff2a5f] font-bold mr-1 border border-[#ff2a5f]/40">
                        [INFERENCE]
                      </span>
                      <span className="text-[#ff2a5f] font-bold">Conformer anomaly score τ=0.942</span>
                      <div className="text-[#64748b] text-[9px]">Latent threshold 0.850 exceeded • duration: 0.78ms</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-1.5 rounded bg-[#0b131e] border border-[#162536]">
                    <span className="text-[#00f0ff] font-bold shrink-0">14:22:07.194</span>
                    <div>
                      <span className="px-1 rounded bg-[#00f0ff]/20 text-[#00f0ff] font-bold mr-1 border border-[#00f0ff]/40">
                        [XAI BACKPROP]
                      </span>
                      <span className="text-[#00f0ff] font-bold">Saliency maps register 0x002B delta</span>
                      <div className="text-[#64748b] text-[9px]">Pressure anomaly pin-pointed • duration: 0.65ms</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-1.5 rounded bg-[#0b131e] border border-[#162536]">
                    <span className="text-[#00f0ff] font-bold shrink-0">14:22:07.195</span>
                    <div>
                      <span className="px-1 rounded bg-[#070d14] text-[#00f0ff] font-bold mr-1 border border-[#162536]">
                        [AGENT SWARM]
                      </span>
                      <span className="text-[#dee3eb] font-bold">Consensus reached on T0855</span>
                      <div className="text-[#64748b] text-[9px]">3 of 3 agents converged with 99.82% quorum</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-1.5 rounded bg-[#0b131e] border border-[#00ff66]/30">
                    <span className="text-[#00ff66] font-bold shrink-0">14:22:07.210</span>
                    <div>
                      <span className="px-1 rounded bg-[#00ff66]/20 text-[#00ff66] font-bold mr-1 border border-[#00ff66]/40">
                        [AUTO-CONTAIN]
                      </span>
                      <span className="text-[#00ff66] font-bold">eBPF dropped packet; frozen PID 4921</span>
                      <div className="text-[#64748b] text-[9px]">Ring0 cgroup v2 execution barrier • duration: 16.27ms</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-1.5 rounded bg-[#0b131e] border border-[#162536]">
                    <span className="text-[#64748b] font-bold shrink-0">14:22:07.211</span>
                    <div>
                      <span className="px-1 rounded bg-[#070d14] text-[#64748b] font-bold mr-1 border border-[#162536]">
                        [MERKLE COMMIT]
                      </span>
                      <span className="text-[#dee3eb] font-bold">SHA-256 block #1048576 TPM 2.0</span>
                      <div className="text-[#64748b] text-[9px]">Forensic immutable proof anchored to PCR-7</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Autonomous Remediation Approver */}
              <div className="p-3 rounded bg-[#070d14] border border-[#00f0ff]/40 flex flex-col gap-2 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#00f0ff] text-[18px]">enhanced_encryption</span>
                    <span className="font-mono text-xs font-bold text-[#dbfcff]">
                      Autonomous Remediation Approver
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-[#ff2a5f] text-[#070d14] font-mono text-[9px] font-bold">
                    FOUR-EYES INTERLOCK
                  </span>
                </div>

                <div className="flex flex-col gap-1 font-mono text-[10px]">
                  <div className="flex items-center justify-between p-1.5 rounded bg-[#0b131e] border border-[#00ff66]/30">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#00ff66] text-[14px]">check_circle</span>
                      <span className="text-[#dee3eb]">1. Line-rate eBPF XDP DROP ({targetIp})</span>
                    </div>
                    <span className="text-[#00ff66] font-bold">ACTIVE (Ring0)</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded bg-[#0b131e] border border-[#00ff66]/30">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#00ff66] text-[14px]">check_circle</span>
                      <span className="text-[#dee3eb]">2. Quarantined PID 4921 via cgroup-v2 freeze</span>
                    </div>
                    <span className="text-[#00ff66] font-bold">CONFINED</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded bg-[#0b131e] border border-[#00f0ff]/60">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffb700] animate-pulse"></span>
                      <span className="text-[#00f0ff] font-bold">3. Physical Air-Gap Relay Trip (Actuator #3)</span>
                    </div>
                    <span className={`font-bold ${tripExecuted ? "text-[#00ff66]" : "text-[#ff2a5f] animate-pulse"}`}>
                      {tripExecuted ? "AIR-GAP ENGAGED" : "AWAITING TOKEN"}
                    </span>
                  </div>
                </div>

                {/* Hardware Token Field */}
                <div className="flex flex-col gap-1 pt-1 font-mono text-[9px]">
                  <div className="flex items-center justify-between text-[#64748b]">
                    <span>PLANT SAFETY OFFICER HARDWARE TOKEN (ED25519)</span>
                    <span className="text-[#00ff66] font-bold">VERIFIED OPERATOR #99214</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value="[AUTH-SIG-ED25519: 9f8a2c1b..48e309] VALID"
                      className="w-full bg-[#0b131e] border border-[#162536] text-[#00f0ff] font-mono text-[10px] px-2 py-1.5 rounded focus:outline-none"
                    />
                    <button className="px-2.5 py-1.5 bg-[#0b131e] border border-[#162536] text-[#dee3eb] font-mono text-[10px] rounded hover:border-[#00f0ff]">
                      RESYNC
                    </button>
                  </div>
                </div>

                {/* Interlock Action */}
                <button
                  onClick={handleExecuteTrip}
                  disabled={isExecutingTrip || tripExecuted}
                  className={`w-full py-2 px-3 rounded font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                    tripExecuted
                      ? "bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40 cursor-default"
                      : "bg-[#00f0ff] hover:bg-[#00ff66] text-[#00363d] hover:text-[#003911] shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">power_settings_new</span>
                  <span>{isExecutingTrip ? "TRIPPING RELAYS..." : tripExecuted ? "AIR-GAP TRIP COMPLETED (DE-ENERGIZED)" : "EXECUTE DUAL-CUSTODY AIR-GAP TRIP"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SIGMA RULE */}
        {activeTab === "sigma" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-[#64748b]">
                Production Sigma rule generated from first-order gradient attributions for immediate SIEM deployment (Splunk, Elastic, QRadar).
              </p>
              <button
                onClick={() => handleCopy(sigmaContent, "sigma")}
                className="px-3 py-1.5 rounded bg-[#070d14] text-[#00f0ff] font-mono text-xs border border-[#00f0ff]/40 flex items-center gap-1.5 hover:bg-[#162536]"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {copiedType === "sigma" ? "check" : "content_copy"}
                </span>
                <span>{copiedType === "sigma" ? "COPIED" : "COPY YAML"}</span>
              </button>
            </div>
            <pre className="p-4 rounded bg-[#070d14] border border-[#162536] font-mono text-[11px] text-[#00f0ff] overflow-x-auto leading-relaxed max-h-[360px] overflow-y-auto">
              {sigmaContent}
            </pre>
          </div>
        )}

        {/* TAB 3: YARA SIGNATURE */}
        {activeTab === "yara" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-[#64748b]">
                Endpoint memory & process binary detection signature compiled dynamically with cryptographic hash proof.
              </p>
              <button
                onClick={() => handleCopy(yaraContent, "yara")}
                className="px-3 py-1.5 rounded bg-[#070d14] text-[#00f0ff] font-mono text-xs border border-[#00f0ff]/40 flex items-center gap-1.5 hover:bg-[#162536]"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {copiedType === "yara" ? "check" : "content_copy"}
                </span>
                <span>{copiedType === "yara" ? "COPIED" : "COPY YARA"}</span>
              </button>
            </div>
            <pre className="p-4 rounded bg-[#070d14] border border-[#162536] font-mono text-[11px] text-[#ffb700] overflow-x-auto leading-relaxed max-h-[360px] overflow-y-auto">
              {yaraContent}
            </pre>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[#162536] text-[10px] font-mono text-[#64748b]">
          <div className="flex items-center gap-2">
            <span>SENTINEL TRUST LEVEL: AIR-GAPPED EAL6+</span>
            <span>•</span>
            <span>SESSION: SEC-NODE-04-ADMIN</span>
            <span>•</span>
            <span className="text-[#00f0ff]">0x7F2A::SYS</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#00f0ff]">
            <span className="material-symbols-outlined text-[13px]">shield</span>
            <span>FORENSIC LEDGER TPM HASH: d3b07384d113edec49eaa6238ad5ff00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

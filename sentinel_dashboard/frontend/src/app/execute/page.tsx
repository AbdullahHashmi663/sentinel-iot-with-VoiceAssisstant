// ==============================================================================
// SENTINEL-IOT: PCB HARDWARE EXECUTION CANVAS (STAGE ROUTE /execute)
// Stitch Cyber-Physical Silicon Pipeline Topology & Conformer Core Futuristic HUD
// ==============================================================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import BottomNavDock from "@/components/BottomNavDock";
import LeftSidebarNav from "@/components/LeftSidebarNav";

interface IcNodeMeta {
  id: string;
  stage: number;
  stageName: string;
  name: string;
  subname: string;
  codeName: string;
  voltage: string;
  clock: string;
  status: "ACTIVE" | "NOMINAL" | "CRITICAL" | "ARMED";
  statusColor: string;
  formula: string;
  specs: string[];
  code: string;
  latency: string;
  metricLabel: string;
  metricValue: string;
}

const IC_NODES: Record<string, IcNodeMeta> = {
  "IC-01": {
    id: "IC-01",
    stage: 1,
    stageName: "STAGE 01: SENSING",
    name: "Network Flow Ingestion",
    subname: "Raw PCAP & Zeek Connection Stream",
    codeName: "IC-NET-ZEEK-01",
    voltage: "0.85V",
    clock: "450 MHz",
    status: "ACTIVE",
    statusColor: "#00f0ff",
    formula: "F_net = [ts, proto, service, duration, src_bytes, dst_bytes, conn_state, ...]",
    specs: [
      "17 engineered features extracted per network packet flow",
      "Covers Modbus, DNP3, TCP, UDP, and ICMP captures",
      "Includes source/destination IP routing metadata for active firewall drop rules"
    ],
    code: "df = pd.read_csv('cleaned_network_balanced.csv')\nX_features = df.drop(columns=['label', 'type'])",
    latency: "0.082 ms",
    metricLabel: "THROUGHPUT",
    metricValue: "14,820 PKTS/S"
  },
  "IC-02": {
    id: "IC-02",
    stage: 1,
    stageName: "STAGE 01: SENSING",
    name: "Physical IoT Telemetry",
    subname: "Cyber-Physical SCADA Sensors",
    codeName: "IC-IOT-SENS-02",
    voltage: "0.85V",
    clock: "450 MHz",
    status: "ACTIVE",
    statusColor: "#00f0ff",
    formula: "S_iot = [GPS (lat, lon, spd), Modbus (FC, reg), Temp (val, delta), Pressure, Garage, Motion]",
    specs: [
      "Engineered with rolling standard deviations and rate-of-change deltas",
      "Captures transient physical anomalies (sudden Modbus coils, GPS spoofing, thermal shock)",
      "Trained across 7 distinct ToN_IoT physical sensor testbeds"
    ],
    code: "payload = {'device_id': 'plc_turbine_04', 'features': row.values.tolist()}",
    latency: "0.120 ms",
    metricLabel: "POLL RATE",
    metricValue: "1,000 Hz"
  },
  "IC-03": {
    id: "IC-03",
    stage: 1,
    stageName: "STAGE 01: SENSING",
    name: "Host OS Telemetry",
    subname: "Auditd & Syscall Ring-0 Stream",
    codeName: "IC-HOST-OS-03",
    voltage: "0.85V",
    clock: "450 MHz",
    status: "ACTIVE",
    statusColor: "#00f0ff",
    formula: "O_host = [CPU_scheduling, RAM_pages, Disk_IO, Syscall_freq, PID, CMD_entropy]",
    specs: [
      "Covers Linux process/disk/memory and Windows kernels",
      "Maps malicious process IDs for automated SIGKILL termination",
      "Detects stealthy ransomware encryption loops and privilege escalation"
    ],
    code: "metrics = psutil.virtual_memory(); top_procs = psutil.process_iter()",
    latency: "0.145 ms",
    metricLabel: "SYSCALLS",
    metricValue: "88,240 /s"
  },
  "IC-04": {
    id: "IC-04",
    stage: 2,
    stageName: "STAGE 02: TENSOR",
    name: "Leakage-Free MinMax Scaler",
    subname: "Strict Split Transformation",
    codeName: "IC-PREPROC-SCALE-04",
    voltage: "0.85V",
    clock: "450 MHz",
    status: "NOMINAL",
    statusColor: "#00ff66",
    formula: "x' = (x - x_min) / (x_max - x_min + 1e-9) ∈ [0, 1]",
    specs: [
      "13 pre-fitted .joblib scalers loaded dynamically per telemetry source",
      "Prevents feature dominance from high-magnitude metrics (e.g. byte counts)",
      "Zero-delay transformation in < 0.05 ms per sample"
    ],
    code: "scaler = joblib.load('network_scaler.joblib')\nX_scaled = scaler.transform(X)",
    latency: "0.040 ms",
    metricLabel: "RANGE",
    metricValue: "[0.0, 1.0]"
  },
  "IC-05": {
    id: "IC-05",
    stage: 2,
    stageName: "STAGE 02: TENSOR",
    name: "10-Step Sliding Tensor Buffer",
    subname: "Chronological Sequence Window",
    codeName: "IC-SEQ-BUFFER-05",
    voltage: "0.85V",
    clock: "450 MHz",
    status: "NOMINAL",
    statusColor: "#00ff66",
    formula: "X_t = [x_{t-9}, x_{t-8}, ..., x_t] ∈ R^{10 × D}",
    specs: [
      "Eliminates static point-in-time classification blindness",
      "Maintains per-device in-memory circular buffers (maxlen = 10)",
      "Discharges into PyTorch 3D tensor batch [1, 10, D_features]"
    ],
    code: "buf = sequence_buffers[device_id]; buf.append(features)\nif len(buf) == 10: tensor_input = torch.tensor([buf])",
    latency: "0.035 ms",
    metricLabel: "TENSOR SHAPE",
    metricValue: "[1, 10, 64]"
  },
  "IC-06": {
    id: "IC-06",
    stage: 3,
    stageName: "STAGE 03: CONFORMER",
    name: "Google Conformer Core",
    subname: "MHSA + Depthwise Separable Conv1D",
    codeName: "IC-CONF-CORE-06",
    voltage: "0.85V",
    clock: "450 MHz",
    status: "ACTIVE",
    statusColor: "#ffb700",
    formula: "Block(x) = PostLN(FF2(Conv1D(MHSA(FF1(x)) + x)))",
    specs: [
      "Embed dimension d_model = 128, 4 attention heads, 2 stacked Conformer blocks",
      "Captures sharp local transients via Depthwise Conv1D (k=3) without recurrent gate decay",
      "Captures global long-range temporal dependencies over 10 time steps",
      "Statistically superior to GRU, LSTM, and 1D-CNN (Wilcoxon W=0.0, p < 10^-7)"
    ],
    code: "class ConformerSentinelModel(nn.Module):\n  def __init__(self):\n    super().__init__()\n    self.blocks = nn.ModuleList([ConformerBlock(128, 4) for _ in range(2)])",
    latency: "0.780 ms",
    metricLabel: "MACARON PARAMS",
    metricValue: "492,104"
  },
  "IC-07": {
    id: "IC-07",
    stage: 3,
    stageName: "STAGE 03: CONFORMER",
    name: "Saliency Gradient XAI Explainer",
    subname: "Analytical Backprop Attribution",
    codeName: "IC-XAI-SALIENCY-07",
    voltage: "0.85V",
    clock: "450 MHz",
    status: "NOMINAL",
    statusColor: "#00ff66",
    formula: "A_i = (1 / 10) ∑_{t=1}^{10} |∂ŷ_{bin} / ∂X_{t, i}| / ∑_j A_j",
    specs: [
      "Calculated in 0.78 ms directly on CPU / FPGA",
      "99.97% faster than Kernel SHAP (3,120 ms)",
      "Eliminates explainability bottlenecks for real-time edge gateways"
    ],
    code: "model.zero_grad(); anomaly_prob.backward()\ngrads = tensor_input.grad.detach().cpu().numpy()[0]",
    latency: "0.780 ms",
    metricLabel: "SPEEDUP VS SHAP",
    metricValue: "4,000x"
  },
  "IC-08": {
    id: "IC-08",
    stage: 4,
    stageName: "STAGE 04: HEADS",
    name: "Head 1: Zero-Day Anomaly Head",
    subname: "Calibrated Sigmoid Anomaly Score",
    codeName: "IC-HEAD-BINARY-08",
    voltage: "0.85V",
    clock: "450 MHz",
    status: "CRITICAL",
    statusColor: "#ff2a5f",
    formula: "ŷ_{bin} = σ(W_b · e + b_b) ∈ [0, 1] | Threshold τ > 0.85",
    specs: [
      "99.70% binary anomaly accuracy on network flows (F1 = 0.9983)",
      "Calibrated safety tiers: Nominal (< 0.60), Warning (0.60 - 0.85), Critical (> 0.85)",
      "Scores exceeding τ > 0.85 autonomously engage Wazuh Active Response"
    ],
    code: "bin_out = self.binary_head(x)\nprob = torch.sigmoid(bin_out)\nis_anomaly = prob > 0.85",
    latency: "0.025 ms",
    metricLabel: "CALIBRATED τ",
    metricValue: "0.942 [CRIT]"
  },
  "IC-09": {
    id: "IC-09",
    stage: 4,
    stageName: "STAGE 04: HEADS",
    name: "Head 2: Multi-Class Forensic Classifier",
    subname: "Fine-Grained Attack Profiler",
    codeName: "IC-HEAD-FORENSIC-09",
    voltage: "0.85V",
    clock: "450 MHz",
    status: "ACTIVE",
    statusColor: "#00f0ff",
    formula: "ŷ_{mul} = softmax(W_m · e + b_m) ∈ R^K",
    specs: [
      "98.37% average forensic accuracy across all 13 domains",
      "Classifies DDoS, Ransomware, Scanning, Injection, Password, MITM, Backdoor, XSS",
      "Provides probabilistic forensic attribution for SIEM ingestion"
    ],
    code: "mul_out = self.multiclass_head(x)\npred_label = class_names[torch.argmax(mul_out)]",
    latency: "0.030 ms",
    metricLabel: "CONFIDENCE",
    metricValue: "98.92%"
  },
  "IC-10": {
    id: "IC-10",
    stage: 5,
    stageName: "STAGE 05: CONTAIN",
    name: "Autonomous Wazuh Active Response",
    subname: "eBPF XDP DROP & cgroup freeze",
    codeName: "IC-SOAR-WAZUH-10",
    voltage: "0.85V",
    clock: "450 MHz",
    status: "CRITICAL",
    statusColor: "#ff2a5f",
    formula: "MTTR = T_detect + T_xai + T_exec = 21.5 ms << 1,000 ms SLA",
    specs: [
      "Network threats -> Dynamic iptables / Windows Firewall rule insertion (DROP packet)",
      "Host threats -> Compromised process termination (kill -9 <PID>)",
      "Zero human latency required during zero-day outbreak"
    ],
    code: "cmd = f'iptables -A INPUT -s {source_ip} -j DROP'\nsubprocess.run(cmd.split(), capture_output=True)",
    latency: "21.50 ms",
    metricLabel: "TOTAL MTTR",
    metricValue: "21.5 ms"
  },
  "IC-11": {
    id: "IC-11",
    stage: 5,
    stageName: "STAGE 05: CONTAIN",
    name: "GRC Cryptographic Compliance Vault",
    subname: "NIST SP 800-53 & SHA-256 Merkle Ledger",
    codeName: "IC-GRC-MERKLE-11",
    voltage: "0.85V",
    clock: "450 MHz",
    status: "ARMED",
    statusColor: "#00ff66",
    formula: "H_{block} = SHA256(Block_{prev} || Event_{payload} || Nonce)",
    specs: [
      "Auto-maps incident mitigations to NIST SP 800-53 Rev. 5 controls (SC-5, SI-3, AU-9)",
      "Generates mathematically immutable Merkle blockchain receipts",
      "Tamper-proof compliance evidence accepted under ISO/IEC 27001:2022"
    ],
    code: "receipt = generate_merkle_proof(incident_id, threat_type, mitigation_action)",
    latency: "0.850 ms",
    metricLabel: "CHAIN STATUS",
    metricValue: "100% UNBROKEN"
  }
};

export default function ExecuteArchitecturePage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("IC-06");
  const [pulseSpeed, setPulseSpeed] = useState<string>("1.0s");
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  const selectedNode = IC_NODES[selectedNodeId] || IC_NODES["IC-06"];

  const triggerPulse = () => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 1600);
  };

  return (
    <div className="bg-transparent text-[#dee3eb] min-h-screen relative font-['Space_Grotesk'] pb-28">
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none hud-bg-grid opacity-20 z-0"></div>
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed -bottom-40 -right-40 w-[500px] h-[500px] bg-[#00ff66]/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* TOP MASTER HUD HEADER */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-[#03070c]/90 backdrop-blur-xl border-b border-[#00f0ff]/20 shadow-[0_4px_30px_rgba(0,240,255,0.12)]">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded bg-[#07131e] border border-[#00f0ff]/60 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <span className="material-symbols-outlined text-[#00f0ff] text-[22px] animate-pulse">memory</span>
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#00ff66] rounded-full shadow-[0_0_6px_#00ff66]"></span>
                <span className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-[#00f0ff] rounded-full"></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-['Orbitron'] font-black tracking-wider text-[#dbfcff] text-[17px] drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                    SENTINEL-IoT
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff] uppercase tracking-widest font-bold">
                    MK-VII SILICON
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#00ff66] tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping"></span>
                  TACTICAL SOC // ICS DEFENSE ACCELERATOR
                </span>
              </div>
            </div>
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded bg-[#091522] border border-[#162e47]">
              <span className="font-mono text-[10px] text-[#64748b] uppercase tracking-wider">HARDWARE CORE:</span>
              <span className="font-mono text-[11px] text-[#00f0ff] font-bold">FPGA-GEN4-OCTA</span>
              <span className="text-[#00ff66] font-mono text-[10px] border-l border-[#1c3652] pl-2">VCC 0.85V</span>
            </div>
            <div className="hidden 2xl:flex items-center gap-2 px-3 py-1 rounded bg-[#091522] border border-[#162e47]">
              <span className="font-mono text-[10px] text-[#64748b] uppercase">INTERCONNECT LATENCY:</span>
              <span className="font-mono text-[12px] text-[#00ff66] font-bold drop-shadow-[0_0_6px_rgba(0,255,102,0.5)]">
                21.5 ms
              </span>
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-ping"></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#07131e] border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-xs hover:bg-[#162536] transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>RETURN TO SOC RADAR</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="w-full pt-6 px-4 lg:px-6 relative z-10 max-w-[1720px] mx-auto">
        {/* TOP CONTROL & ACCELERATOR TELEMETRY BAR */}
        <div className="w-full bg-[#060e18]/90 backdrop-blur-xl border border-[#00f0ff]/25 rounded-xl p-3.5 mb-4 shadow-[0_0_30px_rgba(0,240,255,0.08)] flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#64748b]">
              <span className="text-[#00ff66] font-bold">NODE_ARRAY: ACCELERATOR-X</span>
              <span className="text-[#162536]">/</span>
              <span className="text-[#ffb700] font-mono">HEX: 0x7FF09A</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-['Orbitron'] text-base md:text-lg tracking-wider text-[#dbfcff] uppercase font-bold flex items-center gap-2 m-0">
                <span className="inline-block w-2.5 h-2.5 bg-[#00f0ff] rotate-45 shadow-[0_0_8px_#00f0ff]"></span>
                Cyber-Physical Silicon Pipeline Topology & Conformer Core
              </h1>
              <span className="px-2 py-0.5 rounded bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-[10px] font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                REV 4.2.0-SILICON
              </span>
            </div>
          </div>

          {/* Trace Prescaler & Pulse Triggers */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center p-0.5 rounded-lg bg-[#030910] border border-[#12283e]">
              {["1.0s", "2.0s", "3.5s"].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPulseSpeed(spd)}
                  className={`px-3 py-1 rounded text-[11px] font-mono tracking-wider transition-all ${
                    pulseSpeed === spd
                      ? "bg-[#00f0ff]/20 text-[#00f0ff] font-bold border border-[#00f0ff]/50 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                      : "text-[#64748b] hover:text-[#dee3eb]"
                  }`}
                >
                  {spd} {spd === "1.0s" ? "REALTIME" : spd === "2.0s" ? "SLOW-MO" : "STEP TRACE"}
                </button>
              ))}
            </div>

            <button
              onClick={triggerPulse}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Orbitron'] text-xs font-black tracking-wider transition-all shadow-lg active:scale-95 ${
                isPulsing
                  ? "bg-[#00ff66] text-[#003911] shadow-[0_0_30px_#00ff66] scale-105"
                  : "bg-gradient-to-r from-[#00f0ff] to-[#00ff66] text-black shadow-[0_0_24px_rgba(0,255,102,0.6)]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>{isPulsing ? "PULSE ENGAGED..." : "FIRE PIPELINE PULSE"}</span>
            </button>
          </div>

          {/* Quick Substrate Telemetry Readings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full xl:w-auto font-mono">
            <div className="px-2.5 py-1 rounded bg-[#030911] border border-[#14283c] flex flex-col">
              <span className="text-[9px] text-[#64748b] uppercase">SYS PIPELINE MTTR</span>
              <span className="text-[#00f0ff] font-bold text-sm tracking-tight drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]">
                21.50 ms
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#030911] border border-[#14283c] flex flex-col">
              <span className="text-[9px] text-[#64748b] uppercase">CLOCK OSCILLATOR</span>
              <span className="text-[#00ff66] font-bold text-sm tracking-tight drop-shadow-[0_0_6px_rgba(0,255,102,0.4)]">
                450.0 MHz
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#030911] border border-[#14283c] flex flex-col">
              <span className="text-[9px] text-[#64748b] uppercase">CONFORMER LATENCY</span>
              <span className="text-[#ffb700] font-bold text-sm tracking-tight">0.78 ms</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#030911] border border-[#14283c] flex flex-col">
              <span className="text-[9px] text-[#64748b] uppercase">FP16 TENSOR BAND</span>
              <span className="text-[#dee3eb] font-bold text-sm tracking-tight">2.84 M/s</span>
            </div>
          </div>
        </div>

        {/* MAIN DUAL-PANE HUD: LEFT SILICON MOTHERBOARD + RIGHT HOLOGRAPHIC INSPECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
          {/* LEFT: SILICON MOTHERBOARD SUBSTRATE (8 COLS) */}
          <div className="lg:col-span-8 flex flex-col bg-[#03070d]/95 border border-[#00f0ff]/30 rounded-xl p-4 relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)]">
            {/* Silkscreen Header */}
            <div className="relative z-10 flex flex-wrap items-center justify-between pb-2 mb-2 bg-[#050f1a] border border-[#11273f] px-3 py-1.5 rounded-lg font-mono text-[10px]">
              <div className="flex items-center gap-3">
                <span className="text-[#00f0ff] font-bold tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse"></span>
                  SILICON WAFER LAYER 01 // 7nm FinFET OPTICAL BUS
                </span>
                <span className="text-[#162536]">|</span>
                <span className="text-[#64748b]">
                  SUBSTRATE: <strong className="text-[#00ff66]">IMMERSION GOLD (ENIG)</strong>
                </span>
              </div>
              <div className="flex items-center gap-4 text-[#64748b]">
                <span>CORE_VOLTAGE: <strong className="text-[#00f0ff]">0.850V</strong></span>
                <span>THERMAL_JUNCTION: <strong className="text-[#ffb700]">42.8°C</strong></span>
                <span>VIAS: <strong className="text-[#00ff66]">4,096 CONNECTED</strong></span>
              </div>
            </div>

            {/* STAGE DESIGNATOR BANNER */}
            <div className="relative z-10 grid grid-cols-5 gap-2 px-1 mb-2 font-mono text-[10px] uppercase font-bold text-center tracking-wider">
              <div className="py-1 px-1 rounded bg-[#061423] border border-[#00ff66]/30 text-[#00ff66]">STAGE 01: SENSING</div>
              <div className="py-1 px-1 rounded bg-[#061423] border border-[#00f0ff]/30 text-[#00f0ff]">STAGE 02: TENSOR</div>
              <div className="py-1 px-1 rounded bg-[#16170d] border border-[#ffb700]/40 text-[#ffb700]">STAGE 03: CONFORMER</div>
              <div className="py-1 px-1 rounded bg-[#061423] border border-[#00f0ff]/30 text-[#dbfcff]">STAGE 04: HEADS</div>
              <div className="py-1 px-1 rounded bg-[#1a0810] border border-[#ff2a5f]/40 text-[#ff2a5f]">STAGE 05: CONTAIN</div>
            </div>

            {/* 5-COLUMN LOGICAL MATRIX OF TRANSLUCENT IC NODES */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-5 gap-3 rounded-lg bg-[#02060b]/90 border border-[#0d2238] p-3 overflow-x-auto min-h-[580px]">
              {/* STAGE 1: SENSING */}
              <div className="flex flex-col gap-3 justify-around">
                {["IC-01", "IC-02", "IC-03"].map((id) => {
                  const node = IC_NODES[id];
                  const isSelected = selectedNodeId === id;
                  return (
                    <div
                      key={id}
                      onClick={() => setSelectedNodeId(id)}
                      className={`cursor-pointer p-3 rounded-lg bg-[#07131e]/85 border transition-all ${
                        isSelected
                          ? "border-[#00f0ff] ring-1 ring-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                          : "border-[#16334f] hover:border-[#00f0ff]/60"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[9px] mb-1">
                        <span className="text-[#00f0ff] font-bold">{node.codeName}</span>
                        <span className="text-[#00ff66]">{node.status}</span>
                      </div>
                      <div className="font-['Orbitron'] text-xs font-bold text-[#dbfcff] leading-snug">
                        {node.name}
                      </div>
                      <p className="font-mono text-[9px] text-[#64748b] mt-1 line-clamp-1">{node.subname}</p>
                      <div className="mt-2 pt-1 border-t border-[#162536] flex justify-between font-mono text-[9px]">
                        <span className="text-[#64748b]">{node.metricLabel}:</span>
                        <span className="text-[#00ff66] font-bold">{node.metricValue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* STAGE 2: TENSOR */}
              <div className="flex flex-col gap-3 justify-around">
                {["IC-04", "IC-05"].map((id) => {
                  const node = IC_NODES[id];
                  const isSelected = selectedNodeId === id;
                  return (
                    <div
                      key={id}
                      onClick={() => setSelectedNodeId(id)}
                      className={`cursor-pointer p-3 rounded-lg bg-[#07131e]/85 border transition-all ${
                        isSelected
                          ? "border-[#00ff66] ring-1 ring-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.4)]"
                          : "border-[#16334f] hover:border-[#00ff66]/60"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[9px] mb-1">
                        <span className="text-[#00ff66] font-bold">{node.codeName}</span>
                        <span className="text-[#00ff66]">{node.status}</span>
                      </div>
                      <div className="font-['Orbitron'] text-xs font-bold text-[#dbfcff] leading-snug">
                        {node.name}
                      </div>
                      <p className="font-mono text-[9px] text-[#64748b] mt-1 line-clamp-1">{node.subname}</p>
                      <div className="mt-2 pt-1 border-t border-[#162536] flex justify-between font-mono text-[9px]">
                        <span className="text-[#64748b]">{node.metricLabel}:</span>
                        <span className="text-[#00f0ff] font-bold">{node.metricValue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* STAGE 3: CONFORMER */}
              <div className="flex flex-col gap-3 justify-around">
                {["IC-06", "IC-07"].map((id) => {
                  const node = IC_NODES[id];
                  const isSelected = selectedNodeId === id;
                  return (
                    <div
                      key={id}
                      onClick={() => setSelectedNodeId(id)}
                      className={`cursor-pointer p-3 rounded-lg bg-[#07131e]/85 border transition-all ${
                        isSelected
                          ? "border-[#ffb700] ring-1 ring-[#ffb700] shadow-[0_0_20px_rgba(255,183,0,0.4)]"
                          : "border-[#16334f] hover:border-[#ffb700]/60"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[9px] mb-1">
                        <span className="text-[#ffb700] font-bold">{node.codeName}</span>
                        <span className="text-[#00ff66]">{node.status}</span>
                      </div>
                      <div className="font-['Orbitron'] text-xs font-bold text-[#dbfcff] leading-snug">
                        {node.name}
                      </div>
                      <p className="font-mono text-[9px] text-[#64748b] mt-1 line-clamp-1">{node.subname}</p>
                      <div className="mt-2 pt-1 border-t border-[#162536] flex justify-between font-mono text-[9px]">
                        <span className="text-[#64748b]">{node.metricLabel}:</span>
                        <span className="text-[#ffb700] font-bold">{node.metricValue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* STAGE 4: HEADS */}
              <div className="flex flex-col gap-3 justify-around">
                {["IC-08", "IC-09"].map((id) => {
                  const node = IC_NODES[id];
                  const isSelected = selectedNodeId === id;
                  return (
                    <div
                      key={id}
                      onClick={() => setSelectedNodeId(id)}
                      className={`cursor-pointer p-3 rounded-lg bg-[#07131e]/85 border transition-all ${
                        isSelected
                          ? "border-[#ff2a5f] ring-1 ring-[#ff2a5f] shadow-[0_0_20px_rgba(255,42,95,0.4)]"
                          : "border-[#16334f] hover:border-[#ff2a5f]/60"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[9px] mb-1">
                        <span className="text-[#ff2a5f] font-bold">{node.codeName}</span>
                        <span className="text-[#ff2a5f]">{node.status}</span>
                      </div>
                      <div className="font-['Orbitron'] text-xs font-bold text-[#dbfcff] leading-snug">
                        {node.name}
                      </div>
                      <p className="font-mono text-[9px] text-[#64748b] mt-1 line-clamp-1">{node.subname}</p>
                      <div className="mt-2 pt-1 border-t border-[#162536] flex justify-between font-mono text-[9px]">
                        <span className="text-[#64748b]">{node.metricLabel}:</span>
                        <span className="text-[#ff2a5f] font-bold">{node.metricValue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* STAGE 5: CONTAIN */}
              <div className="flex flex-col gap-3 justify-around">
                {["IC-10", "IC-11"].map((id) => {
                  const node = IC_NODES[id];
                  const isSelected = selectedNodeId === id;
                  return (
                    <div
                      key={id}
                      onClick={() => setSelectedNodeId(id)}
                      className={`cursor-pointer p-3 rounded-lg bg-[#07131e]/85 border transition-all ${
                        isSelected
                          ? "border-[#00ff66] ring-1 ring-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.4)]"
                          : "border-[#16334f] hover:border-[#00ff66]/60"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[9px] mb-1">
                        <span className="text-[#00ff66] font-bold">{node.codeName}</span>
                        <span className="text-[#00ff66]">{node.status}</span>
                      </div>
                      <div className="font-['Orbitron'] text-xs font-bold text-[#dbfcff] leading-snug">
                        {node.name}
                      </div>
                      <p className="font-mono text-[9px] text-[#64748b] mt-1 line-clamp-1">{node.subname}</p>
                      <div className="mt-2 pt-1 border-t border-[#162536] flex justify-between font-mono text-[9px]">
                        <span className="text-[#64748b]">{node.metricLabel}:</span>
                        <span className="text-[#00ff66] font-bold">{node.metricValue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: HOLOGRAPHIC DEEP-INSPECTION ENGINE (4 COLS) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="hud-box bg-[#0b131e] rounded-xl border border-[#00f0ff]/30 p-4 shadow-[0_0_30px_rgba(0,240,255,0.08)] flex flex-col gap-3">
              <div className="hud-corner-tr" />
              <div className="hud-corner-bl" />

              {/* Inspector Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#162536]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00f0ff] text-[20px]">troubleshoot</span>
                  <div>
                    <span className="font-mono text-[9px] text-[#64748b] block">{selectedNode.stageName}</span>
                    <h2 className="font-['Orbitron'] text-sm font-bold text-[#dbfcff] m-0">
                      {selectedNode.codeName}
                    </h2>
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 rounded font-mono text-[10px] font-bold border"
                  style={{
                    backgroundColor: `${selectedNode.statusColor}20`,
                    borderColor: `${selectedNode.statusColor}50`,
                    color: selectedNode.statusColor
                  }}
                >
                  {selectedNode.status}
                </span>
              </div>

              <div>
                <h3 className="font-['Orbitron'] text-xs font-bold text-[#dbfcff]">{selectedNode.name}</h3>
                <p className="font-['Space_Grotesk'] text-[11px] text-[#64748b] mt-0.5">{selectedNode.subname}</p>
              </div>

              {/* Microchip Specs Banner */}
              <div className="grid grid-cols-2 gap-2 bg-[#070d14] p-2 rounded border border-[#162536] font-mono text-[10px]">
                <div>
                  <span className="text-[#64748b] block text-[9px]">SUPPLY VCC:</span>
                  <span className="text-[#00f0ff] font-bold">{selectedNode.voltage}</span>
                </div>
                <div>
                  <span className="text-[#64748b] block text-[9px]">CLOCK RATE:</span>
                  <span className="text-[#00ff66] font-bold">{selectedNode.clock}</span>
                </div>
                <div>
                  <span className="text-[#64748b] block text-[9px]">STEP LATENCY:</span>
                  <span className="text-[#ffb700] font-bold">{selectedNode.latency}</span>
                </div>
                <div>
                  <span className="text-[#64748b] block text-[9px]">{selectedNode.metricLabel}:</span>
                  <span className="text-[#dbfcff] font-bold">{selectedNode.metricValue}</span>
                </div>
              </div>

              {/* Mathematical Equation */}
              <div>
                <span className="font-mono text-[9px] text-[#64748b] uppercase tracking-wider block mb-1">
                  Mathematical Transformation:
                </span>
                <div className="p-2 rounded bg-[#070d14] text-[#00f0ff] font-mono text-[10px] border border-[#00f0ff]/20 break-words leading-relaxed">
                  {selectedNode.formula}
                </div>
              </div>

              {/* Specifications List */}
              <div>
                <span className="font-mono text-[9px] text-[#64748b] uppercase tracking-wider block mb-1">
                  Operational Specifications:
                </span>
                <div className="space-y-1 font-mono text-[10px] text-[#dee3eb]">
                  {selectedNode.specs.map((spec, i) => (
                    <div key={i} className="flex items-start gap-1.5 p-1.5 rounded bg-[#070d14] border border-[#162536]">
                      <span className="text-[#00ff66] font-bold">✓</span>
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PyTorch / Kernel Code Snippet */}
              <div>
                <span className="font-mono text-[9px] text-[#64748b] uppercase tracking-wider block mb-1">
                  PyTorch / Kernel Implementation:
                </span>
                <pre className="p-2.5 rounded bg-[#070d14] border border-[#162536] font-mono text-[10px] text-[#ffb700] overflow-x-auto leading-relaxed">
                  {selectedNode.code}
                </pre>
              </div>

              {/* Trigger Node Simulation Button */}
              <button
                onClick={triggerPulse}
                className="w-full py-2 px-3 rounded bg-[#070d14] hover:bg-[#162536] text-[#00f0ff] border border-[#00f0ff]/40 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)] active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                <span>EXECUTE {selectedNode.codeName} LOGIC</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Left Tactical Rail (Extra Options) & Floating Bottom Nav Dock */}
      <LeftSidebarNav />
      <BottomNavDock />
    </div>
  );
}

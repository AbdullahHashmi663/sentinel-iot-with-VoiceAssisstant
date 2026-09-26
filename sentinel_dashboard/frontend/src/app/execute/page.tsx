"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CircuitBoard,
  CircuitNode,
  CircuitConnection
} from "@/components/ui/circuit-board";
import {
  Network,
  Radio,
  Server,
  Layers,
  Sliders,
  Cpu,
  Zap,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Crosshair,
  ArrowLeft,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Terminal,
  Activity
} from "lucide-react";
import BottomNavDock from "@/components/BottomNavDock";

export default function ExecuteArchitecturePage() {
  const [selectedNode, setSelectedNode] = useState<string | null>("conformer_core");
  const [pulseSpeed, setPulseSpeed] = useState<number>(2.0);
  const [activePipelineStage, setActivePipelineStage] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Architecture Nodes for Sentinel-IoT XDR with generous padding
  // Canvas width: 1260, height: 580
  const architectureNodes: CircuitNode[] = [
    // Stage 1: Ingestion Sources (x = 145)
    {
      id: "net_flows",
      x: 145,
      y: 120,
      label: "Network PCAP / Zeek",
      sublabel: "TCP, UDP, Modbus flows",
      icon: <Network className="w-4 h-4" />,
      status: "active",
      color: "#00f3ff",
    },
    {
      id: "iot_sensors",
      x: 145,
      y: 280,
      label: "Physical IoT Telemetry",
      sublabel: "GPS, Temp, Modbus, Light",
      icon: <Radio className="w-4 h-4" />,
      status: "active",
      color: "#00f3ff",
    },
    {
      id: "host_os",
      x: 145,
      y: 440,
      label: "Host OS Telemetry",
      sublabel: "Linux Auditd / WinEvent",
      icon: <Server className="w-4 h-4" />,
      status: "active",
      color: "#00f3ff",
    },

    // Stage 2: Preprocessing & Buffering (x = 380)
    {
      id: "minmax_scaler",
      x: 380,
      y: 210,
      label: "MinMax Scaler",
      sublabel: "Leakage-Free [0, 1]",
      icon: <Sliders className="w-4 h-4" />,
      status: "nominal",
      color: "#38bdf8",
    },
    {
      id: "sliding_buffer",
      x: 380,
      y: 360,
      label: "10-Step Sliding Buffer",
      sublabel: "Tensor [Batch, 10, D]",
      icon: <Layers className="w-4 h-4" />,
      status: "nominal",
      color: "#38bdf8",
    },

    // Stage 3: Conformer Core & Saliency Explainer (x = 630)
    {
      id: "conformer_core",
      x: 630,
      y: 240,
      label: "Google Conformer Core",
      sublabel: "MHSA + Depthwise Conv1D",
      icon: <Cpu className="w-4 h-4" />,
      status: "active",
      color: "#fcee0a",
    },
    {
      id: "saliency_xai",
      x: 630,
      y: 400,
      label: "Saliency Gradient XAI",
      sublabel: "0.78 ms Attribution",
      icon: <Zap className="w-4 h-4" />,
      status: "nominal",
      color: "#00ff66",
    },

    // Stage 4: Dual Classification Heads (x = 880)
    {
      id: "binary_head",
      x: 880,
      y: 180,
      label: "Head 1: Zero-Day Anomaly",
      sublabel: "Sigmoid (τ > 0.85)",
      icon: <ShieldAlert className="w-4 h-4" />,
      status: "critical",
      color: "#ff0055",
    },
    {
      id: "forensic_head",
      x: 880,
      y: 350,
      label: "Head 2: Forensic Classifier",
      sublabel: "Softmax Attack Profiling",
      icon: <Crosshair className="w-4 h-4" />,
      status: "warning",
      color: "#ff7700",
    },

    // Stage 5: Active Response & GRC Governance (x = 1115)
    {
      id: "wazuh_mitigation",
      x: 1115,
      y: 200,
      label: "Wazuh Active Response",
      sublabel: "iptables DROP & kill -9",
      icon: <ShieldCheck className="w-4 h-4" />,
      status: "critical",
      color: "#ff0055",
    },
    {
      id: "grc_governance",
      x: 1115,
      y: 370,
      label: "GRC Compliance Engine",
      sublabel: "NIST SP 800-53 & ISO 27001",
      icon: <FileCheck className="w-4 h-4" />,
      status: "nominal",
      color: "#00ff66",
    },
  ];

  // Interconnected Circuit Traces
  const architectureConnections: CircuitConnection[] = [
    // Telemetry Ingestion -> Scaling & Buffer
    { from: "net_flows", to: "minmax_scaler", animated: true, color: "#00f3ff" },
    { from: "iot_sensors", to: "minmax_scaler", animated: true, color: "#00f3ff" },
    { from: "host_os", to: "sliding_buffer", animated: true, color: "#00f3ff" },
    { from: "minmax_scaler", to: "sliding_buffer", animated: true, color: "#38bdf8" },

    // Buffer -> Conformer Core
    { from: "sliding_buffer", to: "conformer_core", animated: true, color: "#fcee0a" },

    // Conformer Core -> Dual Heads & XAI
    { from: "conformer_core", to: "binary_head", animated: true, color: "#ff0055" },
    { from: "conformer_core", to: "forensic_head", animated: true, color: "#ff7700" },
    { from: "conformer_core", to: "saliency_xai", animated: true, color: "#00ff66" },

    // Heads -> Autonomous Mitigation & GRC
    { from: "binary_head", to: "wazuh_mitigation", animated: true, color: "#ff0055" },
    { from: "forensic_head", to: "wazuh_mitigation", animated: true, color: "#ff7700" },
    { from: "binary_head", to: "grc_governance", animated: true, color: "#00ff66" },
    { from: "forensic_head", to: "grc_governance", animated: true, color: "#00ff66" },
  ];

  // Node details dictionary for inspection
  const nodeDetails: Record<string, { title: string; subtitle: string; formula: string; specs: string[]; code: string }> = {
    net_flows: {
      title: "Network Flow Ingestion Subsystem",
      subtitle: "Ingests raw PCAP and Zeek structured connection logs across industrial protocols.",
      formula: "F_net = [ts, proto, service, duration, src_bytes, dst_bytes, conn_state, ...]",
      specs: [
        "17 engineered features extracted per flow",
        "Covers Modbus, DNP3, TCP, UDP, and ICMP captures",
        "Includes source/destination IP routing metadata for active firewall drop rules"
      ],
      code: "df = pd.read_csv('cleaned_network_balanced.csv')\nX_features = df.drop(columns=['label', 'type'])"
    },
    iot_sensors: {
      title: "Physical IoT Sensor Telemetry",
      subtitle: "High-frequency cyber-physical signals spanning 7 industrial IoT domains.",
      formula: "S_iot = [GPS (lat, lon, spd), Modbus (FC, reg), Temp (val, delta), Weather, Garage, Motion, Fridge]",
      specs: [
        "Engineered with rolling standard deviations and rate-of-change deltas",
        "Captures transient physical anomalies (sudden Modbus coils, GPS spoofing, thermal shock)",
        "Trained across 7 distinct ToN_IoT physical sensor testbeds"
      ],
      code: "payload = {'device_id': 'gps_tracker_01', 'features': row.values.tolist()}"
    },
    host_os: {
      title: "Host OS Telemetry Subsystem",
      subtitle: "Deep operating system kernel events collected via Linux Auditd and Windows Event Logs.",
      formula: "O_host = [CPU_scheduling, RAM_pages, Disk_IO, Syscall_freq, PID, CMD_entropy]",
      specs: [
        "Covers Linux process/disk/memory and Windows 7/10 kernels",
        "Maps malicious process IDs for automated SIGKILL termination",
        "Detects stealthy ransomware encryption loops and privilege escalation"
      ],
      code: "metrics = psutil.virtual_memory(); top_procs = psutil.process_iter()"
    },
    minmax_scaler: {
      title: "Leakage-Free MinMax Normalizer",
      subtitle: "Applies domain-specific scaling fitted strictly on training splits to prevent target contamination.",
      formula: "x' = (x - x_min) / (x_max - x_min + 1e-9) ∈ [0, 1]",
      specs: [
        "13 pre-fitted .joblib scalers loaded dynamically per telemetry source",
        "Prevents feature dominance from high-magnitude metrics (e.g. byte counts)",
        "Zero-delay transformation in < 0.05 ms per sample"
      ],
      code: "scaler = joblib.load('network_scaler.joblib'); X_scaled = scaler.transform(X)"
    },
    sliding_buffer: {
      title: "10-Step Temporal Sliding Sequence Buffer",
      subtitle: "Accumulates chronologically ordered telemetry events to capture multi-stage temporal attacks.",
      formula: "X_t = [x_{t-9}, x_{t-8}, ..., x_t] ∈ R^{10 × D}",
      specs: [
        "Eliminates static point-in-time classification blindness",
        "Maintains per-device in-memory circular buffers (maxlen = 10)",
        "Discharges into PyTorch 3D tensor batch [1, 10, D_features]"
      ],
      code: "buf = sequence_buffers[device_id]; buf.append(features)\nif len(buf) == 10: tensor_input = torch.tensor([buf])"
    },
    conformer_core: {
      title: "Dual-Head Google Conformer Neural Core",
      subtitle: "Interleaves Multi-Head Self-Attention with Depthwise Separable Convolutions in a Macaron sandwich.",
      formula: "Block(x) = PostLN(FF2(Conv1D(MHSA(FF1(x)) + x)))",
      specs: [
        "Embed dimension d_model = 128, 4 attention heads, 2 stacked Conformer blocks",
        "Captures sharp local transients via Depthwise Conv1D (k=3) without recurrent gate decay",
        "Captures global long-range temporal dependencies over 10 time steps",
        "Statistically superior to GRU, LSTM, and 1D-CNN (Wilcoxon W=0.0, p < 10^-7)"
      ],
      code: "class ConformerSentinelModel(nn.Module):\n  # Linear projection -> 2x ConformerBlocks -> Global AvgPool -> Dual Heads"
    },
    saliency_xai: {
      title: "Analytical First-Order Saliency Gradient Explainer",
      subtitle: "Sub-millisecond mathematical feature attribution derived directly from PyTorch backpropagation.",
      formula: "A_i = (1 / 10) ∑_{t=1}^{10} |∂ŷ_{bin} / ∂X_{t, i}| / ∑_j A_j",
      specs: [
        "Calculated in 0.78 ms directly on CPU",
        "99.97% faster than Kernel SHAP (3,120 ms)",
        "Eliminates explainability bottlenecks for real-time edge gateways"
      ],
      code: "model.zero_grad(); anomaly_prob.backward()\ngrads = tensor_input.grad.detach().cpu().numpy()[0]"
    },
    binary_head: {
      title: "Head 1: Zero-Day Anomaly Detection Head",
      subtitle: "Calibrated sigmoid activation estimating probability of anomalous deviation from nominal baselines.",
      formula: "ŷ_{bin} = σ(W_b · e + b_b) ∈ [0, 1] | Threshold τ > 0.85",
      specs: [
        "99.70% binary anomaly accuracy on network flows (F1 = 0.9983)",
        "Calibrated safety tiers: Nominal (< 0.60), Warning (0.60 - 0.85), Critical (> 0.85)",
        "Scores exceeding τ > 0.85 autonomously engage Wazuh Active Response"
      ],
      code: "bin_out = self.binary_head(x); prob = torch.sigmoid(bin_out)"
    },
    forensic_head: {
      title: "Head 2: Multi-Class Forensic Attribution Head",
      subtitle: "Fine-grained Softmax classification identifying exact exploit signature for incident forensics.",
      formula: "ŷ_{mul} = softmax(W_m · e + b_m) ∈ R^K",
      specs: [
        "98.37% average forensic accuracy across all 13 domains",
        "Classifies DDoS, Ransomware, Scanning, Injection, Password, MITM, Backdoor, XSS",
        "Provides probabilistic forensic attribution for SIEM ingestion"
      ],
      code: "mul_out = self.multiclass_head(x); pred_label = class_names[argmax(mul_out)]"
    },
    wazuh_mitigation: {
      title: "Autonomous Wazuh Active Response Engine",
      subtitle: "Sub-second closed-loop automated host and perimeter threat remediation.",
      formula: "MTTR = T_detect + T_xai + T_exec = 21.5 ms << 1,000 ms SLA",
      specs: [
        "Network threats -> Dynamic iptables / Windows Firewall rule insertion (DROP packet)",
        "Host threats -> Compromised process termination (kill -9 <PID>)",
        "Zero human latency required during zero-day outbreak"
      ],
      code: "cmd = f'iptables -A INPUT -s {source_ip} -j DROP'\nsubprocess.run(cmd.split(), capture_output=True)"
    },
    grc_governance: {
      title: "Automated GRC Regulatory Compliance Auditor",
      subtitle: "Dynamically maps deep learning anomaly vectors to NIST SP 800-53 and ISO 27001 regulatory frameworks.",
      formula: "GRC(ŷ) -> { NIST_Controls: [SC-5, SI-3, SI-10, ...], ISO_Clauses: [A.12.1.3, ...] }",
      specs: [
        "Provides verifiable audit trails for enterprise compliance officers",
        "Maps DDoS -> NIST SC-5 / ISO A.12.1.3 (Capacity Management)",
        "Maps Ransomware -> NIST SI-3 (Malicious Code) / ISO A.12.6.1",
        "One-click auditable CSV/JSON export for external auditors"
      ],
      code: "return {'nist_control': GRC_MAPPING[threat]['nist'], 'iso_control': GRC_MAPPING[threat]['iso']}"
    }
  };

  const selectedInfo = selectedNode ? nodeDetails[selectedNode] : nodeDetails.conformer_core;

  const handleSimulatePipeline = () => {
    setIsSimulating(true);
    let stage = 0;
    const interval = setInterval(() => {
      stage += 1;
      setActivePipelineStage(stage);
      if (stage > 4) {
        clearInterval(interval);
        setIsSimulating(false);
        setActivePipelineStage(0);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col space-y-4 pb-32">
      
      {/* TOP CANVAS NAVIGATION */}
      <header className="cyber-card w-full border-b border-[var(--border-color)] px-4 py-3 sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/15 text-xs font-['Orbitron'] font-bold uppercase transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>SOC Dashboard</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="font-['Orbitron'] font-black tracking-wider text-lg sm:text-xl text-[var(--accent-primary)] drop-shadow-[0_0_10px_var(--accent-glow)]">
                SENTINEL-IOT ARCHITECTURE CANVAS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--border-color)]">
                CIRCUIT BOARD EXECUTION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* PULSE SPEED SELECTOR */}
            <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] px-2.5 py-1 rounded-lg border border-[var(--border-color)] text-xs font-['JetBrains_Mono']">
              <span className="text-[var(--text-muted)] text-[10px]">PULSE SPEED:</span>
              {[1.0, 2.0, 3.5].map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-label={`Set circuit trace pulse speed to ${s} seconds`}
                  onClick={() => setPulseSpeed(s)}
                  className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
                    pulseSpeed === s ? "bg-[var(--accent-primary)] text-black" : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  {s}s
                </button>
              ))}
            </div>

            {/* SIMULATE PIPELINE EXECUTION */}
            <button
              type="button"
              onClick={handleSimulatePipeline}
              disabled={isSimulating}
              aria-label="Simulate 5-Stage Neural Pipeline Execution Flow"
              className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-['Orbitron'] font-bold uppercase transition-all shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)] disabled:opacity-60 disabled:cursor-not-allowed ${
                isSimulating
                  ? "bg-[var(--alert-warning)] text-black animate-pulse"
                  : "bg-[var(--accent-primary)] text-black hover:shadow-[0_0_16px_var(--accent-primary)]"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{isSimulating ? `EXEC STAGE ${activePipelineStage}/4...` : "EXECUTE PIPELINE FLOW"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN EXECUTION WORKSPACE */}
      <main className="max-w-[1920px] w-full mx-auto px-4 space-y-4">
        
        {/* INTERACTIVE CIRCUIT BOARD CANVAS CONTAINER */}
        <div className="cyber-card no-hover-animation p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
              <h3 className="font-['Orbitron'] font-bold text-sm text-[var(--text-primary)] tracking-wide">
                FULL-SYSTEM PCB TRACE & NEURAL HARDWARE TOPOLOGY
              </h3>
            </div>
            <div className="text-xs font-['JetBrains_Mono'] text-[var(--text-muted)]">
              Click any IC chip node to inspect telemetry data structures & mathematical proofs
            </div>
          </div>

          {/* RESPONSIVE CANVAS WRAPPER (100% SPREAD ON ANY DISPLAY) */}
          <div className="w-full overflow-x-auto pb-3 pt-1">
            <div className="w-full">
              <CircuitBoard
                nodes={architectureNodes.map((n) => ({
                  ...n,
                  label: n.label,
                  // Highlight border when selected
                  color: selectedNode === n.id ? "var(--accent-primary)" : n.color
                }))}
                connections={architectureConnections}
                width={1260}
                height={580}
                showGrid={true}
                pulseSpeed={pulseSpeed}
                traceWidth={2.5}
                className="w-full border-2 border-[var(--border-color)]"
                onNodeClick={(nodeId) => setSelectedNode(nodeId)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-['JetBrains_Mono'] text-[var(--text-muted)] px-3 pt-2 border-t border-[var(--border-color)]/40">
            <span>[STAGE 1: MULTI-DOMAIN TELEMETRY]</span>
            <span>[STAGE 2: PREPROCESSING & SLIDING BUFFER]</span>
            <span>[STAGE 3: CONFORMER CORE & SALIENCY XAI]</span>
            <span>[STAGE 4: DUAL INFERENCE HEADS]</span>
            <span>[STAGE 5: AUTONOMOUS ACTIVE MITIGATION & GRC]</span>
          </div>
        </div>

        {/* NODE INSPECTOR CARD (MATHEMATICAL PROOFS & DATA STRUCTURES) */}
        {selectedInfo && (
          <div className="cyber-card p-5 space-y-4 border-[var(--accent-primary)]/40">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2.5">
                <Info className="w-5 h-5 text-[var(--accent-primary)]" />
                <div>
                  <h4 className="font-['Orbitron'] font-black text-base text-[var(--text-primary)]">
                    {selectedInfo.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] font-['Space_Grotesk']">
                    {selectedInfo.subtitle}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)] text-xs font-['JetBrains_Mono'] font-bold text-[var(--accent-primary)]">
                NODE ID: {selectedNode?.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* FORMULATION & SPECS (LEFT 7 COLS) */}
              <div className="lg:col-span-7 space-y-3">
                {/* Mathematical Formulation */}
                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                  <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)] uppercase font-semibold">
                    Mathematical Formulation / Tensor Schema:
                  </div>
                  <div className="font-['JetBrains_Mono'] font-bold text-xs text-[var(--accent-tertiary)] overflow-x-auto py-1">
                    {selectedInfo.formula}
                  </div>
                </div>

                {/* Key Architectural Specifications */}
                <div className="space-y-1.5">
                  <div className="text-xs font-['Rajdhani'] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    Key Implementation Properties:
                  </div>
                  <ul className="space-y-1">
                    {selectedInfo.specs.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-['Space_Grotesk'] text-[var(--text-primary)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--alert-nominal)] shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* PYTORCH / PYTHON IMPLEMENTATION SNIPPET (RIGHT 5 COLS) */}
              <div className="lg:col-span-5 p-3.5 rounded-lg bg-[var(--terminal-bg)] border border-[var(--border-color)] font-['JetBrains_Mono'] text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-1 text-[10px] text-[var(--text-muted)]">
                  <span>PRODUCTION PYTORCH IMPLEMENTATION</span>
                  <span>Python 3.14</span>
                </div>
                <pre className="text-[var(--accent-primary)] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {selectedInfo.code}
                </pre>
              </div>

            </div>

            {/* QUICK NODE SELECTOR BUTTONS */}
            <div className="border-t border-[var(--border-color)] pt-3 flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-['Rajdhani'] font-bold text-[var(--text-muted)] uppercase mr-2">
                Quick Inspect:
              </span>
              {architectureNodes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  aria-pressed={selectedNode === n.id}
                  aria-label={`Inspect ${n.label} circuit node`}
                  onClick={() => setSelectedNode(n.id)}
                  className={`cursor-pointer px-2.5 py-1 rounded text-[11px] font-['JetBrains_Mono'] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
                    selectedNode === n.id
                      ? "bg-[var(--accent-primary)] text-black font-bold shadow-[0_0_8px_var(--accent-primary)]"
                      : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)] hover:bg-[var(--bg-surface-elevated)]"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* BOTTOM SHIFTED DOCK: MAGNETIC DOCK NAVIGATION */}
      <BottomNavDock />
    </div>
  );
}

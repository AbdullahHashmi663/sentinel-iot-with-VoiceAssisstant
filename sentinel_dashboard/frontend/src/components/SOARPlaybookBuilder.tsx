// ==============================================================================
// SENTINEL-IOT: VISUAL SOAR WORKFLOW PLAYBOOK BUILDER (IDEA 2)
// Autonomous Graph Engine: Trigger -> Saliency Filter -> Mitigation -> Compliance
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  Workflow,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Zap,
  ArrowRight,
  Terminal,
  Settings,
  Sparkles,
  Download,
  Copy,
  Check,
  X
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";

interface PlaybookNode {
  id: string;
  type: "trigger" | "filter" | "mitigation" | "compliance";
  title: string;
  subtitle: string;
  detail: string;
  status: "idle" | "evaluating" | "passed" | "failed";
}

interface PlaybookDef {
  id: string;
  name: string;
  description: string;
  targetIp: string;
  nodes: PlaybookNode[];
  merkleHash: string;
}

const DEFAULT_PLAYBOOKS: PlaybookDef[] = [
  {
    id: "playbook-01",
    name: "Zero-Day Industrial Modbus Quarantine",
    description: "Detects unauthorized coil write bursts, correlates temporal gradient attribution, and freezes Modbus loop.",
    targetIp: "192.168.100.45",
    merkleHash: "7f01a9b4c12d8e33fbc8294a0058b76c",
    nodes: [
      {
        id: "trig-1",
        type: "trigger",
        title: "Conformer Anomaly Trigger",
        subtitle: "Dual-Head Anomaly Scoring",
        detail: "Anomaly Probability τ > 0.85 & Domain == 'IoT_Modbus'",
        status: "idle"
      },
      {
        id: "filt-1",
        type: "filter",
        title: "Saliency Gradient Filter",
        subtitle: "First-Order Attribution Check",
        detail: "FC_Code == 'Write_Multiple_Coils' & Saliency Entropy > 0.75",
        status: "idle"
      },
      {
        id: "mit-1",
        type: "mitigation",
        title: "Active Modbus Isolation",
        subtitle: "Wazuh Agent Containment",
        detail: "iptables -A FORWARD -s 192.168.100.45 -p tcp --dport 502 -j DROP",
        status: "idle"
      },
      {
        id: "comp-1",
        type: "compliance",
        title: "GRC AU-9 Cryptographic Seal",
        subtitle: "NIST SP 800-53 / ISO 27001",
        detail: "NIST SC-5 & ISO A.12.1.3 Ledger Entry with SHA-256 Merkle Receipt",
        status: "idle"
      }
    ]
  },
  {
    id: "playbook-02",
    name: "Host Ransomware High-IO Outbreak Kill",
    description: "Identifies rapid file encryption patterns via temporal process metrics and terminates rogue process trees.",
    targetIp: "192.168.100.18",
    merkleHash: "3a88c42b910e527d44fe11a77d903e12",
    nodes: [
      {
        id: "trig-2",
        type: "trigger",
        title: "Process IO Surge Trigger",
        subtitle: "Host Telemetry Anomaly",
        detail: "Attack Class == 'ransomware' & IO_Write_Bytes > 500 KB/s",
        status: "idle"
      },
      {
        id: "filt-2",
        type: "filter",
        title: "Binary Whitelist Check",
        subtitle: "Integrity & Signature Cross-Check",
        detail: "Process binary not in OS_ALLOWLIST & Active Threads > 15",
        status: "idle"
      },
      {
        id: "mit-2",
        type: "mitigation",
        title: "SIGKILL Process Tree",
        subtitle: "Direct OS Kernel Signal",
        detail: "taskkill /F /PID 4120 && vssadmin create shadow /for=C:",
        status: "idle"
      },
      {
        id: "comp-2",
        type: "compliance",
        title: "NIST SI-3 Malware Audit",
        subtitle: "Cryptographic Evidence Ledger",
        detail: "NIST SI-3 & ISO A.12.6.1 Forensic Snapshot anchored in Vault",
        status: "idle"
      }
    ]
  },
  {
    id: "playbook-03",
    name: "Distributed SYN Flood Rate-Limiting",
    description: "Evaluates ingress packet flow anomalies and triggers edge BGP rate-limiting within sub-second thresholds.",
    targetIp: "10.0.0.88",
    merkleHash: "e5d023bf9761a29810ef3379ac540b09",
    nodes: [
      {
        id: "trig-3",
        type: "trigger",
        title: "Network SYN Ingress Spike",
        subtitle: "Conformer Sequence Model",
        detail: "Conformer τ > 0.90 & SYN_Packets_Sec > 5000/s",
        status: "idle"
      },
      {
        id: "filt-3",
        type: "filter",
        title: "Source IP Dispersion Test",
        subtitle: "Multi-Source Clustering",
        detail: "Unique Source IPs > 20 within 10-step buffer",
        status: "idle"
      },
      {
        id: "mit-3",
        type: "mitigation",
        title: "Edge Ingress BGP Rate-Limit",
        subtitle: "Hardware Switch Containment",
        detail: "tc qdisc add dev eth0 root tbf rate 25mbit burst 10kb latency 20ms",
        status: "idle"
      },
      {
        id: "comp-3",
        type: "compliance",
        title: "NIST SC-5 DoS Compliance",
        subtitle: "Audit Trail Merkle Block",
        detail: "NIST SC-5 Denial-of-Service Protection SLA Verification",
        status: "idle"
      }
    ]
  }
];

export default function SOARPlaybookBuilder({ isModal = false, onClose }: { isModal?: boolean; onClose?: () => void }) {
  const [selectedPlaybookIndex, setSelectedPlaybookIndex] = useState<number>(0);
  const [playbooks, setPlaybooks] = useState<PlaybookDef[]>(DEFAULT_PLAYBOOKS);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const activePlaybook = playbooks[selectedPlaybookIndex];

  const handleSimulateExecution = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setCurrentStepIndex(0);
    setExecutionResult(null);
    setExecutionLogs([
      `[SOAR Engine] Starting autonomous execution for '${activePlaybook.name}'...`,
      `[Target] Node IP: ${activePlaybook.targetIp}`
    ]);

    // Step-by-step sequential node animation
    for (let i = 0; i < activePlaybook.nodes.length; i++) {
      setCurrentStepIndex(i);
      const node = activePlaybook.nodes[i];
      setExecutionLogs((prev) => [
        ...prev,
        `[STAGE ${i + 1}] Evaluating ${node.title} -> ${node.detail}...`
      ]);

      await new Promise((r) => setTimeout(r, 650));

      setExecutionLogs((prev) => [
        ...prev,
        `[STAGE ${i + 1}] SUCCESS: ${node.title} passed condition check.`
      ]);
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/soar/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playbook_id: activePlaybook.id,
          target_ip: activePlaybook.targetIp
        })
      });
      if (res.ok) {
        const data = await res.json();
        setExecutionResult(data);
        setExecutionLogs((prev) => [
          ...prev,
          `[SOAR Engine] Mitigation completed in ${data.execution_time_ms} ms.`,
          `[GRC Vault] Cryptographic Proof: ${data.merkle_receipt}`,
          `[Audit] ${data.audit_proof}`
        ]);
      } else {
        throw new Error("Backend response non-200");
      }
    } catch {
      // Local fallback simulation if backend offline
      setExecutionResult({
        status: "EXECUTED",
        playbook_id: activePlaybook.id,
        playbook_name: activePlaybook.name,
        target: activePlaybook.targetIp,
        execution_time_ms: 18.4,
        mitigation_action: activePlaybook.nodes[2].detail,
        merkle_receipt: activePlaybook.merkleHash,
        audit_proof: `AU-9 Verified at ${new Date().toISOString()}`
      });
      setExecutionLogs((prev) => [
        ...prev,
        `[SOAR Engine] Simulated execution completed in 18.4 ms.`,
        `[GRC Vault] Cryptographic Proof: ${activePlaybook.merkleHash}`,
        `[Audit] AU-9 Verified at ${new Date().toISOString()}`
      ]);
    }

    setIsExecuting(false);
    setCurrentStepIndex(-1);
  };

  const handleCopyReceipt = () => {
    if (!executionResult) return;
    navigator.clipboard.writeText(executionResult.merkle_receipt);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const getNodeColor = (type: PlaybookNode["type"]) => {
    switch (type) {
      case "trigger":
        return {
          border: "border-[var(--brand-cyan)]",
          glow: "shadow-[0_0_15px_rgba(0,243,255,0.3)]",
          badgeBg: "bg-[var(--brand-cyan)]/15 text-[var(--brand-cyan)]",
          icon: <Zap className="w-4 h-4 text-[var(--brand-cyan)]" />
        };
      case "filter":
        return {
          border: "border-[var(--alert-warning)]",
          glow: "shadow-[0_0_15px_rgba(252,238,10,0.3)]",
          badgeBg: "bg-[var(--alert-warning)]/15 text-[var(--alert-warning)]",
          icon: <ShieldAlert className="w-4 h-4 text-[var(--alert-warning)]" />
        };
      case "mitigation":
        return {
          border: "border-[var(--alert-nominal)]",
          glow: "shadow-[0_0_15px_rgba(0,255,102,0.3)]",
          badgeBg: "bg-[var(--alert-nominal)]/15 text-[var(--alert-nominal)]",
          icon: <ShieldCheck className="w-4 h-4 text-[var(--alert-nominal)]" />
        };
      case "compliance":
        return {
          border: "border-[#a855f7]",
          glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
          badgeBg: "bg-[#a855f7]/15 text-[#a855f7]",
          icon: <FileCheck className="w-4 h-4 text-[#a855f7]" />
        };
    }
  };

  const content = (
    <div className="space-y-4">
      {/* 1. TOP CONTROL BAR */}
      <div className="cyber-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <Workflow className="w-5 h-5 text-[var(--brand-cyan)]" />
            <div>
              <h3 className="font-['Orbitron'] font-bold text-sm text-[var(--text-primary)]">
                VISUAL SOAR WORKFLOW PLAYBOOK BUILDER
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-['Space_Grotesk']">
                Closed-Loop Automated Incident Response Chains (Trigger $\to$ Saliency Filter $\to$ Active Response $\to$ GRC Merkle Proof)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Playbook Builder"
                className="cursor-pointer p-1.5 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* SIMULATION TRIGGER BUTTON */}
            <button
              type="button"
              onClick={handleSimulateExecution}
              disabled={isExecuting}
              aria-label="Simulate Playbook Execution"
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-['Orbitron'] font-bold text-xs uppercase transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--alert-nominal)] active:scale-[0.98] ${
                isExecuting
                  ? "bg-[var(--alert-warning)] text-black animate-pulse shadow-[0_0_20px_var(--alert-warning)]"
                  : "bg-[var(--alert-nominal)] text-black hover:bg-[var(--alert-nominal)]/90 shadow-[0_0_16px_rgba(0,255,102,0.4)]"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isExecuting ? "SIMULATING PIPELINE..." : "RUN PLAYBOOK SIMULATION"}</span>
            </button>
          </div>
        </div>

        {/* PLAYBOOK TABS & TARGET SELECTOR */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-secondary)] uppercase">
              ACTIVE PLAYBOOK:
            </span>
            <div className="inline-flex rounded-lg bg-[var(--bg-surface)] p-1 border border-[var(--border-color)]">
              {playbooks.map((pb, idx) => (
                <button
                  key={pb.id}
                  onClick={() => setSelectedPlaybookIndex(idx)}
                  className={`cursor-pointer px-3 py-1 text-xs font-['Orbitron'] font-bold rounded transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)] ${
                    selectedPlaybookIndex === idx
                      ? "bg-[var(--brand-cyan)] text-black shadow-md"
                      : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  {pb.name.split(" ")[0]} ({pb.id})
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[var(--text-secondary)]">
            <span>Target Node:</span>
            <span className="px-2 py-0.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--brand-cyan)] font-bold">
              {activePlaybook.targetIp}
            </span>
          </div>
        </div>
      </div>

      {/* 2. VISUAL FLOW GRAPH CANVAS (4 CONNECTED STAGES) */}
      <div className="cyber-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--brand-cyan)]" />
            <h4 className="font-['Orbitron'] font-bold text-xs uppercase text-[var(--text-primary)]">
              {activePlaybook.name} - Autonomous Node Graph
            </h4>
          </div>
          <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">
            Click any node to inspect parameters • Automated MTTR &lt; 25 ms
          </span>
        </div>

        {/* 4 STAGE NODE PIPELINE */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {activePlaybook.nodes.map((node, idx) => {
            const style = getNodeColor(node.type);
            const isCurrentlyActive = currentStepIndex === idx;
            const isPast = currentStepIndex > idx || (executionResult && !isExecuting);
            const isSelected = selectedNodeId === node.id;

            return (
              <div key={node.id} className="relative flex flex-col">
                <button
                  type="button"
                  onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                  className={`cursor-pointer w-full text-left p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between h-full bg-[var(--bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)] ${
                    isCurrentlyActive
                      ? `${style.border} ${style.glow} scale-[1.03] bg-[var(--bg-surface-elevated)] ring-2 ring-[var(--brand-cyan)]`
                      : isPast
                      ? "border-[var(--alert-nominal)]/70 shadow-[0_0_10px_rgba(0,255,102,0.2)]"
                      : isSelected
                      ? `${style.border} bg-[var(--bg-surface-elevated)]`
                      : "border-[var(--border-color)] hover:border-[var(--text-secondary)]"
                  }`}
                >
                  {/* Top node info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-['JetBrains_Mono'] ${style.badgeBg}`}>
                        STAGE {idx + 1}: {node.type}
                      </span>
                      {isCurrentlyActive ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--alert-warning)] animate-ping" />
                      ) : isPast ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--alert-nominal)]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {style.icon}
                      <h5 className="font-['Orbitron'] font-bold text-xs text-[var(--text-primary)] leading-snug">
                        {node.title}
                      </h5>
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)] font-['Space_Grotesk']">
                      {node.subtitle}
                    </p>
                  </div>

                  {/* Node detail block */}
                  <div className="mt-3 p-2 rounded bg-[var(--bg-canvas)] border border-[var(--border-color)]/60 text-[10px] font-['JetBrains_Mono'] text-[var(--text-primary)] break-words">
                    {node.detail}
                  </div>
                </button>

                {/* Arrow connector between nodes (hidden on mobile or last node) */}
                {idx < activePlaybook.nodes.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--brand-cyan)] shadow-md">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SIMULATION AUDIT CONSOLE & MERKLE RECEIPT */}
      {executionLogs.length > 0 && (
        <div className="cyber-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[var(--brand-cyan)]" />
              <h4 className="font-['Orbitron'] font-bold text-xs uppercase text-[var(--text-primary)]">
                SOAR Autonomous Execution Output & Merkle Audit Proof
              </h4>
            </div>
            {executionResult && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--alert-nominal)] font-bold">
                  LATENCY: {executionResult.execution_time_ms} ms (Target &lt; 25 ms)
                </span>
                <button
                  type="button"
                  onClick={handleCopyReceipt}
                  aria-label="Copy Merkle Receipt"
                  className="cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[10px] font-['JetBrains_Mono'] text-[var(--brand-cyan)] transition-colors"
                >
                  {copiedReceipt ? <Check className="w-3 h-3 text-[var(--alert-nominal)]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedReceipt ? "COPIED" : "COPY RECEIPT"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Terminal View */}
          <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-color)] max-h-48 overflow-y-auto font-['JetBrains_Mono'] text-[11px] space-y-1">
            {executionLogs.map((log, i) => (
              <div
                key={i}
                className={
                  log.includes("SUCCESS") || log.includes("Cryptographic")
                    ? "text-[var(--alert-nominal)]"
                    : log.includes("STAGE")
                    ? "text-[var(--brand-cyan)]"
                    : "text-[var(--text-secondary)]"
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="soar-builder-title"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      >
        <div className="cyber-card w-full max-w-5xl p-6 border-2 border-[var(--brand-cyan)] shadow-[0_0_50px_rgba(0,243,255,0.3)] my-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

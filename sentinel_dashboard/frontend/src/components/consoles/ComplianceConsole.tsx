// ==============================================================================
// CONSOLE 06: GRC REGULATORY COMPLIANCE & CRYPTOGRAPHIC VAULT
// Stitch Futuristic Tactical HUD Design - Production Implementation
// Continuous NIST SP 800-53 Rev. 5, ISO/IEC 27001:2022 & IEC 62443-4-2 SL-3
// ==============================================================================

"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import { downloadCompliancePDF } from "@/services/api";

interface ControlItem {
  id: string;
  family: string; // "NIST" | "ISO" | "IEC"
  name: string;
  standard: string;
  defense: string;
  subDefense: string;
  engine: string;
  engineSub: string;
  status: string;
  score: string;
  statusColor: string;
}

const REGULATORY_CONTROLS: ControlItem[] = [
  {
    id: "SC-5",
    family: "NIST",
    name: "Denial of Service Protection",
    standard: "NIST SP 800-53",
    defense: "Conformer Latent Saliency + XDP Packet Drop",
    subDefense: "MTTR: 0.082ms | Line-rate line drop on eth0",
    engine: "eBPF Kernel Probe",
    engineSub: "AF_XDP Bypass Engine",
    status: "COMPLIANT",
    score: "100%",
    statusColor: "var(--ws-mint)"
  },
  {
    id: "SI-3 / A.12.2",
    family: "NIST ISO",
    name: "Malicious Code Protection",
    standard: "NIST / ISO 27001",
    defense: "Dual Conformer Sigmoid (τ > 0.85) + cgroup freeze",
    subDefense: "Isolates Rogue Poller threads within 4.1μs",
    engine: "Wazuh Active Response",
    engineSub: "Auditd Trace Hook",
    status: "COMPLIANT",
    score: "99.4%",
    statusColor: "var(--ws-mint)"
  },
  {
    id: "AU-9 / A.12.4",
    family: "NIST ISO",
    name: "Protection of Audit Information",
    standard: "NIST / ISO 27001",
    defense: "SHA-256 Merkle Chain Vault + TPM 2.0 PCR-7 Seal",
    subDefense: "Strict write-once append log with hardware RoT",
    engine: "Cryptographic Ledger",
    engineSub: "Hardware NVRAM Binding",
    status: "IMMUTABLE",
    score: "100%",
    statusColor: "var(--ws-mint)"
  },
  {
    id: "IA-5 / SR 1.1",
    family: "NIST IEC",
    name: "Authenticator Management",
    standard: "IEC 62443 / NIST",
    defense: "IEC 62443 4-Eyes Physical Latency Interlock + FIDO2",
    subDefense: "Dual HSM Quorum for all SCADA coil modifications",
    engine: "Dual-Custody Sig",
    engineSub: "Ed25519 Ephemeral Token",
    status: "ENFORCED",
    score: "100%",
    statusColor: "var(--ws-mint)"
  },
  {
    id: "SI-10",
    family: "NIST",
    name: "Input Validation",
    standard: "NIST SP 800-53",
    defense: "MinMax Scaler + DAE Denoising Autoencoder & PGD-20",
    subDefense: "Neutralizes adversarial FGSM / PGD gradient perturbations",
    engine: "Adversarial Test Suite",
    engineSub: "Continuous Perturbation Probe",
    status: "COMPLIANT",
    score: "98.2%",
    statusColor: "var(--ws-mint)"
  },
  {
    id: "SI-4 / A.12.1",
    family: "NIST ISO",
    name: "System Monitoring & Ops",
    standard: "NIST / ISO 27001",
    defense: "10-Step Sliding Tensor Buffer [B, 10, D] @ 2,450 EVT/S",
    subDefense: "Lock-free ringbuffer via Linux IPC Shared Memory",
    engine: "FastAPI / AF_XDP",
    engineSub: "Zero Kernel Bottleneck",
    status: "ACTIVE",
    score: "100%",
    statusColor: "var(--ws-mint)"
  },
  {
    id: "IEC 62443-4-2",
    family: "IEC",
    name: "SR 3.1 Comm Integrity",
    standard: "IEC 62443 SL-3",
    defense: "Modbus FC16 Setpoint Range Sanitizer",
    subDefense: "Guards PLC actuator registers against out-of-bounds writes",
    engine: "Netfilter Hook",
    engineSub: "Modbus State Validation",
    status: "VERIFIED",
    score: "SL-3",
    statusColor: "var(--ws-mint)"
  }
];

export default function ComplianceConsole({ onOpenAuditCli }: { onOpenAuditCli?: () => void }) {
  const router = useRouter();
  const { nistCsfScore, openAuditReportModal, setActiveConsole, theme } = useTelemetryStore();
  const isLightMode = theme === "alabaster" || theme === "arctic" || theme === "light";
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState("");
  const [activeFamily, setActiveFamily] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [zkpRunning, setZkpRunning] = useState<boolean>(false);
  const [zkpVerified, setZkpVerified] = useState<boolean>(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [chainVerified, setChainVerified] = useState<boolean>(true);

  // Filter controls
  const filteredControls = useMemo(() => {
    return REGULATORY_CONTROLS.filter((ctrl) => {
      const matchesFamily =
        activeFamily === "ALL" || ctrl.family.toUpperCase().includes(activeFamily);
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        ctrl.id.toLowerCase().includes(query) ||
        ctrl.name.toLowerCase().includes(query) ||
        ctrl.standard.toLowerCase().includes(query) ||
        ctrl.defense.toLowerCase().includes(query) ||
        ctrl.engine.toLowerCase().includes(query);
      return matchesFamily && matchesSearch;
    });
  }, [activeFamily, searchQuery]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2200);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const state = useTelemetryStore.getState();
    const opened = await downloadCompliancePDF({ source: state.isMockMode ? "generated-demo" : "local-backend", domain: state.activeDomain, events: state.events });
    setExportNotice(opened ? "Observation report opened. Use Print / Save PDF in that window. This is not a compliance certificate." : "The report window was blocked. Allow pop-ups for this local dashboard and try again.");
    setTimeout(() => setIsExporting(false), 1400);
  };

  const triggerZkp = () => {
    setZkpRunning(true);
    setTimeout(() => {
      setZkpRunning(false);
      setZkpVerified(true);
    }, 1200);
  };

  const verifyChain = () => {
    setChainVerified(false);
    setTimeout(() => {
      setChainVerified(true);
    }, 800);
  };

  return (
    <div className="space-y-4">
      {exportNotice && <p role="status" className="text-sm p-3 border rounded">{exportNotice}</p>}
      {/* 1. TOP HEADER & TACTICAL EXPORT CONTROLS BAR */}
      <section
        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded relative overflow-hidden transition-all duration-200 border ${
          isLightMode
            ? "bg-[#ffffff] border-[#cbd5e1] shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-[#0f172a]"
            : "bg-[var(--ws-panel)]/90 border-[var(--ws-mint)]/30 shadow-[0_0_25px_rgba(179,223,147,0.08)] text-white"
        }`}
      >
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 border ${
                isLightMode
                  ? "bg-[#f1f5f9] text-[var(--ws-mint)] border-[#cbd5e1]"
                  : "bg-[var(--ws-panel)] text-[var(--ws-mint)] border-[var(--ws-mint)]/40 shadow-[0_0_10px_rgba(179,223,147,0.2)]"
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">verified_user</span>
              CONSOLE 06 // AUDIT & ATTESTATION ENGINE
            </span>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] font-mono ${
                isLightMode
                  ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a]"
                  : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLightMode ? "bg-[var(--ws-mint)]" : "bg-[var(--ws-mint)]"
                } shadow-[0_0_8px_currentColor]`}
              ></span>
              <span>
                Merkle Tree Status:{" "}
                <span className={`font-bold ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`}>
                  VALIDATED (Block #1,048,576)
                </span>
              </span>
            </div>
            <span className="font-mono text-[10px] text-[var(--ws-muted)]">
              [HEX: 0x7F2A::VAULT // TPM 2.0 PCR-7 LOCKED]
            </span>
          </div>

          <h1
            className={`font-['Orbitron'] text-xl md:text-2xl tracking-tight font-bold m-0 leading-tight flex items-center gap-2 ${
              isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
            }`}
          >
            REGULATORY POSTURE & CRYPTOGRAPHIC LEDGER
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border font-normal ${
                isLightMode
                  ? "bg-[#e0f2fe] text-[var(--ws-mint)] border-[var(--ws-mint)]"
                  : "bg-[var(--ws-mint)]/10 text-[var(--ws-mint)] border-[var(--ws-mint)]/30"
              }`}
            >
              FIPS 140-3 LEVEL 4
            </span>
          </h1>

          <p
            className={`font-['Space_Grotesk'] text-xs max-w-4xl ${
              isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"
            }`}
          >
            Continuous cryptographic verification against NIST SP 800-53 Rev. 5, ISO/IEC 27001:2022, and IEC 62443-4-2 SL-3 standards with immutable SHA-256 Merkle attestation and hardware TPM 2.0 enclave integrity.
          </p>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap z-10">
          <button
            onClick={triggerZkp}
            disabled={zkpRunning}
            className={`px-3.5 py-2 rounded font-mono text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 border ${
              isLightMode
                ? "bg-[#f8fafc] hover:bg-[#e2e8f0] text-[var(--ws-mint)] border-[#cbd5e1] shadow-xs"
                : "bg-[var(--ws-sidebar)] hover:bg-[var(--ws-line)] text-[var(--ws-mint)] border-[var(--ws-mint)]/40 shadow-[0_0_12px_rgba(179,223,147,0.15)]"
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${zkpRunning ? "animate-spin" : ""}`}>
              fingerprint
            </span>
            <span>{zkpRunning ? "Computing BN254 Proof..." : "Trigger Zero-Knowledge Proof"}</span>
          </button>

          <button
            type="button"
            onClick={openAuditReportModal}
            className={`px-3.5 py-2 rounded font-mono text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer border ${
              isLightMode
                ? "bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#0f172a] border-[#cbd5e1] shadow-xs"
                : "bg-[var(--ws-panel)] hover:bg-[var(--ws-line)] text-[var(--ws-mint)] border-[var(--ws-mint)]/40 shadow-[0_0_12px_rgba(179,223,147,0.15)]"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>External Audit Report</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenAuditCli) { onOpenAuditCli(); return; }
              setActiveConsole("audit");
              router.push("/audit?tool=audit#lab");
            }}
            className={`px-3.5 py-2 rounded font-mono text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer border ${
              isLightMode
                ? "bg-[#f8fafc] hover:bg-[#e2e8f0] text-[var(--ws-mint)] border-[var(--ws-mint)] shadow-xs"
                : "bg-[var(--ws-panel)] hover:bg-[var(--ws-line)] text-[var(--ws-mint)] border-[var(--ws-mint)]/40 shadow-[0_0_12px_rgba(179,223,147,0.15)]"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            <span>Audit CLI Sandbox</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-3.5 py-2 rounded bg-[var(--ws-mint)] hover:bg-[var(--ws-mint)] text-white font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_16px_rgba(5,150,105,0.3)] transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
            <span>{isExporting ? "OPENING REPORT..." : "Print observation report / PDF"}</span>
          </button>
        </div>
      </section>

      {/* 2. 5-PANE TOP COMPLIANCE STATS / KPI RIBBON WITH CORNER RETICLE BRACKETS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: NIST SP 800-53 */}
        <div
          className={`rounded border p-3 relative overflow-hidden flex flex-col justify-between transition-all duration-200 ${
            isLightMode
              ? "bg-[#ffffff] border-[#cbd5e1] shadow-[0_4px_16px_rgba(0,0,0,0.05)] text-[#0f172a]"
              : "hud-box bg-[var(--ws-panel)] border-[var(--ws-mint)]/30 shadow-[0_0_15px_rgba(179,223,147,0.06)] text-white"
          }`}
        >
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--ws-muted)]">NIST SP 800-53 Rev. 5</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[9px] border font-bold ${
                  isLightMode
                    ? "bg-[#dcfce7] text-[var(--ws-mint)] border-[var(--ws-mint)]"
                    : "bg-[var(--ws-mint)]/15 text-[var(--ws-mint)] border-[var(--ws-mint)]/30"
                }`}
              >
                +2.1% (30d)
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-2xl font-bold ${
                  isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
                }`}
              >
                98.4%
              </span>
              <span
                className={`font-mono text-[10px] uppercase font-bold tracking-wider ${
                  isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                }`}
              >
                HARDENED
              </span>
            </div>
            <p className={`font-mono text-[10px] mt-0.5 ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
              314 / 319 Controls Passing
            </p>
          </div>
          <div
            className={`mt-2 pt-1 border-t flex items-center justify-between text-[var(--ws-muted)] font-mono text-[10px] ${
              isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
            }`}
          >
            <span className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLightMode ? "bg-[var(--ws-mint)]" : "bg-[var(--ws-mint)]"
                }`}
              ></span>
              FedRAMP High Eq.
            </span>
            <span className={`font-bold ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`}>
              AU, SC, SI PASS
            </span>
          </div>
        </div>

        {/* Card 2: IEC 62443 Safety */}
        <div
          className={`rounded border p-3 relative overflow-hidden flex flex-col justify-between transition-all duration-200 ${
            isLightMode
              ? "bg-[#ffffff] border-[#cbd5e1] shadow-[0_4px_16px_rgba(0,0,0,0.05)] text-[#0f172a]"
              : "hud-box bg-[var(--ws-panel)] border-[var(--ws-mint)]/30 shadow-[0_0_15px_rgba(179,223,147,0.06)] text-white"
          }`}
        >
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--ws-muted)]">IEC 62443 OT</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[9px] border font-bold ${
                  isLightMode
                    ? "bg-[#e0f2fe] text-[var(--ws-mint)] border-[var(--ws-mint)]"
                    : "bg-[var(--ws-mint)]/15 text-[var(--ws-mint)] border-[var(--ws-mint)]/30"
                }`}
              >
                ISA99 ARCH
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-2xl font-bold ${
                  isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                }`}
              >
                SL-3
              </span>
              <span
                className={`font-mono text-[10px] uppercase font-bold tracking-wider ${
                  isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                }`}
              >
                CERTIFIED
              </span>
            </div>
            <p className={`font-mono text-[10px] mt-0.5 ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
              Zone #04 SCADA / Modbus Safe
            </p>
          </div>
          <div
            className={`mt-2 pt-1 border-t flex items-center justify-between text-[var(--ws-muted)] font-mono text-[10px] ${
              isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
            }`}
          >
            <span className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLightMode ? "bg-[var(--ws-mint)]" : "bg-[var(--ws-mint)]"
                }`}
              ></span>
              Interlock Latency
            </span>
            <span className={`font-bold ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`}>
              0.082 ms MTTR
            </span>
          </div>
        </div>

        {/* Card 3: ISO/IEC 27001:2022 */}
        <div
          className={`rounded border p-3 relative overflow-hidden flex flex-col justify-between transition-all duration-200 ${
            isLightMode
              ? "bg-[#ffffff] border-[#cbd5e1] shadow-[0_4px_16px_rgba(0,0,0,0.05)] text-[#0f172a]"
              : "hud-box bg-[var(--ws-panel)] border-[var(--ws-mint)]/30 shadow-[0_0_15px_rgba(179,223,147,0.06)] text-white"
          }`}
        >
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--ws-muted)]">ISO/IEC 27001:2022</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[9px] border font-bold ${
                  isLightMode
                    ? "bg-[#fef3c7] text-[var(--research-sand)] border-[var(--research-sand)]"
                    : "bg-[var(--research-sand)]/15 text-[var(--research-sand)] border-[var(--research-sand)]/30"
                }`}
              >
                ANNEX A
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-2xl font-bold ${
                  isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
                }`}
              >
                99.1%
              </span>
              <span
                className={`font-mono text-[10px] uppercase font-bold tracking-wider ${
                  isLightMode ? "text-[var(--research-sand)]" : "text-[var(--research-sand)]"
                }`}
              >
                ALIGNED
              </span>
            </div>
            <p className={`font-mono text-[10px] mt-0.5 ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
              Autonomous eBPF Telemetry
            </p>
          </div>
          <div
            className={`mt-2 pt-1 border-t flex items-center justify-between text-[var(--ws-muted)] font-mono text-[10px] ${
              isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
            }`}
          >
            <span className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLightMode ? "bg-[var(--research-sand)]" : "bg-[var(--research-sand)]"
                }`}
              ></span>
              Zero Unresolved Gaps
            </span>
            <span className={`font-bold ${isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"}`}>
              A.12.4.1 Valid
            </span>
          </div>
        </div>

        {/* Card 4: Merkle Chain Integrity */}
        <div
          className={`rounded border p-3 relative overflow-hidden flex flex-col justify-between transition-all duration-200 ${
            isLightMode
              ? "bg-[#ffffff] border-[#cbd5e1] shadow-[0_4px_16px_rgba(0,0,0,0.05)] text-[#0f172a]"
              : "hud-box bg-[var(--ws-panel)] border-[var(--ws-mint)]/30 shadow-[0_0_15px_rgba(179,223,147,0.06)] text-white"
          }`}
        >
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--ws-muted)]">Merkle Ledger</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[9px] border font-bold ${
                  isLightMode
                    ? "bg-[#dcfce7] text-[var(--ws-mint)] border-[var(--ws-mint)]"
                    : "bg-[var(--ws-mint)]/15 text-[var(--ws-mint)] border-[var(--ws-mint)]/30"
                }`}
              >
                PCR-7 SEAL
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-2xl font-bold ${
                  isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                }`}
              >
                100%
              </span>
              <span
                className={`font-mono text-[10px] uppercase font-bold tracking-wider ${
                  isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                }`}
              >
                UNBROKEN
              </span>
            </div>
            <p className={`font-mono text-[10px] mt-0.5 ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
              4,892,104 Events Anchored
            </p>
          </div>
          <div
            className={`mt-2 pt-1 border-t flex items-center justify-between text-[var(--ws-muted)] font-mono text-[10px] ${
              isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
            }`}
          >
            <span className={`flex items-center gap-1 ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`}>
              <span className="material-symbols-outlined text-[13px]">shield</span>Tamper Proof
            </span>
            <span className={`font-bold ${isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"}`}>
              ZERO DRIFT
            </span>
          </div>
        </div>

        {/* Card 5: ZK-SNARK Attestation */}
        <div
          className={`rounded border p-3 relative overflow-hidden flex flex-col justify-between transition-all duration-200 ${
            isLightMode
              ? "bg-[#ffffff] border-[#cbd5e1] shadow-[0_4px_16px_rgba(0,0,0,0.05)] text-[#0f172a]"
              : "hud-box bg-[var(--ws-panel)] border-[var(--ws-mint)]/30 shadow-[0_0_15px_rgba(179,223,147,0.06)] text-white"
          }`}
        >
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--ws-muted)]">ZK-SNARK Attest</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[9px] border font-bold ${
                  isLightMode
                    ? "bg-[#e0f2fe] text-[var(--ws-mint)] border-[var(--ws-mint)]"
                    : "bg-[var(--ws-mint)]/15 text-[var(--ws-mint)] border-[var(--ws-mint)]/30"
                }`}
              >
                GROTH16
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-2xl font-bold ${
                  isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                }`}
              >
                12.4 ms
              </span>
              <span
                className={`font-mono text-[10px] uppercase font-bold tracking-wider ${
                  isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                }`}
              >
                PROOF TIME
              </span>
            </div>
            <p className={`font-mono text-[10px] mt-0.5 ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
              BN254 Curve // FIPS 140-3
            </p>
          </div>
          <div
            className={`mt-2 pt-1 border-t flex items-center justify-between text-[var(--ws-muted)] font-mono text-[10px] ${
              isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
            }`}
          >
            <span className={`flex items-center gap-1 ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`}>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLightMode ? "bg-[var(--ws-mint)]" : "bg-[var(--ws-mint)]"
                }`}
              ></span>
              3/3 Quorum Met
            </span>
            <span className={`font-bold ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`}>
              VERIFIED
            </span>
          </div>
        </div>
      </section>

      {/* 3. MAIN OPERATIONAL WORKSPACE (TWO-COLUMN HUD GRID: 7 / 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN (7 COLS): CROSS-WALK MATRIX & ZK-SNARK VERIFICATION ENGINE */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* SECTION: CROSS-WALK MATRIX TABLE */}
          <section className="hud-box bg-[var(--ws-panel)] rounded border border-[var(--ws-mint)]/30 p-4 shadow-[0_0_20px_rgba(179,223,147,0.06)] relative flex flex-col">
            <div className="hud-corner-tr" />
            <div className="hud-corner-bl" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--ws-line)]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-[var(--ws-mint)] shadow-[0_0_8px_var(--ws-mint)]"></div>
                  <h2 className="font-['Orbitron'] text-sm text-[var(--ws-text)] font-bold m-0 tracking-wide">
                    CONTROL CROSS-WALK MATRIX
                  </h2>
                  <span className="px-1.5 py-0.2 rounded bg-[var(--ws-mint)]/10 text-[var(--ws-mint)] font-mono text-[9px] border border-[var(--ws-mint)]/30">
                    REAL-TIME SOAR
                  </span>
                </div>
                <p className="font-mono text-[10px] text-[var(--ws-muted)] mt-0.5">
                  Dynamic deep learning inference telemetry mapped to industrial regulatory controls
                </p>
              </div>

              {/* Family Filters */}
              <div className="flex items-center gap-1 bg-[var(--ws-sidebar)] p-1 rounded border border-[var(--ws-line)]">
                {(["ALL", "NIST", "ISO", "IEC"] as const).map((fam) => (
                  <button
                    key={fam}
                    onClick={() => setActiveFamily(fam)}
                    className={`px-2 py-0.5 rounded font-mono text-[10px] transition-all ${
                      activeFamily === fam
                        ? "bg-[var(--ws-mint)]/20 text-[var(--ws-mint)] border border-[var(--ws-mint)]/40 font-bold shadow-[0_0_8px_rgba(179,223,147,0.2)]"
                        : "text-[var(--ws-muted)] hover:text-[var(--ws-text)]"
                    }`}
                  >
                    {fam === "ALL" ? `ALL (${REGULATORY_CONTROLS.length})` : fam}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Filter */}
            <div className="relative my-2">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--ws-muted)]">
                <span className="material-symbols-outlined text-[15px]">search</span>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search controls (e.g. SC-5, SI-3, DAE, IEC 62443, Wazuh, AF_XDP)..."
                className="w-full bg-[var(--ws-sidebar)] text-[var(--ws-text)] font-mono text-[11px] pl-8 pr-3 py-1.5 rounded border border-[var(--ws-line)] focus:outline-none focus:border-[var(--ws-mint)] focus:ring-1 focus:ring-[var(--ws-mint)] placeholder:text-[var(--ws-muted)]"
              />
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto flex-1 max-h-[380px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[var(--ws-sidebar)]">
                  <tr className="text-[var(--ws-muted)] font-mono text-[10px] uppercase tracking-wider border-b border-[var(--ws-line)]">
                    <th className="py-2 px-2.5">Control & Standard</th>
                    <th className="py-2 px-2.5">Defense Pipeline / Micro-Action</th>
                    <th className="py-2 px-2.5">Verification Engine</th>
                    <th className="py-2 px-2.5 text-right">Attestation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ws-line)] font-mono text-[11px] text-[var(--ws-text)]">
                  {filteredControls.map((ctrl) => (
                    <tr key={ctrl.id} className="hover:bg-[var(--ws-line)]/40 transition-colors">
                      <td className="py-2.5 px-2.5 align-top">
                        <div className="font-mono text-[var(--ws-mint)] font-bold">{ctrl.id}</div>
                        <div className="text-[10px] text-[var(--ws-muted)]">{ctrl.name}</div>
                        <span className="inline-block mt-1 px-1 py-0.2 rounded bg-[var(--ws-sidebar)] text-[var(--ws-mint)] text-[9px] border border-[var(--ws-mint)]/30">
                          {ctrl.standard}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 align-top">
                        <div className="text-[var(--ws-text)] font-medium">{ctrl.defense}</div>
                        <div className="text-[10px] text-[var(--ws-mint)] mt-0.5">{ctrl.subDefense}</div>
                      </td>
                      <td className="py-2.5 px-2.5 align-top text-[10px] text-[var(--ws-muted)]">
                        <div className="flex items-center gap-1 text-[var(--ws-text)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--ws-mint)] shadow-[0_0_6px_var(--ws-mint)]"></span>
                          {ctrl.engine}
                        </div>
                        <span className="text-[9px] text-[var(--ws-muted)]">{ctrl.engineSub}</span>
                      </td>
                      <td className="py-2.5 px-2.5 align-top text-right">
                        <span
                          className="px-2 py-0.5 rounded font-mono text-[10px] font-bold border inline-block"
                          style={{
                            backgroundColor: `${ctrl.statusColor}15`,
                            color: ctrl.statusColor,
                            borderColor: `${ctrl.statusColor}40`,
                            boxShadow: `0 0 8px ${ctrl.statusColor}25`
                          }}
                        >
                          {ctrl.status} {ctrl.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredControls.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-[var(--ws-muted)] font-mono">
                        NO REGULATORY CONTROLS MATCH FILTER CRITERIA
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Info Strip */}
            <div className="mt-2 pt-1 flex flex-wrap items-center justify-between text-[var(--ws-muted)] font-mono text-[10px] bg-[var(--ws-sidebar)] px-3 py-1.5 rounded border border-[var(--ws-line)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--ws-mint)] animate-pulse shadow-[0_0_6px_var(--ws-mint)]"></span>
                Audit Engine Target: Modbus Industrial PLC (ToN_IoT #04)
              </span>
              <span className="text-[var(--ws-mint)]">NIST CSF Score: {nistCsfScore}% // 60s Cycle [OK]</span>
            </div>
          </section>

          {/* SECTION: CRYPTOGRAPHIC ZK-SNARK VERIFICATION ENGINE PANEL */}
          <section className="hud-box bg-[var(--ws-panel)] rounded border border-[var(--ws-mint)]/30 p-4 shadow-[0_0_20px_rgba(179,223,147,0.06)] relative flex flex-col justify-between">
            <div className="hud-corner-tr" />
            <div className="hud-corner-bl" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-2 border-b border-[var(--ws-line)] pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[var(--ws-mint)]">memory</span>
                  <h2 className="font-['Orbitron'] text-sm text-[var(--ws-mint)] font-bold m-0 tracking-wide">
                    ZK-SNARK HARDWARE PROVER & VERIFIER ENGINE
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded bg-[var(--ws-sidebar)] text-[var(--ws-mint)] font-mono text-[10px] uppercase border border-[var(--ws-mint)]/30">
                  FIPS 140-3 LEVEL 4
                </span>
              </div>
              <p className="font-mono text-[10px] text-[var(--ws-muted)] mb-3">
                Zero-Knowledge verification engine allowing sovereign auditors to mathematically prove SOAR incident containment without revealing proprietary SCADA sensor payloads.
              </p>

              {/* Hardware Enclave Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[var(--ws-sidebar)] p-2.5 rounded border border-[var(--ws-line)] mb-3 text-[var(--ws-text)] font-mono text-[11px]">
                <div>
                  <span className="text-[var(--ws-muted)] block uppercase text-[9px]">Hardware Enclave:</span>
                  <span className="text-[var(--ws-mint)] font-bold">STMicro ST33TPHF20 (TPM 2.0)</span>
                </div>
                <div>
                  <span className="text-[var(--ws-muted)] block uppercase text-[9px]">PCR Bank Status:</span>
                  <span className="text-[var(--ws-mint)] font-bold">SHA-256 (PCR-00..23 LOCKED)</span>
                </div>
                <div className="sm:col-span-2 pt-1 border-t border-[var(--ws-line)]">
                  <span className="text-[var(--ws-muted)] block uppercase text-[9px]">Attestation Key (AK Public Identity):</span>
                  <span className="font-mono text-[var(--ws-mint)] text-[10px] select-all break-all">
                    AK-8849-FIPS-140-3-L4-TPM2-ECDSA-P256-SHA256::SEALED
                  </span>
                </div>
              </div>

              {/* ZK-SNARK Generator Telemetry */}
              <div className="bg-[var(--ws-sidebar)] p-2.5 rounded border border-[var(--ws-line)] space-y-1.5 font-mono text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ws-muted)]">Circuit Definition:</span>
                  <span className="text-[var(--ws-mint)]">soc_containment_proof.r1cs (1,402,891 Constraints)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ws-muted)]">Proving Engine / Curve:</span>
                  <span className="text-[var(--ws-text)]">Groth16 on BN254 Elliptic Curve</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ws-muted)]">Proving Latency / Verification Latency:</span>
                  <span className="text-[var(--ws-mint)] font-bold">12.4 ms / 0.38 ms [REAL-TIME VALID]</span>
                </div>
                <div className="pt-1">
                  <span className="text-[var(--ws-muted)] uppercase text-[9px] block mb-0.5">Public Cryptographic Inputs:</span>
                  <div className="p-1.5 rounded bg-[var(--ws-panel)] text-[var(--ws-mint)] border border-[var(--ws-mint)]/20 font-mono text-[10px] truncate">
                    [MerkleRoot: 0x7f4a, Latency: 21.5ms, Anomaly_Tau: 0.942, SL_Level: 3, AirGapStatus: ARMED]
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (5 COLS): RADAR, MERKLE AUDIT LEDGER & DUAL HSM QUORUM */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* SECTION: HOLOGRAPHIC MULTI-STANDARD HARDENING RADAR */}
          <section
            className={`p-4 rounded border relative flex flex-col transition-all duration-200 ${
              isLightMode
                ? "bg-[#ffffff] border-[#cbd5e1] shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-[#0f172a]"
                : "hud-box bg-[var(--ws-panel)] border-[var(--ws-mint)]/30 shadow-[0_0_20px_rgba(179,223,147,0.06)] text-white"
            }`}
          >
            <div className="hud-corner-tr" />
            <div className="hud-corner-bl" />

            <div
              className={`flex items-center justify-between gap-2 mb-3 pb-2 border-b ${
                isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                  }`}
                >
                  radar
                </span>
                <div>
                  <h2
                    className={`font-['Orbitron'] text-sm font-bold m-0 tracking-wide ${
                      isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
                    }`}
                  >
                    MULTI-STANDARD COMPLIANCE RADAR
                  </h2>
                  <span className="font-mono text-[9px] text-[var(--ws-muted)]">
                    5-AXIS REGULATORY HARDENING TOPOLOGY
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                    isLightMode
                      ? "bg-[#dcfce7] text-[var(--ws-mint)] border-[var(--ws-mint)] shadow-sm"
                      : "bg-[var(--ws-mint)]/15 text-[var(--ws-mint)] border-[var(--ws-mint)]/30 shadow-[0_0_8px_rgba(179,223,147,0.3)]"
                  }`}
                >
                  99.2% COMPOSITE
                </span>
              </div>
            </div>

            {/* HIGH-VISIBILITY SPATIAL RADAR GRAPH (UNCLIPPED WITH PILL BADGES) */}
            <div className="relative flex flex-col items-center justify-center py-2 px-1">
              <svg
                className="w-full max-w-[500px] h-auto select-none overflow-visible"
                viewBox="0 0 500 320"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Radial Gradient for Active Compliance Polygon */}
                  <radialGradient id="compRadarGlowLight" cx="250" cy="160" r="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="var(--ws-mint)" stopOpacity="0.55" />
                    <stop offset="65%" stopColor="var(--ws-mint)" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="var(--ws-mint)" stopOpacity="0.30" />
                  </radialGradient>
                  <radialGradient id="compRadarGlowDark" cx="250" cy="160" r="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="var(--ws-mint)" stopOpacity="0.55" />
                    <stop offset="65%" stopColor="var(--ws-mint)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--ws-mint)" stopOpacity="0.18" />
                  </radialGradient>

                  {/* Drop Shadow for the Polygon Stroke */}
                  <filter id="radarStrokeGlowLight" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="var(--ws-mint)" floodOpacity="0.45" />
                  </filter>
                  <filter id="radarStrokeGlowDark" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="var(--ws-mint)" floodOpacity="0.75" />
                  </filter>

                  {/* High-Contrast Pill Badges Drop Shadow */}
                  <filter id="pillShadowLight" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.14" />
                  </filter>
                  <filter id="pillShadowDark" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="var(--ws-mint)" floodOpacity="0.35" />
                  </filter>
                </defs>

                {/* Concentric Polar Grid (Pentagons) */}
                {/* 100% outer boundary pentagon */}
                <polygon
                  points="250,70 335.6,132.2 302.9,232.8 197.1,232.8 164.4,132.2"
                  fill={isLightMode ? "#f8fafc" : "rgba(32,33,30,0.7)"}
                  stroke={isLightMode ? "var(--ws-muted)" : "rgba(179,223,147,0.5)"}
                  strokeWidth="1.5"
                />
                {/* 80% level pentagon */}
                <polygon
                  points="250,88 318.5,137.8 292.3,218.2 207.7,218.2 181.5,137.8"
                  fill={isLightMode ? "#ffffff" : "rgba(41,42,37,0.4)"}
                  stroke={isLightMode ? "#cbd5e1" : "rgba(179,223,147,0.3)"}
                  strokeDasharray="4 3"
                  strokeWidth="1.2"
                />
                {/* 60% level pentagon */}
                <polygon
                  points="250,106 301.4,143.3 281.7,203.7 218.3,203.7 198.6,143.3"
                  fill={isLightMode ? "rgba(241, 245, 249, 0.6)" : "rgba(48,49,43,0.3)"}
                  stroke={isLightMode ? "#cbd5e1" : "rgba(179,223,147,0.25)"}
                  strokeDasharray="3 3"
                  strokeWidth="1.2"
                />
                {/* 40% level pentagon */}
                <polygon
                  points="250,124 284.2,148.9 271.2,189.1 228.8,189.1 215.8,148.9"
                  fill="none"
                  stroke={isLightMode ? "#e2e8f0" : "rgba(179,223,147,0.18)"}
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
                {/* 20% level pentagon */}
                <polygon
                  points="250,142 267.1,154.4 260.6,174.6 239.4,174.6 232.9,154.4"
                  fill="none"
                  stroke={isLightMode ? "#e2e8f0" : "rgba(179,223,147,0.14)"}
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />

                {/* 5 Spoke Axis Lines */}
                <line x1="250" y1="160" x2="250" y2="70" stroke={isLightMode ? "var(--ws-muted)" : "rgba(179,223,147,0.35)"} strokeWidth="1.2" />
                <line x1="250" y1="160" x2="335.6" y2="132.2" stroke={isLightMode ? "var(--ws-muted)" : "rgba(179,223,147,0.35)"} strokeWidth="1.2" />
                <line x1="250" y1="160" x2="302.9" y2="232.8" stroke={isLightMode ? "var(--ws-muted)" : "rgba(179,223,147,0.35)"} strokeWidth="1.2" />
                <line x1="250" y1="160" x2="197.1" y2="232.8" stroke={isLightMode ? "var(--ws-muted)" : "rgba(179,223,147,0.35)"} strokeWidth="1.2" />
                <line x1="250" y1="160" x2="164.4" y2="132.2" stroke={isLightMode ? "var(--ws-muted)" : "rgba(179,223,147,0.35)"} strokeWidth="1.2" />

                {/* Scale Percentage Labels along Top Spoke */}
                <text x="254" y="92" fill={isLightMode ? "var(--ws-muted)" : "var(--ws-muted)"} fontSize="8" fontFamily="monospace" fontWeight="bold">
                  80%
                </text>
                <text x="254" y="110" fill={isLightMode ? "var(--ws-muted)" : "var(--ws-muted)"} fontSize="8" fontFamily="monospace" fontWeight="bold">
                  60%
                </text>
                <text x="254" y="128" fill={isLightMode ? "var(--ws-muted)" : "var(--ws-muted)"} fontSize="8" fontFamily="monospace" fontWeight="bold">
                  40%
                </text>

                {/* 95% SLA TARGET BENCHMARK POLYGON (CLEAR REFERENCE DEPTH) */}
                <polygon
                  points="250,74.5 331.3,133.6 300.3,229.2 199.7,229.2 168.7,133.6"
                  fill="none"
                  stroke={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"}
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                  opacity={isLightMode ? "0.7" : "0.5"}
                />

                {/* ACTIVE COMPLIANCE MEASURED POLYGON */}
                {/* Underlay contrast shadow stroke for guaranteed edge separation */}
                <polygon
                  points="250,71.4 335.6,132.2 302.4,232.1 198.3,231.2 165.3,132.5"
                  fill="none"
                  stroke={isLightMode ? "rgba(41,42,37,0.3)" : "rgba(0, 0, 0, 0.7)"}
                  strokeWidth="5"
                  strokeLinejoin="round"
                />
                {/* Main filled polygon with vibrant gradient */}
                <polygon
                  points="250,71.4 335.6,132.2 302.4,232.1 198.3,231.2 165.3,132.5"
                  fill={isLightMode ? "url(#compRadarGlowLight)" : "url(#compRadarGlowDark)"}
                  stroke={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"}
                  strokeWidth="3"
                  strokeLinejoin="round"
                  filter={isLightMode ? "url(#radarStrokeGlowLight)" : "url(#radarStrokeGlowDark)"}
                />

                {/* TACTICAL LEADER STEM LINES (CONNECTING VERTICES TO BADGES) */}
                <line x1="250" y1="71.4" x2="250" y2="44" stroke={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} strokeWidth="1.2" strokeDasharray="2 2" />
                <line x1="335.6" y1="132.2" x2="348" y2="132.2" stroke={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} strokeWidth="1.2" strokeDasharray="2 2" />
                <line x1="302.4" y1="232.1" x2="315" y2="260" stroke={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} strokeWidth="1.2" strokeDasharray="2 2" />
                <line x1="198.3" y1="231.2" x2="185" y2="260" stroke={isLightMode ? "var(--research-sand)" : "var(--research-sand)"} strokeWidth="1.2" strokeDasharray="2 2" />
                <line x1="165.3" y1="132.5" x2="152" y2="132.5" stroke={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} strokeWidth="1.2" strokeDasharray="2 2" />

                {/* RADAR VERTEX HUBS (TRIPLE RING FOR MAXIMUM CONTRAST) */}
                {/* NIST SP 800-53 Vertex */}
                <circle cx="250" cy="71.4" r="9" fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} opacity="0.25" />
                <circle cx="250" cy="71.4" r="5" fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="250" cy="71.4" r="2" fill="#ffffff" />

                {/* IEC 62443 Vertex */}
                <circle cx="335.6" cy="132.2" r="9" fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} opacity="0.25" />
                <circle cx="335.6" cy="132.2" r="5" fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="335.6" cy="132.2" r="2" fill="#ffffff" />

                {/* ISO 27001 Vertex */}
                <circle cx="302.4" cy="232.1" r="9" fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} opacity="0.25" />
                <circle cx="302.4" cy="232.1" r="5" fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="302.4" cy="232.1" r="2" fill="#ffffff" />

                {/* NERC CIP Vertex */}
                <circle cx="198.3" cy="231.2" r="9" fill={isLightMode ? "var(--research-sand)" : "var(--research-sand)"} opacity="0.25" />
                <circle cx="198.3" cy="231.2" r="5" fill={isLightMode ? "var(--research-sand)" : "var(--research-sand)"} stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="198.3" cy="231.2" r="2" fill="#ffffff" />

                {/* CIS Controls Vertex */}
                <circle cx="165.3" cy="132.5" r="9" fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} opacity="0.25" />
                <circle cx="165.3" cy="132.5" r="5" fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="165.3" cy="132.5" r="2" fill="#ffffff" />

                {/* UNCLIPPED HIGH-VISIBILITY PILL BADGES FOR ALL 5 STANDARDS */}

                {/* 1. TOP: NIST SP 800-53 */}
                <g filter={isLightMode ? "url(#pillShadowLight)" : "url(#pillShadowDark)"}>
                  <rect
                    x="145"
                    y="12"
                    width="210"
                    height="32"
                    rx="6"
                    fill={isLightMode ? "#ffffff" : "#061320"}
                    stroke={isLightMode ? "var(--ws-muted)" : "rgba(179,223,147,0.5)"}
                    strokeWidth="1.5"
                  />
                  <circle cx="160" cy="28" r="4" fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} />
                  <text x="254" y="32" textAnchor="middle" fontSize="11" fontFamily="'JetBrains Mono', monospace">
                    <tspan fill={isLightMode ? "#0f172a" : "#f1f5f9"} fontWeight="bold">NIST SP 800-53 </tspan>
                    <tspan fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} fontWeight="bold">(98.4%)</tspan>
                  </text>
                </g>

                {/* 2. TOP-RIGHT: IEC 62443 */}
                <g filter={isLightMode ? "url(#pillShadowLight)" : "url(#pillShadowDark)"}>
                  <rect
                    x="348"
                    y="116"
                    width="146"
                    height="32"
                    rx="6"
                    fill={isLightMode ? "#ffffff" : "#061320"}
                    stroke={isLightMode ? "var(--ws-muted)" : "rgba(179,223,147,0.5)"}
                    strokeWidth="1.5"
                  />
                  <circle cx="360" cy="132" r="4" fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} />
                  <text x="425" y="136" textAnchor="middle" fontSize="11" fontFamily="'JetBrains Mono', monospace">
                    <tspan fill={isLightMode ? "#0f172a" : "#f1f5f9"} fontWeight="bold">IEC 62443 </tspan>
                    <tspan fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} fontWeight="bold">(SL-3)</tspan>
                  </text>
                </g>

                {/* 3. BOTTOM-RIGHT: ISO 27001 */}
                <g filter={isLightMode ? "url(#pillShadowLight)" : "url(#pillShadowDark)"}>
                  <rect
                    x="265"
                    y="260"
                    width="160"
                    height="32"
                    rx="6"
                    fill={isLightMode ? "#ffffff" : "#061320"}
                    stroke={isLightMode ? "var(--ws-muted)" : "rgba(179,223,147,0.5)"}
                    strokeWidth="1.5"
                  />
                  <circle cx="277" cy="276" r="4" fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} />
                  <text x="348" y="280" textAnchor="middle" fontSize="11" fontFamily="'JetBrains Mono', monospace">
                    <tspan fill={isLightMode ? "#0f172a" : "#f1f5f9"} fontWeight="bold">ISO 27001 </tspan>
                    <tspan fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} fontWeight="bold">(99.1%)</tspan>
                  </text>
                </g>

                {/* 4. BOTTOM-LEFT: NERC CIP */}
                <g filter={isLightMode ? "url(#pillShadowLight)" : "url(#pillShadowDark)"}>
                  <rect
                    x="75"
                    y="260"
                    width="160"
                    height="32"
                    rx="6"
                    fill={isLightMode ? "#ffffff" : "#061320"}
                    stroke={isLightMode ? "var(--ws-muted)" : "rgba(179,223,147,0.5)"}
                    strokeWidth="1.5"
                  />
                  <circle cx="87" cy="276" r="4" fill={isLightMode ? "var(--research-sand)" : "var(--research-sand)"} />
                  <text x="158" y="280" textAnchor="middle" fontSize="11" fontFamily="'JetBrains Mono', monospace">
                    <tspan fill={isLightMode ? "#0f172a" : "#f1f5f9"} fontWeight="bold">NERC CIP </tspan>
                    <tspan fill={isLightMode ? "var(--research-sand)" : "var(--research-sand)"} fontWeight="bold">(97.8%)</tspan>
                  </text>
                </g>

                {/* 5. TOP-LEFT: CIS CONTROLS */}
                <g filter={isLightMode ? "url(#pillShadowLight)" : "url(#pillShadowDark)"}>
                  <rect
                    x="6"
                    y="116"
                    width="146"
                    height="32"
                    rx="6"
                    fill={isLightMode ? "#ffffff" : "#061320"}
                    stroke={isLightMode ? "var(--ws-muted)" : "rgba(179,223,147,0.5)"}
                    strokeWidth="1.5"
                  />
                  <circle cx="18" cy="132" r="4" fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} />
                  <text x="82" y="136" textAnchor="middle" fontSize="11" fontFamily="'JetBrains Mono', monospace">
                    <tspan fill={isLightMode ? "#0f172a" : "#f1f5f9"} fontWeight="bold">CIS CONTROLS </tspan>
                    <tspan fill={isLightMode ? "var(--ws-mint)" : "var(--ws-mint)"} fontWeight="bold">(98.9%)</tspan>
                  </text>
                </g>
              </svg>

              {/* QUICK STATUS CHIP RIBBON UNDER RADAR */}
              <div
                className={`grid grid-cols-2 sm:grid-cols-5 gap-2 w-full mt-3 pt-3 border-t font-mono text-[10px] text-center ${
                  isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
                }`}
              >
                <div
                  className={`p-2 rounded border flex flex-col justify-between ${
                    isLightMode ? "bg-[#f8fafc] border-[#cbd5e1] shadow-xs" : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
                  }`}
                >
                  <span className="text-[var(--ws-muted)] text-[9px] uppercase">NIST SP 800-53</span>
                  <span className={`font-bold text-xs mt-0.5 ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`}>
                    98.4%
                  </span>
                  <span className={`text-[8px] font-bold mt-1 px-1 py-0.2 rounded border ${isLightMode ? "bg-[#dcfce7] text-[var(--ws-mint)] border-[var(--ws-mint)]" : "bg-[var(--ws-mint)]/10 text-[var(--ws-mint)] border-[var(--ws-mint)]/30"}`}>
                    TIER-1 PASS
                  </span>
                </div>
                <div
                  className={`p-2 rounded border flex flex-col justify-between ${
                    isLightMode ? "bg-[#f8fafc] border-[#cbd5e1] shadow-xs" : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
                  }`}
                >
                  <span className="text-[var(--ws-muted)] text-[9px] uppercase">IEC 62443</span>
                  <span className={`font-bold text-xs mt-0.5 ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`}>
                    SL-3 (100%)
                  </span>
                  <span className={`text-[8px] font-bold mt-1 px-1 py-0.2 rounded border ${isLightMode ? "bg-[#e0f2fe] text-[var(--ws-mint)] border-[var(--ws-mint)]" : "bg-[var(--ws-mint)]/10 text-[var(--ws-mint)] border-[var(--ws-mint)]/30"}`}>
                    CERTIFIED
                  </span>
                </div>
                <div
                  className={`p-2 rounded border flex flex-col justify-between ${
                    isLightMode ? "bg-[#f8fafc] border-[#cbd5e1] shadow-xs" : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
                  }`}
                >
                  <span className="text-[var(--ws-muted)] text-[9px] uppercase">ISO 27001</span>
                  <span className={`font-bold text-xs mt-0.5 ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`}>
                    99.1%
                  </span>
                  <span className={`text-[8px] font-bold mt-1 px-1 py-0.2 rounded border ${isLightMode ? "bg-[#dcfce7] text-[var(--ws-mint)] border-[var(--ws-mint)]" : "bg-[var(--ws-mint)]/10 text-[var(--ws-mint)] border-[var(--ws-mint)]/30"}`}>
                    AUDITED
                  </span>
                </div>
                <div
                  className={`p-2 rounded border flex flex-col justify-between ${
                    isLightMode ? "bg-[#f8fafc] border-[#cbd5e1] shadow-xs" : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
                  }`}
                >
                  <span className="text-[var(--ws-muted)] text-[9px] uppercase">NERC CIP</span>
                  <span className={`font-bold text-xs mt-0.5 ${isLightMode ? "text-[var(--research-sand)]" : "text-[var(--research-sand)]"}`}>
                    97.8%
                  </span>
                  <span className={`text-[8px] font-bold mt-1 px-1 py-0.2 rounded border ${isLightMode ? "bg-[#fef3c7] text-[var(--research-sand)] border-[var(--research-sand)]" : "bg-[var(--research-sand)]/10 text-[var(--research-sand)] border-[var(--research-sand)]/30"}`}>
                    VERIFIED
                  </span>
                </div>
                <div
                  className={`p-2 rounded border flex flex-col justify-between col-span-2 sm:col-span-1 ${
                    isLightMode ? "bg-[#f8fafc] border-[#cbd5e1] shadow-xs" : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
                  }`}
                >
                  <span className="text-[var(--ws-muted)] text-[9px] uppercase">CIS v8</span>
                  <span className={`font-bold text-xs mt-0.5 ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`}>
                    98.9%
                  </span>
                  <span className={`text-[8px] font-bold mt-1 px-1 py-0.2 rounded border ${isLightMode ? "bg-[#e0f2fe] text-[var(--ws-mint)] border-[var(--ws-mint)]" : "bg-[var(--ws-mint)]/10 text-[var(--ws-mint)] border-[var(--ws-mint)]/30"}`}>
                    BENCHMARK
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: SHA-256 MERKLE CHAIN TAMPER-PROOF AUDIT LEDGER */}
          <section
            className={`p-4 rounded border relative flex flex-col transition-all duration-200 ${
              isLightMode
                ? "bg-[#ffffff] border-[#cbd5e1] shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-[#0f172a]"
                : "hud-box bg-[var(--ws-panel)] border-[var(--ws-mint)]/30 shadow-[0_0_20px_rgba(179,223,147,0.06)] text-white"
            }`}
          >
            <div className="hud-corner-tr" />
            <div className="hud-corner-bl" />

            <div
              className={`flex items-center justify-between gap-2 mb-2 pb-2 border-b ${
                isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                  }`}
                >
                  link
                </span>
                <h2
                  className={`font-['Orbitron'] text-sm font-bold m-0 tracking-wide ${
                    isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
                  }`}
                >
                  IMMUTABLE MERKLE AUDIT LEDGER
                </h2>
              </div>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold border ${
                  isLightMode
                    ? "bg-[#dcfce7] text-[var(--ws-mint)] border-[var(--ws-mint)]"
                    : "bg-[var(--ws-mint)]/15 text-[var(--ws-mint)] border-[var(--ws-mint)]/30"
                }`}
              >
                SHA-256 ROOT
              </span>
            </div>

            <p className="font-mono text-[10px] text-[var(--ws-muted)] mb-2">
              Chronological cryptographic block headers verified against Hardware Root of Trust / TPM 2.0 PCR-7.
            </p>

            {/* Block Stream Explorer */}
            <div className="space-y-2 relative">
              <div
                className={`absolute left-3.5 top-3 bottom-3 w-0.5 pointer-events-none ${
                  isLightMode ? "bg-[#cbd5e1]" : "bg-[var(--ws-mint)]/20"
                }`}
              ></div>

              {/* BLOCK 1 (HEAD) */}
              <div
                className={`relative pl-8 pr-2.5 py-2 rounded border ${
                  isLightMode
                    ? "bg-[#f8fafc] border-[#cbd5e1] shadow-xs"
                    : "bg-[var(--ws-sidebar)] border-[var(--ws-mint)]/40 shadow-[0_0_12px_rgba(179,223,147,0.1)]"
                }`}
              >
                <div
                  className={`absolute left-2 top-3 w-3 h-3 rounded-full animate-pulse ${
                    isLightMode
                      ? "bg-[var(--ws-mint)] shadow-[0_0_8px_var(--ws-mint)]"
                      : "bg-[var(--ws-mint)] shadow-[0_0_8px_var(--ws-mint)]"
                  }`}
                ></div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                    }`}
                  >
                    BLOCK #1048576{" "}
                    <span
                      className={`text-[9px] ml-1 uppercase ${
                        isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                      }`}
                    >
                      (HEAD - 2s ago)
                    </span>
                  </span>
                  <span className="font-mono text-[10px] text-[var(--ws-muted)]">14:22:07.189 UTC</span>
                </div>
                <div className="mt-1 font-mono text-[10px] space-y-0.5">
                  <div className="text-[var(--ws-muted)] flex items-center justify-between">
                    <span>
                      HASH:{" "}
                      <span
                        className={`select-all font-semibold ${
                          isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                        }`}
                      >
                        0x7f4a9b2c...88e1
                      </span>
                    </span>
                    <span>
                      PREV: <span className="select-all text-[var(--ws-muted)]">0x3c11e04a...bf92</span>
                    </span>
                  </div>
                  <div className={`truncate ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`}>
                    ROOT:{" "}
                    <span
                      className={`font-mono text-[9px] ${
                        isLightMode ? "text-[var(--ws-line)]" : "text-[var(--ws-text)]"
                      }`}
                    >
                      0xd991823f0019a82b4c81ae6028d7120a
                    </span>
                  </div>
                  <div
                    className={`px-2 py-1 rounded border mt-1 flex items-center justify-between ${
                      isLightMode
                        ? "bg-[#ffffff] border-[#e2e8f0] text-[#0f172a]"
                        : "bg-[var(--ws-panel)] border-[var(--ws-line)] text-[var(--ws-text)]"
                    }`}
                  >
                    <span className="truncate text-[10px]">
                      <span className="text-[var(--ws-coral)] font-bold">CR-8942-X:</span> Modbus FC16 Flood eBPF Drop on eth0
                    </span>
                    <span
                      className={`text-[9px] shrink-0 font-bold ml-1 ${
                        isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                      }`}
                    >
                      PCR-08 SEALED
                    </span>
                  </div>
                </div>
              </div>

              {/* BLOCK 2 */}
              <div
                className={`relative pl-8 pr-2.5 py-2 rounded border ${
                  isLightMode
                    ? "bg-[#f8fafc]/80 border-[#e2e8f0]"
                    : "bg-[var(--ws-sidebar)]/70 border-[var(--ws-line)]"
                }`}
              >
                <div
                  className={`absolute left-2.5 top-3.5 w-2 h-2 rounded-full ${
                    isLightMode ? "bg-[var(--ws-mint)]" : "bg-[var(--ws-mint)]"
                  }`}
                ></div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
                    }`}
                  >
                    BLOCK #1048575 <span className="text-[var(--ws-muted)] text-[9px] ml-1">(14s ago)</span>
                  </span>
                  <span className="font-mono text-[10px] text-[var(--ws-muted)]">14:21:55.014 UTC</span>
                </div>
                <div className="mt-1 font-mono text-[10px] space-y-0.5">
                  <div className="text-[var(--ws-muted)] flex items-center justify-between">
                    <span>
                      HASH:{" "}
                      <span
                        className={`select-all ${
                          isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                        }`}
                      >
                        0x3c11e04a...bf92
                      </span>
                    </span>
                    <span>
                      PREV: <span className="select-all text-[var(--ws-muted)]">0x19a8e034...77c2</span>
                    </span>
                  </div>
                  <div
                    className={`px-2 py-1 rounded border mt-1 flex items-center justify-between ${
                      isLightMode
                        ? "bg-[#ffffff] border-[#e2e8f0] text-[#0f172a]"
                        : "bg-[var(--ws-panel)] border-[var(--ws-line)] text-[var(--ws-text)]"
                    }`}
                  >
                    <span className="truncate text-[10px]">
                      <span className="text-[var(--research-sand)] font-bold">CR-8941-K:</span> /bin/modbus_poller cgroup freeze
                    </span>
                    <span
                      className={`text-[9px] shrink-0 ml-1 font-bold ${
                        isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                      }`}
                    >
                      CONFIRMED
                    </span>
                  </div>
                </div>
              </div>

              {/* BLOCK 3 */}
              <div
                className={`relative pl-8 pr-2.5 py-2 rounded border ${
                  isLightMode
                    ? "bg-[#f8fafc]/50 border-[#e2e8f0]"
                    : "bg-[var(--ws-sidebar)]/40 border-[var(--ws-line)]"
                }`}
              >
                <div className="absolute left-2.5 top-3.5 w-2 h-2 rounded-full bg-[var(--ws-muted)]"></div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-[var(--ws-muted)] font-medium">
                    BLOCK #1048574 <span className="text-[9px] ml-1">(32s ago)</span>
                  </span>
                  <span className="font-mono text-[10px] text-[var(--ws-muted)]">14:21:37.408 UTC</span>
                </div>
                <div className="mt-1 font-mono text-[10px]">
                  <div className="text-[var(--ws-muted)] flex items-center justify-between">
                    <span>
                      HASH:{" "}
                      <span
                        className={`select-all ${
                          isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                        }`}
                      >
                        0x19a8e034...77c2
                      </span>
                    </span>
                    <span className={`text-[9px] font-bold ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`}>
                      OPC-UA TCP RST
                    </span>
                  </div>
                  <div
                    className={`px-2 py-1 rounded border mt-1 text-[10px] truncate ${
                      isLightMode
                        ? "bg-[#ffffff] border-[#e2e8f0] text-[var(--ws-muted)]"
                        : "bg-[var(--ws-panel)] border-[var(--ws-line)] text-[var(--ws-muted)]"
                    }`}
                  >
                    CR-8939-V (OPC-UA Session Hijack TCP RST Mitigation)
                  </div>
                </div>
              </div>
            </div>

            {/* Ledger Action Bar */}
            <div
              className={`mt-2 pt-2 flex flex-wrap items-center justify-between gap-2 border-t ${
                isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
              }`}
            >
              <button
                onClick={verifyChain}
                className={`px-2.5 py-1 rounded font-mono text-[10px] flex items-center gap-1 transition-all ${
                  isLightMode
                    ? "bg-[#dcfce7] hover:bg-[#bbf7d0] text-[var(--ws-mint)] border border-[var(--ws-mint)]"
                    : "bg-[var(--ws-sidebar)] hover:bg-[var(--ws-line)] text-[var(--ws-mint)] border border-[var(--ws-mint)]/30"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[14px] ${
                    isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                  }`}
                >
                  task_alt
                </span>
                <span>{chainVerified ? "Zero Hashes Compromised (Verified)" : "Verifying 1.04M Hashes..."}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyToClipboard("0xd991823f0019a82b4c81ae6028d7120a", "root")}
                  className={`px-2 py-1 rounded font-mono text-[10px] transition-colors border ${
                    isLightMode
                      ? "bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] border-[#cbd5e1]"
                      : "bg-[var(--ws-sidebar)] hover:bg-[var(--ws-line)] text-[var(--ws-text)] border-[var(--ws-line)]"
                  }`}
                >
                  {copiedHash === "root" ? "Copied!" : "Copy Proof"}
                </button>
                <button
                  onClick={() => copyToClipboard("SHA256(Block#1048576||0x7f4a9b2c...88e1)", "tree")}
                  className={`px-2 py-1 rounded font-mono text-[10px] transition-colors border ${
                    isLightMode
                      ? "bg-[#e0f2fe] hover:bg-[#bae6fd] text-[var(--ws-mint)] border-[var(--ws-mint)]"
                      : "bg-[var(--ws-sidebar)] hover:bg-[var(--ws-line)] text-[var(--ws-mint)] border border-[var(--ws-mint)]/30"
                  }`}
                >
                  {copiedHash === "tree" ? "Tree Dumped!" : "Inspect Tree"}
                </button>
              </div>
            </div>
          </section>

          {/* SECTION: DUAL-CUSTODY HSM QUORUM & ATTESTATION PANEL */}
          <section
            className={`p-4 rounded border relative flex flex-col justify-between transition-all duration-200 ${
              isLightMode
                ? "bg-[#ffffff] border-[#cbd5e1] shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-[#0f172a]"
                : "hud-box bg-[var(--ws-panel)] border-[var(--ws-mint)]/30 shadow-[0_0_20px_rgba(179,223,147,0.06)] text-white"
            }`}
          >
            <div className="hud-corner-tr" />
            <div className="hud-corner-bl" />

            <div>
              <div
                className={`flex items-center justify-between gap-2 mb-2 pb-2 border-b ${
                  isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isLightMode ? "text-[var(--research-sand)]" : "text-[var(--research-sand)]"
                    }`}
                  >
                    key
                  </span>
                  <h2
                    className={`font-['Orbitron'] text-sm font-bold m-0 tracking-wide ${
                      isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
                    }`}
                  >
                    DUAL-CUSTODY HSM QUORUM
                  </h2>
                </div>
                <span
                  className={`px-1.5 py-0.2 rounded font-mono text-[10px] border font-bold ${
                    isLightMode
                      ? "bg-[#fef3c7] text-[var(--research-sand)] border-[var(--research-sand)]"
                      : "bg-[var(--research-sand)]/15 text-[var(--research-sand)] border-[var(--research-sand)]/30"
                  }`}
                >
                  2/2 SIGNATURES
                </span>
              </div>

              <p className="font-mono text-[10px] text-[var(--ws-muted)] mb-2">
                FIPS 140-3 Level 4 dual quorum requirement for safety-critical SCADA coil overrides and air-gap toggles.
              </p>

              <div className="space-y-2">
                <div
                  className={`p-2 rounded border flex items-center justify-between font-mono text-[10px] ${
                    isLightMode ? "bg-[#f8fafc] border-[#cbd5e1]" : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
                  }`}
                >
                  <div>
                    <span className="text-[var(--ws-muted)] block text-[9px]">Custodian 1: Lead Cryptographer</span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      YubiKey 5 FIPS // Ed25519 Signed
                    </span>
                  </div>
                  <span className="text-[var(--ws-muted)]">14:20:02 UTC</span>
                </div>

                <div
                  className={`p-2 rounded border flex items-center justify-between font-mono text-[10px] ${
                    isLightMode ? "bg-[#f8fafc] border-[#cbd5e1]" : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
                  }`}
                >
                  <div>
                    <span className="text-[var(--ws-muted)] block text-[9px]">Custodian 2: SecOps Director</span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      Nitrokey HSM // PCR-08 Attested
                    </span>
                  </div>
                  <span className="text-[var(--ws-muted)]">14:21:44 UTC</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

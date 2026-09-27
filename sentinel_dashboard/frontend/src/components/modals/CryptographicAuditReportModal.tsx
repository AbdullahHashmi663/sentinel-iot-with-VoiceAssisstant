// ==============================================================================
// SENTINEL-IOT: CRYPTOGRAPHIC VERIFICATION REPORT MODAL (STITCH EXTERNAL AUDIT)
// Version 2.4 - Enterprise Production Edition - FYP-II
// FIPS 140-3 Level 4 • IEC 62443-4-2 SL-3 • ZK-SNARK Groth16 • TPM 2.0 PCR Quote
// ==============================================================================

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Download,
  Terminal,
  FileCheck,
  CheckCircle,
  Copy,
  Check,
  X,
  ExternalLink,
  Cpu,
  Layers,
  Key,
  Flame,
  Activity,
  Award
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";

export default function CryptographicAuditReportModal() {
  const router = useRouter();
  const {
    isAuditReportModalOpen,
    closeAuditReportModal,
    setActiveConsole
  } = useTelemetryStore();

  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isAuditReportModalOpen) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText("0x7f4a9b2088e14cb78a3c4412ef89b41a8f9021da7e39a018bc9447192fa901");
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadBundle = () => {
    const bundleData = {
      report_id: "AUD-2025-0891-ZK",
      timestamp: new Date().toISOString(),
      standards: ["FIPS 140-3 Level 4", "IEC 62443-4-2 SL-3", "NIST SP 800-53 AU-9"],
      zk_proof: {
        curve: "BN254",
        algorithm: "Groth16",
        constraints_checked: 1402891,
        soundness_error: "2^-128",
        public_inputs: [
          "0x7f4a9b2088e14cb78a3c4412ef89b41a8f9021da7e39a018bc9447192fa901",
          "16.8 μs",
          "0.942",
          "0x01"
        ]
      },
      tpm_quote: {
        enclave: "STMicro ST33TPHF20 TPM 2.0 (I2C Bus 0x2E)",
        pcr_banks: {
          PCR_00: "74e9f3...b881a2 (UEFI Bootloader Microcode)",
          PCR_02: "c89b21...912a8f (eBPF XDP Fastpath Driver)",
          PCR_04: "1a340d...55c91b (IEC 61850 State Machine)",
          PCR_05: "8f99a0...33ef01 (Conformer Neural Weights FP16)",
          PCR_07: "9f4a8b...e10477 (Secure Boot Enforce Key)"
        }
      },
      multi_sig_quorum: {
        signers: [
          { role: "SecOps Lead (YubiKey 5 FIPS)", signature: "Ed25519:0x892A...44C1" },
          { role: "Plant Safety Controller (IEC 62443)", signature: "Ed25519:0x44B1...12E9" },
          { role: "Autonomous AI Conformer Core", signature: "Ed25519:0x770E...89F2" }
        ],
        status: "3/3 VALIDATED"
      }
    };

    const blob = new Blob([JSON.stringify(bundleData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sentinel-audit-bundle-AUD-2025-0891-ZK.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleOpenCliSimulation = () => {
    closeAuditReportModal();
    setActiveConsole("audit");
    router.push("/audit");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cryptographic Audit Verification Report Modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#03070c]/85 backdrop-blur-md overflow-y-auto selection:bg-[#00f0ff] selection:text-black"
    >
      {/* Outer Click Scrim */}
      <div className="fixed inset-0" onClick={closeAuditReportModal} />

      {/* MODAL DIALOG CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl my-auto bg-[#070d14]/95 border border-[#00f0ff]/40 rounded-xl shadow-[0_0_60px_rgba(0,240,255,0.18)] p-4 sm:p-6 flex flex-col gap-4 overflow-hidden">
        
        {/* Top Holographic Cyan-Emerald-Purple Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#00ff66] to-[#a855f7] rounded-t-xl" />

        {/* Reticle Tech Corners */}
        <span className="hud-corner-tr">┐</span>
        <span className="hud-corner-bl">└</span>

        {/* 1. MODAL HEADER & CLASSIFICATION RIBBON */}
        <div className="flex flex-col gap-2 pb-3 bg-[#0b131e]/70 p-3 sm:p-4 rounded-lg border border-[#162536]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-[#00f0ff]/15 text-[#00f0ff] font-mono text-[10px] uppercase tracking-wider rounded border border-[#00f0ff]/30 font-bold">
                [ AUDIT // LEVEL-4 CLASSIFIED ]
              </span>
              <span className="px-2 py-0.5 bg-[#162536] text-[#dee3eb] font-mono text-[10px] uppercase tracking-wider rounded">
                FIPS 140-3 LEVEL 4 / IEC 62443-4-2 SL-3 CERTIFIED
              </span>
              <span className="px-2 py-0.5 bg-[#00ff66]/15 text-[#00ff66] font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 rounded border border-[#00ff66]/30">
                <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full animate-ping" />
                ZK-SNARK PROOF VALIDATED [BN254 GROTH16]
              </span>
            </div>

            {/* Close Button & Jurisdiction */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1 font-mono text-[11px] text-[#64748b]">
                <span>AUDIT JURISDICTION:</span>
                <span className="text-[#00f0ff] font-semibold">SOVEREIGN OT EXTERNAL</span>
              </div>
              <button
                type="button"
                onClick={closeAuditReportModal}
                className="w-7 h-7 bg-[#162536] hover:bg-[#ff2a5f] text-[#dee3eb] hover:text-white flex items-center justify-center rounded transition-colors font-mono text-sm cursor-pointer"
                title="Close Audit Report"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mt-1">
            <div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#64748b]">
                <span>VERIFICATION DIRECTIVE</span>
                <span>/</span>
                <span className="text-[#00f0ff]">SEC-DOC // REVISION 5.09a</span>
              </div>
              <h2 className="font-['Orbitron'] font-bold text-xl sm:text-2xl text-[#dbfcff] tracking-tight uppercase flex items-center gap-2 mt-0.5">
                <span>CRYPTOGRAPHIC AUDIT VERIFICATION REPORT</span>
                <span className="font-mono text-[10px] text-[#00ff66] bg-[#03070c] px-2 py-0.5 rounded border border-[#00ff66]/30">
                  [ EXTERNAL AUDITOR PACKET ]
                </span>
              </h2>
            </div>

            {/* Report Metadata Tag Array */}
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
              <span className="bg-[#162536] text-[#dee3eb] px-2.5 py-1 rounded border border-[#162536]">
                REPORT_ID: <span className="text-[#00f0ff] font-bold">AUD-2025-0891-ZK</span>
              </span>
              <span className="bg-[#162536] text-[#dee3eb] px-2.5 py-1 rounded border border-[#162536]">
                TIME: <span className="text-[#00ff66]">2025-05-18T14:22:09Z</span>
              </span>
              <span className="bg-[#162536] text-[#dee3eb] px-2.5 py-1 rounded border border-[#162536]">
                LEAF_REF: <span className="text-[#ffb700]">#4,892,104</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. AUDITOR ATTESTATION SUMMARY BAR (4 Key Metrics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono">
          
          {/* Metric 1: TPM 2.0 PCR-7 */}
          <div className="bg-[#0b131e]/90 p-3 rounded-lg flex flex-col justify-between border border-[#162536]">
            <div className="flex items-center justify-between text-[10px] text-[#64748b] mb-1">
              <span className="uppercase">TPM 2.0 PCR-7 INTEGRITY</span>
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
            </div>
            <div className="text-lg font-bold text-[#00ff66]">SEALED & VALID</div>
            <div className="text-[10px] text-[#64748b] truncate mt-1">
              DIGEST: <span className="text-[#dee3eb]">0x9f4a8be104...77bc</span>
            </div>
            <div className="w-full bg-[#162536] h-1 rounded-full overflow-hidden mt-2">
              <div className="bg-[#00ff66] h-full w-full shadow-[0_0_8px_#00ff66]" />
            </div>
          </div>

          {/* Metric 2: ZK-SNARK Verification Speed */}
          <div className="bg-[#0b131e]/90 p-3 rounded-lg flex flex-col justify-between border border-[#162536]">
            <div className="flex items-center justify-between text-[10px] text-[#64748b] mb-1">
              <span className="uppercase">ZK-SNARK VERIFICATION</span>
              <span className="text-[10px] text-[#00f0ff]">[0 SOUNDNESS ERR]</span>
            </div>
            <div className="text-lg font-bold text-[#00f0ff] flex items-baseline gap-1">
              <span>0.38</span>
              <span className="text-[11px] text-[#64748b] font-normal">ms (REAL-TIME)</span>
            </div>
            <div className="text-[10px] text-[#64748b] truncate mt-1">
              R1CS: <span className="text-[#dee3eb]">1,402,891 Constraints</span>
            </div>
            <div className="w-full bg-[#162536] h-1 rounded-full overflow-hidden mt-2">
              <div className="bg-[#00f0ff] h-full w-[96%] shadow-[0_0_8px_#00f0ff]" />
            </div>
          </div>

          {/* Metric 3: Merkle Tree Root */}
          <div className="bg-[#0b131e]/90 p-3 rounded-lg flex flex-col justify-between border border-[#162536]">
            <div className="flex items-center justify-between text-[10px] text-[#64748b] mb-1">
              <span className="uppercase">MERKLE TREE ROOT</span>
              <span className="text-[10px] text-[#ffb700]">DEPTH 24</span>
            </div>
            <div className="text-lg font-bold text-[#dbfcff] truncate">0x7f4a...88e1</div>
            <div className="text-[10px] text-[#64748b] truncate mt-1">
              EVENTS: <span className="text-[#dee3eb]">4,892,104 Leaves</span>
            </div>
            <div className="w-full bg-[#162536] h-1 rounded-full overflow-hidden mt-2">
              <div className="bg-[#00f0ff] h-full w-full" />
            </div>
          </div>

          {/* Metric 4: Multi-Sig Quorum */}
          <div className="bg-[#0b131e]/90 p-3 rounded-lg flex flex-col justify-between border border-[#162536]">
            <div className="flex items-center justify-between text-[10px] text-[#64748b] mb-1">
              <span className="uppercase">MULTI-SIG QUORUM</span>
              <span className="text-[10px] text-[#00ff66]">100% QUORUM</span>
            </div>
            <div className="text-lg font-bold text-[#00ff66] flex items-center gap-1.5">
              <span>3 OF 3</span>
              <span className="text-[11px] text-[#dee3eb] font-normal">VALIDATED</span>
            </div>
            <div className="text-[10px] text-[#64748b] truncate mt-1">
              ALGO: <span className="text-[#dee3eb]">Ed25519 HSM Ephemeral</span>
            </div>
            <div className="w-full bg-[#162536] h-1 rounded-full overflow-hidden mt-2">
              <div className="bg-[#00ff66] h-full w-full shadow-[0_0_8px_#00ff66]" />
            </div>
          </div>
        </div>

        {/* 3. PRIMARY VERIFICATION PANELS (2-Column Grid Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="flex flex-col gap-4">
            
            {/* PANEL A: HARDWARE ROOT-OF-TRUST (RoT) ENCLAVE SEAL */}
            <div className="bg-[#0b131e]/90 rounded-lg p-3 sm:p-4 flex flex-col gap-2.5 border border-[#162536]">
              <div className="flex items-center justify-between pb-2 bg-[#162536]/50 p-2.5 rounded border border-[#162536]">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#00f0ff]" />
                  <h3 className="font-['Space_Grotesk'] font-bold text-sm text-[#dbfcff] uppercase">
                    Hardware Root-of-Trust Enclave Seal
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-[#00ff66]/15 text-[#00ff66] font-mono text-[10px] rounded font-medium border border-[#00ff66]/30">
                  [ TPM 2.0 ATTESTED ]
                </span>
              </div>

              {/* Silicon Enclave Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#64748b] font-mono text-[10px] bg-[#03070c] p-2.5 rounded border border-[#162536]">
                <div>
                  <span className="text-[#b9cacb] block">SILICON ENCLAVE:</span>
                  <span className="text-[#dee3eb] font-bold">ST33TPHF20 TPM 2.0 (I2C Bus 0x2E)</span>
                </div>
                <div>
                  <span className="text-[#b9cacb] block">AK CERT THUMBPRINT:</span>
                  <span className="text-[#00f0ff] font-mono truncate block">SHA256:4a09c...e291 (ECDSA P-256)</span>
                </div>
              </div>

              {/* PCR Banks Table */}
              <div className="overflow-x-auto rounded border border-[#162536]">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead>
                    <tr className="bg-[#162536] text-[#64748b]">
                      <th className="py-1 px-2">REG</th>
                      <th className="py-1 px-2">MEASURED COMPONENT IDENTIFIER</th>
                      <th className="py-1 px-2">SHA-256 DIGEST HASH</th>
                      <th className="py-1 px-2 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#162536]">
                    <tr className="bg-[#070d14] hover:bg-[#162536]/50">
                      <td className="py-1 px-2 font-bold text-[#00f0ff]">PCR-00</td>
                      <td className="py-1 px-2 text-[#dee3eb]">Core UEFI Bootloader Firmware Microcode</td>
                      <td className="py-1 px-2 text-[#64748b]">74e9f3...b881a2</td>
                      <td className="py-1 px-2 text-right text-[#00ff66] font-bold">✓ PASS</td>
                    </tr>
                    <tr className="bg-[#0b131e] hover:bg-[#162536]/50">
                      <td className="py-1 px-2 font-bold text-[#00f0ff]">PCR-02</td>
                      <td className="py-1 px-2 text-[#dee3eb]">Ring0 eBPF XDP Fastpath Filter Driver</td>
                      <td className="py-1 px-2 text-[#64748b]">c89b21...912a8f</td>
                      <td className="py-1 px-2 text-right text-[#00ff66] font-bold">✓ PASS</td>
                    </tr>
                    <tr className="bg-[#070d14] hover:bg-[#162536]/50">
                      <td className="py-1 px-2 font-bold text-[#00f0ff]">PCR-04</td>
                      <td className="py-1 px-2 text-[#dee3eb]">IEC 61850 Interlock Logic State Machine</td>
                      <td className="py-1 px-2 text-[#64748b]">1a340d...55c91b</td>
                      <td className="py-1 px-2 text-right text-[#00ff66] font-bold">✓ PASS</td>
                    </tr>
                    <tr className="bg-[#0b131e] hover:bg-[#162536]/50">
                      <td className="py-1 px-2 font-bold text-[#00f0ff]">PCR-05</td>
                      <td className="py-1 px-2 text-[#dee3eb]">Conformer Neural Inference Weights FP16</td>
                      <td className="py-1 px-2 text-[#64748b]">8f99a0...33ef01</td>
                      <td className="py-1 px-2 text-right text-[#00ff66] font-bold">✓ PASS</td>
                    </tr>
                    <tr className="bg-[#070d14] hover:bg-[#162536]/50">
                      <td className="py-1 px-2 font-bold text-[#00f0ff]">PCR-07</td>
                      <td className="py-1 px-2 text-[#dee3eb]">Secure Boot Policy & Enclave Enforce Key</td>
                      <td className="py-1 px-2 text-[#00ff66]">9f4a8b...e10477</td>
                      <td className="py-1 px-2 text-right text-[#00ff66] font-bold">✓ LOCKED</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PANEL B: ZK-SNARK GROTH16 PROOF & WITNESS */}
            <div className="bg-[#0b131e]/90 rounded-lg p-3 sm:p-4 flex flex-col gap-2.5 border border-[#162536]">
              <div className="flex items-center justify-between pb-2 bg-[#162536]/50 p-2.5 rounded border border-[#162536]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#00ff66]" />
                  <h3 className="font-['Space_Grotesk'] font-bold text-sm text-[#dbfcff] uppercase">
                    ZK-SNARK Groth16 Proof & Witness Verification
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-[#00f0ff]/15 text-[#00f0ff] font-mono text-[10px] rounded font-medium border border-[#00f0ff]/30">
                  BN254 [alt-bn128]
                </span>
              </div>

              {/* Verification Equation Banner */}
              <div className="p-2.5 bg-[#03070c] rounded text-[#dee3eb] font-mono text-[10px] flex flex-col gap-1 border border-[#162536]">
                <div className="text-[#64748b] flex items-center justify-between uppercase">
                  <span>Pairing Verification Equation Check:</span>
                  <span className="text-[#00ff66] font-bold">EVALUATION: TRUE (Q.E.D)</span>
                </div>
                <div className="text-[#00f0ff] font-bold text-center py-1 overflow-x-auto text-xs">
                  e(A, B) = e(α, β) · e(∑ xᵢ · γ, δ) · e(C, γ)
                </div>
                <div className="text-[#64748b] text-[9px] flex justify-between">
                  <span>CURVE: alt_bn128 G1 / G2 PAIRING</span>
                  <span>SECURITY: 128-BIT QUANTUM RESISTANT PROOF</span>
                </div>
              </div>

              {/* Public Inputs Vector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[10px]">
                <div className="bg-[#162536]/60 p-2 rounded flex flex-col">
                  <span className="text-[#64748b] text-[9px]">INP[0] MERKLE_ROOT</span>
                  <span className="text-[#dee3eb] truncate">0x7f4a9b2088e14cb7...90</span>
                </div>
                <div className="bg-[#162536]/60 p-2 rounded flex flex-col">
                  <span className="text-[#64748b] text-[9px]">INP[1] LATENCY_DELTA_US</span>
                  <span className="text-[#00ff66] font-bold">16.8 μs (&lt; 250.0 μs SLA)</span>
                </div>
                <div className="bg-[#162536]/60 p-2 rounded flex flex-col">
                  <span className="text-[#64748b] text-[9px]">INP[2] ANOMALY_SIGMOID_TAU</span>
                  <span className="text-[#00f0ff] font-bold">0.942 [NOMINAL IN-BOUNDS]</span>
                </div>
                <div className="bg-[#162536]/60 p-2 rounded flex flex-col">
                  <span className="text-[#64748b] text-[9px]">INP[3] HARDWARE_AIRGAP_REG</span>
                  <span className="text-[#ffb700] font-bold">0x01 [OPTICAL DIODE ENGAGED]</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="flex flex-col gap-4">
            
            {/* PANEL C: IMMUTABLE MERKLE AUDIT LEDGER LADDER */}
            <div className="bg-[#0b131e]/90 rounded-lg p-3 sm:p-4 flex flex-col gap-2.5 border border-[#162536]">
              <div className="flex items-center justify-between pb-2 bg-[#162536]/50 p-2.5 rounded border border-[#162536]">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#ffb700]" />
                  <h3 className="font-['Space_Grotesk'] font-bold text-sm text-[#dbfcff] uppercase">
                    Immutable Merkle Ledger & Block Ladder
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-[#ffb700]/15 text-[#ffb700] font-mono text-[10px] rounded font-medium border border-[#ffb700]/30">
                  24-TIER POSEIDON HASH
                </span>
              </div>

              {/* Merkle Ladder Blocks */}
              <div className="flex flex-col gap-1.5 font-mono text-[10px]">
                <div className="bg-[#03070c] p-2.5 rounded border border-[#00f0ff]/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[#00f0ff] font-bold">BLOCK #1048576 [ROOT ANCHOR]</span>
                    <span className="text-[#64748b]">14:22:09.390Z</span>
                  </div>
                  <div className="text-[#dee3eb] truncate text-[9px] mt-0.5">
                    HASH: 0x7f4a9b2088e14cb78a3c... (PARENTHASH: 0x33b1e84)
                  </div>
                  <div className="text-[#00ff66] text-[9px] mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>INSPECTION EVENT: SCADA Valve Override FC16 Locked Down via eBPF</span>
                  </div>
                </div>

                <div className="bg-[#03070c] p-2.5 rounded border border-[#162536]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#dee3eb] font-bold">BLOCK #1048575</span>
                    <span className="text-[#64748b]">14:22:08.712Z</span>
                  </div>
                  <div className="text-[#dee3eb] truncate text-[9px] mt-0.5">
                    HASH: 0x33b1e84a921d740fe... (PARENTHASH: 0x118ca91)
                  </div>
                  <div className="text-[#00ff66] text-[9px] mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>INSPECTION EVENT: eBPF XDP DROP committed for IP 192.168.100.45</span>
                  </div>
                </div>

                <div className="bg-[#03070c] p-2.5 rounded border border-[#162536]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#dee3eb] font-bold">BLOCK #1048574</span>
                    <span className="text-[#64748b]">14:22:07.104Z</span>
                  </div>
                  <div className="text-[#dee3eb] truncate text-[9px] mt-0.5">
                    HASH: 0x118ca915591b98a0... (PARENTHASH: 0x094fe31)
                  </div>
                  <div className="text-[#ffb700] text-[9px] mt-1 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>INSPECTION EVENT: Conformer Tau Flared (0.942) on ToN_IoT #04 Modbus PLC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL D: SOVEREIGN MULTI-SIGNATURE QUORUM ATTESTATION */}
            <div className="bg-[#0b131e]/90 rounded-lg p-3 sm:p-4 flex flex-col gap-2.5 border border-[#162536]">
              <div className="flex items-center justify-between pb-2 bg-[#162536]/50 p-2.5 rounded border border-[#162536]">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#00ff66]" />
                  <h3 className="font-['Space_Grotesk'] font-bold text-sm text-[#dbfcff] uppercase">
                    Sovereign Multi-Signature Quorum
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-[#00ff66]/15 text-[#00ff66] font-mono text-[10px] rounded font-medium border border-[#00ff66]/30">
                  3 OF 3 QUORUM REACHED
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex items-center justify-between p-2 bg-[#03070c] rounded border border-[#162536]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00ff66]" />
                    <span className="text-[#dee3eb] font-bold">SecOps Lead (YubiKey 5 FIPS)</span>
                  </div>
                  <span className="text-[#00ff66]">✓ Ed25519 VERIFIED</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-[#03070c] rounded border border-[#162536]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00ff66]" />
                    <span className="text-[#dee3eb] font-bold">Plant Safety Controller (IEC 62443)</span>
                  </div>
                  <span className="text-[#00ff66]">✓ FIDO2 HARDWARE KEY</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-[#03070c] rounded border border-[#162536]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00ff66]" />
                    <span className="text-[#dee3eb] font-bold">Autonomous AI Conformer Core</span>
                  </div>
                  <span className="text-[#00ff66]">✓ SHA-3 ENCLAVE SEAL</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4. MODAL FOOTER & EXPORT ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#162536] font-mono text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyHash}
              className="px-3 py-1.5 rounded bg-[#162536] hover:bg-[#252b31] text-[#00f0ff] border border-[#00f0ff]/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5 text-[#00ff66]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHash ? "HASH COPIED!" : "COPY SHA-256 ROOT"}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCliSimulation}
              className="px-3 py-1.5 rounded bg-[#0b131e] hover:bg-[#162536] text-[#dee3eb] hover:text-[#00f0ff] border border-[#162536] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>LAUNCH AUDIT CLI</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleDownloadBundle}
              className="px-4 py-1.5 rounded bg-[#00ff66] text-[#03070c] hover:bg-[#00ff66]/90 font-bold transition-all shadow-[0_0_15px_rgba(0,255,102,0.4)] flex items-center gap-1.5 cursor-pointer"
            >
              {downloadSuccess ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadSuccess ? "BUNDLE DOWNLOADED!" : "EXPORT AUDIT BUNDLE"}</span>
            </button>

            <button
              type="button"
              onClick={closeAuditReportModal}
              className="px-3 py-1.5 rounded bg-[#162536] hover:bg-[#252b31] text-[#dee3eb] transition-all cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

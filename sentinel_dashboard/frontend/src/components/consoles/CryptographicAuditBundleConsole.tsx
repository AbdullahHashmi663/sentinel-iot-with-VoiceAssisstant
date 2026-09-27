// ==============================================================================
// SENTINEL-IOT: CRYPTOGRAPHIC AUDIT BUNDLE CLI CONSOLE (STITCH CLI SIMULATION)
// Version 2.4 - Enterprise Production Edition - FYP-II
// gVisor-Isolated Terminal • ZK-SNARK Groth16 • TPM 2.0 PCR Attestation • Merkle Ladder
// ==============================================================================

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Terminal,
  Play,
  RotateCcw,
  Download,
  Copy,
  Check,
  Trash2,
  Lock,
  Cpu,
  Layers,
  FileCode,
  ShieldCheck,
  CheckCircle,
  FileCheck,
  ExternalLink,
  FolderArchive
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";

interface TerminalLine {
  id: string;
  command?: string;
  lines: { text: string; color?: string; isPass?: boolean }[];
  timestamp: string;
}

export default function CryptographicAuditBundleConsole() {
  const { openAuditReportModal } = useTelemetryStore();

  const [cliInput, setCliInput] = useState<string>("./sentinel-audit-verify --verbose --strict");
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [copiedTerm, setCopiedTerm] = useState<boolean>(false);
  const [copiedSha, setCopiedSha] = useState<boolean>(false);

  const initialLogEntries: TerminalLine[] = [
    {
      id: "step-01",
      command: "sha256sum -c sentinel-audit-bundle.tar.gz.sig",
      timestamp: "14:22:12",
      lines: [
        { text: "[STEP 01/05] Resolving multi-signature governance quorum...", color: "text-[#64748b]" },
        { text: "> Signer 01: [Ed25519:SecOps-Key-0x892A] - SIGNATURE OK (Timestamp 2025-02-14T08:12:00Z)" },
        { text: "> Signer 02: [Ed25519:Plant-Safety-0x44B1] - SIGNATURE OK (Timestamp 2025-02-14T08:12:04Z)" },
        { text: "> Signer 03: [Ed25519:AI-Conformer-0x770E] - SIGNATURE OK (Timestamp 2025-02-14T08:12:09Z)" },
        {
          text: "[PASS] TAR.GZ INTEGRITY VERIFIED (3/3 QUORUM REACHED - SHA256: 4f88e178c4a921d740)",
          color: "text-[#00ff66] font-bold",
          isPass: true
        }
      ]
    },
    {
      id: "step-02",
      command: "./sentinel-audit-verify --tpm-pcr-quote --verify-enclave",
      timestamp: "14:22:13",
      lines: [
        { text: "[STEP 02/05] Requesting hardware quote via TPM2_Quote(nonce=0x7e39a2)...", color: "text-[#64748b]" },
        { text: "> Enclave: ST33TPHF20 TPM2.0 Encrypted I2C bus channel initialized" },
        { text: "> Reading PCR Bank: SHA256 [0, 2, 4, 5, 7]" },
        {
          text: "  PCR-00: 4F 8C 1A 90 B2 C4 88 12 E4 91 3C 20 FA 18 01 9B\n  PCR-02: 88 31 00 F4 2E 1B A9 C3 77 41 89 E2 10 55 C9 3A\n  PCR-04: D1 09 EF 34 AA 99 21 88 47 B8 01 22 9F EA BB 04\n  PCR-07: 00 11 FA 9C 44 82 BB 19 C0 A2 87 31 FE 40 92 1A",
          color: "text-[#00f0ff]"
        },
        {
          text: "[PASS] HARDWARE ATTESTATION: Enclave locked. Baseline Golden Digest identical.",
          color: "text-[#00ff66] font-bold",
          isPass: true
        }
      ]
    },
    {
      id: "step-03",
      command: "snarkjs groth16 verify verification_key.json public.json proof.json",
      timestamp: "14:22:14",
      lines: [
        { text: "[STEP 03/05] Evaluating BN254 bilinear pairing e(A, B) = e(α, β) · e(x, γ) · e(C, δ)...", color: "text-[#64748b]" },
        { text: "> Loading CRS verification key: 2,148 bytes from verification_key.json" },
        { text: "> Public inputs parsed: 3 elements (MerkleRoot, TauThreshold, AirGapState)" },
        { text: "> Constraints checked: 1,402,891 R1CS non-linear wire equations" },
        {
          text: "[PASS] SNARK PROOF VALIDATED in 0.38ms (Soundness Error: 2^-128)",
          color: "text-[#00ff66] font-bold",
          isPass: true
        }
      ]
    },
    {
      id: "step-04",
      command: "./sentinel-audit-verify --merkle-ladder --leaf-index 4892104",
      timestamp: "14:22:15",
      lines: [
        { text: "[STEP 04/05] Traversing 24-level Merkle Poseidon inclusion ladder...", color: "text-[#64748b]" },
        { text: "> Leaf index: 0x4AA3C8 (Audit Record: Valve-Pressure-Overpressure-Interlock)" },
        { text: "> Poseidon Hashes computed: 24 siblings across BN254 scalar field" },
        { text: "> Computed Root: 0x8f2c09194e47e9a0d81b31a89c4412ef" },
        { text: "> Hardware TPM Anchor: 0x8f2c09194e47e9a0d81b31a89c4412ef" },
        {
          text: "[PASS] MERKLE INCLUSION PROVEN: Zero leaf drift detected.",
          color: "text-[#00ff66] font-bold",
          isPass: true
        }
      ]
    }
  ];

  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>(initialLogEntries);
  const terminalBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const handleRunCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    let outputLines: { text: string; color?: string; isPass?: boolean }[] = [];

    if (cmd.includes("zk") || cmd.includes("snark")) {
      outputLines = [
        { text: "[ZK-SNARK VERIFICATION EXECUTION]", color: "text-[#00f0ff] font-bold" },
        { text: "> Parsing Alt_BN128 proof payload (pi_a, pi_b, pi_c)..." },
        { text: "> Computing Miller loop on BN254 curve..." },
        { text: "> Verification Key digest matched CRS Powers-of-Tau #54" },
        { text: "[PASS] Groth16 cryptographic proof satisfied in 0.34ms", color: "text-[#00ff66] font-bold", isPass: true }
      ];
    } else if (cmd.includes("merkle") || cmd.includes("root")) {
      outputLines = [
        { text: "[MERKLE TREE RECOMPUTATION]", color: "text-[#ffb700] font-bold" },
        { text: "> Loading 4,892,104 leaves from local forensic RocksDB..." },
        { text: "> Re-evaluating 24-depth Poseidon hash path against hardware anchor..." },
        { text: "> Resulting Root: 0x7f4a9b2088e14cb78a3c4412ef89b41a8f9021da" },
        { text: "[PASS] Merkle root match: 100% cryptographic integrity preserved", color: "text-[#00ff66] font-bold", isPass: true }
      ];
    } else if (cmd.includes("tpm") || cmd.includes("pcr")) {
      outputLines = [
        { text: "[HARDWARE ENCLAVE ATTESTATION]", color: "text-[#00ff66] font-bold" },
        { text: "> Executing TPM2_Quote with nonces: 0x981FA01..." },
        { text: "> PCR-00...PCR-07 digests confirmed against golden reference baseline" },
        { text: "[PASS] STMicro ST33TPHF20 Enclave locked and authenticated", color: "text-[#00ff66] font-bold", isPass: true }
      ];
    } else if (cmd.includes("export") || cmd.includes("json")) {
      outputLines = [
        { text: "[EXPORTING AUDIT BUNDLE]", color: "text-[#dee3eb] font-bold" },
        { text: "> Compressing 7 signed audit artifacts into archive..." },
        { text: "> Generating SHA256 checksum seal..." },
        { text: "[SUCCESS] Bundle exported: sentinel-audit-bundle-v2.4.9-AUD-2025.tar.gz", color: "text-[#00ff66] font-bold", isPass: true }
      ];
    } else {
      outputLines = [
        { text: `[EXECUTING]: ${cmd}`, color: "text-[#00f0ff]" },
        { text: "> Initializing gVisor container sandbox..." },
        { text: "> Verified SHA-256 seal & Ed25519 signature chain: OK" },
        { text: "[SUCCESS] Command completed with returncode 0x00 (SUCCESS)", color: "text-[#00ff66] font-bold", isPass: true }
      ];
    }

    const newLine: TerminalLine = {
      id: `cmd-${Date.now()}`,
      command: cmd,
      timestamp: new Date().toLocaleTimeString(),
      lines: outputLines
    };

    setTerminalHistory((prev) => [...prev, newLine]);
  };

  const handleRunAll = () => {
    setIsRunningAll(true);
    setTerminalHistory(initialLogEntries);
    setTimeout(() => {
      const completionLine: TerminalLine = {
        id: `complete-${Date.now()}`,
        command: "./sentinel-audit-verify --complete-compliance-suite",
        timestamp: new Date().toLocaleTimeString(),
        lines: [
          { text: "[SUITE EXECUTION]: Running 5/5 Sovereign Cryptographic Checks...", color: "text-[#00f0ff] font-bold" },
          { text: "✓ Ed25519 Multi-Sig Quorum: 3/3 Validated (100%)", color: "text-[#00ff66]" },
          { text: "✓ STMicro TPM 2.0 PCR Golden Quote: MATCHED (0 Soundness Err)", color: "text-[#00ff66]" },
          { text: "✓ ZK-SNARK Groth16 BN254 Pairing: VERIFIED (0.38ms)", color: "text-[#00ff66]" },
          { text: "✓ 24-Tier Poseidon Merkle Inclusion: PROVEN (0 Leaf Drift)", color: "text-[#00ff66]" },
          { text: "✓ NIST SP 800-53 Control AU-9 Immutable Audit Trail: COMPLIANT", color: "text-[#00ff66]" },
          {
            text: "========================================================\n[VERIFICATION MASTER CERTIFICATE SEALED]: SOVEREIGN CLEARANCE GRANTED\n========================================================",
            color: "text-[#00ff66] font-bold",
            isPass: true
          }
        ]
      };
      setTerminalHistory((prev) => [...prev, completionLine]);
      setIsRunningAll(false);
    }, 800);
  };

  const handleClearTerm = () => {
    setTerminalHistory([]);
  };

  const handleCopyTerm = () => {
    const text = terminalHistory
      .map((entry) => `${entry.command ? `$ ${entry.command}\n` : ""}${entry.lines.map((l) => l.text).join("\n")}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedTerm(true);
    setTimeout(() => setCopiedTerm(false), 2000);
  };

  const handleCopySha = () => {
    navigator.clipboard.writeText("0x9f4a8be10477bc698a9d");
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto space-y-4 pt-1 pb-16 selection:bg-[#00f0ff] selection:text-black">
      
      {/* 1. TOP SUB-HEADER AUDIT BANNER */}
      <section className="w-full">
        <div className="hud-panel p-3 sm:p-4 rounded-lg border border-[#162536] bg-[#090f14]/90 backdrop-blur-xl shadow-lg relative">
          <span className="hud-corner-tr">┐</span>
          <span className="hud-corner-bl">└</span>

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            {/* Left Meta Block */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap font-mono">
                <span className="px-2 py-0.5 bg-[#00ff66]/15 text-[#00ff66] text-[10px] font-bold tracking-wider rounded border border-[#00ff66]/30">
                  [ PKG: TACTICAL-VERIFIER-BUNDLE ]
                </span>
                <span className="text-xs text-[#00f0ff] font-bold truncate">
                  sentinel-audit-bundle-v2.4.9-AUD-2025-0891-ZK.tar.gz.sig
                </span>
                <span className="px-2 py-0.5 bg-[#162536] text-[#dee3eb] text-[10px] rounded">
                  FIPS 140-3 L4 // IEC 62443-4-2 SL-3
                </span>
              </div>

              <div className="flex items-center gap-3 text-[#64748b] font-mono text-[11px] flex-wrap mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="uppercase text-[#dee3eb]">TARGET TPM:</span>
                  <span className="text-[#00f0ff] font-bold">STMicro ST33TPHF20 TPM 2.0 (I2C 0x2E)</span>
                </div>
                <span>/</span>
                <div className="flex items-center gap-1.5">
                  <span className="uppercase text-[#dee3eb]">SIG HASH:</span>
                  <span className="text-[#00ff66] font-bold">0x9f4a8be10477bc698a9d</span>
                </div>
                <span>/</span>
                <div className="flex items-center gap-1.5">
                  <span className="uppercase text-[#dee3eb]">SECURITY LEVEL:</span>
                  <span className="text-[#00ff66] font-bold">SOVEREIGN-PASS-CLEARANCE</span>
                </div>
              </div>
            </div>

            {/* Right Quick Actions & Status Badges */}
            <div className="flex items-center gap-2 self-start xl:self-center flex-shrink-0 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0b131e] text-[#00ff66] rounded border border-[#00ff66]/30 shadow-sm">
                <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full animate-ping" />
                <span>AUDITOR-CLI-STREAM</span>
              </div>

              <button
                type="button"
                onClick={handleCopySha}
                className="px-2.5 py-1 bg-[#162536] hover:bg-[#252b31] text-[#dee3eb] hover:text-[#00f0ff] rounded transition-colors flex items-center gap-1 border border-[#162536] cursor-pointer"
              >
                {copiedSha ? <Check className="w-3.5 h-3.5 text-[#00ff66]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSha ? "COPIED" : "EXTRACT SHA256"}</span>
              </button>

              <button
                type="button"
                onClick={openAuditReportModal}
                className="px-3 py-1 bg-[#00f0ff]/20 hover:bg-[#00f0ff] text-[#00f0ff] hover:text-[#03070c] font-bold rounded transition-all flex items-center gap-1 border border-[#00f0ff]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)] cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>VIEW FORMAL REPORT</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN 2-COLUMN VIEWPORT (Center-Left CLI: 66%, Right Decomposition: 34%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 w-full">
        
        {/* LEFT COLUMN: TACTICAL CLI CONSOLE (Col-span 8) */}
        <div className="xl:col-span-8 flex flex-col gap-3">
          
          {/* Interactive Action Ribbon */}
          <div className="bg-[#090f14]/90 p-2.5 rounded-lg border border-[#162536] flex items-center justify-between flex-wrap gap-2 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[#64748b] uppercase text-[10px]">Routines:</span>
              
              <button
                type="button"
                onClick={handleRunAll}
                disabled={isRunningAll}
                className="px-3 py-1 bg-[#00ff66] text-[#03070c] font-bold hover:bg-[#00ff66]/90 transition-colors flex items-center gap-1 rounded shadow-[0_0_12px_rgba(0,255,102,0.35)] cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunningAll ? "RUNNING CHECKS..." : "RUN ALL CHECKS"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunCommand("snarkjs groth16 verify verification_key.json public.json proof.json")}
                className="px-2.5 py-1 bg-[#162536] hover:bg-[#252b31] text-[#00f0ff] transition-colors rounded cursor-pointer"
              >
                &gt; VERIFY ZK PROOF
              </button>

              <button
                type="button"
                onClick={() => handleRunCommand("./sentinel-audit-verify --merkle-ladder --leaf-index 4892104")}
                className="px-2.5 py-1 bg-[#162536] hover:bg-[#252b31] text-[#dee3eb] transition-colors rounded cursor-pointer"
              >
                &gt; INSPECT MERKLE BRANCH
              </button>

              <button
                type="button"
                onClick={() => handleRunCommand("./sentinel-audit-verify --tpm-pcr-quote --verify-enclave")}
                className="px-2.5 py-1 bg-[#162536] hover:bg-[#252b31] text-[#dee3eb] transition-colors rounded cursor-pointer"
              >
                &gt; ATTEST TPM PCRS
              </button>

              <button
                type="button"
                onClick={() => handleRunCommand("tar -czvf sentinel-audit-export.tar.gz proof.json public.json")}
                className="px-2.5 py-1 bg-[#162536] hover:bg-[#252b31] text-[#64748b] hover:text-[#dee3eb] transition-colors rounded cursor-pointer"
              >
                &gt; EXPORT JSON
              </button>
            </div>

            <div className="flex items-center gap-1 text-[#64748b] text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ff66]" />
              <span>SANDBOX: GVISOR-ISOLATED</span>
            </div>
          </div>

          {/* Tactical Terminal Window */}
          <div className="bg-[#03070c] rounded-lg border border-[#162536] shadow-2xl flex flex-col h-[650px] overflow-hidden">
            
            {/* Window Titlebar */}
            <div className="h-9 bg-[#0b131e] px-3 flex items-center justify-between select-none border-b border-[#162536]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#ff2a5f] rounded-full inline-block" />
                  <span className="w-2.5 h-2.5 bg-[#ffb700] rounded-full inline-block" />
                  <span className="w-2.5 h-2.5 bg-[#00ff66] rounded-full inline-block" />
                </div>
                <div className="flex items-center gap-1.5 text-[#64748b] font-mono text-[11px]">
                  <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span className="text-[#dee3eb] truncate">root@auditor-workstation: ~/audit-verification/sentinel-audit-verify-cli</span>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px] text-[#64748b]">
                <span className="hidden md:inline">TTY: /dev/pts/4 (9600-8N1)</span>
                <button
                  type="button"
                  onClick={handleCopyTerm}
                  className="p-1 hover:bg-[#162536] text-[#64748b] hover:text-[#00f0ff] transition-colors rounded cursor-pointer"
                  title="Copy CLI Stream"
                >
                  {copiedTerm ? <Check className="w-3.5 h-3.5 text-[#00ff66]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleClearTerm}
                  className="p-1 hover:bg-[#162536] text-[#64748b] hover:text-[#ff2a5f] transition-colors rounded cursor-pointer"
                  title="Clear Console"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Output Viewport */}
            <div
              ref={terminalBodyRef}
              className="flex-1 p-3.5 overflow-y-auto font-mono text-[11px] space-y-3 bg-[#03070c]"
            >
              {/* Boot Message */}
              <div className="text-[#64748b] leading-relaxed border-b border-[#162536]/60 pb-2">
                <span className="text-[#00f0ff] font-bold">SENTINEL SOVEREIGN ATTESTATION ENVIRONMENT [v4.2.1-SEC]</span><br />
                Cryptographic Audit Bundle Engine. Zero-Knowledge Groth16 Snark Prover/Verifier Online.<br />
                Hardware Security Module: STMicro TPM 2.0 via /dev/tpmrm0 (Verified 2.0-rev1.38)<br />
                All executed verification operations generate signed nonces anchored into ICS bus log.
              </div>

              {/* History Entries */}
              {terminalHistory.map((item) => (
                <div key={item.id} className="space-y-1">
                  {item.command && (
                    <div className="flex items-center gap-1.5 text-[#dbfcff] font-bold">
                      <span className="text-[#00f0ff]">auditor@sovereign-lab:~/bundle$</span>
                      <span>{item.command}</span>
                    </div>
                  )}
                  <div className="pl-3 text-[#dee3eb] space-y-0.5 whitespace-pre-line">
                    {item.lines.map((line, idx) => (
                      <div key={idx} className={`${line.color || "text-[#dee3eb]"}`}>
                        {line.text}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Interactive Input Line */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (cliInput.trim()) {
                    handleRunCommand(cliInput.trim());
                    setCliInput("");
                  }
                }}
                className="pt-2 flex items-center gap-1.5 text-[#dee3eb] border-t border-[#162536]/40"
              >
                <span className="text-[#00f0ff] font-bold shrink-0">auditor@sovereign-lab:~/bundle$</span>
                <input
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder="type verification command (e.g. snarkjs verify, tpm quote, merkle root)..."
                  className="flex-1 bg-transparent border-none outline-none font-mono text-[11px] text-[#dbfcff] focus:ring-0 p-0"
                />
                <span className="inline-block w-2 h-3.5 bg-[#00ff66] animate-pulse" />
              </form>
            </div>

            {/* Terminal Status Bar */}
            <div className="h-7 bg-[#0b131e] px-3 flex items-center justify-between font-mono text-[10px] text-[#64748b] border-t border-[#162536]">
              <div className="flex items-center gap-3">
                <span className="text-[#dbfcff] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full" />
                  CRS: Powers of Tau #54 (Perpetual Tau)
                </span>
                <span>|</span>
                <span>RAM: 84.2 MB</span>
                <span>|</span>
                <span>VCPU USAGE: 1.8%</span>
              </div>
              <div className="flex items-center gap-2 text-[#00f0ff]">
                <span>BN254 / ALT_BN128</span>
                <span className="text-[#00ff66] font-bold">READY</span>
              </div>
            </div>
          </div>

          {/* Quick Command Execution Cheatsheet */}
          <div className="bg-[#090f14]/90 p-2 rounded-lg border border-[#162536] flex items-center justify-between text-[#64748b] font-mono text-[10px] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#00f0ff] font-bold uppercase tracking-wider">Fast Syntaxes:</span>
              <button
                type="button"
                onClick={() => handleRunCommand("--verify-signatures")}
                className="px-1.5 py-0.5 bg-[#162536] hover:bg-[#252b31] text-[#dee3eb] rounded cursor-pointer"
              >
                --verify-signatures
              </button>
              <button
                type="button"
                onClick={() => handleRunCommand("--zero-knowledge-full")}
                className="px-1.5 py-0.5 bg-[#162536] hover:bg-[#252b31] text-[#dee3eb] rounded cursor-pointer"
              >
                --zero-knowledge-full
              </button>
              <button
                type="button"
                onClick={() => handleRunCommand("--recompute-root")}
                className="px-1.5 py-0.5 bg-[#162536] hover:bg-[#252b31] text-[#dee3eb] rounded cursor-pointer"
              >
                --recompute-root
              </button>
            </div>
            <div className="text-[#00ff66]">CLI-RETURN-CODE: 0x00000000 (SUCCESS)</div>
          </div>
        </div>

        {/* RIGHT COLUMN: AUDIT PAYLOAD DECOMPOSITION & CRYPTO TELEMETRY (Col-span 4) */}
        <div className="xl:col-span-4 flex flex-col gap-3 font-mono">
          
          {/* CARD 1: BUNDLE ARTIFACTS EXPLORER */}
          <div className="bg-[#090f14]/90 p-3 sm:p-4 rounded-lg border border-[#162536] shadow-md flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FolderArchive className="w-4 h-4 text-[#00f0ff]" />
                <h3 className="font-['Space_Grotesk'] font-bold text-sm text-[#dbfcff]">Bundle Structure</h3>
              </div>
              <span className="text-[10px] text-[#00ff66]">42.8 MB ARCHIVE</span>
            </div>

            <p className="font-['Space_Grotesk'] text-[11px] text-[#64748b]">
              Cryptographically sealed file hierarchy inside the sovereign ICS verification container.
            </p>

            {/* File Tree Items */}
            <div className="space-y-1 text-[11px] mt-1">
              <div className="p-1.5 bg-[#0b131e] rounded flex items-center justify-between border border-[#162536]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Lock className="w-3.5 h-3.5 text-[#ffb700]" />
                  <span className="text-[#dee3eb] font-bold truncate">audit-bundle.tar.gz</span>
                </div>
                <span className="text-[#64748b] text-[10px]">42.8 MB</span>
              </div>

              <div className="p-1.5 bg-[#0b131e] rounded flex items-center justify-between border border-[#162536]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileCode className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span className="text-[#00f0ff] font-bold truncate">proof.json</span>
                </div>
                <span className="text-[#00ff66] text-[10px]">Groth16 BN254</span>
              </div>

              <div className="p-1.5 bg-[#0b131e] rounded flex items-center justify-between border border-[#162536]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileCode className="w-3.5 h-3.5 text-[#00ff66]" />
                  <span className="text-[#dee3eb] truncate">public.json</span>
                </div>
                <span className="text-[#64748b] text-[10px]">3 Inputs</span>
              </div>

              <div className="p-1.5 bg-[#0b131e] rounded flex items-center justify-between border border-[#162536]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileCode className="w-3.5 h-3.5 text-[#64748b]" />
                  <span className="text-[#dee3eb] truncate">verification_key.json</span>
                </div>
                <span className="text-[#64748b] text-[10px]">CRS 2.1 KB</span>
              </div>

              <div className="p-1.5 bg-[#0b131e] rounded flex items-center justify-between border border-[#162536]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Cpu className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span className="text-[#00f0ff] truncate">tpm_pcr_quote.bin</span>
                </div>
                <span className="text-[#00ff66] text-[10px]">TPM2_Quote</span>
              </div>

              <div className="p-1.5 bg-[#0b131e] rounded flex items-center justify-between border border-[#162536]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Layers className="w-3.5 h-3.5 text-[#ffb700]" />
                  <span className="text-[#dee3eb] truncate">merkle_witness_path.dat</span>
                </div>
                <span className="text-[#64748b] text-[10px]">24 Siblings</span>
              </div>

              <div className="p-1.5 bg-[#0b131e] rounded flex items-center justify-between border border-[#162536]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00ff66]" />
                  <span className="text-[#dee3eb] truncate">signatures.pem</span>
                </div>
                <span className="text-[#00ff66] text-[10px]">3/3 Quorum</span>
              </div>
            </div>
          </div>

          {/* CARD 2: CRYPTOGRAPHIC ZK MATHEMATICS TELEMETRY */}
          <div className="bg-[#090f14]/90 p-3 sm:p-4 rounded-lg border border-[#162536] shadow-md flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#00ff66]" />
                <h3 className="font-['Space_Grotesk'] font-bold text-sm text-[#00ff66]">ZK Verification Engine</h3>
              </div>
              <span className="px-1.5 py-0.2 bg-[#0b131e] text-[#00f0ff] text-[10px] rounded border border-[#00f0ff]/30">
                SNARK-BN254
              </span>
            </div>

            {/* Formula Callout */}
            <div className="p-2 bg-[#03070c] rounded text-[10px] text-[#00f0ff] space-y-1 border border-[#162536]">
              <div className="text-[#64748b] text-[9px] uppercase tracking-wider">Pairing Product Equation:</div>
              <div className="text-[#00ff66] font-bold overflow-x-auto whitespace-nowrap text-xs">
                e(A, B) = e(α, β) · e(∑ xᵢ · γ, δ) · e(C, δ)
              </div>
              <div className="text-[9px] text-[#64748b]">Curve: ALT_BN128 | Fr: 254-bit prime | G1/G2 Pairing</div>
            </div>

            {/* Realtime Benchmarks Grid */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="p-2 bg-[#0b131e] rounded flex flex-col border border-[#162536]">
                <span className="text-[#64748b] text-[9px]">VERIFIER TIME</span>
                <span className="text-base font-bold text-[#00ff66]">0.38ms</span>
                <span className="text-[#00f0ff] text-[9px]">⚡ Ultra-low latency</span>
              </div>
              <div className="p-2 bg-[#0b131e] rounded flex flex-col border border-[#162536]">
                <span className="text-[#64748b] text-[9px]">SOUNDNESS ERROR</span>
                <span className="text-base font-bold text-[#dbfcff]">2⁻¹²⁸</span>
                <span className="text-[#64748b] text-[9px]">Negligible breach</span>
              </div>
              <div className="p-2 bg-[#0b131e] rounded flex flex-col border border-[#162536]">
                <span className="text-[#64748b] text-[9px]">CONSTRAINTS</span>
                <span className="text-base font-bold text-[#dee3eb]">1.40M</span>
                <span className="text-[#64748b] text-[9px]">R1CS circuits</span>
              </div>
              <div className="p-2 bg-[#0b131e] rounded flex flex-col border border-[#162536]">
                <span className="text-[#64748b] text-[9px]">MERKLE DEPTH</span>
                <span className="text-base font-bold text-[#ffb700]">24 Tier</span>
                <span className="text-[#00ff66] text-[9px]">Poseidon Native</span>
              </div>
            </div>

            {/* Multi-Sig Signer Ledger Strip */}
            <div className="space-y-1 pt-1">
              <span className="text-[#64748b] text-[9px] uppercase tracking-wider block">Multi-Sig Quorum Verification</span>
              <div className="flex items-center justify-between p-1.5 bg-[#0b131e] rounded text-[10px] border border-[#162536]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full" />
                  <span className="text-[#dee3eb] font-bold">SecOps Operator (YubiKey 5 FIPS)</span>
                </div>
                <span className="text-[#00ff66]">✓ PASS</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-[#0b131e] rounded text-[10px] border border-[#162536]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full" />
                  <span className="text-[#dee3eb] font-bold">Plant Safety Controller (IEC 62443)</span>
                </div>
                <span className="text-[#00ff66]">✓ PASS</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-[#0b131e] rounded text-[10px] border border-[#162536]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full" />
                  <span className="text-[#dee3eb] font-bold">Autonomous AI Conformer Core</span>
                </div>
                <span className="text-[#00ff66]">✓ PASS</span>
              </div>
            </div>

            {/* Direct Link to External Audit Report */}
            <button
              type="button"
              onClick={openAuditReportModal}
              className="mt-2 w-full py-2 bg-[#00f0ff]/15 hover:bg-[#00f0ff] text-[#00f0ff] hover:text-[#03070c] font-bold rounded transition-all border border-[#00f0ff]/30 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.2)]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>OPEN AUDITOR REPORT MODAL</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

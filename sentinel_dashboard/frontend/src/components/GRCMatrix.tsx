"use client";

import React from "react";
import {
  FileCheck,
  ShieldAlert,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen
} from "lucide-react";

interface GRCMatrixProps {
  mitigationData: any;
  onExportAuditLog: () => void;
}

const NIST_CONTROLS = [
  { id: "SC-5", name: "Denial of Service Protection", attacks: ["ddos", "dos"], desc: "Restricts resource consumption and packet flood anomalies." },
  { id: "SI-3", name: "Malicious Code Protection", attacks: ["ransomware"], desc: "Detects and quarantines destructive malware and ransomware encrypters." },
  { id: "SI-10", name: "Information Input Validation", attacks: ["injection", "xss"], desc: "Validates input protocol compliance and drops SQL/command injections." },
  { id: "IA-5", name: "Authenticator Management", attacks: ["password"], desc: "Enforces credential lockout and detects brute-force assaults." },
  { id: "RA-5", name: "Vulnerability Scanning", attacks: ["scanning"], desc: "Monitors reconnaissance port scans and isolates hostile scanners." },
  { id: "SC-7", name: "Boundary Protection", attacks: ["backdoor"], desc: "Monitors network perimeters and severs unauthorized reverse shells." },
  { id: "SC-8", name: "Transmission Integrity", attacks: ["mitm"], desc: "Prevents ARP spoofing and detects illegitimate middleman nodes." },
  { id: "SI-4", name: "Information System Monitoring", attacks: ["backdoor", "scanning", "ddos"], desc: "Continuous deep telemetry analysis across heterogeneous layers." },
];

const ISO_CONTROLS = [
  { id: "A.12.1.3", name: "Capacity Management", attacks: ["ddos", "dos"] },
  { id: "A.12.6.1", name: "Management of Vulnerabilities", attacks: ["ransomware", "scanning"] },
  { id: "A.14.2.5", name: "Secure Engineering Principles", attacks: ["injection", "xss"] },
  { id: "A.9.4.3", name: "Password Management System", attacks: ["password"] },
  { id: "A.13.1.1", name: "Network Controls", attacks: ["backdoor", "mitm"] },
  { id: "A.10.1.1", name: "Cryptographic Controls", attacks: ["mitm"] },
];

export default function GRCMatrix({ mitigationData, onExportAuditLog }: GRCMatrixProps) {
  const activeLabel = (mitigationData?.forensic_label || "").toLowerCase();
  const isAnomaly = mitigationData?.anomaly_probability > 0.85;

  return (
    <div className="cyber-card p-4 space-y-4">
      
      {/* SECTION HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[var(--accent-primary)]" />
          <h3 className="font-['Orbitron'] font-bold text-sm text-[var(--text-primary)] tracking-wide">
            AUTOMATED GRC REGULATORY COMPLIANCE AUDITING
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)]">
            NIST SP 800-53 Rev. 5 & ISO/IEC 27001:2022
          </span>

          <button
            onClick={onExportAuditLog}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-black text-xs font-['Rajdhani'] font-bold uppercase transition-all"
            title="Download CSV Audit Trail for Regulators"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* NIST SP 800-53 CONTROL GRID */}
      <div className="space-y-2">
        <div className="text-xs font-['Rajdhani'] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
          <span>NIST SP 800-53 Security Controls:</span>
          <span className="text-[10px] text-[var(--text-muted)] font-['JetBrains_Mono']">
            Automated deep learning mapping
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {NIST_CONTROLS.map((ctrl) => {
            const isTriggered = isAnomaly && ctrl.attacks.includes(activeLabel);
            return (
              <div
                key={ctrl.id}
                className={`p-2.5 rounded-lg border transition-all duration-300 flex flex-col justify-between ${
                  isTriggered
                    ? "bg-[var(--alert-critical)]/15 border-[var(--alert-critical)] shadow-[0_0_12px_rgba(255,0,85,0.4)]"
                    : "bg-[var(--bg-surface)] border-[var(--border-color)]/70 opacity-80"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-['Orbitron'] font-black text-xs px-2 py-0.5 rounded ${
                      isTriggered
                        ? "bg-[var(--alert-critical)] text-white"
                        : "bg-[var(--border-color)]/40 text-[var(--accent-primary)]"
                    }`}
                  >
                    {ctrl.id}
                  </span>
                  {isTriggered ? (
                    <span className="text-[10px] font-['JetBrains_Mono'] font-bold text-[var(--alert-critical)] flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      VIOLATION
                    </span>
                  ) : (
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--alert-nominal)] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      COMPLIANT
                    </span>
                  )}
                </div>

                <div className="font-['Rajdhani'] font-bold text-xs text-[var(--text-primary)] leading-tight mb-1">
                  {ctrl.name}
                </div>
                <div className="text-[10px] font-['Space_Grotesk'] text-[var(--text-muted)] leading-snug">
                  {ctrl.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ISO/IEC 27001 CLAUSES CHIPS */}
      <div className="border-t border-[var(--border-color)] pt-3 space-y-2">
        <div className="text-xs font-['Rajdhani'] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          ISO/IEC 27001:2022 Control Annexes:
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {ISO_CONTROLS.map((iso) => {
            const isTriggered = isAnomaly && iso.attacks.includes(activeLabel);
            return (
              <div
                key={iso.id}
                className={`p-2 rounded-lg border text-center transition-all ${
                  isTriggered
                    ? "bg-[var(--alert-warning)]/20 border-[var(--alert-warning)] text-[var(--alert-warning)] shadow-[0_0_10px_var(--alert-warning)]"
                    : "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-muted)]"
                }`}
              >
                <div className="font-['Orbitron'] font-bold text-xs">{iso.id}</div>
                <div className="text-[10px] font-['Rajdhani'] truncate mt-0.5">{iso.name}</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

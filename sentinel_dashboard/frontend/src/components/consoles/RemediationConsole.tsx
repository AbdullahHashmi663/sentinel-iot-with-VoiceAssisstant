// ==============================================================================
// CONSOLE 5: AUTONOMOUS ACTIVE REMEDIATION & OT SAFETY INTERLOCK (SECTION 5.6)
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Lock,
  Unlock,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
  ExternalLink
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import { unblockTargetAPI, overrideInterlockAPI } from "@/services/api";

import SOARPlaybookBuilder from "@/components/SOARPlaybookBuilder";
import { Workflow, Layers } from "lucide-react";

export default function RemediationConsole() {
  const [remediationTab, setRemediationTab] = useState<"rules" | "soar">("soar");
  const {
    activeRules,
    revokeRule,
    interlockCountdown,
    isInterlockModalOpen,
    interlockTargetNode,
    startInterlockCountdown,
    cancelInterlock,
    overrideInterlock
  } = useTelemetryStore();

  const [operatorBadge, setOperatorBadge] = useState<string>("OPERATOR-SEC-091");
  const [badgeError, setBadgeError] = useState<string>("");

  const handleRevoke = async (ruleId: string, target: string) => {
    revokeRule(ruleId);
    await unblockTargetAPI(target);
  };

  const handleConfirmOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorBadge.trim()) {
      setBadgeError("Operator badge ID is required for IEC 62443 audit trails.");
      return;
    }
    setBadgeError("");
    overrideInterlock(operatorBadge);
    await overrideInterlockAPI(interlockTargetNode || "192.168.100.45", operatorBadge);
  };

  // ESC key listener for safety modal
  React.useEffect(() => {
    if (!isInterlockModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelInterlock();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInterlockModalOpen, cancelInterlock]);

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER & TAB SWITCHER */}
      <div className="cyber-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-[var(--alert-critical)] shrink-0" />
          <div>
            <h3 className="font-['Orbitron'] font-bold text-sm text-[var(--text-primary)]">
              AUTONOMOUS ACTIVE REMEDIATION & SOAR ENGINE
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-['Space_Grotesk']">
              Wazuh Closed-Loop Containment (MTTR = 21.5 ms), Visual SOAR Chains & IEC 62443 Interlocks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* TAB SWITCHER */}
          <div className="inline-flex rounded-lg bg-[var(--bg-canvas)] p-1 border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setRemediationTab("soar")}
              className={`cursor-pointer px-3 py-1.5 text-xs font-['Orbitron'] font-bold rounded flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)] ${
                remediationTab === "soar"
                  ? "bg-[var(--brand-cyan)] text-black shadow-md"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>SOAR PLAYBOOK BUILDER</span>
            </button>
            <button
              type="button"
              onClick={() => setRemediationTab("rules")}
              className={`cursor-pointer px-3 py-1.5 text-xs font-['Orbitron'] font-bold rounded flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)] ${
                remediationTab === "rules"
                  ? "bg-[var(--brand-cyan)] text-black shadow-md"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CONTAINMENT RULES ({activeRules.length})</span>
            </button>
          </div>

          {/* TEST INTERLOCK TRIGGER */}
          <button
            type="button"
            onClick={() => startInterlockCountdown("192.168.100.45")}
            aria-label="Trigger IEC 62443 Safety Interlock Test with 30s Countdown"
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--alert-critical)]/15 border border-[var(--alert-critical)] text-[var(--alert-critical)] hover:bg-[var(--alert-critical)]/25 text-xs font-['Orbitron'] font-bold uppercase transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--alert-critical)]"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>TEST INTERLOCK (30s)</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {remediationTab === "soar" ? (
        <SOARPlaybookBuilder />
      ) : (
        <div className="cyber-card p-4 space-y-3">
          {/* 2. ACTIVE RULE LEDGER TABLE */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--alert-nominal)]" />
            <h4 className="font-['Orbitron'] font-bold text-xs uppercase text-[var(--text-primary)]">
              Active Containment Rule Ledger (Autonomous Mitigation Daemon)
            </h4>
          </div>
          <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--brand-cyan)]">
            Total Enforced Rules: {activeRules.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-['JetBrains_Mono'] border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] text-[10px] uppercase">
                <th scope="col" className="py-2.5 px-3">Rule ID & Time</th>
                <th scope="col" className="py-2.5 px-3">Threat Profile</th>
                <th scope="col" className="py-2.5 px-3">Target Node / IP</th>
                <th scope="col" className="py-2.5 px-3">Autonomous Command</th>
                <th scope="col" className="py-2.5 px-3">NIST / ISO Standard</th>
                <th scope="col" className="py-2.5 px-3">Status</th>
                <th scope="col" className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]/30">
              {activeRules.map((rule) => {
                const isBlocked = rule.status === "ACTIVE_BLOCKED";
                const isOverridden = rule.status === "OVERRIDDEN";
                return (
                  <tr key={rule.id} className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="text-[var(--text-primary)] font-bold">{rule.id}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{rule.timestamp}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--alert-critical)]/15 text-[var(--alert-critical)] border border-[var(--alert-critical)]/30">
                        {rule.threatType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--brand-cyan)]">
                      {rule.targetIp} {rule.targetPid ? `(PID: ${rule.targetPid})` : ""}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)] font-mono text-[11px]">
                      {rule.command}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--brand-primary)]">
                      {rule.nistControl} / {rule.isoControl}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        isBlocked
                          ? "bg-[var(--alert-critical)]/15 text-[var(--alert-critical)] border-[var(--alert-critical)]"
                          : isOverridden
                          ? "bg-[var(--alert-warning)]/15 text-[var(--alert-warning)] border-[var(--alert-warning)]"
                          : "bg-[var(--alert-nominal)]/15 text-[var(--alert-nominal)] border-[var(--alert-nominal)]"
                      }`}>
                        {rule.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {isBlocked ? (
                        <button
                          onClick={() => handleRevoke(rule.id, rule.targetIp)}
                          aria-label={`Revoke containment rule ${rule.id}`}
                          className="cursor-pointer px-2.5 py-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--alert-nominal)]/20 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--alert-nominal)] text-[10px] font-['Orbitron'] font-bold uppercase transition-colors focus-visible:ring-2 focus-visible:ring-[var(--alert-nominal)] focus-visible:outline-none"
                        >
                          REVOKE
                        </button>
                      ) : (
                        <span className="text-[10px] text-[var(--text-muted)] italic">
                          {isOverridden ? `Bypassed by ${rule.operatorBadge}` : "Inactive"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* 3. IEC 62443 FOUR-EYES SAFETY INTERLOCK MODAL */}
      {isInterlockModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="interlock-modal-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="cyber-card w-full max-w-lg p-6 space-y-5 border-2 border-[var(--alert-critical)] shadow-[0_0_50px_rgba(239,68,68,0.5)]">
            
            <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3">
              <div className="p-3 rounded-xl bg-[var(--alert-critical)]/20 text-[var(--alert-critical)] animate-pulse">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <h3 id="interlock-modal-title" className="font-['Orbitron'] font-black text-lg text-[var(--alert-critical)] tracking-wide">
                  IEC 62443 FOUR-EYES SAFETY INTERLOCK
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-['Space_Grotesk']">
                  Mandatory Human Operator Verification Before Physical Industrial Actuator Shutdown
                </p>
              </div>
            </div>

            {/* COUNTDOWN TIMER */}
            <div className="flex flex-col items-center justify-center py-3 bg-[var(--bg-canvas)] rounded-xl border border-[var(--border-color)]">
              <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)] uppercase mb-1">
                AUTOMATIC SHUTDOWN EXECUTES IN:
              </div>
              <div className="text-5xl font-black font-['Orbitron'] text-[var(--alert-critical)] animate-pulse">
                {interlockCountdown}s
              </div>
              <div className="text-xs font-['JetBrains_Mono'] text-[var(--brand-cyan)] mt-2">
                Target Node: {interlockTargetNode || "192.168.100.45 (Modbus PLC Node 01)"}
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-['Space_Grotesk']">
              To prevent uncommanded plant downtime and false trip interlocks on active turbine or water distribution lines, enter authorized operator badge credentials below to abort or override shutdown.
            </p>

            <form onSubmit={handleConfirmOverride} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="operator-badge-input" className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-secondary)]">
                  AUTHORIZED OPERATOR BADGE ID:
                </label>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[var(--brand-cyan)]" />
                  <input
                    id="operator-badge-input"
                    type="text"
                    value={operatorBadge}
                    onChange={(e) => setOperatorBadge(e.target.value)}
                    placeholder="e.g. OPERATOR-SEC-091"
                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-['JetBrains_Mono'] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-cyan)] focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)]"
                  />
                </div>
                {badgeError && <div className="text-[10px] text-[var(--alert-critical)] font-bold">{badgeError}</div>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cancelInterlock}
                  className="cursor-pointer px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-xs font-['Orbitron'] font-bold text-[var(--text-secondary)] hover:text-white uppercase transition-colors focus-visible:ring-2 focus-visible:ring-[var(--text-secondary)] focus-visible:outline-none"
                >
                  DISMISS / LET TIMER RUN
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 rounded-lg bg-[var(--alert-critical)] text-white text-xs font-['Orbitron'] font-bold uppercase transition-colors shadow-[0_0_15px_var(--alert-critical)] hover:bg-[var(--alert-critical)]/90 focus-visible:ring-2 focus-visible:ring-[var(--alert-critical)] focus-visible:outline-none"
                >
                  OVERRIDE & CANCEL SHUTDOWN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

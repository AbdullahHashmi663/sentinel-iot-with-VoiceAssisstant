// ==============================================================================
// CONSOLE 5: AUTONOMOUS ACTIVE REMEDIATION & SOAR ENGINE (STITCH FUTURISTIC HUD)
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
  Workflow,
  KeyRound,
  ExternalLink,
  Flame,
  Zap,
  Activity
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import SOARPlaybookBuilder from "@/components/SOARPlaybookBuilder";

export default function RemediationConsole() {
  const [remediationTab, setRemediationTab] = useState<"rules" | "soar">("rules");
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
  const [notice, setNotice] = useState("");
  const isDemo = useTelemetryStore(state => state.isMockMode);

  const handleRevoke = (ruleId: string) => {
    if (!isDemo) return;
    revokeRule(ruleId);
    setNotice("Demo rule revoked locally. No host firewall was changed.");
  };

  const handleConfirmOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorBadge.trim()) {
      setBadgeError("Operator badge ID is required for IEC 62443 audit trails.");
      return;
    }
    setBadgeError("");
    overrideInterlock(operatorBadge);
    setNotice("Research interlock canceled locally. No shutdown or host action was performed.");
  };

  return (
    <div className="space-y-4 font-mono">
      <p className="text-xs p-3 border rounded" role="status">{notice || (isDemo ? "Research simulation: rules and interlocks affect this page only." : "Backend response records are read-only here. Host firewall reversal is not implemented by this research tool.")}</p>
      {/* 1. TOP HEADER & MODE CONTROLS */}
      <div className="hud-box p-3 rounded">
        <span className="hud-corner-tr">┐</span>
        <span className="hud-corner-bl">└</span>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[var(--ws-line)]">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-[var(--ws-sidebar)] p-0.5 rounded border border-[var(--ws-line)]">
            <button
              type="button"
              onClick={() => setRemediationTab("rules")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                remediationTab === "rules"
                  ? "bg-[var(--ws-mint)]/20 border border-[var(--ws-mint)] text-[var(--ws-mint)] shadow-[0_0_10px_rgba(179,223,147,0.3)] text-glow-cyan"
                  : "text-[var(--ws-muted)] hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ACTIVE CONTAINMENT LEDGER ({activeRules.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setRemediationTab("soar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                remediationTab === "soar"
                  ? "bg-[var(--ws-mint)]/20 border border-[var(--ws-mint)] text-[var(--ws-mint)] shadow-[0_0_10px_rgba(179,223,147,0.3)] text-glow-cyan"
                  : "text-[var(--ws-muted)] hover:text-white"
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>SOAR PLAYBOOK DAG BUILDER</span>
            </button>
          </div>

          {/* Hooks & Actions */}
          <div className="flex items-center gap-2 text-[10px]">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--ws-sidebar)] border border-[var(--ws-line)] text-[var(--ws-text)]">
              <span className="text-[var(--ws-mint)]">HOOKS:</span>
              <span className="text-[var(--ws-mint)]">xdp_drop</span> /
              <span className="text-[var(--ws-mint)]">cgroup_freeze</span> /
              <span className="text-[var(--ws-mint)]">tc_bpf</span>
            </div>
            <button
              type="button"
              onClick={() => startInterlockCountdown("192.168.100.45 (Modbus PLC 01)")}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--ws-coral)]/15 border border-[var(--ws-coral)] text-[var(--ws-coral)] hover:bg-[var(--ws-coral)] hover:text-white text-[11px] font-bold transition-all shadow-[0_0_10px_rgba(255,153,133,0.25)] cursor-pointer"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>TEST INTERLOCK (30s)</span>
            </button>
          </div>
        </div>

        {/* 5-Metric Telemetry Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2.5">
          <div className="p-2 rounded bg-[var(--ws-sidebar)] border border-[var(--ws-line)]">
            <span className="text-[9px] text-[var(--ws-muted)] uppercase block">Enforced Rules</span>
            <span className="text-lg font-bold text-[var(--ws-mint)] font-['Orbitron']">
              {activeRules.length} ACTIVE
            </span>
          </div>
          <div className="p-2 rounded bg-[var(--ws-sidebar)] border border-[var(--ws-line)]">
            <span className="text-[9px] text-[var(--ws-muted)] uppercase block">Autonomous MTTR</span>
            <span className="text-lg font-bold text-[var(--ws-mint)] font-['Orbitron']">
              18.4 µs
            </span>
          </div>
          <div className="p-2 rounded bg-[var(--ws-sidebar)] border border-[var(--ws-line)]">
            <span className="text-[9px] text-[var(--ws-muted)] uppercase block">Interlocked Actuators</span>
            <span className="text-lg font-bold text-[var(--ws-mint)] font-['Orbitron']">
              3/3 SAFE
            </span>
          </div>
          <div className="p-2 rounded bg-[var(--ws-sidebar)] border border-[var(--ws-line)]">
            <span className="text-[9px] text-[var(--ws-muted)] uppercase block">Policy Standard</span>
            <span className="text-xs font-bold text-[var(--research-sand)] block mt-1">
              IEC-62443-4-2 STRICT
            </span>
          </div>
          <div className="p-2 rounded bg-[var(--ws-sidebar)] border border-[var(--ws-line)]">
            <span className="text-[9px] text-[var(--ws-muted)] uppercase block">Air-Gap Trip</span>
            <span className="text-xs font-bold text-[var(--ws-mint)] block mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ws-mint)] animate-pulse" />
              ARMED (STANDBY)
            </span>
          </div>
        </div>
      </div>

      {/* 2. RENDER ACTIVE TAB */}
      {remediationTab === "soar" ? (
        <SOARPlaybookBuilder />
      ) : (
        <div className="hud-box p-4 rounded space-y-3">
          <span className="hud-corner-tr">┐</span>
          <span className="hud-corner-bl">└</span>
          <div className="flex items-center justify-between border-b border-[var(--ws-line)] pb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[var(--ws-mint)] glow-cyan" />
              <h3 className="font-['Orbitron'] text-xs uppercase text-white font-bold tracking-wide">
                ACTIVE MITIGATION RULE LEDGER (AUTONOMOUS DAEMON)
              </h3>
            </div>
            <span className="text-[10px] text-[var(--ws-mint)]">
              Total Enforced Rules: {activeRules.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded border border-[var(--ws-line)] bg-[var(--ws-sidebar)]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--ws-sidebar)] border-b border-[var(--ws-line)] text-[var(--ws-muted)] text-[10px] uppercase">
                  <th scope="col" className="py-2.5 px-3">Rule ID &amp; Time</th>
                  <th scope="col" className="py-2.5 px-3">Threat Profile</th>
                  <th scope="col" className="py-2.5 px-3">Target Node / IP</th>
                  <th scope="col" className="py-2.5 px-3">Autonomous Command</th>
                  <th scope="col" className="py-2.5 px-3">Standard Mapping</th>
                  <th scope="col" className="py-2.5 px-3">Status</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ws-line)]/60">
                {activeRules.map((rule) => {
                  const isBlocked = rule.status === "ACTIVE_BLOCKED";
                  const isOverridden = rule.status === "OVERRIDDEN";
                  return (
                    <tr key={rule.id} className="hover:bg-[var(--ws-mint)]/5 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="text-white font-bold">{rule.id}</div>
                        <div className="text-[10px] text-[var(--ws-muted)]">{rule.timestamp}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--ws-coral)]/15 text-[var(--ws-coral)] border border-[var(--ws-coral)]/30">
                          {rule.threatType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[var(--ws-mint)]">
                        {rule.targetIp} {rule.targetPid ? `(PID: ${rule.targetPid})` : ""}
                      </td>
                      <td className="py-2.5 px-3 text-[var(--ws-text)] text-[11px]">
                        {rule.command}
                      </td>
                      <td className="py-2.5 px-3 text-[var(--ws-mint)]">
                        {rule.nistControl} / {rule.isoControl}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          isBlocked
                            ? "bg-[var(--ws-coral)]/15 text-[var(--ws-coral)] border-[var(--ws-coral)]/40"
                            : isOverridden
                            ? "bg-[var(--research-sand)]/15 text-[var(--research-sand)] border-[var(--research-sand)]/40"
                            : "bg-[var(--ws-mint)]/15 text-[var(--ws-mint)] border-[var(--ws-mint)]/40"
                        }`}>
                          {rule.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isBlocked ? (
                          <button
                            type="button"
                            onClick={() => handleRevoke(rule.id)}
                            disabled={!isDemo}
                            aria-label={`Revoke rule ${rule.id}`}
                            className="px-2.5 py-1 rounded bg-[var(--ws-sidebar)] hover:bg-[var(--ws-mint)]/20 border border-[var(--ws-line)] hover:border-[var(--ws-mint)] text-[var(--ws-text)] hover:text-[var(--ws-mint)] text-[10px] font-bold uppercase transition-colors cursor-pointer"
                          >
                            REVOKE
                          </button>
                        ) : (
                          <span className="text-[10px] text-[var(--ws-muted)] italic">
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
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="hud-box w-full max-w-lg p-6 space-y-4 border-2 border-[var(--ws-coral)] shadow-[0_0_50px_rgba(255,153,133,0.5)]">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>

            <div className="flex items-center gap-3 border-b border-[var(--ws-line)] pb-3">
              <div className="p-2.5 rounded-lg bg-[var(--ws-coral)]/20 text-[var(--ws-coral)] animate-pulse">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-['Orbitron'] font-bold text-base text-[var(--ws-coral)] tracking-wide">
                  IEC 62443 FOUR-EYES SAFETY INTERLOCK
                </h3>
                <p className="text-xs text-[var(--ws-muted)]">
                  Mandatory Human Operator Verification Before Physical Actuator Shutdown
                </p>
              </div>
            </div>

            {/* Countdown Display */}
            <div className="flex flex-col items-center justify-center py-3 bg-[var(--ws-sidebar)] rounded border border-[var(--ws-line)]">
              <div className="text-[10px] text-[var(--ws-muted)] uppercase mb-1">
                AUTOMATIC SHUTDOWN EXECUTES IN:
              </div>
              <div className="text-5xl font-bold font-['Orbitron'] text-[var(--ws-coral)] animate-pulse">
                {interlockCountdown}s
              </div>
              <div className="text-xs text-[var(--ws-mint)] mt-2">
                Target Node: {interlockTargetNode || "192.168.100.45 (Modbus PLC Node 01)"}
              </div>
            </div>

            <p className="text-xs text-[var(--ws-text)] leading-relaxed">
              To prevent uncommanded plant downtime and false trip interlocks on active turbine or water distribution lines, enter authorized operator badge credentials below to abort or override shutdown.
            </p>

            <form onSubmit={handleConfirmOverride} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="badge-input" className="text-[11px] text-[var(--ws-muted)]">
                  AUTHORIZED OPERATOR BADGE ID:
                </label>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[var(--ws-mint)]" />
                  <input
                    id="badge-input"
                    type="text"
                    value={operatorBadge}
                    onChange={(e) => setOperatorBadge(e.target.value)}
                    placeholder="e.g. OPERATOR-SEC-091"
                    className="flex-1 px-3 py-2 rounded bg-[var(--ws-sidebar)] border border-[var(--ws-line)] text-xs font-mono text-white focus:outline-none focus:border-[var(--ws-mint)]"
                  />
                </div>
                {badgeError && <div className="text-[10px] text-[var(--ws-coral)] font-bold">{badgeError}</div>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cancelInterlock}
                  className="px-4 py-2 rounded border border-[var(--ws-line)] bg-[var(--ws-sidebar)] text-xs font-bold text-[var(--ws-muted)] hover:text-white uppercase transition-colors cursor-pointer"
                >
                  DISMISS / LET TIMER RUN
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[var(--ws-coral)] text-white text-xs font-bold uppercase transition-colors shadow-[0_0_15px_var(--ws-coral)] hover:bg-[var(--ws-coral)]/90 cursor-pointer"
                >
                  OVERRIDE &amp; CANCEL SHUTDOWN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

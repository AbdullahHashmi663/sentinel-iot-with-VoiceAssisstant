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
import { unblockTargetAPI, overrideInterlockAPI } from "@/services/api";
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

  return (
    <div className="space-y-4 font-mono">
      {/* 1. TOP HEADER & MODE CONTROLS */}
      <div className="hud-box p-3 rounded">
        <span className="hud-corner-tr">┐</span>
        <span className="hud-corner-bl">└</span>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#162536]">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-[#03070c] p-0.5 rounded border border-[#162536]">
            <button
              type="button"
              onClick={() => setRemediationTab("rules")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                remediationTab === "rules"
                  ? "bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)] text-glow-cyan"
                  : "text-[#64748b] hover:text-white"
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
                  ? "bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)] text-glow-cyan"
                  : "text-[#64748b] hover:text-white"
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>SOAR PLAYBOOK DAG BUILDER</span>
            </button>
          </div>

          {/* Hooks & Actions */}
          <div className="flex items-center gap-2 text-[10px]">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#070d14] border border-[#162536] text-[#dee3eb]">
              <span className="text-[#00f0ff]">HOOKS:</span>
              <span className="text-[#00ff66]">xdp_drop</span> /
              <span className="text-[#00ff66]">cgroup_freeze</span> /
              <span className="text-[#00ff66]">tc_bpf</span>
            </div>
            <button
              type="button"
              onClick={() => startInterlockCountdown("192.168.100.45 (Modbus PLC 01)")}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#ff2a5f]/15 border border-[#ff2a5f] text-[#ff2a5f] hover:bg-[#ff2a5f] hover:text-white text-[11px] font-bold transition-all shadow-[0_0_10px_rgba(255,42,95,0.25)] cursor-pointer"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>TEST INTERLOCK (30s)</span>
            </button>
          </div>
        </div>

        {/* 5-Metric Telemetry Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2.5">
          <div className="p-2 rounded bg-[#070d14] border border-[#162536]">
            <span className="text-[9px] text-[#64748b] uppercase block">Enforced Rules</span>
            <span className="text-lg font-bold text-[#00f0ff] font-['Orbitron']">
              {activeRules.length} ACTIVE
            </span>
          </div>
          <div className="p-2 rounded bg-[#070d14] border border-[#162536]">
            <span className="text-[9px] text-[#64748b] uppercase block">Autonomous MTTR</span>
            <span className="text-lg font-bold text-[#00ff66] font-['Orbitron']">
              18.4 µs
            </span>
          </div>
          <div className="p-2 rounded bg-[#070d14] border border-[#162536]">
            <span className="text-[9px] text-[#64748b] uppercase block">Interlocked Actuators</span>
            <span className="text-lg font-bold text-[#00f0ff] font-['Orbitron']">
              3/3 SAFE
            </span>
          </div>
          <div className="p-2 rounded bg-[#070d14] border border-[#162536]">
            <span className="text-[9px] text-[#64748b] uppercase block">Policy Standard</span>
            <span className="text-xs font-bold text-[#ffb700] block mt-1">
              IEC-62443-4-2 STRICT
            </span>
          </div>
          <div className="p-2 rounded bg-[#070d14] border border-[#162536]">
            <span className="text-[9px] text-[#64748b] uppercase block">Air-Gap Trip</span>
            <span className="text-xs font-bold text-[#00ff66] block mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
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
          <div className="flex items-center justify-between border-b border-[#162536] pb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#00f0ff] glow-cyan" />
              <h3 className="font-['Orbitron'] text-xs uppercase text-white font-bold tracking-wide">
                ACTIVE MITIGATION RULE LEDGER (AUTONOMOUS DAEMON)
              </h3>
            </div>
            <span className="text-[10px] text-[#00f0ff]">
              Total Enforced Rules: {activeRules.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded border border-[#162536] bg-[#03070c]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#070d14] border-b border-[#162536] text-[#64748b] text-[10px] uppercase">
                  <th scope="col" className="py-2.5 px-3">Rule ID &amp; Time</th>
                  <th scope="col" className="py-2.5 px-3">Threat Profile</th>
                  <th scope="col" className="py-2.5 px-3">Target Node / IP</th>
                  <th scope="col" className="py-2.5 px-3">Autonomous Command</th>
                  <th scope="col" className="py-2.5 px-3">Standard Mapping</th>
                  <th scope="col" className="py-2.5 px-3">Status</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162536]/60">
                {activeRules.map((rule) => {
                  const isBlocked = rule.status === "ACTIVE_BLOCKED";
                  const isOverridden = rule.status === "OVERRIDDEN";
                  return (
                    <tr key={rule.id} className="hover:bg-[#00f0ff]/5 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="text-white font-bold">{rule.id}</div>
                        <div className="text-[10px] text-[#64748b]">{rule.timestamp}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#ff2a5f]/15 text-[#ff2a5f] border border-[#ff2a5f]/30">
                          {rule.threatType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#00f0ff]">
                        {rule.targetIp} {rule.targetPid ? `(PID: ${rule.targetPid})` : ""}
                      </td>
                      <td className="py-2.5 px-3 text-[#dee3eb] text-[11px]">
                        {rule.command}
                      </td>
                      <td className="py-2.5 px-3 text-[#00f0ff]">
                        {rule.nistControl} / {rule.isoControl}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          isBlocked
                            ? "bg-[#ff2a5f]/15 text-[#ff2a5f] border-[#ff2a5f]/40"
                            : isOverridden
                            ? "bg-[#ffb700]/15 text-[#ffb700] border-[#ffb700]/40"
                            : "bg-[#00ff66]/15 text-[#00ff66] border-[#00ff66]/40"
                        }`}>
                          {rule.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isBlocked ? (
                          <button
                            type="button"
                            onClick={() => handleRevoke(rule.id, rule.targetIp)}
                            aria-label={`Revoke rule ${rule.id}`}
                            className="px-2.5 py-1 rounded bg-[#070d14] hover:bg-[#00ff66]/20 border border-[#162536] hover:border-[#00ff66] text-[#dee3eb] hover:text-[#00ff66] text-[10px] font-bold uppercase transition-colors cursor-pointer"
                          >
                            REVOKE
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#64748b] italic">
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
          <div className="hud-box w-full max-w-lg p-6 space-y-4 border-2 border-[#ff2a5f] shadow-[0_0_50px_rgba(255,42,95,0.5)]">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>

            <div className="flex items-center gap-3 border-b border-[#162536] pb-3">
              <div className="p-2.5 rounded-lg bg-[#ff2a5f]/20 text-[#ff2a5f] animate-pulse">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-['Orbitron'] font-bold text-base text-[#ff2a5f] tracking-wide">
                  IEC 62443 FOUR-EYES SAFETY INTERLOCK
                </h3>
                <p className="text-xs text-[#64748b]">
                  Mandatory Human Operator Verification Before Physical Actuator Shutdown
                </p>
              </div>
            </div>

            {/* Countdown Display */}
            <div className="flex flex-col items-center justify-center py-3 bg-[#03070c] rounded border border-[#162536]">
              <div className="text-[10px] text-[#64748b] uppercase mb-1">
                AUTOMATIC SHUTDOWN EXECUTES IN:
              </div>
              <div className="text-5xl font-bold font-['Orbitron'] text-[#ff2a5f] animate-pulse">
                {interlockCountdown}s
              </div>
              <div className="text-xs text-[#00f0ff] mt-2">
                Target Node: {interlockTargetNode || "192.168.100.45 (Modbus PLC Node 01)"}
              </div>
            </div>

            <p className="text-xs text-[#dee3eb] leading-relaxed">
              To prevent uncommanded plant downtime and false trip interlocks on active turbine or water distribution lines, enter authorized operator badge credentials below to abort or override shutdown.
            </p>

            <form onSubmit={handleConfirmOverride} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="badge-input" className="text-[11px] text-[#64748b]">
                  AUTHORIZED OPERATOR BADGE ID:
                </label>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#00f0ff]" />
                  <input
                    id="badge-input"
                    type="text"
                    value={operatorBadge}
                    onChange={(e) => setOperatorBadge(e.target.value)}
                    placeholder="e.g. OPERATOR-SEC-091"
                    className="flex-1 px-3 py-2 rounded bg-[#070d14] border border-[#162536] text-xs font-mono text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
                {badgeError && <div className="text-[10px] text-[#ff2a5f] font-bold">{badgeError}</div>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cancelInterlock}
                  className="px-4 py-2 rounded border border-[#162536] bg-[#070d14] text-xs font-bold text-[#64748b] hover:text-white uppercase transition-colors cursor-pointer"
                >
                  DISMISS / LET TIMER RUN
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#ff2a5f] text-white text-xs font-bold uppercase transition-colors shadow-[0_0_15px_#ff2a5f] hover:bg-[#ff2a5f]/90 cursor-pointer"
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

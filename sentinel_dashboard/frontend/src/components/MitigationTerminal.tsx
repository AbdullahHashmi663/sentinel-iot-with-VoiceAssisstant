"use client";

import React, { useState } from "react";
import {
  Terminal,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw,
  Ban,
  Scissors,
  Network,
  Clock,
  Sparkles
} from "lucide-react";

interface MitigationTerminalProps {
  mitigationData: any;
  onManualAction: (actionType: string, target: string) => void;
}

export default function MitigationTerminal({
  mitigationData,
  onManualAction
}: MitigationTerminalProps) {
  const [manualIp, setManualIp] = useState("192.168.1.105");
  const [manualPid, setManualPid] = useState("4820");

  const remediationStatus = mitigationData?.remediation_status || "NOMINAL";
  const remediationAction = mitigationData?.remediation_action || "Continuous passive sensor baseline telemetry.";
  const commandDispatched = mitigationData?.command_dispatched || "none";
  const sourceIp = mitigationData?.source_ip || "192.168.1.100";
  const pid = mitigationData?.pid || 1234;
  const mttrMs = mitigationData?.mttr_ms || 21.5;

  const isBlocked = remediationStatus === "ACTIVE_BLOCKED";
  const isWarning = remediationStatus === "WARNING_RAISED";

  return (
    <div className="cyber-card p-4 space-y-4">
      
      {/* SECTION HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[var(--accent-primary)]" />
          <h3 className="font-['Orbitron'] font-bold text-sm text-[var(--text-primary)] tracking-wide">
            AUTONOMOUS CLOSED-LOOP ACTIVE RESPONSE CONSOLE
          </h3>
        </div>

        {/* POSTURE BADGE */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-['Orbitron'] font-bold tracking-wider flex items-center gap-1.5 ${
              isBlocked
                ? "bg-[var(--alert-critical)]/20 text-[var(--alert-critical)] border border-[var(--alert-critical)] shadow-[0_0_12px_var(--alert-critical)] animate-pulse"
                : isWarning
                ? "bg-[var(--alert-warning)]/20 text-[var(--alert-warning)] border border-[var(--alert-warning)]"
                : "bg-[var(--alert-nominal)]/15 text-[var(--alert-nominal)] border border-[var(--alert-nominal)]/40"
            }`}
          >
            {isBlocked ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{remediationStatus.replace("_", " ")}</span>
          </span>
        </div>
      </div>

      {/* MTTR SPEEDOMETER & COMMAND BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        
        {/* MTTR KPI */}
        <div className="sm:col-span-4 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)] uppercase">
            <Clock className="w-3 h-3 text-[var(--alert-nominal)]" />
            <span>Mean Time To Respond (MTTR)</span>
          </div>
          <div className="font-['Orbitron'] font-black text-2xl text-[var(--alert-nominal)] drop-shadow-[0_0_10px_var(--alert-nominal)] my-0.5">
            {isBlocked ? `${mttrMs} ms` : "21.5 ms"}
          </div>
          <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-secondary)]">
            Industrial SLA: &lt; 1,000 ms (<span className="text-[var(--alert-nominal)] font-bold">46.5x faster</span>)
          </div>
        </div>

        {/* ACTIVE REMEDIATION NOTIFICATION */}
        <div className="sm:col-span-8 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-['Rajdhani'] font-bold text-[var(--text-muted)] uppercase">
            <span>Automated Mitigation Action:</span>
            <span className="text-[var(--accent-primary)] font-['JetBrains_Mono'] text-[10px]">
              Engine: Wazuh Daemon
            </span>
          </div>
          <p className="text-xs font-['JetBrains_Mono'] text-[var(--text-primary)] font-semibold leading-relaxed">
            {remediationAction}
          </p>
          {commandDispatched !== "none" && (
            <div className="px-2.5 py-1 rounded bg-black/60 border border-[var(--border-color)] text-[11px] font-['JetBrains_Mono'] text-[var(--accent-primary)] flex items-center gap-2">
              <span className="text-[var(--text-muted)]">$</span>
              <span className="truncate">{commandDispatched}</span>
            </div>
          )}
        </div>

      </div>

      {/* RETRO TERMINAL LOG CONSOLE */}
      <div className="p-3.5 rounded-lg bg-[var(--terminal-bg)] border border-[var(--border-color)] font-['JetBrains_Mono'] text-xs space-y-1.5 shadow-inner max-h-40 overflow-y-auto scanlines">
        <div className="text-[var(--text-muted)] flex items-center justify-between border-b border-white/5 pb-1 text-[10px]">
          <span>SENTINEL-XDR ACTIVE RESPONSE TELETYPE LOGS</span>
          <span>TTY /dev/pts/0</span>
        </div>

        <div className="text-emerald-400">
          [16:48:12.004] [INIT] Wazuh Active Response Daemon initialized on host adapter.
        </div>
        <div className="text-cyan-400">
          [16:48:12.019] [SYS] Conformer inference pipeline engaged. Sliding buffer window = 10.
        </div>
        {isBlocked ? (
          <>
            <div className="text-rose-400 font-bold">
              [ALERT] Zero-Day Anomaly Probability threshold breached (&gt; 0.85).
            </div>
            <div className="text-amber-300">
              [EXEC] Executing active response rule: {commandDispatched}
            </div>
            <div className="text-emerald-400 font-bold">
              [SUCCESS] Threat neutralized in {mttrMs} ms. Network interface isolated. Audit log updated.
            </div>
          </>
        ) : (
          <div className="text-[var(--text-muted)]">
            [NOMINAL] Continuous cross-layer sensor baseline monitoring. Zero anomalous deviations detected.
          </div>
        )}
      </div>

      {/* MANUAL OPERATOR OVERRIDE ACTION TOOLBAR */}
      <div className="border-t border-[var(--border-color)] pt-3 space-y-2">
        <div className="text-xs font-['Rajdhani'] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          Manual Operator Defense Overrides:
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Block IP */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={manualIp}
              onChange={(e) => setManualIp(e.target.value)}
              placeholder="IP Address"
              className="px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-['JetBrains_Mono'] text-[var(--text-primary)] w-32 focus:outline-none"
            />
            <button
              onClick={() => onManualAction("BLOCK_IP", manualIp)}
              className="flex items-center gap-1 px-3 py-1 rounded bg-[var(--alert-critical)]/20 border border-[var(--alert-critical)] text-[var(--alert-critical)] hover:bg-[var(--alert-critical)] hover:text-white text-xs font-['Orbitron'] font-bold uppercase transition-all"
            >
              <Ban className="w-3 h-3" />
              <span>Block IP</span>
            </button>
          </div>

          {/* Kill PID */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={manualPid}
              onChange={(e) => setManualPid(e.target.value)}
              placeholder="PID"
              className="px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-['JetBrains_Mono'] text-[var(--text-primary)] w-20 focus:outline-none"
            />
            <button
              onClick={() => onManualAction("KILL_PID", manualPid)}
              className="flex items-center gap-1 px-3 py-1 rounded bg-[var(--accent-secondary)]/20 border border-[var(--accent-secondary)] text-[var(--accent-secondary)] hover:bg-[var(--accent-secondary)] hover:text-white text-xs font-['Orbitron'] font-bold uppercase transition-all"
            >
              <Scissors className="w-3 h-3" />
              <span>Kill PID</span>
            </button>
          </div>

          {/* Isolate Host */}
          <button
            onClick={() => onManualAction("ISOLATE_HOST", "ALL")}
            className="flex items-center gap-1 px-3.5 py-1 rounded bg-[var(--alert-warning)]/20 border border-[var(--alert-warning)] text-[var(--alert-warning)] hover:bg-[var(--alert-warning)] hover:text-black text-xs font-['Orbitron'] font-bold uppercase transition-all"
          >
            <Network className="w-3 h-3" />
            <span>Isolate Host</span>
          </button>
        </div>
      </div>

    </div>
  );
}

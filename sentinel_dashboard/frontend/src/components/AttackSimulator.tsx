"use client";

import React, { useState } from "react";
import {
  Skull,
  Zap,
  ShieldCheck,
  Flame,
  Bug,
  KeyRound,
  Network,
  Radio,
  FileCode2,
  Terminal,
  Crosshair
} from "lucide-react";

interface AttackSimulatorProps {
  onInjectAttack?: (attackType: string) => void;
  activeDomain?: string;
}

const ATTACK_VECTORS = [
  { id: "ddos", label: "DDoS Flood", icon: Zap, color: "#ff0055", desc: "Volumetric network buffer overflow & SYN storm" },
  { id: "ransomware", label: "Ransomware", icon: Skull, color: "#ff3366", desc: "Rapid file system encryption & high disk I/O" },
  { id: "scanning", label: "Port Scanning", icon: Crosshair, color: "#fcee0a", desc: "SYN/FIN stealth reconnaissance probe" },
  { id: "injection", label: "SQL Injection", icon: Bug, color: "#f97316", desc: "Malicious payload escaping schema bounds" },
  { id: "password", label: "Brute Force", icon: KeyRound, color: "#a855f7", desc: "High-frequency dictionary authentication assault" },
  { id: "mitm", label: "MITM Poisoning", icon: Network, color: "#00d2ff", desc: "ARP cache spoofing & gateway impersonation" },
  { id: "backdoor", label: "Backdoor C2", icon: Radio, color: "#e11d48", desc: "Stealthy outbound reverse shell beaconing" },
  { id: "xss", label: "XSS Injection", icon: FileCode2, color: "#06b6d4", desc: "Client-side script payload exfiltration" },
  { id: "normal", label: "Nominal Baseline", icon: ShieldCheck, color: "#00ff66", desc: "Standard operating parameters and telemetry" },
];

export default function AttackSimulator(props: AttackSimulatorProps) {
  const [selectedAttack, setSelectedAttack] = useState<string>("ddos");
  const [targetIp, setTargetIp] = useState<string>("192.168.1.105");
  const [targetPort, setTargetPort] = useState<string>("8080");
  const [targetPid, setTargetPid] = useState<string>("4820");
  const [lastInjected, setLastInjected] = useState<string | null>(null);

  const handleInject = () => {
    if (props.onInjectAttack) {
      props.onInjectAttack(selectedAttack);
    } else {
      fetch("http://127.0.0.1:8000/api/inject-attack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attack_type: selectedAttack })
      }).catch(() => {});
    }
    setLastInjected(selectedAttack.toUpperCase());
    setTimeout(() => setLastInjected(null), 3000);
  };

  return (
    <div className="cyber-card p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[var(--alert-critical)]" />
          <h3 className="font-['Orbitron'] font-bold text-sm text-[var(--text-primary)] tracking-wide">
            ADVERSARIAL ATTACK INJECTION SIMULATOR
          </h3>
        </div>
        <span className="text-[11px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[var(--alert-critical)]/15 text-[var(--alert-critical)] border border-[var(--alert-critical)]/30 font-bold uppercase">
          Red Team Testbed
        </span>
      </div>

      {/* ATTACK VECTOR GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-2">
        {ATTACK_VECTORS.map((vec) => {
          const Icon = vec.icon;
          const isSelected = selectedAttack === vec.id;
          return (
            <button
              key={vec.id}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Select ${vec.label} attack vector`}
              onClick={() => setSelectedAttack(vec.id)}
              className={`cursor-pointer p-2.5 rounded-lg border text-left transition-colors duration-150 flex flex-col justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
                isSelected
                  ? "bg-[var(--bg-surface-elevated)] border-[var(--accent-primary)] shadow-[0_0_12px_var(--accent-glow)]"
                  : "bg-[var(--bg-surface)]/70 border-[var(--border-color)] hover:border-[var(--text-secondary)] opacity-90 hover:opacity-100 hover:bg-[var(--bg-surface)]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon
                  className="w-4 h-4 transition-transform group-hover:scale-105"
                  style={{ color: vec.color }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: vec.color }}
                />
              </div>
              <div>
                <div className="font-['Rajdhani'] font-bold text-xs text-[var(--text-primary)] truncate">
                  {vec.label}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                  {vec.id === "normal" ? "Clean traffic" : "Exploit vector"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* TARGET PARAMETERS & ENGAGE ACTION */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3 text-xs font-['JetBrains_Mono'] flex-wrap">
          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] cursor-text focus-within:border-[var(--accent-primary)]">
            <span className="text-[var(--text-muted)]">SRC IP:</span>
            <input
              type="text"
              value={targetIp}
              aria-label="Target Source IP Address"
              onChange={(e) => setTargetIp(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] w-28 focus:outline-none focus-visible:outline-none"
            />
          </label>

          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] cursor-text focus-within:border-[var(--accent-primary)]">
            <span className="text-[var(--text-muted)]">PORT:</span>
            <input
              type="text"
              value={targetPort}
              aria-label="Target Destination Port"
              onChange={(e) => setTargetPort(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] w-14 focus:outline-none focus-visible:outline-none"
            />
          </label>

          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] cursor-text focus-within:border-[var(--accent-primary)]">
            <span className="text-[var(--text-muted)]">TARGET PID:</span>
            <input
              type="text"
              value={targetPid}
              aria-label="Target Host Process ID"
              onChange={(e) => setTargetPid(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] w-14 focus:outline-none focus-visible:outline-none"
            />
          </label>
        </div>

        {/* INJECT TRIGGER BUTTON */}
        <div className="flex items-center gap-2">
          {lastInjected && (
            <span className="text-xs font-['JetBrains_Mono'] font-bold text-[var(--alert-warning)] animate-bounce">
              ⚡ PRIMED: {lastInjected}
            </span>
          )}
          <button
            type="button"
            onClick={handleInject}
            aria-label="Inject Selected Threat Vector into Telemetry Engine"
            className="cursor-pointer flex items-center gap-2 px-5 py-2 rounded-lg font-['Orbitron'] font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-[var(--alert-critical)] via-[var(--alert-warning)] to-[var(--accent-primary)] hover:opacity-95 hover:shadow-[0_0_20px_rgba(255,0,85,0.6)] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--alert-critical)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>INJECT THREAT VECTOR</span>
          </button>
        </div>
      </div>
    </div>
  );
}

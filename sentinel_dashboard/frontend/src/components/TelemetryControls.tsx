// ==============================================================================
// SENTINEL-IOT: TELEMETRY TRANSPORT & BUFFER HUD
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  Cpu,
  Layers,
  Database,
  Radio,
  Gauge
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import { DomainType } from "@/types/sentinel";

export const DEFAULT_DOMAINS: Record<string, { num_features: number; num_classes: number }> = {
  Network_Traffic: { num_features: 17, num_classes: 10 },
  IoT_Modbus: { num_features: 6, num_classes: 3 },
  IoT_Fridge: { num_features: 5, num_classes: 4 },
  IoT_GPS_Tracker: { num_features: 6, num_classes: 4 },
  IoT_Garage_Door: { num_features: 5, num_classes: 4 },
  IoT_Motion_Light: { num_features: 5, num_classes: 4 },
  IoT_Thermostat: { num_features: 5, num_classes: 4 },
  IoT_Weather: { num_features: 5, num_classes: 4 },
  Linux_process: { num_features: 6, num_classes: 5 },
  Linux_disk: { num_features: 6, num_classes: 4 },
  Linux_memory: { num_features: 5, num_classes: 4 },
  Windows_10: { num_features: 5, num_classes: 4 },
  Windows_7: { num_features: 4, num_classes: 4 },
};

interface TelemetryControlsProps {
  mode?: "simulator" | "live_host";
  onModeChange?: (m: "simulator" | "live_host") => void;
  activeDomain?: string;
  onDomainChange?: (d: string) => void;
  domains?: Record<string, any>;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onStep?: () => void;
  speed?: number;
  onSpeedChange?: (s: number) => void;
  bufferedSteps?: number;
}

const SPEED_OPTIONS = [0.5, 1.0, 2.0, 5.0, 10.0];

export default function TelemetryControls(props: TelemetryControlsProps) {
  const store = useTelemetryStore();

  const [localMode, setLocalMode] = useState<"simulator" | "live_host">("simulator");
  const [localIsPlaying, setLocalIsPlaying] = useState<boolean>(true);
  const [localSpeed, setLocalSpeed] = useState<number>(1.0);

  const activeDomain = props.activeDomain || store.activeDomain || "Network_Traffic";
  const onDomainChange = props.onDomainChange || ((d: string) => store.setActiveDomain(d as DomainType));
  const domains = props.domains || DEFAULT_DOMAINS;
  const mode = props.mode || localMode;
  const onModeChange = props.onModeChange || setLocalMode;
  const isPlaying = props.isPlaying !== undefined ? props.isPlaying : localIsPlaying;
  const onTogglePlay = props.onTogglePlay || (() => setLocalIsPlaying(!localIsPlaying));
  const speed = props.speed !== undefined ? props.speed : localSpeed;
  const onSpeedChange = props.onSpeedChange || setLocalSpeed;
  const bufferedSteps = props.bufferedSteps !== undefined ? props.bufferedSteps : 10;
  const isLightMode = store.theme === "alabaster" || store.theme === "arctic" || store.theme === "light";

  const currentDomainMeta = domains[activeDomain] || { num_features: 17, num_classes: 10 };

  return (
    <div className="cyber-card glass-panel-deep relative overflow-hidden p-5 space-y-4">
      {/* TOP SPECULAR LIGHT BEAM */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent-primary)]/60 to-transparent pointer-events-none z-10" />

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        
        {/* MODE TOGGLE */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-inset border border-white/10">
          <button
            onClick={() => {
              store.triggerGlobalLoading(800, "INITIALIZING ToN_IoT DATASET BUNDLE", "Loading 13 industrial sensory domain models...");
              onModeChange("simulator");
            }}
            className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold uppercase transition-all focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none ${
              mode === "simulator"
                ? "bg-[var(--accent-primary)] text-black shadow-[0_0_15px_var(--accent-primary)] border border-white/30"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>ToN_IoT Datasets (13)</span>
          </button>

          <button
            onClick={() => {
              store.triggerGlobalLoading(850, "CONNECTING TO LIVE WINDOWS HOST OS", "Streaming real-time WinEvent & process telemetry sockets...");
              onModeChange("live_host");
            }}
            className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold uppercase transition-all focus-visible:ring-2 focus-visible:ring-[var(--alert-nominal)] focus-visible:outline-none ${
              mode === "live_host"
                ? "bg-[var(--alert-nominal)] text-black shadow-[0_0_15px_var(--alert-nominal)] border border-white/30"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Live Windows Host OS</span>
          </button>
        </div>

        {/* ACTIVE DOMAIN DROPDOWN */}
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="text-xs font-['Rajdhani'] font-bold text-[var(--text-muted)] uppercase tracking-wider hidden sm:inline">
            Domain:
          </span>
          <select
            value={activeDomain}
            onChange={(e) => {
              const newD = e.target.value;
              const meta = domains[newD] || { num_features: 17, num_classes: 10 };
              store.triggerGlobalLoading(
                750,
                `BUFFERING DOMAIN: ${newD.toUpperCase()}`,
                `Calibrating 10-step sequence tensors (${meta.num_features} features, ${meta.num_classes} classes)...`
              );
              onDomainChange(newD);
            }}
            disabled={mode === "live_host"}
            aria-label="Active Telemetry Domain Selection"
            className="flex-1 px-3.5 py-2 rounded-xl glass-inset border border-white/15 text-xs font-['JetBrains_Mono'] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] cursor-pointer disabled:opacity-50 transition-colors shadow-inner"
          >
            {Object.keys(domains).map((d) => {
              const meta = domains[d] || { num_features: 10, num_classes: 5 };
              return (
                <option
                  key={d}
                  value={d}
                  className={isLightMode ? "bg-[#fafaff] text-[#1c1c1c]" : "bg-[#070D17] text-white"}
                >
                  {d} — ({meta.num_features} feats, {meta.num_classes} classes)
                </option>
              );
            })}
          </select>
        </div>

        {/* PLAYBACK TRANSPORT */}
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause Telemetry Stream" : "Resume Telemetry Stream"}
            className={`cursor-pointer p-2.5 rounded-xl border transition-all focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none shadow-sm ${
              isPlaying
                ? "bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-black shadow-[0_0_15px_var(--accent-glow)]"
                : "bg-white/5 border-white/15 text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:bg-white/10"
            }`}
            title={isPlaying ? "Pause Stream" : "Resume Stream"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Single Step */}
          <button
            onClick={props.onStep || (() => {})}
            disabled={isPlaying}
            aria-label="Step 1 Telemetry Packet Forward"
            className="cursor-pointer p-2.5 rounded-xl bg-white/5 border border-white/15 text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:bg-white/10 disabled:opacity-30 transition-all focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none disabled:cursor-not-allowed shadow-sm"
            title="Step 1 Telemetry Packet Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Multipliers */}
          <div className="flex items-center gap-1 glass-inset p-1 rounded-xl border border-white/10 text-xs font-['JetBrains_Mono']">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                aria-label={`Set speed to ${s}x`}
                className={`cursor-pointer px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none ${
                  speed === s
                    ? "bg-[var(--accent-primary)] text-black shadow-md font-bold"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 10-SLOT CONFORMER SLIDING BUFFER VISUALIZER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
          <span className="text-xs font-['Orbitron'] font-bold text-[var(--text-primary)] tracking-wide">
            10-STEP SLIDING SEQUENCE BUFFER
          </span>
          <span className="glass-pill text-[11px] font-['JetBrains_Mono'] px-2.5 py-0.5 text-[var(--accent-tertiary)] border border-white/15">
            {bufferedSteps} / 10 Time-Steps
          </span>
        </div>

        {/* 10 CRYOGENIC GLOWING GLASS VIALS */}
        <div className="flex items-center gap-2 flex-1 max-w-[440px] px-2 py-1.5 rounded-xl glass-inset border border-white/10">
          {Array.from({ length: 10 }).map((_, i) => {
            const isFilled = i < bufferedSteps;
            const isLatest = i === bufferedSteps - 1;
            return (
              <div
                key={i}
                className={`flex-1 h-3.5 rounded-sm relative overflow-hidden transition-all duration-200 ${
                  isFilled
                    ? isLatest
                      ? "bg-[var(--accent-primary)] shadow-[0_0_14px_var(--accent-primary)] scale-y-125 border border-white/60"
                      : "bg-[var(--accent-primary)]/80 shadow-[0_0_8px_var(--accent-primary)] border border-white/20"
                    : isLightMode
                    ? "bg-[#daddd8] border border-[#c5c8c2]"
                    : "bg-white/5 border border-white/10"
                }`}
                title={`Buffer Slot ${i + 1}/10: ${isFilled ? "Active" : "Empty"}`}
              >
                {/* Specular Highlight reflection */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/40 pointer-events-none" />
              </div>
            );
          })}
        </div>

        <div className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-muted)] hidden md:block">
          {bufferedSteps === 10 ? (
            <span className="text-[var(--alert-nominal)] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--alert-nominal)] animate-ping" />
              INFERENCE TRIGGERED (10/10)
            </span>
          ) : (
            <span>Buffering temporal sequence...</span>
          )}
        </div>
      </div>
    </div>
  );
}

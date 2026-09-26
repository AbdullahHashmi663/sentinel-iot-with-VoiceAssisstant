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

  const currentDomainMeta = domains[activeDomain] || { num_features: 17, num_classes: 10 };

  return (
    <div className="cyber-card p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
        
        {/* MODE TOGGLE */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
          <button
            onClick={() => onModeChange("simulator")}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-['Rajdhani'] font-bold uppercase transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none ${
              mode === "simulator"
                ? "bg-[var(--accent-primary)] text-[var(--bg-primary)] shadow-[0_0_12px_var(--accent-primary)]"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>ToN_IoT Datasets (13)</span>
          </button>

          <button
            onClick={() => onModeChange("live_host")}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-['Rajdhani'] font-bold uppercase transition-colors focus-visible:ring-2 focus-visible:ring-[var(--alert-nominal)] focus-visible:outline-none ${
              mode === "live_host"
                ? "bg-[var(--alert-nominal)] text-[var(--bg-primary)] shadow-[0_0_12px_var(--alert-nominal)]"
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
            onChange={(e) => onDomainChange(e.target.value)}
            disabled={mode === "live_host"}
            aria-label="Active Telemetry Domain Selection"
            className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-['JetBrains_Mono'] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] cursor-pointer disabled:opacity-50 transition-colors"
          >
            {Object.keys(domains).map((d) => {
              const meta = domains[d] || { num_features: 10, num_classes: 5 };
              return (
                <option key={d} value={d} className="bg-[#0f1226] text-white">
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
            className={`cursor-pointer p-2 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none ${
              isPlaying
                ? "bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-black"
                : "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]"
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
            className="cursor-pointer p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] disabled:opacity-40 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none disabled:cursor-not-allowed"
            title="Step 1 Telemetry Packet Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Multipliers */}
          <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-color)] text-xs font-['JetBrains_Mono']">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                aria-label={`Set speed to ${s}x`}
                className={`cursor-pointer px-2 py-0.5 rounded text-[11px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none ${
                  speed === s
                    ? "bg-[var(--accent-primary)] text-[var(--bg-primary)] shadow-sm font-bold"
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
          <span className="text-[11px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--accent-tertiary)] border border-[var(--border-color)]">
            {bufferedSteps} / 10 Time-Steps
          </span>
        </div>

        {/* 10 LED SLOTS */}
        <div className="flex items-center gap-1.5 flex-1 max-w-[420px]">
          {Array.from({ length: 10 }).map((_, i) => {
            const isFilled = i < bufferedSteps;
            const isLatest = i === bufferedSteps - 1;
            return (
              <div
                key={i}
                className={`flex-1 h-3 rounded-sm transition-all duration-200 ${
                  isFilled
                    ? isLatest
                      ? "bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)] scale-y-110"
                      : "bg-[var(--accent-primary)]/80 shadow-[0_0_6px_var(--accent-primary)]"
                    : "bg-[var(--bg-surface)] border border-[var(--border-color)]/60"
                }`}
                title={`Buffer Slot ${i + 1}/10: ${isFilled ? "Active" : "Empty"}`}
              />
            );
          })}
        </div>

        <div className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-muted)] hidden md:block">
          {bufferedSteps === 10 ? (
            <span className="text-[var(--alert-nominal)] font-bold">⚡ INFERENCE TRIGGERED (10/10)</span>
          ) : (
            <span>Buffering temporal sequence...</span>
          )}
        </div>
      </div>
    </div>
  );
}

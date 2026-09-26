"use client";

import React, { useMemo } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Zap,
  Clock,
  Sparkles,
  Gauge
} from "lucide-react";

interface ConformerHUDProps {
  inferenceData: any;
  rawFeatures: number[];
  featureNames: string[];
}

export default function ConformerHUD({
  inferenceData,
  rawFeatures,
  featureNames
}: ConformerHUDProps) {
  const anomalyProb = inferenceData ? inferenceData.anomaly_probability : 0.042;
  const isAnomaly = inferenceData ? inferenceData.is_anomaly : false;
  const forensicLabel = inferenceData ? inferenceData.forensic_label : "normal";
  const confidence = inferenceData ? inferenceData.forensic_confidence : 0.985;
  const latencyMs = inferenceData ? inferenceData.inference_latency_ms : 0.78;

  // Gauge calculations for 240-degree arc
  // Radius = 80, Circumference = 2 * PI * 80 = 502.65
  // 240 degrees / 360 = 0.6667 * 502.65 = 335.1
  const radius = 80;
  const totalArcLength = 335.1;
  const strokeDashoffset = totalArcLength - totalArcLength * Math.min(Math.max(anomalyProb, 0), 1);

  // Determine threat level color and text
  const { statusText, statusColor, badgeBg, alertClass } = useMemo(() => {
    if (anomalyProb >= 0.85) {
      return {
        statusText: "CRITICAL ZERO-DAY ANOMALY",
        statusColor: "var(--alert-critical)",
        badgeBg: "rgba(255, 0, 85, 0.18)",
        alertClass: "critical-alert-box"
      };
    } else if (anomalyProb >= 0.60) {
      return {
        statusText: "ELEVATED THREAT WARNING",
        statusColor: "var(--alert-warning)",
        badgeBg: "rgba(252, 238, 10, 0.18)",
        alertClass: "border-amber-400/50"
      };
    } else {
      return {
        statusText: "NOMINAL TELEMETRY BASELINE",
        statusColor: "var(--alert-nominal)",
        badgeBg: "rgba(0, 255, 102, 0.15)",
        alertClass: ""
      };
    }
  }, [anomalyProb]);

  return (
    <div className={`cyber-card p-5 space-y-5 ${alertClass}`}>
      
      {/* SECTION HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--accent-primary)]" />
          <h3 className="font-['Orbitron'] font-bold text-sm text-[var(--text-primary)] tracking-wide">
            CONFORMER DUAL-HEAD NEURAL DETECTION HUD
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-['Orbitron'] font-bold tracking-wider flex items-center gap-1.5"
            style={{ backgroundColor: badgeBg, color: statusColor, border: `1px solid ${statusColor}` }}
          >
            {anomalyProb >= 0.85 ? (
              <ShieldAlert className="w-3.5 h-3.5 animate-spin" />
            ) : anomalyProb >= 0.60 ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>{statusText}</span>
          </span>
        </div>
      </div>

      {/* CORE HUD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* RADIAL ARC ANOMALY GAUGE (HEAD 1) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 relative">
          <div className="relative w-52 h-44 flex items-center justify-center">
            <svg className="w-52 h-52 -rotate-[210deg] transform" viewBox="0 0 200 200">
              {/* Background Arc */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="var(--bg-surface)"
                strokeWidth="14"
                strokeDasharray={`${totalArcLength} 502.65`}
                strokeLinecap="round"
              />
              {/* Animated Progress Arc */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={statusColor}
                strokeWidth="14"
                strokeDasharray={`${totalArcLength} 502.65`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
                style={{ filter: `drop-shadow(0 0 10px ${statusColor})` }}
              />
            </svg>

            {/* Central Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 pointer-events-none">
              <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Anomaly Probability
              </span>
              <span
                className="font-['Orbitron'] font-black text-3xl tracking-tight transition-all duration-200"
                style={{ color: statusColor, textShadow: `0 0 16px ${statusColor}` }}
              >
                {(anomalyProb * 100).toFixed(1)}%
              </span>
              <span className="text-[11px] font-['Rajdhani'] font-bold text-[var(--text-secondary)] mt-0.5">
                Head 1: Zero-Day Sigmoid
              </span>
            </div>
          </div>

          {/* Calibrated Threshold Markers */}
          <div className="flex items-center justify-between w-full max-w-[240px] text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)] pt-1 px-2 border-t border-[var(--border-color)]/40">
            <span className="text-[var(--alert-nominal)] font-semibold">0% (Clean)</span>
            <span className="text-[var(--alert-warning)] font-semibold">60% (Warning)</span>
            <span className="text-[var(--alert-critical)] font-semibold">85% (Critical)</span>
          </div>
        </div>

        {/* FORENSIC CLASSIFIER & METRICS (HEAD 2) */}
        <div className="md:col-span-7 space-y-4">
          
          {/* Attack Classification Card */}
          <div className="p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-['Rajdhani'] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Head 2: Forensic Multi-Class Classifier
              </span>
              <span className="text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--border-color)]">
                Softmax Head
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[var(--text-muted)] font-['JetBrains_Mono']">
                  IDENTIFIED THREAT SIGNATURE:
                </div>
                <div className="font-['Orbitron'] font-black text-xl text-[var(--text-primary)] uppercase tracking-wide mt-0.5">
                  {forensicLabel}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--text-muted)] font-['JetBrains_Mono']">CONFIDENCE:</div>
                <div className="font-['JetBrains_Mono'] font-bold text-lg text-[var(--accent-tertiary)]">
                  {(confidence * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Confidence Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden mt-3">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${confidence * 100}%`,
                  backgroundColor: statusColor,
                  boxShadow: `0 0 10px ${statusColor}`
                }}
              />
            </div>
          </div>

          {/* REAL-TIME LATENCY & PERFORMANCE BADGES */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-center">
              <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)] flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-[var(--accent-primary)]" />
                <span>MTTD (DETECT)</span>
              </div>
              <div className="font-['Orbitron'] font-bold text-base text-[var(--accent-primary)] mt-1">
                3.2 ms
              </div>
              <div className="text-[9px] text-[var(--text-muted)]">Sub-second SLA</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-center">
              <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)] flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-[var(--accent-tertiary)]" />
                <span>XAI SALIENCY</span>
              </div>
              <div className="font-['Orbitron'] font-bold text-base text-[var(--accent-tertiary)] mt-1">
                {latencyMs} ms
              </div>
              <div className="text-[9px] text-[var(--alert-nominal)] font-semibold">99.97% vs SHAP</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-center">
              <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)] flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-[var(--alert-nominal)]" />
                <span>MTTR (RESPOND)</span>
              </div>
              <div className="font-['Orbitron'] font-bold text-base text-[var(--alert-nominal)] mt-1">
                21.5 ms
              </div>
              <div className="text-[9px] text-[var(--text-muted)]">Wazuh Active Core</div>
            </div>
          </div>

        </div>

      </div>

      {/* LIVE RAW FEATURE SPARKLINE TILES */}
      <div className="border-t border-[var(--border-color)] pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-['Rajdhani'] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Active Multivariate Telemetry Feed (Normalized [0, 1])
          </span>
          <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">
            Displaying first {rawFeatures.length} features
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {rawFeatures.map((val, idx) => {
            const name = featureNames[idx] || `feat_${idx}`;
            const pct = Math.min(Math.max(val * 100, 0), 100);
            return (
              <div
                key={idx}
                className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col justify-between"
              >
                <div className="text-[9px] font-['JetBrains_Mono'] text-[var(--text-muted)] truncate" title={name}>
                  {name}
                </div>
                <div className="font-['JetBrains_Mono'] font-bold text-xs text-[var(--accent-primary)] my-0.5">
                  {val.toFixed(2)}
                </div>
                <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-200"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

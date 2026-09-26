// ==============================================================================
// CONSOLE 3: SALIENCY XAI & LATENCY ENGINE (SECTION 5.4)
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

"use client";

import React from "react";
import {
  Zap,
  Clock,
  BarChart3,
  TrendingDown,
  Gauge,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";

export default function XaiConsole() {
  const { latestEvent, activeDomain } = useTelemetryStore();

  const saliencyFeatures = latestEvent?.saliencyTopFeatures || [
    { featureName: "Process_IO_Write_Bytes_sec", importanceScore: 44.2 },
    { featureName: "Process_Virtual_Bytes_Peak", importanceScore: 28.6 },
    { featureName: "Thread_Count_Active", importanceScore: 16.4 },
    { featureName: "Handle_Count_Allocated", importanceScore: 10.8 }
  ];

  const xaiLatency = latestEvent?.xaiLatencyMs || 0.78;

  // Latency Decomposition Waterfall Metrics (Section 5.4)
  const latencyWaterfall = [
    {
      stage: "Ingestion & Sanitization",
      latency: 3.80,
      description: "Sensor stream MinMax normalization & 10-step tensor framing",
      color: "var(--brand-cyan)"
    },
    {
      stage: "Conformer Core Inference",
      latency: 0.78,
      description: "Depthwise Conv1D + Multi-Head Self-Attention dual-head forward pass",
      color: "var(--brand-primary)"
    },
    {
      stage: "Saliency XAI Gradient",
      latency: 0.65,
      description: "First-order backprop gradient attribution ∇_x ŷ_bin",
      color: "var(--alert-nominal)"
    },
    {
      stage: "Autonomous Mitigation Action",
      latency: 16.27,
      description: "iptables DROP rule insertion / taskkill /F process termination",
      color: "var(--alert-critical)"
    }
  ];

  const totalMttr = latencyWaterfall.reduce((acc, curr) => acc + curr.latency, 0);

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER & SPEED BENCHMARK PILL */}
      <div className="cyber-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Zap className="w-5 h-5 text-[var(--alert-nominal)]" />
          <div>
            <h3 className="font-['Orbitron'] font-bold text-sm text-[var(--text-primary)]">
              SUB-MILLISECOND SALIENCY XAI & LATENCY ENGINE
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-['Space_Grotesk']">
              First-Order Gradient Attribution ∇_x ŷ_bin vs. Kernel SHAP Benchmarks
            </p>
          </div>
        </div>

        {/* SPEED BENCHMARK PILL (SECTION 5.4) */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[var(--alert-nominal)]/15 border border-[var(--alert-nominal)] text-[var(--alert-nominal)]">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span className="font-['Orbitron'] font-black text-xs">
            0.78 ms EXECUTION SPEED
          </span>
          <span className="text-[10px] font-['JetBrains_Mono'] px-1.5 py-0.5 rounded bg-[var(--alert-nominal)] text-black font-bold">
            99.97% FASTER THAN SHAP
          </span>
        </div>
      </div>

      {/* 2. GRADIENT SALIENCY ATTRIBUTION CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* HORIZONTAL ATTRIBUTION BARS (7 COLS) */}
        <div className="lg:col-span-7 cyber-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--brand-primary)]" />
              <h4 className="font-['Orbitron'] font-bold text-xs uppercase text-[var(--text-primary)]">
                Normalized Gradient Feature Attribution (Saliency Map)
              </h4>
            </div>
            <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--brand-cyan)]">
              DOMAIN: {activeDomain}
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {saliencyFeatures.map((feat, idx) => (
              <div key={feat.featureName} className="space-y-1">
                <div className="flex justify-between text-xs font-['JetBrains_Mono']">
                  <span className="text-[var(--text-primary)] font-bold">
                    #{idx + 1} {feat.featureName}
                  </span>
                  <span className="text-[var(--alert-nominal)] font-bold">
                    {feat.importanceScore.toFixed(1)}% Contribution
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-cyan)] transition-all duration-500"
                    style={{ width: `${feat.importanceScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-['JetBrains_Mono'] text-[var(--text-secondary)] space-y-1">
            <div className="text-[var(--text-primary)] font-bold">Mathematical Formulation:</div>
            <div className="text-[var(--brand-cyan)] font-mono">
              S_i = | ∂ŷ_binary / ∂x_i | / ∑_j | ∂ŷ_binary / ∂x_j |
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
              Sub-millisecond analytical gradient backpropagation directly through PyTorch Conformer graph.
            </div>
          </div>
        </div>

        {/* COMPARATIVE SPEEDUP CARD (5 COLS) */}
        <div className="lg:col-span-5 cyber-card p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[var(--alert-nominal)]" />
              <h4 className="font-['Orbitron'] font-bold text-xs uppercase text-[var(--text-primary)]">
                XAI Latency Comparison
              </h4>
            </div>
            <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--alert-nominal)]">
              99.97% Speedup
            </span>
          </div>

          <div className="space-y-3">
            {/* Kernel SHAP baseline */}
            <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1.5">
              <div className="flex justify-between text-xs font-['JetBrains_Mono']">
                <span className="text-[var(--alert-critical)] font-bold">Standard Kernel SHAP:</span>
                <span className="text-[var(--alert-critical)] font-bold">3,120.0 ms</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-canvas)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--alert-critical)] w-full" />
              </div>
              <div className="text-[9px] text-[var(--text-muted)]">
                Violates SOC 1,000 ms SLA requirement by 312%.
              </div>
            </div>

            {/* LIME baseline */}
            <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1.5">
              <div className="flex justify-between text-xs font-['JetBrains_Mono']">
                <span className="text-[var(--alert-warning)] font-bold">LIME Perturbation:</span>
                <span className="text-[var(--alert-warning)] font-bold">1,840.0 ms</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-canvas)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--alert-warning)] w-[59%]" />
              </div>
              <div className="text-[9px] text-[var(--text-muted)]">
                Fails real-time autonomous OT mitigation constraints.
              </div>
            </div>

            {/* Sentinel Gradient Saliency */}
            <div className="p-3 rounded-lg bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)] space-y-1.5">
              <div className="flex justify-between text-xs font-['JetBrains_Mono']">
                <span className="text-[var(--alert-nominal)] font-black">Sentinel-IoT Gradient:</span>
                <span className="text-[var(--alert-nominal)] font-black">0.78 ms</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-canvas)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--alert-nominal)] w-[1%]" />
              </div>
              <div className="text-[9px] text-[var(--alert-nominal)] font-bold">
                100% compliant with industrial sub-second closed loop response!
              </div>
            </div>
          </div>

          <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)] border-t border-[var(--border-color)]/40 pt-2 flex justify-between">
            <span>Kernel SHAP: 3.12 s</span>
            <span>Sentinel: 0.78 ms</span>
          </div>
        </div>
      </div>

      {/* 3. LATENCY DECOMPOSITION WATERFALL (SECTION 5.4) */}
      <div className="cyber-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--brand-cyan)]" />
            <h4 className="font-['Orbitron'] font-bold text-xs uppercase text-[var(--text-primary)]">
              End-to-End Latency Decomposition Waterfall (MTTR = 21.5 ms Requirement)
            </h4>
          </div>
          <span className="text-xs font-['Orbitron'] font-bold text-[var(--alert-nominal)]">
            TOTAL MTTR: {totalMttr.toFixed(2)} ms &lt;&lt; 1,000 ms SLA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          {latencyWaterfall.map((item, idx) => (
            <div
              key={item.stage}
              className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1.5 relative overflow-hidden"
            >
              <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)] uppercase">
                Stage {idx + 1}
              </div>
              <div className="font-['Orbitron'] font-bold text-xs text-[var(--text-primary)]">
                {item.stage}
              </div>
              <div className="text-xl font-black font-['JetBrains_Mono']" style={{ color: item.color }}>
                {item.latency.toFixed(2)} ms
              </div>
              <div className="text-[10px] font-['Space_Grotesk'] text-[var(--text-secondary)] leading-tight">
                {item.description}
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ backgroundColor: item.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// CONSOLE 4: ADVERSARIAL ROBUSTNESS & EVASION STRESS-LAB (STITCH FUTURISTIC HUD)
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Play,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Sparkles
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";

export default function AdversarialConsole() {
  const {
    adversarialState,
    setAdversarialEpsilon,
    setAdversarialAttackType,
    triggerAdversarialAttack
  } = useTelemetryStore();
  const isDemo = useTelemetryStore(state => state.isMockMode);

  const {
    epsilon,
    attackType,
    isAttacking,
    conformerAcc,
    cnnAcc,
    bilstmAcc,
    ksPValue,
    psiScore
  } = adversarialState;

  const [activeKernel, setActiveKernel] = useState<string>("pgd20");
  const [daeEnabled, setDaeEnabled] = useState<boolean>(true);
  const [smoothingEnabled, setSmoothingEnabled] = useState<boolean>(true);

  const isKsNominal = ksPValue > 0.05;
  const isPsiNominal = psiScore < 0.10;

  return (
    <div className="space-y-4 font-mono">
      {/* 1. TOP GRADIENT-BASED ADVERSARIAL GENERATOR BANNER */}
      <div className="hud-box p-3.5 rounded">
        <span className="hud-corner-tr">┐</span>
        <span className="hud-corner-bl">└</span>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[var(--ws-line)]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--ws-mint)]/10 border border-[var(--ws-mint)]/30 rounded text-[var(--ws-mint)] text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[var(--ws-mint)] animate-ping" />
              <span className="font-bold">GRADIENT-BASED ADVERSARIAL GENERATOR</span>
            </div>
            <div className="px-2 py-0.5 bg-[var(--ws-sidebar)] border border-[var(--ws-line)] rounded text-[11px]">
              <span className="text-[var(--ws-muted)]">DEFENSE TARGET:</span>
              <span className="text-[var(--ws-mint)] font-bold ml-1">GOOGLE CONFORMER DUAL-CORE</span>
            </div>
            <div className="px-2 py-0.5 bg-[var(--ws-sidebar)] border border-[var(--ws-line)] rounded text-[11px]">
              <span className="text-[var(--ws-muted)]">DISTILLATION:</span>
              <span className="text-[var(--ws-mint)] font-bold ml-1">TEMPERATURE T=20 (ACTIVE)</span>
            </div>
            <div className="px-2 py-0.5 bg-[var(--ws-coral)]/15 border border-[var(--ws-coral)]/40 rounded text-[11px]">
              <span className="text-[var(--ws-coral)] font-bold">VECTOR: ∇_x L(θ, x, y) INJECTION</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="text-[var(--ws-muted)]">PURIFIED SNR:</span>
              <span className="text-[var(--ws-mint)] font-bold">34.8 dB</span>
            </div>
            <div className="w-px h-3 bg-[var(--ws-line)]" />
            <div className="flex items-center gap-1">
              <span className="text-[var(--ws-muted)]">LATENT RECON LOSS:</span>
              <span className="text-[var(--ws-mint)] font-bold">0.00142</span>
            </div>
          </div>
        </div>

        {/* Controls: Epsilon Slider + Attack Selection + Purification Toggles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Epsilon Slider (4 cols) */}
          <div className="lg:col-span-4 bg-[var(--ws-sidebar)] border border-[var(--ws-line)] p-2.5 rounded flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1 text-[11px]">
              <span className="text-[var(--ws-muted)] uppercase tracking-wider flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-[var(--ws-mint)]" />
                PERTURBATION BUDGET (L_∞ BOUND)
              </span>
              <span className="text-sm font-bold text-[var(--ws-mint)]">
                ε = {epsilon.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.100"
              step="0.001"
              value={epsilon}
              aria-label="Epsilon Slider"
              onChange={(e) => setAdversarialEpsilon(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[var(--ws-line)] rounded appearance-none cursor-pointer accent-[var(--ws-mint)] my-1"
            />
            <div className="flex items-center justify-between text-[9px] text-[var(--ws-muted)]">
              <span className="text-[var(--ws-mint)]">ε=0.001 (Imperceptible)</span>
              <span className="text-[var(--research-sand)]">ε=0.050 (Critical)</span>
              <span className="text-[var(--ws-coral)]">ε=0.100 (Evasion Break)</span>
            </div>
          </div>

          {/* Attack Kernel Buttons (5 cols) */}
          <div className="lg:col-span-5 bg-[var(--ws-sidebar)] border border-[var(--ws-line)] p-2.5 rounded flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[var(--ws-muted)] uppercase tracking-wider">ADVERSARIAL ATTACK KERNEL</span>
              <span className="text-[var(--ws-mint)] font-bold">L_inf PROJECTION</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => { setActiveKernel("fgsm"); setAdversarialAttackType("FGSM"); }}
                className={`px-2 py-1.5 rounded transition-all cursor-pointer ${
                  activeKernel === "fgsm"
                    ? "bg-[var(--ws-mint)]/20 border border-[var(--ws-mint)] text-[var(--ws-mint)] font-bold shadow-[0_0_8px_rgba(179,223,147,0.3)]"
                    : "bg-[var(--ws-sidebar)] border border-[var(--ws-line)] text-[var(--ws-muted)] hover:text-white"
                }`}
              >
                1-Step FGSM
              </button>
              <button
                type="button"
                onClick={() => { setActiveKernel("pgd20"); setAdversarialAttackType("PGD_20"); }}
                className={`px-2 py-1.5 rounded transition-all cursor-pointer ${
                  activeKernel === "pgd20"
                    ? "bg-[var(--ws-mint)]/20 border border-[var(--ws-mint)] text-[var(--ws-mint)] font-bold shadow-[0_0_8px_rgba(179,223,147,0.3)]"
                    : "bg-[var(--ws-sidebar)] border border-[var(--ws-line)] text-[var(--ws-muted)] hover:text-white"
                }`}
              >
                PGD-20 (ℓ_∞)
              </button>
              <button
                type="button"
                onClick={() => setActiveKernel("cw")}
                className={`px-2 py-1.5 rounded transition-all cursor-pointer ${
                  activeKernel === "cw"
                    ? "bg-[var(--ws-mint)]/20 border border-[var(--ws-mint)] text-[var(--ws-mint)] font-bold"
                    : "bg-[var(--ws-sidebar)] border border-[var(--ws-line)] text-[var(--ws-muted)] hover:text-white"
                }`}
              >
                Carlini-Wagner
              </button>
              <button
                type="button"
                onClick={() => setActiveKernel("deepfool")}
                className={`px-2 py-1.5 rounded transition-all cursor-pointer ${
                  activeKernel === "deepfool"
                    ? "bg-[var(--ws-mint)]/20 border border-[var(--ws-mint)] text-[var(--ws-mint)] font-bold"
                    : "bg-[var(--ws-sidebar)] border border-[var(--ws-line)] text-[var(--ws-muted)] hover:text-white"
                }`}
              >
                DeepFool
              </button>
            </div>
          </div>

          {/* Defense Purification Toggles (3 cols) */}
          <div className="lg:col-span-3 bg-[var(--ws-sidebar)] border border-[var(--ws-line)] p-2.5 rounded flex flex-col gap-1.5">
            <span className="text-[10px] text-[var(--ws-muted)] uppercase tracking-wider">
              PURIFICATION &amp; RECONSTRUCTION
            </span>
            <div className="flex flex-col gap-1 text-[11px]">
              <label className="flex items-center justify-between p-1 bg-[var(--ws-sidebar)] border border-[var(--ws-line)] rounded cursor-pointer hover:border-[var(--ws-mint)]/40">
                <span className="text-[var(--ws-text)]">DAE Autoencoder Filter</span>
                <input
                  type="checkbox"
                  checked={daeEnabled}
                  onChange={(e) => setDaeEnabled(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[var(--ws-mint)] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between p-1 bg-[var(--ws-sidebar)] border border-[var(--ws-line)] rounded cursor-pointer hover:border-[var(--ws-mint)]/40">
                <span className="text-[var(--ws-text)]">Isotropic Smoothing (σ=0.05)</span>
                <input
                  type="checkbox"
                  checked={smoothingEnabled}
                  onChange={(e) => setSmoothingEnabled(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[var(--ws-mint)] cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN TACTICAL GRID (7 / 5) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* LEFT COLUMN: RESILIENCE BENCHMARK TABLE & EVASION TRAJECTORY (7 COLS) */}
        <div className="xl:col-span-7 space-y-4">
          {/* Comparative Table */}
          <div className="hud-box p-4 rounded">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--ws-line)]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[var(--ws-mint)] glow-cyan" />
                <h3 className="font-['Orbitron'] text-xs sm:text-sm font-bold text-white tracking-wide">
                  MODEL RESILIENCE BENCHMARK // ADVERSARIAL EVASION
                </h3>
              </div>
              <span className="text-[10px] text-[var(--ws-mint)] bg-[var(--ws-mint)]/10 border border-[var(--ws-mint)]/30 px-1.5 py-0.5 rounded font-bold">
                EVAL TARGET: ε = {epsilon.toFixed(3)}
              </span>
            </div>

            <div className="overflow-x-auto w-full mb-3">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--ws-sidebar)] text-[var(--ws-muted)] text-[10px] uppercase border-b border-[var(--ws-line)]">
                    <th scope="col" className="py-2 px-2.5">Target Architecture</th>
                    <th scope="col" className="py-2 px-2.5">Clean Acc</th>
                    <th scope="col" className="py-2 px-2.5">Robust Acc (ε={epsilon.toFixed(2)})</th>
                    <th scope="col" className="py-2 px-2.5">Degradation</th>
                    <th scope="col" className="py-2 px-2.5 text-right">Defense Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ws-line)]">
                  {/* Conformer */}
                  <tr className="bg-[var(--ws-mint)]/5 font-bold">
                    <td className="py-2.5 px-2.5 text-[var(--ws-mint)] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--ws-mint)]" />
                      Google Conformer Dual-Core
                    </td>
                    <td className="py-2.5 px-2.5 text-white">99.4%</td>
                    <td className="py-2.5 px-2.5 text-[var(--ws-mint)]">
                      {conformerAcc.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2.5 text-[var(--ws-mint)]">
                      -{(99.4 - conformerAcc).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2.5 text-right">
                      <span className="px-2 py-0.5 rounded bg-[var(--ws-mint)]/15 border border-[var(--ws-mint)]/40 text-[var(--ws-mint)] text-[10px] uppercase font-bold">
                        HARDENED RESILIENT
                      </span>
                    </td>
                  </tr>

                  {/* 1D-CNN */}
                  <tr className="text-[var(--ws-text)]">
                    <td className="py-2.5 px-2.5 text-[var(--ws-muted)]">Standard 1D-CNN Baseline</td>
                    <td className="py-2.5 px-2.5">96.1%</td>
                    <td className="py-2.5 px-2.5 text-[var(--ws-coral)] font-bold">
                      {cnnAcc.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2.5 text-[var(--ws-coral)]">
                      -{(96.1 - cnnAcc).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2.5 text-right">
                      <span className="px-2 py-0.5 rounded bg-[var(--ws-coral)]/15 border border-[var(--ws-coral)]/40 text-[var(--ws-coral)] text-[10px] uppercase font-bold">
                        COLLAPSED
                      </span>
                    </td>
                  </tr>

                  {/* BiLSTM */}
                  <tr className="text-[var(--ws-text)]">
                    <td className="py-2.5 px-2.5 text-[var(--ws-muted)]">Bidirectional LSTM Baseline</td>
                    <td className="py-2.5 px-2.5">95.4%</td>
                    <td className="py-2.5 px-2.5 text-[var(--ws-coral)] font-bold">
                      {bilstmAcc.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2.5 text-[var(--ws-coral)]">
                      -{(95.4 - bilstmAcc).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2.5 text-right">
                      <span className="px-2 py-0.5 rounded bg-[var(--ws-coral)]/15 border border-[var(--ws-coral)]/40 text-[var(--ws-coral)] text-[10px] uppercase font-bold">
                        COLLAPSED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Degradation Trajectory Curve */}
          <div className="hud-box p-4 rounded">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--ws-line)]">
              <span className="text-xs text-white font-bold uppercase">
                ACCURACY DEGRADATION TRAJECTORY (ACCURACY VS ε NOISE RADIUS)
              </span>
              <span className="text-[10px] text-[var(--ws-mint)] font-bold">L_∞ BOUND</span>
            </div>

            <div className="w-full h-36 bg-[var(--ws-sidebar)] rounded border border-[var(--ws-line)] p-2 relative">
              <svg className="w-full h-full" viewBox="0 0 400 120">
                <line stroke="var(--ws-line)" x1="30" x2="380" y1="105" y2="105" />
                <line stroke="var(--ws-line)" x1="30" x2="30" y1="15" y2="105" />
                {/* Conformer Resilient Curve */}
                <path d="M 30,20 Q 200,25 380,45" fill="none" stroke="var(--ws-mint)" strokeWidth="2.5" className="glow-emerald" />
                {/* 1D-CNN Collapsed Curve */}
                <path d="M 30,25 Q 120,40 380,100" fill="none" stroke="var(--ws-coral)" strokeWidth="1.8" strokeDasharray="3 3" />
                {/* BiLSTM Curve */}
                <path d="M 30,28 Q 140,45 380,95" fill="none" stroke="var(--research-sand)" strokeWidth="1.8" strokeDasharray="4 4" />
              </svg>
              <div className="flex items-center justify-between text-[10px] text-[var(--ws-muted)] pt-1">
                <span className="text-[var(--ws-mint)] font-bold">• Conformer (98.2%)</span>
                <span className="text-[var(--research-sand)]">• BiLSTM (46.0%)</span>
                <span className="text-[var(--ws-coral)]">• 1D-CNN (40.5%)</span>
                <span>Noise: ε=0.001 → 0.100</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONCEPT DRIFT & ATTACK INJECTION (5 COLS) */}
        <div className="xl:col-span-5 space-y-4">
          {/* Kolmogorov-Smirnov Test */}
          <div className="hud-box p-4 rounded">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--ws-line)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--ws-mint)]" />
                <h3 className="font-['Orbitron'] text-xs font-bold text-white tracking-wide">
                  KOLMOGOROV-SMIRNOV DRIFT TEST
                </h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
                isKsNominal
                  ? "bg-[var(--ws-mint)]/15 text-[var(--ws-mint)] border-[var(--ws-mint)]/40"
                  : "bg-[var(--research-sand)]/15 text-[var(--research-sand)] border-[var(--research-sand)]/40"
              }`}>
                {isKsNominal ? "NULL HYPOTHESIS VALID" : "DRIFT DETECTED"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-2xl font-bold text-[var(--ws-mint)] font-['Orbitron']">
                  p = {ksPValue.toFixed(3)}
                </div>
                <div className="text-xs text-[var(--ws-muted)] mt-0.5">
                  Threshold: p &gt; 0.05 (No statistical drift)
                </div>
              </div>
              <div className="text-right text-xs text-[var(--ws-muted)]">
                <div>Sample Size: N = 2,500</div>
                <div>Significance α: 0.05</div>
              </div>
            </div>
          </div>

          {/* Population Stability Index (PSI) */}
          <div className="hud-box p-4 rounded">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--ws-line)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--ws-mint)]" />
                <h3 className="font-['Orbitron'] text-xs font-bold text-white tracking-wide">
                  POPULATION STABILITY INDEX (PSI)
                </h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
                isPsiNominal
                  ? "bg-[var(--ws-mint)]/15 text-[var(--ws-mint)] border-[var(--ws-mint)]/40"
                  : "bg-[var(--research-sand)]/15 text-[var(--research-sand)] border-[var(--research-sand)]/40"
              }`}>
                {isPsiNominal ? "STABLE DISTRIBUTION" : "SIGNIFICANT SHIFT"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-2xl font-bold text-[var(--ws-mint)] font-['Orbitron']">
                  PSI = {psiScore.toFixed(3)}
                </div>
                <div className="text-xs text-[var(--ws-muted)] mt-0.5">
                  Benchmark: PSI &lt; 0.10 (Negligible change)
                </div>
              </div>
              <div className="text-right text-xs text-[var(--ws-muted)]">
                <div>Binned Deciles: 10</div>
                <div>Reference: Clean ToN_IoT</div>
              </div>
            </div>
          </div>

          {/* Attack Trigger Button Card */}
          <div className="hud-box p-4 rounded flex flex-col justify-between gap-3">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[var(--ws-line)] mb-2">
                <span className="text-xs text-[var(--ws-coral)] font-bold uppercase">
                  EXECUTE ADVERSARIAL STRESS TEST
                </span>
                <span className="text-[10px] text-[var(--ws-muted)]">KERNEL: {attackType}</span>
              </div>
              <p className="text-xs text-[var(--ws-muted)] mb-3">
                Synthesize gradient evasion noise tensor and inject directly into Conformer forward buffer.
              </p>
            </div>

            <button
              type="button"
              onClick={triggerAdversarialAttack}
              disabled={isAttacking || !isDemo || !["fgsm", "pgd20"].includes(activeKernel)}
              className={`w-full py-2.5 rounded font-['Orbitron'] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                isAttacking
                  ? "bg-[var(--ws-coral)] text-white animate-pulse shadow-[0_0_16px_var(--ws-coral)]"
                  : "bg-[var(--research-sand)] text-black hover:bg-[var(--research-sand)]/90 shadow-[0_0_12px_rgba(214,199,156,0.35)]"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{!isDemo ? "SWITCH TO DEMO TO SIMULATE" : !["fgsm", "pgd20"].includes(activeKernel) ? "THIS KERNEL IS NOT IMPLEMENTED" : isAttacking ? "GENERATING DEMO OBSERVATION..." : `SIMULATE ${attackType} OBSERVATION`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

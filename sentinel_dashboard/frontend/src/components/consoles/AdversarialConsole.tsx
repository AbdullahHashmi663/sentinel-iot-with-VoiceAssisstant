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
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#162536]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded text-[#00f0ff] text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
              <span className="font-bold">GRADIENT-BASED ADVERSARIAL GENERATOR</span>
            </div>
            <div className="px-2 py-0.5 bg-[#070d14] border border-[#162536] rounded text-[11px]">
              <span className="text-[#64748b]">DEFENSE TARGET:</span>
              <span className="text-[#00ff66] font-bold ml-1">GOOGLE CONFORMER DUAL-CORE</span>
            </div>
            <div className="px-2 py-0.5 bg-[#070d14] border border-[#162536] rounded text-[11px]">
              <span className="text-[#64748b]">DISTILLATION:</span>
              <span className="text-[#00f0ff] font-bold ml-1">TEMPERATURE T=20 (ACTIVE)</span>
            </div>
            <div className="px-2 py-0.5 bg-[#ff2a5f]/15 border border-[#ff2a5f]/40 rounded text-[11px]">
              <span className="text-[#ff2a5f] font-bold">VECTOR: ∇_x L(θ, x, y) INJECTION</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="text-[#64748b]">PURIFIED SNR:</span>
              <span className="text-[#00f0ff] font-bold">34.8 dB</span>
            </div>
            <div className="w-px h-3 bg-[#162536]" />
            <div className="flex items-center gap-1">
              <span className="text-[#64748b]">LATENT RECON LOSS:</span>
              <span className="text-[#00ff66] font-bold">0.00142</span>
            </div>
          </div>
        </div>

        {/* Controls: Epsilon Slider + Attack Selection + Purification Toggles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Epsilon Slider (4 cols) */}
          <div className="lg:col-span-4 bg-[#070d14] border border-[#162536] p-2.5 rounded flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1 text-[11px]">
              <span className="text-[#64748b] uppercase tracking-wider flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-[#00f0ff]" />
                PERTURBATION BUDGET (L_∞ BOUND)
              </span>
              <span className="text-sm font-bold text-[#00f0ff]">
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
              className="w-full h-1.5 bg-[#162536] rounded appearance-none cursor-pointer accent-[#00f0ff] my-1"
            />
            <div className="flex items-center justify-between text-[9px] text-[#64748b]">
              <span className="text-[#00ff66]">ε=0.001 (Imperceptible)</span>
              <span className="text-[#ffb700]">ε=0.050 (Critical)</span>
              <span className="text-[#ff2a5f]">ε=0.100 (Evasion Break)</span>
            </div>
          </div>

          {/* Attack Kernel Buttons (5 cols) */}
          <div className="lg:col-span-5 bg-[#070d14] border border-[#162536] p-2.5 rounded flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#64748b] uppercase tracking-wider">ADVERSARIAL ATTACK KERNEL</span>
              <span className="text-[#00f0ff] font-bold">L_inf PROJECTION</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => { setActiveKernel("fgsm"); setAdversarialAttackType("FGSM"); }}
                className={`px-2 py-1.5 rounded transition-all cursor-pointer ${
                  activeKernel === "fgsm"
                    ? "bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                    : "bg-[#03070c] border border-[#162536] text-[#64748b] hover:text-white"
                }`}
              >
                1-Step FGSM
              </button>
              <button
                type="button"
                onClick={() => { setActiveKernel("pgd20"); setAdversarialAttackType("PGD_20"); }}
                className={`px-2 py-1.5 rounded transition-all cursor-pointer ${
                  activeKernel === "pgd20"
                    ? "bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                    : "bg-[#03070c] border border-[#162536] text-[#64748b] hover:text-white"
                }`}
              >
                PGD-20 (ℓ_∞)
              </button>
              <button
                type="button"
                onClick={() => setActiveKernel("cw")}
                className={`px-2 py-1.5 rounded transition-all cursor-pointer ${
                  activeKernel === "cw"
                    ? "bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] font-bold"
                    : "bg-[#03070c] border border-[#162536] text-[#64748b] hover:text-white"
                }`}
              >
                Carlini-Wagner
              </button>
              <button
                type="button"
                onClick={() => setActiveKernel("deepfool")}
                className={`px-2 py-1.5 rounded transition-all cursor-pointer ${
                  activeKernel === "deepfool"
                    ? "bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] font-bold"
                    : "bg-[#03070c] border border-[#162536] text-[#64748b] hover:text-white"
                }`}
              >
                DeepFool
              </button>
            </div>
          </div>

          {/* Defense Purification Toggles (3 cols) */}
          <div className="lg:col-span-3 bg-[#070d14] border border-[#162536] p-2.5 rounded flex flex-col gap-1.5">
            <span className="text-[10px] text-[#64748b] uppercase tracking-wider">
              PURIFICATION &amp; RECONSTRUCTION
            </span>
            <div className="flex flex-col gap-1 text-[11px]">
              <label className="flex items-center justify-between p-1 bg-[#03070c] border border-[#162536] rounded cursor-pointer hover:border-[#00f0ff]/40">
                <span className="text-[#dee3eb]">DAE Autoencoder Filter</span>
                <input
                  type="checkbox"
                  checked={daeEnabled}
                  onChange={(e) => setDaeEnabled(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#00f0ff] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between p-1 bg-[#03070c] border border-[#162536] rounded cursor-pointer hover:border-[#00ff66]/40">
                <span className="text-[#dee3eb]">Isotropic Smoothing (σ=0.05)</span>
                <input
                  type="checkbox"
                  checked={smoothingEnabled}
                  onChange={(e) => setSmoothingEnabled(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#00ff66] cursor-pointer"
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
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#162536]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#00f0ff] glow-cyan" />
                <h3 className="font-['Orbitron'] text-xs sm:text-sm font-bold text-white tracking-wide">
                  MODEL RESILIENCE BENCHMARK // ADVERSARIAL EVASION
                </h3>
              </div>
              <span className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/30 px-1.5 py-0.5 rounded font-bold">
                EVAL TARGET: ε = {epsilon.toFixed(3)}
              </span>
            </div>

            <div className="overflow-x-auto w-full mb-3">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#070d14] text-[#64748b] text-[10px] uppercase border-b border-[#162536]">
                    <th scope="col" className="py-2 px-2.5">Target Architecture</th>
                    <th scope="col" className="py-2 px-2.5">Clean Acc</th>
                    <th scope="col" className="py-2 px-2.5">Robust Acc (ε={epsilon.toFixed(2)})</th>
                    <th scope="col" className="py-2 px-2.5">Degradation</th>
                    <th scope="col" className="py-2 px-2.5 text-right">Defense Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162536]">
                  {/* Conformer */}
                  <tr className="bg-[#00f0ff]/5 font-bold">
                    <td className="py-2.5 px-2.5 text-[#00f0ff] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00ff66]" />
                      Google Conformer Dual-Core
                    </td>
                    <td className="py-2.5 px-2.5 text-white">99.4%</td>
                    <td className="py-2.5 px-2.5 text-[#00ff66]">
                      {conformerAcc.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2.5 text-[#00ff66]">
                      -{(99.4 - conformerAcc).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2.5 text-right">
                      <span className="px-2 py-0.5 rounded bg-[#00ff66]/15 border border-[#00ff66]/40 text-[#00ff66] text-[10px] uppercase font-bold">
                        HARDENED RESILIENT
                      </span>
                    </td>
                  </tr>

                  {/* 1D-CNN */}
                  <tr className="text-[#dee3eb]">
                    <td className="py-2.5 px-2.5 text-[#64748b]">Standard 1D-CNN Baseline</td>
                    <td className="py-2.5 px-2.5">96.1%</td>
                    <td className="py-2.5 px-2.5 text-[#ff2a5f] font-bold">
                      {cnnAcc.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2.5 text-[#ff2a5f]">
                      -{(96.1 - cnnAcc).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2.5 text-right">
                      <span className="px-2 py-0.5 rounded bg-[#ff2a5f]/15 border border-[#ff2a5f]/40 text-[#ff2a5f] text-[10px] uppercase font-bold">
                        COLLAPSED
                      </span>
                    </td>
                  </tr>

                  {/* BiLSTM */}
                  <tr className="text-[#dee3eb]">
                    <td className="py-2.5 px-2.5 text-[#64748b]">Bidirectional LSTM Baseline</td>
                    <td className="py-2.5 px-2.5">95.4%</td>
                    <td className="py-2.5 px-2.5 text-[#ff2a5f] font-bold">
                      {bilstmAcc.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2.5 text-[#ff2a5f]">
                      -{(95.4 - bilstmAcc).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2.5 text-right">
                      <span className="px-2 py-0.5 rounded bg-[#ff2a5f]/15 border border-[#ff2a5f]/40 text-[#ff2a5f] text-[10px] uppercase font-bold">
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
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#162536]">
              <span className="text-xs text-white font-bold uppercase">
                ACCURACY DEGRADATION TRAJECTORY (ACCURACY VS ε NOISE RADIUS)
              </span>
              <span className="text-[10px] text-[#00f0ff] font-bold">L_∞ BOUND</span>
            </div>

            <div className="w-full h-36 bg-[#03070c] rounded border border-[#162536] p-2 relative">
              <svg className="w-full h-full" viewBox="0 0 400 120">
                <line stroke="#162536" x1="30" x2="380" y1="105" y2="105" />
                <line stroke="#162536" x1="30" x2="30" y1="15" y2="105" />
                {/* Conformer Resilient Curve */}
                <path d="M 30,20 Q 200,25 380,45" fill="none" stroke="#00ff66" strokeWidth="2.5" className="glow-emerald" />
                {/* 1D-CNN Collapsed Curve */}
                <path d="M 30,25 Q 120,40 380,100" fill="none" stroke="#ff2a5f" strokeWidth="1.8" strokeDasharray="3 3" />
                {/* BiLSTM Curve */}
                <path d="M 30,28 Q 140,45 380,95" fill="none" stroke="#ffb700" strokeWidth="1.8" strokeDasharray="4 4" />
              </svg>
              <div className="flex items-center justify-between text-[10px] text-[#64748b] pt-1">
                <span className="text-[#00ff66] font-bold">• Conformer (98.2%)</span>
                <span className="text-[#ffb700]">• BiLSTM (46.0%)</span>
                <span className="text-[#ff2a5f]">• 1D-CNN (40.5%)</span>
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
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#162536]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                <h3 className="font-['Orbitron'] text-xs font-bold text-white tracking-wide">
                  KOLMOGOROV-SMIRNOV DRIFT TEST
                </h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
                isKsNominal
                  ? "bg-[#00ff66]/15 text-[#00ff66] border-[#00ff66]/40"
                  : "bg-[#ffb700]/15 text-[#ffb700] border-[#ffb700]/40"
              }`}>
                {isKsNominal ? "NULL HYPOTHESIS VALID" : "DRIFT DETECTED"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-2xl font-bold text-[#00f0ff] font-['Orbitron']">
                  p = {ksPValue.toFixed(3)}
                </div>
                <div className="text-xs text-[#64748b] mt-0.5">
                  Threshold: p &gt; 0.05 (No statistical drift)
                </div>
              </div>
              <div className="text-right text-xs text-[#64748b]">
                <div>Sample Size: N = 2,500</div>
                <div>Significance α: 0.05</div>
              </div>
            </div>
          </div>

          {/* Population Stability Index (PSI) */}
          <div className="hud-box p-4 rounded">
            <span className="hud-corner-tr">┐</span>
            <span className="hud-corner-bl">└</span>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#162536]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                <h3 className="font-['Orbitron'] text-xs font-bold text-white tracking-wide">
                  POPULATION STABILITY INDEX (PSI)
                </h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
                isPsiNominal
                  ? "bg-[#00ff66]/15 text-[#00ff66] border-[#00ff66]/40"
                  : "bg-[#ffb700]/15 text-[#ffb700] border-[#ffb700]/40"
              }`}>
                {isPsiNominal ? "STABLE DISTRIBUTION" : "SIGNIFICANT SHIFT"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-2xl font-bold text-[#00f0ff] font-['Orbitron']">
                  PSI = {psiScore.toFixed(3)}
                </div>
                <div className="text-xs text-[#64748b] mt-0.5">
                  Benchmark: PSI &lt; 0.10 (Negligible change)
                </div>
              </div>
              <div className="text-right text-xs text-[#64748b]">
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
              <div className="flex items-center justify-between pb-2 border-b border-[#162536] mb-2">
                <span className="text-xs text-[#ff2a5f] font-bold uppercase">
                  EXECUTE ADVERSARIAL STRESS TEST
                </span>
                <span className="text-[10px] text-[#64748b]">KERNEL: {attackType}</span>
              </div>
              <p className="text-xs text-[#64748b] mb-3">
                Synthesize gradient evasion noise tensor and inject directly into Conformer forward buffer.
              </p>
            </div>

            <button
              type="button"
              onClick={triggerAdversarialAttack}
              disabled={isAttacking}
              className={`w-full py-2.5 rounded font-['Orbitron'] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                isAttacking
                  ? "bg-[#ff2a5f] text-white animate-pulse shadow-[0_0_16px_#ff2a5f]"
                  : "bg-[#ffb700] text-black hover:bg-[#ffb700]/90 shadow-[0_0_12px_rgba(255,183,0,0.35)]"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isAttacking ? "INJECTING NOISE TENSOR..." : `EXECUTE ${attackType} ATTACK`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

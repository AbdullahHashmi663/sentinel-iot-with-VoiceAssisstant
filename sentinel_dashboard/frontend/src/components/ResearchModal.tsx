"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  BarChart,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  Sparkles
} from "lucide-react";

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESEARCH_TABS = [
  { id: "overview", label: "Architecture (Fig 1 & 2)", desc: "Dual-head Conformer & XDR dataflow" },
  { id: "confusion", label: "Confusion Matrices (Fig 3)", desc: "13-domain cross-layer forensic attribution" },
  { id: "baselines", label: "Baseline Comparison (Fig 5)", desc: "Conformer vs GRU vs LSTM vs 1D-CNN" },
  { id: "xai_latency", label: "XAI & MTTR Latency (Fig 8 & 9)", desc: "0.78 ms Saliency vs 3,120 ms SHAP" },
  { id: "grc", label: "GRC Compliance (Fig 10)", desc: "NIST SP 800-53 & ISO 27001 mappings" },
  { id: "significance", label: "Statistical Tests (Fig 11)", desc: "Wilcoxon & Friedman hypothesis tests" },
];

export default function ResearchModal({ isOpen, onClose }: ResearchModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [zoomedImage, setZoomedImage] = useState<{ src: string; title: string } | null>(null);

  // Keyboard accessibility: ESC key to close modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomedImage) {
          setZoomedImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, zoomedImage]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="research-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="cyber-card w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden border border-[var(--accent-primary)] shadow-[0_0_35px_var(--accent-glow)]">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
            <div>
              <h2 id="research-modal-title" className="font-['Orbitron'] font-black text-base sm:text-lg text-[var(--text-primary)]">
                SENTINEL-IOT: EMPIRICAL BENCHMARKS & RESEARCH GALLERY
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-['Rajdhani'] font-medium">
                Verified across all 13 ToN_IoT datasets | IEEE / Elsevier publication-grade validation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close research gallery modal"
            className="cursor-pointer p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white hover:border-[var(--accent-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div
          role="tablist"
          aria-label="Research Benchmark Categories"
          className="flex items-center gap-1 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-primary)] overflow-x-auto"
        >
          {RESEARCH_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-['Rajdhani'] font-bold uppercase whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
                activeTab === tab.id
                  ? "bg-[var(--accent-primary)] text-black shadow-[0_0_10px_var(--accent-primary)]"
                  : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* MODAL BODY */}
        <div
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          className="p-5 overflow-y-auto space-y-6 flex-1 bg-[var(--bg-primary)]/80"
        >
          
          {/* TAB 1: OVERVIEW & ARCHITECTURE */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-['Orbitron'] font-bold text-xs text-[var(--accent-primary)] flex items-center justify-between">
                    <span>FIG 1: END-TO-END AUTONOMOUS XDR PIPELINE</span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">Click to zoom</span>
                  </h4>
                  <div
                    onClick={() => setZoomedImage({ src: "/paper_figures/fig1_system_architecture.png", title: "Fig 1: End-to-End Autonomous XDR Pipeline" })}
                    className="cursor-zoom-in rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--accent-primary)] bg-black/40 transition-colors"
                  >
                    <img
                      src="/paper_figures/fig1_system_architecture.png"
                      alt="System Framework Architecture"
                      className="w-full object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-['Orbitron'] font-bold text-xs text-[var(--accent-secondary)] flex items-center justify-between">
                    <span>FIG 2: CONFORMER VS BiLSTM COMPARATIVE CORE</span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">Click to zoom</span>
                  </h4>
                  <div
                    onClick={() => setZoomedImage({ src: "/paper_figures/fig2_conformer_vs_bilstm_architecture.png", title: "Fig 2: Conformer vs BiLSTM Comparative Core" })}
                    className="cursor-zoom-in rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--accent-secondary)] bg-black/40 transition-colors"
                  >
                    <img
                      src="/paper_figures/fig2_conformer_vs_bilstm_architecture.png"
                      alt="Conformer vs BiLSTM Architecture"
                      className="w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Research Metrics Callout */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-['JetBrains_Mono'] text-xs">
                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-center">
                  <div className="text-[var(--text-muted)] text-[10px]">NETWORK BINARY ACC</div>
                  <div className="font-['Orbitron'] font-bold text-xl text-[var(--alert-nominal)] mt-1">99.70%</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">F1 = 0.9983</div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-center">
                  <div className="text-[var(--text-muted)] text-[10px]">FORENSIC MULTICLASS ACC</div>
                  <div className="font-['Orbitron'] font-bold text-xl text-[var(--accent-primary)] mt-1">98.37%</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">13-domain average</div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-center">
                  <div className="text-[var(--text-muted)] text-[10px]">SALIENCY XAI LATENCY</div>
                  <div className="font-['Orbitron'] font-bold text-xl text-[var(--accent-tertiary)] mt-1">0.78 ms</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">99.97% vs SHAP</div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-center">
                  <div className="text-[var(--text-muted)] text-[10px]">ACTIVE MITIGATION MTTR</div>
                  <div className="font-['Orbitron'] font-bold text-xl text-[var(--accent-secondary)] mt-1">21.5 ms</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">&lt;&lt; 1,000ms SLA</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONFUSION MATRICES */}
          {activeTab === "confusion" && (
            <div className="space-y-4">
              <h4 className="font-['Orbitron'] font-bold text-xs text-[var(--accent-primary)] flex items-center justify-between">
                <span>FIG 3: MULTI-CLASS FORENSIC CONFUSION MATRICES ACROSS HETEROGENEOUS DOMAINS</span>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">Click to zoom</span>
              </h4>
              <div
                onClick={() => setZoomedImage({ src: "/paper_figures/fig3_confusion_matrices.png", title: "Fig 3: Forensic Multi-Class Confusion Matrices Across Heterogeneous Domains" })}
                className="cursor-zoom-in rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--accent-primary)] bg-black/40 transition-colors"
              >
                <img
                  src="/paper_figures/fig3_confusion_matrices.png"
                  alt="Confusion Matrices"
                  className="w-full object-contain"
                />
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-['Space_Grotesk'] leading-relaxed">
                Demonstrates forensic multi-class precision across 10 network attack classes, 7 physical IoT sensors (GPS, Modbus, Thermostat, Fridge), and 5 host OS telemetry streams (Linux process, Linux disk, Windows 10, Windows 7).
              </p>
            </div>
          )}

          {/* TAB 3: BASELINE COMPARISONS */}
          {activeTab === "baselines" && (
            <div className="space-y-4">
              <h4 className="font-['Orbitron'] font-bold text-xs text-[var(--accent-primary)] flex items-center justify-between">
                <span>FIG 5: CONFORMER-SENTINEL VS GRU, LSTM, AND 1D-CNN BASELINES</span>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">Click to zoom</span>
              </h4>
              <div
                onClick={() => setZoomedImage({ src: "/paper_figures/fig5_baseline_comparison.png", title: "Fig 5: Conformer-Sentinel vs Baselines (GRU, LSTM, 1D-CNN)" })}
                className="cursor-zoom-in rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--accent-primary)] bg-black/40 transition-colors"
              >
                <img
                  src="/paper_figures/fig5_baseline_comparison.png"
                  alt="Baseline Comparison"
                  className="w-full object-contain"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-['JetBrains_Mono'] text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-[10px] uppercase">
                      <th scope="col" className="pb-2">Architecture</th>
                      <th scope="col" className="pb-2">Mean Macro F1 (%)</th>
                      <th scope="col" className="pb-2">Inference Latency</th>
                      <th scope="col" className="pb-2">Temporal Gradient Retention</th>
                      <th scope="col" className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/30">
                    <tr className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold">
                      <td className="py-2">Conformer-Sentinel (Proposed)</td>
                      <td className="py-2">98.37%</td>
                      <td className="py-2">0.78 ms</td>
                      <td className="py-2">Dual Self-Attention + Depthwise Conv</td>
                      <td className="py-2 text-right text-[var(--alert-nominal)]">SUPERIOR</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--text-primary)]">Gated Recurrent Unit (GRU)</td>
                      <td className="py-2 text-[var(--text-secondary)]">93.38%</td>
                      <td className="py-2 text-[var(--text-muted)]">3.40 ms</td>
                      <td className="py-2 text-[var(--text-muted)]">Sequential Recurrent Gates</td>
                      <td className="py-2 text-right text-[var(--text-muted)]">-4.99%</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--text-primary)]">Long Short-Term Memory (LSTM)</td>
                      <td className="py-2 text-[var(--text-secondary)]">92.74%</td>
                      <td className="py-2 text-[var(--text-muted)]">4.12 ms</td>
                      <td className="py-2 text-[var(--text-muted)]">Sequential O(T) Bottleneck</td>
                      <td className="py-2 text-right text-[var(--text-muted)]">-5.63%</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--text-primary)]">1D Convolutional Neural Network</td>
                      <td className="py-2 text-[var(--text-secondary)]">90.18%</td>
                      <td className="py-2 text-[var(--text-muted)]">1.25 ms</td>
                      <td className="py-2 text-[var(--text-muted)]">Local Receptive Field Only</td>
                      <td className="py-2 text-right text-[var(--text-muted)]">-8.19%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: XAI & MTTR LATENCY */}
          {activeTab === "xai_latency" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-['Orbitron'] font-bold text-xs text-[var(--accent-tertiary)] flex items-center justify-between">
                  <span>FIG 8: EXPLAINABILITY LATENCY</span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">Click to zoom</span>
                </h4>
                <div
                  onClick={() => setZoomedImage({ src: "/paper_figures/fig8_explainability_latency_comparison.png", title: "Fig 8: Explainability Latency: Saliency vs SHAP" })}
                  className="cursor-zoom-in rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--accent-tertiary)] bg-black/40 transition-colors"
                >
                  <img
                    src="/paper_figures/fig8_explainability_latency_comparison.png"
                    alt="Explainability Latency Comparison"
                    className="w-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-['Orbitron'] font-bold text-xs text-[var(--alert-nominal)] flex items-center justify-between">
                  <span>FIG 9: END-TO-END MTTR</span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">Click to zoom</span>
                </h4>
                <div
                  onClick={() => setZoomedImage({ src: "/paper_figures/fig9_end_to_end_latency_mttd_mttr.png", title: "Fig 9: End-to-End Latency MTTD & MTTR Decomposition" })}
                  className="cursor-zoom-in rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--alert-nominal)] bg-black/40 transition-colors"
                >
                  <img
                    src="/paper_figures/fig9_end_to_end_latency_mttd_mttr.png"
                    alt="End to End Latency MTTD MTTR"
                    className="w-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GRC COMPLIANCE */}
          {activeTab === "grc" && (
            <div className="space-y-4">
              <h4 className="font-['Orbitron'] font-bold text-xs text-[var(--accent-primary)] flex items-center justify-between">
                <span>FIG 10: REGULATORY GRC COMPLIANCE AUDITING MATRIX</span>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">Click to zoom</span>
              </h4>
              <div
                onClick={() => setZoomedImage({ src: "/paper_figures/fig10_grc_compliance_matrix.png", title: "Fig 10: Regulatory GRC Compliance Auditing Matrix" })}
                className="cursor-zoom-in rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--accent-primary)] bg-black/40 transition-colors"
              >
                <img
                  src="/paper_figures/fig10_grc_compliance_matrix.png"
                  alt="GRC Compliance Matrix"
                  className="w-full object-contain"
                />
              </div>
            </div>
          )}

          {/* TAB 6: STATISTICAL TESTS */}
          {activeTab === "significance" && (
            <div className="space-y-4">
              <h4 className="font-['Orbitron'] font-bold text-xs text-[var(--accent-secondary)] flex items-center justify-between">
                <span>FIG 11: PARAMETRIC & NON-PARAMETRIC HYPOTHESIS TESTS</span>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[var(--text-muted)]">Click to zoom</span>
              </h4>
              <div
                onClick={() => setZoomedImage({ src: "/paper_figures/fig11_statistical_significance_tests.png", title: "Fig 11: Parametric and Non-Parametric Hypothesis Tests" })}
                className="cursor-zoom-in rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--accent-secondary)] bg-black/40 transition-colors"
              >
                <img
                  src="/paper_figures/fig11_statistical_significance_tests.png"
                  alt="Statistical Significance Tests"
                  className="w-full object-contain"
                />
              </div>
              <div className="p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] font-['JetBrains_Mono'] text-xs space-y-1.5">
                <div className="text-[var(--accent-primary)] font-bold">
                  • Wilcoxon Signed-Rank Test: W = 0.0, p &lt; 10⁻⁴ (Conformer statistically superior to all baselines)
                </div>
                <div className="text-[var(--accent-tertiary)] font-bold">
                  • Friedman Omnibus Test: χ²_F = 39.00, p = 1.74 × 10⁻⁸ (Multi-classifier difference significant)
                </div>
                <div className="text-[var(--alert-nominal)] font-bold">
                  • Cohen's d Effect Size: d = 16.09 (Enormous effect size magnitude)
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* LIGHTBOX ZOOM MODAL */}
      {zoomedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoomedImage.title}
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between w-full text-white font-['Orbitron'] text-sm px-2">
              <span>{zoomedImage.title}</span>
              <button
                onClick={() => setZoomedImage(null)}
                aria-label="Close image zoom view"
                className="cursor-pointer p-1 rounded-lg border border-white/20 hover:bg-white/20 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={zoomedImage.src}
              alt={zoomedImage.title}
              className="max-h-[75vh] w-auto object-contain rounded-lg border border-[var(--border-color)] shadow-2xl bg-black"
            />
            <span className="text-xs text-[var(--text-muted)] font-['JetBrains_Mono']">
              Press ESC or click outside to dismiss
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

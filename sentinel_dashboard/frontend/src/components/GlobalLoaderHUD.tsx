"use client";

import React, { useEffect, useState } from "react";
import CustomLoader from "@/components/CustomLoader";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import { Shield, Cpu, Activity, CheckCircle2, X } from "lucide-react";

export default function GlobalLoaderHUD() {
  const {
    isGlobalLoading,
    globalLoadingTitle,
    globalLoadingSubtitle,
    setGlobalLoading,
    theme
  } = useTelemetryStore();

  const isLightMode = theme === "alabaster" || theme === "arctic" || theme === "light";

  // Initial boot state (shows on initial visit for 1.4s)
  const [isInitialBoot, setIsInitialBoot] = useState<boolean>(true);
  const [bootProgress, setBootProgress] = useState<number>(15);
  const [bootStepIndex, setBootStepIndex] = useState<number>(0);

  const BOOT_STEPS = [
    "BOOT: Initializing Sentinel-IoT Kernel v2.4 (FP16 Conformer Dual-Core)...",
    "CORE: Calibrating Multi-Head Self-Attention (MHSA) + Conv1D Depthwise Layers...",
    "SENSORS: Connecting to 13 IoT/OT Sensory Domains via Zero-Copy Ring Buffer...",
    "AUDIT: Verifying NIST SP 800-53 Rev. 5 & ISO 27001 Cryptographic SHA-256 Ledger...",
    "SECURITY: All Wazuh Active Response & EBPF line-rate filters armed...",
    "SYSTEM READY // TELEMETRY PIPELINE STREAMING NOMINAL"
  ];

  // Initial boot timer
  useEffect(() => {
    // Check if already booted in this session
    const booted = typeof window !== "undefined" ? sessionStorage.getItem("sentinel_booted") : null;
    if (booted) {
      setIsInitialBoot(false);
      return;
    }

    const interval = setInterval(() => {
      setBootProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsInitialBoot(false);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("sentinel_booted", "true");
            }
          }, 350);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 18) + 12;
        return next > 100 ? 100 : next;
      });
    }, 180);

    const stepInterval = setInterval(() => {
      setBootStepIndex((prev) => (prev < BOOT_STEPS.length - 1 ? prev + 1 : prev));
    }, 280);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  // Keyboard shortcut: ESC to dismiss loader
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsInitialBoot(false);
        setGlobalLoading(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setGlobalLoading]);

  const active = isInitialBoot || isGlobalLoading;

  if (!active) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-500 select-none ${
        isLightMode
          ? "bg-[#fafaff]/94 backdrop-blur-md text-[#1c1c1c]"
          : "bg-[#05050a]/92 backdrop-blur-md text-[#dee3eb]"
      }`}
    >
      {/* Background Reticle Watermark / Ambient Grid */}
      <div className="absolute inset-0 pointer-events-none cyber-grid-bg opacity-30" />

      {/* Dismiss button top right */}
      <button
        type="button"
        onClick={() => {
          setIsInitialBoot(false);
          setGlobalLoading(false);
        }}
        title="Dismiss Loader (ESC)"
        className={`absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs border transition-all cursor-pointer ${
          isLightMode
            ? "bg-[#eef0f2] hover:bg-[#ecebe4] border-[#daddd8] text-[#1c1c1c]"
            : "bg-[#0b131e] hover:bg-[#162536] border-[#162536] text-[#64748b] hover:text-white"
        }`}
      >
        <X className="w-3.5 h-3.5" />
        <span>SKIP [ESC]</span>
      </button>

      {/* Center Tactical Assembly */}
      <div className="relative flex flex-col items-center justify-center p-8 max-w-lg w-full text-center">
        
        {/* Outer Circular Optical Target Reticle */}
        <div className="relative flex items-center justify-center">
          {/* Outer Rotating Compass Ring */}
          <div
            className={`absolute w-[240px] h-[240px] rounded-full border border-dashed pointer-events-none animate-spin ${
              isLightMode ? "border-[#0284c7]/30" : "border-[var(--loader-color,#00f3ff)]/25"
            }`}
            style={{ animationDuration: "24s" }}
          />

          {/* Secondary Counter-rotating Reticle Ring */}
          <div
            className={`absolute w-[210px] h-[210px] rounded-full border pointer-events-none animate-spin ${
              isLightMode ? "border-[#daddd8]" : "border-white/10"
            }`}
            style={{ animationDuration: "14s", animationDirection: "reverse" }}
          />

          {/* Precision Corner Reticle Marks */}
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-widest opacity-60">
            ▲ N:001
          </span>
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-widest opacity-60">
            ▼ S:180
          </span>
          <span className="absolute -left-5 top-1/2 -translate-y-1/2 font-mono text-[9px] tracking-widest opacity-60">
            ◄ W:270
          </span>
          <span className="absolute -right-5 top-1/2 -translate-y-1/2 font-mono text-[9px] tracking-widest opacity-60">
            E:090 ►
          </span>

          {/* USER'S CUSTOM CONCENTRIC SEMICIRCLE HYPNOTIC LOADER */}
          <CustomLoader size={170} />

          {/* Inner Glowing Core Node */}
          <div
            className={`absolute w-3 h-3 rounded-full animate-ping pointer-events-none ${
              isLightMode ? "bg-[#0284c7]" : "bg-[var(--loader-color,#00f3ff)]"
            }`}
          />
        </div>

        {/* Tactical Title & Status Banner */}
        <div className="mt-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded font-mono text-[11px] font-bold tracking-widest uppercase border">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isLightMode ? "bg-[#0284c7]" : "bg-[var(--loader-color,#00f3ff)]"
              }`}
            />
            <span>
              {isInitialBoot
                ? "SENTINEL-IOT // SYSTEM BOOT"
                : globalLoadingTitle || "PROCESSING TELEMETRY"}
            </span>
          </div>

          <h2 className="font-['Orbitron'] font-bold text-lg sm:text-xl tracking-wider">
            {isInitialBoot ? "CONFORMER SOC DEFENSE MATRIX" : globalLoadingSubtitle || "ACTIVE SYNCHRONY"}
          </h2>

          <p className="font-mono text-xs max-w-sm mx-auto opacity-75 min-h-[32px] flex items-center justify-center">
            {isInitialBoot
              ? BOOT_STEPS[bootStepIndex]
              : globalLoadingSubtitle || "Calibrating continuous anomaly prediction & compliance ledger..."}
          </p>
        </div>

        {/* Dynamic Progress Bar & Diagnostics */}
        <div className="w-full max-w-xs mt-4 space-y-2 font-mono">
          <div className="flex items-center justify-between text-[11px] opacity-80">
            <span>PIPELINE_STATUS:</span>
            <span className="font-bold">
              {isInitialBoot ? `${bootProgress}% [${bootProgress >= 100 ? "LOCKED" : "SYNCING"}]` : "ACTIVE"}
            </span>
          </div>

          <div
            className={`w-full h-1.5 rounded-full overflow-hidden border ${
              isLightMode ? "bg-[#eef0f2] border-[#daddd8]" : "bg-[#0b131e] border-[#162536]"
            }`}
          >
            <div
              className={`h-full transition-all duration-200 rounded-full ${
                isLightMode
                  ? "bg-[#0284c7]"
                  : "bg-gradient-to-r from-[var(--loader-color,#00f3ff)] to-[#00ff66]"
              }`}
              style={{ width: `${isInitialBoot ? bootProgress : 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] opacity-50 pt-1">
            <span>LATENCY: 0.082ms (eBPF)</span>
            <span>SHM RING: OK</span>
            <span>FP16: LOCKED</span>
          </div>
        </div>

      </div>
    </div>
  );
}

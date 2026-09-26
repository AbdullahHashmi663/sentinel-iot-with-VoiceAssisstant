// ==============================================================================
// SENTINEL-IOT: TACTICAL COCKPIT HUD & AEROSPACE THREAT RADAR
// Authentic Sci-Fi Cockpit Architecture • Spacious High-Density HUD
// Dual Reticle Targeting • Orbital Trajectory • Planetary Sector Scan
// ==============================================================================

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Compass,
  Crosshair,
  Radio,
  Wifi,
  Activity,
  Layers,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCw,
  Terminal,
  Cpu
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";

export default function TacticalCockpitHUD() {
  const { latestEvent, ingestionVelocity, threatsContainedCount, activeDomain } = useTelemetryStore();

  const [timecodeSeconds, setTimecodeSeconds] = useState<number>(11);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [radarAngle, setRadarAngle] = useState<number>(0);
  const [trajectoryOffset, setTrajectoryOffset] = useState<number>(0);

  const anomalyScore = latestEvent?.anomalyProbability ?? 0.085;
  const isThreatActive = anomalyScore > 0.65;
  const targetIp = latestEvent?.sourceIp || "192.168.100.45";

  // Real-time animation ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setRadarAngle((prev) => (prev + 3) % 360);
      setTrajectoryOffset((prev) => (prev + 0.05) % (Math.PI * 2));
      setTimecodeSeconds((prev) => (prev >= 14 ? 0 : prev + 1));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Format timecode string e.g., 0:11 / 0:14
  const formattedTimecode = useMemo(() => {
    const min = Math.floor(timecodeSeconds / 60);
    const sec = timecodeSeconds % 60;
    return `0:${sec < 10 ? "0" : ""}${sec} / 0:14`;
  }, [timecodeSeconds]);

  // Trajectory Sine Curve Coordinates (SVG ViewBox 500x120)
  const trajectoryPoints = useMemo(() => {
    const points: string[] = [];
    const width = 500;
    const height = 120;
    const peakX = 260;
    const peakY = 28;

    for (let x = 20; x <= width - 20; x += 8) {
      // Gaussian / Parabolic curve with gentle oscillation
      const distFromPeak = (x - peakX) / 130;
      const baseCurve = Math.exp(-distFromPeak * distFromPeak);
      const ripple = Math.sin(x * 0.08 + trajectoryOffset) * 4;
      const y = height - 25 - baseCurve * (height - peakY - 30) + ripple;
      points.push(`${x},${y.toFixed(1)}`);
    }
    return points.join(" ");
  }, [trajectoryOffset]);

  return (
    <div className="w-full space-y-6 my-2 select-none">
      
      {/* =====================================================================
          1. TOP CHAMFERED COCKPIT FRAME ("SPACE PHONE..." AEROSPACE HEADER)
          ===================================================================== */}
      <div className="relative w-full rounded-2xl bg-black/90 border-2 border-[var(--accent-primary,#facc15)] p-4 md:p-6 shadow-[0_0_35px_rgba(250,204,21,0.18)] cockpit-frame-cut">
        
        {/* Subtle Diagonal Hash Texture on Sides */}
        <div className="absolute top-0 left-0 w-32 h-full hatch-pattern opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-full hatch-pattern opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          
          {/* LEFT: Coordinates, Hash Vents & Status Matrix */}
          <div className="flex items-center gap-4">
            {/* Hash Vents */}
            <div className="hidden sm:flex flex-col gap-1 text-[var(--accent-primary,#facc15)]/70 font-mono text-[10px] tracking-tighter">
              <span>///</span>
              <span>///</span>
              <span>///</span>
            </div>

            {/* Precision Coordinate Ticks */}
            <div className="font-['JetBrains_Mono'] text-[9px] text-[var(--accent-primary,#facc15)]/90 space-y-0.5 border-l border-[var(--accent-primary,#facc15)]/40 pl-3">
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)] font-bold">POS_X</span>
                <span>0.00000 X 0.00015</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)] font-bold">POS_Y</span>
                <span>0.00009 X 0.00035</span>
              </div>
            </div>
          </div>

          {/* CENTER: Futuristic Chamfered Banner */}
          <div className="flex-1 flex flex-col items-center justify-center px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[var(--accent-primary,#facc15)]" />
              <h2 className="font-['Orbitron'] font-black text-sm md:text-base tracking-[0.25em] text-[var(--accent-primary,#facc15)] uppercase drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]">
                SPACE COCKPIT • SENTINEL-IOT DEFENSE HUD
              </h2>
              <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[var(--accent-primary,#facc15)]" />
            </div>
            <div className="flex items-center gap-2 text-[9px] font-['JetBrains_Mono'] text-[var(--text-muted)] mt-0.5">
              <span>SECTOR: 07-ALPHA</span>
              <span>•</span>
              <span className="text-[var(--alert-nominal)] font-bold">CONFORMER MHSA ACTIVE</span>
              <span>•</span>
              <span>GRID: TON-IOT-13</span>
            </div>
          </div>

          {/* RIGHT: LED Beacons Array, Dot Matrix & Time Indicator */}
          <div className="flex items-center gap-3">
            {/* Dot Matrix Indicators */}
            <div className="flex items-center gap-1.5 text-[var(--accent-primary,#facc15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary,#facc15)]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary,#facc15)]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary,#facc15)] opacity-40" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary,#facc15)]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary,#facc15)]" />
            </div>

            {/* Glowing Circular Sensor Beacons (Red, White, Green, Amber) */}
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--accent-primary,#facc15)]/40">
              <div
                className={`relative flex items-center justify-center w-5 h-5 rounded-full border border-red-500/80 bg-red-950/60 ${
                  isThreatActive ? "animate-pulse shadow-[0_0_10px_#ef4444]" : ""
                }`}
                title="Critical Threat Beacon"
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <div className="relative flex items-center justify-center w-5 h-5 rounded-full border border-emerald-500/80 bg-emerald-950/60" title="Fleet Nominal Beacon">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="relative flex items-center justify-center w-5 h-5 rounded-full border border-amber-500/80 bg-amber-950/60" title="Telemetry Buffer Beacon">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div className="relative flex items-center justify-center w-5 h-5 rounded-full border border-cyan-500/80 bg-cyan-950/60" title="XAI Saliency Beacon">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. TRAJECTORY & FREQUENCY WAVEFORM TELEMETRY DISPLAY (UPPER HUD)
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Diagnostic Hatch Box */}
        <div className="lg:col-span-3 rounded-2xl bg-black/85 border border-[var(--accent-primary,#facc15)]/60 p-5 flex flex-col justify-between relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
          <div className="absolute inset-0 hatch-pattern opacity-25 pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[var(--accent-primary,#facc15)]">
              <span className="font-bold">SYSTEM_DIAG // 01</span>
              <span>CAL_NORM</span>
            </div>
            <div className="text-xl font-['Orbitron'] font-black text-white">
              BANDWIDTH 8.4 GHz
            </div>
            <p className="text-xs font-['Space_Grotesk'] text-[var(--text-secondary)]">
              Continuous 10-step sliding inference on domain: <span className="text-[var(--accent-primary,#facc15)]">{activeDomain}</span>
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-[var(--accent-primary,#facc15)]/30 flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
            <span>PACKET GAIN: +12.4dB</span>
            <span className="text-[var(--alert-nominal)] font-bold">STABLE</span>
          </div>
        </div>

        {/* Right Trajectory Waveform Box */}
        <div className="lg:col-span-9 rounded-2xl bg-black/90 border border-[var(--accent-primary,#facc15)]/60 p-5 relative overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.5)]">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[var(--accent-primary,#facc15)] border-b border-[var(--accent-primary,#facc15)]/20 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[var(--accent-primary,#facc15)]" />
              <span className="font-bold uppercase tracking-wider">ORBITAL THREAT TRAJECTORY & FREQUENCY WAVEFORM</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[var(--text-muted)]">APEX: 1,240 m</span>
              <span className="px-2 py-0.5 rounded bg-[var(--accent-primary,#facc15)]/20 text-[var(--accent-primary,#facc15)] font-bold">
                RF: 25.05 MHz
              </span>
            </div>
          </div>

          {/* Interactive SVG Waveform Display */}
          <div className="relative w-full h-[140px] flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#facc15" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#facc15" stopOpacity="0.0" />
                </linearGradient>
                <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Horizontal Reference Lines */}
              <line x1="20" y1="30" x2="480" y2="30" stroke="rgba(250,204,21,0.15)" strokeDasharray="3 3" />
              <line x1="20" y1="65" x2="480" y2="65" stroke="rgba(250,204,21,0.15)" strokeDasharray="3 3" />
              <line x1="20" y1="95" x2="480" y2="95" stroke="rgba(250,204,21,0.3)" />

              {/* Area under curve */}
              <polygon
                points={`20,95 ${trajectoryPoints} 480,95`}
                fill="url(#wave-gradient)"
              />

              {/* Glowing Trajectory Arc */}
              <polyline
                points={trajectoryPoints}
                fill="none"
                stroke="#facc15"
                strokeWidth="2.5"
                filter="url(#gold-glow)"
              />

              {/* Target Indicator at Apex (x=260) */}
              <g transform="translate(260, 28)">
                <circle r="6" fill="#facc15" className="animate-ping" opacity="0.6" />
                <circle r="4" fill="#ffffff" stroke="#facc15" strokeWidth="2" />
                {/* Red Direction Chevron */}
                <path d="M 10,-3 L 18,0 L 10,3" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Waypoint Markers */}
              <g transform="translate(180, 52)">
                <rect x="-24" y="-12" width="48" height="15" rx="3" fill="#000000" stroke="#facc15" strokeWidth="0.8" />
                <text x="0" y="-2" fill="#facc15" fontSize="7" fontFamily="monospace" textAnchor="middle">
                  RF: 25.05
                </text>
              </g>
              <g transform="translate(340, 52)">
                <rect x="-24" y="-12" width="48" height="15" rx="3" fill="#000000" stroke="#facc15" strokeWidth="0.8" />
                <text x="0" y="-2" fill="#facc15" fontSize="7" fontFamily="monospace" textAnchor="middle">
                  VAL: 44.80
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. DUAL RETICLE TACTICAL TARGETING & SONAR RADAR HUD ("TERRAIN SCAN")
          ===================================================================== */}
      <div className="relative w-full rounded-2xl bg-black/95 border-2 border-[var(--accent-primary,#facc15)]/80 p-6 md:p-8 shadow-[0_0_35px_rgba(250,204,21,0.12)]">
        
        {/* Top Header & Tactical Brackets */}
        <div className="flex items-center justify-between text-[11px] font-['Orbitron'] text-[var(--accent-primary,#facc15)] border-b border-[var(--accent-primary,#facc15)]/30 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[var(--accent-primary,#facc15)] rotate-45" />
            <span className="font-black tracking-widest text-sm text-white">TERRAIN SCAN // DEFENSE HORIZON</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-['JetBrains_Mono']">
            <span>[ 250 ]</span>
            <span className="text-[var(--alert-nominal)] font-bold animate-pulse">LIVE FEED // 014</span>
          </div>
        </div>

        {/* Dual Dials Grid Container with Spacious Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center justify-center py-4">
          
          {/* DIAL 1 (LEFT): TACTICAL TARGETING & ARTIFICIAL HORIZON PITCH LADDER */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full border-2 border-[var(--accent-primary,#facc15)]/40 bg-black/80 flex items-center justify-center shadow-[inset_0_0_30px_rgba(250,204,21,0.15)] overflow-hidden">
              
              {/* Outer Circular Bearing Degree Ticks */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 260">
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 15 * Math.PI) / 180;
                  const x1 = 130 + 120 * Math.cos(angle);
                  const y1 = 130 + 120 * Math.sin(angle);
                  const x2 = 130 + 112 * Math.cos(angle);
                  const y2 = 130 + 112 * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#facc15"
                      strokeWidth={i % 3 === 0 ? "2" : "1"}
                      opacity={i % 3 === 0 ? "0.9" : "0.4"}
                    />
                  );
                })}

                {/* Side Segmented Arc Meters (Left & Right Curves) */}
                <path
                  d="M 28,130 A 102 102 0 0 1 60,60"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeDasharray="8 4"
                />
                <path
                  d="M 232,130 A 102 102 0 0 0 200,60"
                  fill="none"
                  stroke="#84cc16"
                  strokeWidth="3.5"
                  strokeDasharray="8 4"
                />

                {/* Sub-Ring with Degree Label Numbers */}
                <circle cx="130" cy="130" r="102" fill="none" stroke="#facc15" strokeWidth="1" opacity="0.3" />
                <circle cx="130" cy="130" r="82" fill="none" stroke="#facc15" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" />
              </svg>

              {/* Artificial Horizon Pitch Ladder (Animated Drift) */}
              <div className="absolute inset-0 flex items-center justify-center animate-pitch-horizon pointer-events-none">
                <svg className="w-44 h-44" viewBox="0 0 160 160">
                  {/* Horizon Pitch Ladder Bars */}
                  <line x1="45" y1="50" x2="115" y2="50" stroke="#facc15" strokeWidth="1.5" opacity="0.7" />
                  <text x="35" y="53" fill="#facc15" fontSize="7" fontFamily="monospace">+10</text>
                  <text x="120" y="53" fill="#facc15" fontSize="7" fontFamily="monospace">+10</text>

                  <line x1="30" y1="80" x2="130" y2="80" stroke="#facc15" strokeWidth="2" opacity="0.9" />
                  <text x="20" y="83" fill="#facc15" fontSize="8" fontFamily="monospace" fontWeight="bold">0</text>
                  <text x="135" y="83" fill="#facc15" fontSize="8" fontFamily="monospace" fontWeight="bold">0</text>

                  <line x1="45" y1="110" x2="115" y2="110" stroke="#facc15" strokeWidth="1.5" opacity="0.7" />
                  <text x="35" y="113" fill="#facc15" fontSize="7" fontFamily="monospace">-10</text>
                  <text x="120" y="113" fill="#facc15" fontSize="7" fontFamily="monospace">-10</text>
                </svg>
              </div>

              {/* Center Glowing Red Crosshair Reticle & Target Lock */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-2 border-red-500/90 shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                  {/* Fine Red Crosshairs */}
                  <div className="absolute w-full h-[1.5px] bg-red-500" />
                  <div className="absolute h-full w-[1.5px] bg-red-500" />
                  <div className="w-4 h-4 rounded-full border border-red-400 bg-red-500/30" />
                </div>
              </div>

              {/* Lock Status Pill */}
              <div className="absolute bottom-4 px-3 py-0.5 rounded bg-black/90 border border-red-500 text-red-400 font-mono text-[9px] font-bold tracking-widest uppercase">
                {isThreatActive ? "THREAT LOCKED" : "TARGET ACQUIRED"}
              </div>
            </div>

            <div className="text-center space-y-0.5">
              <div className="text-xs font-['Orbitron'] font-bold text-white tracking-wider">
                FLIGHT ANGLE & RETICLE PITCH
              </div>
              <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--accent-primary,#facc15)]">
                BEARING: 042° • PITCH: +04.2° • ROLL: -01.8°
              </div>
            </div>
          </div>

          {/* DIAL 2 (RIGHT): PLANAR SECTOR SONAR RADAR */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full border-2 border-[var(--accent-primary,#facc15)]/40 bg-black/80 flex items-center justify-center shadow-[inset_0_0_30px_rgba(250,204,21,0.15)] overflow-hidden">
              
              {/* Concentric Sonar Distance Rings (25km, 50km, 100km) */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 260">
                <circle cx="130" cy="130" r="118" fill="none" stroke="#facc15" strokeWidth="1.5" opacity="0.7" />
                <circle cx="130" cy="130" r="80" fill="none" stroke="#facc15" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                <circle cx="130" cy="130" r="42" fill="none" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

                {/* Coordinate Quadrant Axes */}
                <line x1="130" y1="8" x2="130" y2="252" stroke="#facc15" strokeWidth="1" opacity="0.35" />
                <line x1="8" y1="130" x2="252" y2="130" stroke="#facc15" strokeWidth="1" opacity="0.35" />

                <text x="130" y="24" fill="#facc15" fontSize="8" fontFamily="monospace" textAnchor="middle">000°</text>
                <text x="242" y="133" fill="#facc15" fontSize="8" fontFamily="monospace" textAnchor="middle">090°</text>
                <text x="130" y="246" fill="#facc15" fontSize="8" fontFamily="monospace" textAnchor="middle">180°</text>
                <text x="18" y="133" fill="#facc15" fontSize="8" fontFamily="monospace" textAnchor="middle">270°</text>
              </svg>

              {/* Continuous Sweeping Sonar Beam (CSS Rotate Keyframe) */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    "conic-gradient(from 0deg at 50% 50%, rgba(250, 204, 21, 0.45) 0deg, rgba(250, 204, 21, 0.05) 50deg, transparent 75deg)",
                  transform: `rotate(${radarAngle}deg)`
                }}
              />

              {/* Tactical Threat Blips on the Sonar Plane */}
              {/* Blip 1: Attack Source (Red) */}
              <div
                className="absolute top-16 right-20 flex flex-col items-center pointer-events-none cursor-pointer"
                title={`Adversary Node: ${targetIp}`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="absolute w-2 h-2 rounded-full bg-red-600" />
                <span className="mt-1 font-mono text-[7px] text-red-400 bg-black/80 px-1 rounded border border-red-500/40">
                  {targetIp}
                </span>
              </div>

              {/* Blip 2: Physical PLC Node (Green) */}
              <div className="absolute bottom-20 left-20 flex flex-col items-center pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="mt-1 font-mono text-[7px] text-emerald-300 bg-black/80 px-1 rounded border border-emerald-500/40">
                  PLC_NODE_01
                </span>
              </div>

              {/* Blip 3: Modbus Actuator (Gold) */}
              <div className="absolute top-28 left-28 flex flex-col items-center pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="mt-0.5 font-mono text-[7px] text-amber-300 bg-black/80 px-1 rounded">
                  ACTUATOR_07
                </span>
              </div>
            </div>

            <div className="text-center space-y-0.5">
              <div className="text-xs font-['Orbitron'] font-bold text-white tracking-wider">
                PLANAR SONAR & THREAT TRACKER
              </div>
              <div className="text-[10px] font-['JetBrains_Mono'] text-[var(--accent-primary,#facc15)]">
                SCAN RADIUS: 100 KM • SWEEP FREQ: 2.4 GHz
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tactical Coordinate Bracket */}
        <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[var(--accent-primary,#facc15)] border-t border-[var(--accent-primary,#facc15)]/30 pt-3 mt-4">
          <span>LATERAL ECHO: 98.4%</span>
          <span>[ 250 ]</span>
          <span>RANGE RESOLUTION: 0.12m</span>
        </div>
      </div>

      {/* =====================================================================
          4. SEGMENTED TELEMETRY ENERGY & BATTERY BLOCK BARS
          ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PRESSURE_84 Block Meter */}
        <div className="p-4 rounded-xl bg-black/80 border border-[var(--accent-primary,#facc15)]/50 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-['Orbitron'] font-bold text-[var(--accent-primary,#facc15)]">
              PRESSURE_84
            </span>
            {/* Hash Lines */}
            <span className="text-[var(--text-muted)] font-mono text-xs">||||||||||</span>
          </div>

          {/* Segmented Yellow Blocks */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <span
                key={i}
                className="w-4 h-3 rounded-xs bg-[var(--accent-primary,#facc15)] shadow-[0_0_8px_rgba(250,204,21,0.5)]"
              />
            ))}
            {[7, 8].map((i) => (
              <span key={i} className="w-4 h-3 rounded-xs bg-[var(--accent-primary,#facc15)]/20" />
            ))}
          </div>
        </div>

        {/* ENERGY RESERVES High-Density Segmented Meter */}
        <div className="p-4 rounded-xl bg-black/80 border border-[var(--accent-primary,#facc15)]/50 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-['Orbitron'] font-bold text-[var(--accent-primary,#facc15)]">
              ENERGY RESERVES
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">1200 V // 80A</span>
          </div>

          {/* Stepped Density Meter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 24 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1 h-3.5 rounded-xs transition-all ${
                    idx < 21
                      ? "bg-gradient-to-t from-[var(--brand-primary)] to-[var(--accent-primary,#facc15)]"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <span className="px-2 py-0.5 rounded bg-[var(--accent-primary,#facc15)] text-black font-['Orbitron'] font-black text-xs">
              92%
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          5. ROW OF 4 MODULAR TACTICAL SENSOR GAUGES / TILES
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* TILE 1: ACTIVITY */}
        <div className="p-5 rounded-2xl bg-black/80 border border-[var(--accent-primary,#facc15)]/50 flex flex-col justify-between min-h-[160px] shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[var(--accent-primary,#facc15)] border-b border-[var(--accent-primary,#facc15)]/30 pb-1.5">
            <span className="font-bold">ACTIVITY</span>
            <span>0.5</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-1 font-['JetBrains_Mono'] text-xs">
              <div className="text-[var(--text-secondary)]">FEED: 18.00 // 58.34</div>
              <div className="text-[var(--accent-primary,#facc15)] font-bold">PTS: 12.78</div>
            </div>

            {/* Circular Percentage Ring (15%) */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="3"
                  strokeDasharray="100.5"
                  strokeDashoffset="85.4"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-['Orbitron'] font-bold text-white">15%</span>
            </div>
          </div>

          <div className="text-[9px] font-mono text-[var(--text-muted)] border-t border-white/10 pt-1.5 flex justify-between">
            <span>BURST_RATE</span>
            <span className="text-[var(--alert-nominal)] font-bold">OPTIMAL</span>
          </div>
        </div>

        {/* TILE 2: STATUS */}
        <div className="p-5 rounded-2xl bg-black/80 border border-[var(--accent-primary,#facc15)]/50 flex flex-col justify-between min-h-[160px] shadow-md">
          <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[var(--accent-primary,#facc15)] border-b border-[var(--accent-primary,#facc15)]/30 pb-1.5">
            <span className="font-bold">STATUS</span>
            <span>70.12</span>
          </div>

          <div className="space-y-2 py-2">
            <div className="text-xs font-mono text-[var(--text-secondary)]">
              DRY: 150 / 15.5
            </div>
            
            {/* Connected Hexagonal Node Diagram */}
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="w-5 h-5 rounded-full border border-red-500 bg-red-950/60 flex items-center justify-center text-[8px] text-red-300 font-bold">
                ⬡
              </div>
              <div className="flex-1 h-[1.5px] bg-gradient-to-r from-red-500 via-[var(--accent-primary,#facc15)] to-emerald-500 mx-2" />
              <div className="w-5 h-5 rounded-full border border-emerald-500 bg-emerald-950/60 flex items-center justify-center text-[8px] text-emerald-300 font-bold">
                ⬡
              </div>
            </div>
          </div>

          <div className="text-[9px] font-mono text-[var(--text-muted)] border-t border-white/10 pt-1.5 flex justify-between">
            <span>CH_01 // ACTIVE</span>
            <span className="text-[var(--accent-primary,#facc15)] font-bold">SYNC: 100%</span>
          </div>
        </div>

        {/* TILE 3: SENSORS */}
        <div className="p-5 rounded-2xl bg-black/80 border border-[var(--accent-primary,#facc15)]/50 flex flex-col justify-between min-h-[160px] shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[var(--accent-primary,#facc15)] border-b border-[var(--accent-primary,#facc15)]/30 pb-1.5">
            <span className="font-bold">SENSORS</span>
            <span>BL_09</span>
          </div>

          {/* Crosshair Wireframe Diamond */}
          <div className="relative flex items-center justify-center py-2">
            <div className="w-20 h-12 border border-[var(--accent-primary,#facc15)]/40 rotate-45 flex items-center justify-center" />
            <div className="absolute text-sm font-['Orbitron'] font-black text-white">
              13/13
            </div>
          </div>

          <div className="text-[9px] font-mono text-[var(--text-muted)] border-t border-white/10 pt-1.5 flex justify-between">
            <span>GRID COVERAGE</span>
            <span className="text-[var(--alert-nominal)] font-bold">COMPLETE</span>
          </div>
        </div>

        {/* TILE 4: COMMUNICATIONS */}
        <div className="p-5 rounded-2xl bg-black/80 border border-[var(--accent-primary,#facc15)]/50 flex flex-col justify-between min-h-[160px] shadow-md">
          <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[var(--accent-primary,#facc15)] border-b border-[var(--accent-primary,#facc15)]/30 pb-1.5">
            <span className="font-bold">COMMUNICATIONS</span>
            <span>V1_07</span>
          </div>

          {/* Chamfered Inner Card with MAIN ARRAY button */}
          <div className="flex items-center justify-center py-3">
            <div className="px-5 py-2 rounded-lg bg-[var(--accent-primary,#facc15)]/20 border-2 border-[var(--accent-primary,#facc15)] text-[var(--accent-primary,#facc15)] font-['Orbitron'] font-black text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(250,204,21,0.25)]">
              MAIN ARRAY
            </div>
          </div>

          <div className="text-[9px] font-mono text-[var(--text-muted)] border-t border-white/10 pt-1.5 flex justify-between">
            <span>UPLINK CARRIER</span>
            <span className="text-[var(--alert-nominal)] font-bold">LOCKED</span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          6. GEOSPATIAL PLANETARY THREAT SECTOR & ORBITAL BALLISTIC ARC MAP
          ===================================================================== */}
      <div className="relative w-full rounded-2xl bg-black/95 border-2 border-[var(--accent-primary,#facc15)]/80 p-6 md:p-8 shadow-[0_0_35px_rgba(250,204,21,0.14)] overflow-hidden">
        
        {/* Top Header & Ticks */}
        <div className="flex items-center justify-between text-xs font-['Orbitron'] text-[var(--accent-primary,#facc15)] border-b border-[var(--accent-primary,#facc15)]/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--accent-primary,#facc15)] animate-spin" style={{ animationDuration: "12s" }} />
            <span className="font-black tracking-widest text-sm text-white">
              GEOSPATIAL SECTOR GRID & ORBITAL THREAT TRAJECTORY
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span>SECTOR SCAN // REGION 04</span>
            <span className="text-[var(--alert-critical)] font-bold animate-pulse">INGRESS DETECTED</span>
          </div>
        </div>

        {/* Spacious Map Graphic Canvas Container */}
        <div className="relative w-full h-[320px] md:h-[380px] bg-black/90 rounded-xl border border-[var(--accent-primary,#facc15)]/30 overflow-hidden flex items-center justify-center">
          
          {/* Border Graduation Ruler Marks (| ' | ' | ' |) */}
          <div className="absolute top-0 left-0 right-0 h-4 border-b border-[var(--accent-primary,#facc15)]/20 flex items-center justify-between px-3 text-[7px] font-mono text-[var(--accent-primary,#facc15)]/60 select-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <span key={i}>{i % 5 === 0 ? "|" : "'"}</span>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-4 border-t border-[var(--accent-primary,#facc15)]/20 flex items-center justify-between px-3 text-[7px] font-mono text-[var(--accent-primary,#facc15)]/60 select-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <span key={i}>{i % 5 === 0 ? "|" : "'"}</span>
            ))}
          </div>

          <svg className="w-full h-full" viewBox="0 0 800 360" preserveAspectRatio="none">
            <defs>
              {/* Radial gradient for planetary glow */}
              <radialGradient id="planet-glow" cx="50%" cy="100%" r="70%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#b91c1c" stopOpacity="0.55" />
                <stop offset="70%" stopColor="#1e293b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
              </radialGradient>
              <linearGradient id="scan-cone" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#facc15" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#facc15" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid Coordinate Wireframe Lines */}
            <line x1="80" y1="20" x2="80" y2="340" stroke="rgba(250,204,21,0.12)" strokeDasharray="4 4" />
            <line x1="240" y1="20" x2="240" y2="340" stroke="rgba(250,204,21,0.12)" strokeDasharray="4 4" />
            <line x1="400" y1="20" x2="400" y2="340" stroke="rgba(250,204,21,0.2)" />
            <line x1="560" y1="20" x2="560" y2="340" stroke="rgba(250,204,21,0.12)" strokeDasharray="4 4" />
            <line x1="720" y1="20" x2="720" y2="340" stroke="rgba(250,204,21,0.12)" strokeDasharray="4 4" />

            <line x1="20" y1="90" x2="780" y2="90" stroke="rgba(250,204,21,0.1)" strokeDasharray="4 4" />
            <line x1="20" y1="180" x2="780" y2="180" stroke="rgba(250,204,21,0.15)" />
            <line x1="20" y1="270" x2="780" y2="270" stroke="rgba(250,204,21,0.1)" strokeDasharray="4 4" />

            {/* Sweeping Radar Scan Cone / Sector */}
            <path
              d="M 400,360 L 260,20 A 400 400 0 0 1 540,20 Z"
              fill="url(#scan-cone)"
            />

            {/* Curved 3D Planetary Horizon Arc with Red Threat Heat */}
            <path
              d="M -50,420 Q 400,140 850,420"
              fill="url(#planet-glow)"
              stroke="#facc15"
              strokeWidth="2.5"
            />
            {/* Atmospheric Outer Rim Glow */}
            <path
              d="M -50,410 Q 400,130 850,410"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Orbital Trajectory Ballistic Arc 1 (Solid Yellow) */}
            <path
              d="M 160,270 Q 300,40 500,240"
              fill="none"
              stroke="#facc15"
              strokeWidth="2"
              strokeDasharray="6 3"
              className="animate-trajectory-glow"
            />

            {/* Orbital Trajectory Ballistic Arc 2 (White Dashed) */}
            <path
              d="M 330,300 Q 420,100 680,260"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeDasharray="4 4"
              opacity="0.85"
            />

            {/* Hexagonal Tactical Telemetry Node Beacons */}
            {/* Node 1: Ingress Attack Node */}
            <g transform="translate(160, 270)">
              <polygon points="0,-12 10,-6 10,6 0,12 -10,6 -10,-6" fill="#000000" stroke="#facc15" strokeWidth="2" />
              <circle r="3" fill="#ef4444" className="animate-ping" />
              <text x="0" y="24" fill="#facc15" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                LAT: 41.04
              </text>
              <text x="0" y="34" fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">
                LON: 54.09
              </text>
            </g>

            {/* Node 2: Primary Industrial Ingress */}
            <g transform="translate(340, 210)">
              <polygon points="0,-14 12,-7 12,7 0,14 -12,7 -12,-7" fill="#000000" stroke="#facc15" strokeWidth="2" />
              <circle r="4" fill="#facc15" />
              <rect x="18" y="-18" width="64" height="32" rx="4" fill="#000000" stroke="#facc15" strokeWidth="0.8" />
              <text x="22" y="-7" fill="#facc15" fontSize="7" fontFamily="monospace">LOC: 134.12</text>
              <text x="22" y="2" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">9280.97</text>
              <text x="22" y="10" fill="#ef4444" fontSize="6.5" fontFamily="monospace">THREAT: 0.94</text>
            </g>

            {/* Node 3: SCADA Actuator Grid */}
            <g transform="translate(680, 260)">
              <polygon points="0,-12 10,-6 10,6 0,12 -10,6 -10,-6" fill="#000000" stroke="#facc15" strokeWidth="2" />
              <circle r="3" fill="#10b981" />
              <rect x="-70" y="-18" width="60" height="24" rx="4" fill="#000000" stroke="#facc15" strokeWidth="0.8" />
              <text x="-66" y="-7" fill="#facc15" fontSize="7" fontFamily="monospace">ACTUATOR_02</text>
              <text x="-66" y="2" fill="#10b981" fontSize="6.5" fontFamily="monospace">100% SECURE</text>
            </g>

            {/* Node 4: Secondary Orbit Relay */}
            <g transform="translate(710, 160)">
              <polygon points="0,-12 10,-6 10,6 0,12 -10,6 -10,-6" fill="#000000" stroke="#facc15" strokeWidth="2" />
              <circle r="3" fill="#38bdf8" />
              <text x="0" y="-18" fill="#38bdf8" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                SAT_LINK // 04
              </text>
            </g>
          </svg>
        </div>

        {/* Footer Sector Telemetry Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-['JetBrains_Mono'] text-[var(--accent-primary,#facc15)] pt-4 mt-2 border-t border-[var(--accent-primary,#facc15)]/20">
          <div className="flex items-center gap-3">
            <span className="text-[var(--text-muted)]">SECTOR RESOLUTION: 0.05°</span>
            <span>•</span>
            <span className="text-[var(--alert-nominal)] font-bold">13 FLEET SENSOR NODES SYNCHRONIZED</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">
            EPHEMERIS EPOCH: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* =====================================================================
          7. BOTTOM CHAMFERED COCKPIT FRAME & MEDIA TELEMETRY CONTROLS
          ===================================================================== */}
      <div className="relative w-full rounded-2xl bg-black/90 border-2 border-[var(--accent-primary,#facc15)] p-4 md:p-5 shadow-[0_0_35px_rgba(250,204,21,0.18)] cockpit-frame-cut">
        
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          
          {/* LEFT: Video/Telemetry Playback Controls & Timecode */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause Telemetry Stream" : "Resume Telemetry Stream"}
              className="cursor-pointer p-2 rounded-lg bg-[var(--accent-primary,#facc15)]/20 hover:bg-[var(--accent-primary,#facc15)]/30 border border-[var(--accent-primary,#facc15)] text-[var(--accent-primary,#facc15)] active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Timecode Readout e.g. 0:11 / 0:14 */}
            <div className="font-['Orbitron'] font-bold text-xs md:text-sm text-white tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{formattedTimecode}</span>
            </div>

            {/* Glowing LEDs */}
            <div className="flex items-center gap-1.5 pl-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444]" />
              <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            </div>
          </div>

          {/* CENTER: Futuristic Space Cockpit Title */}
          <div className="font-['Orbitron'] font-black text-sm md:text-base tracking-[0.2em] text-[var(--accent-primary,#facc15)] uppercase">
            SPACE PHONE • SENTINEL-IOT COCKPIT
          </div>

          {/* RIGHT: Hash Ticks, Volume & Coordinate Precision */}
          <div className="flex items-center gap-4">
            <div className="font-['JetBrains_Mono'] text-[8px] text-[var(--accent-primary,#facc15)]/80 text-right space-y-0.5">
              <div>0.00000 X 0.00015</div>
              <div>0.00009 X 0.00035</div>
            </div>

            <div className="flex items-center gap-1 text-[var(--accent-primary,#facc15)]/70 font-mono text-[10px]">
              <span>///</span>
              <span>///</span>
            </div>

            <div className="p-1.5 rounded-lg bg-[var(--accent-primary,#facc15)]/10 border border-[var(--accent-primary,#facc15)]/40 text-[var(--accent-primary,#facc15)]">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

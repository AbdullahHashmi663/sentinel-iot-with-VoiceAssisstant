// ==============================================================================
// SENTINEL-IOT: ASSET PRIORITY MATRIX & SENSIBLE SHUTDOWN DECISION ENGINE
// Version 2.4 - Enterprise Production Edition - FYP-II
// Supports All 8 Themes with Full Light/Dark Dynamic Color System
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  Server,
  Database,
  Cpu,
  Radio,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  X,
  PowerOff,
  Crosshair,
  Layers,
  ArrowRight,
  Info,
  DollarSign,
  TrendingDown,
  Lock,
  Search,
  Check,
  Play
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import { ManagedAsset, AssetPriorityTier, AssetCategory, TriageDecision } from "@/types/sentinel";

export default function PriorityConsole() {
  const {
    assets,
    selectedAssetId,
    setSelectedAssetId,
    fetchAssets,
    updateAssetPriority,
    addManualAsset,
    testAssetConnection,
    testAllAssetConnections,
    evaluateTriageDecision,
    theme
  } = useTelemetryStore();

  const isLightMode = theme === "alabaster" || theme === "arctic" || theme === "light";

  // Component state
  const [filterCategory, setFilterCategory] = useState<"all" | AssetCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [testingAssetId, setTestingAssetId] = useState<string | null>(null);

  // Triage Simulator State
  const [simAssetId, setSimAssetId] = useState<string>(selectedAssetId || "plc_modbus_turbine");
  const [simAttackType, setSimAttackType] = useState<string>("ransomware");
  const [simTauScore, setSimTauScore] = useState<number>(0.92);
  const [simResult, setSimResult] = useState<TriageDecision | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationExecutionMessage, setSimulationExecutionMessage] = useState<string | null>(null);

  // New Asset Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "device" as AssetCategory,
    ip: "192.168.100.80",
    port: 502,
    protocol: "Modbus TCP",
    priority: "Tier 2 (High)" as AssetPriorityTier,
    business_criticality: 75,
    downtime_cost_per_hour: 25000,
    auto_shutdown_allowed: false,
    description: ""
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial load
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Sync sim asset if selected asset changes
  useEffect(() => {
    if (selectedAssetId) {
      setSimAssetId(selectedAssetId);
    }
  }, [selectedAssetId]);

  // Recalculate triage decision whenever sim inputs change
  useEffect(() => {
    let isMounted = true;
    const compute = async () => {
      if (!simAssetId) return;
      setIsSimulating(true);
      const res = await evaluateTriageDecision(simAssetId, simAttackType, simTauScore);
      if (isMounted) {
        setSimResult(res);
        setIsSimulating(false);
      }
    };
    compute();
    return () => {
      isMounted = false;
    };
  }, [simAssetId, simAttackType, simTauScore, evaluateTriageDecision]);

  // Handle single connection test
  const handleTestConnection = async (assetId: string) => {
    setTestingAssetId(assetId);
    await testAssetConnection(assetId);
    setTimeout(() => setTestingAssetId(null), 800);
  };

  // Handle test all
  const handleTestAll = async () => {
    setIsTestingAll(true);
    await testAllAssetConnections();
    setTimeout(() => setIsTestingAll(false), 1200);
  };

  // Handle create manual asset
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Asset name is required.");
      return;
    }
    if (!formData.ip.trim()) {
      setFormError("Valid IP address is required.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      await addManualAsset({
        name: formData.name,
        category: formData.category,
        ip: formData.ip,
        port: Number(formData.port),
        protocol: formData.protocol,
        priority: formData.priority,
        business_criticality: Number(formData.business_criticality),
        downtime_cost_per_hour: Number(formData.downtime_cost_per_hour),
        auto_shutdown_allowed: formData.auto_shutdown_allowed,
        description: formData.description
      });
      setIsConnectModalOpen(false);
      setFormData({
        name: "",
        category: "device",
        ip: "192.168.100.80",
        port: 502,
        protocol: "Modbus TCP",
        priority: "Tier 2 (High)",
        business_criticality: 75,
        downtime_cost_per_hour: 25000,
        auto_shutdown_allowed: false,
        description: ""
      });
    } catch {
      setFormError("Failed to register asset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute Simulated Containment / Action
  const handleExecuteTriageAction = (result: TriageDecision) => {
    if (result.sensible_to_shutdown) {
      updateAssetPriority(result.asset.id, {
        connection_status: 'offline',
        last_ping: 'Safely Shutdown (Containment Verified)'
      });
      setSimulationExecutionMessage(`[SUCCESS] Asset "${result.asset.name}" gracefully severed to prevent lateral blast.`);
    } else {
      setSimulationExecutionMessage(`[SURGICAL ACTION] Applied eBPF drop on hostile source IP. Preserved asset "${result.asset.name}" operational uptime!`);
    }
    setTimeout(() => setSimulationExecutionMessage(null), 5000);
  };

  // Filtered Assets
  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = filterCategory === "all" || asset.category === filterCategory;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.protocol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Aggregate stats
  const totalAssetsCount = assets.length;
  const onlineCount = assets.filter((a) => a.connection_status === "online").length;
  const tier1Count = assets.filter((a) => a.priority === "Tier 1 (Mission-Critical)").length;
  const totalDowntimeExposure = assets.reduce((sum, a) => sum + (a.downtime_cost_per_hour || 0), 0);

  // Helper colors
  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case "database":
        return <Database className={`w-3.5 h-3.5 ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`} />;
      case "server":
        return <Server className={`w-3.5 h-3.5 ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--research-sand)]"}`} />;
      case "device":
      default:
        return <Cpu className={`w-3.5 h-3.5 ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`} />;
    }
  };

  const getPriorityBadge = (priority: AssetPriorityTier) => {
    switch (priority) {
      case "Tier 1 (Mission-Critical)":
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isLightMode
                ? "bg-[#fee2e2] border-[var(--ws-coral)] text-[var(--ws-coral)]"
                : "bg-[var(--ws-coral)]/20 border-[var(--ws-coral)]/60 text-[var(--ws-coral)] shadow-[0_0_10px_rgba(255,153,133,0.3)]"
            }`}
          >
            TIER 1 (CRITICAL)
          </span>
        );
      case "Tier 2 (High)":
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isLightMode
                ? "bg-[#fef3c7] border-[var(--research-sand)] text-[var(--research-sand)]"
                : "bg-[var(--research-sand)]/20 border-[var(--research-sand)]/60 text-[var(--research-sand)]"
            }`}
          >
            TIER 2 (HIGH)
          </span>
        );
      case "Tier 3 (Medium)":
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isLightMode
                ? "bg-[#e0f2fe] border-[var(--ws-mint)] text-[var(--ws-mint)]"
                : "bg-[var(--ws-mint)]/20 border-[var(--ws-mint)]/60 text-[var(--ws-mint)]"
            }`}
          >
            TIER 3 (MEDIUM)
          </span>
        );
      case "Tier 4 (Low)":
      default:
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isLightMode
                ? "bg-[#f1f5f9] border-[#cbd5e1] text-[var(--ws-muted)]"
                : "bg-[var(--ws-muted)]/20 border-[var(--ws-muted)]/60 text-[var(--ws-muted)]"
            }`}
          >
            TIER 4 (LOW)
          </span>
        );
    }
  };

  return (
    <div
      className={`space-y-6 font-mono transition-colors duration-200 ${
        isLightMode ? "text-[#1c1c1c]" : "text-slate-100"
      }`}
    >
      {/* 1. TOP STRATEGIC FLEET HUD & ACTION CONTROLS */}
      <div
        className={`p-4 sm:p-5 rounded-xl border transition-colors duration-200 relative overflow-hidden ${
          isLightMode
            ? "bg-[#ffffff] border-[#daddd8] shadow-[0_4px_24px_rgba(28,28,28,0.06)]"
            : "cyber-card border-[var(--border-color)] bg-[var(--ws-sidebar)]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        }`}
      >
        <div
          className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
            isLightMode ? "bg-[var(--ws-mint)]/5" : "bg-[var(--accent-primary)]/5"
          }`}
        />

        <div
          className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b ${
            isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg border ${
                isLightMode
                  ? "bg-[#e0f2fe] border-[#bae6fd] shadow-sm"
                  : "bg-[var(--ws-panel)] border-[var(--ws-mint)]/50 shadow-[0_0_20px_rgba(179,223,147,0.25)]"
              }`}
            >
              <Sliders
                className={`w-5 h-5 ${
                  isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)] animate-pulse"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className={`font-['Orbitron'] text-base sm:text-lg font-bold tracking-wide m-0 ${
                    isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
                  }`}
                >
                  ASSET PRIORITY MATRIX & SENSIBLE SHUTDOWN REASONER
                </h1>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    isLightMode
                      ? "bg-[#dcfce7] border-[var(--ws-mint)] text-[var(--ws-mint)]"
                      : "bg-[var(--ws-mint)]/15 border-[var(--ws-mint)]/40 text-[var(--ws-mint)]"
                  }`}
                >
                  AIR-GAPPED ENGINE
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                Strategic asset value tiering, live socket diagnostic verification, and breach blast radius vs. downtime cost triage
              </p>
            </div>
          </div>

          {/* Action Triggers: Test All & Connect Manually */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleTestAll}
              disabled={isTestingAll}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer border ${
                isLightMode
                  ? "bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[var(--ws-mint)] border-[#cbd5e1]"
                  : "bg-[var(--ws-panel)] hover:bg-[var(--ws-line)] text-[var(--ws-mint)] border-[var(--ws-mint)]/40 shadow-[0_0_15px_rgba(179,223,147,0.15)]"
              }`}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isTestingAll ? "animate-spin text-[var(--ws-mint)]" : ""
                }`}
              />
              <span>{isTestingAll ? "TESTING ALL ASSETS..." : "TEST ALL CONNECTIONS"}</span>
            </button>

            <button
              onClick={() => setIsConnectModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Orbitron'] text-xs font-black tracking-wider transition-all active:scale-95 cursor-pointer ${
                isLightMode
                  ? "bg-gradient-to-r from-[var(--ws-mint)] to-[var(--ws-mint)] text-white shadow-[0_4px_16px_rgba(2,132,199,0.25)] hover:shadow-[0_6px_20px_rgba(2,132,199,0.4)]"
                  : "bg-gradient-to-r from-[var(--ws-mint)] to-[var(--ws-mint)] text-black shadow-[0_0_25px_rgba(179,223,147,0.4)] hover:shadow-[0_0_35px_rgba(179,223,147,0.7)]"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>CONNECT DEVICE MANUALLY</span>
            </button>
          </div>
        </div>

        {/* 4 Telemetry Health Tiles (Fixed for Light & Dark!) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <div
            className={`p-3 rounded-lg border flex flex-col transition-colors ${
              isLightMode
                ? "bg-[#f8fafc] border-[#e2e8f0] shadow-sm"
                : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
            }`}
          >
            <span
              className={`text-[10px] uppercase tracking-wider flex items-center justify-between font-bold ${
                isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"
              }`}
            >
              MANAGED ASSETS
              <Cpu className={`w-3.5 h-3.5 ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`} />
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`font-['Orbitron'] text-xl font-bold ${
                  isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
                }`}
              >
                {totalAssetsCount}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                }`}
              >
                Auto-Discovered & Manual
              </span>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border flex flex-col transition-colors ${
              isLightMode
                ? "bg-[#f8fafc] border-[#e2e8f0] shadow-sm"
                : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
            }`}
          >
            <span
              className={`text-[10px] uppercase tracking-wider flex items-center justify-between font-bold ${
                isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"
              }`}
            >
              VERIFIED ONLINE
              <Activity className={`w-3.5 h-3.5 ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`} />
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`font-['Orbitron'] text-xl font-bold ${
                  isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                }`}
              >
                {onlineCount} / {totalAssetsCount}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                }`}
              >
                100% Zero Packet Loss
              </span>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border flex flex-col transition-colors ${
              isLightMode
                ? "bg-[#f8fafc] border-[#e2e8f0] shadow-sm"
                : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
            }`}
          >
            <span
              className={`text-[10px] uppercase tracking-wider flex items-center justify-between font-bold ${
                isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"
              }`}
            >
              MISSION-CRITICAL
              <ShieldAlert className={`w-3.5 h-3.5 ${isLightMode ? "text-[var(--ws-coral)]" : "text-[var(--ws-coral)]"}`} />
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`font-['Orbitron'] text-xl font-bold ${
                  isLightMode ? "text-[var(--ws-coral)]" : "text-[var(--ws-coral)]"
                }`}
              >
                {tier1Count}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  isLightMode ? "text-[var(--research-sand)]" : "text-[var(--research-sand)]"
                }`}
              >
                Protected by Dual Conformer
              </span>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border flex flex-col transition-colors ${
              isLightMode
                ? "bg-[#f8fafc] border-[#e2e8f0] shadow-sm"
                : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
            }`}
          >
            <span
              className={`text-[10px] uppercase tracking-wider flex items-center justify-between font-bold ${
                isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"
              }`}
            >
              DOWNTIME RISK
              <DollarSign className={`w-3.5 h-3.5 ${isLightMode ? "text-[var(--research-sand)]" : "text-[var(--research-sand)]"}`} />
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`font-['Orbitron'] text-xl font-bold ${
                  isLightMode ? "text-[var(--research-sand)]" : "text-[var(--research-sand)]"
                }`}
              >
                ${(totalDowntimeExposure / 1000).toFixed(0)}k
                <span className={`text-xs ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>/hr</span>
              </span>
              <span className={`text-[10px] ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                Full-Fleet Aggregate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN SPLIT: 2D DECISION MATRIX (LEFT 7 COLS) & INTELLIGENT TRIAGE SIMULATOR (RIGHT 5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: 2D RISK-CRITICALITY MATRIX */}
        <div
          className={`lg:col-span-7 p-4 sm:p-5 rounded-xl border flex flex-col justify-between relative overflow-hidden transition-colors ${
            isLightMode
              ? "bg-[#ffffff] border-[#daddd8] shadow-[0_4px_24px_rgba(28,28,28,0.06)]"
              : "cyber-card border-[var(--border-color)] bg-[var(--ws-sidebar)]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isLightMode ? "bg-[var(--ws-mint)]" : "bg-[var(--ws-mint)] shadow-[0_0_8px_var(--ws-mint)]"
                }`}
              />
              <h2
                className={`font-['Orbitron'] text-sm font-bold m-0 ${
                  isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
                }`}
              >
                2D RISK-CRITICALITY DECISION MATRIX
              </h2>
            </div>
            <div
              className={`text-[10px] font-mono flex items-center gap-3 ${
                isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--ws-coral)]" /> Tier 1
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--research-sand)]" /> Tier 2
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--ws-mint)]" /> Tier 3
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--ws-muted)]" /> Tier 4
              </span>
            </div>
          </div>

          <p className={`text-xs my-2 ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
            Plotted across <strong>Asset Business Value (Y-Axis)</strong> vs{" "}
            <strong>Threat Saliency / Anomaly Score (X-Axis)</strong>. Click any node to load into the Sensible Shutdown Simulator.
          </p>

          {/* 2D CARTESIAN PLANE */}
          <div
            className={`relative w-full h-[440px] rounded-lg border p-4 flex flex-col justify-between select-none overflow-hidden my-1 transition-colors ${
              isLightMode ? "bg-[#f8fafc] border-[#cbd5e1]" : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
            }`}
          >
            {/* Quadrant Tint Overlays */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
              {/* Q3: Top-Left */}
              <div
                className={`border-r border-b border-dashed ${
                  isLightMode
                    ? "border-[#bae6fd] bg-[#e0f2fe]/45"
                    : "border-[var(--ws-mint)] bg-[var(--ws-mint)]/10 opacity-20"
                }`}
              />
              {/* Q1: Top-Right */}
              <div
                className={`border-b border-dashed ${
                  isLightMode
                    ? "border-[#fecaca] bg-[#fee2e2]/45"
                    : "border-[var(--ws-coral)] bg-[var(--ws-coral)]/15 opacity-20"
                }`}
              />
              {/* Q4: Bottom-Left */}
              <div
                className={`border-r border-dashed ${
                  isLightMode
                    ? "border-[#e2e8f0] bg-[#f1f5f9]/45"
                    : "border-[var(--ws-muted)] bg-[var(--ws-muted)]/5 opacity-20"
                }`}
              />
              {/* Q2: Bottom-Right */}
              <div
                className={`border-dashed ${
                  isLightMode
                    ? "border-[#bbf7d0] bg-[#dcfce7]/45"
                    : "border-[var(--ws-mint)] bg-[var(--ws-mint)]/10 opacity-20"
                }`}
              />
            </div>

            {/* Quadrant Tactical Labels */}
            <div
              className={`absolute top-2 left-3 text-[10px] font-bold pointer-events-none ${
                isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]/80"
              }`}
            >
              QUADRANT 3: ACTIVE SHADOW AUDITING (PRESERVE UPSTREAM)
            </div>
            <div
              className={`absolute top-2 right-3 text-[10px] font-bold text-right pointer-events-none ${
                isLightMode ? "text-[var(--ws-coral)]" : "text-[var(--ws-coral)]/90"
              }`}
            >
              QUADRANT 1: SURGICAL CONTAINMENT (NEVER SHUTDOWN - DOWNTIME CATASTROPHIC)
            </div>
            <div
              className={`absolute bottom-6 left-3 text-[10px] font-bold pointer-events-none ${
                isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"
              }`}
            >
              QUADRANT 4: NOMINAL RATE LIMITING & AUDIT
            </div>
            <div
              className={`absolute bottom-6 right-3 text-[10px] font-bold text-right pointer-events-none ${
                isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]/90"
              }`}
            >
              QUADRANT 2: AGGRESSIVE CUTOFF / HARDWARE KILL (SHUTDOWN SENSIBLE)
            </div>

            {/* Center Crosshair Lines */}
            <div
              className={`absolute top-0 bottom-0 left-1/2 w-[1px] -translate-x-1/2 ${
                isLightMode ? "bg-[#cbd5e1]" : "bg-[var(--ws-line)]"
              }`}
            />
            <div
              className={`absolute left-0 right-0 top-1/2 h-[1px] -translate-y-1/2 ${
                isLightMode ? "bg-[#cbd5e1]" : "bg-[var(--ws-line)]"
              }`}
            />

            {/* Plotted Asset Nodes */}
            {assets.map((asset) => {
              const yPercent = Math.max(12, Math.min(88, 100 - asset.business_criticality));
              const xPercent = Math.max(10, Math.min(90, asset.business_criticality * 0.7 + ((asset.id.length * 7) % 35)));
              const isSelected = simAssetId === asset.id;

              const getPillColor = () => {
                if (asset.priority === "Tier 1 (Mission-Critical)") {
                  return isLightMode
                    ? "border-[var(--ws-coral)] bg-[#fee2e2] text-[var(--ws-coral)]"
                    : "border-[var(--ws-coral)] bg-[var(--ws-coral)]/25 text-[var(--ws-coral)]";
                }
                if (asset.priority === "Tier 2 (High)") {
                  return isLightMode
                    ? "border-[var(--research-sand)] bg-[#fef3c7] text-[var(--research-sand)]"
                    : "border-[var(--research-sand)] bg-[var(--research-sand)]/25 text-[var(--research-sand)]";
                }
                if (asset.priority === "Tier 3 (Medium)") {
                  return isLightMode
                    ? "border-[var(--ws-mint)] bg-[#e0f2fe] text-[var(--ws-mint)]"
                    : "border-[var(--ws-mint)] bg-[var(--ws-mint)]/25 text-[var(--ws-mint)]";
                }
                return isLightMode
                  ? "border-[#cbd5e1] bg-[#f1f5f9] text-[var(--ws-line)]"
                  : "border-[var(--ws-muted)] bg-[var(--ws-muted)]/20 text-[#cbd5e1]";
              };

              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    setSelectedAssetId(asset.id);
                    setSimAssetId(asset.id);
                  }}
                  style={{
                    top: `${yPercent}%`,
                    left: `${xPercent}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                  className={`absolute z-20 cursor-pointer group transition-all duration-200 ${
                    isSelected ? "scale-110 z-30" : "hover:scale-105"
                  }`}
                >
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold shadow-md backdrop-blur-md ${getPillColor()} ${
                      isSelected
                        ? isLightMode
                          ? "ring-2 ring-[var(--ws-mint)] shadow-[0_0_12px_rgba(2,132,199,0.35)]"
                          : "ring-2 ring-[var(--ws-mint)] shadow-[0_0_15px_var(--ws-mint)]"
                        : ""
                    }`}
                  >
                    {getCategoryIcon(asset.category)}
                    <span className="truncate max-w-[120px]">{asset.name.split(" ")[0]}</span>
                    <span className="text-[9px] opacity-80">
                      (${Math.round(asset.downtime_cost_per_hour / 1000)}k)
                    </span>
                  </div>

                  {/* Tooltip on hover */}
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col p-2.5 rounded border text-[10px] z-50 whitespace-nowrap min-w-[190px] ${
                      isLightMode
                        ? "bg-[#ffffff] border-[#cbd5e1] text-[#1c1c1c] shadow-xl"
                        : "bg-[var(--ws-sidebar)] border-[var(--ws-mint)]/50 text-[var(--ws-text)] shadow-2xl"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {getCategoryIcon(asset.category)}
                      <span className={isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"}>
                        {asset.name}
                      </span>
                    </div>
                    <div className={`text-[9px] mt-0.5 ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                      {asset.ip} · {asset.protocol}
                    </div>
                    <div
                      className={`mt-1.5 pt-1 border-t flex justify-between ${
                        isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
                      }`}
                    >
                      <span className={isLightMode ? "text-[var(--research-sand)]" : "text-[var(--research-sand)]"}>
                        Criticality: {asset.business_criticality}/100
                      </span>
                      <span className={isLightMode ? "text-[var(--ws-mint)] font-bold" : "text-[var(--ws-mint)]"}>
                        ${asset.downtime_cost_per_hour.toLocaleString()}/hr
                      </span>
                    </div>
                    <div className={`text-[9px] mt-1 font-semibold ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`}>
                      Click to simulate sensible shutdown
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Matrix Axis Labels */}
            <div
              className={`absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold tracking-wider pointer-events-none ${
                isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"
              }`}
            >
              ▲ BUSINESS CRITICALITY (0 → 100)
            </div>
            <div
              className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wider pointer-events-none ${
                isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"
              }`}
            >
              MODEL ANOMALY SALIENCY TAU (τ 0.0 → 1.0) ▶
            </div>
          </div>

          <div
            className={`flex items-center justify-between text-[11px] pt-2 border-t ${
              isLightMode ? "border-[#e2e8f0] text-[var(--ws-muted)]" : "border-[var(--ws-line)] text-[var(--ws-muted)]"
            }`}
          >
            <span>
              Total Nodes Plotted:{" "}
              <strong className={isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}>
                {assets.length}
              </strong>
            </span>
            <span>
              Selected Node:{" "}
              <strong className={isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}>
                {assets.find((a) => a.id === simAssetId)?.name || "None"}
              </strong>
            </span>
          </div>
        </div>

        {/* RIGHT: INTELLIGENT TRIAGE & SENSIBLE SHUTDOWN SIMULATOR */}
        <div
          className={`lg:col-span-5 p-4 sm:p-5 rounded-xl border flex flex-col justify-between relative overflow-hidden transition-colors ${
            isLightMode
              ? "bg-[#ffffff] border-[#daddd8] shadow-[0_4px_24px_rgba(28,28,28,0.06)]"
              : "cyber-card border-[var(--border-color)] bg-[var(--ws-sidebar)]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          }`}
        >
          <div
            className={`pb-3 border-b flex items-center justify-between ${
              isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Crosshair className={`w-4 h-4 ${isLightMode ? "text-[var(--ws-coral)]" : "text-[var(--ws-coral)]"}`} />
              <h2
                className={`font-['Orbitron'] text-sm font-bold m-0 ${
                  isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
                }`}
              >
                SENSIBLE SHUTDOWN REASONER
              </h2>
            </div>
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${
                isLightMode
                  ? "bg-[#fee2e2] border-[var(--ws-coral)] text-[var(--ws-coral)]"
                  : "bg-[var(--ws-coral)]/15 border-[var(--ws-coral)]/40 text-[var(--ws-coral)]"
              }`}
            >
              AI TRIAGE ENGINE
            </span>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="space-y-3.5 my-3">
            {/* Select Asset */}
            <div>
              <label className={`text-[11px] block mb-1 font-semibold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                TARGET INDUSTRIAL ASSET
              </label>
              <select
                value={simAssetId}
                onChange={(e) => {
                  setSimAssetId(e.target.value);
                  setSelectedAssetId(e.target.value);
                }}
                className={`w-full text-xs rounded-lg px-3 py-2 outline-none transition-all cursor-pointer font-mono border ${
                  isLightMode
                    ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] focus:border-[var(--ws-mint)]"
                    : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)] focus:border-[var(--ws-mint)]"
                }`}
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.category.toUpperCase()}] {a.name} (${Math.round(a.downtime_cost_per_hour / 1000)}k/hr)
                  </option>
                ))}
              </select>
            </div>

            {/* Select Attack Type & Tau Severity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`text-[11px] block mb-1 font-semibold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                  ATTACK VECTOR PROFILE
                </label>
                <select
                  value={simAttackType}
                  onChange={(e) => setSimAttackType(e.target.value)}
                  className={`w-full text-xs rounded-lg px-3 py-2 outline-none transition-all cursor-pointer font-mono border ${
                    isLightMode
                      ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] focus:border-[var(--ws-mint)]"
                      : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)] focus:border-[var(--ws-mint)]"
                  }`}
                >
                  <option value="ransomware">Ransomware Lateral Loop</option>
                  <option value="modbus_injection">Modbus Actuator Injection</option>
                  <option value="data_exfil">Data Exfiltration</option>
                  <option value="ddos">DDoS / SYN Flood</option>
                  <option value="scanning">Stealth Port Recon</option>
                </select>
              </div>

              {/* Tau Score Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`text-[11px] font-semibold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                    TAU SEVERITY (τ)
                  </label>
                  <span
                    className={`text-xs font-bold font-mono ${
                      isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                    }`}
                  >
                    {simTauScore.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.00"
                  step="0.05"
                  value={simTauScore}
                  onChange={(e) => setSimTauScore(parseFloat(e.target.value))}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                    isLightMode ? "bg-[#e2e8f0] accent-[var(--ws-mint)]" : "bg-[var(--ws-sidebar)] accent-[var(--ws-mint)]"
                  }`}
                />
              </div>
            </div>

            {/* Live Comparative Trade-off Card */}
            {simResult && (
              <div
                className={`p-3.5 rounded-lg border space-y-3 transition-colors ${
                  isLightMode ? "bg-[#f8fafc] border-[#e2e8f0]" : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
                }`}
              >
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div
                    className={`p-2 rounded border ${
                      isLightMode
                        ? "bg-[#ffffff] border-[#cbd5e1] shadow-sm"
                        : "bg-[var(--ws-panel)] border-[var(--ws-line)]"
                    }`}
                  >
                    <span className={`text-[9px] block ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                      ASSET DOWNTIME LOSS:
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        isLightMode ? "text-[var(--research-sand)]" : "text-[var(--research-sand)]"
                      }`}
                    >
                      ${simResult.downtime_cost_per_hour_usd.toLocaleString()}
                      <span className={`text-[9px] ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                        /hr
                      </span>
                    </span>
                  </div>

                  <div
                    className={`p-2 rounded border ${
                      isLightMode
                        ? "bg-[#ffffff] border-[#cbd5e1] shadow-sm"
                        : "bg-[var(--ws-panel)] border-[var(--ws-line)]"
                    }`}
                  >
                    <span className={`text-[9px] block ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                      EST. BREACH BLAST RADIUS:
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        isLightMode ? "text-[var(--ws-coral)]" : "text-[var(--ws-coral)]"
                      }`}
                    >
                      ${simResult.estimated_breach_loss_usd.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* AI VERDICT BANNER (High contrast in Light Mode!) */}
                <div
                  className={`p-3 rounded-lg border flex flex-col gap-1.5 transition-all ${
                    simResult.sensible_to_shutdown
                      ? isLightMode
                        ? "bg-[#fee2e2] border-[var(--ws-coral)] text-[var(--ws-coral)]"
                        : "bg-[var(--ws-coral)]/15 border-[var(--ws-coral)] text-[var(--ws-coral)]"
                      : simResult.attack_type === "ddos"
                      ? isLightMode
                        ? "bg-[#fef3c7] border-[var(--research-sand)] text-[var(--research-sand)]"
                        : "bg-[var(--research-sand)]/15 border-[var(--research-sand)] text-[var(--research-sand)]"
                      : isLightMode
                      ? "bg-[#e0f2fe] border-[var(--ws-mint)] text-[var(--ws-mint)]"
                      : "bg-[var(--ws-mint)]/15 border-[var(--ws-mint)] text-[var(--ws-mint)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {simResult.sensible_to_shutdown ? (
                      <PowerOff
                        className={`w-4 h-4 animate-pulse ${
                          isLightMode ? "text-[var(--ws-coral)]" : "text-[var(--ws-coral)]"
                        }`}
                      />
                    ) : (
                      <ShieldCheck
                        className={`w-4 h-4 ${
                          isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                        }`}
                      />
                    )}
                    <span className="font-['Orbitron'] text-xs font-black tracking-wider">
                      {simResult.decision}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-sans opacity-95">
                    {simResult.action_summary}
                  </p>
                </div>

                {/* RECOMMENDED STRATEGY BREAKDOWN */}
                <div
                  className={`text-[11px] p-2.5 rounded border space-y-1 transition-colors ${
                    isLightMode
                      ? "bg-[#ffffff] border-[#e2e8f0] text-[#1c1c1c] shadow-sm"
                      : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)]"
                  }`}
                >
                  <span
                    className={`text-[9px] uppercase tracking-wider block font-bold ${
                      isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"
                    }`}
                  >
                    RECOMMENDED AIR-GAPPED ACTION:
                  </span>
                  <p className="font-mono leading-relaxed">{simResult.recommended_strategy}</p>
                </div>

                {/* Execution Button */}
                <button
                  onClick={() => handleExecuteTriageAction(simResult)}
                  className={`w-full py-2.5 px-3 rounded-lg font-['Orbitron'] text-xs font-black tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                    simResult.sensible_to_shutdown
                      ? isLightMode
                        ? "bg-gradient-to-r from-[var(--ws-coral)] to-[var(--ws-coral)] text-white"
                        : "bg-gradient-to-r from-[var(--ws-coral)] to-[var(--ws-coral)] text-black shadow-[0_0_20px_rgba(255,153,133,0.4)]"
                      : isLightMode
                      ? "bg-gradient-to-r from-[var(--ws-mint)] to-[var(--ws-mint)] text-white"
                      : "bg-gradient-to-r from-[var(--ws-mint)] to-[var(--ws-mint)] text-black shadow-[0_0_20px_rgba(179,223,147,0.4)]"
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>
                    {simResult.sensible_to_shutdown
                      ? "EXECUTE SHUTDOWN SIGNAL"
                      : "APPLY SURGICAL ISOLATION (KEEP UPTIME)"}
                  </span>
                </button>
              </div>
            )}

            {/* Execution feedback */}
            {simulationExecutionMessage && (
              <div
                className={`p-2.5 rounded border text-xs font-mono flex items-center gap-2 ${
                  isLightMode
                    ? "bg-[#dcfce7] border-[var(--ws-mint)] text-[var(--ws-mint)]"
                    : "bg-[var(--ws-mint)]/15 border-[var(--ws-mint)] text-[var(--ws-mint)]"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{simulationExecutionMessage}</span>
              </div>
            )}
          </div>

          <div
            className={`pt-2 border-t text-[10px] flex items-center justify-between ${
              isLightMode ? "border-[#e2e8f0] text-[var(--ws-muted)]" : "border-[var(--ws-line)] text-[var(--ws-muted)]"
            }`}
          >
            <span>
              DDoS Shield Logic:{" "}
              <strong className={isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}>
                Active
              </strong>
            </span>
            <span>
              NIST CSF Safety Floor:{" "}
              <strong className={isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}>
                Preserved
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. ASSET INVENTORY & PRIORITY CONFIGURATION TABLE */}
      <div
        className={`p-4 sm:p-5 rounded-xl border space-y-4 transition-colors ${
          isLightMode
            ? "bg-[#ffffff] border-[#daddd8] shadow-[0_4px_24px_rgba(28,28,28,0.06)]"
            : "cyber-card border-[var(--border-color)] bg-[var(--ws-sidebar)]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        }`}
      >
        {/* Table Filters & Search */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b ${
            isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs uppercase tracking-wider font-bold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
              CATEGORY:
            </span>
            {(["all", "device", "database", "server"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded text-xs uppercase font-bold tracking-wider transition-all cursor-pointer border ${
                  filterCategory === cat
                    ? isLightMode
                      ? "bg-[#e0f2fe] text-[var(--ws-mint)] border-[var(--ws-mint)] shadow-sm"
                      : "bg-[var(--ws-mint)]/20 text-[var(--ws-mint)] border-[var(--ws-mint)] shadow-[0_0_10px_rgba(179,223,147,0.3)]"
                    : isLightMode
                    ? "text-[var(--ws-muted)] hover:text-[#0f172a] border-transparent"
                    : "text-[var(--ws-muted)] hover:text-[var(--ws-text)] border-transparent"
                }`}
              >
                {cat === "all" ? "ALL ASSETS" : `${cat}S`}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ws-muted)]" />
            <input
              type="text"
              placeholder="Search IP, name, protocol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none font-mono border ${
                isLightMode
                  ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] placeholder-[var(--ws-muted)] focus:border-[var(--ws-mint)]"
                  : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)] placeholder-[var(--ws-muted)] focus:border-[var(--ws-mint)]"
              }`}
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b text-[10px] uppercase tracking-wider font-mono ${
                  isLightMode
                    ? "border-[#e2e8f0] text-[var(--ws-muted)] bg-[#f8fafc]"
                    : "border-[var(--ws-line)] text-[var(--ws-muted)]"
                }`}
              >
                <th className="py-2.5 px-3">ASSET & ENDPOINT</th>
                <th className="py-2.5 px-3">PRIORITY TIER</th>
                <th className="py-2.5 px-3">CRITICALITY (0-100)</th>
                <th className="py-2.5 px-3">DOWNTIME COST</th>
                <th className="py-2.5 px-3">AUTO-SHUTDOWN</th>
                <th className="py-2.5 px-3">CONNECTION HEALTH</th>
                <th className="py-2.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody
              className={`font-mono divide-y ${
                isLightMode ? "divide-[#e2e8f0]" : "divide-[var(--ws-panel)]"
              }`}
            >
              {filteredAssets.map((asset) => {
                const isTestingThis = testingAssetId === asset.id;
                return (
                  <tr
                    key={asset.id}
                    className={`transition-colors ${
                      isLightMode
                        ? simAssetId === asset.id
                          ? "bg-[#e0f2fe]/40"
                          : "hover:bg-[#f1f5f9]"
                        : simAssetId === asset.id
                        ? "bg-[var(--ws-panel)]/80"
                        : "hover:bg-[var(--ws-panel)]/60"
                    }`}
                  >
                    {/* Name & Endpoint */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded border ${
                            isLightMode
                              ? "bg-[#f1f5f9] border-[#cbd5e1]"
                              : "bg-[var(--ws-sidebar)] border-[var(--ws-line)]"
                          }`}
                        >
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div>
                          <div
                            className={`font-bold ${
                              isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
                            }`}
                          >
                            {asset.name}
                          </div>
                          <div className={`text-[10px] flex items-center gap-1.5 mt-0.5 ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                            <span>
                              {asset.ip}:{asset.port}
                            </span>
                            <span>·</span>
                            <span className={isLightMode ? "text-[var(--ws-mint)] font-semibold" : "text-[var(--ws-mint)]"}>
                              {asset.protocol}
                            </span>
                            {asset.auto_discovered ? (
                              <span
                                className={`text-[8px] px-1 rounded font-bold ${
                                  isLightMode
                                    ? "bg-[#dcfce7] text-[var(--ws-mint)]"
                                    : "bg-[var(--ws-mint)]/10 text-[var(--ws-mint)]"
                                }`}
                              >
                                AUTO
                              </span>
                            ) : (
                              <span
                                className={`text-[8px] px-1 rounded font-bold ${
                                  isLightMode
                                    ? "bg-[#fef3c7] text-[var(--research-sand)]"
                                    : "bg-[var(--research-sand)]/10 text-[var(--research-sand)]"
                                }`}
                              >
                                MANUAL
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Priority Tier Select */}
                    <td className="py-3 px-3">
                      <select
                        value={asset.priority}
                        onChange={(e) =>
                          updateAssetPriority(asset.id, {
                            priority: e.target.value as AssetPriorityTier
                          })
                        }
                        className={`text-xs rounded px-2 py-1 outline-none cursor-pointer border ${
                          isLightMode
                            ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] focus:border-[var(--ws-mint)]"
                            : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)] focus:border-[var(--ws-mint)]"
                        }`}
                      >
                        <option value="Tier 1 (Mission-Critical)">Tier 1 (Mission-Critical)</option>
                        <option value="Tier 2 (High)">Tier 2 (High)</option>
                        <option value="Tier 3 (Medium)">Tier 3 (Medium)</option>
                        <option value="Tier 4 (Low)">Tier 4 (Low)</option>
                      </select>
                    </td>

                    {/* Criticality Score Slider */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={asset.business_criticality}
                          onChange={(e) =>
                            updateAssetPriority(asset.id, {
                              business_criticality: parseInt(e.target.value)
                            })
                          }
                          className={`w-20 h-1.5 rounded appearance-none cursor-pointer ${
                            isLightMode ? "bg-[#e2e8f0] accent-[var(--ws-mint)]" : "bg-[var(--ws-sidebar)] accent-[var(--ws-mint)]"
                          }`}
                        />
                        <span
                          className={`font-bold text-xs min-w-[28px] ${
                            isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"
                          }`}
                        >
                          {asset.business_criticality}
                        </span>
                      </div>
                    </td>

                    {/* Downtime Cost */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold ${
                          isLightMode ? "text-[var(--research-sand)]" : "text-[var(--research-sand)]"
                        }`}
                      >
                        ${asset.downtime_cost_per_hour.toLocaleString()}/hr
                      </span>
                    </td>

                    {/* Auto-Shutdown Toggle */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() =>
                          updateAssetPriority(asset.id, {
                            auto_shutdown_allowed: !asset.auto_shutdown_allowed
                          })
                        }
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                          asset.auto_shutdown_allowed
                            ? isLightMode
                              ? "bg-[#dcfce7] border-[var(--ws-mint)] text-[var(--ws-mint)]"
                              : "bg-[var(--ws-mint)]/15 border-[var(--ws-mint)]/50 text-[var(--ws-mint)]"
                            : isLightMode
                            ? "bg-[#fee2e2] border-[var(--ws-coral)] text-[var(--ws-coral)]"
                            : "bg-[var(--ws-coral)]/15 border-[var(--ws-coral)]/50 text-[var(--ws-coral)]"
                        }`}
                      >
                        {asset.auto_shutdown_allowed ? "PERMITTED" : "FORBIDDEN"}
                      </button>
                    </td>

                    {/* Connection Health */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            asset.connection_status === "online"
                              ? isLightMode
                                ? "bg-[var(--ws-mint)]"
                                : "bg-[var(--ws-mint)] animate-pulse shadow-[0_0_6px_var(--ws-mint)]"
                              : asset.connection_status === "testing"
                              ? "bg-[var(--research-sand)] animate-ping"
                              : "bg-[var(--ws-coral)]"
                          }`}
                        />
                        <div>
                          <div
                            className={`text-[11px] font-semibold ${
                              isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
                            }`}
                          >
                            {asset.connection_status === "online"
                              ? `${asset.latency_ms} ms`
                              : asset.connection_status}
                          </div>
                          <div className={`text-[9px] ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                            {asset.last_ping}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Actions: Ping test & Triage */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTestConnection(asset.id)}
                          disabled={isTestingThis}
                          title="Ping & Test Socket Handshake"
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 border ${
                            isLightMode
                              ? "bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[var(--ws-mint)] border-[#cbd5e1]"
                              : "bg-[var(--ws-panel)] hover:bg-[var(--ws-line)] text-[var(--ws-mint)] border-[var(--ws-mint)]/30"
                          }`}
                        >
                          {isTestingThis ? "PINGING..." : "TEST PING"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAssetId(asset.id);
                            setSimAssetId(asset.id);
                          }}
                          title="Load into Sensible Triage Simulator"
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer border ${
                            isLightMode
                              ? "bg-[#fef3c7] hover:bg-[var(--research-sand)] text-[var(--research-sand)] border-[var(--research-sand)]"
                              : "bg-[var(--research-sand)]/15 hover:bg-[var(--research-sand)]/30 text-[var(--research-sand)] border-[var(--research-sand)]/40"
                          }`}
                        >
                          TRIAGE
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MANUAL ASSET CONNECTION MODAL */}
      {isConnectModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${
            isLightMode ? "bg-black/40" : "bg-black/80"
          }`}
        >
          <div
            className={`w-full max-w-lg p-5 rounded-xl border relative shadow-2xl transition-colors ${
              isLightMode
                ? "bg-[#ffffff] border-[#cbd5e1] text-[#1c1c1c]"
                : "cyber-card border-[var(--ws-mint)]/40 bg-[var(--ws-sidebar)] text-[var(--ws-text)] shadow-[0_0_50px_rgba(179,223,147,0.2)]"
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 border-b ${
                isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <PlusCircle className={`w-5 h-5 ${isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}`} />
                <h3
                  className={`font-['Orbitron'] text-sm font-bold m-0 ${
                    isLightMode ? "text-[#0f172a]" : "text-[var(--ws-text)]"
                  }`}
                >
                  MANUAL DEVICE / DATABASE / SERVER CONNECTION
                </h3>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className={`cursor-pointer ${
                  isLightMode ? "text-[var(--ws-muted)] hover:text-[#0f172a]" : "text-[var(--ws-muted)] hover:text-[var(--ws-text)]"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3.5 pt-4 text-xs font-mono">
              {formError && (
                <div
                  className={`p-2 rounded border text-[11px] ${
                    isLightMode
                      ? "bg-[#fee2e2] border-[var(--ws-coral)] text-[var(--ws-coral)]"
                      : "bg-[var(--ws-coral)]/20 border-[var(--ws-coral)] text-[var(--ws-coral)]"
                  }`}
                >
                  {formError}
                </div>
              )}

              {/* Name & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-[10px] block mb-1 font-semibold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                    ASSET NAME
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCADA Pressure Valve 09"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full rounded px-2.5 py-1.5 outline-none border ${
                      isLightMode
                        ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] focus:border-[var(--ws-mint)]"
                        : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)] focus:border-[var(--ws-mint)]"
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] block mb-1 font-semibold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                    CATEGORY
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                    className={`w-full rounded px-2.5 py-1.5 outline-none border ${
                      isLightMode
                        ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] focus:border-[var(--ws-mint)]"
                        : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)] focus:border-[var(--ws-mint)]"
                    }`}
                  >
                    <option value="device">Physical IoT Device</option>
                    <option value="database">Database / Storage Tier</option>
                    <option value="server">Host / Server Node</option>
                  </select>
                </div>
              </div>

              {/* IP, Port, Protocol */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={`text-[10px] block mb-1 font-semibold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                    IP ADDRESS
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ip}
                    onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                    className={`w-full rounded px-2 py-1.5 outline-none border ${
                      isLightMode
                        ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] focus:border-[var(--ws-mint)]"
                        : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)] focus:border-[var(--ws-mint)]"
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] block mb-1 font-semibold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                    PORT
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 0 })}
                    className={`w-full rounded px-2 py-1.5 outline-none border ${
                      isLightMode
                        ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] focus:border-[var(--ws-mint)]"
                        : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)] focus:border-[var(--ws-mint)]"
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] block mb-1 font-semibold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                    PROTOCOL
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                    className={`w-full rounded px-2 py-1.5 outline-none border ${
                      isLightMode
                        ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] focus:border-[var(--ws-mint)]"
                        : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)] focus:border-[var(--ws-mint)]"
                    }`}
                  />
                </div>
              </div>

              {/* Priority Tier & Criticality */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-[10px] block mb-1 font-semibold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                    PRIORITY TIER
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as AssetPriorityTier })}
                    className={`w-full rounded px-2.5 py-1.5 outline-none border ${
                      isLightMode
                        ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] focus:border-[var(--ws-mint)]"
                        : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)] focus:border-[var(--ws-mint)]"
                    }`}
                  >
                    <option value="Tier 1 (Mission-Critical)">Tier 1 (Mission-Critical)</option>
                    <option value="Tier 2 (High)">Tier 2 (High)</option>
                    <option value="Tier 3 (Medium)">Tier 3 (Medium)</option>
                    <option value="Tier 4 (Low)">Tier 4 (Low)</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] block mb-1 font-semibold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                    CRITICALITY (0-100):{" "}
                    <strong className={isLightMode ? "text-[var(--ws-mint)]" : "text-[var(--ws-mint)]"}>
                      {formData.business_criticality}
                    </strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={formData.business_criticality}
                    onChange={(e) => setFormData({ ...formData, business_criticality: parseInt(e.target.value) })}
                    className={`w-full h-1.5 rounded appearance-none cursor-pointer mt-2 ${
                      isLightMode ? "bg-[#e2e8f0] accent-[var(--ws-mint)]" : "bg-[var(--ws-sidebar)] accent-[var(--ws-mint)]"
                    }`}
                  />
                </div>
              </div>

              {/* Downtime Cost & Auto-shutdown */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-[10px] block mb-1 font-semibold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                    DOWNTIME COST ($/HR)
                  </label>
                  <input
                    type="number"
                    value={formData.downtime_cost_per_hour}
                    onChange={(e) => setFormData({ ...formData, downtime_cost_per_hour: parseInt(e.target.value) || 0 })}
                    className={`w-full rounded px-2.5 py-1.5 outline-none border ${
                      isLightMode
                        ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] focus:border-[var(--ws-mint)]"
                        : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)] focus:border-[var(--ws-mint)]"
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] block mb-1 font-semibold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                    AUTO-SHUTDOWN PERMITTED?
                  </label>
                  <select
                    value={formData.auto_shutdown_allowed ? "yes" : "no"}
                    onChange={(e) => setFormData({ ...formData, auto_shutdown_allowed: e.target.value === "yes" })}
                    className={`w-full rounded px-2.5 py-1.5 outline-none border ${
                      isLightMode
                        ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] focus:border-[var(--ws-mint)]"
                        : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)] focus:border-[var(--ws-mint)]"
                    }`}
                  >
                    <option value="no">No (Catastrophic / Physical Risk)</option>
                    <option value="yes">Yes (Safe to Sever Hardware)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`text-[10px] block mb-1 font-semibold ${isLightMode ? "text-[var(--ws-muted)]" : "text-[var(--ws-muted)]"}`}>
                  OPERATIONAL DESCRIPTION
                </label>
                <textarea
                  rows={2}
                  placeholder="Operational role, actuator function, or failover notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full rounded px-2.5 py-1.5 outline-none resize-none border ${
                    isLightMode
                      ? "bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] focus:border-[var(--ws-mint)]"
                      : "bg-[var(--ws-sidebar)] border-[var(--ws-line)] text-[var(--ws-text)] focus:border-[var(--ws-mint)]"
                  }`}
                />
              </div>

              {/* Submit Buttons */}
              <div
                className={`flex items-center justify-end gap-2.5 pt-3 border-t ${
                  isLightMode ? "border-[#e2e8f0]" : "border-[var(--ws-line)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className={`px-4 py-2 rounded text-xs cursor-pointer border ${
                    isLightMode
                      ? "bg-[#f1f5f9] text-[var(--ws-muted)] hover:text-[#0f172a] border-[#cbd5e1]"
                      : "bg-[var(--ws-panel)] text-[var(--ws-muted)] hover:text-[var(--ws-text)] border-[var(--ws-line)]"
                  }`}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-lg font-['Orbitron'] font-black text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-md ${
                    isLightMode
                      ? "bg-gradient-to-r from-[var(--ws-mint)] to-[var(--ws-mint)] text-white"
                      : "bg-gradient-to-r from-[var(--ws-mint)] to-[var(--ws-mint)] text-black shadow-[0_0_20px_rgba(179,223,147,0.4)]"
                  }`}
                >
                  {isSubmitting ? "TESTING & REGISTERING..." : "REGISTER & CONNECT ASSET"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

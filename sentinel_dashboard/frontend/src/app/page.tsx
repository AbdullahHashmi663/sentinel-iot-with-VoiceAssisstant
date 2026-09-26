// ==============================================================================
// SENTINEL-IOT: MASTER SOC DASHBOARD (ENTERPRISE PRODUCTION EDITION)
// Version 2.4 - Bahria University, Islamabad Campus - FYP-II
// ==============================================================================

"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import VoiceCopilot from "@/components/VoiceCopilot";
import TelemetryControls from "@/components/TelemetryControls";
import AttackSimulator from "@/components/AttackSimulator";
import HostMonitorHUD from "@/components/HostMonitorHUD";
import ResearchModal from "@/components/ResearchModal";
import BottomNavDock from "@/components/BottomNavDock";
import LivePacketSnifferDrawer from "@/components/LivePacketSnifferDrawer";
import AgenticSocAnalystModal from "@/components/AgenticSocAnalystModal";
import SOARPlaybookBuilder from "@/components/SOARPlaybookBuilder";

// The 6 Master Consoles (Section 5)
import OverviewConsole from "@/components/consoles/OverviewConsole";
import ThreatLabConsole from "@/components/consoles/ThreatLabConsole";
import XaiConsole from "@/components/consoles/XaiConsole";
import AdversarialConsole from "@/components/consoles/AdversarialConsole";
import RemediationConsole from "@/components/consoles/RemediationConsole";
import ComplianceConsole from "@/components/consoles/ComplianceConsole";

// Circuit Board Component for Embedded PCB Execution
import { CircuitBoard, CircuitNode, CircuitConnection } from "@/components/ui/circuit-board";
import {
  Network,
  Radio,
  Server,
  Sliders,
  Layers,
  Cpu,
  Zap,
  ShieldAlert,
  Crosshair,
  ShieldCheck,
  FileCheck
} from "lucide-react";

import { useTelemetryStore } from "@/store/useTelemetryStore";
import { mockTelemetry } from "@/services/mockTelemetryService";
import { TelemetryEvent } from "@/types/sentinel";

const WS_URL = "ws://127.0.0.1:8000/ws/telemetry";
const BACKEND_HTTP = "http://127.0.0.1:8000";

export default function MasterDashboardPage() {
  const [theme, setTheme] = useState<string>("cyberpunk");
  const [isResearchOpen, setIsResearchOpen] = useState<boolean>(false);

  // Zustand Global Store State
  const {
    activeConsole,
    activeDomain,
    setActiveDomain,
    isMockMode,
    setIsConnected,
    addEvent,
    events,
    latestEvent,
    isLockdownActive,
    tickInterlock,
    isPacketSnifferOpen,
    closePacketSniffer,
    isAgenticSocOpen,
    agenticIncident,
    closeAgenticSoc,
    isSoarBuilderOpen,
    closeSoarBuilder
  } = useTelemetryStore();

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // --------------------------------------------------------------------------
  // TIMER TICK FOR INTERLOCK COUNTDOWN
  // --------------------------------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      tickInterlock();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickInterlock]);

  // --------------------------------------------------------------------------
  // WEBSOCKET OR OFFLINE MOCK INGESTION LIFECYCLE
  // --------------------------------------------------------------------------
  useEffect(() => {
    let unmounted = false;

    if (isMockMode) {
      // Offline Mock Telemetry mode active
      mockTelemetry.setActiveDomain(activeDomain);
      mockTelemetry.start(1600);
      const unsubscribe = mockTelemetry.onTelemetry((evt) => {
        if (!unmounted) addEvent(evt);
      });

      return () => {
        unmounted = true;
        mockTelemetry.stop();
        unsubscribe();
      };
    }

    // Live WebSocket connection to FastAPI backend
    const connectWs = () => {
      if (unmounted) return;
      try {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          if (unmounted) return;
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          if (unmounted) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "TELEMETRY_UPDATE") {
              const d = msg.data;
              const formattedEvent: TelemetryEvent = {
                id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                timestamp: new Date().toISOString(),
                domain: activeDomain,
                deviceId: `${activeDomain.toLowerCase()}_node_01`,
                sourceIp: d.source_ip || "192.168.100.45",
                targetIp: "192.168.100.1",
                processId: d.process_id,
                features: d.raw_features || [],
                anomalyProbability: d.inference?.anomaly_score || 0.05,
                isAnomaly: d.inference?.is_anomaly || false,
                severity: d.inference?.is_anomaly ? "CRITICAL" : "NORMAL",
                predictedClass: (d.inference?.attack_class?.toLowerCase() as any) || "normal",
                confidence: d.inference?.confidence || 0.95,
                saliencyTopFeatures: (d.inference?.saliency_top_features || []).map((f: any) => ({
                  featureName: f.feature,
                  importanceScore: f.importance
                })),
                xaiLatencyMs: d.inference?.xai_latency_ms || 0.78,
                remediationStatus: d.mitigation?.remediation_status || "NONE",
                remediationAction: d.mitigation?.remediation_action || "Baseline Verified",
                mttrLatencyMs: d.mitigation?.mttr_latency_ms || 21.5,
                compliance: {
                  nistControlId: d.mitigation?.nist_control || "AU-9",
                  nistControlName: d.mitigation?.nist_name || "Audit Protection",
                  isoControlId: d.mitigation?.iso_control || "A.12.4.3",
                  auditBlockHash: "7f01a9b4c12d8e33"
                }
              };

              addEvent(formattedEvent);
            }
          } catch (err) {
            console.error("[WS Parse Error]", err);
          }
        };

        ws.onerror = () => {
          setIsConnected(false);
        };

        ws.onclose = () => {
          if (unmounted) return;
          setIsConnected(false);
          reconnectTimeoutRef.current = setTimeout(connectWs, 3000);
        };

        socketRef.current = ws;
      } catch (err) {
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(connectWs, 3000);
      }
    };

    connectWs();

    // If initial events queue is empty, generate an initial batch so the dashboard is immediately populated
    if (events.length === 0) {
      for (let i = 0; i < 5; i++) {
        addEvent(mockTelemetry.generateSyntheticEvent());
      }
    }

    return () => {
      unmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [isMockMode, activeDomain, addEvent, setIsConnected]);

  // --------------------------------------------------------------------------
  // CIRCUIT BOARD ARCHITECTURE EMBEDDED TOPOLOGY
  // --------------------------------------------------------------------------
  const [selectedCircuitNode, setSelectedCircuitNode] = useState<string>("conformer_core");

  const circuitNodes: CircuitNode[] = [
    { id: "net_flows", x: 135, y: 110, label: "Network PCAP / Zeek", sublabel: "TCP/UDP/Modbus", icon: <Network className="w-3.5 h-3.5" />, status: "active", color: "#00f3ff" },
    { id: "iot_sensors", x: 135, y: 260, label: "Physical IoT Telemetry", sublabel: "7 Sensor Domains", icon: <Radio className="w-3.5 h-3.5" />, status: "active", color: "#00f3ff" },
    { id: "host_os", x: 135, y: 410, label: "Host OS Telemetry", sublabel: "Auditd / WinEvent", icon: <Server className="w-3.5 h-3.5" />, status: "active", color: "#00f3ff" },
    { id: "minmax_scaler", x: 380, y: 190, label: "MinMax Scaler", sublabel: "Leakage-Free [0, 1]", icon: <Sliders className="w-3.5 h-3.5" />, status: "nominal", color: "#38bdf8" },
    { id: "sliding_buffer", x: 380, y: 340, label: "10-Step Sliding Buffer", sublabel: "Tensor [B, 10, D]", icon: <Layers className="w-3.5 h-3.5" />, status: "nominal", color: "#38bdf8" },
    { id: "conformer_core", x: 630, y: 220, label: "Google Conformer Core", sublabel: "MHSA + Conv1D", icon: <Cpu className="w-3.5 h-3.5" />, status: "active", color: "#fcee0a" },
    { id: "saliency_xai", x: 630, y: 380, label: "Saliency Gradient XAI", sublabel: "0.78 ms Attribution", icon: <Zap className="w-3.5 h-3.5" />, status: "nominal", color: "#00ff66" },
    { id: "binary_head", x: 880, y: 160, label: "Head 1: Zero-Day Anomaly", sublabel: "Sigmoid (τ > 0.85)", icon: <ShieldAlert className="w-3.5 h-3.5" />, status: "critical", color: "#ff0055" },
    { id: "forensic_head", x: 880, y: 330, label: "Head 2: Forensic Classifier", sublabel: "Softmax Attack Profile", icon: <Crosshair className="w-3.5 h-3.5" />, status: "warning", color: "#ff7700" },
    { id: "wazuh_mitigation", x: 1125, y: 180, label: "Wazuh Active Response", sublabel: "iptables DROP & kill -9", icon: <ShieldCheck className="w-3.5 h-3.5" />, status: "critical", color: "#ff0055" },
    { id: "grc_governance", x: 1125, y: 350, label: "GRC Compliance Engine", sublabel: "NIST SP 800-53 / ISO 27001", icon: <FileCheck className="w-3.5 h-3.5" />, status: "nominal", color: "#00ff66" }
  ];

  const circuitConnections: CircuitConnection[] = [
    { from: "net_flows", to: "minmax_scaler", animated: true, color: "#00f3ff" },
    { from: "iot_sensors", to: "minmax_scaler", animated: true, color: "#00f3ff" },
    { from: "host_os", to: "sliding_buffer", animated: true, color: "#00f3ff" },
    { from: "minmax_scaler", to: "sliding_buffer", animated: true, color: "#38bdf8" },
    { from: "sliding_buffer", to: "conformer_core", animated: true, color: "#fcee0a" },
    { from: "conformer_core", to: "binary_head", animated: true, color: "#ff0055" },
    { from: "conformer_core", to: "forensic_head", animated: true, color: "#ff7700" },
    { from: "conformer_core", to: "saliency_xai", animated: true, color: "#00ff66" },
    { from: "binary_head", to: "wazuh_mitigation", animated: true, color: "#ff0055" },
    { from: "forensic_head", to: "wazuh_mitigation", animated: true, color: "#ff7700" },
    { from: "binary_head", to: "grc_governance", animated: true, color: "#00ff66" },
    { from: "forensic_head", to: "grc_governance", animated: true, color: "#00ff66" }
  ];

  return (
    <div className="min-h-screen flex flex-col space-y-4 pb-32 selection:bg-[var(--accent-primary)] selection:text-black">
      
      {/* 1. MASTER PERSISTENT HEADER (SECTION 5.1 & T-02) */}
      <Header
        theme={theme}
        setTheme={setTheme}
        onOpenResearch={() => setIsResearchOpen(true)}
      />

      {/* 2. MAIN VIEW CONTAINER (SPACIOUS SCI-FI FUI LAYOUT) */}
      <main className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-8">
        
        {/* AUTONOMOUS CONTINUOUS VOICE COPILOT (SECTION 9) */}
        <VoiceCopilot />

        {/* TELEMETRY TRANSPORT & BUFFER HUD */}
        <TelemetryControls />

        {/* ACTIVE CONSOLE ROUTING */}
        {activeConsole === "overview" && <OverviewConsole />}
        
        {activeConsole === "threat_lab" && (
          <div className="space-y-4">
            <ThreatLabConsole />
            <AttackSimulator />
          </div>
        )}

        {activeConsole === "xai" && <XaiConsole />}

        {activeConsole === "adversarial" && <AdversarialConsole />}

        {activeConsole === "remediation" && (
          <div className="space-y-4">
            <RemediationConsole />
            <HostMonitorHUD />
          </div>
        )}

        {activeConsole === "compliance" && <ComplianceConsole />}

        {/* CIRCUIT BOARD FULL SYSTEM ARCHITECTURE TOPOLOGY */}
        {activeConsole === "execute" && (
          <div className="cyber-card p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="font-['Orbitron'] font-bold text-sm text-[var(--text-primary)]">
                  FULL-SYSTEM PCB TRACE & NEURAL HARDWARE TOPOLOGY
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-['Space_Grotesk']">
                  Interactive Circuit Board: Ingestion Sensors → Conformer Core → Dual Heads → Wazuh Active Response
                </p>
              </div>
              <div className="text-xs font-['JetBrains_Mono'] text-[var(--brand-cyan)]">
                Selected Node: {selectedCircuitNode.toUpperCase()}
              </div>
            </div>

            {/* RESPONSIVE CIRCUIT BOARD CANVAS CONTAINER (100% SPREAD) */}
            <div className="w-full overflow-x-auto pb-3 pt-1">
              <div className="w-full">
                <CircuitBoard
                  nodes={circuitNodes.map((n) => ({
                    ...n,
                    color: selectedCircuitNode === n.id ? "var(--accent-primary)" : n.color
                  }))}
                  connections={circuitConnections}
                  width={1260}
                  height={560}
                  showGrid={true}
                  pulseSpeed={2.0}
                  traceWidth={2.2}
                  className="w-full"
                  onNodeClick={(id) => setSelectedCircuitNode(id)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-['JetBrains_Mono'] text-[var(--text-muted)] px-3 pt-2 border-t border-[var(--border-color)]/40">
              <span>[STAGE 1: MULTI-DOMAIN TELEMETRY]</span>
              <span>[STAGE 2: PREPROCESSING & SLIDING BUFFER]</span>
              <span>[STAGE 3: CONFORMER CORE & SALIENCY XAI]</span>
              <span>[STAGE 4: DUAL INFERENCE HEADS]</span>
              <span>[STAGE 5: AUTONOMOUS ACTIVE MITIGATION & GRC]</span>
            </div>
          </div>
        )}

      </main>

      {/* RESEARCH GALLERY MODAL (11 FIGURES & CONFUSION MATRICES) */}
      <ResearchModal
        isOpen={isResearchOpen}
        onClose={() => setIsResearchOpen(false)}
      />

      {/* LIVE HARDWARE PACKET SNIFFER DRAWER (IDEA 3) */}
      <LivePacketSnifferDrawer
        isOpen={isPacketSnifferOpen}
        onClose={closePacketSniffer}
      />

      {/* AGENTIC SOC TIER-2/3 ANALYST MODAL (IDEA 4) */}
      <AgenticSocAnalystModal
        isOpen={isAgenticSocOpen}
        onClose={closeAgenticSoc}
        incident={agenticIncident || latestEvent}
      />

      {/* STANDALONE SOAR BUILDER MODAL IF TRIGGERED (IDEA 2) */}
      {isSoarBuilderOpen && (
        <SOARPlaybookBuilder isModal={true} onClose={closeSoarBuilder} />
      )}

      {/* BOTTOM SHIFTED DOCK: MAGNETIC DOCK NAVIGATION */}
      <BottomNavDock onOpenResearch={() => setIsResearchOpen(true)} />
    </div>
  );
}

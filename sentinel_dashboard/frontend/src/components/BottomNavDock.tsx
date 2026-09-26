"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  MagneticDock,
  DockItemData,
} from "@/components/ui/magnetic-dock";
import {
  Activity,
  Flame,
  Zap,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Cpu,
  Eye,
  Radio,
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import { ConsoleType } from "@/types/sentinel";

interface BottomNavDockProps {
  onOpenResearch?: () => void;
}

export default function BottomNavDock({ onOpenResearch }: BottomNavDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    activeConsole,
    setActiveConsole,
    activeRules,
    latestEvent,
    openPacketSniffer,
  } = useTelemetryStore();

  const handleNavigate = (consoleId: ConsoleType | "research") => {
    if (consoleId === "research") {
      onOpenResearch?.();
      return;
    }

    setActiveConsole(consoleId);

    // If currently on standalone /execute page and selecting another console, return to /
    if (pathname === "/execute" && consoleId !== "execute") {
      router.push("/");
    }
  };

  const isCriticalAnomaly = latestEvent?.isAnomaly || (latestEvent?.anomalyProbability ?? 0) > 0.85;

  const dockItems: DockItemData[] = [
    {
      id: "overview",
      label: "Executive Overview",
      description: "Live Fleet Health, Ingestion Velocity & Lateral Blast Radius Provenance",
      icon: <Activity className="w-full h-full" />,
      color: "#00f3ff",
      isActive: pathname === "/" && activeConsole === "overview",
      onClick: () => handleNavigate("overview"),
    },
    {
      id: "threat_lab",
      label: "Forensic Threat Lab",
      description: "Dual-Head Anomaly Scoring (τ > 0.85), Waveform Buffer & MITRE ATT&CK Matrix",
      icon: <Flame className="w-full h-full" />,
      color: "#ff7700",
      badge: isCriticalAnomaly ? "!" : undefined,
      isActive: pathname === "/" && activeConsole === "threat_lab",
      onClick: () => handleNavigate("threat_lab"),
    },
    {
      id: "xai",
      label: "Saliency XAI Engine",
      description: "0.78 ms First-Order Gradient Attribution (99.97% vs SHAP) & MTTR Breakdown",
      icon: <Zap className="w-full h-full" />,
      color: "#fcee0a",
      isActive: pathname === "/" && activeConsole === "xai",
      onClick: () => handleNavigate("xai"),
    },
    {
      id: "adversarial",
      label: "Adversarial Stress-Lab",
      description: "FGSM & PGD-20 Evasion Resilience (ϵ Slider) with KS & PSI Drift Health",
      icon: <ShieldAlert className="w-full h-full" />,
      color: "#ff0055",
      isActive: pathname === "/" && activeConsole === "adversarial",
      onClick: () => handleNavigate("adversarial"),
    },
    {
      id: "remediation",
      label: "Active Remediation",
      description: "Wazuh Closed-Loop Rule Ledger & IEC 62443 Four-Eyes Safety Interlock",
      icon: <ShieldCheck className="w-full h-full" />,
      color: "#00ff66",
      badge: activeRules.length > 0 ? activeRules.length : undefined,
      isActive: pathname === "/" && activeConsole === "remediation",
      onClick: () => handleNavigate("remediation"),
    },
    {
      id: "compliance",
      label: "GRC Compliance Vault",
      description: "NIST SP 800-53 / ISO 27001 Cross-Walk & SHA-256 Merkle Audit Ledger",
      icon: <FileCheck className="w-full h-full" />,
      color: "#a855f7",
      isActive: pathname === "/" && activeConsole === "compliance",
      onClick: () => handleNavigate("compliance"),
    },
    {
      id: "execute",
      label: "Circuit PCB Architecture",
      description: "Interactive Hardware IC Topology: Multi-Domain Sensors → Dual-Head Conformer",
      icon: <Cpu className="w-full h-full" />,
      color: "#00f3ff",
      isActive: (pathname === "/" && activeConsole === "execute") || pathname === "/execute",
      onClick: () => handleNavigate("execute"),
    },
    {
      id: "sniffer",
      label: "Live Packet Sniffer",
      description: "Wireshark-Grade Layer 2–7 Protocol Dissector & Raw Hex/ASCII Stream",
      icon: <Radio className="w-full h-full" />,
      color: "#00f3ff",
      isActive: false,
      onClick: () => openPacketSniffer(),
    },
    {
      id: "research",
      label: "Research Gallery",
      description: "11 Empirical Validation Figures, Confusion Matrices & Statistical Proofs",
      icon: <Eye className="w-full h-full" />,
      color: "#38bdf8",
      isActive: false,
      onClick: () => handleNavigate("research"),
    },
  ];

  return (
    <aside
      aria-label="Bottom Navigation Dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-1.5rem)] pointer-events-auto"
    >
      <MagneticDock
        items={dockItems}
        iconSize={48}
        maxScale={1.38}
        magneticDistance={140}
        showLabels={true}
        position="bottom"
        variant="cyber"
        className="shadow-[0_12px_45px_rgba(0,0,0,0.85)] border-[var(--border-color)]/80"
      />
    </aside>
  );
}

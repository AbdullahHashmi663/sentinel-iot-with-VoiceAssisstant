// ==============================================================================
// SENTINEL-IOT: TACTICAL PRIORITY & SENSIBLE SHUTDOWN PAGE (/priority)
// Dedicated Full-Screen 2D Risk-Criticality Matrix & Sensible Shutdown Reasoner
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNavDock from "@/components/BottomNavDock";
import LeftSidebarNav from "@/components/LeftSidebarNav";
import PriorityConsole from "@/components/consoles/PriorityConsole";
import LivePacketSnifferDrawer from "@/components/LivePacketSnifferDrawer";
import AgenticSocAnalystModal from "@/components/AgenticSocAnalystModal";
import SOARPlaybookBuilder from "@/components/SOARPlaybookBuilder";
import ResearchModal from "@/components/ResearchModal";
import CryptographicAuditReportModal from "@/components/modals/CryptographicAuditReportModal";
import { useTelemetryStore } from "@/store/useTelemetryStore";

export default function PriorityScreenPage() {
  const [isResearchOpen, setIsResearchOpen] = useState<boolean>(false);
  const {
    theme,
    setTheme,
    setActiveConsole,
    isPacketSnifferOpen,
    closePacketSniffer,
    isAgenticSocOpen,
    closeAgenticSoc,
    agenticIncident,
    latestEvent,
    isSoarBuilderOpen,
    closeSoarBuilder
  } = useTelemetryStore();

  useEffect(() => {
    setActiveConsole("priority");
    const saved = localStorage.getItem("sentinel_theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
      if (saved === "alabaster" || saved === "arctic" || saved === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
    }
  }, [setActiveConsole, setTheme]);

  const isLightMode = theme === "alabaster" || theme === "arctic" || theme === "light";

  return (
    <div className={`min-h-screen flex flex-col pb-28 selection:bg-[var(--accent-primary)] selection:text-black transition-colors duration-200 ${
      isLightMode ? "text-[#1c1c1c] bg-[#fafaff]" : "text-[#dee3eb] bg-transparent"
    }`}>
      {/* 1. MASTER PERSISTENT HEADER */}
      <Header
        theme={theme}
        setTheme={setTheme}
        onOpenResearch={() => setIsResearchOpen(true)}
      />

      {/* 2. MAIN DEDICATED PRIORITY & MATRIX SCREEN */}
      <main className="max-w-[1920px] w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4">
        <PriorityConsole />
      </main>

      {/* 3. MODALS & DRAWERS */}
      <ResearchModal
        isOpen={isResearchOpen}
        onClose={() => setIsResearchOpen(false)}
      />

      <LivePacketSnifferDrawer
        isOpen={isPacketSnifferOpen}
        onClose={closePacketSniffer}
      />

      <AgenticSocAnalystModal
        isOpen={isAgenticSocOpen}
        onClose={closeAgenticSoc}
        incident={agenticIncident || latestEvent}
      />

      {isSoarBuilderOpen && (
        <SOARPlaybookBuilder isModal={true} onClose={closeSoarBuilder} />
      )}

      <CryptographicAuditReportModal />

      {/* 4. NAVIGATION SUITE */}
      <LeftSidebarNav onOpenResearch={() => setIsResearchOpen(true)} />
      <BottomNavDock onOpenResearch={() => setIsResearchOpen(true)} />
    </div>
  );
}

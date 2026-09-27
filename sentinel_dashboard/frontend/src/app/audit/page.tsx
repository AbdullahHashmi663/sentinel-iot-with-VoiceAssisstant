// ==============================================================================
// SENTINEL-IOT: CRYPTOGRAPHIC AUDIT BUNDLE CLI SCREEN (/audit)
// Dedicated Full-Screen Cryptographic Audit Verifier & Sandbox TTY
// Based on Stitch Sentinel IoT Security Operations Center Specifications
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNavDock from "@/components/BottomNavDock";
import LeftSidebarNav from "@/components/LeftSidebarNav";
import CryptographicAuditBundleConsole from "@/components/consoles/CryptographicAuditBundleConsole";
import LivePacketSnifferDrawer from "@/components/LivePacketSnifferDrawer";
import AgenticSocAnalystModal from "@/components/AgenticSocAnalystModal";
import SOARPlaybookBuilder from "@/components/SOARPlaybookBuilder";
import ResearchModal from "@/components/ResearchModal";
import CryptographicAuditReportModal from "@/components/modals/CryptographicAuditReportModal";
import { useTelemetryStore } from "@/store/useTelemetryStore";

export default function AuditScreenPage() {
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
    setActiveConsole("audit");
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

  return (
    <div className="min-h-screen flex flex-col pb-28 selection:bg-[#00f0ff] selection:text-black text-[#dee3eb]">
      {/* 1. MASTER PERSISTENT HEADER */}
      <Header
        theme={theme}
        setTheme={setTheme}
        onOpenResearch={() => setIsResearchOpen(true)}
      />

      {/* 2. MAIN DEDICATED AUDIT BUNDLE CLI SCREEN */}
      <main className="max-w-[1920px] w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4">
        <CryptographicAuditBundleConsole />
      </main>

      {/* 3. TACTICAL LEFT RAIL (EXTRA TOOLS) & BOTTOM NAVIGATION DOCK */}
      <LeftSidebarNav onOpenResearch={() => setIsResearchOpen(true)} />
      <BottomNavDock onOpenResearch={() => setIsResearchOpen(true)} />

      {/* 4. MODALS & SLIDE-OUT DRAWERS */}
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
      <ResearchModal isOpen={isResearchOpen} onClose={() => setIsResearchOpen(false)} />
      <CryptographicAuditReportModal />
    </div>
  );
}

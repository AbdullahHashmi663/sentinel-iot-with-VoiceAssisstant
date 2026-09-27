// ==============================================================================
// SOAR PLAYBOOK BUILDER & ORCHESTRATION STUDIO (CONSOLE COMPONENT / MODAL)
// Stitch Incident Playbook Editor & Orchestration Studio Futuristic HUD
// Autonomous DAG Execution Flow: Trigger -> eBPF Drop -> Cgroup -> Hardware Interlock -> TPM Audit
// ==============================================================================

"use client";

import React, { useState } from "react";
import { useTelemetryStore } from "@/store/useTelemetryStore";

interface SOARPlaybookBuilderProps {
  isModal?: boolean;
  onClose?: () => void;
}

interface PlaybookMeta {
  id: string;
  name: string;
  category: "ICS" | "eBPF" | "SCADA" | "Air-Gap";
  description: string;
  targetIp: string;
  mttr: string;
  status: "ACTIVE - RING0" | "STANDBY - ARMED" | "STANDBY - VERIFIED" | "TESTING";
  stages: number;
}

const PLAYBOOK_INVENTORY: PlaybookMeta[] = [
  {
    id: "PB-MODBUS-FC16-EXCURSION-04",
    name: "Modbus FC16 Actuator Excursion",
    category: "ICS",
    description: "Line-Rate XDP Drop + cgroup freeze + relay interlock",
    targetIp: "192.168.100.45",
    mttr: "0.082ms",
    status: "ACTIVE - RING0",
    stages: 6
  },
  {
    id: "PB-DNP3-OUTSTATION-FLOOD-01",
    name: "DNP3 Outstation Flood Mitigation",
    category: "ICS",
    description: "Rate-limit XDP, token bucket 500 pkts/s per ingress",
    targetIp: "192.168.100.22",
    mttr: "0.110ms",
    status: "STANDBY - ARMED",
    stages: 4
  },
  {
    id: "PB-S7COMM-LADDER-INJECT-08",
    name: "Simatic S7Comm Ladder Injection",
    category: "SCADA",
    description: "Memory integrity hash check, PLC CPU stop trigger",
    targetIp: "10.0.4.15",
    mttr: "1.450ms",
    status: "STANDBY - VERIFIED",
    stages: 5
  },
  {
    id: "PB-BACNET-DEVICE-SPOOF-02",
    name: "BACnet Building Bus Spoof Guard",
    category: "ICS",
    description: "MAC/IP strict binding clamp, ARP poison zero-latency drop",
    targetIp: "192.168.20.88",
    mttr: "0.340ms",
    status: "STANDBY - ARMED",
    stages: 4
  },
  {
    id: "PB-ZERO-TRUST-CONFORMER-07",
    name: "Attention Entropy Quarantine",
    category: "eBPF",
    description: "Attention entropy > 1.25 nats triggers neural quarantine",
    targetIp: "172.16.50.12",
    mttr: "4.800ms",
    status: "TESTING",
    stages: 4
  }
];

export default function SOARPlaybookBuilder({ isModal = false, onClose }: SOARPlaybookBuilderProps) {
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>("PB-MODBUS-FC16-EXCURSION-04");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [rightTab, setRightTab] = useState<"ebpf" | "safety">("ebpf");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(-1);
  const [officerSigned, setOfficerSigned] = useState<boolean>(false);
  const [traceLogs, setTraceLogs] = useState<string[]>([
    "[14:28:02.102] <kernel> loaded prog 'xdp_drop_modbus_excursion' id 412",
    "[14:28:02.105] <ring0> xdp attached to eth0 in driver mode",
    "[14:28:02.189] <xdp_drop> match src:192.168.100.45 -> dropped 184000 pkts/s"
  ]);

  const activePlaybook =
    PLAYBOOK_INVENTORY.find((p) => p.id === selectedPlaybookId) || PLAYBOOK_INVENTORY[0];

  const filteredPlaybooks = PLAYBOOK_INVENTORY.filter((pb) => {
    const matchesCat =
      filterCategory === "ALL" ||
      pb.category.toUpperCase() === filterCategory.toUpperCase();
    const matchesSearch =
      !searchFilter ||
      pb.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pb.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pb.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const runSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(1);

    const steps = [
      { step: 1, log: `[${new Date().toISOString().slice(11, 23)}] <trigger> Conformer τ=0.942 > 0.850 exceeded on ${activePlaybook.targetIp}` },
      { step: 2, log: `[${new Date().toISOString().slice(11, 23)}] <ring0> XDP_DROP filter hook installed on eth0 (latency: 0.082ms)` },
      { step: 3, log: `[${new Date().toISOString().slice(11, 23)}] <cgroup-v2> SIGSTOP sent to target PID 49102 [CPU quota: 0%]` },
      { step: 4, log: `[${new Date().toISOString().slice(11, 23)}] <safety-gate> IEC 62443 physical pressure boundary confirmed within safety limit` },
      { step: 5, log: `[${new Date().toISOString().slice(11, 23)}] <hardware-interlock> Relay trip pending dual-signature quorum` },
      { step: 6, log: `[${new Date().toISOString().slice(11, 23)}] <audit> TPM 2.0 PCR-7 seal signed: Merkle Block #1048576 committed` }
    ];

    for (let i = 0; i < steps.length; i++) {
      setSimulationStep(steps[i].step);
      setTraceLogs((prev) => [steps[i].log, ...prev.slice(0, 10)]);
      await new Promise((r) => setTimeout(r, 600));
    }

    setIsSimulating(false);
  };

  const handleSignInterlock = () => {
    setOfficerSigned(true);
    setTraceLogs((prev) => [
      `[${new Date().toISOString().slice(11, 23)}] <fido2> Plant Safety Engineer signed via YubiKey token. Air-gap confirmed!`,
      ...prev.slice(0, 10)
    ]);
  };

  return (
    <div className="flex flex-col w-full bg-[#070d14] text-[#dee3eb] border border-[#00f0ff]/30 rounded shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* 1. TOP CONTROL RIBBON & COMMAND BAR */}
      <section className="w-full bg-[#0b131e] px-4 py-3 border-b border-[#162536] relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#64748b] tracking-wider flex-wrap">
              <span>ORCHESTRATION STUDIO</span>
              <span>//</span>
              <span className="text-[#00f0ff]">SOAR-ICS v2.4</span>
              <span>//</span>
              <span className="text-[#00ff66] font-bold">CORE-RING0-INTERLOCK</span>
              <span className="text-[#64748b]">[TARGET_ID: 0x7F41]</span>
              <span className="text-[#00f0ff] font-bold">TARGET IP: {activePlaybook.targetIp}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-['Orbitron'] text-base md:text-lg text-[#00ff66] tracking-tight font-bold m-0 leading-tight">
                {activePlaybook.id}
              </h1>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] uppercase shadow-sm">
                Line-Rate eBPF Drop + Cgroup Freeze + Air-Gap Dual Interlock
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#070d14] border border-[#162536] text-[10px] font-mono text-[#dee3eb]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse"></span>
                <span>CANARY RUNTIME: <strong className="text-[#00ff66]">ACTIVE</strong></span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#070d14] border border-[#162536] text-[10px] font-mono text-[#dee3eb]">
                <span className="material-symbols-outlined text-[13px] text-[#00f0ff]">verified</span>
                <span>DRY-RUN: <strong className="text-[#00f0ff]">100% PASS</strong></span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#070d14] border border-[#162536] text-[10px] font-mono text-[#dee3eb]">
                <span className="material-symbols-outlined text-[13px] text-[#ffb700]">lock_clock</span>
                <span>IEC 62443-4-2 SR 3.1: <strong className="text-[#ffb700]">ENFORCED</strong></span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#070d14] border border-[#162536] text-[10px] font-mono text-[#64748b]">
                <span className="material-symbols-outlined text-[13px]">memory</span>
                <span>COMPILER: <strong className="text-[#dee3eb]">LLVM/Clang eBPF Target BPF (JIT)</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className={`px-3 py-1.5 rounded font-mono text-xs font-bold flex items-center gap-1.5 border transition-all shadow-md ${
                isSimulating
                  ? "bg-[#ffb700]/20 text-[#ffb700] border-[#ffb700]/40 animate-pulse"
                  : "bg-[#070d14] hover:bg-[#162536] text-[#00f0ff] border-[#00f0ff]/40"
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#00f0ff]">science</span>
              <span>{isSimulating ? `Executing Stage ${simulationStep}...` : "Simulate (Dry-Run)"}</span>
            </button>

            <button
              onClick={handleSignInterlock}
              disabled={officerSigned}
              className={`px-3 py-1.5 rounded font-mono text-xs font-bold flex items-center gap-1.5 border transition-all ${
                officerSigned
                  ? "bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/30 cursor-default"
                  : "bg-[#070d14] hover:bg-[#162536] text-[#ffb700] border-[#ffb700]/40"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">vpn_key</span>
              <span>{officerSigned ? "Interlock Signed" : "Compile & Sign"}</span>
            </button>

            <button
              onClick={runSimulation}
              className="px-3.5 py-1.5 rounded bg-[#00ff66] hover:bg-[#6bff83] text-[#003911] font-mono text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-[0_0_16px_rgba(0,255,102,0.4)] transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>DEPLOY TO RING0</span>
            </button>

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded bg-[#070d14] hover:bg-[#162536] text-[#64748b] hover:text-[#dee3eb] border border-[#162536]"
                title="Close SOAR Studio"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. MAIN THREE-COLUMN STUDIO WORKSPACE (3 / 5 / 4) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 p-3">
        {/* LEFT PANEL: Playbook Catalog & Trigger Palette (3 Cols) */}
        <aside className="xl:col-span-3 flex flex-col gap-3 min-w-0">
          {/* Catalog Box */}
          <div className="hud-box bg-[#0b131e] p-3 rounded border border-[#162536] flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#162536]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00f0ff] text-[16px]">folder_special</span>
                <span className="font-['Orbitron'] text-xs text-[#00ff66] uppercase font-bold tracking-wider">
                  Playbook Inventory
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#64748b]">{PLAYBOOK_INVENTORY.length} TOTAL</span>
            </div>

            {/* Search Bar */}
            <div className="relative w-full">
              <span className="material-symbols-outlined text-[14px] text-[#64748b] absolute left-2 top-2">search</span>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="FILTER SIGNATURE / PROTOCOL..."
                className="w-full bg-[#070d14] text-[#dee3eb] font-mono text-[10px] pl-7 pr-2 py-1.5 rounded border border-[#162536] focus:outline-none focus:border-[#00f0ff] placeholder:text-[#64748b]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {(["ALL", "ICS", "eBPF", "SCADA", "Air-Gap"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded font-mono text-[9px] whitespace-nowrap transition-colors ${
                    filterCategory === cat
                      ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 font-bold"
                      : "bg-[#070d14] text-[#64748b] hover:text-[#dee3eb] border border-[#162536]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Playbook List */}
            <div className="flex flex-col gap-1.5 mt-1 max-h-[340px] overflow-y-auto pr-1">
              {filteredPlaybooks.map((pb) => {
                const isSelected = pb.id === selectedPlaybookId;
                return (
                  <div
                    key={pb.id}
                    onClick={() => setSelectedPlaybookId(pb.id)}
                    className={`p-2 rounded cursor-pointer transition-all border relative overflow-hidden ${
                      isSelected
                        ? "bg-[#070d14] border-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.15)]"
                        : "bg-[#070d14]/70 border-[#162536] hover:bg-[#162536]/40"
                    }`}
                  >
                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00ff66]"></div>}
                    <div className="pl-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-[9px] font-bold flex items-center gap-1 ${
                            isSelected ? "text-[#00ff66]" : "text-[#64748b]"
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping"></span>}
                          [{pb.status}]
                        </span>
                        <span className="font-mono text-[9px] text-[#64748b]">MTTR: {pb.mttr}</span>
                      </div>
                      <div className="font-mono text-xs text-[#dee3eb] font-bold mt-0.5 truncate">
                        {pb.id}
                      </div>
                      <p className="font-['Space_Grotesk'] text-[10px] text-[#64748b] line-clamp-1 mt-0.5">
                        {pb.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[9px] font-mono">
                        <span className="px-1 rounded bg-[#0b131e] text-[#00f0ff] border border-[#00f0ff]/20">
                          {pb.stages} STAGES
                        </span>
                        <span className="px-1 rounded bg-[#0b131e] text-[#64748b] border border-[#162536]">
                          TPM 2.0 PCR-7
                        </span>
                        <span className="px-1 rounded bg-[#0b131e] text-[#00ff66] border border-[#00ff66]/20">
                          {pb.targetIp}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Add Step Node Palette */}
          <div className="hud-box bg-[#0b131e] p-3 rounded border border-[#162536] flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#162536]">
              <span className="font-['Orbitron'] text-xs text-[#00ff66] uppercase font-bold tracking-wider">
                Step Node Palette
              </span>
              <span className="font-mono text-[9px] text-[#64748b]">DRAG TO CANVAS</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-2 rounded bg-[#070d14] border border-[#162536] text-left">
                <div className="flex items-center gap-1 text-[#00f0ff]">
                  <span className="material-symbols-outlined text-[15px]">sensors</span>
                  <span className="font-mono text-[10px] font-bold uppercase">Ingest Trigger</span>
                </div>
                <span className="font-mono text-[#64748b] text-[9px] block mt-0.5">Suricata / Kafka</span>
              </div>
              <div className="p-2 rounded bg-[#070d14] border border-[#162536] text-left">
                <div className="flex items-center gap-1 text-[#00ff66]">
                  <span className="material-symbols-outlined text-[15px]">filter_alt</span>
                  <span className="font-mono text-[10px] font-bold uppercase">eBPF Filter</span>
                </div>
                <span className="font-mono text-[#64748b] text-[9px] block mt-0.5">XDP / TC Kernel Drop</span>
              </div>
              <div className="p-2 rounded bg-[#070d14] border border-[#162536] text-left">
                <div className="flex items-center gap-1 text-[#ffb700]">
                  <span className="material-symbols-outlined text-[15px]">pause_circle</span>
                  <span className="font-mono text-[10px] font-bold uppercase">Cgroup Freeze</span>
                </div>
                <span className="font-mono text-[#64748b] text-[9px] block mt-0.5">Process SIGSTOP Lock</span>
              </div>
              <div className="p-2 rounded bg-[#070d14] border border-[#162536] text-left">
                <div className="flex items-center gap-1 text-[#00f0ff]">
                  <span className="material-symbols-outlined text-[15px]">terminal</span>
                  <span className="font-mono text-[10px] font-bold uppercase">Agent Task</span>
                </div>
                <span className="font-mono text-[#64748b] text-[9px] block mt-0.5">Wazuh RPC Probe</span>
              </div>
              <div className="p-2 rounded bg-[#070d14] border border-[#162536] text-left">
                <div className="flex items-center gap-1 text-[#ff2a5f]">
                  <span className="material-symbols-outlined text-[15px]">power_off</span>
                  <span className="font-mono text-[10px] font-bold uppercase">Hardware Relay</span>
                </div>
                <span className="font-mono text-[#64748b] text-[9px] block mt-0.5">Four-Eyes Air-Gap</span>
              </div>
              <div className="p-2 rounded bg-[#070d14] border border-[#162536] text-left">
                <div className="flex items-center gap-1 text-[#00ff66]">
                  <span className="material-symbols-outlined text-[15px]">verified_user</span>
                  <span className="font-mono text-[10px] font-bold uppercase">Merkle Audit</span>
                </div>
                <span className="font-mono text-[#64748b] text-[9px] block mt-0.5">TPM 2.0 PCR Signature</span>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER PANEL: Visual Directed Acyclic Graph (DAG) Execution Flow (5 Cols) */}
        <main className="xl:col-span-5 flex flex-col gap-3 min-w-0">
          <div className="bg-[#0b131e] p-2.5 rounded border border-[#00f0ff]/30 shadow-md flex items-center justify-between flex-wrap gap-2 relative">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00ff66] text-[18px]">account_tree</span>
              <div>
                <div className="font-mono text-[9px] text-[#64748b] tracking-wider uppercase">
                  EXECUTION PIPELINE // HARDWARE GRAPH
                </div>
                <div className="font-['Orbitron'] text-xs text-[#00ff66] font-bold">
                  Directed Acyclic Graph (DAG)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] font-bold">
                0 ERRORS
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-bold">
                CYCLE-FREE
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#070d14] text-[#64748b]">
                SNAP 16px
              </span>
            </div>
          </div>

          {/* Visual DAG Canvas */}
          <div className="relative w-full bg-[#070d14] p-3 rounded border border-[#162536] flex flex-col gap-3 overflow-hidden shadow-inner">
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:20px_20px]"></div>

            {/* NODE 01: Ingest Trigger */}
            <div
              className={`relative z-10 w-full p-2.5 rounded bg-[#0b131e] border-l-2 shadow-md transition-all ${
                simulationStep === 1
                  ? "border-[#00ff66] ring-1 ring-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                  : "border-[#00ff66]/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-[#00ff66]/20 text-[#00ff66] font-mono text-[9px] uppercase font-bold border border-[#00ff66]/30">
                    NODE 01
                  </span>
                  <span className="font-mono text-[10px] text-[#64748b]">INGEST TRIGGER // ANOMALY EVENT</span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#00ff66]/20 text-[#00ff66] font-bold flex items-center gap-1 border border-[#00ff66]/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping"></span>
                  RESOLVED (0.00ms)
                </span>
              </div>
              <div className="font-mono text-xs text-[#dbfcff] font-bold mt-1">Modbus FC16 Anomaly Detected</div>
              <div className="font-mono text-[10px] text-[#64748b] mt-0.5">
                Source: <code className="text-[#00f0ff]">Conformer Deep Model (τ ≥ 0.850)</code> OR <code className="text-[#00f0ff]">Suricata Alert #20491</code>
              </div>
              <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] pt-1 bg-[#070d14] px-2 py-1 rounded border border-[#162536]">
                <span className="text-[#64748b]">REGISTER EXCURSION: 40001 &gt; 9,800 RPM</span>
                <span className="text-[#00ff66] font-bold">BURST: 38 PKTS</span>
              </div>
            </div>

            {/* Parallel Fork */}
            <div className="relative flex items-center justify-center -my-1.5 z-10">
              <div className="h-6 w-0.5 bg-[#00ff66] shadow-[0_0_8px_#00ff66]"></div>
              <span className="absolute font-mono text-[9px] text-[#00ff66] bg-[#070d14] px-2 py-0.2 rounded border border-[#00ff66]/40">
                PARALLEL FORK [2 CHANNELS]
              </span>
            </div>

            {/* PARALLEL ROW: NODE 02 & NODE 03 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 relative z-10">
              {/* NODE 02: eBPF XDP Drop */}
              <div
                className={`p-2.5 rounded bg-[#0b131e] shadow-md border transition-all ${
                  simulationStep === 2
                    ? "border-[#00ff66] ring-1 ring-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                    : "border-[#00ff66]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.2 rounded bg-[#00ff66]/10 text-[#00ff66] font-mono text-[9px] uppercase font-bold border border-[#00ff66]/30">
                    NODE 02 [RING0]
                  </span>
                  <span className="font-mono text-[10px] text-[#00ff66] font-bold">0.082ms</span>
                </div>
                <div className="font-mono text-xs text-[#dbfcff] font-bold mt-1">eBPF XDP Line Drop</div>
                <p className="font-['Space_Grotesk'] text-[10px] text-[#64748b] mt-0.5">NIC hardware drop via AF_XDP hook</p>
                <div className="mt-1.5 bg-[#070d14] p-1.5 rounded font-mono text-[9px] text-[#dee3eb] border border-[#162536] space-y-0.5">
                  <div>IFACE: eth0 [100GbE]</div>
                  <div className="text-[#00ff66] font-bold">SRC: {activePlaybook.targetIp}</div>
                  <div className="text-[#ff2a5f]">ACTION: XDP_DROP</div>
                </div>
                <div className="mt-1.5 flex items-center gap-1 font-mono text-[9px] text-[#00ff66] font-bold">
                  <span className="material-symbols-outlined text-[13px]">done_all</span>
                  <span>ENFORCED IN HARDWARE</span>
                </div>
              </div>

              {/* NODE 03: cgroup-v2 Freeze */}
              <div
                className={`p-2.5 rounded bg-[#0b131e] shadow-md border transition-all ${
                  simulationStep === 3
                    ? "border-[#ffb700] ring-1 ring-[#ffb700] shadow-[0_0_15px_rgba(255,183,0,0.3)]"
                    : "border-[#ffb700]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.2 rounded bg-[#ffb700]/20 text-[#ffb700] font-mono text-[9px] uppercase font-bold border border-[#ffb700]/30">
                    NODE 03 [HOST]
                  </span>
                  <span className="font-mono text-[10px] text-[#ffb700] font-bold">2.15ms</span>
                </div>
                <div className="font-mono text-xs text-[#dbfcff] font-bold mt-1">cgroup-v2 Freeze</div>
                <p className="font-['Space_Grotesk'] text-[10px] text-[#64748b] mt-0.5">Quarantine corrupted daemon thread</p>
                <div className="mt-1.5 bg-[#070d14] p-1.5 rounded font-mono text-[9px] text-[#dee3eb] border border-[#162536] space-y-0.5">
                  <div>PID: 49102 [modbus_srv]</div>
                  <div className="text-[#ffb700] font-bold">SIGNAL: SIGSTOP</div>
                  <div className="text-[#64748b]">CPU QUOTA: 0%</div>
                </div>
                <div className="mt-1.5 flex items-center gap-1 font-mono text-[9px] text-[#00ff66] font-bold">
                  <span className="material-symbols-outlined text-[13px]">done_all</span>
                  <span>STATE: FROZEN</span>
                </div>
              </div>
            </div>

            {/* Converge */}
            <div className="relative flex items-center justify-center -my-1.5 z-10">
              <div className="h-6 w-0.5 bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]"></div>
              <span className="absolute font-mono text-[9px] text-[#00f0ff] bg-[#070d14] px-2 py-0.2 rounded border border-[#00f0ff]/40">
                CONVERGE
              </span>
            </div>

            {/* NODE 04: Safety Gate */}
            <div
              className={`relative z-10 w-full p-2.5 rounded bg-[#0b131e] border-l-2 border-[#00f0ff] shadow-md transition-all ${
                simulationStep === 4 ? "ring-1 ring-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-[#00f0ff]/20 text-[#00f0ff] font-mono text-[9px] uppercase font-bold border border-[#00f0ff]/30">
                    NODE 04 [SAFETY GATE]
                  </span>
                  <span className="font-mono text-[10px] text-[#64748b]">PHYSICAL ENVELOPE</span>
                </div>
                <span className="font-mono text-[10px] text-[#00ff66] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  CRITERIA SATISFIED
                </span>
              </div>
              <div className="font-mono text-xs text-[#dbfcff] font-bold mt-1">Operational Boundary Verification</div>
              <div className="grid grid-cols-2 gap-2 mt-1.5 font-mono text-[9px]">
                <div className="bg-[#070d14] p-1.5 rounded border border-[#162536]">
                  <div className="text-[#64748b]">PLANT SAFETY MARGIN</div>
                  <div className="text-xs text-[#00ff66] font-bold">92.4% <span className="text-[9px] text-[#64748b] font-normal">(&gt; 85% THRESH)</span></div>
                </div>
                <div className="bg-[#070d14] p-1.5 rounded border border-[#162536]">
                  <div className="text-[#64748b]">PRESSURE Δ LIMIT</div>
                  <div className="text-xs text-[#00f0ff] font-bold">118 kPa <span className="text-[9px] text-[#64748b] font-normal">(&lt; 200 kPa MAX)</span></div>
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="relative flex items-center justify-center -my-1.5 z-10">
              <div className="h-6 w-0.5 bg-[#ff2a5f] shadow-[0_0_8px_#ff2a5f]"></div>
            </div>

            {/* NODE 05: Hardware Air-Gap Relay */}
            <div
              className={`relative z-10 w-full p-2.5 rounded bg-[#0b131e] shadow-xl border-2 transition-all ${
                officerSigned
                  ? "border-[#00ff66]/60 shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                  : "border-[#ff2a5f]/60 shadow-[0_0_15px_rgba(255,42,95,0.2)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-[#ff2a5f]/20 text-[#ff2a5f] font-mono text-[9px] uppercase font-bold border border-[#ff2a5f]/40">
                    NODE 05 [HARDWARE AIR-GAP]
                  </span>
                  <span className="font-mono text-[10px] text-[#64748b]">PHYSICAL RELAY #3</span>
                </div>
                <span
                  className={`font-mono text-[10px] px-2 py-0.2 rounded font-bold flex items-center gap-1 border ${
                    officerSigned
                      ? "bg-[#00ff66]/20 text-[#00ff66] border-[#00ff66]/40"
                      : "bg-[#ff2a5f]/20 text-[#ff2a5f] border-[#ff2a5f]/40 animate-pulse"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${officerSigned ? "bg-[#00ff66]" : "bg-[#ff2a5f]"}`}></span>
                  {officerSigned ? "INTERLOCK SIGNED" : "AWAITING DUAL-SIGNATURE"}
                </span>
              </div>
              <div className="font-mono text-xs text-[#ff2a5f] font-bold mt-1">Dual-Custody Physical Relay Trip</div>
              <p className="font-mono text-[10px] text-[#64748b] mt-0.5">
                De-energize PLC output actuator to establish cold galvanically isolated air-gap
              </p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleSignInterlock}
                  disabled={officerSigned}
                  className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                    officerSigned
                      ? "bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40 cursor-default"
                      : "bg-[#ff2a5f] hover:bg-[#ff2a5f]/80 text-[#070d14] shadow-[0_0_12px_rgba(255,42,95,0.4)]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">key</span>
                  <span>{officerSigned ? "Officer Signed" : "Sign Interlock (SecOps)"}</span>
                </button>
                <span className="font-mono text-[9px] text-[#64748b]">
                  {officerSigned ? "Dual-signature quorum reached" : "Requires 2nd Safety Key from Plant Floor"}
                </span>
              </div>
            </div>

            {/* Connector */}
            <div className="relative flex items-center justify-center -my-1.5 z-10">
              <div className="h-6 w-0.5 bg-[#64748b] opacity-40"></div>
            </div>

            {/* NODE 06: Merkle Commit */}
            <div
              className={`relative z-10 w-full p-2.5 rounded bg-[#0b131e]/70 shadow-md border transition-all ${
                simulationStep === 6
                  ? "border-[#00ff66] ring-1 ring-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                  : "border-[#162536]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-[#070d14] text-[#64748b] font-mono text-[9px] uppercase border border-[#162536]">
                    NODE 06 [AUDIT]
                  </span>
                  <span className="font-mono text-[10px] text-[#64748b]">IMMUTABLE ANCHOR</span>
                </div>
                <span className="font-mono text-[10px] text-[#00ff66] font-bold">
                  {simulationStep === 6 ? "COMMITTED" : "QUEUED"}
                </span>
              </div>
              <div className="font-mono text-xs text-[#dee3eb] mt-1 font-bold">TPM 2.0 PCR-7 Attestation & Merkle Commit</div>
              <div className="font-mono text-[10px] text-[#64748b] mt-0.5">
                Hardware root of trust block commitment: SHA-256 state seal
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: Bytecode Dissection & Safety Policies (4 Cols) */}
        <aside className="xl:col-span-4 flex flex-col gap-3 min-w-0">
          <div className="hud-box bg-[#0b131e] p-3 rounded border border-[#162536] flex flex-col gap-2.5">
            {/* Tab Selector */}
            <div className="flex items-center justify-between pb-1 border-b border-[#162536]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRightTab("ebpf")}
                  className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold flex items-center gap-1 transition-all ${
                    rightTab === "ebpf"
                      ? "bg-[#00ff66] text-[#003911]"
                      : "bg-[#070d14] text-[#64748b] hover:text-[#dee3eb] border border-[#162536]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">code</span>
                  <span>C / eBPF Dissection</span>
                </button>
                <button
                  onClick={() => setRightTab("safety")}
                  className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold flex items-center gap-1 transition-all ${
                    rightTab === "safety"
                      ? "bg-[#00f0ff] text-[#00363d]"
                      : "bg-[#070d14] text-[#64748b] hover:text-[#dee3eb] border border-[#162536]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">policy</span>
                  <span>Safety Policies</span>
                </button>
              </div>
              <span className="font-mono text-[9px] text-[#64748b]">TARGET: X86_64</span>
            </div>

            {/* Code / Policies View */}
            {rightTab === "ebpf" ? (
              <div className="bg-[#070d14] p-2.5 rounded font-mono text-[10px] flex flex-col gap-2 border border-[#162536]">
                <div className="flex items-center justify-between text-[#64748b] text-[9px] pb-1 border-b border-[#162536]">
                  <span>xdp_drop_modbus_excursion.c</span>
                  <span className="text-[#00ff66]">LLVM-BPF OK</span>
                </div>
                <pre className="text-[#dee3eb] text-[10px] leading-[15px] overflow-x-auto whitespace-pre font-mono max-h-[170px] overflow-y-auto">
{`SEC("xdp")
int xdp_drop_modbus_excursion(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    struct ethhdr *eth = data;
    
    // Boundary check for packet size
    if ((void *)(eth + 1) > data_end) 
        return XDP_PASS;
    if (eth->h_proto != bpf_htons(ETH_P_IP)) 
        return XDP_PASS;

    struct iphdr *ip = data + sizeof(*eth);
    if ((void *)(ip + 1) > data_end) 
        return XDP_PASS;

    // Blacklisted ICS Ingress (192.168.100.45)
    if (ip->saddr == bpf_htonl(0xC0A8642D)) {
        bpf_trace_printk("[XDP_DROP] Banned ICS\\n");
        return XDP_DROP;
    }
    return XDP_PASS;
}`}
                </pre>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#162536] text-[9px] font-mono">
                  <div>
                    <div className="text-[#64748b] uppercase">Instruction Count</div>
                    <div className="text-[#00ff66] font-bold">48 INSN</div>
                  </div>
                  <div>
                    <div className="text-[#64748b] uppercase">Verifier Logs</div>
                    <div className="text-[#00f0ff] font-bold">0 ERRORS</div>
                  </div>
                  <div>
                    <div className="text-[#64748b] uppercase">BPF Map Type</div>
                    <div className="text-[#dee3eb] truncate">LPM_TRIE (65K)</div>
                  </div>
                  <div>
                    <div className="text-[#64748b] uppercase">JIT Target</div>
                    <div className="text-[#dee3eb]">x86_64 native</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#070d14] p-2.5 rounded font-mono text-[10px] flex flex-col gap-2 border border-[#162536]">
                <div className="flex items-center justify-between text-[#64748b] text-[9px] pb-1 border-b border-[#162536]">
                  <span>Four-Eyes Safety Constraints</span>
                  <span className="text-[#ff2a5f] font-bold">M-OF-N: 2/2</span>
                </div>
                <div className="space-y-1.5">
                  <div className="p-1.5 rounded bg-[#0b131e] border border-[#162536] flex items-center justify-between">
                    <div>
                      <div className="text-[#dee3eb] font-bold">SecOps Admin (Officer 1)</div>
                      <div className="text-[#64748b] text-[9px]">ID: #99214 // TOKEN SIGNED</div>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-[#00ff66]/20 text-[#00ff66] font-bold text-[9px]">
                      AUTH OK
                    </span>
                  </div>

                  <div className="p-1.5 rounded bg-[#0b131e] border border-[#162536] flex items-center justify-between">
                    <div>
                      <div className="text-[#dee3eb] font-bold">Plant Safety Engineer (Officer 2)</div>
                      <div className="text-[#64748b] text-[9px]">
                        {officerSigned ? "Hardware FIDO2 Key Verified" : "Hardware FIDO2 Key Pending"}
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                        officerSigned
                          ? "bg-[#00ff66]/20 text-[#00ff66]"
                          : "bg-[#ff2a5f]/20 text-[#ff2a5f] animate-pulse"
                      }`}
                    >
                      {officerSigned ? "VERIFIED" : "WAITING"}
                    </span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-[#162536] text-[9px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Fail-Safe Topology:</span>
                    <span className="text-[#dee3eb]">Normally Open (NO) De-energize</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Max Outage Window:</span>
                    <span className="text-[#00f0ff]">450ms (No Water Hammer)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Relay Protocol:</span>
                    <span className="text-[#00ff66]">Modbus Coil #0003 Direct</span>
                  </div>
                </div>
              </div>
            )}

            {/* Simulation Trace Output Feed */}
            <div className="p-2.5 rounded bg-[#070d14] border border-[#162536] flex flex-col gap-1 font-mono text-[9px]">
              <div className="flex items-center justify-between text-[#64748b] pb-1 border-b border-[#162536]">
                <span>LIVE KERNEL TRACE (RING BUFFER)</span>
                <span className="text-[#00f0ff]">POLLING 10ms</span>
              </div>
              <div className="text-[#b9cacb] font-mono space-y-1 max-h-[100px] overflow-y-auto pr-1">
                {traceLogs.map((log, i) => (
                  <div key={i} className="truncate">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

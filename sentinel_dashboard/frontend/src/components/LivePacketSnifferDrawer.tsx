// ==============================================================================
// SENTINEL-IOT: LIVE PACKET SNIFFER DRAWER (STITCH FUTURISTIC HUD SPEC)
// AF_XDP Line-Rate Dissector • Wireshark Grade 3-Pane Industrial Tree & Hex
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useTelemetryStore } from "@/store/useTelemetryStore";

interface PacketItem {
  id: string;
  packetNo: number;
  timestamp: string;
  sourceIp: string;
  sourcePort: number;
  destIp: string;
  destPort: number;
  protocol: string;
  lengthBytes: number;
  info: string;
  anomalyTau: number;
  status: "DROPPED" | "PASS" | "LIMIT";
  fcCode?: number;
  regAddr?: string;
}

const DEFAULT_PACKETS: PacketItem[] = [
  {
    id: "pkt-48912",
    packetNo: 48912,
    timestamp: "14:22:09.412891",
    sourceIp: "192.168.100.45",
    sourcePort: 502,
    destIp: "10.0.4.12",
    destPort: 502,
    protocol: "Modbus/TCP",
    lengthBytes: 78,
    info: "FC16 Write Multiple (Reg:0x002B, Len:12)",
    anomalyTau: 0.942,
    status: "DROPPED",
    fcCode: 16,
    regAddr: "0x002b"
  },
  {
    id: "pkt-48911",
    packetNo: 48911,
    timestamp: "14:22:09.410214",
    sourceIp: "10.0.4.101",
    sourcePort: 4840,
    destIp: "10.0.4.12",
    destPort: 4840,
    protocol: "OPC-UA",
    lengthBytes: 142,
    info: "ReadRequest [NodeId: ns=2;s=Speed]",
    anomalyTau: 0.041,
    status: "PASS"
  },
  {
    id: "pkt-48910",
    packetNo: 48910,
    timestamp: "14:22:09.408712",
    sourceIp: "192.168.100.88",
    sourcePort: 20000,
    destIp: "10.0.4.12",
    destPort: 20000,
    protocol: "DNP3",
    lengthBytes: 94,
    info: "Direct Operate: Analog Out Setpoint",
    anomalyTau: 0.112,
    status: "PASS"
  },
  {
    id: "pkt-48909",
    packetNo: 48909,
    timestamp: "14:22:09.406120",
    sourceIp: "192.168.100.45",
    sourcePort: 502,
    destIp: "10.0.4.12",
    destPort: 502,
    protocol: "Modbus/TCP",
    lengthBytes: 64,
    info: "FC03 Read Holding Regs (Addr:0x0001)",
    anomalyTau: 0.761,
    status: "LIMIT",
    fcCode: 3,
    regAddr: "0x0001"
  },
  {
    id: "pkt-48908",
    packetNo: 48908,
    timestamp: "14:22:09.401823",
    sourceIp: "10.0.4.55",
    sourcePort: 47808,
    destIp: "10.0.4.255",
    destPort: 47808,
    protocol: "BACnet/IP",
    lengthBytes: 62,
    info: "Who-Is Unconstrained Broadcast",
    anomalyTau: 0.015,
    status: "PASS"
  }
];

export default function LivePacketSnifferDrawer({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [packets, setPackets] = useState<PacketItem[]>(DEFAULT_PACKETS);
  const [selectedPacket, setSelectedPacket] = useState<PacketItem>(DEFAULT_PACKETS[0]);
  const [isCapturing, setIsCapturing] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>("ALL");
  const [bpfFilter, setBpfFilter] = useState<string>("tcp port 502 or udp port 47808 or ether proto 0x88ba");
  const [hexSearch, setHexSearch] = useState<string>("0x10 0x00 0x2b");
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({
    frame: false,
    eth: false,
    ip: false,
    tcp: false,
    modbus: true
  });

  // Background mock or live polling
  useEffect(() => {
    if (!isOpen || !isCapturing) return;

    const interval = setInterval(() => {
      setPackets((prev) => {
        const nextId = prev.length > 0 ? prev[0].packetNo + 1 : 48913;
        const now = new Date();
        const timeStr = `${now.toTimeString().slice(0, 8)}.${String(now.getMilliseconds()).padStart(3, "0")}104`;
        const isMalicious = Math.random() < 0.2;
        const newPkt: PacketItem = {
          id: `pkt-${nextId}`,
          packetNo: nextId,
          timestamp: timeStr,
          sourceIp: isMalicious ? "192.168.100.45" : `10.0.4.${100 + (nextId % 50)}`,
          sourcePort: isMalicious ? 502 : 4840 + (nextId % 100),
          destIp: "10.0.4.12",
          destPort: isMalicious ? 502 : 4840,
          protocol: isMalicious ? "Modbus/TCP" : "OPC-UA",
          lengthBytes: isMalicious ? 78 : 124,
          info: isMalicious
            ? "FC16 Write Multiple (Reg:0x002B, Len:12)"
            : "ReadRequest [NodeId: ns=2;s=Device_Speed]",
          anomalyTau: isMalicious ? 0.942 : 0.038,
          status: isMalicious ? "DROPPED" : "PASS",
          fcCode: isMalicious ? 16 : undefined,
          regAddr: isMalicious ? "0x002b" : undefined
        };
        return [newPkt, ...prev.slice(0, 30)];
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isOpen, isCapturing]);

  if (!isOpen) return null;

  const toggleLayer = (layer: string) => {
    setExpandedLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const filteredPackets = packets.filter((p) => {
    if (activePreset === "ALL") return true;
    if (activePreset === "MODBUS") return p.protocol.includes("Modbus");
    if (activePreset === "OPC-UA") return p.protocol === "OPC-UA";
    if (activePreset === "DNP3") return p.protocol === "DNP3";
    if (activePreset === "BACNET") return p.protocol.includes("BACnet");
    return true;
  });

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#03070c]/80 backdrop-blur-[6px] z-50 transition-opacity"
      />

      {/* Slide-out forensic drawer */}
      <aside className="fixed top-14 bottom-0 right-0 z-50 w-full xl:w-[74%] lg:w-[84%] bg-[#070d14] border-l border-[#00f0ff]/30 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* CRITICAL CONTAINMENT BANNER */}
        <div className="bg-[#ff2a5f]/20 text-[#ff2a5f] px-4 py-1 flex items-center justify-between border-l-2 border-[#00ff66] font-mono text-[11px] shadow-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[15px] text-[#00ff66] animate-pulse">verified_user</span>
            <span className="font-bold text-[#dbfcff]">CRITICAL CONTAINMENT:</span>
            <span className="text-[#ff2a5f] font-bold">192.168.100.45 BANNED VIA KERNEL eBPF XDP</span>
            <span className="text-[#64748b]">(MTTR: 0.082ms)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#00f0ff]">
            <span className="material-symbols-outlined text-[13px]">lock</span>
            <span>SHA-256 ANCHORED TO TPM 2.0</span>
            <span className="px-1.5 py-0.2 rounded bg-[#00ff66] text-[#003911] font-bold uppercase ml-1">
              ENFORCED
            </span>
          </div>
        </div>

        {/* DRAWER HEADER: Status, RingBuffer, Actions */}
        <div className="bg-[#0b131e] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#162536]">
          {/* Title & Interface */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#00f0ff] text-[20px]">troubleshoot</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Orbitron'] text-sm md:text-base font-bold text-[#dbfcff] leading-none">
                  SENTINEL-IoT LIVE PACKET SNIFFER
                </h2>
                <span className="px-1.5 py-0.2 rounded bg-[#070d14] font-mono text-[10px] text-[#00f0ff] border border-[#00f0ff]/30">
                  [PROMISCUOUS: eth0]
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#64748b] mt-0.5">
                AF_XDP Zero-Copy Ingest • Real-time eBPF Dissector • Conformer AI Scoring Engine
              </p>
            </div>
          </div>

          {/* Ring Buffer & Telemetry */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#070d14] border border-[#162536]">
              <span className={`w-2 h-2 rounded-full ${isCapturing ? "bg-[#00ff66] animate-ping" : "bg-[#ffb700]"}`} />
              <span className="font-mono text-[10px] text-[#00ff66] uppercase font-bold tracking-wider">
                {isCapturing ? "CAPTURING" : "PAUSED"}
              </span>
              <span className="text-[#162536]">•</span>
              <span className="font-mono text-[10px] text-[#dee3eb]">14,820 PKTS/S</span>
              <span className="text-[#162536]">•</span>
              <span className="font-mono text-[10px] text-[#00f0ff]">0% LOSS</span>
            </div>

            {/* Buffer bar */}
            <div className="hidden sm:flex flex-col gap-0.5 w-36">
              <div className="flex justify-between font-mono text-[9px]">
                <span className="text-[#64748b]">RINGBUFFER:</span>
                <span className="text-[#dee3eb]">48.2 / 256 MB</span>
              </div>
              <div className="w-full bg-[#070d14] h-1.5 rounded-full overflow-hidden border border-[#162536]">
                <div className="bg-[#00f0ff] h-full w-[18.8%] rounded-full shadow-[0_0_8px_#00f0ff]" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsCapturing(!isCapturing)}
                className="px-2.5 py-1 rounded bg-[#070d14] hover:bg-[#162536] text-[#dee3eb] font-mono text-[10px] border border-[#162536] flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isCapturing ? "pause_circle" : "play_circle"}
                </span>
                <span>{isCapturing ? "Pause" : "Resume"}</span>
              </button>

              <button
                onClick={() => setPackets([])}
                className="px-2.5 py-1 rounded bg-[#070d14] hover:bg-[#162536] text-[#64748b] hover:text-[#dee3eb] font-mono text-[10px] border border-[#162536] flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                <span>Clear</span>
              </button>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded bg-[#070d14] hover:bg-[#ff2a5f]/20 hover:text-[#ff2a5f] text-[#64748b] border border-[#162536] flex items-center justify-center transition-colors ml-1"
                title="Close Sniffer Overlay"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        </div>

        {/* FILTER & BPF QUERY TOOLBAR */}
        <div className="bg-[#070d14] px-4 py-2 flex flex-col gap-2 border-b border-[#162536]">
          <div className="flex flex-wrap items-center gap-2">
            {/* BPF Input */}
            <div className="flex-1 min-w-[260px] flex items-center gap-2 bg-[#0b131e] px-2.5 py-1 rounded border border-[#162536]">
              <span className="font-mono text-[10px] text-[#00f0ff] font-bold uppercase tracking-wider">BPF:</span>
              <input
                type="text"
                value={bpfFilter}
                onChange={(e) => setBpfFilter(e.target.value)}
                className="flex-1 bg-transparent font-mono text-[10px] text-[#00ff66] focus:outline-none"
              />
              <button className="text-[#00ff66] hover:brightness-125 flex items-center" title="Apply Filter">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </button>
            </div>

            {/* Hex / ASCII Search */}
            <div className="w-64 flex items-center gap-2 bg-[#0b131e] px-2.5 py-1 rounded border border-[#162536]">
              <span className="material-symbols-outlined text-[14px] text-[#64748b]">search</span>
              <input
                type="text"
                value={hexSearch}
                onChange={(e) => setHexSearch(e.target.value)}
                placeholder="HEX/ASCII Match (e.g. 0x10, Reg)"
                className="bg-transparent font-mono text-[10px] text-[#dee3eb] placeholder:text-[#64748b] focus:outline-none w-full"
              />
              <span className="font-mono text-[9px] text-[#64748b] shrink-0">3 found</span>
            </div>
          </div>

          {/* Quick Preset Protocol Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="font-mono text-[10px] text-[#64748b] uppercase mr-1">PRESETS:</span>
            {[
              { id: "ALL", label: "ALL (RAW)" },
              { id: "MODBUS", label: "MODBUS/TCP (502)" },
              { id: "OPC-UA", label: "OPC-UA (4840)" },
              { id: "DNP3", label: "DNP3 (20000)" },
              { id: "BACNET", label: "BACnet (47808)" }
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setActivePreset(preset.id)}
                className={`px-2 py-0.5 rounded font-mono text-[9px] transition-all ${
                  activePreset === preset.id
                    ? "bg-[#00ff66] text-[#003911] font-bold shadow-[0_0_10px_rgba(0,255,102,0.35)]"
                    : "bg-[#0b131e] text-[#64748b] hover:text-[#dee3eb] border border-[#162536]"
                }`}
              >
                {preset.label}
              </button>
            ))}
            <div className="ml-auto">
              <span className="px-2 py-0.5 rounded bg-[#ff2a5f]/20 text-[#ff2a5f] font-mono text-[9px] font-bold flex items-center gap-1 border border-[#ff2a5f]/40">
                <span className="material-symbols-outlined text-[12px]">gavel</span>
                <span>eBPF XDP DROP (1 ENFORCED)</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3-PANE INDUSTRIAL PROTOCOL DISSECTOR (WIRESHARK GRADE) */}
        <div className="flex-1 flex flex-col min-h-0 divide-y divide-[#162536]">
          {/* PANE 1: LIVE PACKET STREAM TABLE (Top 38%) */}
          <div className="h-[38%] min-h-[140px] flex flex-col bg-[#070d14] overflow-hidden">
            {/* Table Header */}
            <div className="bg-[#0b131e] px-4 py-1.5 grid grid-cols-12 gap-2 font-mono text-[9px] text-[#64748b] uppercase select-none border-b border-[#162536]">
              <div className="col-span-1">No.</div>
              <div className="col-span-2">Time (UTC μs)</div>
              <div className="col-span-2">Source IP:Port</div>
              <div className="col-span-2">Destination IP:Port</div>
              <div className="col-span-1">Protocol</div>
              <div className="col-span-1 text-right">Len</div>
              <div className="col-span-2">Info / Summary</div>
              <div className="col-span-1 text-right">Anomaly τ</div>
            </div>

            {/* Table Rows */}
            <div className="flex-1 overflow-y-auto font-mono text-[10px] divide-y divide-[#162536]/50">
              {filteredPackets.map((pkt) => {
                const isSelected = selectedPacket?.id === pkt.id;
                const isCrit = pkt.status === "DROPPED";
                return (
                  <div
                    key={pkt.id}
                    onClick={() => setSelectedPacket(pkt)}
                    className={`px-4 py-1 grid grid-cols-12 gap-2 items-center cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#00f0ff]/15 border-l-2 border-[#00f0ff]"
                        : isCrit
                        ? "bg-[#ff2a5f]/15 hover:bg-[#ff2a5f]/25 text-[#ff2a5f]"
                        : "hover:bg-[#162536]/40 text-[#dee3eb]"
                    }`}
                  >
                    <div className="col-span-1 flex items-center gap-1 font-bold">
                      {isCrit && <span className="material-symbols-outlined text-[12px] text-[#ff2a5f]">priority_high</span>}
                      <span>{pkt.packetNo}</span>
                    </div>
                    <div className="col-span-2 text-[#64748b]">{pkt.timestamp}</div>
                    <div className={`col-span-2 ${isCrit ? "text-[#ff2a5f] font-bold" : "text-[#00f0ff]"}`}>
                      {pkt.sourceIp}:{pkt.sourcePort}
                    </div>
                    <div className="col-span-2 text-[#dee3eb]">{pkt.destIp}:{pkt.destPort}</div>
                    <div className="col-span-1 font-bold text-[#ffb700]">{pkt.protocol}</div>
                    <div className="col-span-1 text-right text-[#64748b]">{pkt.lengthBytes}</div>
                    <div className="col-span-2 truncate text-[#dee3eb]">{pkt.info}</div>
                    <div className="col-span-1 text-right">
                      {isCrit ? (
                        <span className="px-1.5 py-0.2 rounded bg-[#ff2a5f] text-[#070d14] font-bold text-[9px]">
                          DROPPED
                        </span>
                      ) : (
                        <span className="text-[#00ff66] text-[9px] font-bold">
                          τ={pkt.anomalyTau} PASS
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PANE 2: HIERARCHICAL PROTOCOL TREE DISSECTION (Middle 34%) */}
          <div className="h-[34%] min-h-[140px] flex flex-col bg-[#0b131e] overflow-hidden">
            <div className="bg-[#070d14] px-4 py-1.5 flex items-center justify-between font-mono text-[10px] border-b border-[#162536]">
              <div className="flex items-center gap-2 text-[#dee3eb]">
                <span className="material-symbols-outlined text-[15px] text-[#00ff66]">account_tree</span>
                <span className="font-bold text-[#00ff66]">DISSECTION TREE: PACKET #{selectedPacket?.packetNo}</span>
                {selectedPacket?.status === "DROPPED" && (
                  <span className="px-1.5 py-0.2 rounded bg-[#ff2a5f]/20 text-[#ff2a5f] text-[9px] font-bold border border-[#ff2a5f]/40">
                    THREAT: ATTACK_MODBUS_EXCURSION
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[#64748b] text-[9px]">
                <span className="text-[#00f0ff]">PAYLOAD CRC: 0x8F2D [VALID]</span>
                <span>•</span>
                <span className="text-[#00ff66] font-bold">{selectedPacket?.lengthBytes || 78} BYTES ON WIRE</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 font-mono text-[10px] text-[#dee3eb] select-text">
              {/* Layer 1: Frame */}
              <div
                onClick={() => toggleLayer("frame")}
                className="flex items-center gap-1 text-[#64748b] hover:text-[#dee3eb] cursor-pointer py-0.5"
              >
                <span className="material-symbols-outlined text-[13px]">
                  {expandedLayers.frame ? "arrow_drop_down" : "arrow_right"}
                </span>
                <span>Frame {selectedPacket?.packetNo}: {selectedPacket?.lengthBytes} bytes on wire (eth0)</span>
              </div>

              {/* Layer 2: Ethernet II */}
              <div
                onClick={() => toggleLayer("eth")}
                className="flex items-center gap-1 text-[#64748b] hover:text-[#dee3eb] cursor-pointer py-0.5"
              >
                <span className="material-symbols-outlined text-[13px]">
                  {expandedLayers.eth ? "arrow_drop_down" : "arrow_right"}
                </span>
                <span>Ethernet II, Src: 00:1a:2b:3c:4d:5e, Dst: 00:0c:29:88:99:aa</span>
              </div>

              {/* Layer 3: IPv4 */}
              <div
                onClick={() => toggleLayer("ip")}
                className="flex items-center gap-1 text-[#64748b] hover:text-[#dee3eb] cursor-pointer py-0.5"
              >
                <span className="material-symbols-outlined text-[13px]">
                  {expandedLayers.ip ? "arrow_drop_down" : "arrow_right"}
                </span>
                <span>IPv4, Src: {selectedPacket?.sourceIp}, Dst: {selectedPacket?.destIp}, TTL: 64, Protocol: TCP</span>
              </div>

              {/* Layer 4: TCP */}
              <div
                onClick={() => toggleLayer("tcp")}
                className="flex items-center gap-1 text-[#64748b] hover:text-[#dee3eb] cursor-pointer py-0.5"
              >
                <span className="material-symbols-outlined text-[13px]">
                  {expandedLayers.tcp ? "arrow_drop_down" : "arrow_right"}
                </span>
                <span>TCP, Src Port: {selectedPacket?.sourcePort}, Dst Port: {selectedPacket?.destPort}, Flags: [PSH, ACK]</span>
              </div>

              {/* Layer 5: Modbus/TCP Expanded */}
              <div className="pt-1">
                <div
                  onClick={() => toggleLayer("modbus")}
                  className="flex items-center gap-1 text-[#00ff66] font-bold cursor-pointer bg-[#070d14] py-1 px-2 rounded border border-[#162536]"
                >
                  <span className="material-symbols-outlined text-[14px] text-[#00ff66]">
                    {expandedLayers.modbus ? "arrow_drop_down" : "arrow_right"}
                  </span>
                  <span>Modbus / TCP (Industrial Automation SCADA Protocol)</span>
                </div>

                {expandedLayers.modbus && (
                  <div className="ml-4 pl-2 border-l-2 border-[#00ff66]/40 space-y-1 py-1 font-mono text-[10px]">
                    <div className="text-[#64748b]">Transaction Identifier: <span className="text-[#dee3eb]">0x1f42 (8002)</span></div>
                    <div className="text-[#64748b]">Protocol Identifier: <span className="text-[#dee3eb]">0 (Modbus protocol)</span></div>
                    <div className="text-[#64748b]">Length: <span className="text-[#dee3eb]">13 bytes</span></div>
                    <div className="text-[#64748b]">Unit Identifier: <span className="text-[#dee3eb]">1 (Main Hydraulic Controller)</span></div>

                    <div className="bg-[#ff2a5f]/15 border border-[#ff2a5f]/30 p-2 rounded text-[#ff2a5f]">
                      <div className="font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">warning</span>
                        Function Code: 16 (Write Multiple Registers - 0x10)
                      </div>
                      <div className="ml-4 text-[#dee3eb]">Reference Address: <span className="text-[#00f0ff]">0x002b</span> (Actuator Setpoint Target)</div>
                      <div className="ml-4 text-[#dee3eb]">Word Count: 0x0006 (6 words / 12 registers)</div>
                      <div className="ml-4 text-[#ff2a5f] font-bold">
                        Payload: 44 7a 00 00 7f ff 00 00 80 00 00 00 [CRITICAL: ACTUATOR OVER-PRESSURE THRESHOLD]
                      </div>
                    </div>

                    <div className="p-1.5 bg-[#070d14] rounded border border-[#162536] flex items-center justify-between text-[9px]">
                      <div className="flex items-center gap-1 text-[#00f0ff]">
                        <span className="material-symbols-outlined text-[13px]">psychology</span>
                        <span>XAI Conformer Attribution: <strong className="text-[#ff2a5f]">modbus_fc_code (0.942)</strong> + <strong className="text-[#ffb700]">sub_reg_delta_0x002B (0.887)</strong></span>
                      </div>
                      <span className="text-[#00ff66] font-bold">DECISION: eBPF KERNEL DROP</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PANE 3: DUAL RAW HEX DUMP & ASCII DECODER (Bottom 28%) */}
          <div className="h-[28%] min-h-[120px] flex flex-col bg-[#070d14] overflow-hidden">
            <div className="bg-[#0b131e] px-4 py-1 flex items-center justify-between font-mono text-[9px] border-b border-[#162536]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px] text-[#00f0ff]">terminal</span>
                <span className="font-bold text-[#dbfcff]">RAW HEX / ASCII INSPECTION (78 BYTES)</span>
                <span className="text-[#64748b]">HEX COORD [0x0000..0x004E]</span>
                <span className="bg-[#ff2a5f]/20 text-[#ff2a5f] px-1 py-0.2 rounded border border-[#ff2a5f]/40">
                  Offset 0x0036 : 0x10 0x00 0x2b 0x00 0x06 (Modbus Write FC16)
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#00f0ff]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping"></span>
                <span>HEX VIEW: 16-BYTE ALIGNED</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-1.5 font-mono text-[10px] leading-tight select-text bg-[#070d14] space-y-1">
              <div className="flex items-center text-[#64748b]">
                <span className="w-12 text-[#64748b]">0000</span>
                <span className="flex-1 text-[#dee3eb]">00 1a 2b 3c 4d 5e 00 0c  29 88 99 aa 08 00 45 00</span>
                <span className="w-44 text-[#64748b] border-l border-[#162536] pl-2">..+&lt;M^.. ).....E.</span>
              </div>
              <div className="flex items-center text-[#64748b]">
                <span className="w-12 text-[#64748b]">0010</span>
                <span className="flex-1 text-[#dee3eb]">00 4e 9a 12 40 00 40 06  3c 1a c0 a8 64 2d 0a 00</span>
                <span className="w-44 text-[#64748b] border-l border-[#162536] pl-2">.N..@.@. &lt;...d-..</span>
              </div>
              <div className="flex items-center text-[#64748b]">
                <span className="w-12 text-[#64748b]">0020</span>
                <span className="flex-1 text-[#dee3eb]">04 0c 01 f6 01 f6 1a 42  58 09 00 00 00 00 80 18</span>
                <span className="w-44 text-[#64748b] border-l border-[#162536] pl-2">.......B X.......</span>
              </div>
              <div className="flex items-center text-[#64748b] bg-[#ff2a5f]/15 py-0.5 rounded">
                <span className="w-12 text-[#ff2a5f] font-bold">0030</span>
                <span className="flex-1 text-[#dee3eb]">
                  01 f5 7e 8a 00 00 1f 42  00 00 00 0d 01 <span className="bg-[#ff2a5f] text-[#070d14] font-bold px-0.5 rounded">10 00 2b</span>
                </span>
                <span className="w-44 text-[#dee3eb] border-l border-[#162536] pl-2 font-mono">
                  ..~....B .....<span className="text-[#ff2a5f] font-bold">.+</span>
                </span>
              </div>
              <div className="flex items-center text-[#64748b] bg-[#ff2a5f]/10 py-0.5 rounded">
                <span className="w-12 text-[#ff2a5f]">0040</span>
                <span className="flex-1 text-[#dee3eb]">
                  <span className="bg-[#00ff66] text-[#003911] font-bold px-0.5 rounded">00 06 0c</span> <span className="text-[#ff2a5f] font-bold">44 7a 00 00 7f ff 00 00 80 00 00 00</span>
                </span>
                <span className="w-44 text-[#ff2a5f] font-bold border-l border-[#162536] pl-2">
                  ...Dz... .. ....
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DRAWER FOOTER: Quick Mitigation & Socket Terminal */}
        <div className="bg-[#0b131e] px-4 py-2 flex flex-wrap items-center justify-between text-[#64748b] font-mono text-[10px] border-t border-[#162536]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[#00ff66] font-bold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              eBPF XDP DROP RULE #741 COMMITTED & LOCKED
            </span>
            <span>•</span>
            <span className="text-[#00f0ff]">HARDWARE NIC OFFLOAD ACTIVE</span>
            <span>•</span>
            <span className="text-[#dbfcff] font-bold">0 PKTS LEAKED</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded bg-[#00ff66] text-[#003911] font-mono text-[10px] font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(0,255,102,0.4)]">
              <span className="material-symbols-outlined text-[13px]">lock</span>
              <span>eBPF XDP HARDWARE DROP ACTIVE // 192.168.100.45 BANNED</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

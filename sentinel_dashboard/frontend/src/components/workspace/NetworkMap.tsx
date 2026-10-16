"use client";

import { domainLabel, type Section } from "@/lib/assistant";
import type { DomainType } from "@/types/sentinel";

const nodes: { domain: DomainType; x: number; y: number; label: string; tag: string }[] = [
  { domain: "Network_Traffic", x: 116, y: 113, label: "Network traffic", tag: "TCP / UDP" },
  { domain: "IoT_Modbus", x: 137, y: 287, label: "Industrial IoT", tag: "MODBUS / PLC" },
  { domain: "Linux_process", x: 596, y: 108, label: "Host systems", tag: "LINUX / WINDOWS" },
  { domain: "IoT_Thermostat", x: 583, y: 285, label: "Smart sensors", tag: "7 IOT DOMAINS" },
];

export default function NetworkMap({ domain, onSelect, onNavigate }: { domain: DomainType; onSelect: (domain: DomainType) => void; onNavigate?: (section: Section) => void }) {
  return <div className="network-visual"><svg viewBox="0 0 720 390" role="img" aria-labelledby="topology-title topology-desc">
    <title id="topology-title">Sentinel telemetry architecture</title><desc id="topology-desc">Illustrated pipeline connecting network traffic, industrial IoT, host systems and smart sensors to the Conformer analysis core. Select a source using the buttons below.</desc>
    <defs><pattern id="map-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="#77776b" opacity="0.3" /></pattern><radialGradient id="core-glow"><stop stopColor="#b3df93" stopOpacity="0.13" /><stop offset="1" stopColor="#b3df93" stopOpacity="0" /></radialGradient><linearGradient id="chip-top" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4f5744" /><stop offset="1" stopColor="#2c3029" /></linearGradient><linearGradient id="core-line"><stop stopColor="#b3df93" stopOpacity="0.1" /><stop offset="0.5" stopColor="#b3df93" /><stop offset="1" stopColor="#b3df93" stopOpacity="0.1" /></linearGradient></defs>
    <rect width="720" height="390" fill="url(#map-grid)" /><ellipse cx="360" cy="195" rx="200" ry="165" fill="url(#core-glow)" />
    <g fill="none" stroke="#55574a" strokeWidth="1"><ellipse cx="360" cy="207" rx="185" ry="95" strokeDasharray="3 7" /><ellipse cx="360" cy="207" rx="136" ry="69" /><path d="M116 138V179H265L305 203M137 263V240H250L305 216M596 133V176H457L415 200M583 260V242H467L415 218" /><path d="M360 48V90M360 300V343M200 207H160M520 207H560" stroke="#777765" /></g>
    <g className="map-flow" fill="none" stroke="url(#core-line)" strokeWidth="2" strokeDasharray="5 100"><path d="M116 138V179H265L305 203M137 263V240H250L305 216M596 133V176H457L415 200M583 260V242H467L415 218" /></g>
    <g className="chip-assembly"><path d="M278 227 360 274 442 227 360 180Z" fill="#252722" stroke="#65735a" /><path d="M278 215 360 262 442 215 360 168Z" fill="#353b2e" stroke="#849776" /><path d="M278 215V227L360 274V262Z" fill="#34382d" stroke="#65735a" /><path d="M360 262 442 215V227L360 274Z" fill="#272b23" stroke="#65735a" />
      {Array.from({ length: 7 }, (_, i) => <g key={i} stroke="#c5ba89" strokeWidth="2"><path d={`M${288 + i * 10} ${233 + i * 5.7}v9l-9 5`} /><path d={`M${432 - i * 10} ${233 + i * 5.7}v9l9 5`} /></g>)}
      <path d="M294 185 360 224 426 185 360 147Z" fill="url(#chip-top)" stroke="#b3df93" strokeOpacity=".7" /><path d="M294 185V197L360 236V224ZM360 224 426 185V197L360 236Z" fill="#30382c" stroke="#788b69" /><path d="M310 183 360 211 410 183 360 155Z" fill="none" stroke="#b3df93" strokeOpacity=".25" />
      <g transform="translate(360 181)"><path d="m0-16 22 13L0 10-22-13Z" fill="#ff9985" /><path d="m-22-3 22 13V20L-22 7ZM0 10 22-3V7L0 20Z" fill="#df7e6e" /><path d="m0-16 8 5-22 13-8-5Z" fill="#ffd0b3" opacity=".5" /></g>
    </g>
    {nodes.map((node, i) => <g key={node.domain} transform={`translate(${node.x},${node.y})`}><rect x="-27" y="-25" width="54" height="48" rx="7" fill="#2c2e28" stroke={node.domain === domain ? "#b3df93" : "#626453"} /><g fill="none" stroke={i === 1 ? "#ff9985" : "#b3df93"} strokeWidth="1.4">{i === 0 ? <><rect x="-12" y="-9" width="24" height="14" rx="2" /><path d="M-8-4H8M-6 10H6M0 5V10" /></> : i === 1 ? <><rect x="-10" y="-11" width="20" height="24" rx="2" /><path d="M-6-6H6M-6 0H6M-6 6H0" /><circle cx="6" cy="7" r="1" /></> : i === 2 ? <><rect x="-12" y="-12" width="24" height="9" rx="2" /><rect x="-12" y="2" width="24" height="9" rx="2" /><path d="M-8-7H-6M-8 6H-6" /></> : <><path d="M-10-3a10 10 0 0 1 20 0M-6 1a6 6 0 0 1 12 0" /><circle cy="7" r="2" /></>}</g><text y="44" textAnchor="middle" fill="#e5e4d9" fontSize="11">{node.label}</text><text y="60" textAnchor="middle" fill="#aaa99b" fontSize="8" fontFamily="monospace" letterSpacing="1">{node.tag}</text><circle cx="23" cy="-21" r="3" fill="#b3df93" /></g>)}
    <text x="360" y="91" textAnchor="middle" fill="#b5b5a6" fontSize="8" fontFamily="monospace" letterSpacing="2">ONE INTELLIGENT PERIMETER</text><text x="360" y="316" textAnchor="middle" fill="#e8e6db" fontSize="12" letterSpacing="1">SENTINEL CORE</text><text x="360" y="334" textAnchor="middle" fill="#a8b49a" fontSize="8" fontFamily="monospace" letterSpacing="1">DETECT · EXPLAIN · RESPOND</text>
  </svg><div className="map-source-picker" aria-label="Select a telemetry source">{nodes.map(node => <button key={node.domain} aria-pressed={domain === node.domain} onClick={() => onSelect(node.domain)}>{node.label}</button>)}{onNavigate && <button onClick={() => onNavigate("network")}>All sources ↗</button>}</div><p className="diagram-note">Architecture illustration · Selected: {domainLabel(domain)}</p></div>;
}

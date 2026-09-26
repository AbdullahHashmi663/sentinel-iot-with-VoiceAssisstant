// ==============================================================================
// SENTINEL-IOT: UNIVERSAL TYPESCRIPT DATA CONTRACTS (SECTION 4.1)
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

export type ConsoleType =
  | 'overview'
  | 'threat_lab'
  | 'xai'
  | 'adversarial'
  | 'remediation'
  | 'compliance'
  | 'execute';

export type DomainType =
  | 'Network_Traffic'
  | 'IoT_Modbus'
  | 'IoT_Fridge'
  | 'IoT_GPS_Tracker'
  | 'IoT_Garage_Door'
  | 'IoT_Motion_Light'
  | 'IoT_Thermostat'
  | 'IoT_Weather'
  | 'Linux_process'
  | 'Linux_disk'
  | 'Linux_memory'
  | 'Windows_10'
  | 'Windows_7';

export type AttackClass =
  | 'normal'
  | 'ddos'
  | 'dos'
  | 'scanning'
  | 'password'
  | 'injection'
  | 'xss'
  | 'backdoor'
  | 'ransomware'
  | 'mitm';

export interface SaliencyFeature {
  featureName: string;
  importanceScore: number; // Percentage contribution [0 - 100%]
}

export interface ComplianceAudit {
  nistControlId: string;    // e.g. "SC-5", "SI-3"
  nistControlName: string;  // e.g. "Denial of Service Protection"
  isoControlId: string;     // e.g. "A.12.1.3"
  auditBlockHash: string;   // SHA-256 Merkle chain hash
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  domain: DomainType;
  deviceId: string;
  sourceIp: string;
  targetIp: string;
  processId?: number;
  features: number[];

  // Dual-Head Conformer Model Outputs
  anomalyProbability: number; // Tau score in range [0.0, 1.0]
  isAnomaly: boolean;        // True if Tau > 0.85
  severity?: 'NORMAL' | 'WARNING' | 'CRITICAL';
  predictedClass: AttackClass;
  confidence: number;

  // Sub-Millisecond Explainability (XAI)
  saliencyTopFeatures: SaliencyFeature[];
  xaiLatencyMs: number; // Profiled execution speed (~0.78 ms)

  // Autonomous Active Containment Status
  remediationStatus: 'NONE' | 'WARNING_LOGGED' | 'ACTIVE_BLOCKED' | 'INTERLOCK_PENDING' | 'REVOKED';
  remediationAction: string; // e.g., "iptables -A INPUT -s 192.168.100.10 -j DROP"
  mttrLatencyMs: number;     // Mean Time to Respond (~21.5 ms)

  // Regulatory Compliance & Cryptographic Audit
  compliance: ComplianceAudit;
}

export interface ActiveRule {
  id: string;
  timestamp: string;
  threatType: AttackClass;
  targetIp: string;
  targetPid?: number;
  command: string;
  status: 'ACTIVE_BLOCKED' | 'REVOKED' | 'OVERRIDDEN';
  operatorBadge?: string;
  nistControl: string;
  isoControl: string;
}

export interface AdversarialState {
  epsilon: number;           // Noise budget [0.01 - 0.15]
  attackType: 'FGSM' | 'PGD_20';
  isAttacking: boolean;
  conformerAcc: number;      // e.g., 96.8%
  cnnAcc: number;            // e.g., 41.2%
  bilstmAcc: number;         // e.g., 46.8%
  ksPValue: number;          // Kolmogorov-Smirnov p > 0.05
  psiScore: number;          // Population Stability Index < 0.10
}

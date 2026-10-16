import { domains } from "./assistant";
import type { AttackClass, DomainType, TelemetryEvent } from "@/types/sentinel";
// Match the Python producer's actual payload; incomplete sequence windows are not detections.
export function normalizeTelemetry(d: Record<string, unknown>): TelemetryEvent | null {
  if (!d.inference || typeof d.inference !== "object" || !domains.includes(d.domain as DomainType)) return null;
  const inf = d.inference as Record<string, unknown>;
  const mitigation = (d.mitigation || {}) as Record<string, unknown>;
  const score = Number(inf.anomaly_probability);
  if (!Number.isFinite(score) || score < 0 || score > 1) return null;
  const names = Array.isArray(d.feature_names) ? d.feature_names : [];
  const saliency = Array.isArray(inf.saliency_attributions) ? inf.saliency_attributions : [];
  const status = mitigation.remediation_status;
  return {
    id: `backend_${Date.now()}_${crypto.randomUUID()}`, timestamp: new Date().toISOString(), domain: d.domain as DomainType,
    deviceId: `sensor_${String(d.domain).toLowerCase()}_01`, sourceIp: String(d.source_ip || "Unknown"), targetIp: "Backend source",
    processId: typeof d.pid === "number" ? d.pid : undefined,
    features: Array.isArray(d.raw_features) ? d.raw_features : [], anomalyProbability: score,
    isAnomaly: inf.is_anomaly === true || score > 0.85, severity: score > 0.85 ? "CRITICAL" : score > 0.5 ? "WARNING" : "NORMAL",
    predictedClass: String(inf.forensic_label || "normal").toLowerCase() as AttackClass, confidence: Number(inf.forensic_confidence || 0),
    saliencyTopFeatures: saliency.map((importance, index) => ({ featureName: String(names[index] || `Feature ${index + 1}`), importanceScore: Number(importance) * 100 })).filter(f => Number.isFinite(f.importanceScore)).sort((a, b) => b.importanceScore - a.importanceScore).slice(0, 6),
    xaiLatencyMs: Number(inf.xai_latency_ms || 0), mttrLatencyMs: Number(mitigation.mttr_ms || 0),
    remediationStatus: status === "ACTIVE_BLOCKED" ? "ACTIVE_BLOCKED" : status === "INTERLOCK_PENDING" ? "INTERLOCK_PENDING" : status === "WARNING_RAISED" ? "WARNING_LOGGED" : "NONE",
    remediationAction: String(mitigation.remediation_action || "No response reported"),
    compliance: { nistControlId: String(mitigation.nist_control || "Unmapped"), nistControlName: String(mitigation.nist_description || ""), isoControlId: String(mitigation.iso_control || "Unmapped"), auditBlockHash: String(mitigation.block_hash || "") },
  };
}

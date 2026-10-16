import { domains, type AssistantContext } from "./assistant";
import type { LocalAiStatus } from "./local-ai";

export interface BackendReadiness { reachable: boolean; loadedDomains: string[]; mode: "simulator" | "live_host" | "unknown" }
export interface SystemReadiness { checkedAt: string; backend: BackendReadiness; assistant: LocalAiStatus }

export function backendReadiness(value: unknown): BackendReadiness {
  const unavailable: BackendReadiness = { reachable: false, loadedDomains: [], mode: "unknown" };
  if (!value || typeof value !== "object") return unavailable;
  const data = value as Record<string, unknown>;
  if (data.status !== "ONLINE" || !Array.isArray(data.loaded_domains)) return unavailable;
  return { reachable: true, loadedDomains: data.loaded_domains.filter((d): d is string => typeof d === "string" && domains.some(domain => domain === d)), mode: data.mode === "simulator" || data.mode === "live_host" ? data.mode : "unknown" };
}

export function feedReadiness(c: Pick<AssistantContext, "demo" | "connected" | "paused"> & { ready: boolean; stale: boolean; lastSeen: number | null }) {
  if (!c.ready) return { label: "Starting feed", tone: "neutral", detail: "Loading your saved source preference." };
  if (!c.demo && !c.connected) return { label: "Feed disconnected", tone: "attention", detail: "Start the project launcher, then reconnect the feed or use the demo." };
  if (c.paused) return { label: "Feed paused", tone: "neutral", detail: "Updates are intentionally paused. Resume whenever you are ready." };
  if (c.stale) return { label: "No recent observations", tone: "attention", detail: "The connection is open, but observations have stopped arriving. Check the backend terminal or reconnect." };
  if (c.lastSeen === null) return { label: "Waiting for observations", tone: "neutral", detail: "The connection alone does not confirm predictions. The detection engine needs ten samples before producing an observation." };
  return c.demo ? { label: "Demo feed ready", tone: "ready", detail: "Generated samples are arriving. No physical device connection is implied." } : { label: "Observations arriving", tone: "ready", detail: "Valid observations are reaching this dashboard. The backend may be replaying a dataset." };
}

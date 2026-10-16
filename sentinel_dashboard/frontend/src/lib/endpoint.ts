export interface EndpointMetrics {
  hostName: string; os: string; cpuPercent: number; memoryPercent: number; diskPercent: number;
  memoryUsedGb: number; memoryTotalGb: number; networkUpKbps: number; networkDownKbps: number; uptimeSec: number; cpuCores: number;
}
export interface ResourceAlert { id: string; title: string; detail: string; value: number; kind: "resource" }
export interface ClientStatus {
  paired: boolean; relayState: "unpaired" | "paused" | "revoked" | "connected" | "retrying"; sharingPaused: boolean;
  device: { id: string | null; name: string }; serverUrl: string; sampledAt: number | null; lastSent: number | null;
  error: string | null; metrics: EndpointMetrics | null; alerts: ResourceAlert[];
  history: { time: number; cpu: number; memory: number }[];
}
export interface FleetDevice { id: string; name: string; status: "waiting" | "online" | "offline" | "revoked"; createdAt: number; lastSeen: number | null; metrics: EndpointMetrics | null; alerts: ResourceAlert[] }
export const formatAge = (time: number | null, now: number) => time === null ? "Not received yet" : `${Math.max(0, Math.floor(now - time))}s ago`;
export const formatUptime = (seconds: number) => `${Math.floor(seconds / 86400)}d ${Math.floor(seconds % 86400 / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`;

export function clientGuide(query: string, status: ClientStatus | null) {
  const q = query.toLowerCase().trim();
  if (/\b(don't|do not|never)\b/.test(q)) return { reply: "Understood. I have not changed sharing." };
  if (/^(?:please )?(?:pause|stop) (?:sharing|sending|reports)(?: please)?[.!?]*$/.test(q)) return { action: "pause" as const, reply: "Pause sharing" };
  if (/^(?:please )?(?:resume|start) (?:sharing|sending|reports)(?: please)?[.!?]*$/.test(q)) return { action: "resume" as const, reply: "Resume sharing" };
  if (/pair|connect|setup/.test(q)) return { reply: "Create a client key in the main dashboard’s Client machines page. On this computer, establish the private SSH tunnel or HTTPS relay connection, then enter the relay address and key in Connection. A pairing key can be used once." };
  if (/privacy|share|collect|data/.test(q)) return { reply: "This client shares its device name, operating system, uptime, CPU, memory, storage use, and network transfer rates. It does not collect file contents, process lists, browsing history, or packet contents. Pause sharing to keep future measurements on this computer. One report already in flight may still finish." };
  if (/alert|warning|safe|threat/.test(q)) return { reply: !status?.metrics ? "I do not have a current client sample. Check the local agent and its connection before assessing resource warnings." : status.alerts.length ? `${status.alerts.map(alert => `${alert.title}: ${alert.detail}`).join(" ")} These are resource warnings, not malware detections.` : "There are no current resource warnings in the latest available sample. This does not establish that the computer is free of threats. This client view currently reports health measurements, not Conformer threat predictions." };
  if (/summary|status|doing|health|happening/.test(q) && status?.metrics) return { reply: `${status.device.name}: CPU ${status.metrics.cpuPercent.toFixed(1)}%, memory ${status.metrics.memoryPercent.toFixed(1)}%, storage ${status.metrics.diskPercent.toFixed(1)}%. Sharing is ${status.relayState}. ${status.error || "These are measurements from this client agent."}` };
  return { reply: "I’m Mereoleona, your local client guide. Ask about your computer’s health, resource alerts, pairing, or privacy. You can also say ‘pause sharing’ or ‘resume sharing’. Your main control room manages enrollment and access." };
}

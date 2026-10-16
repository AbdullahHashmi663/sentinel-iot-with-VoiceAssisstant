import type { DomainType, TelemetryEvent } from "@/types/sentinel";

export const sections = ["overview", "network", "incidents", "intelligence", "response", "compliance", "settings", "lab"] as const;
export type Section = typeof sections[number];
export const domains: DomainType[] = ["Network_Traffic", "IoT_Modbus", "IoT_Fridge", "IoT_GPS_Tracker", "IoT_Garage_Door", "IoT_Motion_Light", "IoT_Thermostat", "IoT_Weather", "Linux_process", "Linux_disk", "Linux_memory", "Windows_10", "Windows_7"];
export const domainLabel = (domain: string) => domain.replaceAll("_", " ").replace("IoT ", "");
export type AssistantAction =
  | { type: "navigate"; section: Section }
  | { type: "mode"; demo: boolean }
  | { type: "playback"; paused: boolean }
  | { type: "domain"; domain: DomainType }
  | { type: "undo" }
  | { type: "readiness" }
  | { type: "tour" }
  | { type: "simulate" }
  | { type: "export" };
export interface AssistantContext { demo: boolean; connected: boolean; paused: boolean; domain: DomainType; section: Section; events: number; anomalies: number; latest: TelemetryEvent | null; selected?: TelemetryEvent | null }
export interface AssistantReply { reply: string; source: "local-guide" | "ollama"; action?: AssistantAction; model?: string }

export function selectLocalModel(models: { name?: string; remote_host?: string; remote_model?: string }[], desired?: string) {
  return models.find(model => typeof model.name === "string" && !/cloud|embed|vision-only/i.test(model.name) && !model.remote_host && !model.remote_model && (!desired || model.name === desired))?.name;
}

export function localConversationHistory(value: unknown): { role: "user" | "assistant"; content: string }[] {
  if (!Array.isArray(value)) return [];
  const messages: { role: "user" | "assistant"; content: string }[] = [];
  let remaining = 4800;
  for (const item of value.slice(-8).reverse()) {
    if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") continue;
    const content = item.content.slice(0, Math.min(1500, remaining));
    if (!content) break;
    messages.unshift({ role: item.role, content });
    remaining -= content.length;
  }
  return messages;
}

// The model only writes explanations. Application actions come from this allowlist.
export function resolveCommand(query: string): AssistantReply | null {
  const q = query.toLowerCase().trim();
  const result = (reply: string, action?: AssistantAction): AssistantReply => ({ reply, source: "local-guide", action });
  if (/\b(cancel|no thanks)\b/.test(q) || /\b(don't|do not|never)\s+(undo|revert|check|start|enable|switch|try|use|open|run|export|download|pause|stop|resume|connect|select|simulate|shut|shutdown|block|kill)\b/.test(q)) return result("Understood. I haven't changed the workspace. Tell me what you'd like to explore instead.");
  if (/^(?:please\s+|(?:can|could|would) you\s+)?(?:undo(?:\s+(?:that|the last(?: action| change)?|my last change))?|revert (?:that|the last change)|go back)(?:\s+please)?[.!?]*$/.test(q)) return result("I'll check the last reversible workspace change.", { type: "undo" });
  if ((/\b(check|show|open|run)\b/.test(q) && /\b(readiness|system check|system status|startup|setup status)\b/.test(q)) || /^is (?:everything|sentinel|the system) ready[?!.]*$/.test(q)) return result("Opening the system check. It checks local services and shows whether observations are arriving, with recovery steps for anything unavailable.", { type: "readiness" });
  if (/\b(delete|shutdown|shut down|kill|block|isolate|lockdown|unblock)\b/.test(q)) return result("I can help you investigate, but I cannot shut down devices, block traffic, or change host processes through chat. Review the response workspace and have a qualified operator verify the target and impact first.", { type: "navigate", section: "response" });
  if (/\b(tour|walk me through|show me around|getting started|guide me)\b/.test(q)) return result("Let's take it one step at a time. I'll show you the overview, your telemetry sources, and how to understand an alert.", { type: "tour" });
  if (/\b(export|download)\b/.test(q) && /\b(report|events|snapshot|data)\b/.test(q)) return result("I've downloaded a JSON snapshot of the displayed events. It includes the data source and export time; it is an observation record, not a compliance certificate.", { type: "export" });
  if (/\b(start|enable|switch|try|use|open|run)\b/.test(q) && /\b(demo|demonstration|sample)\b/.test(q)) return result("Switching to the demo. All events are generated sample data, and no device or network is changed.", { type: "mode", demo: true });
  if (/\b(connect|switch|use|enable|start)\b/.test(q) && /\b(backend|live|real data)\b/.test(q)) return result("I'll connect to your local Sentinel backend. The connection badge will confirm whether it is reachable. Backend telemetry may be dataset replay; it is not necessarily a live device feed.", { type: "mode", demo: false });
  if (/\b(pause|stop)\b/.test(q) && /\b(telemetry|feed|stream|updates|replay)\b/.test(q)) return result("Telemetry updates are paused. Your current snapshot remains available to inspect.", { type: "playback", paused: true });
  if (/\b(resume|continue|restart)\b/.test(q) && /\b(telemetry|feed|stream|updates|replay)\b/.test(q)) return result("Resuming telemetry updates.", { type: "playback", paused: false });
  if (/\b(simulate|simulation|test attack|run a test)\b/.test(q)) return result("I can add a simulated threat to the demo to show how detection and explanation work. Review the confirmation first. This never sends an attack to a real device.", { type: "simulate" });
  if (/\b(switch|select|monitor|show|watch)\b/.test(q)) {
    const aliases: [RegExp, DomainType][] = [[/modbus|\bplc\b/, "IoT_Modbus"], [/thermostat/, "IoT_Thermostat"], [/weather/, "IoT_Weather"], [/fridge/, "IoT_Fridge"], [/\bgps\b/, "IoT_GPS_Tracker"], [/garage/, "IoT_Garage_Door"], [/motion/, "IoT_Motion_Light"], [/linux.*disk/, "Linux_disk"], [/linux.*memory/, "Linux_memory"], [/linux.*process/, "Linux_process"], [/windows 10/, "Windows_10"], [/windows 7/, "Windows_7"], [/network traffic/, "Network_Traffic"]];
    const match = aliases.find(([pattern]) => pattern.test(q));
    if (match) return result(`Selecting ${domainLabel(match[1])}. Demo mode generates sample events for this domain; the backend uses its configured data source.`, { type: "domain", domain: match[1] });
  }
  if (/\b(open|show|go to|take me|navigate)\b/.test(q)) {
    const targets: [RegExp, Section][] = [[/network|topology|devices|assets/, "network"], [/incident|alert|threat/, "incidents"], [/intelligence|explain|saliency|xai/, "intelligence"], [/response|remediation|playbook/, "response"], [/compliance|audit|evidence/, "compliance"], [/setting|configuration/, "settings"], [/lab|advanced|adversarial/, "lab"], [/overview|dashboard|home/, "overview"]];
    const match = targets.find(([pattern]) => pattern.test(q));
    if (match) return result(`Opening ${match[1]}. You can ask me to explain anything you see.`, { type: "navigate", section: match[1] });
  }
  return null;
}

export const knowledge = [
  { title: "Readiness and undo", text: "Ask 'check system readiness' to open Settings and check the local backend, detection model, assistant model, and telemetry feed. A reachable service does not prove that observations are arriving or a network is safe. Say 'undo that' or use the workspace Undo button to reverse the most recent navigation, source, domain, or pause change. Up to ten changes are held in page memory. Undo restores settings, not deleted observations, downloaded files, simulations, or host actions. Source or domain changes start a fresh observation window." },
  { title: "Getting started", text: "Sentinel is a research dashboard for understanding unusual activity in IoT and computer telemetry. Start with the demo, inspect the overview, select a source, review incidents, then open Intelligence for the reasons behind a detection. Sample data never proves your real network is safe." },
  { title: "Local backend setup", text: "On Windows run START_SENTINEL_DASHBOARD.bat from the project root. The FastAPI backend listens on 127.0.0.1:8000 and the frontend on port 3000. The backend can replay TON_IoT datasets or monitor the host. Use Settings to connect. If disconnected, check the launcher terminal and dependencies. The dashboard cannot launch OS processes from chat." },
  { title: "Private assistant setup", text: "The Windows project launcher starts private Ollama locally on 127.0.0.1:11434 when installed. This machine is configured for the compact qwen2.5:1.5b model; downloading its weights is required before conversational replies are available. SENTINEL_OLLAMA_MODEL in frontend/.env.local selects an installed model. The assistant badge and message source show whether the model or built-in guide answered. Without Ollama, the built-in local guide supports navigation, summaries, setup help, and demonstrations. No cloud AI fallback is used. Microphone input is available only when the browser supports on-device speech recognition. Spoken output is restricted to local system voices." },
  { title: "Anomaly and confidence", text: "The Conformer processes sequences of ten observations. An anomaly score is a model estimate between zero and one, not proof of an attack. The existing engine applies its own threshold and outputs a forensic class. Confidence describes model certainty, not guaranteed correctness. Investigate the source and feature attribution before taking action." },
  { title: "Explainable intelligence", text: "Gradient saliency highlights input features that influenced the model. The Intelligence view shows the actual latest event's feature names, importance values, confidence, and measured attribution latency when supplied. Saliency is evidence about model behavior, not a causal explanation or automatic proof of compromise." },
  { title: "Response and safety", text: "The response view displays mitigation statuses reported in event records. A blocked status in demo means simulated containment. Backend records must be independently verified before claiming firewall enforcement. Chat cannot execute arbitrary shell commands, firewall changes, shutdowns, or host process termination. The advanced workspace retains legacy research tools." },
  { title: "Evidence and compliance", text: "The evidence view maps event records to the control identifiers returned by the engine. Mapping is not certification, proof of compliance, or verification of a Merkle chain. Export downloads the currently retained events, their source, and an export timestamp as JSON. Only the most recent fifty records are held by the dashboard." },
  { title: "Telemetry domains", text: "Thirteen supported sources cover Network Traffic, Modbus, Fridge, GPS Tracker, Garage Door, Motion Light, Thermostat, Weather, Linux process, Linux disk, Linux memory, Windows 10, and Windows 7. The network diagram illustrates this pipeline; it is not automatic discovery of physical devices." },
];

export function guideAnswer(query: string, c: AssistantContext): AssistantReply {
  const q = query.toLowerCase();
  const observation = /this observation|selected observation/.test(q) ? c.selected : c.latest;
  let reply: string;
  if (/\b(hi|hello|hey|thanks|thank you)\b/.test(q) && q.length < 35) reply = "I'm here to help you use Sentinel. Ask me for a tour, a summary of your telemetry, or help understanding an alert. You don't need to know the technical terms.";
  else if (/status|summar|safe|happening|brief|health/.test(q)) reply = `You're viewing ${c.demo ? "generated demo data" : c.connected ? "telemetry from the local backend" : "an offline snapshot; the backend is disconnected"}${c.paused ? ", with updates paused" : ""}. There are ${c.events} retained observations and ${c.anomalies} flagged anomalies for ${domainLabel(c.domain)}. ${c.events ? "These observations alone cannot establish whether a real network is safe." : "No observations are available yet. Try the demo or connect your backend."}`;
  else if (/latest|alert|incident|anomal|confidence|score|this observation/.test(q) && observation) reply = `The ${/this observation|selected observation/.test(q) ? "selected" : "latest"} ${c.demo ? "demo " : ""}observation is ${observation.isAnomaly ? `flagged as ${observation.predictedClass}` : "within the model's normal range"}, with an anomaly score of ${(observation.anomalyProbability * 100).toFixed(1)}%. The source is ${observation.sourceIp}. ${observation.saliencyTopFeatures.length ? `The strongest reported feature is ${observation.saliencyTopFeatures[0].featureName}.` : "Feature attribution is not available for this observation."} A flag is a reason to investigate, not proof of an attack.`;
  else {
    const terms = q.match(/[a-z0-9]+/g)?.filter(t => t.length > 3) || [];
    const ranked = knowledge.map(doc => ({ ...doc, score: terms.reduce((sum, term) => sum + (`${doc.title} ${doc.text}`.toLowerCase().includes(term) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score);
    reply = ranked[0].score ? ranked[0].text : "I can help with this project: try ‘give me a tour’, ‘summarize my telemetry’, ‘explain the latest alert’, or ‘how do I connect the backend?’. For open-ended conversation, connect a local Ollama model in Settings. I won't invent information about your devices.";
  }
  return { reply, source: "local-guide" };
}

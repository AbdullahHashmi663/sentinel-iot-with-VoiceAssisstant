import { selectLocalModel } from "./assistant";

export const OLLAMA = "http://127.0.0.1:11434";
export interface LocalAiStatus { state: "ready" | "unavailable" | "missing-model"; model: string | null }

export async function inspectLocalAi(fetcher: typeof fetch = fetch): Promise<LocalAiStatus> {
  try {
    const response = await fetcher(`${OLLAMA}/api/tags`, { signal: AbortSignal.timeout(3000), cache: "no-store", redirect: "error" });
    if (!response.ok) return { state: "unavailable", model: null };
    const data = await response.json();
    const model = selectLocalModel(Array.isArray(data.models) ? data.models : [], process.env.SENTINEL_OLLAMA_MODEL);
    if (!model) return { state: "missing-model", model: null };
    const details = await fetcher(`${OLLAMA}/api/show`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model }), signal: AbortSignal.timeout(3000), redirect: "error" });
    if (!details.ok) return { state: "missing-model", model: null };
    const info = await details.json();
    return info.remote_host || info.remote_model ? { state: "missing-model", model: null } : { state: "ready", model };
  } catch { return { state: "unavailable", model: null }; }
}

import { NextResponse } from "next/server";
import { inspectLocalAi } from "@/lib/local-ai";
import { backendReadiness } from "@/lib/readiness";

export const runtime = "nodejs";

export async function GET() {
  const [backend, assistant] = await Promise.all([
    (async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/status", { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(3000) });
        return backendReadiness(response.ok ? await response.json() : null);
      } catch { return backendReadiness(null); }
    })(),
    inspectLocalAi(),
  ]);
  return NextResponse.json({ checkedAt: new Date().toISOString(), backend, assistant }, { headers: { "Cache-Control": "no-store" } });
}

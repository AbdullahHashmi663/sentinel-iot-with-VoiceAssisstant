import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { sameOrigin } from "@/lib/endpoint-service";
import { speechText } from "@/lib/speech";
export const runtime = "nodejs";
export async function GET() {
  try {
    const response = await fetch("http://127.0.0.1:8012/health", { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(1500) });
    const status = await response.json();
    return NextResponse.json({ ready: response.ok && status.service === "sentinel-voice" && status.offline === true, engine: "kokoro", voices: ["af_heart", "af_bella"] }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ ready: false, engine: "system", voices: [] }); }
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Use the local dashboard for speech." }, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid speech request." }, { status: 400 }); }
  if (!body || typeof body.text !== "string" || !body.text.trim() || body.text.length > 1600 || !["af_heart", "af_bella"].includes(body.voice)) return NextResponse.json({ error: "Choose an installed voice and 1–1600 characters." }, { status: 400 });
  try {
    const root = process.env.SENTINEL_STATE_DIR || resolve(process.cwd(), "..", ".local");
    const key = (await readFile(/* turbopackIgnore: true */ resolve(root, "voice", "control.key"), "utf8")).trim();
    const response = await fetch("http://127.0.0.1:8012/speak", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ text: speechText(body.text), voice: body.voice }), redirect: "error", cache: "no-store", signal: AbortSignal.timeout(120000) });
    if (!response.ok) return NextResponse.json({ error: "The local neural voice is unavailable or busy." }, { status: response.status });
    return new Response(await response.arrayBuffer(), { headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Local neural voice is unavailable. System voices remain available." }, { status: 503 }); }
}

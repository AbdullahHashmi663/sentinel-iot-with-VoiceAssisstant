import { NextRequest, NextResponse } from "next/server";
import { endpointService, sameOrigin } from "@/lib/endpoint-service";
export const runtime = "nodejs";

export async function GET() {
  try { const result = await endpointService("client", "/status"); return NextResponse.json(result.data, { status: result.status, headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "The local client agent is not running. Start START_SENTINEL_CLIENT.bat on the client computer." }, { status: 503 }); }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Use the local client dashboard to change sharing." }, { status: 403 });
  try {
    const body = await request.json();
    if (!body || !["pair", "pause", "resume", "disconnect"].includes(body.action)) return NextResponse.json({ error: "Unknown client action." }, { status: 400 });
    const payload = body.action === "pair" ? { action: "pair", serverUrl: typeof body.serverUrl === "string" ? body.serverUrl.slice(0, 301) : "", pairingKey: typeof body.pairingKey === "string" ? body.pairingKey.slice(0, 101) : "" } : { action: body.action };
    const result = await endpointService("client", "/control", payload);
    return NextResponse.json(result.data, { status: result.status });
  } catch { return NextResponse.json({ error: "The local client agent could not complete that request. Check that it is running and try again." }, { status: 503 }); }
}

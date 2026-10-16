import { NextRequest, NextResponse } from "next/server";
import { endpointService, sameOrigin } from "@/lib/endpoint-service";
export const runtime = "nodejs";

export async function GET() {
  if (process.env.SENTINEL_INTERFACE === "client") return NextResponse.json({ error: "Operator interface unavailable on clients." }, { status: 403 });
  try { const result = await endpointService("fleet", "/operator/clients"); return NextResponse.json(result.data, { status: result.status, headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Start the main dashboard launcher to run the private client relay." }, { status: 503 }); }
}

export async function POST(request: NextRequest) {
  if (process.env.SENTINEL_INTERFACE === "client" || !sameOrigin(request)) return NextResponse.json({ error: "Use the main local dashboard to manage clients." }, { status: 403 });
  try {
    const body = await request.json();
    if (!body || !["enroll", "revoke"].includes(body.action)) return NextResponse.json({ error: "Unknown fleet action." }, { status: 400 });
    const result = await endpointService("fleet", `/operator/${body.action}`, body.action === "enroll" ? { name: body.name } : { id: body.id });
    return NextResponse.json(result.data, { status: result.status });
  } catch { return NextResponse.json({ error: "The local client relay could not complete that request." }, { status: 503 }); }
}

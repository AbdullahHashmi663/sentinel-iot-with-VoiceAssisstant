import { NextResponse } from "next/server";
export function GET() { return NextResponse.json({ profile: process.env.SENTINEL_INTERFACE === "client" ? "client" : "operator" }); }

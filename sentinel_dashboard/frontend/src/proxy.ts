import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (process.env.SENTINEL_INTERFACE !== "client") return NextResponse.next();
  const path = request.nextUrl.pathname;
  if (path === "/client" || path.startsWith("/api/client") || path.startsWith("/_next/") || path === "/sentinel-eye.svg" || path === "/favicon.ico") return NextResponse.next();
  if (path.startsWith("/api/")) return NextResponse.json({ error: "This client interface cannot access operator routes." }, { status: 403 });
  return NextResponse.redirect(new URL("/client", request.url));
}

export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { NextRequest } from "next/server";

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || request.headers.get("sec-fetch-site") === "cross-site") return false;
  try {
    const browser = new URL(origin);
    // Next's internal URL can use localhost even when the browser used 127.0.0.1.
    // Host is the browser's actual authority; forwarded host headers are not trusted.
    return ["127.0.0.1", "localhost", "[::1]"].includes(browser.hostname)
      && browser.host === request.headers.get("host")
      && browser.protocol === request.nextUrl.protocol;
  } catch { return false; }
}

export async function endpointService(service: "client" | "fleet", route: string, body?: unknown) {
  const root = process.env.SENTINEL_STATE_DIR || resolve(process.cwd(), "..", ".local");
  // Runtime credentials belong on the machine, never in a traced build artifact.
  const key = (await readFile(/* turbopackIgnore: true */ resolve(root, service, service === "client" ? "control.key" : "operator.key"), "utf8")).trim();
  const response = await fetch(`http://127.0.0.1:${service === "client" ? 8011 : 8010}${route}`, {
    method: body === undefined ? "GET" : "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(9000),
  });
  const data = await response.json();
  return { data, status: response.status };
}

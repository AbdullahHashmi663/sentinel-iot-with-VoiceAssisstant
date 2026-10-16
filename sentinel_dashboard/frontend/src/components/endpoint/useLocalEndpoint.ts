"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalEndpoint<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [checking, setChecking] = useState(false);
  const [now, setNow] = useState(0);
  const pending = useRef(false);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    const abort = new AbortController();
    const run = async () => {
      pending.current = true;
      setChecking(true);
      try {
        const response = await fetch(url, { signal: abort.signal, cache: "no-store" });
        const value = await response.json();
        if (!response.ok) throw new Error(value.error || "The local service could not be reached.");
        if (!abort.signal.aborted) { setData(value); setError(""); }
      } catch (reason) { if (!abort.signal.aborted) setError((reason as Error).message); }
      finally { if (!abort.signal.aborted) { pending.current = false; setChecking(false); setNow(Date.now() / 1000); } }
    };
    void run();
    return () => { abort.abort(); pending.current = false; };
  }, [url, revision]);
  useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden) { setNow(Date.now() / 1000); if (!pending.current) refresh(); } }, 5000);
    const visible = () => { if (!document.hidden) refresh(); };
    document.addEventListener("visibilitychange", visible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", visible); };
  }, [refresh]);
  return { data, error, checking, refresh, now };
}

export async function endpointAction(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The local service could not complete that request.");
  return result;
}

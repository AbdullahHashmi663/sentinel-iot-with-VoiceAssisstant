"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Feed boundaries synchronize local state with an external socket and stored source preference. */

import { useEffect, useRef, useState } from "react";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import { mockTelemetry } from "@/services/mockTelemetryService";
import { normalizeTelemetry } from "@/lib/telemetry";
import type { TelemetryEvent } from "@/types/sentinel";

export function useSentinelFeed() {
  const demo = useTelemetryStore(s => s.isMockMode);
  const domain = useTelemetryStore(s => s.activeDomain);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [lastSeen, setLastSeen] = useState<number | null>(null);
  const [stale, setStale] = useState(false);
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const socket = useRef<WebSocket | null>(null);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    useTelemetryStore.getState().setIsMockMode(localStorage.getItem("sentinel_source") !== "backend");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const store = useTelemetryStore.getState();
    localStorage.setItem("sentinel_source", demo ? "demo" : "backend");
    // Clear observations when changing sources or domains so the provenance stays unambiguous.
    useTelemetryStore.setState({ events: [], latestEvent: null, activeRules: [], threatsContainedCount: 0, isConnected: false });
    setLastSeen(null);
    setStale(false);
    let disposed = false;
    let retry: ReturnType<typeof setTimeout>;
    const ingest = (event: TelemetryEvent) => {
      if (disposed || pausedRef.current) return;
      store.addEvent(event);
      setLastSeen(Date.now());
      setStale(false);
    };
    if (demo) {
      mockTelemetry.setActiveDomain(domain);
      for (let i = 0; i < 28; i++) ingest(mockTelemetry.generateSyntheticEvent());
      const timer = setInterval(() => ingest(mockTelemetry.generateSyntheticEvent()), 2200);
      return () => { disposed = true; clearInterval(timer); };
    }
    const connect = () => {
      if (disposed) return;
      const ws = new WebSocket("ws://127.0.0.1:8000/ws/telemetry");
      socket.current = ws;
      ws.onopen = () => {
        if (disposed) { ws.close(); return; }
        store.setIsConnected(true);
        ws.send(JSON.stringify({ action: "SET_DOMAIN", domain }));
        ws.send(JSON.stringify({ action: "SET_PLAYBACK", is_playing: !pausedRef.current }));
      };
      ws.onmessage = message => {
        if (disposed) return;
        try {
          const packet = JSON.parse(message.data);
          if (packet.type === "TELEMETRY_UPDATE") {
            if (typeof packet.data?.playback?.is_playing === "boolean") setPaused(!packet.data.playback.is_playing);
            if (packet.data?.domain === domain) { const event = normalizeTelemetry(packet.data); if (event) ingest(event); }
          }
        } catch { /* Ignore invalid frames without treating them as observations. */ }
      };
      ws.onerror = () => { if (!disposed) store.setIsConnected(false); };
      ws.onclose = () => { if (!disposed) { store.setIsConnected(false); retry = setTimeout(connect, 4000); } };
    };
    connect();
    return () => { disposed = true; clearTimeout(retry); socket.current?.close(); store.setIsConnected(false); };
  }, [ready, demo, domain, connectionAttempt]);

  useEffect(() => {
    const timer = setInterval(() => setStale(lastSeen !== null && Date.now() - lastSeen > 15000 && !paused), 3000);
    return () => clearInterval(timer);
  }, [lastSeen, paused]);

  const changePaused = (value: boolean, notifyBackend = true) => {
    pausedRef.current = value;
    setPaused(value);
    if (notifyBackend && !demo && socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ action: "SET_PLAYBACK", is_playing: !value }));
  };
  return { ready, paused, setPaused: changePaused, getPaused: () => pausedRef.current, lastSeen, stale, reconnect: () => setConnectionAttempt(value => value + 1) };
}

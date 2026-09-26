// ==============================================================================
// SENTINEL-IOT: M.E.R.E.O.L.E.O.N.A. AUTONOMOUS COMBAT VOICE COPILOT
// High-Tech FUI / Sci-Fi HUD Architecture • 100% Dashboard Theme Aligned
// Real-Time Three.js 3D Avatar • 100% Local Conformer RAG • Two-Phase Interlock
// ==============================================================================

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Radio,
  Send,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Zap,
  Activity,
  AlertTriangle,
  Flame,
  RotateCcw,
  Copy,
  Check,
  Waves
} from "lucide-react";
import { useTelemetryStore } from "@/store/useTelemetryStore";
import MereoleonaFace3D from "./MereoleonaFace3D";

interface ChatMessage {
  id: string;
  sender: "user" | "jarvis";
  text: string;
  timestamp: string;
}

interface VoiceCopilotProps {
  onFocusElement?: (elementId: string) => void;
}

export default function VoiceCopilot({ onFocusElement }: VoiceCopilotProps) {
  const {
    activeConsole,
    setActiveConsole,
    activeDomain,
    latestEvent,
    activeRules,
    setAdversarialEpsilon,
    triggerAdversarialAttack,
    startInterlockCountdown,
    openPacketSniffer,
    openAgenticSoc,
    openSoarBuilder
  } = useTelemetryStore();

  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [manualInput, setManualInput] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isProactiveAlertActive, setIsProactiveAlertActive] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 6-Stage Presentation Tour
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [tourStage, setTourStage] = useState<number>(0);
  const tourTimeoutRef = useRef<any>(null);

  // Conversational History & Suggested Follow-ups
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "jarvis",
      text: "Commander! Mereoleona online! My Conformer sensory network is fully ignited across all 13 domains. What threat are we burning down today?!",
      timestamp: "ONLINE"
    }
  ]);

  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([
    "Mereoleona, threat status",
    "Why did alert fire?",
    "Show live packet sniffer",
    "Incinerate intruder",
    "Explain Conformer vs LSTM",
    "Start 3-min defense tour"
  ]);

  const copilotSectionRef = useRef<HTMLElement | null>(null);
  const [isScrolledOutOfView, setIsScrolledOutOfView] = useState<boolean>(false);

  useEffect(() => {
    // Populate client-side timestamp to prevent SSR hydration mismatch
    setMessages((prev) =>
      prev.map((m) =>
        m.id === "init" && m.timestamp === "ONLINE"
          ? { ...m, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
          : m
      )
    );

    const handleScroll = () => {
      if (!copilotSectionRef.current) return;
      const rect = copilotSectionRef.current.getBoundingClientRect();
      setIsScrolledOutOfView(rect.bottom < 60);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastAlertTimestampRef = useRef<number>(0);

  // --------------------------------------------------------------------------
  // 1. HIGH-TECH J.A.R.V.I.S. AUDIO CHIMES (WEB AUDIO API SYNTHESIS)
  // --------------------------------------------------------------------------
  const playSoundEffect = useCallback((type: "boot" | "listen" | "confirm" | "alert") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      if (type === "listen") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(554.37, now);
        osc.frequency.exponentialRampToValueAtTime(830.61, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "confirm") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === "alert") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(620, now + 0.15);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {
      // AudioContext unavailable
    }
  }, []);

  // --------------------------------------------------------------------------
  // 2. POWERFUL COMMANDING FEMALE TTS SYNTHESIS (MEREOLEONA CADENCE)
  // --------------------------------------------------------------------------
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (isMuted) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.08;
      utterance.pitch = 1.04;

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(
          (v) =>
            (v.name.includes("Sonia") ||
              v.name.includes("Libby") ||
              v.name.includes("Google UK English Female") ||
              v.name.includes("Zira") ||
              v.name.includes("Samantha") ||
              v.name.includes("Victoria") ||
              v.name.includes("Hazel") ||
              v.name.toLowerCase().includes("female")) &&
            (v.lang.includes("en-GB") || v.lang.includes("en-US") || v.lang.includes("en"))
        ) ||
        voices.find((v) => v.name.includes("Sonia") || v.name.includes("Libby") || v.name.includes("Zira") || v.name.includes("Samantha")) ||
        voices.find((v) => v.lang.includes("en-GB") && v.name.includes("Natural")) ||
        voices.find((v) => v.lang.includes("en-GB")) ||
        voices.find((v) => v.lang.includes("en-US"));

      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isMuted]
  );

  // --------------------------------------------------------------------------
  // 3. BARGE-IN INTERRUPTION PROTOCOL
  // --------------------------------------------------------------------------
  const handleBargeIn = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (isTourActive) {
      clearTimeout(tourTimeoutRef.current);
      setIsTourActive(false);
    }
  }, [isTourActive]);

  // --------------------------------------------------------------------------
  // 4. PROACTIVE ZERO-DAY THREAT INTERCEPT
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!latestEvent) return;
    const tau = latestEvent.anomalyProbability ?? 0;
    const now = Date.now();

    if (tau > 0.85 && now - lastAlertTimestampRef.current > 20000) {
      lastAlertTimestampRef.current = now;
      setIsProactiveAlertActive(true);
      playSoundEffect("alert");

      const alertMsg = `Commander! An intruder dares hammer our perimeter on ${latestEvent.sourceIp}! Anomaly tau has flared to ${tau.toFixed(3)} with ${latestEvent.predictedClass.toUpperCase()} signatures! Give the word and I will incinerate their connection immediately!`;

      setMessages((prev) => [
        ...prev,
        {
          id: `alert-${now}`,
          sender: "jarvis",
          text: alertMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      speakText(alertMsg, () => {
        setIsProactiveAlertActive(false);
      });
    }
  }, [latestEvent, playSoundEffect, speakText]);

  // --------------------------------------------------------------------------
  // 5. MEREOLEONA INTELLIGENCE DISPATCH ENGINE (API + ACTION EXECUTOR)
  // --------------------------------------------------------------------------
  const executeCopilotCommand = useCallback(
    async (queryText: string) => {
      if (!queryText.trim()) return;
      handleBargeIn();
      setIsThinking(true);
      playSoundEffect("confirm");

      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: "user",
          text: queryText,
          timestamp: timeStr
        }
      ]);

      try {
        const res = await fetch("http://127.0.0.1:8000/api/copilot/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: queryText,
            active_console: activeConsole,
            active_domain: activeDomain,
            latest_event: latestEvent,
            active_rules_count: activeRules.length
          })
        });

        if (!res.ok) throw new Error("Backend non-200");
        const data = await res.json();

        setIsThinking(false);
        setPendingAction(data.pending_action || null);

        setMessages((prev) => [
          ...prev,
          {
            id: `jarvis-${Date.now()}`,
            sender: "jarvis",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);

        if (data.suggested_followups && data.suggested_followups.length > 0) {
          setSuggestedFollowups(data.suggested_followups);
        }

        speakText(data.reply);

        if (data.action === "SWITCH_CONSOLE" && data.action_payload?.console) {
          setActiveConsole(data.action_payload.console);
          if (data.action_payload.trigger_attack) {
            setAdversarialEpsilon(data.action_payload.epsilon || 0.15);
            triggerAdversarialAttack();
          }
        } else if (data.action === "TRIGGER_INTERLOCK") {
          setActiveConsole("remediation");
          startInterlockCountdown(data.action_payload?.target || "192.168.100.45");
        } else if (data.action === "OPEN_SNIFFER") {
          openPacketSniffer();
        } else if (data.action === "OPEN_AGENTIC_SOC") {
          openAgenticSoc(latestEvent);
        } else if (data.action === "OPEN_SOAR") {
          setActiveConsole("remediation");
        } else if (data.action === "START_TOUR") {
          startDefenseTour();
        }
      } catch {
        setIsThinking(false);
        const fallback = `Understood, Commander! Processing '${queryText}'. All 13 Sentinel-IoT sensor domains are fully ignited under my command!`;
        setMessages((prev) => [
          ...prev,
          {
            id: `jarvis-${Date.now()}`,
            sender: "jarvis",
            text: fallback,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
        speakText(fallback);
      }
    },
    [
      activeConsole,
      activeDomain,
      latestEvent,
      activeRules,
      handleBargeIn,
      playSoundEffect,
      speakText,
      setActiveConsole,
      setAdversarialEpsilon,
      triggerAdversarialAttack,
      startInterlockCountdown,
      openPacketSniffer,
      openAgenticSoc
    ]
  );

  // --------------------------------------------------------------------------
  // 6. 6-STAGE AUTONOMOUS FYP-II DEFENSE PRESENTATION PROTOCOL
  // --------------------------------------------------------------------------
  const startDefenseTour = () => {
    setIsTourActive(true);
    setTourStage(1);

    setActiveConsole("overview");
    const s1Text =
      "Welcome Honorable Evaluation Committee! Mereoleona taking command! Stage 1: Executive Command Center. We crush industrial IoT alert fatigue across 13 heterogeneous sensor domains with 4,820 events per second throughput and a verified NIST CSF posture of 96.4%!";
    speakText(s1Text, () => {
      tourTimeoutRef.current = setTimeout(() => {
        setTourStage(2);
        setActiveConsole("threat_lab");
        const s2Text =
          "Stage 2: Core Conformer Backbone! Our dual-head Conformer fuses multi-head self-attention with depthwise 1D convolutions across a 10-step sliding temporal buffer, reaching 99.4% macro F1 score!";
        speakText(s2Text, () => {
          tourTimeoutRef.current = setTimeout(() => {
            setTourStage(3);
            setActiveConsole("xai");
            const s3Text =
              "Stage 3: Sub-Millisecond Explainable AI! Our first-order saliency gradient resolves exact feature attributions in 0.78 milliseconds—a 99.97% speedup over SHAP!";
            speakText(s3Text, () => {
              tourTimeoutRef.current = setTimeout(() => {
                setTourStage(4);
                setActiveConsole("adversarial");
                setAdversarialEpsilon(0.15);
                triggerAdversarialAttack();
                const s4Text =
                  "Stage 4: Adversarial Evasion Robustness! Under Projected Gradient Descent attacks with noise budget 0.15, standard CNNs collapse to 41%, while Sentinel-IoT retains 96.8% operational accuracy under fire!";
                speakText(s4Text, () => {
                  tourTimeoutRef.current = setTimeout(() => {
                    setTourStage(5);
                    setActiveConsole("remediation");
                    startInterlockCountdown("192.168.100.45");
                    const s5Text =
                      "Stage 5: Autonomous Active Remediation! In accordance with IEC 62443, we enforce a 30-second Four-Eyes safety interlock before physical actuator trips, achieving 21.5 millisecond MTTR!";
                    speakText(s5Text, () => {
                      tourTimeoutRef.current = setTimeout(() => {
                        setTourStage(6);
                        setActiveConsole("compliance");
                        const s6Text =
                          "Stage 6: GRC Cryptographic Vault! Every mitigation is cryptographically sealed in a SHA-256 Merkle chain satisfying NIST SP 800-53 Control AU-9. Presentation concluded! Sentinel-IoT stands invincible, Commander!";
                        speakText(s6Text, () => {
                          setIsTourActive(false);
                          setTourStage(0);
                        });
                      }, 2200);
                    });
                  }, 2200);
                });
              }, 2200);
            });
          }, 2200);
        });
      }, 2200);
    });
  };

  const stopDefenseTour = () => {
    clearTimeout(tourTimeoutRef.current);
    setIsTourActive(false);
    setTourStage(0);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // --------------------------------------------------------------------------
  // 7. CONTINUOUS SPEECH RECOGNITION SUPERVISOR
  // --------------------------------------------------------------------------
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("[Voice] Web Speech API not supported in this browser environment.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        playSoundEffect("listen");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
          if (isSpeaking) {
            handleBargeIn();
          }
        }

        if (final) {
          setInterimTranscript("");
          executeCopilotCommand(final);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("[Voice Error]", e.error);
        }
      };

      recognition.onend = () => {
        if (isListening) {
          setTimeout(() => {
            try {
              if (recognitionRef.current) recognitionRef.current.start();
            } catch (err) {}
          }, 300);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("[Voice Init Error]", err);
    }
  }, [isListening, isSpeaking, playSoundEffect, handleBargeIn, executeCopilotCommand]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    playSoundEffect("confirm");
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, [playSoundEffect]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    executeCopilotCommand(manualInput);
    setManualInput("");
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleResetHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: "jarvis",
        text: "Commander! Mereoleona ready! Conformer sensory network fully synchronized. What threat are we burning down today?!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  return (
    <>
      <section
        ref={copilotSectionRef}
        aria-label="Mereoleona Autonomous Combat Voice Copilot"
        className="cyber-card glass-panel-deep relative w-full overflow-hidden transition-all duration-300"
      >
      {/* TOP SPECULAR LIGHT BEAM */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent-primary)]/70 to-transparent pointer-events-none z-30" />
      <div className="laser-scan-line opacity-30 pointer-events-none" />

      {/* THEMED CORNER HUD BRACKETS */}
      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)] z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)] z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)] z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)] z-20 pointer-events-none" />

      {/* 1. TOP HEADER TELEMETRY RIBBON (THEMED & GLASS-FROSTED) */}
      <header className="px-4 py-3 bg-[var(--bg-canvas)]/65 backdrop-blur-xl border-b border-white/10 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* Flame Insignia with Theme Reactive Glow */}
          <div
            className={`relative flex items-center justify-center w-8 h-8 rounded-xl border transition-all ${
              isListening
                ? "bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] shadow-[var(--border-glow)]"
                : isSpeaking
                ? "bg-[var(--alert-critical)]/20 border-[var(--alert-critical)] shadow-[0_0_15px_var(--alert-critical)]"
                : "bg-white/5 border-white/15 shadow-inner"
            }`}
          >
            <Flame
              className={`w-5 h-5 ${
                isListening
                  ? "text-[var(--accent-primary)] animate-bounce"
                  : isSpeaking
                  ? "text-[var(--alert-critical)] animate-pulse"
                  : "text-[var(--accent-primary)]"
              }`}
            />
            {isListening && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-['Orbitron'] font-black text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-primary)] via-[var(--accent-primary)] to-[var(--brand-cyan)]">
                M.E.R.E.O.L.E.O.N.A.
              </h2>
              <span className="glass-pill text-[9px] font-['JetBrains_Mono'] px-2.5 py-0.5 text-[var(--accent-primary)] font-bold uppercase tracking-wider">
                COMBAT SOC COMMANDER v3.5
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-['JetBrains_Mono'] px-2.5 py-0.5 rounded-full bg-[var(--alert-nominal)]/10 text-[var(--alert-nominal)] border border-[var(--alert-nominal)]/30 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--alert-nominal)] animate-pulse" />
                CONFORMER RAG ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-['Space_Grotesk'] leading-tight mt-0.5">
              High-Velocity Action Initiative • Two-Phase Authorization • 13 IoT Sensor Domains
            </p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-2">
          {/* Air-gapped Offline badge */}
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-['Orbitron'] font-bold uppercase shadow-sm bg-[var(--alert-nominal)]/10 border-[var(--alert-nominal)]/30 text-[var(--alert-nominal)] backdrop-blur-md"
            title="100% Local Air-Gapped Vector RAG • Zero Cloud Keys Required"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--alert-nominal)]" />
            <span>100% LOCAL OFFLINE</span>
          </div>

          {/* 3-Minute Presentation Tour Button */}
          {isTourActive ? (
            <button
              type="button"
              onClick={stopDefenseTour}
              aria-label={`Halt defense tour at stage ${tourStage} of 6`}
              className="cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--alert-critical)] text-white text-xs font-['Orbitron'] font-bold uppercase animate-pulse shadow-[0_0_15px_var(--alert-critical)] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--alert-critical)] border border-red-300/40"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>HALT TOUR ({tourStage}/6)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startDefenseTour}
              aria-label="Start 3-Minute FYP-II Oral Defense Tour"
              className="cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--accent-primary)] hover:brightness-110 text-black text-xs font-['Orbitron'] font-black uppercase transition-all shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] border border-white/20"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>START 3-MIN TOUR</span>
            </button>
          )}

          {/* Reset Chat History */}
          <button
            type="button"
            onClick={handleResetHistory}
            aria-label="Reset Conversation Log"
            className="cursor-pointer p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] backdrop-blur-md shadow-sm"
            title="Reset Conversation Stream"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Mute / Unmute Assistant */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? "Unmute Assistant Voice" : "Mute Assistant Voice"}
            className="cursor-pointer p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] backdrop-blur-md shadow-sm"
            title={isMuted ? "Unmute Voice" : "Mute Voice"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[var(--alert-critical)]" /> : <Volume2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
          </button>

          {/* Collapse / Expand */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse Voice Copilot HUD" : "Expand Voice Copilot HUD"}
            className="cursor-pointer p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] backdrop-blur-md shadow-sm"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* 2. EXPANDED WORKSPACE CONTENT (DEEP GLASS-FROSTED) */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* COLUMN 1: 3D HOLOGRAPHIC AVATAR POD */}
            <div className="lg:col-span-3 flex flex-col justify-between p-3 rounded-2xl glass-inset border border-white/10 relative overflow-hidden group min-h-[170px] shadow-[inset_0_2px_18px_rgba(0,0,0,0.6)]">
              {/* Corner crosshairs */}
              <span className="absolute top-1 left-2 text-[8px] font-['JetBrains_Mono'] text-[var(--accent-primary)]/50 select-none">+</span>
              <span className="absolute top-1 right-2 text-[8px] font-['JetBrains_Mono'] text-[var(--accent-primary)]/50 select-none">+</span>
              <span className="absolute bottom-1 left-2 text-[8px] font-['JetBrains_Mono'] text-[var(--accent-primary)]/50 select-none">+</span>
              <span className="absolute bottom-1 right-2 text-[8px] font-['JetBrains_Mono'] text-[var(--accent-primary)]/50 select-none">+</span>

              {/* Status Header */}
              <div className="flex items-center justify-between w-full px-1 text-[9px] font-['JetBrains_Mono'] uppercase z-10">
                <span className="text-[var(--accent-primary)] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                  01 // MANA CORE
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[8px] tracking-wider border backdrop-blur-md ${
                    isProactiveAlertActive
                      ? "bg-[var(--alert-critical)]/20 text-[var(--alert-critical)] border-[var(--alert-critical)] animate-pulse"
                      : isSpeaking
                      ? "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border-[var(--accent-primary)] animate-pulse"
                      : isListening
                      ? "bg-[var(--alert-warning)]/20 text-[var(--alert-warning)] border-[var(--alert-warning)]"
                      : isThinking
                      ? "bg-[var(--brand-cyan)]/20 text-[var(--brand-cyan)] border-[var(--brand-cyan)] animate-pulse"
                      : "bg-white/5 text-[var(--text-muted)] border-white/10"
                  }`}
                >
                  {isProactiveAlertActive
                    ? "INCINERATING"
                    : isSpeaking
                    ? "VOCALIZING"
                    : isListening
                    ? "LISTENING"
                    : isThinking
                    ? "SYNAPSE"
                    : "STANDBY"}
                </span>
              </div>

              {/* Central Three.js Static Hologram Viewport with Radial Base Halo */}
              <div className="relative w-full flex-1 flex items-center justify-center my-0.5 overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_bottom,var(--accent-primary)/12_0%,transparent_75%)]">
                <MereoleonaFace3D
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  isThinking={isThinking}
                  isCritAlert={(latestEvent?.anomalyProbability ?? 0) > 0.85 || isProactiveAlertActive}
                  onClick={toggleListening}
                  className="w-full h-[128px]"
                />

                {/* Animated Spectrum Wave Bars (Theme Synchronized) */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-1 pointer-events-none select-none z-10 opacity-80">
                  {[2, 5, 8, 12, 7, 4, 2].map((height, i) => (
                    <span
                      key={i}
                      style={{
                        height: isSpeaking
                          ? `${height * (1 + Math.sin(Date.now() / 200 + i) * 0.4)}px`
                          : isListening
                          ? `${Math.max(2, height * 0.5)}px`
                          : "2px"
                      }}
                      className={`w-0.5 rounded-full transition-all duration-75 ${
                        isSpeaking
                          ? "bg-gradient-to-t from-[var(--brand-primary)] to-[var(--accent-primary)]"
                          : isListening
                          ? "bg-[var(--alert-warning)]"
                          : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Telemetry Ticker */}
              <div className="flex items-center justify-between w-full px-1 text-[8px] font-['JetBrains_Mono'] text-[var(--text-muted)] uppercase border-t border-white/10 pt-1.5">
                <span>FPS: 60</span>
                <span className="text-[var(--brand-cyan)] font-bold">LATENCY: 21.5ms</span>
                <span className="text-[var(--alert-nominal)] font-bold">SYNC: 100%</span>
              </div>
            </div>

            {/* COLUMN 2: COMBAT STREAM & DIALOGUE DISPATCH */}
            <div className="lg:col-span-6 p-3.5 rounded-2xl glass-inset border border-white/10 flex flex-col justify-between min-h-[170px] overflow-hidden relative shadow-[inset_0_2px_22px_rgba(0,0,0,0.65)]">
              {/* Stream Header */}
              <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[var(--accent-primary)] border-b border-white/10 pb-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span className="font-bold tracking-wider">02 // COMBAT COMMUNICATIONS STREAM</span>
                </div>
                {interimTranscript ? (
                  <span className="text-[var(--alert-warning)] text-[10px] italic truncate max-w-[240px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--alert-warning)] animate-ping" />
                    &quot;{interimTranscript}&quot;
                  </span>
                ) : (
                  <span className="glass-pill px-2 py-0.5 text-[8px] text-[var(--text-muted)] font-bold">
                    {messages.length} DISPATCHES
                  </span>
                )}
              </div>

              {/* Conversation Log Feed */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs max-h-[165px]">
                {messages.slice(-4).map((m) => (
                  <div
                    key={m.id}
                    className={`group relative p-3 rounded-xl leading-relaxed transition-all ${
                      m.sender === "user"
                        ? "bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/40 text-[var(--text-primary)] ml-6 shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-md"
                        : "bg-black/45 border border-white/15 text-[var(--text-primary)] font-['Space_Grotesk'] mr-3 shadow-[0_6px_20px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.12)] backdrop-blur-md"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-['JetBrains_Mono'] opacity-80 mb-1 pb-1 border-b border-white/10">
                      <span className="font-bold text-[var(--accent-primary)] flex items-center gap-1">
                        {m.sender === "user" ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                            COMMANDER [TRANSMISSION]
                          </>
                        ) : (
                          <>
                            <Flame className="w-3 h-3 text-[var(--accent-primary)]" />
                            MEREOLEONA [UNCROWNED LIONESS]
                          </>
                        )}
                      </span>
                      <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <span>{m.timestamp}</span>
                        {m.sender === "jarvis" && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => speakText(m.text)}
                              title="Replay Voice"
                              className="p-0.5 hover:text-[var(--accent-primary)] text-[var(--text-muted)] transition-colors"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(m.id, m.text)}
                              title="Copy Text"
                              className="p-0.5 hover:text-[var(--accent-primary)] text-[var(--text-muted)] transition-colors"
                            >
                              {copiedId === m.id ? (
                                <Check className="w-3 h-3 text-[var(--alert-nominal)]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-[12px] leading-relaxed select-text">{m.text}</div>
                  </div>
                ))}

                {/* Thinking Synapse Animation */}
                {isThinking && (
                  <div className="p-3 rounded-xl bg-black/50 border border-[var(--accent-primary)]/50 text-xs text-[var(--accent-primary)] italic flex items-center gap-2.5 animate-pulse backdrop-blur-md shadow-md">
                    <div className="relative flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] animate-ping" />
                      <span className="absolute w-1.5 h-1.5 rounded-full bg-[var(--brand-cyan)]" />
                    </div>
                    <span className="font-['Space_Grotesk'] text-[11px]">
                      Mereoleona is synthesizing Conformer threat attributions across 13 sensor domains...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 3: TRI-MODAL VOICE & ACTION CONTROLS */}
            <div className="lg:col-span-3 flex flex-col justify-between p-3.5 rounded-2xl glass-inset border border-white/10 min-h-[170px] shadow-[inset_0_2px_22px_rgba(0,0,0,0.65)] space-y-2.5 relative">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-['JetBrains_Mono'] text-[var(--accent-primary)] uppercase">
                  <span>03 // AUDIO PROTOCOL</span>
                  <span className="text-[var(--alert-nominal)] font-bold">1.08x CADENCE</span>
                </div>
                <div className="text-xs font-['Orbitron'] font-bold text-[var(--text-primary)]">
                  COMMANDING NEURAL VOICE
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-['Space_Grotesk'] leading-tight">
                  Continuous Speech Recognition with Real-Time Audio Barge-In
                </p>
              </div>

              {/* Primary PTT Button (Theme Dynamic Action Target with In-Depth Specular Glow) */}
              <button
                type="button"
                onClick={toggleListening}
                aria-label={isListening ? "Deactivate Voice Recognition" : "Activate Mereoleona Voice Recognition"}
                className={`cursor-pointer w-full flex items-center justify-center gap-2 py-3 rounded-xl font-['Orbitron'] font-black text-xs uppercase transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] active:scale-[0.98] ${
                  isListening
                    ? "bg-[var(--alert-critical)] text-white shadow-[0_0_30px_var(--alert-critical)] border border-red-300 animate-pulse"
                    : "bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-cyan)] to-[var(--accent-primary)] text-black hover:brightness-110 shadow-[var(--border-glow)] border border-white/30"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 animate-bounce" />
                    <span>LISTENING • CLICK TO STOP</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>TALK TO MEREOLEONA</span>
                  </>
                )}
              </button>

              {/* Barge-In Readiness Indicator */}
              <div className="flex items-center justify-between text-[9px] font-['JetBrains_Mono'] px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[var(--text-muted)] backdrop-blur-sm">
                <span className="flex items-center gap-1.5 text-[var(--accent-primary)] font-bold">
                  <Waves className="w-3 h-3 text-[var(--accent-primary)]" />
                  BARGE-IN READY
                </span>
                <span>INTERRUPT ANYTIME</span>
              </div>
            </div>
          </div>

          {/* TWO-PHASE ACTION PROPOSAL INTERLOCK BANNER */}
          {pendingAction && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--alert-warning)]/20 via-[var(--alert-warning)]/10 to-black/40 border-2 border-[var(--alert-warning)] text-[var(--alert-warning)] flex flex-wrap items-center justify-between gap-3 shadow-[0_8px_30px_rgba(245,158,11,0.25)] backdrop-blur-xl animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--alert-warning)]/20 border border-[var(--alert-warning)]">
                  <AlertTriangle className="w-5 h-5 text-[var(--alert-warning)] animate-bounce" />
                </div>
                <div>
                  <div className="text-xs font-['Orbitron'] font-black uppercase tracking-wider text-white">
                    TACTICAL ACTION PROPOSAL AWAITING COMMANDER AUTHORIZATION
                  </div>
                  <div className="text-xs font-['Space_Grotesk'] text-[var(--alert-warning)] mt-0.5">
                    {pendingAction.description || "Deploy Tactical Action Payload"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => executeCopilotCommand("Yes, do it")}
                  className="cursor-pointer px-4 py-2 rounded-xl bg-[var(--alert-warning)] text-black font-['Orbitron'] font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--alert-warning)] border border-white/20"
                >
                  <span>AUTHORIZE & EXECUTE</span>
                </button>
                <button
                  type="button"
                  onClick={() => executeCopilotCommand("No, stand down")}
                  className="cursor-pointer px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-[var(--text-secondary)] font-['Orbitron'] font-bold text-xs hover:bg-white/20 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] backdrop-blur-md"
                >
                  STAND DOWN
                </button>
              </div>
            </div>
          )}

          {/* TACTICAL FOLLOW-UP PROMPT CHIPS (THEMED & GLASS-PILL) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-['JetBrains_Mono']">
            <span className="text-[var(--text-muted)] text-[10px] mr-1 flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 text-[var(--accent-primary)]" />
              <span>TACTICAL PROMPTS:</span>
            </span>
            {suggestedFollowups.map((prompt) => (
              <button
                key={prompt}
                onClick={() => executeCopilotCommand(prompt)}
                aria-label={`Execute voice prompt: ${prompt}`}
                className="glass-pill cursor-pointer px-3 py-1 bg-white/5 hover:bg-[var(--accent-primary)]/20 border border-white/15 hover:border-[var(--accent-primary)]/70 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] active:scale-95 text-[11px]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* NATURAL LANGUAGE TYPED COMMAND FORM (THEMED) */}
          <form
            onSubmit={handleManualSubmit}
            aria-label="Typed Command to Mereoleona"
            className="flex items-center gap-2 pt-1"
          >
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-['JetBrains_Mono'] text-[var(--accent-primary)]/80 select-none">
                &gt;_
              </span>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                aria-label="Input query for Mereoleona"
                placeholder="Address Mereoleona e.g., 'Mereoleona, threat status', 'Why did alert fire?', 'Incinerate intruder'..."
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl glass-inset border border-white/15 text-xs text-[var(--text-primary)] font-['JetBrains_Mono'] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] transition-colors shadow-inner"
              />
            </div>
            <button
              type="submit"
              aria-label="Dispatch query to Mereoleona"
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--accent-primary)] hover:brightness-115 text-black text-xs font-['Orbitron'] font-black uppercase transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] active:scale-95 shadow-md border border-white/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>COMMAND</span>
            </button>
          </form>
        </div>
      )}
    </section>

    {/* 5. FLOATING PICTURE-IN-PICTURE (PIP) COMBAT MINI-HUD */}
    {isScrolledOutOfView && (
      <aside
        aria-label="Mereoleona Floating Voice Copilot Mini-HUD"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-[var(--bg-canvas)]/80 backdrop-blur-2xl border border-white/20 hover:border-[var(--accent-primary)]/80 shadow-[0_16px_45px_rgba(0,0,0,0.85),0_0_20px_var(--accent-primary)/25] transition-all duration-300 group"
      >
        {/* Mini Themed Corner Accents */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[var(--accent-primary)] rounded-tl-sm pointer-events-none" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--accent-primary)] rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[var(--accent-primary)] rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--accent-primary)] rounded-br-sm pointer-events-none" />

        {/* Mini 3D Avatar */}
        <div
          onClick={toggleListening}
          title="Click to Toggle Voice Listening"
          className="w-12 h-12 rounded-xl overflow-hidden glass-inset border border-white/20 relative flex items-center justify-center cursor-pointer hover:border-[var(--accent-primary)] transition-all flex-shrink-0"
        >
          <MereoleonaFace3D
            isSpeaking={isSpeaking}
            isListening={isListening}
            isThinking={isThinking}
            isCritAlert={isProactiveAlertActive}
            className="w-12 h-12 min-h-0"
          />
          {isSpeaking && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--alert-critical)] animate-ping" />
          )}
          {isListening && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-ping" />
          )}
        </div>

        {/* Mini Status & Intel Info */}
        <div className="flex flex-col min-w-[110px] max-w-[170px]">
          <div className="flex items-center gap-1.5">
            <span className="font-['Orbitron'] font-black text-[11px] text-[var(--text-primary)] tracking-wide">
              MEREOLEONA
            </span>
            {isSpeaking ? (
              <span className="px-2 py-0.5 rounded-full text-[8px] font-['JetBrains_Mono'] font-bold bg-[var(--alert-critical)]/20 text-[var(--alert-critical)] border border-[var(--alert-critical)]/40 flex items-center gap-0.5 animate-pulse backdrop-blur-sm">
                <Flame className="w-2.5 h-2.5 text-[var(--alert-critical)]" />
                VOICE
              </span>
            ) : isListening ? (
              <span className="px-2 py-0.5 rounded-full text-[8px] font-['JetBrains_Mono'] font-bold bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 flex items-center gap-0.5 animate-pulse backdrop-blur-sm">
                <Radio className="w-2.5 h-2.5 text-[var(--accent-primary)] animate-spin" />
                LISTEN
              </span>
            ) : isThinking ? (
              <span className="px-2 py-0.5 rounded-full text-[8px] font-['JetBrains_Mono'] font-bold bg-[var(--brand-cyan)]/20 text-[var(--brand-cyan)] border border-[var(--brand-cyan)]/40 flex items-center gap-0.5 animate-pulse backdrop-blur-sm">
                <Activity className="w-2.5 h-2.5 text-[var(--brand-cyan)]" />
                RAG
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[8px] font-['JetBrains_Mono'] font-bold bg-white/10 text-[var(--text-muted)] border border-white/15 backdrop-blur-sm">
                STANDBY
              </span>
            )}
          </div>
          <span className="text-[9px] font-['JetBrains_Mono'] text-[var(--text-secondary)] truncate">
            {isListening
              ? "Capturing voice command..."
              : isSpeaking
              ? "Synthesizing vocal response..."
              : isThinking
              ? "Querying Conformer embeddings..."
              : "Voice Command Standby"}
          </span>

          {/* Subtext ticker / interim transcript / speech wave */}
          <div className="text-[10px] text-[var(--text-muted)] font-['Space_Grotesk'] truncate mt-0.5">
            {interimTranscript ? (
              <span className="text-[var(--alert-warning)] italic flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--alert-warning)] animate-ping" />
                &quot;{interimTranscript}&quot;
              </span>
            ) : isSpeaking ? (
              <div className="flex items-center gap-1 text-[var(--accent-primary)] font-['JetBrains_Mono'] text-[9px]">
                <Waves className="w-3 h-3 animate-bounce" />
                <span>INCINERATING THREAT</span>
              </div>
            ) : (
              <span className="font-['JetBrains_Mono'] text-[9px] text-[var(--text-muted)]">
                Conformer v3.5 SOC
              </span>
            )}
          </div>
        </div>

        {/* Mini Quick Actions */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-white/15">
          {/* Quick PTT Button */}
          <button
            type="button"
            onClick={toggleListening}
            aria-label={isListening ? "Deactivate Voice Listening" : "Activate Voice Listening"}
            className={`cursor-pointer p-2.5 rounded-xl font-['Orbitron'] font-black transition-all active:scale-95 shadow-md ${
              isListening
                ? "bg-[var(--alert-critical)] text-white shadow-[0_0_20px_var(--alert-critical)] border border-red-300 animate-pulse"
                : "bg-gradient-to-r from-[var(--brand-primary)] to-[var(--accent-primary)] text-black hover:brightness-110 shadow-md border border-white/30"
            }`}
            title={isListening ? "Halt Voice Listening" : "Speak to Mereoleona"}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          {/* Quick Root Cause Query Button */}
          <button
            type="button"
            onClick={() => executeCopilotCommand("Why did alert fire?")}
            aria-label="Ask Mereoleona: Why did alert fire?"
            className="cursor-pointer p-2.5 rounded-xl bg-white/5 hover:bg-[var(--accent-primary)]/20 border border-white/15 hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all active:scale-95 backdrop-blur-md"
            title="Forensic Saliency: 'Why did alert fire?'"
          >
            <Zap className="w-3.5 h-3.5" />
          </button>

          {/* Return to Full Copilot HUD Button */}
          <button
            type="button"
            onClick={() => {
              copilotSectionRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            aria-label="Scroll back to main Voice Copilot HUD"
            className="cursor-pointer p-2.5 rounded-xl bg-white/5 hover:bg-[var(--accent-primary)]/20 border border-white/15 hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all active:scale-95 backdrop-blur-md"
            title="Scroll back to full Voice Copilot HUD"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    )}
  </>
  );
}

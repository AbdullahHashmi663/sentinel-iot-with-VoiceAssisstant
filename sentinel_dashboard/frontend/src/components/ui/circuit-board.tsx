"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CircuitNode {
  id: string;
  x: number;
  y: number;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  status?: "active" | "warning" | "critical" | "nominal";
  color?: string;
}

export interface CircuitConnection {
  from: string;
  to: string;
  animated?: boolean;
  bidirectional?: boolean;
  label?: string;
  color?: string;
}

export interface CircuitBoardProps {
  nodes: CircuitNode[];
  connections: CircuitConnection[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  pulseSpeed?: number;
  traceWidth?: number;
  className?: string;
  onNodeClick?: (nodeId: string) => void;
}

export function CircuitBoard({
  nodes,
  connections,
  width = 1240,
  height = 560,
  showGrid = true,
  pulseSpeed = 2,
  traceWidth = 2,
  className,
  onNodeClick,
}: CircuitBoardProps) {
  const patternId = useId();

  // Create a quick lookup for node coordinates
  const nodeMap = React.useMemo(() => {
    const map = new Map<string, CircuitNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Generate orthogonal PCB traces between nodes
  const routes = React.useMemo(() => {
    return connections
      .map((conn) => {
        const fromNode = nodeMap.get(conn.from);
        const toNode = nodeMap.get(conn.to);
        if (!fromNode || !toNode) return null;

        const x1 = fromNode.x;
        const y1 = fromNode.y;
        const x2 = toNode.x;
        const y2 = toNode.y;

        // Routing logic: PCB orthogonal traces with 45-degree chamfer
        const midX = (x1 + x2) / 2;
        let d = "";

        if (Math.abs(y1 - y2) < 4) {
          // Straight horizontal line
          d = `M ${x1} ${y1} L ${x2} ${y2}`;
        } else if (Math.abs(x1 - x2) < 4) {
          // Straight vertical line
          d = `M ${x1} ${y1} L ${x2} ${y2}`;
        } else {
          // Orthogonal trace with chamfer
          const dx = x2 - x1;
          const dy = y2 - y1;
          const chamfer = Math.min(18, Math.abs(dx) / 2, Math.abs(dy) / 2);
          const dirX = Math.sign(dx);
          const dirY = Math.sign(dy);

          d = `M ${x1} ${y1} L ${midX - dirX * chamfer} ${y1} L ${midX + dirX * chamfer} ${y1 + dirY * chamfer * 2} L ${midX + dirX * chamfer} ${y2 - dirY * chamfer} L ${x2} ${y2}`;
        }

        return {
          ...conn,
          d,
          fromNode,
          toNode,
        };
      })
      .filter(Boolean);
  }, [connections, nodeMap]);

  return (
    <div
      className={cn(
        "relative rounded-xl border border-[var(--border-color)] bg-[var(--terminal-bg)] shadow-[0_0_30px_rgba(0,0,0,0.5)] select-none",
        className
      )}
      style={{ width: "100%", height }}
    >
      {/* SVG Canvas for Circuit Traces and Grid */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none rounded-xl"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          {showGrid && (
            <pattern
              id={patternId}
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="12"
                cy="12"
                r="1"
                fill="var(--accent-primary)"
                opacity="0.15"
              />
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="0.5"
                opacity="0.1"
              />
            </pattern>
          )}

          {/* Glow Filters */}
          <filter id="trace-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dot Grid Background */}
        {showGrid && (
          <rect width={width} height={height} fill={`url(#${patternId})`} />
        )}

        {/* Circuit Traces */}
        {routes.map((route, idx) => {
          if (!route) return null;
          const traceColor = route.color || "var(--accent-primary)";

          return (
            <g key={`${route.from}-${route.to}-${idx}`}>
              {/* Base Inactive Copper Track */}
              <path
                d={route.d}
                fill="none"
                stroke="var(--border-color)"
                strokeWidth={traceWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.35"
              />

              {/* Terminal Solder Pads */}
              <circle
                cx={route.fromNode.x}
                cy={route.fromNode.y}
                r={traceWidth * 2.2}
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <circle
                cx={route.toNode.x}
                cy={route.toNode.y}
                r={traceWidth * 2.2}
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="1.5"
                opacity="0.6"
              />

              {/* Animated Glowing Electric Pulse Line */}
              {route.animated && (
                <motion.path
                  d={route.d}
                  fill="none"
                  stroke={traceColor}
                  strokeWidth={traceWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="14 36"
                  initial={{ strokeDashoffset: 50 }}
                  animate={{ strokeDashoffset: -50 }}
                  transition={{
                    repeat: Infinity,
                    duration: pulseSpeed,
                    ease: "linear",
                  }}
                  filter="url(#trace-glow)"
                  opacity="0.9"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Circuit Nodes (IC Chips & Components) - COMPLETELY STATIC ON HOVER */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {nodes.map((node) => {
          const isCritical = node.status === "critical";
          const isWarning = node.status === "warning";
          const isNominal = node.status === "nominal";

          const borderColor = node.color
            ? node.color
            : isCritical
            ? "var(--alert-critical)"
            : isWarning
            ? "var(--alert-warning)"
            : isNominal
            ? "var(--alert-nominal)"
            : "var(--accent-primary)";

          return (
            <div
              key={node.id}
              onClick={() => onNodeClick?.(node.id)}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: `${(node.x / width) * 100}%`,
                top: `${(node.y / height) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Microchip Package Card (Rock-solid, zero scale / float / bounce) */}
              <div
                className="relative px-3.5 py-2 rounded-lg bg-[var(--bg-card)] backdrop-blur-md border flex items-center gap-2.5 shadow-lg transition-colors duration-150 select-none"
                style={{
                  borderColor,
                  boxShadow: `0 0 14px ${borderColor}33`,
                }}
              >
                {/* Chip Notch Mark */}
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-1 rounded-b-full opacity-70"
                  style={{ backgroundColor: borderColor }}
                />

                {/* Node Icon */}
                {node.icon && (
                  <div
                    className="p-1.5 rounded-md flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${borderColor}1a`,
                      color: borderColor,
                    }}
                  >
                    {node.icon}
                  </div>
                )}

                {/* Node Labels */}
                <div className="flex flex-col pr-1">
                  <span className="font-['Orbitron'] font-bold text-xs text-[var(--text-primary)] leading-tight whitespace-nowrap">
                    {node.label}
                  </span>
                  {node.sublabel && (
                    <span className="font-['JetBrains_Mono'] text-[10px] text-[var(--text-muted)] leading-tight">
                      {node.sublabel}
                    </span>
                  )}
                </div>

                {/* Pulse Beacon Indicator */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: borderColor,
                    boxShadow: `0 0 8px ${borderColor}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface DockItemData {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional subtitle or description for rich tooltip */
  description?: string;
  /** Icon component or node */
  icon: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Whether item is active */
  isActive?: boolean;
  /** Badge count or string */
  badge?: number | string;
  /** Accent color for icon/glow */
  color?: string;
}

export interface MagneticDockProps {
  /** Array of dock items */
  items: DockItemData[];
  /** Size of icons in pixels */
  iconSize?: number;
  /** Maximum scale on hover */
  maxScale?: number;
  /** Distance of magnetic effect in pixels */
  magneticDistance?: number;
  /** Show labels on hover */
  showLabels?: boolean;
  /** Dock position */
  position?: "bottom" | "top" | "left" | "right";
  /** Background style */
  variant?: "glass" | "solid" | "transparent" | "cyber";
  /** Custom class name */
  className?: string;
}

interface DockItemProps {
  item: DockItemData;
  mouseX: MotionValue<number>;
  iconSize: number;
  maxScale: number;
  magneticDistance: number;
  showLabels: boolean;
  isVertical: boolean;
  reducedMotion: boolean;
}

function DockItem({
  item,
  mouseX,
  iconSize,
  maxScale,
  magneticDistance,
  showLabels,
  isVertical,
  reducedMotion,
}: DockItemProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const showLabel = showLabels && (isHovered || isFocused);

  // Calculate distance from mouse to center of item
  const distance = useTransform(mouseX, (val: number) => {
    if (!ref.current) return magneticDistance + 1;
    const rect = ref.current.getBoundingClientRect();
    const center = isVertical
      ? rect.top + rect.height / 2
      : rect.left + rect.width / 2;
    return val - center;
  });

  // Scale based on distance - closer = larger
  const scale = useTransform(
    distance,
    [-magneticDistance, 0, magneticDistance],
    [1, maxScale, 1]
  );

  // Apply spring physics for smooth magnification
  const springConfig = { damping: 18, stiffness: 280, mass: 0.45 };
  const smoothScale = useSpring(scale, springConfig);

  // Calculate the size based on scale
  const size = useTransform(smoothScale, (s) => s * iconSize);

  // Floating vertical bounce effect
  const y = useTransform(smoothScale, (s) => (s - 1) * -12);
  const smoothY = useSpring(y, springConfig);

  const itemColor = item.color || "var(--accent-primary)";

  return (
    <motion.button
      ref={ref}
      type="button"
      tabIndex={0}
      role="tab"
      aria-selected={item.isActive}
      aria-label={item.label}
      aria-current={item.isActive ? "page" : undefined}
      onClick={item.onClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "cursor-pointer relative flex items-center justify-center shrink-0",
        "rounded-2xl transition-colors duration-200 outline-none select-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]"
      )}
      style={{
        width: reducedMotion ? iconSize : size,
        height: reducedMotion ? iconSize : size,
        y: reducedMotion || isVertical ? 0 : smoothY,
        x: reducedMotion || !isVertical ? 0 : smoothY,
      }}
      whileTap={reducedMotion ? undefined : { scale: 0.92 }}
    >
      {/* Icon Card Container */}
      <motion.div
        className={cn(
          "relative w-full h-full rounded-2xl overflow-hidden",
          "bg-gradient-to-b from-[var(--bg-surface-elevated)] to-[var(--bg-surface)]",
          "border transition-all duration-200 flex items-center justify-center",
          item.isActive
            ? "border-[var(--accent-primary)] shadow-[0_0_16px_var(--accent-glow)]"
            : "border-[var(--border-color)] hover:border-[var(--accent-primary)]/60"
        )}
        style={{
          boxShadow: isHovered
            ? `0 10px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 16px ${itemColor}44`
            : item.isActive
            ? `0 6px 18px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 12px ${itemColor}33`
            : "0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Interactive Icon */}
        <div
          aria-hidden="true"
          className={cn(
            "w-[56%] h-[56%] flex items-center justify-center transition-colors duration-200",
            item.isActive
              ? "text-[var(--accent-primary)] drop-shadow-[0_0_8px_var(--accent-glow)]"
              : "text-[var(--text-secondary)] hover:text-white"
          )}
          style={{
            color: item.isActive ? itemColor : undefined,
          }}
        >
          {item.icon}
        </div>

        {/* Diagonal Gloss / Shine Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 45%, transparent 100%)",
            opacity: isHovered ? 0.9 : 0.4,
          }}
        />

        {/* Ambient bottom glow if active */}
        {item.isActive && (
          <div
            className="absolute bottom-0 inset-x-2 h-[2px] rounded-full blur-[1px]"
            style={{ backgroundColor: itemColor }}
          />
        )}
      </motion.div>

      {/* Notification / Alert Badge */}
      <AnimatePresence initial={false}>
        {item.badge !== undefined && (
          <motion.div
            initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            className={cn(
              "absolute -top-1.5 -right-1.5 z-20",
              "min-w-[18px] h-[18px] px-1",
              "rounded-full font-['JetBrains_Mono']",
              "bg-[var(--alert-critical)] text-white text-[10px] font-black",
              "flex items-center justify-center",
              "border border-white/40",
              "shadow-[0_0_10px_rgba(239,68,68,0.7)]"
            )}
          >
            {item.badge}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active State Dot Indicator */}
      <AnimatePresence initial={false}>
        {item.isActive && (
          <motion.div
            initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            className="absolute -bottom-2 w-2 h-1 rounded-full shadow-[0_0_8px_var(--accent-primary)]"
            style={{ backgroundColor: itemColor }}
          />
        )}
      </AnimatePresence>

      {/* Explanatory Tooltip Above Icon */}
      <AnimatePresence initial={false}>
        {showLabel && (
          <motion.div
            aria-hidden="true"
            initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute -top-12 left-1/2 -translate-x-1/2",
              "px-3 py-1.5 rounded-lg",
              "bg-[#070D17]/95 backdrop-blur-md",
              "text-white whitespace-nowrap",
              "border border-[var(--border-color)] shadow-[0_8px_24px_rgba(0,0,0,0.7)]",
              "pointer-events-none z-50 flex flex-col items-center gap-0.5"
            )}
          >
            <div className="font-['Orbitron'] font-bold text-xs tracking-wider text-[var(--accent-primary)] flex items-center gap-1.5">
              <span>{item.label}</span>
              {item.isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--alert-nominal)] animate-pulse" />
              )}
            </div>
            {item.description && (
              <div className="font-['Space_Grotesk'] text-[10px] text-[var(--text-secondary)] font-medium max-w-[260px] text-center">
                {item.description}
              </div>
            )}
            {/* Tooltip Arrow */}
            <div
              className={cn(
                "absolute left-1/2 -translate-x-1/2 -bottom-1",
                "w-2 h-2 rotate-45",
                "bg-[#070D17] border-r border-b border-[var(--border-color)]"
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function MagneticDock({
  items,
  iconSize = 50,
  maxScale = 1.35,
  magneticDistance = 140,
  showLabels = true,
  position = "bottom",
  variant = "cyber",
  className,
}: MagneticDockProps) {
  const mousePosition = useMotionValue(Infinity);
  const reducedMotion = useReducedMotion() ?? false;
  const isVertical = position === "left" || position === "right";

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (isVertical) {
        mousePosition.set(e.clientY);
      } else {
        mousePosition.set(e.clientX);
      }
    },
    [mousePosition, isVertical]
  );

  const handleMouseLeave = () => {
    mousePosition.set(Infinity);
  };

  const variantStyles = {
    cyber: cn(
      "bg-[#0B101B]/85 border border-[var(--border-color)]",
      "backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.7)]",
      "ring-1 ring-white/10"
    ),
    glass: cn(
      "bg-white/10 dark:bg-neutral-900/80",
      "backdrop-blur-xl backdrop-saturate-150",
      "border border-white/20 dark:border-neutral-700",
      "shadow-2xl shadow-black/40"
    ),
    solid: cn(
      "bg-[var(--bg-card)]",
      "border border-[var(--border-color)]",
      "shadow-2xl shadow-black/50"
    ),
    transparent: "bg-transparent border-0 shadow-none",
  };

  const positionStyles = {
    bottom: "flex-row",
    top: "flex-row",
    left: "flex-col",
    right: "flex-col",
  };

  return (
    <motion.nav
      role="tablist"
      aria-label="Sentinel-IoT SOC Navigation Consoles"
      onMouseMove={reducedMotion ? undefined : handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "inline-flex items-end gap-2.5 px-4 py-2.5 rounded-3xl",
        variantStyles[variant],
        positionStyles[position],
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {items.map((item) => (
        <DockItem
          key={item.id}
          item={item}
          mouseX={mousePosition}
          iconSize={iconSize}
          maxScale={maxScale}
          magneticDistance={magneticDistance}
          showLabels={showLabels}
          isVertical={isVertical}
          reducedMotion={reducedMotion}
        />
      ))}
    </motion.nav>
  );
}

// Preset Dock Icons from componentry.dev
export function DockIconHome({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-full h-full", className)}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function DockIconSearch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-full h-full", className)}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function DockIconFolder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-full h-full", className)}
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function DockIconMail({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-full h-full", className)}
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function DockIconMusic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-full h-full", className)}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export function DockIconSettings({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-full h-full", className)}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function DockIconTrash({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-full h-full", className)}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

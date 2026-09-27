---
name: Obsidian Telemetry Tactical HUD
colors:
  surface: '#101418'
  surface-dim: '#101418'
  surface-bright: '#353a3e'
  surface-container-lowest: '#0a0f13'
  surface-container-low: '#181c20'
  surface-container: '#1c2024'
  surface-container-high: '#262a2f'
  surface-container-highest: '#31353a'
  on-surface: '#e0e3e8'
  on-surface-variant: '#b9ccb5'
  inverse-surface: '#e0e3e8'
  inverse-on-surface: '#2d3135'
  outline: '#849581'
  outline-variant: '#3b4b3a'
  surface-tint: '#00e55b'
  primary: '#edffe8'
  on-primary: '#003911'
  primary-container: '#00ff66'
  on-primary-container: '#007128'
  inverse-primary: '#006e27'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#fff9f6'
  on-tertiary: '#472a00'
  tertiary-container: '#ffd7aa'
  on-tertiary-container: '#895600'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6bff83'
  primary-fixed-dim: '#00e55b'
  on-primary-fixed: '#002107'
  on-primary-fixed-variant: '#00531b'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#101418'
  on-background: '#e0e3e8'
  surface-variant: '#31353a'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.08em
  telemetry-metric:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  telemetry-metric-sm:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-desktop: 1rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style
The design system embodies the high-stakes discipline of mission-critical aerospace command and cyber-physical defense consoles. Engineered for OT/ICS threat detection and operational continuity, the UI projects razor-sharp precision, high situational awareness, and total cognitive control under high stress. 

The aesthetic fuses **Tactical High-Density HUD** with **Refined Dark Industrial Glassmorphism**:
- Ultra-deep obsidian layers eliminate optical fatigue across 12-hour operator rotations.
- Luminous phosphor green and electric cyan communicate real-time heartbeat and data throughput.
- Crisp structural paneling, microscopic hairline dividers, and monospaced telemetry telemetry readouts create an authoritative instrument grade feel.
- High-contrast alert channels (Amber and Crimson) are isolated strictly for threshold breaches to guarantee immediate, unambiguous triage.

## Colors
The palette is calibrated strictly for luminance hierarchy against pitch-black industrial control rooms.

### Core Architecture
- **Primary Phosphor Green (`#00FF66`)**: Represents nominal telemetry, authorized SCADA nodes, heartbeat pulses, and verified industrial protocol loops.
- **Secondary Electric Cyan (`#00E5FF`)**: Represents ingress/egress network vectors, interactive targets, active analysis hooks, and high-frequency sensor streams.
- **Tertiary Tactical Amber (`#F59E0B`)**: Dedicated exclusively to degraded systems, variance breaches, firmware integrity doubts, and air-gap warnings.
- **Neutral Void Obsidian (`#080C10`)**: The anchor background, paired with stepped obsidian surfaces (`#0D131A`, `#131C24`, `#1B2631`) to establish distinct visual containment without high-contrast distraction.

### Critical Escalation
- **Crimson Breach Alert (`#EF4444`)**: Reserved purely for active intrusion, unauthorized payload injection, and emergency fail-safe activations.

### Functional States & Accents
- Neon accents must be applied through hairline highlights (1px), subtle radial backdrops, and active-state indicators. Over-saturation is strictly prohibited to prevent visual burnout.

## Typography
The system enforces a dual-type architecture:

1. **Space Grotesk (Structural & Contextual)**: Engineered geometric proportions deliver rapid reading comprehension for panel headers, operational categories, and threat contextual briefings without organic softening.
2. **JetBrains Mono (Telemetry & Computational)**: Rigorous monospaced tabular metrics, network hex addresses, timestamp streams, and SCADA register values. Zero-width disambiguation across characters like `0` and `O` eliminates cognitive error in real-time intervention workflows.

All labels (`label-sm`, `label-md`) must default to uppercase transformation with widened tracking (`0.06em` to `0.08em`) to mimic aerospace cockpit instrument readouts.

## Layout & Spacing
A dense, non-negotiable 12-column modular grid optimized for ultra-wide command monitors (21:9 and 16:9 4K displays), scaling down to compact multi-pane layouts:

- **Desktop (1440px+)**: Modular 12-column fluid grid with fixed docks. Standard gutter set to `1rem` (`gutter-desktop`) with outer canvas margin of `1.5rem` (`margin-desktop`) to maximize pixel density per square inch.
- **Tablet / Secondary Screen (768px - 1439px)**: Collapses secondary telemetry ribbons into contextual slide-out trays; 8-column layout with `0.75rem` gutter.
- **Field Terminal / Mobile (< 768px)**: Single-column vertical stack with persistent sticky incident-triage bottom dock; `0.75rem` margin.

Micro-spacing inside data arrays and widgets is compressed: internal components leverage tight `space-xs` (4px) and `space-sm` (8px) gaps to allow side-by-side comparison of multiple SCADA controllers.

## Elevation & Depth
Depth is created through structured tonal layering, precision perimeter luminescences, and industrial frosted surfaces:

- **Base Floor (Z0)**: `#080C10` - The raw system background with a microscopic technical dot grid (16px grid pitch, `#15222E` at 25% opacity).
- **Surface Panels (Z1)**: `#0D131A` at 85% opacity with `backdrop-filter: blur(16px)`. Framed by a 1px border colored `#1F2E3D` (tactical perimeter).
- **Floating Tactical Docks & Trays (Z2)**: `#131C24` at 90% opacity, bordered with an active accent hairline (`rgba(0, 229, 255, 0.2)`).
- **Critical Alert Overlays & Flyouts (Z3)**: `#18222C` with targeted radial luminescent box-shadows:
  - Nominal glow: `0 0 20px rgba(0, 255, 102, 0.15), 0 0 1px #00FF66`
  - Breach glow: `0 0 30px rgba(239, 68, 68, 0.25), 0 0 1px #EF4444`

Traditional soft drop shadows are prohibited; all elevation relies on perimeter glow and dark optical density.

## Shapes
Geometry is disciplined, tactical, and industrial. The system adopts a strict `Soft (1)` corner paradigm:
- Base panels, interactive buttons, inputs, and modular telemetry tiles feature micro-radii of `0.25rem` (4px).
- Larger modal containers and floating docks cap at `0.5rem` (8px).
- Micro badges and status pips use sharp geometric rectangles or precise 45-degree chamfered corner cuts (via SVG masks/polygons) for tactical military aesthetic. Pill shapes are strictly prohibited across all functional controls.

## Components

### Buttons & Tactical Actions
- **Primary Command Button**: Obsidian base (`#00FF66` fill or `#0D131A` background with `#00FF66` 1px border and `#00FF66` text). High-intensity hover triggers a neon cyan shift with inner glow (`box-shadow: inset 0 0 10px rgba(0, 255, 102, 0.3)`).
- **Secondary Operator Action**: `#131C24` surface, 1px border `#243647`, text in neutral white (`#F1F5F9`). Hover triggers 1px border `#00E5FF`.
- **Destructive / Override Button**: Dark crimson base (`rgba(239, 68, 68, 0.1)`), 1px border `#EF4444`, text `#EF4444`. Pulsing hairline border upon focus.

### Status Chips & Telemetry Tags
- Micro height (20px to 24px) styled with `JetBrains Mono` at `label-sm`.
- Formatted as `[ STATUS : VALUE ]` with a 6px static or pulsing square LED pip.
- Solid dark fills with matching low-alpha borders:
  - Nominal: `rgba(0, 255, 102, 0.08)` fill, `rgba(0, 255, 102, 0.3)` border.
  - Warning: `rgba(245, 158, 11, 0.08)` fill, `rgba(245, 158, 11, 0.3)` border.
  - Critical: `rgba(239, 68, 68, 0.12)` fill, `rgba(239, 68, 68, 0.5)` border.

### Telemetry Ribbons & Data Streams
- Real-time continuous scrolling or tabular tickers anchored to the top or bottom edge of the display.
- Tabular row strips alternating between `#0D131A` and `#101720`. Hover triggers a full-row scanline effect in `#00E5FF` at 5% opacity.

### Precision Inputs & Search Filters
- Ultra-flat `#090E14` field fill with sharp 1px border `#1F2E3D`.
- Active focus state immediately converts border to `#00E5FF` with a micro 1px outer glow.
- Monospace font for telemetry queries, IP routing, SCADA registers, and syntax parameters.

### Selection Controls (Checkboxes & Radios)
- Square geometry (checkbox) and diamond geometry (radio).
- 1px border `#2A3F54`. Checked state yields solid `#00FF66` fill with an obsidian checkmark or a central square emitter.

### Industrial SCADA Telemetry Widgets & Cards
- Framed panels featuring tactical HUD corner accents (4px corner brackets via CSS pseudo-elements).
- Top utility bar containing: subsystem designation (`label-sm`), uptime clock (`JetBrains Mono`), and link-state indicator.
- Metric display pairing an oversized monospaced number (`telemetry-metric`) with a live sparkline SVG trace or frequency wave rendered in `#00FF66` or `#00E5FF`.
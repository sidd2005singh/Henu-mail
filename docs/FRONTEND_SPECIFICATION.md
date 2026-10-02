# Frontend Specification & Design System Document

## Project: HENU MAIL
**Design & Engineering:** HENU OS Private Limited  
**Visual Style:** Scientific Telemetry & Precision Engineering  
**Version:** 1.0.0  

---

## 1. Visual Identity & Aesthetic Principles

HENU MAIL is inspired by scientific instruments, aerospace control systems, and high-precision laboratory monitoring.

### 1.1 Color Palette & Design Tokens

| Token Name | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| `--background` | `#0b0e14` | Deep graphite/near-black viewport canvas |
| `--surface-primary` | `#111622` | Primary container surface |
| `--surface-secondary`| `#182030` | Interactive card and panel surface |
| `--surface-elevated` | `#1f293d` | Hover states, popovers, dialogs |
| `--border-subtle` | `#232d42` | Restrained metallic border separating panels |
| `--border-strong` | `#3b4968` | Focus rings, active tabs, highlighted cards |
| `--accent-henu` | `#00d2ff` | HENU Signal Cyan: primary actions, active telemetry |
| `--accent-henu-glow`| `rgba(0, 210, 255, 0.15)` | Micro-glow on active status and gauges |
| `--text-primary` | `#f1f5f9` | High-contrast crisp off-white for data & headers |
| `--text-secondary` | `#94a3b8` | Muted slate for telemetry labels & metrics |
| `--text-tertiary` | `#64748b` | Timestamps, micro-badges, hints |
| `--status-success` | `#10b981` | Emerald: healthy deliverability, sent, active |
| `--status-warning` | `#f59e0b` | Amber: warmup phase, near limit, paused |
| `--status-error` | `#f43f5e` | Crimson: bounced, suppressed, failed, emergency stop |
| `--status-info` | `#38bdf8` | Sky blue: queued, processing, informational |

---

## 2. Typography & Spatial Grid

- **Headings & Data Numerals**: High-legibility monospaced or crisp sans font for numerical metrics and telemetry (`font-mono` / `font-sans` with tabular numerals `tabular-nums`).
- **Body & Labels**: Clean geometric sans-serif (`Inter` or system UI).
- **Grid Layout**: Strict 4px/8px modular scale.
- **Borders & Radii**: Sharp, refined border radiuses (`rounded-sm` to `rounded-md` - max 6px/8px) to reflect precision engineering rather than playful consumer pills.

---

## 3. Core Component Architecture

1. **`AppShell`**:
   - Collapsible scientific sidebar with role-aware route filters.
   - Live telemetry status bar with real-time heartbeat indicator.
   - Header with active workspace indicator, search palette trigger, user menu.
   - Configurable enterprise footer (HENU OS Private Limited legal and compliance details).
2. **`StatsCard`**:
   - Precision metric display with delta indicators, mini-charts, and status glow.
3. **`TelemetryBadge`**:
   - Status indicators (`ONLINE`, `WARMING`, `PAUSED`, `CRITICAL`, `DELIVERED`).
4. **`DataTable`**:
   - TanStack Table v8 integration with column sorting, filtering, selection, and empty state support.
5. **`ModalDialog`**:
   - Accessible keyboard-trapped modal overlay with metallic border accents.
6. **`EmptyState`**:
   - Thoughtful, non-generic zero data visual states with direct action triggers.

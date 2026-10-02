import * as React from "react";
import { cn } from "@/lib/utils";

export interface TelemetryBadgeProps {
  status: "nominal" | "online" | "warning" | "critical" | "offline" | "warming" | "paused" | "degraded" | "maintenance";
  label?: string;
  className?: string;
}

export function TelemetryBadge({
  status,
  label,
  className,
}: TelemetryBadgeProps) {
  const statusConfig: Record<TelemetryBadgeProps["status"], { color: string; text: string; border: string; defaultLabel: string }> = {
    nominal: {
      color: "bg-emerald-400",
      text: "text-emerald-400",
      border: "border-emerald-500/30 bg-emerald-500/10",
      defaultLabel: "SYSTEM NOMINAL",
    },
    online: {
      color: "bg-emerald-400",
      text: "text-emerald-400",
      border: "border-emerald-500/30 bg-emerald-500/10",
      defaultLabel: "ONLINE",
    },
    warming: {
      color: "bg-amber-400",
      text: "text-amber-400",
      border: "border-amber-500/30 bg-amber-500/10",
      defaultLabel: "WARMING UP",
    },
    warning: {
      color: "bg-amber-400",
      text: "text-amber-400",
      border: "border-amber-500/30 bg-amber-500/10",
      defaultLabel: "WARNING",
    },
    degraded: {
      color: "bg-amber-400",
      text: "text-amber-400",
      border: "border-amber-500/30 bg-amber-500/10",
      defaultLabel: "DEGRADED",
    },
    maintenance: {
      color: "bg-blue-400",
      text: "text-blue-400",
      border: "border-blue-500/30 bg-blue-500/10",
      defaultLabel: "MAINTENANCE",
    },
    paused: {
      color: "bg-slate-400",
      text: "text-slate-400",
      border: "border-slate-500/30 bg-slate-500/10",
      defaultLabel: "PAUSED",
    },
    critical: {
      color: "bg-rose-400",
      text: "text-rose-400",
      border: "border-rose-500/30 bg-rose-500/10",
      defaultLabel: "CRITICAL",
    },
    offline: {
      color: "bg-slate-400",
      text: "text-slate-400",
      border: "border-slate-500/30 bg-slate-500/10",
      defaultLabel: "OFFLINE",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded border font-mono text-[11px] uppercase tracking-wider font-semibold select-none",
        config.border,
        config.text,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            config.color
          )}
        />
        <span
          className={cn("relative inline-flex rounded-full h-2 w-2", config.color)}
        />
      </span>
      <span>{label || config.defaultLabel}</span>
    </div>
  );
}

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  status?: "nominal" | "warning" | "critical" | "info";
  className?: string;
}

export function StatsCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  status = "info",
  className,
}: StatsCardProps) {
  const statusAccent = {
    nominal: "border-l-status-online",
    warning: "border-l-status-warming",
    critical: "border-l-status-critical",
    info: "border-l-henu-500",
  };

  return (
    <div
      className={cn(
        "bg-surface-100 border border-border-default rounded p-4 relative overflow-hidden transition-all duration-200 border-l-[3px]",
        statusAccent[status],
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-slate-400 stroke-[1.75]" />}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
          {value}
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-mono font-medium",
              trend.isPositive ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subValue && (
        <p className="text-[11px] text-slate-500 mt-1 font-mono">{subValue}</p>
      )}
    </div>
  );
}

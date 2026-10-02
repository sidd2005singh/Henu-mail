import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline" | "neutral" | "error";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-surface-300 text-slate-300 border-border-default",
    neutral: "bg-surface-300 text-slate-300 border-border-default",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    error: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    info: "bg-henu-500/10 text-henu-400 border-henu-500/30",
    outline: "bg-transparent text-slate-300 border-border-default",
  };

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-xs",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 font-mono uppercase tracking-wider rounded border font-medium select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

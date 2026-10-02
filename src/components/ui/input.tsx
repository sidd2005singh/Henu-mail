import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, label, hint, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-slate-300 tracking-wide uppercase font-mono"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full bg-surface-100 border border-border-default rounded px-3 py-2 text-sm text-foreground placeholder:text-slate-500 transition-colors focus:outline-none focus:border-henu-500 focus:ring-1 focus:ring-henu-500/50 disabled:opacity-50 disabled:bg-surface-50 font-sans",
              error && "border-status-critical focus:border-status-critical focus:ring-status-critical/30",
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        {error && <p className="text-xs text-status-critical font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

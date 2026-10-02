import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, options, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-slate-300 tracking-wide uppercase font-mono"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full bg-surface-100 border border-border-default rounded px-3 py-2 text-sm text-foreground transition-colors focus:outline-none focus:border-henu-500 focus:ring-1 focus:ring-henu-500/50 disabled:opacity-50 disabled:bg-surface-50 font-sans cursor-pointer",
            error && "border-status-critical focus:border-status-critical",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-100 text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-status-critical font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

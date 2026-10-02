import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "default" | "secondary" | "danger" | "ghost" | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-henu-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded";

    const variantStyles = {
      primary:
        "bg-henu-500 text-surface-50 hover:bg-henu-400 active:bg-henu-600 font-semibold shadow-scientific-sm",
      default:
        "bg-henu-500 text-surface-50 hover:bg-henu-400 active:bg-henu-600 font-semibold shadow-scientific-sm",
      secondary:
        "bg-surface-200 text-foreground hover:bg-surface-300 active:bg-surface-400 border border-border-default",
      danger:
        "bg-status-critical/15 text-status-critical border border-status-critical/30 hover:bg-status-critical/25 active:bg-status-critical/35",
      ghost:
        "text-slate-300 hover:text-foreground hover:bg-surface-200 active:bg-surface-300",
      outline:
        "bg-transparent text-foreground border border-border-default hover:border-henu-500/50 hover:bg-surface-100",
    };

    const sizeStyles = {
      xs: "px-2 py-1 text-xs gap-1.5",
      sm: "px-2.5 py-1.5 text-xs gap-2",
      md: "px-3.5 py-2 text-sm gap-2",
      lg: "px-4 py-2.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

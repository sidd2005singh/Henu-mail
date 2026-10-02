import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded border border-dashed border-border-default bg-surface-50/50">
      <div className="w-12 h-12 rounded-full bg-surface-200 border border-border-default flex items-center justify-center text-henu-400 mb-4 shadow-scientific-sm">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-semibold font-mono uppercase tracking-wide text-foreground mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="primary" size="sm">
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="secondary" size="sm">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

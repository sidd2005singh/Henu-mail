"use client";

import * as React from "react";
import { DeliverabilityScoreResult } from "@/lib/templates/deliverability-scorer";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, Info, CheckCircle2, X } from "lucide-react";

interface TemplateScorerBadgeProps {
  scoreResult: DeliverabilityScoreResult;
}

export function TemplateScorerBadge({ scoreResult }: TemplateScorerBadgeProps) {
  const [showDrawer, setShowDrawer] = React.useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 70) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <>
      <button
        onClick={() => setShowDrawer(true)}
        className={`px-3 py-1.5 rounded border font-mono text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 select-none ${getScoreColor(
          scoreResult.score
        )}`}
        title="View Deliverability & Spam Analysis Diagnostics"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>DELIVERABILITY SCORE: {scoreResult.score}/100 ({scoreResult.grade})</span>
      </button>

      {/* Diagnostics Modal */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-surface-100 border border-border-default rounded shadow-2xl overflow-hidden font-mono text-xs">
            <div className="p-4 border-b border-border-subtle bg-surface-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-henu-400" />
                <h3 className="font-bold text-sm text-foreground uppercase">
                  DELIVERABILITY & SPAM ANALYSIS
                </h3>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 rounded text-slate-400 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Score Header */}
              <div className="flex items-center justify-between p-3.5 rounded bg-surface-50 border border-border-subtle">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase">CAMPAIGN READINESS GRADE</div>
                  <div className="text-xl font-bold text-foreground mt-0.5">
                    Grade {scoreResult.grade} &bull; {scoreResult.score} / 100
                  </div>
                </div>
                <Badge
                  variant={scoreResult.isLaunchReady ? "success" : "danger"}
                  size="sm"
                >
                  {scoreResult.isLaunchReady ? "LAUNCH READY" : "ACTION REQUIRED"}
                </Badge>
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                <div className="p-2 rounded bg-surface-50 border border-border-subtle">
                  <div className="text-slate-400">SUBJECT LENGTH</div>
                  <div className="text-foreground font-bold">{scoreResult.metrics.subjectLength} chars</div>
                </div>
                <div className="p-2 rounded bg-surface-50 border border-border-subtle">
                  <div className="text-slate-400">PAYLOAD SIZE</div>
                  <div className="text-foreground font-bold">{(scoreResult.metrics.htmlSizeBytes / 1024).toFixed(1)} KB</div>
                </div>
              </div>

              {/* Diagnostic Items */}
              <div className="space-y-2">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">PRE-FLIGHT CHECKS</div>
                {scoreResult.diagnostics.map((diag, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border flex items-start gap-2.5 font-sans ${
                      diag.type === "error"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        : diag.type === "warning"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                        : "bg-surface-50 border-border-subtle text-slate-300"
                    }`}
                  >
                    {diag.type === "error" ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : diag.type === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5 text-xs">
                      <div className="font-semibold">{diag.title}</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{diag.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

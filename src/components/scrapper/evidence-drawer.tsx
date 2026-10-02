"use client";

import * as React from "react";
import {
  X,
  ShieldCheck,
  ExternalLink,
  Clock,
  Globe,
  FileText,
  AlertTriangle,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface EvidenceItemData {
  fieldLabel: string;
  fieldValue: string;
  sourceName: string;
  sourceUrl: string;
  observedSnippet: string;
  pageTitle?: string;
  discoveredTimestamp: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "UNVERIFIED" | "CONFLICT" | "NOT_FOUND";
  confidenceScore: number;
  verificationStatus: string;
  isInferred?: boolean;
  corroboratingSources?: Array<{ name: string; url: string }>;
}

interface EvidenceDrawerProps {
  evidence: EvidenceItemData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EvidenceDrawer({
  evidence,
  isOpen,
  onClose,
}: EvidenceDrawerProps) {
  if (!isOpen || !evidence) return null;

  const getConfidenceBadge = (conf: string) => {
    switch (conf) {
      case "HIGH":
        return <Badge variant="success">HIGH CONFIDENCE</Badge>;
      case "MEDIUM":
        return <Badge variant="warning">MEDIUM CONFIDENCE</Badge>;
      case "CONFLICT":
        return <Badge variant="danger">CONFLICT DETECTED</Badge>;
      case "LOW":
        return <Badge variant="neutral">LOW CONFIDENCE</Badge>;
      default:
        return <Badge variant="neutral">UNVERIFIED</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-100 border-l border-border-default shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-subtle bg-surface-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono uppercase tracking-wide text-foreground">
                  Evidence & Provenance Trail
                </h3>
                <p className="text-[11px] font-mono text-slate-400">
                  {evidence.fieldLabel}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-surface-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5 text-xs font-mono">
            {/* Value & Verification Status */}
            <div className="p-4 rounded bg-surface-50 border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase text-[10px]">Discovered Fact</span>
                {getConfidenceBadge(evidence.confidence)}
              </div>
              <div className="text-base font-bold text-foreground font-mono break-all">
                {evidence.fieldValue}
              </div>
              <div className="text-[11px] text-slate-300 pt-1 flex items-center gap-2">
                <span>Verification Status:</span>
                <span className="text-emerald-400 font-semibold uppercase">
                  {evidence.verificationStatus}
                </span>
                {evidence.isInferred && (
                  <Badge variant="warning" size="sm">
                    PATTERN INFERRED
                  </Badge>
                )}
              </div>
            </div>

            {/* Inferred Notice */}
            {evidence.isInferred && (
              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Notice: This email address is derived from verified domain syntax conventions rather than raw text observation. High deliverability warmup is recommended before outreach.
                </span>
              </div>
            )}

            {/* Observed Snippet */}
            <div className="space-y-1.5">
              <span className="text-slate-400 uppercase text-[10px] font-bold">
                Observed Source Snippet / Imprint
              </span>
              <div className="p-3 rounded bg-surface-200/50 border border-border-subtle text-slate-200 text-xs leading-relaxed">
                &quot;{evidence.observedSnippet}&quot;
              </div>
            </div>

            {/* Primary Source Provenance */}
            <div className="p-4 rounded bg-surface-50 border border-border-subtle space-y-2.5">
              <span className="text-slate-400 uppercase text-[10px] font-bold">
                Primary Source Provenance
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">{evidence.sourceName}</span>
                <a
                  href={evidence.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  Inspect Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-[11px] text-slate-400 truncate break-all">
                URL: {evidence.sourceUrl}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1 border-t border-border-subtle">
                <Clock className="w-3 h-3" />
                <span>Captured: {new Date(evidence.discoveredTimestamp).toLocaleString()}</span>
              </div>
            </div>

            {/* Corroborating Sources */}
            {evidence.corroboratingSources && evidence.corroboratingSources.length > 0 && (
              <div className="p-4 rounded bg-surface-50 border border-border-subtle space-y-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold">
                  Corroborating Sources ({evidence.corroboratingSources.length})
                </span>
                <div className="space-y-1.5">
                  {evidence.corroboratingSources.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">{s.name}</span>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline flex items-center gap-1"
                      >
                        Source <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-subtle bg-surface-50 flex justify-end shrink-0">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs font-mono">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

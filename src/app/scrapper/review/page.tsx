"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  AlertTriangle,
  Check,
  X,
  Building2,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Edit2,
  ExternalLink,
  Eye,
} from "lucide-react";

interface ReviewItem {
  id: string;
  companyId: string;
  cin?: string;
  originalCompanyName: string;
  discoveredCompanyName?: string;
  discrepancyType: "cin_mismatch" | "conflicting_directors" | "address_disagreement" | "low_confidence";
  reason: string;
  evidenceSnippet: string;
  sourceName: string;
  sourceUrl: string;
  confidenceScore: number;
}

const SAMPLE_REVIEW_ITEMS: ReviewItem[] = [
  {
    id: "rev-001",
    companyId: "comp-mca-003",
    cin: "U74999MH2018PTC309812",
    originalCompanyName: "NEXUS LOGISTICS SERVICES PRIVATE LIMITED",
    discoveredCompanyName: "Nexus Logistics & Supply Chain Pvt Ltd",
    discrepancyType: "cin_mismatch",
    reason: "Discovered business website name differs slightly from official RoC Delhi registered corporate name.",
    evidenceSnippet: "Website Header: 'Nexus Logistics & Supply Chain Pvt Ltd - Serving Pan-India Since 2018'. RoC Filing: 'NEXUS LOGISTICS SERVICES PRIVATE LIMITED'.",
    sourceName: "Official Website vs MCA Registry",
    sourceUrl: "https://mca.gov.in",
    confidenceScore: 0.62,
  },
  {
    id: "rev-002",
    companyId: "comp-mca-004",
    cin: "U72900KA2020PTC134567",
    originalCompanyName: "KINETIC QUANTUM SYSTEMS PRIVATE LIMITED",
    discoveredCompanyName: "Kinetic Quantum Systems Pvt Ltd",
    discrepancyType: "conflicting_directors",
    reason: "Conflicting director records between MCA signatory filing and executive LinkedIn imprint.",
    evidenceSnippet: "MCA lists Dr. Arvind Rao (DIN: 08412990) as MD. LinkedIn page claims Chief Executive is Suresh Ramanathan.",
    sourceName: "MCA Signatory vs LinkedIn Graph",
    sourceUrl: "https://mca.gov.in",
    confidenceScore: 0.58,
  },
];

export default function ScrapperReviewPage() {
  const [reviewItems, setReviewItems] = React.useState<ReviewItem[]>(SAMPLE_REVIEW_ITEMS);
  const [resolvedMessage, setResolvedMessage] = React.useState<string | null>(null);

  const handleResolve = (id: string, action: "verify" | "reject" | "retry") => {
    const item = reviewItems.find((r) => r.id === id);
    setReviewItems((prev) => prev.filter((r) => r.id !== id));
    setResolvedMessage(
      `Resolved review item for "${item?.originalCompanyName}": ${action.toUpperCase()} action applied and audit history recorded.`
    );
    setTimeout(() => setResolvedMessage(null), 4000);
  };

  return (
    <AppShell title="HENU Scrapper — Review & Discrepancy Queue">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-50 p-5 rounded border border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold font-mono text-foreground uppercase">
                Human-in-the-Loop Quality Verification Queue
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Review company records with source disagreements, conflicting director roles, or low confidence scores.
            </p>
          </div>
          <Badge variant={reviewItems.length > 0 ? "warning" : "success"} className="font-mono text-xs">
            {reviewItems.length} Items Pending Review
          </Badge>
        </div>

        {resolvedMessage && (
          <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{resolvedMessage}</span>
          </div>
        )}

        {/* Review Items Grid */}
        {reviewItems.length === 0 ? (
          <div className="p-12 text-center bg-surface-50 rounded border border-border-subtle space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold font-mono text-foreground">Review Queue is Clear</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto font-mono">
              All company records currently meet the active confidence thresholds with 0 unresolved conflicts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewItems.map((item) => (
              <Card
                key={item.id}
                className="p-5 bg-surface-50 border-border-subtle space-y-4 text-xs font-mono"
              >
                {/* Discrepancy Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold text-foreground text-sm">
                      {item.originalCompanyName}
                    </span>
                    <span className="text-amber-400 font-bold">{item.cin || "NO CIN"}</span>
                  </div>
                  <Badge variant="warning">
                    CONFIDENCE: {Math.round(item.confidenceScore * 100)}%
                  </Badge>
                </div>

                {/* Reason */}
                <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <span className="font-bold">Discrepancy: </span>
                  <span>{item.reason}</span>
                </div>

                {/* Evidence snippet */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Observed Evidence & Conflict Snippet</div>
                  <div className="p-3 rounded bg-surface-200/50 border border-border-subtle text-slate-200 leading-relaxed">
                    &quot;{item.evidenceSnippet}&quot;
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span>Source: <span className="text-foreground">{item.sourceName}</span></span>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1"
                    >
                      Verify <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolve(item.id, "retry")}
                      className="text-xs font-mono"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retry Deep Search
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResolve(item.id, "reject")}
                      className="text-xs font-mono text-red-400 hover:text-red-300"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Reject Discrepancy
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleResolve(item.id, "verify")}
                      className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs font-mono"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Mark As Verified
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

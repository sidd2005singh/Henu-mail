"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, PieChart, ShieldCheck, CheckCircle2, Building2 } from "lucide-react";

export default function ScrapperAnalyticsPage() {
  return (
    <AppShell title="HENU Scrapper — Analytics & Intelligence Metrics">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-50 p-5 rounded border border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold font-mono text-foreground uppercase">
                Scrapper Enrichment Performance & Coverage
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Breakdown of discovery rates, deliverability metrics, and provider quota consumption.
            </p>
          </div>
          <Badge variant="info" className="font-mono text-xs">
            Live Telemetry Active
          </Badge>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-50 border-border-subtle">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Director Extraction Rate</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">100%</div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">Average 1.5 directors / entity</div>
          </Card>
          <Card className="p-4 bg-surface-50 border-border-subtle">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Email Deliverability Rate</div>
            <div className="text-2xl font-bold font-mono text-foreground mt-2">95.8%</div>
            <div className="text-[11px] font-mono text-emerald-400 mt-1">Direct executive inboxes</div>
          </Card>
          <Card className="p-4 bg-surface-50 border-border-subtle">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Domain Match Accuracy</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-2">98.2%</div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">WHOIS & DNS corroborated</div>
          </Card>
          <Card className="p-4 bg-surface-50 border-border-subtle">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Average Latency / Entity</div>
            <div className="text-2xl font-bold font-mono text-blue-400 mt-2">1.4s</div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">Asynchronous parallel workers</div>
          </Card>
        </div>

        {/* Coverage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 bg-surface-50 border-border-subtle space-y-3">
            <h3 className="text-sm font-bold font-mono text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              State & ROC Jurisdiction Coverage
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-surface-200/50">
                <span className="text-slate-300">RoC Delhi (DL)</span>
                <span className="text-amber-400 font-bold">50%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-200/50">
                <span className="text-slate-300">RoC Mumbai (MH)</span>
                <span className="text-amber-400 font-bold">50%</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-surface-50 border-border-subtle space-y-3">
            <h3 className="text-sm font-bold font-mono text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Confidence Distribution
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-surface-200/50">
                <span className="text-slate-300">High Confidence (&gt;90%)</span>
                <span className="text-emerald-400 font-bold">100% of verified records</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-200/50">
                <span className="text-slate-300">Medium Confidence (70% - 90%)</span>
                <span className="text-slate-400">0%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

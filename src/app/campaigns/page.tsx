"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Send,
  Plus,
  Search,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  Clock,
  Layers,
  BarChart3,
  Info,
} from "lucide-react";
import { CampaignBuilderWizard } from "@/components/campaigns/campaign-builder-wizard";

interface CampaignItem {
  id: string;
  name: string;
  description: string;
  status: "running" | "paused" | "scheduled" | "completed" | "cancelled";
  totalRecipients: number;
  sentCount: number;
  queuedCount: number;
  failedCount: number;
  bouncedCount: number;
  replyCount: number;
  unsubscribeCount: number;
  clickCount: number;
  timezone: string;
  sequenceStepsCount: number;
  createdAt: string;
}

export default function CampaignsPage() {
  const [search, setSearch] = React.useState("");
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [campaigns, setCampaigns] = React.useState<CampaignItem[]>([
    {
      id: "cmp-101",
      name: "AI Automation Outreach - Q4 Tier 1 Founders",
      description: "Targeting enterprise directors for AI Workflow consultation",
      status: "running",
      totalRecipients: 438,
      sentCount: 320,
      queuedCount: 102,
      failedCount: 4,
      bouncedCount: 2,
      replyCount: 42,
      unsubscribeCount: 10,
      clickCount: 88,
      timezone: "Asia/Kolkata",
      sequenceStepsCount: 3,
      createdAt: "2026-10-01T10:00:00Z",
    },
    {
      id: "cmp-102",
      name: "Software Solutions - Startup Acceleration",
      description: "Full-stack software development pitch to funded startups",
      status: "paused",
      totalRecipients: 250,
      sentCount: 84,
      queuedCount: 162,
      failedCount: 0,
      bouncedCount: 1,
      replyCount: 14,
      unsubscribeCount: 3,
      clickCount: 29,
      timezone: "America/New_York",
      sequenceStepsCount: 2,
      createdAt: "2026-10-01T14:30:00Z",
    },
    {
      id: "cmp-103",
      name: "Enterprise Cloud Optimization Consultation",
      description: "Cloud infrastructure audit and microservices architecture outreach",
      status: "scheduled",
      totalRecipients: 600,
      sentCount: 0,
      queuedCount: 600,
      failedCount: 0,
      bouncedCount: 0,
      replyCount: 0,
      unsubscribeCount: 0,
      clickCount: 0,
      timezone: "UTC",
      sequenceStepsCount: 4,
      createdAt: "2026-10-02T08:00:00Z",
    },
  ]);

  // Campaign Control Handlers
  const handleControlAction = async (campaignId: string, action: "start" | "pause" | "resume" | "cancel" | "retry_failed") => {
    try {
      const res = await fetch(`/api/v1/campaigns/${campaignId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns((prev) =>
          prev.map((c) => {
            if (c.id !== campaignId) return c;
            let nextStatus: CampaignItem["status"] = c.status;
            if (action === "pause") nextStatus = "paused";
            else if (action === "resume" || action === "start" || action === "retry_failed") nextStatus = "running";
            else if (action === "cancel") nextStatus = "cancelled";

            return {
              ...c,
              status: nextStatus,
              failedCount: action === "retry_failed" ? 0 : c.failedCount,
            };
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCampaigns = campaigns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  // Totals
  const totalLeads = campaigns.reduce((acc, c) => acc + c.totalRecipients, 0);
  const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const totalQueued = campaigns.reduce((acc, c) => acc + c.queuedCount, 0);
  const totalReplies = campaigns.reduce((acc, c) => acc + c.replyCount, 0);
  const totalBounced = campaigns.reduce((acc, c) => acc + c.bouncedCount, 0);
  const totalUnsub = campaigns.reduce((acc, c) => acc + c.unsubscribeCount, 0);

  return (
    <AppShell userRole="admin">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2.5">
            <Send className="w-5 h-5 text-henu-400" />
            <span>OUTREACH CAMPAIGNS & SEQUENCE MANAGEMENT</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Multi-step follow-up sequences, automated stop guardrails, and real-time delivery telemetry
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={() => setIsWizardOpen(true)} className="gap-1.5 font-mono text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>NEW OUTREACH CAMPAIGN</span>
        </Button>
      </div>

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 space-y-1 font-mono">
          <div className="text-[10px] text-slate-400 uppercase">Total Leads</div>
          <div className="text-xl font-bold text-foreground">{totalLeads}</div>
        </Card>

        <Card className="p-3.5 space-y-1 font-mono">
          <div className="text-[10px] text-henu-400 uppercase">Queued</div>
          <div className="text-xl font-bold text-henu-400">{totalQueued}</div>
        </Card>

        <Card className="p-3.5 space-y-1 font-mono">
          <div className="text-[10px] text-emerald-400 uppercase">Sent Dispatches</div>
          <div className="text-xl font-bold text-emerald-400">{totalSent}</div>
        </Card>

        <Card className="p-3.5 space-y-1 font-mono">
          <div className="text-[10px] text-blue-400 uppercase">Replies</div>
          <div className="text-xl font-bold text-blue-400">{totalReplies}</div>
        </Card>

        <Card className="p-3.5 space-y-1 font-mono">
          <div className="text-[10px] text-amber-400 uppercase">Bounced</div>
          <div className="text-xl font-bold text-amber-400">{totalBounced}</div>
        </Card>

        <Card className="p-3.5 space-y-1 font-mono">
          <div className="text-[10px] text-red-400 uppercase">Unsubscribed</div>
          <div className="text-xl font-bold text-red-400">{totalUnsub}</div>
        </Card>
      </div>

      {/* Deliverability Accuracy Notice */}
      <div className="p-3 rounded-lg bg-surface-100/60 border border-border-subtle flex items-center gap-2.5 text-xs text-slate-400 font-mono">
        <Info className="w-4 h-4 text-henu-400 shrink-0" />
        <span>
          <strong>Telemetry Notice:</strong> Delivery and reply metrics are authoritative. Click metrics reflect verified URL redirects. Pixel tracking is estimated due to mail client caching.
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <Input
          placeholder="Filter campaigns by name or target audience..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-xs font-mono"
        />
      </div>

      {/* Campaigns Table */}
      <Card className="p-0 overflow-hidden border-border-default">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-100/80 border-b border-border-subtle text-slate-400 text-[11px] uppercase">
              <tr>
                <th className="p-3.5">Campaign Name</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Sequences</th>
                <th className="p-3.5">Recipients</th>
                <th className="p-3.5">Progress</th>
                <th className="p-3.5">Replies</th>
                <th className="p-3.5">Bounces</th>
                <th className="p-3.5 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredCampaigns.map((c) => {
                const percent = Math.min(100, Math.round((c.sentCount / (c.totalRecipients || 1)) * 100));

                return (
                  <tr key={c.id} className="hover:bg-surface-100/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-foreground text-sm">{c.name}</div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">{c.description}</div>
                    </td>

                    <td className="p-3.5">
                      <Badge
                        variant={
                          c.status === "running"
                            ? "success"
                            : c.status === "paused"
                            ? "warning"
                            : c.status === "scheduled"
                            ? "info"
                            : "outline"
                        }
                        size="sm"
                      >
                        {c.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Layers className="w-3.5 h-3.5 text-henu-400" />
                        <span>{c.sequenceStepsCount} Steps</span>
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-foreground">{c.totalRecipients}</td>

                    <td className="p-3.5 w-44">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>{c.sentCount} / {c.totalRecipients}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-surface-300 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-henu-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </td>

                    <td className="p-3.5 text-emerald-400 font-bold">{c.replyCount}</td>
                    <td className="p-3.5 text-amber-400">{c.bouncedCount}</td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status === "running" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleControlAction(c.id, "pause")}
                            className="p-1.5 h-7 text-[11px] font-mono gap-1"
                          >
                            <Pause className="w-3 h-3 text-amber-400" />
                            <span>PAUSE</span>
                          </Button>
                        )}

                        {c.status === "paused" && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleControlAction(c.id, "resume")}
                            className="p-1.5 h-7 text-[11px] font-mono gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>RESUME</span>
                          </Button>
                        )}

                        {c.failedCount > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleControlAction(c.id, "retry_failed")}
                            className="p-1.5 h-7 text-[11px] font-mono gap-1"
                          >
                            <RotateCcw className="w-3 h-3 text-henu-400" />
                            <span>RETRY ({c.failedCount})</span>
                          </Button>
                        )}

                        {c.status !== "cancelled" && c.status !== "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleControlAction(c.id, "cancel")}
                            className="p-1.5 h-7 text-[11px] font-mono text-slate-400 hover:text-red-400"
                            title="Cancel campaign"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Campaign Builder Wizard */}
      <CampaignBuilderWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCampaignCreated={(newCamp) => {
          setCampaigns((prev) => [
            {
              id: newCamp.id,
              name: newCamp.name,
              description: newCamp.description || "",
              status: newCamp.status === "running" ? "running" : "scheduled",
              totalRecipients: newCamp.totalRecipients || 422,
              sentCount: 0,
              queuedCount: newCamp.totalRecipients || 422,
              failedCount: 0,
              bouncedCount: 0,
              replyCount: 0,
              unsubscribeCount: 0,
              clickCount: 0,
              timezone: newCamp.scheduleConfig?.timezone || "Asia/Kolkata",
              sequenceStepsCount: newCamp.sequenceSteps?.length || 3,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }}
      />
    </AppShell>
  );
}

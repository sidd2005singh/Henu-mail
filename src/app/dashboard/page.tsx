"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TelemetryBadge } from "@/components/ui/telemetry-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Send,
  Radio,
  MailCheck,
  MailWarning,
  MessageSquareReply,
  UserMinus,
  AlertOctagon,
  ShieldCheck,
  Plus,
  Play,
  Pause,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { SystemTelemetry, Campaign } from "@/types";

export default function DashboardPage() {
  // Telemetry state (connected to API / real-time telemetry)
  const [telemetry, setTelemetry] = React.useState<SystemTelemetry>({
    todaySending: {
      sent: 142,
      limit: 499,
      queued: 86,
      failed: 0,
    },
    campaigns: {
      active: 3,
      total: 5,
      paused: 1,
    },
    engagement: {
      delivered: 340,
      opened: 218,
      clicked: 94,
      replied: 46,
      bounced: 2,
      unsubscribed: 1,
    },
    providerHealth: {
      overallScore: 98,
      connectedAccounts: 4,
      warmingAccounts: 1,
      criticalAccounts: 0,
    },
    systemStatus: "nominal",
  });

  const [recentCampaigns, setRecentCampaigns] = React.useState<Campaign[]>([
    {
      id: "c-101",
      workspaceId: "ws-1",
      name: "AI Automation Outreach - Q4 Tier 1 Founders",
      description: "Targeting enterprise directors for AI Workflow consultation",
      status: "running",
      assignedEmailAccountIds: ["ea-1", "ea-2"],
      steps: [],
      scheduleConfig: {
        timezone: "UTC",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        hours: { start: 9, end: 17 },
      },
      stopOnReply: true,
      trackOpens: true,
      trackClicks: true,
      totalLeads: 500,
      sentCount: 320,
      openCount: 204,
      clickCount: 88,
      replyCount: 42,
      bounceCount: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "c-102",
      workspaceId: "ws-1",
      name: "Software Solutions - Startup Acceleration",
      description: "Full-stack software development pitch to funded startups",
      status: "running",
      assignedEmailAccountIds: ["ea-3"],
      steps: [],
      scheduleConfig: {
        timezone: "UTC",
        days: ["Mon", "Tue", "Wed", "Thu"],
        hours: { start: 10, end: 18 },
      },
      stopOnReply: true,
      trackOpens: true,
      trackClicks: true,
      totalLeads: 250,
      sentCount: 22,
      openCount: 14,
      clickCount: 6,
      replyCount: 4,
      bounceCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [hasData, setHasData] = React.useState(true);

  return (
    <AppShell userRole="admin" userEmail="admin@henuos.com">
      {/* Top Telemetry Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-mono tracking-tight text-foreground">
              DISPATCH TELEMETRY & OUTREACH CONSOLE
            </h1>
            <TelemetryBadge status={telemetry.systemStatus} label="NOMINAL" />
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time queue orchestration, deliverability indexing, and campaign telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Data State Toggle for QA & Demonstration */}
          <button
            onClick={() => setHasData(!hasData)}
            className="text-[11px] font-mono px-2.5 py-1 rounded bg-surface-200 border border-border-default text-slate-400 hover:text-foreground transition-colors"
            title="Toggle zero state vs populated telemetry"
          >
            Mode: {hasData ? "Active Telemetry" : "Zero State"}
          </button>

          <Link href="/campaigns/new">
            <Button size="sm" variant="primary" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>NEW CAMPAIGN</span>
            </Button>
          </Link>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={Send}
          title="NO ACTIVE DISPATCH OR HISTORICAL TELEMETRY"
          description="Your workspace is fully provisioned and ready. Connect an email provider or configure your first outbound campaign to begin telemetry stream."
          actionLabel="CREATE FIRST CAMPAIGN"
          onAction={() => setHasData(true)}
          secondaryActionLabel="CONNECT EMAIL ACCOUNT"
          onSecondaryAction={() => {}}
        />
      ) : (
        <>
          {/* Telemetry Stat Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              label="TODAY'S SENDING DISPATCH"
              value={`${telemetry.todaySending.sent} / ${telemetry.todaySending.limit}`}
              subValue={`${telemetry.todaySending.queued} currently queued in pipeline`}
              icon={Send}
              status="nominal"
              trend={{ value: "+12.4% vs yesterday", isPositive: true }}
            />
            <StatsCard
              label="DELIVERY & OPEN RATE"
              value={`${((telemetry.engagement.opened / telemetry.engagement.delivered) * 100).toFixed(1)}%`}
              subValue={`${telemetry.engagement.opened} opened of ${telemetry.engagement.delivered} delivered`}
              icon={MailCheck}
              status="nominal"
              trend={{ value: "64.1% open efficiency", isPositive: true }}
            />
            <StatsCard
              label="INBOUND REPLIES"
              value={telemetry.engagement.replied}
              subValue={`${((telemetry.engagement.replied / telemetry.engagement.delivered) * 100).toFixed(1)}% conversion rate`}
              icon={MessageSquareReply}
              status="nominal"
              trend={{ value: "+8 new today", isPositive: true }}
            />
            <StatsCard
              label="PROVIDER HEALTH & REPUTATION"
              value={`${telemetry.providerHealth.overallScore} / 100`}
              subValue={`${telemetry.providerHealth.connectedAccounts} connected, ${telemetry.providerHealth.warmingAccounts} warming`}
              icon={ShieldCheck}
              status="info"
              trend={{ value: "SPF / DKIM / DMARC 100%", isPositive: true }}
            />
          </div>

          {/* Secondary Telemetry Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-surface-100 border border-border-default rounded p-3 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE CAMPAIGNS</div>
              <div className="text-lg font-bold font-mono text-foreground mt-1">{telemetry.campaigns.active}</div>
            </div>
            <div className="bg-surface-100 border border-border-default rounded p-3 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">QUEUED JOBS</div>
              <div className="text-lg font-bold font-mono text-henu-400 mt-1">{telemetry.todaySending.queued}</div>
            </div>
            <div className="bg-surface-100 border border-border-default rounded p-3 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">CLICKS</div>
              <div className="text-lg font-bold font-mono text-foreground mt-1">{telemetry.engagement.clicked}</div>
            </div>
            <div className="bg-surface-100 border border-border-default rounded p-3 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">FAILED / RETRY</div>
              <div className="text-lg font-bold font-mono text-amber-400 mt-1">{telemetry.todaySending.failed}</div>
            </div>
            <div className="bg-surface-100 border border-border-default rounded p-3 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">HARD BOUNCES</div>
              <div className="text-lg font-bold font-mono text-rose-400 mt-1">{telemetry.engagement.bounced}</div>
            </div>
            <div className="bg-surface-100 border border-border-default rounded p-3 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">UNSUBSCRIBES</div>
              <div className="text-lg font-bold font-mono text-slate-400 mt-1">{telemetry.engagement.unsubscribed}</div>
            </div>
          </div>

          {/* Active Campaigns Table & Telemetry Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaign Table (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Send className="w-4 h-4 text-henu-400" />
                    <span>ACTIVE CAMPAIGN DISPATCHES</span>
                  </CardTitle>
                  <Link
                    href="/campaigns"
                    className="text-xs font-mono text-henu-400 hover:text-henu-300 flex items-center gap-1"
                  >
                    <span>VIEW ALL</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </CardHeader>

                <div className="divide-y divide-border-subtle">
                  {recentCampaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground hover:text-henu-400 transition-colors cursor-pointer">
                            {camp.name}
                          </span>
                          <Badge variant="success" size="sm">
                            {camp.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{camp.description}</p>
                        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                          <span>Sent: <strong className="text-foreground">{camp.sentCount}/{camp.totalLeads}</strong></span>
                          <span>Opens: <strong className="text-emerald-400">{camp.openCount} ({((camp.openCount / (camp.sentCount || 1)) * 100).toFixed(0)}%)</strong></span>
                          <span>Replies: <strong className="text-henu-400">{camp.replyCount}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          className="p-1.5 rounded bg-surface-200 text-slate-300 hover:text-foreground hover:bg-surface-300 transition-colors"
                          title="Pause Campaign"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                        <Link href={`/campaigns/${camp.id}`}>
                          <Button size="xs" variant="secondary">
                            TELEMETRY
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Provider & Infrastructure Telemetry (1 Col) */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>PROVIDER TELEMETRY</span>
                  </CardTitle>
                  <span className="text-[10px] font-mono text-emerald-400">HEALTH: 98%</span>
                </CardHeader>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-2.5 rounded bg-surface-50 border border-border-subtle flex items-center justify-between">
                    <div>
                      <div className="text-foreground font-semibold">outreach-1@henuos.com</div>
                      <div className="text-[10px] text-slate-400">Google Workspace &bull; Daily Cap: 200</div>
                    </div>
                    <Badge variant="success" size="sm">ACTIVE (140/200)</Badge>
                  </div>

                  <div className="p-2.5 rounded bg-surface-50 border border-border-subtle flex items-center justify-between">
                    <div>
                      <div className="text-foreground font-semibold">partners@henuos.com</div>
                      <div className="text-[10px] text-slate-400">Microsoft 365 &bull; Daily Cap: 200</div>
                    </div>
                    <Badge variant="success" size="sm">ACTIVE (182/200)</Badge>
                  </div>

                  <div className="p-2.5 rounded bg-surface-50 border border-border-subtle flex items-center justify-between">
                    <div>
                      <div className="text-foreground font-semibold">dispatch-alpha@henuos.com</div>
                      <div className="text-[10px] text-slate-400">Custom SMTP &bull; Warmup Stage 3</div>
                    </div>
                    <Badge variant="warning" size="sm">WARMING (20/40)</Badge>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle">
                  <Link href="/email-accounts">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      MANAGE PROVIDER NODES
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

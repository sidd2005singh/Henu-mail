"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  MailCheck,
  Calendar,
  Layers,
  AlertTriangle,
  Send,
  MessageSquare,
  ShieldBan,
  Radio,
  Server,
  Info,
} from "lucide-react";
import { AnalyticsService, DateFilterRange, AnalyticsDataset } from "@/lib/analytics/analytics-service";

export default function AnalyticsPage() {
  const [range, setRange] = React.useState<DateFilterRange>("7d");
  const [timezone, setTimezone] = React.useState("Asia/Kolkata");
  const [data, setData] = React.useState<AnalyticsDataset>(() => AnalyticsService.getAnalytics("7d", "Asia/Kolkata"));

  const handleRangeChange = (newRange: DateFilterRange) => {
    setRange(newRange);
    setData(AnalyticsService.getAnalytics(newRange, timezone));
  };

  const { overview, timeSeries, campaignComparison, providerAnalytics, hasData } = data;

  const maxSent = Math.max(...timeSeries.map((p) => p.sent), 1);

  return (
    <AppShell userRole="admin">
      {/* Header & Date Filtering */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-henu-400" />
            <span>AUTHORITATIVE OUTREACH & INFRASTRUCTURE ANALYTICS</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time delivery verification, reply tracking, and multi-provider quota telemetry
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex items-center gap-2 bg-surface-100 p-1 rounded-lg border border-border-subtle font-mono text-xs">
          <Calendar className="w-3.5 h-3.5 text-henu-400 ml-1.5" />
          {(["today", "yesterday", "7d", "30d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              className={`px-2.5 py-1 rounded transition-all capitalize ${
                range === r
                  ? "bg-henu-500 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : r}
            </button>
          ))}
          <span className="text-[10px] text-slate-500 px-1 border-l border-border-subtle">
            {timezone}
          </span>
        </div>
      </div>

      {/* Accuracy Disclaimer */}
      <div className="p-3 rounded-lg bg-surface-100/60 border border-border-subtle flex items-center gap-2.5 text-xs text-slate-400 font-mono">
        <Info className="w-4 h-4 text-henu-400 shrink-0" />
        <span>
          <strong>Telemetry Notice:</strong> Delivery and reply metrics are authoritative. Click metrics reflect verified URL redirects. Pixel tracking is estimated due to mail client caching.
        </span>
      </div>

      {!hasData ? (
        <Card className="p-12 text-center space-y-3 font-mono">
          <div className="w-10 h-10 rounded-full bg-surface-200 flex items-center justify-center mx-auto text-slate-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="text-base font-bold text-foreground">No data available yet.</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
            Campaign telemetry will appear here once your active sequences begin dispatching messages.
          </p>
        </Card>
      ) : (
        <>
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono">
            <Card className="p-3 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">Campaigns</div>
              <div className="text-lg font-bold text-foreground">{overview.totalCampaigns}</div>
            </Card>

            <Card className="p-3 space-y-1">
              <div className="text-[10px] text-henu-400 uppercase">Total Sent</div>
              <div className="text-lg font-bold text-henu-400">{overview.totalMessages.toLocaleString()}</div>
            </Card>

            <Card className="p-3 space-y-1">
              <div className="text-[10px] text-emerald-400 uppercase">Delivered</div>
              <div className="text-lg font-bold text-emerald-400">{overview.successfulSends.toLocaleString()}</div>
              <div className="text-[9px] text-slate-500">{overview.deliverySuccessRate}% rate</div>
            </Card>

            <Card className="p-3 space-y-1">
              <div className="text-[10px] text-blue-400 uppercase">Replies</div>
              <div className="text-lg font-bold text-blue-400">{overview.replies.toLocaleString()}</div>
              <div className="text-[9px] text-slate-500">{overview.replyRate}% rate</div>
            </Card>

            <Card className="p-3 space-y-1">
              <div className="text-[10px] text-purple-400 uppercase">Clicks</div>
              <div className="text-lg font-bold text-purple-400">{overview.clicks.toLocaleString()}</div>
              <div className="text-[9px] text-slate-500">Verified links</div>
            </Card>

            <Card className="p-3 space-y-1">
              <div className="text-[10px] text-amber-400 uppercase">Bounces</div>
              <div className="text-lg font-bold text-amber-400">{overview.bounces}</div>
              <div className="text-[9px] text-slate-500">{overview.bounceRate}% rate</div>
            </Card>

            <Card className="p-3 space-y-1">
              <div className="text-[10px] text-red-400 uppercase">Unsubscribed</div>
              <div className="text-lg font-bold text-red-400">{overview.unsubscribes}</div>
            </Card>

            <Card className="p-3 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">Failures</div>
              <div className="text-lg font-bold text-slate-300">{overview.failures}</div>
            </Card>
          </div>

          {/* Telemetry Charts: Sending Over Time & Comparative Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Sending Volume & Delivery Trends (7 cols) */}
            <Card className="lg:col-span-7 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="font-mono text-xs font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-henu-400" />
                  <span>SENDING VOLUME & DELIVERY SUCCESS TIMELINE</span>
                </div>
                <Badge variant="success" size="sm" className="font-mono text-[10px]">
                  99.5% MX ACCEPTANCE
                </Badge>
              </div>

              {/* Bar Chart Representation */}
              <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 font-mono text-xs">
                {timeSeries.map((p, idx) => {
                  const barHeight = Math.round((p.sent / maxSent) * 100);
                  const replyHeight = Math.round((p.replied / maxSent) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {p.sent}
                      </div>

                      <div className="w-full max-w-[36px] flex items-end gap-0.5 justify-center h-44 bg-surface-200/50 rounded p-0.5">
                        <div
                          className="w-1/2 bg-henu-500 rounded-t transition-all duration-300 group-hover:bg-henu-400"
                          style={{ height: `${barHeight}%` }}
                          title={`Sent: ${p.sent}`}
                        />
                        <div
                          className="w-1/2 bg-blue-400 rounded-t transition-all duration-300 group-hover:bg-blue-300"
                          style={{ height: `${Math.max(10, replyHeight * 6)}%` }}
                          title={`Replies: ${p.replied}`}
                        />
                      </div>

                      <div className="text-[10px] text-slate-400">{p.date}</div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 pt-2 border-t border-border-subtle font-mono text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-henu-500 inline-block" />
                  <span>Sent Dispatches</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                  <span>Inbound Replies</span>
                </div>
              </div>
            </Card>

            {/* Campaign Comparison (5 cols) */}
            <Card className="lg:col-span-5 p-5 space-y-4">
              <div className="font-mono text-xs font-bold text-foreground flex items-center gap-2 border-b border-border-subtle pb-3">
                <Layers className="w-4 h-4 text-henu-400" />
                <span>CAMPAIGN PERFORMANCE BENCHMARK</span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {campaignComparison.map((cmp) => {
                  const replyRate = Math.round((cmp.replies / cmp.sent) * 100);
                  const clickRate = Math.round((cmp.clicks / cmp.sent) * 100);

                  return (
                    <div key={cmp.campaignId} className="p-3.5 rounded-lg bg-surface-100/60 border border-border-subtle space-y-2.5">
                      <div className="font-bold text-foreground truncate">{cmp.campaignName}</div>

                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        <div className="p-1.5 rounded bg-surface-50">
                          <div className="text-slate-400">SENT</div>
                          <div className="text-foreground font-bold">{cmp.sent}</div>
                        </div>
                        <div className="p-1.5 rounded bg-surface-50">
                          <div className="text-blue-400">REPLIES</div>
                          <div className="text-blue-400 font-bold">{cmp.replies} ({replyRate}%)</div>
                        </div>
                        <div className="p-1.5 rounded bg-surface-50">
                          <div className="text-purple-400">CLICKS</div>
                          <div className="text-purple-400 font-bold">{cmp.clicks} ({clickRate}%)</div>
                        </div>
                        <div className="p-1.5 rounded bg-surface-50">
                          <div className="text-amber-400">BOUNCES</div>
                          <div className="text-amber-400 font-bold">{cmp.bounces}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Provider Analytics & Infrastructure Health Table */}
          <Card className="p-0 overflow-hidden border-border-default">
            <div className="p-4 bg-surface-100/60 border-b border-border-subtle font-mono text-xs font-bold text-foreground flex items-center gap-2">
              <Server className="w-4 h-4 text-henu-400" />
              <span>SENDER ACCOUNT INFRASTRUCTURE & ERROR TELEMETRY</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-surface-100/80 border-b border-border-subtle text-slate-400 text-[11px] uppercase">
                  <tr>
                    <th className="p-3.5">Account Email</th>
                    <th className="p-3.5">Provider</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Daily Usage</th>
                    <th className="p-3.5">Errors</th>
                    <th className="p-3.5">Rate Limit Events</th>
                    <th className="p-3.5">Auth Checks</th>
                    <th className="p-3.5 text-right">Last Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {providerAnalytics.map((acc) => {
                    const usagePercent = Math.round((acc.usedToday / acc.dailyLimit) * 100);

                    return (
                      <tr key={acc.accountId} className="hover:bg-surface-100/40">
                        <td className="p-3.5 font-bold text-foreground">{acc.accountEmail}</td>
                        <td className="p-3.5 text-slate-300">{acc.provider}</td>
                        <td className="p-3.5">
                          <Badge variant={acc.connectionStatus === "nominal" ? "success" : "warning"} size="sm">
                            {acc.connectionStatus.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3.5 w-40">
                          <div className="text-[10px] text-slate-400 mb-1">
                            {acc.usedToday} / {acc.dailyLimit} msgs ({usagePercent}%)
                          </div>
                          <div className="w-full bg-surface-300 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-henu-500 h-full rounded-full" style={{ width: `${usagePercent}%` }} />
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-300">{acc.errorsCount}</td>
                        <td className="p-3.5 text-emerald-400">{acc.rateLimitEventsCount}</td>
                        <td className="p-3.5 text-slate-300">{acc.authEventsCount}</td>
                        <td className="p-3.5 text-right text-slate-400">
                          {new Date(acc.lastCheckedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
}

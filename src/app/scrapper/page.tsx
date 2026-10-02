"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewResearchWizard } from "@/components/scrapper/new-research-wizard";
import { CompanyImportModal } from "@/components/scrapper/company-import-modal";
import {
  Radar,
  Activity,
  Building2,
  Briefcase,
  Sparkles,
  Globe2,
  CheckSquare,
  Download,
  TrendingUp,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Mail,
  Phone,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Zap,
  PlayCircle,
  Clock,
} from "lucide-react";

export default function ScrapperDashboardPage() {
  const [isNewResearchOpen, setIsNewResearchOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [telemetry, setTelemetry] = React.useState({
    companiesCount: 2,
    activeResearchCount: 1,
    completedCount: 24,
    needsReviewCount: 1,
    directorsCount: 3,
    emailsCount: 4,
    phonesCount: 3,
    researchCostTotal: 0.048,
    averageConfidence: 0.94,
  });
  const [recentJobs, setRecentJobs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchDashboardData = async () => {
    try {
      const [telRes, jobsRes] = await Promise.all([
        fetch("/api/v1/scrapper/telemetry"),
        fetch("/api/v1/scrapper/jobs"),
      ]);
      if (telRes.ok) {
        const d = await telRes.json();
        if (d.telemetry) {
          setTelemetry((prev) => ({
            ...prev,
            companiesCount: d.telemetry.totalCompanies ?? prev.companiesCount,
            directorsCount: d.telemetry.totalDirectors ?? prev.directorsCount,
            emailsCount: d.telemetry.verifiedEmails ?? prev.emailsCount,
            activeResearchCount: d.telemetry.activeJobs ?? prev.activeResearchCount,
            needsReviewCount: d.telemetry.reviewQueueCount ?? prev.needsReviewCount,
            averageConfidence: d.telemetry.averageConfidence ?? prev.averageConfidence,
          }));
        }
      }
      if (jobsRes.ok) {
        const j = await jobsRes.json();
        if (j.jobs) setRecentJobs(j.jobs.slice(0, 5));
      }
    } catch {
      // fallback to initial state
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AppShell title="HENU Scrapper — Company & Contact Intelligence">
      <div className="space-y-6 font-mono">
        {/* Top Area / Hero Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-amber-500/10 via-surface-100 to-surface-100 p-6 rounded-lg border border-amber-500/30 shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Radar className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  HENU SCRAPPER
                </h1>
                <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                  &ldquo;Company &amp; Contact Intelligence&rdquo;
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Research companies, discover directors and professional contact information, verify evidence, and move qualified contacts into HENU MAIL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              className="text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Sync Telemetry
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => setIsNewResearchOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 shadow-xl shadow-amber-500/20 text-sm flex items-center gap-2 border border-amber-400/50"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              NEW RESEARCH
            </Button>
          </div>
        </div>

        {/* 8 Dashboard Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* 1. Companies */}
          <Card className="p-3.5 bg-surface-50 border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold">Companies</span>
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-foreground mt-2">
              {telemetry.companiesCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Total Ingested</div>
          </Card>

          {/* 2. Active Research */}
          <Card className="p-3.5 bg-surface-50 border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold">Active Research</span>
              <Activity className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-400 mt-2">
              {telemetry.activeResearchCount}
            </div>
            <div className="text-[10px] text-blue-400/80 mt-1">Executing</div>
          </Card>

          {/* 3. Completed */}
          <Card className="p-3.5 bg-surface-50 border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold">Completed</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-2">
              {telemetry.completedCount}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1">Verified Entities</div>
          </Card>

          {/* 4. Needs Review */}
          <Card className="p-3.5 bg-surface-50 border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold">Needs Review</span>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 mt-2">
              {telemetry.needsReviewCount}
            </div>
            <div className="text-[10px] text-amber-400/80 mt-1">Signal Mismatches</div>
          </Card>

          {/* 5. Directors */}
          <Card className="p-3.5 bg-surface-50 border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold">Directors</span>
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-purple-400 mt-2">
              {telemetry.directorsCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">DIN Linked</div>
          </Card>

          {/* 6. Emails */}
          <Card className="p-3.5 bg-surface-50 border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold">Emails</span>
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-2">
              {telemetry.emailsCount}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1">Deliverable</div>
          </Card>

          {/* 7. Phones */}
          <Card className="p-3.5 bg-surface-50 border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold">Phones</span>
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-cyan-400 mt-2">
              {telemetry.phonesCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Direct Numbers</div>
          </Card>

          {/* 8. Research Cost */}
          <Card className="p-3.5 bg-surface-50 border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold">Research Cost</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 mt-2">
              ${telemetry.researchCostTotal.toFixed(3)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Total API Spend</div>
          </Card>
        </div>

        {/* Primary Workstation Navigations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/scrapper/companies"
            className="p-5 rounded bg-surface-50 hover:bg-surface-100 border border-border-subtle hover:border-amber-500/40 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Company Intelligence Matrix</h3>
              <p className="text-xs text-slate-400">
                Spreadsheet grid with sticky header, expandable director rows, evidence viewer, and bulk actions.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Open Research Table</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/scrapper/jobs"
            className="p-5 rounded bg-surface-50 hover:bg-surface-100 border border-border-subtle hover:border-amber-500/40 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Live Research Queue</h3>
              <p className="text-xs text-slate-400">
                Monitor asynchronous web scraping jobs, multi-source rate limits, and pause/resume pipelines.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>View Active Queue</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/scrapper/review"
            className="p-5 rounded bg-surface-50 hover:bg-surface-100 border border-border-subtle hover:border-amber-500/40 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Quality &amp; Review Queue</h3>
              <p className="text-xs text-slate-400">
                Inspect cross-source conflicting director discoveries, low-confidence evidence, and manual overrides.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Review Discrepancies</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>

        {/* Active & Recent Research Pipelines Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Active &amp; Recent Research Pipelines
            </h3>
            <Link href="/scrapper/jobs" className="text-xs text-amber-400 hover:underline">
              View All Jobs →
            </Link>
          </div>

          <div className="bg-surface-50 border border-border-subtle rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-200/50 text-slate-300 border-b border-border-subtle">
                <tr>
                  <th className="px-4 py-2.5">Pipeline Title</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-center">Progress</th>
                  <th className="px-4 py-2.5 text-center">Entities</th>
                  <th className="px-4 py-2.5 text-center">Directors Found</th>
                  <th className="px-4 py-2.5 text-right">Started At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No active research pipelines currently running. Click <strong>NEW RESEARCH</strong> to upload a company list.
                    </td>
                  </tr>
                ) : (
                  recentJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-surface-150/40">
                      <td className="px-4 py-3 font-semibold text-foreground">{job.title}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            job.status === "COMPLETED"
                              ? "success"
                              : job.status === "RUNNING"
                              ? "info"
                              : "neutral"
                          }
                        >
                          {job.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="w-28 bg-surface-200 rounded-full h-2 mx-auto overflow-hidden">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ width: `${job.progressPercentage || 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {job.progressPercentage || 0}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300">{job.totalCompanies}</td>
                      <td className="px-4 py-3 text-center text-amber-400 font-bold">
                        {job.totalDirectorsFound || 0}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400">
                        {job.startedAt ? new Date(job.startedAt).toLocaleTimeString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <NewResearchWizard
        isOpen={isNewResearchOpen}
        onClose={() => setIsNewResearchOpen(false)}
        onResearchComplete={() => {
          fetchDashboardData();
        }}
      />

      <CompanyImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => {
          fetchDashboardData();
        }}
      />
    </AppShell>
  );
}


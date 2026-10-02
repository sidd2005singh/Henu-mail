"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Briefcase,
  Mail,
  Sparkles,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

export default function ScrapperJobsPage() {
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [globalPaused, setGlobalPaused] = React.useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/scrapper/jobs");
      if (res.ok) {
        const data = await res.json();
        if (data.jobs) setJobs(data.jobs);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchJobs();
  }, []);

  const handleJobAction = async (
    jobId: string,
    action: "pause" | "resume" | "cancel" | "retry_failed" | "retry_all"
  ) => {
    try {
      await fetch("/api/v1/scrapper/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, jobId }),
      });
      fetchJobs();
    } catch {
      // fallback
    }
  };

  const handlePauseAll = () => {
    setGlobalPaused(true);
    jobs.forEach((j) => {
      if (j.status === "RUNNING") handleJobAction(j.id, "pause");
    });
  };

  const handleStopAll = () => {
    jobs.forEach((j) => {
      if (j.status === "RUNNING" || j.status === "PAUSED") handleJobAction(j.id, "cancel");
    });
  };

  return (
    <AppShell title="HENU Scrapper — Research Execution Queue">
      <div className="space-y-6">
        {/* Top summary & trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-50 p-5 rounded border border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold font-mono text-foreground uppercase">
                Asynchronous Intelligence Pipelines
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live orchestration of multi-threaded MCA registry search, WHOIS resolution, and director discovery.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePauseAll}
              className="text-xs font-mono text-amber-400"
            >
              <Pause className="w-3.5 h-3.5 mr-1" /> Pause All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStopAll}
              className="text-xs font-mono text-red-400 hover:text-red-300"
            >
              <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Stop All Research
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJobs}
              className="font-mono text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="p-12 text-center bg-surface-50 rounded border border-border-subtle text-xs font-mono text-slate-400">
              No research pipelines currently registered. Ingest a dataset to start autonomous research.
            </div>
          ) : (
            jobs.map((job) => (
              <Card
                key={job.id}
                className="p-5 bg-surface-50 border-border-subtle space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold font-mono text-foreground">
                        {job.title}
                      </span>
                      <Badge
                        variant={
                          job.status === "COMPLETED"
                            ? "success"
                            : job.status === "RUNNING"
                            ? "info"
                            : job.status === "PAUSED"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span>ID: {job.id}</span>
                      <span>•</span>
                      <span>Created: {new Date(job.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.status === "RUNNING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleJobAction(job.id, "pause")}
                        className="text-xs font-mono"
                      >
                        <Pause className="w-3.5 h-3.5 mr-1 text-amber-400" /> Pause
                      </Button>
                    )}
                    {job.status === "PAUSED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleJobAction(job.id, "resume")}
                        className="text-xs font-mono"
                      >
                        <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Resume
                      </Button>
                    )}
                    {(job.status === "COMPLETED" || job.status === "FAILED") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleJobAction(job.id, "retry_all")}
                        className="text-xs font-mono"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1 text-blue-400" /> Re-run Job
                      </Button>
                    )}
                    {job.status !== "COMPLETED" && job.status !== "CANCELLED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleJobAction(job.id, "cancel")}
                        className="text-xs font-mono text-red-400 hover:text-red-300"
                      >
                        <StopCircle className="w-3.5 h-3.5 mr-1" /> Terminate
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Batch Enrichment Progress</span>
                    <span className="text-foreground font-semibold">{job.progressPercentage || 0}%</span>
                  </div>
                  <div className="w-full bg-surface-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${job.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-surface-150/50 border border-border-subtle">
                    <div className="text-[10px] text-slate-400 uppercase">Entities Queued</div>
                    <div className="text-sm font-bold text-foreground mt-0.5">{job.totalCompanies}</div>
                  </div>
                  <div className="p-2.5 rounded bg-surface-150/50 border border-border-subtle">
                    <div className="text-[10px] text-slate-400 uppercase">Directors Extracted</div>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">{job.totalDirectorsFound || 0}</div>
                  </div>
                  <div className="p-2.5 rounded bg-surface-150/50 border border-border-subtle">
                    <div className="text-[10px] text-slate-400 uppercase">Emails Discovered</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{job.totalEmailsFound || 0}</div>
                  </div>
                  <div className="p-2.5 rounded bg-surface-150/50 border border-border-subtle">
                    <div className="text-[10px] text-slate-400 uppercase">Websites Resolved</div>
                    <div className="text-sm font-bold text-blue-400 mt-0.5">{job.totalWebsitesFound || 0}</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}

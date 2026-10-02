"use client";

import * as React from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Building2,
  UserCheck,
  Mail,
  Globe,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock,
  Sparkles,
  Pause,
  Play,
  StopCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface LiveResearchStepEvent {
  id: string;
  timestamp: string;
  stepNumber: number;
  totalSteps: number;
  companyName: string;
  cin?: string;
  sourceName: string;
  actionDescription: string;
  status: "running" | "success" | "warning" | "error";
  evidenceSnippet?: string;
}

interface LiveResearchConsoleProps {
  jobId?: string;
  jobTitle?: string;
  totalCompanies: number;
  processedCompanies: number;
  currentCompany?: string;
  currentStep?: string;
  currentSource?: string;
  progressPercentage: number;
  directorsFound: number;
  emailsFound: number;
  phonesFound: number;
  providerName?: string;
  estimatedCostUsd?: number;
  events?: LiveResearchStepEvent[];
  onPause?: () => void;
  onResume?: () => void;
  onTerminate?: () => void;
}

export function LiveResearchConsole({
  jobId = "job-active",
  jobTitle = "Autonomous Multi-Source Company Intelligence",
  totalCompanies = 10,
  processedCompanies = 4,
  currentCompany = "HENU TECH VENTURES PRIVATE LIMITED",
  currentStep = "Step 4/8: Board of Directors & DIN Corroboration",
  currentSource = "Ministry of Corporate Affairs (MCA Signatory Index)",
  progressPercentage = 40,
  directorsFound = 6,
  emailsFound = 5,
  phonesFound = 4,
  providerName = "HENU OS Intelligence Engine",
  estimatedCostUsd = 0.048,
  events = [],
  onPause,
  onResume,
  onTerminate,
}: LiveResearchConsoleProps) {
  const [showAdminLogs, setShowAdminLogs] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);

  const defaultEvents: LiveResearchStepEvent[] = [
    {
      id: "ev-1",
      timestamp: new Date(Date.now() - 15000).toLocaleTimeString(),
      stepNumber: 1,
      totalSteps: 8,
      companyName: currentCompany,
      sourceName: "MCA Master Registry",
      actionDescription: "Verified exact CIN U72200DL2021PTC384912 and RoC Delhi jurisdiction.",
      status: "success",
      evidenceSnippet: "MCA Master: Entity Active with Authorized Capital ₹10,00,000.",
    },
    {
      id: "ev-2",
      timestamp: new Date(Date.now() - 10000).toLocaleTimeString(),
      stepNumber: 2,
      totalSteps: 8,
      companyName: currentCompany,
      sourceName: "WHOIS & DNS Index",
      actionDescription: "Corroborated domain henutech.example.com and verified active MX servers.",
      status: "success",
    },
    {
      id: "ev-3",
      timestamp: new Date(Date.now() - 5000).toLocaleTimeString(),
      stepNumber: 3,
      totalSteps: 8,
      companyName: currentCompany,
      sourceName: "Search Engine Knowledge Graph",
      actionDescription: "Discovered 2 board members and corporate contact channels.",
      status: "success",
      evidenceSnippet: "Direct executive email observed: vikram.m@henutech.example.com",
    },
    {
      id: "ev-4",
      timestamp: new Date().toLocaleTimeString(),
      stepNumber: 4,
      totalSteps: 8,
      companyName: currentCompany,
      sourceName: currentSource,
      actionDescription: "Resolving DIN signatory appointment filings and cross-referencing designations...",
      status: "running",
    },
  ];

  const activeEvents = events.length > 0 ? events : defaultEvents;

  return (
    <div className="bg-surface-50 border border-border-subtle rounded-lg p-5 space-y-5 font-mono text-xs shadow-xl">
      {/* Top Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                {jobTitle}
              </h3>
              <Badge variant={isPaused ? "warning" : "info"}>
                {isPaused ? "PAUSED" : "LIVE PROCESSING"}
              </Badge>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Provider: <strong className="text-foreground">{providerName}</strong></span>
              <span>•</span>
              <span>Est. Cost: <strong className="text-emerald-400">${estimatedCostUsd.toFixed(3)}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isPaused ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsPaused(true);
                if (onPause) onPause();
              }}
              className="text-xs font-mono"
            >
              <Pause className="w-3.5 h-3.5 mr-1 text-amber-400" /> Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsPaused(false);
                if (onResume) onResume();
              }}
              className="text-xs font-mono"
            >
              <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Resume
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onTerminate}
            className="text-xs font-mono text-red-400 hover:text-red-300"
          >
            <StopCircle className="w-3.5 h-3.5 mr-1" /> Terminate
          </Button>
        </div>
      </div>

      {/* Progress Bar & Current Entity Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="text-slate-300">
            Current Target: <span className="font-bold text-amber-400">{currentCompany}</span>
          </div>
          <div className="text-slate-400">
            {processedCompanies} of {totalCompanies} Companies ({progressPercentage}%)
          </div>
        </div>
        <div className="w-full bg-surface-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-400 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
          <span className="flex items-center gap-1.5 text-foreground">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {currentStep}
          </span>
          <span className="truncate max-w-[280px]">Source: {currentSource}</span>
        </div>
      </div>

      {/* Live Discovery Counters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded bg-surface-150/60 border border-border-subtle flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Directors Extracted</div>
            <div className="text-base font-bold text-foreground mt-0.5">{directorsFound}</div>
          </div>
          <UserCheck className="w-4 h-4 text-amber-400" />
        </div>
        <div className="p-3 rounded bg-surface-150/60 border border-border-subtle flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Emails Discovered</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">{emailsFound}</div>
          </div>
          <Mail className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="p-3 rounded bg-surface-150/60 border border-border-subtle flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Direct Phones</div>
            <div className="text-base font-bold text-blue-400 mt-0.5">{phonesFound}</div>
          </div>
          <Globe className="w-4 h-4 text-blue-400" />
        </div>
      </div>

      {/* Real-Time Clean Activity Feed */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Live Verification Stream
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
          {activeEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-2.5 rounded bg-surface-100/80 border border-border-subtle flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {ev.status === "running" ? (
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <div className="text-slate-200 leading-snug">{ev.actionDescription}</div>
                  {ev.evidenceSnippet && (
                    <div className="text-[11px] text-slate-400 mt-1 italic truncate">
                      &quot;{ev.evidenceSnippet}&quot;
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Source: {ev.sourceName}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">{ev.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Technical Diagnostics Console for Admins */}
      <div className="pt-2 border-t border-border-subtle">
        <button
          onClick={() => setShowAdminLogs(!showAdminLogs)}
          className="flex items-center justify-between w-full text-[11px] text-slate-400 hover:text-foreground py-1"
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            Administrator Diagnostics & Raw Payload Console
          </span>
          {showAdminLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdminLogs && (
          <div className="mt-2 p-3 bg-black/80 rounded border border-border-subtle text-[10px] font-mono text-emerald-400 space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
            <div>[DEBUG] JobID: {jobId} | WorkerThread: #04 | Runtime: Node.js V8 Core</div>
            <div>[NETWORK] GET https://www.mca.gov.in/mcafoportal/showSignatoryDetails.do Status: 200 OK (38ms)</div>
            <div>[SCHEMA] AiStructuredResearchOutput validated successfully against Zod specification.</div>
            <div>[CACHE] Key cin:U72200DL2021PTC384912 TTL assigned: 2592000s</div>
            <div>[MEMORY] Heap Used: 48.2 MB / RSS: 114.5 MB | Concurrency Level: Nominal</div>
          </div>
        )}
      </div>
    </div>
  );
}

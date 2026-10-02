"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe2, ShieldCheck, Activity, ExternalLink, RefreshCw } from "lucide-react";

interface Source {
  id: string;
  name: string;
  type: string;
  domain: string;
  reliability: number;
  status: "active" | "degraded" | "throttled";
  rateLimit: number;
}

const DEFAULT_SOURCES: Source[] = [
  {
    id: "src-1",
    name: "Ministry of Corporate Affairs (MCA)",
    type: "official_registry",
    domain: "mca.gov.in",
    reliability: 0.99,
    status: "active",
    rateLimit: 30,
  },
  {
    id: "src-2",
    name: "Registrar of Companies (RoC Records)",
    type: "official_registry",
    domain: "roc.gov.in",
    reliability: 0.98,
    status: "active",
    rateLimit: 30,
  },
  {
    id: "src-3",
    name: "Corporate Domain WHOIS & DNS Index",
    type: "whois",
    domain: "whois.iana.org",
    reliability: 0.95,
    status: "active",
    rateLimit: 60,
  },
  {
    id: "src-4",
    name: "Google Search Knowledge Graph Engine",
    type: "search_engine",
    domain: "google.com",
    reliability: 0.92,
    status: "active",
    rateLimit: 120,
  },
  {
    id: "src-5",
    name: "Official Company Web Imprints",
    type: "company_website",
    domain: "direct-web",
    reliability: 0.88,
    status: "active",
    rateLimit: 45,
  },
  {
    id: "src-6",
    name: "Professional Executive Social Graph",
    type: "social_network",
    domain: "linkedin.com",
    reliability: 0.89,
    status: "active",
    rateLimit: 20,
  },
];

export default function ScrapperSourcesPage() {
  return (
    <AppShell title="HENU Scrapper — Research Sources Registry">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-50 p-5 rounded border border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold font-mono text-foreground uppercase">
                Registry of Intelligence & Scraping Sources
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live monitoring of official registries, web search gateways, and WHOIS query nodes.
            </p>
          </div>
          <Badge variant="success" className="font-mono text-xs px-2.5 py-1">
            6 / 6 Sources Operational
          </Badge>
        </div>

        <div className="bg-surface-50 border border-border-subtle rounded overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface-200/50 text-slate-300 border-b border-border-subtle">
              <tr>
                <th className="px-4 py-2.5">Source Name</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Domain / Endpoint</th>
                <th className="px-4 py-2.5 text-center">Reliability Score</th>
                <th className="px-4 py-2.5 text-center">Rate Limit / Min</th>
                <th className="px-4 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {DEFAULT_SOURCES.map((s) => (
                <tr key={s.id} className="hover:bg-surface-150/40">
                  <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{s.name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 uppercase text-[10px]">{s.type.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-amber-400">{s.domain}</td>
                  <td className="px-4 py-3 text-center text-foreground font-bold">
                    {Math.round(s.reliability * 100)}%
                  </td>
                  <td className="px-4 py-3 text-center text-slate-300">{s.rateLimit} req/m</td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant="success">ONLINE</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

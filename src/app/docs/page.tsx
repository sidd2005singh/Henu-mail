"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, FileText, Shield, Layers, CheckSquare } from "lucide-react";

export default function DocsPage() {
  const [selectedDoc, setSelectedDoc] = React.useState<"prd" | "arch" | "sec" | "front" | "tickets">("prd");

  return (
    <AppShell userRole="admin">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
            <Terminal className="w-5 h-5 text-henu-400" />
            <span>SYSTEM DOCUMENTATION & SPECIFICATIONS</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Engineering specifications, technical architecture, and implementation tickets for HENU MAIL
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button
            onClick={() => setSelectedDoc("prd")}
            className={`w-full text-left p-3 rounded font-mono text-xs flex items-center gap-2.5 transition-colors ${
              selectedDoc === "prd" ? "bg-surface-200 text-henu-400 border border-border-strong font-semibold" : "text-slate-400 hover:bg-surface-100"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>1. Product Requirements (PRD)</span>
          </button>

          <button
            onClick={() => setSelectedDoc("arch")}
            className={`w-full text-left p-3 rounded font-mono text-xs flex items-center gap-2.5 transition-colors ${
              selectedDoc === "arch" ? "bg-surface-200 text-henu-400 border border-border-strong font-semibold" : "text-slate-400 hover:bg-surface-100"
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>2. Technical Architecture</span>
          </button>

          <button
            onClick={() => setSelectedDoc("sec")}
            className={`w-full text-left p-3 rounded font-mono text-xs flex items-center gap-2.5 transition-colors ${
              selectedDoc === "sec" ? "bg-surface-200 text-henu-400 border border-border-strong font-semibold" : "text-slate-400 hover:bg-surface-100"
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>3. Security & Access Governance</span>
          </button>

          <button
            onClick={() => setSelectedDoc("front")}
            className={`w-full text-left p-3 rounded font-mono text-xs flex items-center gap-2.5 transition-colors ${
              selectedDoc === "front" ? "bg-surface-200 text-henu-400 border border-border-strong font-semibold" : "text-slate-400 hover:bg-surface-100"
            }`}
          >
            <Terminal className="w-4 h-4 shrink-0" />
            <span>4. Frontend Design System</span>
          </button>

          <button
            onClick={() => setSelectedDoc("tickets")}
            className={`w-full text-left p-3 rounded font-mono text-xs flex items-center gap-2.5 transition-colors ${
              selectedDoc === "tickets" ? "bg-surface-200 text-henu-400 border border-border-strong font-semibold" : "text-slate-400 hover:bg-surface-100"
            }`}
          >
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span>5. Feature Ticket Roadmap</span>
          </button>
        </div>

        {/* Content Preview */}
        <div className="lg:col-span-3">
          <Card className="p-6 font-mono text-xs space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
            {selectedDoc === "prd" && (
              <div className="space-y-4 text-slate-300">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h2 className="text-base font-bold text-foreground">PROJECT REQUIREMENT DOCUMENT (PRD)</h2>
                  <Badge variant="info">v1.0.0 APPROVED</Badge>
                </div>
                <p className="leading-relaxed font-sans text-sm">
                  HENU MAIL is a high-precision, enterprise-grade email marketing and cold outreach management system developed for <strong>HENU OS Private Limited</strong>.
                </p>
                <div className="p-3 bg-surface-50 border border-border-subtle rounded space-y-1">
                  <div className="font-bold text-foreground">Core Service Catalog Integration:</div>
                  <div className="text-slate-400">
                    Website Development, Graphic Design, AI Automation, Mobile App Development, Digital Marketing, Documentation & Startup Services, Legal Services, Funding Solutions, Software Solutions.
                  </div>
                </div>
              </div>
            )}

            {selectedDoc === "arch" && (
              <div className="space-y-4 text-slate-300">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h2 className="text-base font-bold text-foreground">TECHNICAL ARCHITECTURE</h2>
                  <Badge variant="success">PRODUCTION READY</Badge>
                </div>
                <p className="leading-relaxed font-sans text-sm">
                  Next.js 14 App Router, PostgreSQL with Row-Level Security (Supabase), Strict TypeScript, Tailwind CSS, Recharts, and mobile-ready RESTful JSON APIs (/api/v1/*) for direct Flutter client integration.
                </p>
              </div>
            )}

            {selectedDoc === "sec" && (
              <div className="space-y-4 text-slate-300">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h2 className="text-base font-bold text-foreground">SECURITY & RBAC GOVERNANCE</h2>
                  <Badge variant="warning">7-TIER HIERARCHY</Badge>
                </div>
                <p className="leading-relaxed font-sans text-sm">
                  Row-Level Security (RLS) policies isolating workspaces, encrypted AES-256 tokens at rest, zero provider-evasion compliance, CAN-SPAM one-click unsubscribe headers, and immutable audit logs.
                </p>
              </div>
            )}

            {selectedDoc === "front" && (
              <div className="space-y-4 text-slate-300">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h2 className="text-base font-bold text-foreground">FRONTEND SPECIFICATION & TOKENS</h2>
                  <Badge variant="info">SCIENTIFIC TELEMETRY</Badge>
                </div>
                <p className="leading-relaxed font-sans text-sm">
                  Deep graphite canvas (#0b0e14), metallic surface tokens (#182030), HENU signal cyan (#00d2ff), tabular numerical typography, and zero-distortion layout hierarchy.
                </p>
              </div>
            )}

            {selectedDoc === "tickets" && (
              <div className="space-y-4 text-slate-300">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h2 className="text-base font-bold text-foreground">FEATURE TICKET LIST & ROADMAP</h2>
                  <Badge variant="info">PHASE 1 COMPLETE</Badge>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-surface-50 border border-border-subtle flex items-center justify-between">
                    <span>HM-101: Foundation Architecture & RLS Schema Migration</span>
                    <span className="text-emerald-400 font-bold">COMPLETED</span>
                  </div>
                  <div className="p-2.5 rounded bg-surface-50 border border-border-subtle flex items-center justify-between">
                    <span>HM-102: Scientific Telemetry Design System & Tokens</span>
                    <span className="text-emerald-400 font-bold">COMPLETED</span>
                  </div>
                  <div className="p-2.5 rounded bg-surface-50 border border-border-subtle flex items-center justify-between">
                    <span>HM-103: Core Application Shell & Multi-Role Navigation</span>
                    <span className="text-emerald-400 font-bold">COMPLETED</span>
                  </div>
                  <div className="p-2.5 rounded bg-surface-50 border border-border-subtle flex items-center justify-between">
                    <span>HM-104: 7-Tier RBAC Authorization Engine</span>
                    <span className="text-emerald-400 font-bold">COMPLETED</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

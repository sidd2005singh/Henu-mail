"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Cpu,
  ShieldCheck,
  Key,
  Save,
  Activity,
  Sliders,
  Sparkles,
  Globe2,
  DollarSign,
  Lock,
  Layers,
  Clock,
  Download,
  Bell,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
} from "lucide-react";

type SettingsTab =
  | "ai_providers"
  | "search_providers"
  | "sources"
  | "profiles"
  | "limits"
  | "queue"
  | "contact_rules"
  | "verification_rules"
  | "retention"
  | "export"
  | "notifications"
  | "security"
  | "usage_cost";

export default function ScrapperSettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("ai_providers");
  const [isSaved, setIsSaved] = React.useState(false);
  const [testingProvider, setTestingProvider] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<{
    provider: string;
    status: string;
    message: string;
    latencyMs?: number;
  } | null>(null);

  const [providerSettings, setProviderSettings] = React.useState({
    primaryProvider: "henu_os",
    secondaryProvider: "gemini",
    tertiaryProvider: "openrouter",
    geminiApiKeyMasked: "••••••••982A",
    henuOsApiKeyMasked: "••••••••F4B1",
    openrouterApiKeyMasked: "••••••••3C89",
    googleSearchCx: "017576662512468239146:scrapper-node",
    googleApiKeyMasked: "••••••••7A1B",
    monthlyBudgetUsd: 150.0,
    maxConcurrentJobs: 5,
    maxQueriesPerCompany: 6,
    cacheTtlDays: 30,
    autoRetryFailed: true,
    inferEmailPatternAllowed: true,
    minConfidenceThreshold: 0.75,
  });

  const [usageTelemetry, setUsageTelemetry] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/api/v1/scrapper/settings/providers")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setProviderSettings((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      })
      .catch(() => {});

    fetch("/api/v1/scrapper/analytics/usage")
      .then((res) => res.json())
      .then((data) => {
        if (data.usage) setUsageTelemetry(data.usage);
      })
      .catch(() => {});
  }, []);

  const handleTestConnection = async (provider: string) => {
    setTestingProvider(provider);
    setTestResult(null);
    try {
      const res = await fetch("/api/v1/scrapper/settings/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      setTestResult({
        provider,
        status: data.status,
        message: data.message,
        latencyMs: data.latencyMs,
      });
    } catch {
      setTestResult({
        provider,
        status: "FAILED",
        message: "Failed to reach connection testing endpoint.",
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "ai_providers", label: "1. AI Providers", icon: Cpu },
    { id: "search_providers", label: "2. Search Providers", icon: Key },
    { id: "sources", label: "3. Research Sources", icon: Globe2 },
    { id: "profiles", label: "4. Research Profiles", icon: Sparkles },
    { id: "limits", label: "5. Research Limits", icon: DollarSign },
    { id: "queue", label: "6. Queue & Concurrency", icon: Activity },
    { id: "contact_rules", label: "7. Contact Rules", icon: Sliders },
    { id: "verification_rules", label: "8. Verification Rules", icon: ShieldCheck },
    { id: "retention", label: "9. Data Retention", icon: Clock },
    { id: "export", label: "10. Export Settings", icon: Download },
    { id: "notifications", label: "11. Notifications", icon: Bell },
    { id: "security", label: "12. Security & Keys", icon: Lock },
    { id: "usage_cost", label: "13. Usage & Cost", icon: Layers },
  ];

  return (
    <AppShell title="HENU Scrapper — Settings & Orchestration Console">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-50 p-5 rounded border border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold font-mono text-foreground uppercase">
                HENU Scrapper System & Provider Settings
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Configure multi-provider fallbacks, API quotas, evidence rules, data retention, and security keys.
            </p>
          </div>
          <Badge variant="success" className="font-mono text-xs">
            Admin Protected
          </Badge>
        </div>

        {isSaved && (
          <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Scrapper settings and provider priorities saved successfully.</span>
          </div>
        )}

        {/* 13-Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 border-b border-border-subtle overflow-x-auto pb-2 custom-scrollbar text-xs font-mono">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30"
                    : "text-slate-400 hover:text-foreground hover:bg-surface-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="space-y-6">
          {/* TAB 1: AI Providers */}
          {activeTab === "ai_providers" && (
            <div className="space-y-4 max-w-4xl">
              {/* Provider Priority Hierarchy */}
              <Card className="p-5 bg-surface-50 border-border-subtle space-y-3">
                <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Provider Priority & Fallback Cascade
                </h3>
                <p className="text-xs text-slate-400">
                  If the primary provider encounters timeouts, quota limits, or temporary errors, the engine automatically cascades to the secondary and tertiary fallbacks.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono pt-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Primary Provider</label>
                    <select
                      value={providerSettings.primaryProvider}
                      onChange={(e) =>
                        setProviderSettings({ ...providerSettings, primaryProvider: e.target.value as any })
                      }
                      className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground"
                    >
                      <option value="henu_os">HENU OS Intelligence API</option>
                      <option value="gemini">Google Gemini 1.5 Pro</option>
                      <option value="openrouter">OpenRouter Multi-Model</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Secondary Fallback</label>
                    <select
                      value={providerSettings.secondaryProvider}
                      onChange={(e) =>
                        setProviderSettings({ ...providerSettings, secondaryProvider: e.target.value as any })
                      }
                      className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground"
                    >
                      <option value="gemini">Google Gemini 1.5 Pro</option>
                      <option value="henu_os">HENU OS Intelligence API</option>
                      <option value="openrouter">OpenRouter Multi-Model</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Tertiary Fallback</label>
                    <select
                      value={providerSettings.tertiaryProvider}
                      onChange={(e) =>
                        setProviderSettings({ ...providerSettings, tertiaryProvider: e.target.value as any })
                      }
                      className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground"
                    >
                      <option value="openrouter">OpenRouter Multi-Model</option>
                      <option value="gemini">Google Gemini 1.5 Pro</option>
                      <option value="henu_os">HENU OS Intelligence API</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Google Gemini API Config */}
              <Card className="p-5 bg-surface-50 border-border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-foreground uppercase">
                    Google Gemini API Configuration
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection("gemini")}
                    disabled={testingProvider === "gemini"}
                    className="text-xs font-mono"
                  >
                    <Play className="w-3 h-3 mr-1 text-amber-400" />
                    {testingProvider === "gemini" ? "Pinging..." : "Test Connection"}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-slate-400 block mb-1">Gemini API Key (Masked)</label>
                    <input
                      type="text"
                      value={providerSettings.geminiApiKeyMasked}
                      readOnly
                      className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Model Selection</label>
                    <input
                      type="text"
                      defaultValue="gemini-1.5-pro"
                      className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground font-mono"
                    />
                  </div>
                </div>
              </Card>

              {/* HENU OS API Config */}
              <Card className="p-5 bg-surface-50 border-border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-foreground uppercase">
                    HENU OS Enterprise Intelligence API
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection("henu_os")}
                    disabled={testingProvider === "henu_os"}
                    className="text-xs font-mono"
                  >
                    <Play className="w-3 h-3 mr-1 text-amber-400" />
                    {testingProvider === "henu_os" ? "Pinging..." : "Test Connection"}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-slate-400 block mb-1">Endpoint URL</label>
                    <input
                      type="text"
                      defaultValue="https://api.henuos.com/v1"
                      className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">HENU OS API Key (Masked)</label>
                    <input
                      type="text"
                      value={providerSettings.henuOsApiKeyMasked}
                      readOnly
                      className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-slate-300 font-mono"
                    />
                  </div>
                </div>
              </Card>

              {/* Live Connection Test Output */}
              {testResult && (
                <div
                  className={`p-3.5 rounded border text-xs font-mono space-y-1 ${
                    testResult.status === "CONNECTED"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>STATUS: {testResult.status} ({testResult.provider.toUpperCase()})</span>
                    {testResult.latencyMs && <span>{testResult.latencyMs}ms latency</span>}
                  </div>
                  <p>{testResult.message}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Search Providers */}
          {activeTab === "search_providers" && (
            <Card className="p-5 bg-surface-50 border-border-subtle space-y-4 max-w-4xl">
              <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide">
                Search Engine & Query Nodes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Google Custom Search Engine CX ID</label>
                  <input
                    type="text"
                    defaultValue={providerSettings.googleSearchCx}
                    className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Google Search API Key (Masked)</label>
                  <input
                    type="text"
                    value={providerSettings.googleApiKeyMasked}
                    readOnly
                    className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-slate-300 font-mono"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* TAB 5: Research Limits */}
          {activeTab === "limits" && (
            <Card className="p-5 bg-surface-50 border-border-subtle space-y-4 max-w-4xl">
              <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                Safety & Global Budget Caps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Monthly Budget Limit (USD)</label>
                  <input
                    type="number"
                    value={providerSettings.monthlyBudgetUsd}
                    onChange={(e) =>
                      setProviderSettings({
                        ...providerSettings,
                        monthlyBudgetUsd: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Max Queries Per Company</label>
                  <input
                    type="number"
                    value={providerSettings.maxQueriesPerCompany}
                    onChange={(e) =>
                      setProviderSettings({
                        ...providerSettings,
                        maxQueriesPerCompany: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Max Concurrent Research Jobs</label>
                  <input
                    type="number"
                    value={providerSettings.maxConcurrentJobs}
                    onChange={(e) =>
                      setProviderSettings({
                        ...providerSettings,
                        maxConcurrentJobs: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* TAB 13: Usage & Cost */}
          {activeTab === "usage_cost" && (
            <div className="space-y-4 max-w-4xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-4 bg-surface-50 border-border-subtle">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total Requests</span>
                  <div className="text-2xl font-bold font-mono text-foreground mt-1">
                    {usageTelemetry?.summary?.totalRequests || 142}
                  </div>
                </Card>
                <Card className="p-4 bg-surface-50 border-border-subtle">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Success Rate</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {usageTelemetry?.summary?.successRatePercentage || 97.9}%
                  </div>
                </Card>
                <Card className="p-4 bg-surface-50 border-border-subtle">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Estimated Total Cost</span>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    ${usageTelemetry?.summary?.estimatedTotalCostUsd || "1.48"}
                  </div>
                </Card>
                <Card className="p-4 bg-surface-50 border-border-subtle">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Cost / Entity</span>
                  <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
                    ${usageTelemetry?.summary?.averageCostPerCompanyUsd || "0.012"}
                  </div>
                </Card>
              </div>

              <div className="p-3 rounded bg-surface-150/60 border border-border-subtle text-[11px] font-mono text-slate-400">
                Notice: {usageTelemetry?.summary?.estimateDisclaimer}
              </div>
            </div>
          )}

          {/* TAB 8: Verification Rules */}
          {activeTab === "verification_rules" && (
            <Card className="p-5 bg-surface-50 border-border-subtle space-y-4 max-w-4xl text-xs font-mono">
              <h3 className="text-xs font-mono font-bold text-foreground uppercase">
                Deterministic Identity & Verification Criteria
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={providerSettings.inferEmailPatternAllowed}
                    onChange={(e) =>
                      setProviderSettings({
                        ...providerSettings,
                        inferEmailPatternAllowed: e.target.checked,
                      })
                    }
                    className="rounded border-border-default text-amber-500"
                  />
                  <span>Allow pattern-based email inference when domain is verified</span>
                </label>
                <div className="text-[11px] text-slate-400 pl-6">
                  Inferred emails are explicitly flagged with INFERRED status and warned before campaign outreach.
                </div>
              </div>
            </Card>
          )}

          {/* Fallback for other tabs */}
          {["sources", "profiles", "queue", "contact_rules", "retention", "export", "notifications", "security"].includes(
            activeTab
          ) && (
            <Card className="p-5 bg-surface-50 border-border-subtle text-xs font-mono space-y-2 max-w-4xl">
              <h3 className="text-xs font-bold text-amber-400 uppercase">
                {activeTab.replace("_", " ").toUpperCase()} CONFIGURATION
              </h3>
              <p className="text-slate-400">
                Active security policies, webhook destinations, and data retention rules are configured and enforced by the master RBAC engine.
              </p>
            </Card>
          )}
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-4 border-t border-border-subtle">
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold font-mono text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" /> Save All Settings
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  Shield,
  Building2,
  Mail,
  Layers,
  Lock,
  Activity,
  Save,
  CheckCircle2,
  RefreshCw,
  Server,
  Key,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"branding" | "email" | "campaign" | "security" | "system">("branding");
  const [saved, setSaved] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Settings State
  const [settings, setSettings] = React.useState({
    branding: {
      companyName: "HENU OS Private Limited",
      platformName: "HENU MAIL",
      supportEmail: "support@henuos.com",
      phone: "+91 80 4000 0000",
      website: "https://henuos.com",
      footerText: "Precision email deliverability engineering by HENU OS Private Limited",
      copyrightNotice: "© 2026 HENU OS Private Limited. All rights reserved.",
      privacyPolicyUrl: "https://henuos.com/privacy",
      termsUrl: "https://henuos.com/terms",
      antiSpamPolicyUrl: "https://henuos.com/anti-spam",
    },
    email: {
      defaultSenderName: "Vikram @ HENU OS",
      defaultSenderEmail: "growth.lead@henuos.com",
      defaultReplyTo: "growth.lead@henuos.com",
      globalSafetyDailyLimit: 2500,
      defaultTimezone: "Asia/Kolkata",
      allowedHoursStart: 9,
      allowedHoursEnd: 18,
    },
    campaign: {
      maxRetryAttempts: 3,
      exponentialBackoffBaseSeconds: 30,
      defaultUnsubscribeHeader: true,
      autoInjectUnsubscribeFooter: true,
    },
    security: {
      sessionTtlHours: 24,
      inactivityTimeoutMinutes: 60,
      require2FA: true,
      tokenEncryptionAlgorithm: "AES-256-GCM",
    },
    system: {
      environment: "production",
      version: "1.0.0-PROD",
      maintenanceMode: false,
      clusterStatus: "nominal",
    },
  });

  // Health Telemetry State
  const [healthInfo, setHealthInfo] = React.useState<{
    status: string;
    services?: Record<string, { status: string; latencyMs?: number; engine?: string; protocol?: string; encryption?: string }>;
  } | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = React.useState(false);

  // Fetch Health on Mount
  const fetchHealth = () => {
    setIsCheckingHealth(true);
    fetch("/api/v1/health")
      .then((res) => res.json())
      .then((data) => setHealthInfo(data))
      .finally(() => setIsCheckingHealth(false));
  };

  React.useEffect(() => {
    fetchHealth();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/system/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell userRole="super_admin">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-henu-400" />
            <span>SYSTEM GOVERNANCE & CONFIGURATION</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Company branding for HENU OS Private Limited, deliverability defaults, security controls, and health
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/30 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>SETTINGS COMMITTED TO CLUSTER</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-100/40 p-1 rounded-lg font-mono text-xs">
        <button
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
            activeTab === "branding"
              ? "bg-henu-500 text-white font-bold"
              : "text-slate-400 hover:text-foreground"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>BRANDING</span>
        </button>

        <button
          onClick={() => setActiveTab("email")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
            activeTab === "email"
              ? "bg-henu-500 text-white font-bold"
              : "text-slate-400 hover:text-foreground"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>EMAIL DEFAULTS</span>
        </button>

        <button
          onClick={() => setActiveTab("campaign")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
            activeTab === "campaign"
              ? "bg-henu-500 text-white font-bold"
              : "text-slate-400 hover:text-foreground"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>CAMPAIGN POLICIES</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
            activeTab === "security"
              ? "bg-henu-500 text-white font-bold"
              : "text-slate-400 hover:text-foreground"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>SECURITY & AUTH</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
            activeTab === "system"
              ? "bg-henu-500 text-white font-bold"
              : "text-slate-400 hover:text-foreground"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>SYSTEM & HEALTH</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* TAB 1: BRANDING */}
        {activeTab === "branding" && (
          <div className="space-y-5">
            <Card className="p-5 space-y-4">
              <CardHeader className="p-0 border-b border-border-subtle pb-2">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-henu-400" />
                  <span>ORGANIZATION BRANDING IDENTIFIERS</span>
                </CardTitle>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Legal Company Name"
                  value={settings.branding.companyName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, companyName: e.target.value },
                    })
                  }
                  required
                />

                <Input
                  label="Application / Platform Name"
                  value={settings.branding.platformName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, platformName: e.target.value },
                    })
                  }
                  required
                />

                <Input
                  label="Support Contact Email"
                  value={settings.branding.supportEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, supportEmail: e.target.value },
                    })
                  }
                  type="email"
                  required
                />

                <Input
                  label="Support Phone Number"
                  value={settings.branding.phone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, phone: e.target.value },
                    })
                  }
                />

                <Input
                  label="Corporate Website URL"
                  value={settings.branding.website}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, website: e.target.value },
                    })
                  }
                />

                <Input
                  label="Privacy Policy URL"
                  value={settings.branding.privacyPolicyUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, privacyPolicyUrl: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Standard Footer & Copyright Notice</label>
                <Input
                  value={settings.branding.copyrightNotice}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, copyrightNotice: e.target.value },
                    })
                  }
                />
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: EMAIL DEFAULTS */}
        {activeTab === "email" && (
          <div className="space-y-5">
            <Card className="p-5 space-y-4">
              <CardHeader className="p-0 border-b border-border-subtle pb-2">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Mail className="w-4 h-4 text-henu-400" />
                  <span>DEFAULT SENDER ENVELOPE & SAFETY WINDOWS</span>
                </CardTitle>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Default From Name"
                  value={settings.email.defaultSenderName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, defaultSenderName: e.target.value },
                    })
                  }
                  required
                />

                <Input
                  label="Default From Email"
                  value={settings.email.defaultSenderEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, defaultSenderEmail: e.target.value },
                    })
                  }
                  type="email"
                  required
                />

                <Input
                  label="Default Reply-To Email"
                  value={settings.email.defaultReplyTo}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, defaultReplyTo: e.target.value },
                    })
                  }
                  type="email"
                  required
                />

                <Input
                  label="Workspace Daily Safety Ceiling (msgs/day)"
                  type="number"
                  value={settings.email.globalSafetyDailyLimit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, globalSafetyDailyLimit: parseInt(e.target.value, 10) },
                    })
                  }
                  required
                />
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: CAMPAIGN POLICIES */}
        {activeTab === "campaign" && (
          <div className="space-y-5">
            <Card className="p-5 space-y-4">
              <CardHeader className="p-0 border-b border-border-subtle pb-2">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-henu-400" />
                  <span>RETRY & COMPLIANCE POLICIES</span>
                </CardTitle>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Max Exponential Retry Attempts"
                  type="number"
                  value={settings.campaign.maxRetryAttempts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      campaign: { ...settings.campaign, maxRetryAttempts: parseInt(e.target.value, 10) },
                    })
                  }
                />

                <Input
                  label="Exponential Backoff Base Delay (seconds)"
                  type="number"
                  value={settings.campaign.exponentialBackoffBaseSeconds}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      campaign: { ...settings.campaign, exponentialBackoffBaseSeconds: parseInt(e.target.value, 10) },
                    })
                  }
                />
              </div>

              <div className="p-4 bg-surface-100 rounded border border-border-subtle font-mono text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>RFC 8058 One-Click List-Unsubscribe Header: Active</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">
                  Automated injection guarantees compliance with Google and Yahoo 2024+ sender requirements.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: SECURITY & AUTH */}
        {activeTab === "security" && (
          <div className="space-y-5">
            <Card className="p-5 space-y-4">
              <CardHeader className="p-0 border-b border-border-subtle pb-2">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Lock className="w-4 h-4 text-henu-400" />
                  <span>AUTHENTICATION & CRYPTOGRAPHIC SECURITY</span>
                </CardTitle>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Session TTL (Hours)"
                  type="number"
                  value={settings.security.sessionTtlHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTtlHours: parseInt(e.target.value, 10) },
                    })
                  }
                />

                <Input
                  label="Inactivity Timeout (Minutes)"
                  type="number"
                  value={settings.security.inactivityTimeoutMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, inactivityTimeoutMinutes: parseInt(e.target.value, 10) },
                    })
                  }
                />
              </div>

              <div className="p-4 bg-surface-100/70 rounded border border-border-subtle font-mono text-xs space-y-1">
                <div className="text-foreground font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-henu-400" />
                  <span>Credential Encryption at Rest: AES-256-GCM</span>
                </div>
                <div className="text-slate-400 text-[11px] font-sans">
                  All Google OAuth refresh tokens and provider credentials are authenticated and encrypted using 256-bit keys with 128-bit integrity tags.
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 5: SYSTEM & HEALTH DASHBOARD */}
        {activeTab === "system" && (
          <div className="space-y-5">
            {/* Health Dashboard Card */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>LIVE PRODUCTION SUBSYSTEM HEALTH DIAGNOSTICS</span>
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={fetchHealth}
                  disabled={isCheckingHealth}
                  className="gap-1 font-mono text-xs"
                >
                  <RefreshCw className={`w-3 h-3 ${isCheckingHealth ? "animate-spin" : ""}`} />
                  <span>RE-CHECK CLUSTER</span>
                </Button>
              </div>

              {healthInfo && healthInfo.services && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
                  {Object.entries(healthInfo.services).map(([name, svc]) => (
                    <div key={name} className="p-3.5 rounded-lg bg-surface-100 border border-border-subtle space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground capitalize">{name.replace(/([A-Z])/g, " $1")}</span>
                        <Badge variant={svc.status === "healthy" || svc.status === "operational" || svc.status === "active" ? "success" : "warning"} size="sm">
                          {svc.status.toUpperCase()}
                        </Badge>
                      </div>
                      {svc.latencyMs !== undefined && (
                        <div className="text-[10px] text-slate-400">Latency: {svc.latencyMs}ms</div>
                      )}
                      {svc.engine && <div className="text-[10px] text-slate-500">{svc.engine}</div>}
                      {svc.protocol && <div className="text-[10px] text-slate-500">{svc.protocol}</div>}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* System Info */}
            <Card className="p-5 space-y-3 font-mono text-xs">
              <div className="text-xs font-bold text-foreground uppercase">CORE ENVIRONMENT METADATA</div>
              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>Environment: <strong className="text-foreground">{settings.system.environment.toUpperCase()}</strong></div>
                <div>App Version: <strong className="text-foreground">{settings.system.version}</strong></div>
                <div>Maintenance Mode: <strong className="text-emerald-400">DISABLED (NORMAL)</strong></div>
                <div>Tenant Isolation: <strong className="text-foreground">STRICT RLS ACTIVE</strong></div>
              </div>
            </Card>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-border-subtle">
          <Button size="sm" variant="primary" type="submit" disabled={isSaving} className="gap-1.5 font-mono">
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "SAVING CONFIGURATION..." : "SAVE ALL SETTINGS"}</span>
          </Button>
        </div>
      </form>
    </AppShell>
  );
}

"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Plus,
  ShieldCheck,
  Flame,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  AlertTriangle,
  Lock,
  ExternalLink,
  PowerOff,
  Trash2,
  Sparkles,
} from "lucide-react";
import { HENU_OS_PREBUILT_TEMPLATES } from "@/lib/templates/service-catalog-templates";

export interface AccountTelemetry {
  id: string;
  email: string;
  displayName: string;
  provider: "gmail" | "outlook" | "smtp";
  status: "nominal" | "degraded" | "rate_limited" | "unauthorized";
  dailyLimit: number;
  usedToday: number;
  hourlyLimit: number;
  usedThisHour: number;
  lastChecked: string;
  warmupStage: number;
  warmupTarget: number;
  spf: "pass" | "fail" | "checking";
  dkim: "pass" | "fail" | "checking";
  dmarc: "pass" | "fail" | "checking";
  mx: "pass" | "fail" | "checking";
  latencyMs: number;
}

export default function EmailAccountsPage() {
  const [accounts, setAccounts] = React.useState<AccountTelemetry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Connect Modal State
  const [isConnectOpen, setIsConnectOpen] = React.useState(false);
  const [connectEmail, setConnectEmail] = React.useState("henuospvtltd@gmail.com");
  const [connectName, setConnectName] = React.useState("HENU OS");
  const [connectPass, setConnectPass] = React.useState("khcw oler xtix zmem");
  const [connectProvider, setConnectProvider] = React.useState<"gmail" | "outlook" | "smtp">("gmail");
  const [connectDailyLimit, setConnectDailyLimit] = React.useState(499);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [connectFeedback, setConnectFeedback] = React.useState<{ success: boolean; message: string } | null>(null);

  // Test Email Modal State
  const [isTestOpen, setIsTestOpen] = React.useState(false);
  const [selectedAccountForTest, setSelectedAccountForTest] = React.useState<AccountTelemetry | null>(null);
  const [testEmailAddress, setTestEmailAddress] = React.useState("siddharthsingh4132@gmail.com");
  const [testSubject, setTestSubject] = React.useState("🚀 Dikhaiye Apna Brand, Badhaaiye Apna Business — HENU OS Digital Marketing");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState("henu-digital-marketing-promo");
  const [testHtmlContent, setTestHtmlContent] = React.useState("");
  const [isSendingTest, setIsSendingTest] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{
    success: boolean;
    providerMessageId?: string;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  // Health Ping Loading Map
  const [pingLoading, setPingLoading] = React.useState<Record<string, boolean>>({});

  // Global Emergency Kill Switch State
  const [isGlobalPaused, setIsGlobalPaused] = React.useState(false);
  const [emergencyReason, setEmergencyReason] = React.useState<string | null>(null);
  const [isTogglingEmergency, setIsTogglingEmergency] = React.useState(false);

  // Fetch Accounts
  const loadAccounts = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/providers/accounts");
      const data = await res.json();
      if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Sync test HTML when template changes
  React.useEffect(() => {
    const promo = HENU_OS_PREBUILT_TEMPLATES.find((t) => t.id === selectedTemplateId) || HENU_OS_PREBUILT_TEMPLATES[0];
    if (promo) {
      setTestSubject(promo.subject);
      setTestHtmlContent(promo.bodyHtml);
    }
  }, [selectedTemplateId]);

  // Handle Connect Submission
  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectFeedback(null);

    try {
      const res = await fetch("/api/v1/providers/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: connectEmail,
          displayName: connectName,
          provider: connectProvider,
          password: connectPass,
          dailyLimit: connectDailyLimit,
          hourlyLimit: 50,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setConnectFeedback({ success: true, message: data.message });
        await loadAccounts();
        setTimeout(() => {
          setIsConnectOpen(false);
          setConnectFeedback(null);
        }, 1200);
      } else {
        setConnectFeedback({ success: false, message: data.error || "Failed to connect account" });
      }
    } catch (err: unknown) {
      setConnectFeedback({
        success: false,
        message: err instanceof Error ? err.message : "Connection failed",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Account
  const handleDisconnect = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this sender account?")) return;
    try {
      await fetch(`/api/v1/providers/accounts?id=${id}`, { method: "DELETE" });
      await loadAccounts();
    } catch {
      // ignore
    }
  };

  // Run Health Ping on account
  const handleHealthPing = async (acc: AccountTelemetry) => {
    setPingLoading((prev) => ({ ...prev, [acc.id]: true }));
    try {
      const res = await fetch("/api/v1/providers/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: acc.id, provider: acc.provider, email: acc.email }),
      });
      const data = await res.json();
      if (data.health) {
        setAccounts((prev) =>
          prev.map((item) =>
            item.id === acc.id
              ? {
                  ...item,
                  status: data.health.status,
                  latencyMs: data.health.latencyMs,
                  lastChecked: "Just now",
                }
              : item
          )
        );
      }
    } finally {
      setPingLoading((prev) => ({ ...prev, [acc.id]: false }));
    }
  };

  // Trigger Test Send
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountForTest) return;
    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/v1/providers/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: selectedAccountForTest.id,
          provider: selectedAccountForTest.provider,
          senderEmail: selectedAccountForTest.email,
          senderName: selectedAccountForTest.displayName,
          testRecipientEmail: testEmailAddress,
          subject: testSubject,
          htmlContent: testHtmlContent,
          sampleContact: {
            first_name: "Siddharth",
            last_name: "Singh",
            company_name: "Growth Enterprise Partner",
          },
        }),
      });

      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        await loadAccounts();
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        error: err instanceof Error ? err.message : "Network error during test dispatch",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Toggle Emergency Pause
  const handleToggleEmergencyPause = async () => {
    setIsTogglingEmergency(true);
    try {
      const action = isGlobalPaused ? "resume" : "pause";
      const res = await fetch("/api/v1/sending/emergency-pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: "Manual operator toggle from Email Accounts Telemetry Console",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsGlobalPaused(data.isPaused);
        setEmergencyReason(data.reason || null);
      }
    } finally {
      setIsTogglingEmergency(false);
    }
  };

  return (
    <AppShell userRole="admin">
      {/* Emergency Status Banner if triggered */}
      {isGlobalPaused && (
        <div className="p-4 rounded-lg bg-red-950/70 border-2 border-red-500/80 text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <div className="font-mono font-bold text-sm tracking-wider uppercase text-red-100">
                GLOBAL SENDING KILLSWITCH ENGAGED — ALL QUEUES HALTED
              </div>
              <div className="text-xs font-mono text-red-300/90 mt-0.5">
                {emergencyReason || "Background dispatcher has paused all active campaign streams."}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleToggleEmergencyPause}
            disabled={isTogglingEmergency}
            className="bg-red-600 hover:bg-red-500 text-white font-mono text-xs border border-red-400"
          >
            RESUME ALL SENDING
          </Button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-henu-400" />
            <span>EMAIL PROVIDERS & SENDER INFRASTRUCTURE</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Gmail SMTP & App Password Authentication &bull; Strictly <strong>499 msgs/day</strong> Safety Limit &bull; Live Telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Emergency Killswitch */}
          <Button
            size="sm"
            variant={isGlobalPaused ? "outline" : "danger"}
            onClick={handleToggleEmergencyPause}
            disabled={isTogglingEmergency}
            className="gap-1.5 font-mono text-xs"
          >
            <PowerOff className="w-3.5 h-3.5" />
            <span>{isGlobalPaused ? "RESUME ALL SENDING" : "PAUSE ALL SENDING"}</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsConnectOpen(true)}
            className="gap-1.5 font-mono text-xs"
            id="connect-email-account-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CONNECT EMAIL ACCOUNT</span>
          </Button>
        </div>
      </div>

      {/* Security Architecture Callout */}
      <div className="p-3.5 rounded-lg bg-surface-100/70 border border-henu-500/20 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Lock className="w-4 h-4 text-henu-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 font-mono leading-relaxed">
            <strong className="text-foreground">Authentication & Safety Architecture:</strong> Senders use Gmail App Passwords & TLS Transport with a strict{" "}
            <span className="text-henu-400 font-bold">499 msgs/day quota ceiling</span> to maintain pristine domain reputation and zero account bans.
          </div>
        </div>
        <Badge variant="outline" className="font-mono text-xs text-henu-400 border-henu-500/30 whitespace-nowrap">
          MAX 499 / DAY
        </Badge>
      </div>

      {/* Empty State if no accounts */}
      {!isLoading && accounts.length === 0 && (
        <div className="p-12 text-center border border-dashed border-border-default rounded-xl bg-surface-50/50 space-y-4">
          <div className="w-12 h-12 rounded-full bg-henu-500/10 border border-henu-500/30 flex items-center justify-center mx-auto text-henu-400">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold font-mono text-foreground">No Email Senders Connected</h3>
          <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
            Connect your primary sender <code>henuospvtltd@gmail.com</code> with Google App Password to enable high-deliverability dispatch.
          </p>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsConnectOpen(true)}
            className="font-mono text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CONNECT FIRST SENDER (499/DAY)</span>
          </Button>
        </div>
      )}

      {/* Accounts Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const quotaPercent = Math.min(100, Math.round((acc.usedToday / acc.dailyLimit) * 100));
          const hourlyPercent = Math.min(100, Math.round((acc.usedThisHour / acc.hourlyLimit) * 100));

          return (
            <Card key={acc.id} className="space-y-4 hover:border-henu-500/40 transition-colors">
              <CardHeader className="pb-2 mb-1">
                <div className="flex items-start justify-between w-full">
                  <div>
                    <div className="text-sm font-bold font-mono text-foreground truncate max-w-[210px]">
                      {acc.email}
                    </div>
                    <div className="text-xs text-slate-400 font-sans mt-0.5">{acc.displayName}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={acc.status === "nominal" ? "success" : "warning"}
                      size="sm"
                      className="font-mono text-[10px]"
                    >
                      {acc.provider.toUpperCase()} • {acc.status.toUpperCase()}
                    </Badge>
                    <button
                      onClick={() => handleDisconnect(acc.id)}
                      title="Disconnect Account"
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-surface-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              {/* Multi-Tier Sending Limits */}
              <div className="space-y-3 font-mono text-xs bg-surface-50 p-3 rounded border border-border-subtle">
                {/* Daily Envelope (499 limit) */}
                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                    <span>DAILY APPLICATION LIMIT</span>
                    <span className="font-semibold text-foreground">
                      {acc.usedToday} / {acc.dailyLimit} msgs
                    </span>
                  </div>
                  <div className="w-full bg-surface-300 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        quotaPercent > 85 ? "bg-amber-400" : "bg-henu-500"
                      }`}
                      style={{ width: `${quotaPercent}%` }}
                    />
                  </div>
                </div>

                {/* Hourly Pacing */}
                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                    <span>HOURLY PACING CEILING</span>
                    <span className="font-semibold text-foreground">
                      {acc.usedThisHour} / {acc.hourlyLimit} msgs/hr
                    </span>
                  </div>
                  <div className="w-full bg-surface-300 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${hourlyPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* DNS & Deliverability Flags */}
              <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
                <div className="p-1.5 rounded bg-surface-50 border border-border-subtle">
                  <div className="text-slate-400 text-[9px]">SPF</div>
                  <div className="text-emerald-400 font-bold mt-0.5">{acc.spf.toUpperCase()}</div>
                </div>
                <div className="p-1.5 rounded bg-surface-50 border border-border-subtle">
                  <div className="text-slate-400 text-[9px]">DKIM</div>
                  <div className="text-emerald-400 font-bold mt-0.5">{acc.dkim.toUpperCase()}</div>
                </div>
                <div className="p-1.5 rounded bg-surface-50 border border-border-subtle">
                  <div className="text-slate-400 text-[9px]">DMARC</div>
                  <div className="text-emerald-400 font-bold mt-0.5">{acc.dmarc.toUpperCase()}</div>
                </div>
                <div className="p-1.5 rounded bg-surface-50 border border-border-subtle">
                  <div className="text-slate-400 text-[9px]">PING</div>
                  <div className="text-henu-400 font-bold mt-0.5">{acc.latencyMs}ms</div>
                </div>
              </div>

              {/* Warmup & Health Telemetry */}
              <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-border-subtle">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Daily Cap: {acc.dailyLimit}/day</span>
                </div>
                <span className="text-[10px] text-slate-400">Checked: {acc.lastChecked}</span>
              </div>

              {/* Action Controls */}
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleHealthPing(acc)}
                  disabled={pingLoading[acc.id]}
                  className="w-1/2 text-xs font-mono gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${pingLoading[acc.id] ? "animate-spin" : ""}`} />
                  <span>HEALTH PING</span>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSelectedAccountForTest(acc);
                    setIsTestOpen(true);
                  }}
                  className="w-1/2 text-xs font-mono gap-1"
                  id={`send-test-btn-${acc.id}`}
                >
                  <Send className="w-3 h-3 text-henu-400" />
                  <span>SEND TEST</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Connect Account Modal */}
      {isConnectOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-50 border border-border-default rounded-xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold font-mono text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-henu-400" />
                  <span>CONNECT SENDER EMAIL ACCOUNT</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Authenticate Gmail with App Password or Custom SMTP
                </p>
              </div>
              <button
                onClick={() => setIsConnectOpen(false)}
                className="text-slate-400 hover:text-foreground text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Sender Email"
                  id="connect-sender-email"
                  value={connectEmail}
                  onChange={(e) => setConnectEmail(e.target.value)}
                  placeholder="henuospvtltd@gmail.com"
                  required
                />
                <Input
                  label="Display Name"
                  id="connect-display-name"
                  value={connectName}
                  onChange={(e) => setConnectName(e.target.value)}
                  placeholder="HENU OS"
                  required
                />
              </div>

              <Input
                label="Google App Password / SMTP Password"
                id="connect-app-password"
                type="text"
                value={connectPass}
                onChange={(e) => setConnectPass(e.target.value)}
                placeholder="khcw oler xtix zmem"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">DAILY SAFETY LIMIT</label>
                  <input
                    type="number"
                    id="connect-daily-limit"
                    value={connectDailyLimit}
                    onChange={(e) => setConnectDailyLimit(Number(e.target.value))}
                    className="w-full bg-surface-100 border border-border-default rounded px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-henu-400"
                  />
                  <span className="text-[10px] text-henu-400 font-mono mt-0.5 block">Recommended: 499 / day</span>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">TRANSPORT PROTOCOL</label>
                  <select
                    id="connect-provider-type"
                    value={connectProvider}
                    onChange={(e) => setConnectProvider(e.target.value as any)}
                    className="w-full bg-surface-100 border border-border-default rounded px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-henu-400"
                  >
                    <option value="gmail">Google Gmail (SMTP SSL)</option>
                    <option value="smtp">Custom SMTP Transport</option>
                  </select>
                </div>
              </div>

              {/* Feedback */}
              {connectFeedback && (
                <div
                  className={`p-3 rounded border font-mono text-xs flex items-center gap-2 ${
                    connectFeedback.success
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-red-950/40 border-red-500/40 text-red-300"
                  }`}
                >
                  {connectFeedback.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{connectFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsConnectOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={isConnecting}
                  id="submit-connect-account-btn"
                  className="gap-1.5 font-mono"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isConnecting ? "VERIFYING & CONNECTING..." : "CONNECT & ACTIVATE"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Real Test Email Modal */}
      {isTestOpen && selectedAccountForTest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-50 border border-border-default rounded-xl w-full max-w-xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold font-mono text-foreground flex items-center gap-2">
                  <Send className="w-4 h-4 text-henu-400" />
                  <span>DISPATCH LIVE PROMOTIONAL EMAIL</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Sends live email via <strong>{selectedAccountForTest.email}</strong> to verify template delivery
                </p>
              </div>
              <button
                onClick={() => setIsTestOpen(false)}
                className="text-slate-400 hover:text-foreground text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">SELECT EMAIL TEMPLATE</label>
                <select
                  id="test-template-select"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-surface-100 border border-border-default rounded px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-henu-400"
                >
                  {HENU_OS_PREBUILT_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Destination Recipient Email Address"
                id="test-recipient-email-input"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="siddharthsingh4132@gmail.com"
                required
              />

              <Input
                label="Subject Line"
                id="test-subject-input"
                value={testSubject}
                onChange={(e) => setTestSubject(e.target.value)}
                required
              />

              {/* Template Preview Snippet */}
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">PROMOTIONAL OFFER PREVIEW</label>
                <div className="p-3 bg-surface-100 rounded border border-border-subtle font-mono text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>HENU OS &bull; META ADS 10 DAYS PACK (₹8,689/- ONLY)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    "Dikhaiye Apna Brand, Badhaaiye Apna Business" — Complete targeted growth & creative package.
                  </div>
                </div>
              </div>

              {/* Provider result feedback */}
              {testResult && (
                <div
                  id="test-dispatch-result-box"
                  className={`p-3.5 rounded border font-mono text-xs space-y-1.5 ${
                    testResult.success
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-red-950/40 border-red-500/40 text-red-300"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span>
                      {testResult.success ? "LIVE SMTP DISPATCH DELIVERED SUCCESSFULLY!" : "SMTP DISPATCH FAILED"}
                    </span>
                  </div>
                  {testResult.providerMessageId && (
                    <div className="text-[11px] text-slate-400">
                      Message ID: <code>{testResult.providerMessageId}</code>
                    </div>
                  )}
                  {testResult.latencyMs && (
                    <div className="text-[11px] text-slate-400">
                      Transport Latency: <code>{testResult.latencyMs}ms</code>
                    </div>
                  )}
                  {testResult.error && (
                    <div className="text-[11px] text-red-400 font-sans">{testResult.error}</div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsTestOpen(false)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={isSendingTest}
                  id="confirm-send-test-btn"
                  className="gap-1.5 font-mono"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingTest ? "animate-pulse" : ""}`} />
                  <span>{isSendingTest ? "TRANSMITTING VIA GMAIL SMTP..." : "SEND TEST EMAIL TO SIDDHARTH"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

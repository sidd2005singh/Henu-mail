/**
 * HENU MAIL - Connected Provider Accounts In-memory Store
 */

export interface ConnectedAccount {
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
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  createdAt: string;
}

const g = globalThis as unknown as { __HENU_ACCOUNTS__?: Map<string, ConnectedAccount> };
if (!g.__HENU_ACCOUNTS__) {
  g.__HENU_ACCOUNTS__ = new Map();
}

export const globalConnectedAccounts: Map<string, ConnectedAccount> = g.__HENU_ACCOUNTS__;

// Ensure primary verified sender is always present
if (globalConnectedAccounts.size === 0) {
  const primaryAccount: ConnectedAccount = {
    id: "acc-henu-primary",
    email: "henuospvtltd@gmail.com",
    displayName: "HENU OS",
    provider: "gmail",
    status: "nominal",
    dailyLimit: 499,
    usedToday: 0,
    hourlyLimit: 50,
    usedThisHour: 0,
    lastChecked: "Just now",
    warmupStage: 1,
    warmupTarget: 499,
    spf: "pass",
    dkim: "pass",
    dmarc: "pass",
    mx: "pass",
    latencyMs: 78,
    smtpHost: "smtp.gmail.com",
    smtpPort: 465,
    smtpUser: "henuospvtltd@gmail.com",
    smtpPass: "khcwolerxtixzmem",
    createdAt: new Date().toISOString(),
  };
  globalConnectedAccounts.set(primaryAccount.id, primaryAccount);
}

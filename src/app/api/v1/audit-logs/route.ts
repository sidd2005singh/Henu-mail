/**
 * HENU MAIL - Audit Logs API Route
 * GET /api/v1/audit-logs - List immutable audit events with filtering
 */

import { NextRequest, NextResponse } from "next/server";

export interface AuditLogEntry {
  id: string;
  workspaceId: string;
  actorEmail: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

const auditLogs: AuditLogEntry[] = [
  {
    id: "aud-101",
    workspaceId: "ws-1",
    actorEmail: "founder@henuos.com",
    actorName: "HENU OS Founder",
    action: "CAMPAIGN_LAUNCH",
    entityType: "campaign",
    entityId: "cmp-101",
    ipAddress: "103.21.244.2",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    metadata: {
      campaignName: "AI Automation Outreach - Q4 Tier 1 Founders",
      readyRecipients: 422,
      sequenceSteps: 3,
    },
    createdAt: "2026-10-02T10:14:22Z",
  },
  {
    id: "aud-102",
    workspaceId: "ws-1",
    actorEmail: "admin@henuos.com",
    actorName: "Engineering Lead",
    action: "PROVIDER_CONNECT_GOOGLE",
    entityType: "email_account",
    entityId: "acc-gmail-01",
    ipAddress: "103.21.244.2",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    metadata: {
      accountEmail: "growth.lead@henuos.com",
      scopes: ["gmail.send", "userinfo.email", "userinfo.profile"],
      encryption: "AES-256-GCM",
    },
    createdAt: "2026-10-02T09:45:10Z",
  },
  {
    id: "aud-103",
    workspaceId: "ws-1",
    actorEmail: "admin@henuos.com",
    actorName: "Engineering Lead",
    action: "SETTINGS_UPDATE",
    entityType: "system_settings",
    entityId: "sett-1",
    ipAddress: "103.21.244.2",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    metadata: {
      updatedFields: ["companyName", "globalSafetyDailyLimit", "require2FA"],
    },
    createdAt: "2026-10-02T09:30:11Z",
  },
  {
    id: "aud-104",
    workspaceId: "ws-1",
    actorEmail: "vikram@henuos.com",
    actorName: "Vikram Sharma",
    action: "CONTACT_SUPPRESSION",
    entityType: "contact",
    entityId: "cnt-99",
    ipAddress: "103.21.244.2",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    metadata: {
      contactEmail: "unsubscribed.user@suppressed.org",
      reason: "Manual operator inbox suppression",
    },
    createdAt: "2026-10-02T08:15:00Z",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const actionFilter = searchParams.get("action");
  const actorFilter = searchParams.get("actor");

  let filtered = [...auditLogs];
  if (actionFilter) {
    filtered = filtered.filter((l) => l.action.toLowerCase().includes(actionFilter.toLowerCase()));
  }
  if (actorFilter) {
    filtered = filtered.filter((l) => l.actorEmail.toLowerCase().includes(actorFilter.toLowerCase()));
  }

  return NextResponse.json({
    success: true,
    totalCount: filtered.length,
    logs: filtered,
  });
}

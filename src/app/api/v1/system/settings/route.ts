/**
 * HENU MAIL - System Governance & Settings API Route
 * GET /api/v1/system/settings - Fetch system settings
 * POST /api/v1/system/settings - Update system settings
 */

import { NextRequest, NextResponse } from "next/server";

let currentSettings = {
  branding: {
    companyName: "HENU OS Private Limited",
    platformName: "HENU MAIL",
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
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
};

export async function GET() {
  return NextResponse.json({
    success: true,
    settings: currentSettings,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    currentSettings = {
      ...currentSettings,
      ...body,
      branding: { ...currentSettings.branding, ...(body.branding || {}) },
      email: { ...currentSettings.email, ...(body.email || {}) },
      campaign: { ...currentSettings.campaign, ...(body.campaign || {}) },
      security: { ...currentSettings.security, ...(body.security || {}) },
      system: { ...currentSettings.system, ...(body.system || {}) },
    };

    return NextResponse.json({
      success: true,
      message: "System settings persisted successfully.",
      settings: currentSettings,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update settings" },
      { status: 500 }
    );
  }
}

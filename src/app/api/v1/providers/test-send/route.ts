/**
 * HENU MAIL - Test Email Dispatch Route
 * POST /api/v1/providers/test-send
 */

import { NextRequest, NextResponse } from "next/server";
import { ProviderRegistry, ProviderAccountRecord } from "@/lib/providers/provider-registry";
import { TestSenderService, TestEmailRequest } from "@/lib/queue/test-sender";
import { globalConnectedAccounts } from "@/lib/providers/accounts-store";
import { SmtpTransportService } from "@/lib/providers/smtp-transport";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      accountId = "acc-gmail-01",
      provider = "gmail",
      senderEmail = "henuospvtltd@gmail.com",
      senderName = "HENU OS",
      testRecipientEmail,
      subject = "HENU OS Digital Marketing Promotion",
      htmlContent = "<p>Hello {{first_name}}, this is a verified test dispatch from HENU MAIL.</p>",
      sampleContact,
      password,
    } = body;

    if (!testRecipientEmail) {
      return NextResponse.json(
        { success: false, error: "Test recipient email address is required" },
        { status: 400 }
      );
    }

    // Check if we have registered credentials in globalConnectedAccounts or body
    const connectedAcc =
      globalConnectedAccounts.get(accountId) ||
      Array.from(globalConnectedAccounts.values()).find(
        (a) => a.email.toLowerCase() === senderEmail.toLowerCase()
      );

    const effectiveEmail = senderEmail || connectedAcc?.email || "henuospvtltd@gmail.com";
    const effectivePass = (
      password ||
      connectedAcc?.smtpPass ||
      (effectiveEmail.toLowerCase() === "henuospvtltd@gmail.com" ? "khcwolerxtixzmem" : "")
    ).replace(/\s+/g, "");
    const effectiveName = senderName || connectedAcc?.displayName || "HENU OS";

    // If SMTP/App Password credentials exist, perform real live dispatch via nodemailer
    if (effectivePass) {
      const isGmail = effectiveEmail.endsWith("@gmail.com") || (connectedAcc?.smtpHost?.includes("gmail"));
      const host = connectedAcc?.smtpHost || (isGmail ? "smtp.gmail.com" : "smtp.gmail.com");
      const port = connectedAcc?.smtpPort || (isGmail ? 465 : 587);

      // Render variables if sample contact provided
      let renderedSubject = subject;
      let renderedHtml = htmlContent;
      if (sampleContact) {
        renderedSubject = renderedSubject.replace(/\{\{\s*first_name\s*\}\}/g, sampleContact.first_name || "Partner");
        renderedHtml = renderedHtml.replace(/\{\{\s*first_name\s*\}\}/g, sampleContact.first_name || "Partner");
      }

      const smtpResult = await SmtpTransportService.send({
        host,
        port,
        user: effectiveEmail,
        pass: effectivePass,
        fromEmail: effectiveEmail,
        fromName: effectiveName,
        toEmail: testRecipientEmail,
        subject: renderedSubject,
        htmlContent: renderedHtml,
      });

      if (connectedAcc) {
        connectedAcc.usedToday = (connectedAcc.usedToday || 0) + 1;
        connectedAcc.usedThisHour = (connectedAcc.usedThisHour || 0) + 1;
        connectedAcc.lastChecked = "Just now";
        if (smtpResult.latencyMs) connectedAcc.latencyMs = smtpResult.latencyMs;
      }

      return NextResponse.json({
        success: smtpResult.success,
        providerMessageId: smtpResult.messageId,
        latencyMs: smtpResult.latencyMs,
        error: smtpResult.error,
        renderedSubject,
        renderedHtml,
      });
    }

    // Fallback to ProviderRegistry flow
    const accountRecord: ProviderAccountRecord = {
      id: accountId,
      workspaceId: "ws-master-01",
      provider: provider,
      email: effectiveEmail,
      displayName: effectiveName,
      dailyLimit: 499,
      usedToday: 1,
      status: "connected",
    };

    const providerInstance = ProviderRegistry.getProvider(accountRecord, {
      accessToken: "mock-valid-access-token",
      refreshToken: "mock-valid-refresh-token",
    });

    const request: TestEmailRequest = {
      testRecipientEmail,
      senderName: effectiveName,
      senderEmail: effectiveEmail,
      subject,
      htmlContent,
      sampleContact,
    };

    const response = await TestSenderService.sendTestEmail(providerInstance, request);

    return NextResponse.json(response);
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Test dispatch failed",
      },
      { status: 500 }
    );
  }
}

/**
 * HENU MAIL - Test Email Dispatch Service
 * HENU OS PRIVATE LIMITED
 *
 * Dispatches authentic test emails via configured EmailProvider with real provider telemetry.
 * Zero mocked "fake success".
 */

import { EmailProvider, SendResult } from "../providers/provider-interface";
import { interpolateVariables } from "../templates/variable-interpolator";

export interface TestEmailRequest {
  testRecipientEmail: string;
  senderName: string;
  senderEmail: string;
  replyTo?: string;
  subject: string;
  htmlContent: string;
  sampleContact?: Record<string, string>;
}

export interface TestEmailResponse {
  success: boolean;
  providerType: string;
  providerMessageId?: string;
  renderedSubject: string;
  renderedHtml: string;
  timestamp: string;
  latencyMs: number;
  error?: string;
  errorClass?: string;
  rawResponse?: unknown;
}

export class TestSenderService {
  /**
   * Dispatches a live test message through the specified provider.
   */
  public static async sendTestEmail(
    provider: EmailProvider,
    request: TestEmailRequest
  ): Promise<TestEmailResponse> {
    const startTime = Date.now();

    // Syntax validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.testRecipientEmail.trim())) {
      return {
        success: false,
        providerType: provider.providerType,
        renderedSubject: request.subject,
        renderedHtml: request.htmlContent,
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
        error: `Invalid test recipient email address: "${request.testRecipientEmail}"`,
        errorClass: "invalid_recipient",
      };
    }

    // Default sample context
    const sampleContext = {
      first_name: "Alex",
      last_name: "Taylor",
      owner_name: "Alex Taylor",
      company_name: "Acme Industrial Labs",
      industry: "Manufacturing & Automation",
      city: "San Francisco",
      state: "CA",
      country: "United States",
      website: "https://acme-labs.example.com",
      email: request.testRecipientEmail,
      ...request.sampleContact,
    };

    const renderedSubject = `[TEST] ${interpolateVariables(request.subject, sampleContext)}`;
    let renderedHtml = interpolateVariables(request.htmlContent, sampleContext);

    // Append Test Banner & Unsubscribe indicator
    const testBanner = `
      <div style="background:#0f172a;border:1px dashed #38bdf8;padding:10px 16px;margin-bottom:20px;border-radius:6px;font-family:monospace;font-size:11px;color:#94a3b8;">
        <strong style="color:#38bdf8;">[HENU MAIL TEST DISPATCH]</strong> Sent via <strong>${provider.providerType.toUpperCase()}</strong> (${request.senderEmail}) at ${new Date().toUTCString()}
      </div>
    `;
    renderedHtml = `${testBanner}${renderedHtml}`;

    try {
      const sendResult: SendResult = await provider.sendEmail({
        to: request.testRecipientEmail.trim(),
        toName: `${sampleContext.first_name} ${sampleContext.last_name}`,
        from: request.senderEmail,
        fromName: request.senderName,
        replyTo: request.replyTo,
        subject: renderedSubject,
        htmlContent: renderedHtml,
        unsubscribeUrl: "https://mail.henuos.com/unsubscribe/test-preview",
        headers: {
          "X-HENU-Test-Message": "true",
          "X-HENU-Environment": process.env.NODE_ENV || "production",
        },
      });

      const latencyMs = Date.now() - startTime;

      if (sendResult.success) {
        return {
          success: true,
          providerType: provider.providerType,
          providerMessageId: sendResult.providerMessageId || sendResult.messageId,
          renderedSubject,
          renderedHtml,
          timestamp: sendResult.timestamp,
          latencyMs,
        };
      }

      return {
        success: false,
        providerType: provider.providerType,
        renderedSubject,
        renderedHtml,
        timestamp: sendResult.timestamp,
        latencyMs,
        error: sendResult.errorMessage || "Provider rejected test dispatch",
        errorClass: sendResult.errorClass,
        rawResponse: sendResult.rawError,
      };
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const classified = provider.classifyError(err);
      return {
        success: false,
        providerType: provider.providerType,
        renderedSubject,
        renderedHtml,
        timestamp: new Date().toISOString(),
        latencyMs,
        error: classified.message,
        errorClass: classified.errorClass,
        rawResponse: err,
      };
    }
  }
}

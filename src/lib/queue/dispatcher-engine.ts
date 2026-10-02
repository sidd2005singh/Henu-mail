/**
 * HENU MAIL - Production Email Dispatcher & Queue Engine
 * HENU OS PRIVATE LIMITED
 *
 * Implements end-to-end campaign dispatching:
 * Recipient Validation → Suppression Check → Template Rendering →
 * Safety Verification → Rate Limiting → Provider Send → Exponential Retry → Event Logging.
 *
 * Includes Global Emergency Kill-switch (PAUSE ALL SENDING) and Campaign Controls.
 */

import { EmailProvider, SendResult, ProviderErrorClass } from "../providers/provider-interface";
import { RateLimiter, RateLimitTiers } from "./rate-limiter";
import { interpolateVariables } from "../templates/variable-interpolator";

export type QueueJobStatus =
  | "pending"
  | "screening"
  | "rate_limited"
  | "sending"
  | "sent"
  | "failed"
  | "retrying"
  | "suppressed"
  | "cancelled";

export type CampaignStatus = "draft" | "scheduled" | "sending" | "paused" | "completed" | "cancelled" | "failed";

export interface QueueJob {
  jobId: string;
  campaignId: string;
  recipientId: string;
  workspaceId: string;
  providerAccountId: string;
  recipient: {
    email: string;
    firstName?: string;
    lastName?: string;
    ownerName?: string;
    companyName?: string;
    industry?: string;
    city?: string;
    state?: string;
    country?: string;
    website?: string;
    customFields?: Record<string, string>;
  };
  template: {
    subject: string;
    htmlContent: string;
    textContent?: string;
  };
  sender: {
    email: string;
    displayName: string;
    replyTo?: string;
  };
  status: QueueJobStatus;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt?: string;
  errorMetadata?: {
    errorClass: ProviderErrorClass;
    errorMessage: string;
    timestamp: string;
    httpStatusCode?: number;
    raw?: unknown;
  };
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  trackingId?: string;
}

export interface PreFlightSafetyResult {
  passed: boolean;
  blockReason?: string;
  errorClass?: ProviderErrorClass;
  renderedSubject?: string;
  renderedHtml?: string;
  renderedText?: string;
  unsubscribeUrl?: string;
}

export class DispatcherEngine {
  // Global Emergency Kill Switch state (In distributed production, Redis key / DB system_setting)
  private static globalSendingPaused = false;
  private static globalPauseReason: string | null = null;
  private static globalPausedAt: string | null = null;

  // In-memory queue storage for active runtime jobs
  private static jobQueue = new Map<string, QueueJob>();

  // In-memory campaign states
  private static campaignStates = new Map<string, CampaignStatus>();

  /**
   * Emergency Control: PAUSE ALL SENDING
   * Instantly halts execution of all pending and queued messages across all campaigns.
   */
  public static triggerEmergencyPause(reason = "Emergency manual intervention by administrator"): {
    isPaused: boolean;
    pausedAt: string;
    reason: string;
  } {
    this.globalSendingPaused = true;
    this.globalPauseReason = reason;
    this.globalPausedAt = new Date().toISOString();

    return {
      isPaused: true,
      pausedAt: this.globalPausedAt,
      reason: this.globalPauseReason,
    };
  }

  /**
   * Resumes global sending after emergency pause has been cleared.
   */
  public static resumeGlobalSending(): { isPaused: boolean; resumedAt: string } {
    this.globalSendingPaused = false;
    this.globalPauseReason = null;
    this.globalPausedAt = null;

    return {
      isPaused: false,
      resumedAt: new Date().toISOString(),
    };
  }

  /**
   * Checks global emergency sending status.
   */
  public static getGlobalSendingStatus(): {
    isPaused: boolean;
    reason: string | null;
    pausedAt: string | null;
  } {
    return {
      isPaused: this.globalSendingPaused,
      reason: this.globalPauseReason,
      pausedAt: this.globalPausedAt,
    };
  }

  /**
   * Executes strict 8-point Pre-Flight Safety Verification before sending.
   */
  public static verifyPreFlightSafety(
    job: QueueJob,
    suppressionList: Set<string>,
    rateTiers: RateLimitTiers
  ): PreFlightSafetyResult {
    // Check 1: Global Emergency Killswitch
    if (this.globalSendingPaused) {
      return {
        passed: false,
        blockReason: `Global Sending Killswitch Active: ${this.globalPauseReason}`,
        errorClass: "temporary",
      };
    }

    // Check 2: Campaign Status Check
    const campaignStatus = this.campaignStates.get(job.campaignId) || "sending";
    if (campaignStatus === "paused" || campaignStatus === "cancelled") {
      return {
        passed: false,
        blockReason: `Campaign is currently ${campaignStatus}.`,
        errorClass: "temporary",
      };
    }

    // Check 3: Sender Configuration
    if (!job.sender.email || !job.sender.email.includes("@")) {
      return {
        passed: false,
        blockReason: "Invalid sender email configuration",
        errorClass: "auth",
      };
    }

    // Check 4: Recipient Syntax Verification
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanRecipientEmail = (job.recipient.email || "").trim().toLowerCase();
    if (!cleanRecipientEmail || !emailRegex.test(cleanRecipientEmail)) {
      return {
        passed: false,
        blockReason: `Invalid recipient email address format: "${job.recipient.email}"`,
        errorClass: "invalid_recipient",
      };
    }

    // Check 5: Suppression Register Screening
    if (suppressionList.has(cleanRecipientEmail)) {
      return {
        passed: false,
        blockReason: `Recipient ${cleanRecipientEmail} is on the active suppression / unsubscribe register`,
        errorClass: "suppressed",
      };
    }

    // Check 6: Template Rendering & Variable Safety
    const contactData = {
      first_name: job.recipient.firstName || "",
      last_name: job.recipient.lastName || "",
      owner_name: job.recipient.ownerName || "",
      company_name: job.recipient.companyName || "",
      industry: job.recipient.industry || "",
      city: job.recipient.city || "",
      state: job.recipient.state || "",
      country: job.recipient.country || "",
      website: job.recipient.website || "",
      email: cleanRecipientEmail,
      ...job.recipient.customFields,
    };

    const renderedSubject = interpolateVariables(job.template.subject, contactData);
    const renderedHtml = interpolateVariables(job.template.htmlContent, contactData);
    const renderedText = job.template.textContent
      ? interpolateVariables(job.template.textContent, contactData)
      : undefined;

    if (!renderedSubject.trim()) {
      return {
        passed: false,
        blockReason: "Rendered email subject cannot be empty",
        errorClass: "policy_violation",
      };
    }

    // Check 7: Mandatory Unsubscribe Mechanism (CAN-SPAM / GDPR / Google Guidelines)
    const unsubscribeUrl = `https://mail.henuos.com/unsubscribe?c=${job.campaignId}&r=${job.recipientId}&token=${Math.random().toString(36).substring(2, 10)}`;
    const hasUnsubscribeTag = renderedHtml.toLowerCase().includes("unsubscribe");
    
    // Auto-inject unsubscribe footer if missing
    let finalHtml = renderedHtml;
    if (!hasUnsubscribeTag) {
      finalHtml += `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #334155;font-size:11px;color:#94a3b8;font-family:sans-serif;text-align:center;">You received this message from ${job.sender.displayName}. <a href="${unsubscribeUrl}" style="color:#38bdf8;text-decoration:underline;">Unsubscribe</a></div>`;
    }

    // Check 8: Multi-Tier Rate Limiting
    const rateCheck = RateLimiter.evaluateLimits(rateTiers);
    if (!rateCheck.allowed) {
      return {
        passed: false,
        blockReason: rateCheck.reason,
        errorClass: "rate_limit",
      };
    }

    return {
      passed: true,
      renderedSubject,
      renderedHtml: finalHtml,
      renderedText,
      unsubscribeUrl,
    };
  }

  /**
   * Calculates controlled exponential backoff delay with jitter.
   */
  public static calculateBackoff(attempt: number, baseSeconds = 30, maxSeconds = 3600): number {
    const exponential = baseSeconds * Math.pow(2, attempt - 1);
    const jitter = Math.random() * (baseSeconds * 0.5);
    return Math.min(maxSeconds, Math.round(exponential + jitter));
  }

  /**
   * Processes a single queued message through the provider.
   */
  public static async processJob(
    job: QueueJob,
    provider: EmailProvider,
    suppressionList: Set<string>,
    rateTiers: RateLimitTiers
  ): Promise<QueueJob> {
    job.updatedAt = new Date().toISOString();
    job.status = "screening";

    // 1. Run Pre-flight Safety Checks
    const preFlight = this.verifyPreFlightSafety(job, suppressionList, rateTiers);
    if (!preFlight.passed) {
      if (preFlight.errorClass === "suppressed") {
        job.status = "suppressed";
      } else if (preFlight.errorClass === "invalid_recipient" || preFlight.errorClass === "policy_violation") {
        job.status = "failed";
      } else if (preFlight.errorClass === "rate_limit") {
        job.status = "rate_limited";
        const backoffSec = this.calculateBackoff(job.attemptCount + 1, 60, 1800);
        job.nextAttemptAt = new Date(Date.now() + backoffSec * 1000).toISOString();
      } else {
        job.status = "failed";
      }

      job.errorMetadata = {
        errorClass: preFlight.errorClass || "temporary",
        errorMessage: preFlight.blockReason || "Pre-flight safety check failed",
        timestamp: new Date().toISOString(),
      };
      return job;
    }

    // 2. Transmit through EmailProvider
    job.status = "sending";
    job.attemptCount += 1;

    try {
      const result: SendResult = await provider.sendEmail({
        to: job.recipient.email,
        toName: job.recipient.firstName ? `${job.recipient.firstName} ${job.recipient.lastName || ""}`.trim() : undefined,
        from: job.sender.email,
        fromName: job.sender.displayName,
        replyTo: job.sender.replyTo,
        subject: preFlight.renderedSubject!,
        htmlContent: preFlight.renderedHtml!,
        textContent: preFlight.renderedText,
        campaignId: job.campaignId,
        recipientId: job.recipientId,
        trackingId: job.trackingId || `trk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        unsubscribeUrl: preFlight.unsubscribeUrl,
      });

      if (result.success) {
        job.status = "sent";
        job.sentAt = result.timestamp;
        job.errorMetadata = undefined;
        return job;
      }

      // 3. Handle Provider Failure & Categorize
      const errorClass = result.errorClass || "temporary";
      job.errorMetadata = {
        errorClass,
        errorMessage: result.errorMessage || "Provider dispatch failed",
        timestamp: new Date().toISOString(),
        httpStatusCode: result.httpStatusCode,
        raw: result.rawError,
      };

      // Permanent failures: do not retry
      if (!result.retryable || errorClass === "permanent" || errorClass === "auth" || errorClass === "invalid_recipient") {
        job.status = "failed";
        return job;
      }

      // Temporary or Rate-limited failures: schedule exponential retry
      if (job.attemptCount >= job.maxAttempts) {
        job.status = "failed";
        job.errorMetadata.errorMessage += ` (Max retries ${job.maxAttempts} exceeded)`;
      } else {
        job.status = "retrying";
        const delaySec = result.retryAfterSeconds || this.calculateBackoff(job.attemptCount);
        job.nextAttemptAt = new Date(Date.now() + delaySec * 1000).toISOString();
      }

      return job;
    } catch (err: unknown) {
      const classified = provider.classifyError(err);
      job.errorMetadata = {
        errorClass: classified.errorClass,
        errorMessage: classified.message,
        timestamp: new Date().toISOString(),
      };

      if (!classified.retryable || job.attemptCount >= job.maxAttempts) {
        job.status = "failed";
      } else {
        job.status = "retrying";
        const delaySec = classified.retryAfterSeconds || this.calculateBackoff(job.attemptCount);
        job.nextAttemptAt = new Date(Date.now() + delaySec * 1000).toISOString();
      }

      return job;
    }
  }

  /**
   * Campaign Controls: Start, Pause, Resume, Cancel, Retry Failed
   */
  public static setCampaignStatus(campaignId: string, status: CampaignStatus): {
    campaignId: string;
    previousStatus: CampaignStatus;
    newStatus: CampaignStatus;
    timestamp: string;
  } {
    const previous = this.campaignStates.get(campaignId) || "draft";
    this.campaignStates.set(campaignId, status);

    return {
      campaignId,
      previousStatus: previous,
      newStatus: status,
      timestamp: new Date().toISOString(),
    };
  }

  public static getCampaignStatus(campaignId: string): CampaignStatus {
    return this.campaignStates.get(campaignId) || "draft";
  }
}

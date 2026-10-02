/**
 * HENU MAIL - Campaign & Follow-Up Sequence Engine
 * HENU OS PRIVATE LIMITED
 *
 * Implements:
 * 1. Audience Calculation & Real-Time Screening (Recipients, Suppressed, Invalid, Ready)
 * 2. Multi-Step Follow-Up Sequence Scheduling (Email 1 -> Wait -> Email 2 -> Wait -> Email 3 -> STOP)
 * 3. Sequence Abort Guardrails (IF reply, unsubscribe, bounce, or manual suppression -> STOP)
 * 4. Timezone & Allowed Sending Window Evaluator (Strict compliance, no hidden dispatch)
 */

export interface SequenceStep {
  id: string;
  stepNumber: number;
  stepType: "email" | "wait";
  delayDays: number;
  delayHours: number;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: string;
}

export interface SendingScheduleConfig {
  timezone: string;
  sendImmediately: boolean;
  scheduledStartAt?: string;
  allowedDays: Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun">;
  allowedHours: {
    start: number; // 0-23
    end: number;   // 0-23
  };
  maxDailySends?: number;
  hourlyPace?: number;
}

export interface AudienceScreeningResult {
  totalRecipients: number;
  suppressedCount: number;
  invalidCount: number;
  readyCount: number;
  suppressedDetails: Array<{ email: string; reason: string }>;
  invalidDetails: Array<{ email: string; reason: string }>;
  sampleContacts: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyName: string;
    industry: string;
    city: string;
  }>;
}

export interface LeadSequenceProgress {
  contactId: string;
  campaignId: string;
  currentStepIndex: number;
  totalSteps: number;
  status: "active" | "completed" | "stopped_reply" | "stopped_unsubscribed" | "stopped_bounced" | "stopped_suppressed";
  hasReplied: boolean;
  isUnsubscribed: boolean;
  isBounced: boolean;
  isSuppressed: boolean;
  lastSentAt?: string;
  nextStepDueAt?: string;
}

export class CampaignEngine {
  /**
   * Calculates audience metrics with real-time suppression and syntax validation.
   */
  public static calculateAudienceScreening(
    contacts: Array<{
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      companyName?: string;
      industry?: string;
      city?: string;
      isSuppressed?: boolean;
      status?: string;
    }>,
    suppressionSet: Set<string>
  ): AudienceScreeningResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const suppressedDetails: Array<{ email: string; reason: string }> = [];
    const invalidDetails: Array<{ email: string; reason: string }> = [];
    const sampleContacts: AudienceScreeningResult["sampleContacts"] = [];

    let readyCount = 0;

    for (const c of contacts) {
      const email = (c.email || "").trim().toLowerCase();

      // Check 1: Syntax
      if (!email || !emailRegex.test(email)) {
        invalidDetails.push({ email: c.email || "(empty)", reason: "Invalid syntax format" });
        continue;
      }

      // Check 2: Suppression
      if (c.isSuppressed || c.status === "suppressed" || suppressionSet.has(email)) {
        suppressedDetails.push({ email, reason: "Active suppression register / unsubscribe" });
        continue;
      }

      readyCount += 1;
      if (sampleContacts.length < 10) {
        sampleContacts.push({
          id: c.id,
          email,
          firstName: c.firstName || "Alex",
          lastName: c.lastName || "Taylor",
          companyName: c.companyName || "Acme Enterprises",
          industry: c.industry || "Software & AI",
          city: c.city || "San Francisco",
        });
      }
    }

    return {
      totalRecipients: contacts.length,
      suppressedCount: suppressedDetails.length,
      invalidCount: invalidDetails.length,
      readyCount,
      suppressedDetails,
      invalidDetails,
      sampleContacts,
    };
  }

  /**
   * Evaluates if current time falls within allowed sending windows for the configured timezone.
   * Strictly prevents hidden sending outside approved hours.
   */
  public static isWithinSendingWindow(
    schedule: SendingScheduleConfig,
    checkDate = new Date()
  ): { allowed: boolean; reason?: string; localTimeFormatted?: string } {
    try {
      // Format current time into target timezone
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: schedule.timezone || "UTC",
        weekday: "short",
        hour: "numeric",
        hour12: false,
      });

      const parts = formatter.formatToParts(checkDate);
      const weekdayPart = parts.find((p) => p.type === "weekday")?.value as
        | "Mon"
        | "Tue"
        | "Wed"
        | "Thu"
        | "Fri"
        | "Sat"
        | "Sun"
        | undefined;
      const hourPart = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);

      // Check allowed day
      if (weekdayPart && !schedule.allowedDays.includes(weekdayPart)) {
        return {
          allowed: false,
          reason: `Current day '${weekdayPart}' is not in allowed sending days (${schedule.allowedDays.join(", ")}) for timezone ${schedule.timezone}`,
          localTimeFormatted: `${weekdayPart} ${hourPart}:00 (${schedule.timezone})`,
        };
      }

      // Check allowed hour range
      if (hourPart < schedule.allowedHours.start || hourPart >= schedule.allowedHours.end) {
        return {
          allowed: false,
          reason: `Current hour ${hourPart}:00 is outside configured sending window (${schedule.allowedHours.start}:00 - ${schedule.allowedHours.end}:00) for timezone ${schedule.timezone}`,
          localTimeFormatted: `${weekdayPart} ${hourPart}:00 (${schedule.timezone})`,
        };
      }

      return {
        allowed: true,
        localTimeFormatted: `${weekdayPart} ${hourPart}:00 (${schedule.timezone})`,
      };
    } catch (err: unknown) {
      return {
        allowed: false,
        reason: `Timezone calculation error: ${err instanceof Error ? err.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Evaluates sequence state for a prospect and enforces STOP rules:
   * IF reply -> STOP
   * IF unsubscribe -> STOP
   * IF bounced -> STOP
   * IF manually suppressed -> STOP
   */
  public static evaluateSequenceStep(
    progress: LeadSequenceProgress,
    steps: SequenceStep[]
  ): {
    action: "send_next" | "wait" | "stop";
    stopReason?: string;
    stepToSend?: SequenceStep;
    nextStepDueAt?: string;
  } {
    // Stop Rule 1: Reply Received
    if (progress.hasReplied) {
      progress.status = "stopped_reply";
      return { action: "stop", stopReason: "Prospect replied to outreach. Sequence halted immediately." };
    }

    // Stop Rule 2: Unsubscribed
    if (progress.isUnsubscribed) {
      progress.status = "stopped_unsubscribed";
      return { action: "stop", stopReason: "Prospect clicked unsubscribe. Sequence halted." };
    }

    // Stop Rule 3: Bounced
    if (progress.isBounced) {
      progress.status = "stopped_bounced";
      return { action: "stop", stopReason: "Prospect email address bounced. Sequence halted." };
    }

    // Stop Rule 4: Manually Suppressed
    if (progress.isSuppressed) {
      progress.status = "stopped_suppressed";
      return { action: "stop", stopReason: "Prospect exists in active suppression list. Sequence halted." };
    }

    // Check if sequence completed
    if (progress.currentStepIndex >= steps.length) {
      progress.status = "completed";
      return { action: "stop", stopReason: "All sequence steps completed successfully." };
    }

    const currentStep = steps[progress.currentStepIndex];

    // Check if wait delay has elapsed
    if (progress.lastSentAt && (currentStep.delayDays > 0 || currentStep.delayHours > 0)) {
      const lastSentTime = new Date(progress.lastSentAt).getTime();
      const requiredDelayMs = (currentStep.delayDays * 24 * 60 + currentStep.delayHours * 60) * 60 * 1000;
      const dueTime = lastSentTime + requiredDelayMs;
      const now = Date.now();

      if (now < dueTime) {
        return {
          action: "wait",
          nextStepDueAt: new Date(dueTime).toISOString(),
        };
      }
    }

    return {
      action: "send_next",
      stepToSend: currentStep,
    };
  }
}

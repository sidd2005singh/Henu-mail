/**
 * HENU MAIL - Multi-Tier Rate Limiting Engine
 * HENU OS PRIVATE LIMITED
 *
 * Implements hierarchical quota and rate limiting across 5 distinct tiers:
 * 1. Provider Tier (e.g. Gmail 500/2000, Outlook 2000, SMTP server ceiling)
 * 2. Workspace Tier (Tenant daily ceiling configured by workspace admin)
 * 3. Sender Account Tier (Warmup-aware daily & hourly envelope limits)
 * 4. Campaign Tier (Per-campaign throttle to spread deliverability over hours)
 * 5. Safety Burst Tier (Short-interval throttle e.g. 5 msgs/minute to prevent burst flags)
 *
 * Strictly adheres to anti-evasion compliance. Quota backoffs respect provider response.
 */

export interface RateLimitTiers {
  providerLimit: {
    name: string;
    maxDaily: number;
    usedToday: number;
  };
  workspaceLimit: {
    maxDaily: number;
    usedToday: number;
  };
  accountLimit: {
    accountId: string;
    maxDaily: number;
    usedToday: number;
    maxHourly: number;
    usedThisHour: number;
  };
  campaignLimit?: {
    campaignId: string;
    maxHourly: number;
    usedThisHour: number;
  };
  safetyLimit: {
    maxPerMinute: number;
    usedThisMinute: number;
  };
}

export interface RateLimitCheckResult {
  allowed: boolean;
  bottleneckTier?: "provider" | "workspace" | "account_daily" | "account_hourly" | "campaign" | "safety_burst";
  reason?: string;
  delayMsRequired?: number;
  limitsSnapshot: {
    providerRemaining: number;
    workspaceRemaining: number;
    accountDailyRemaining: number;
    accountHourlyRemaining: number;
    campaignHourlyRemaining?: number;
    safetyBurstRemaining: number;
  };
}

export class RateLimiter {
  // In-memory sliding burst counters (In distributed production, Redis keys)
  private static burstCounters = new Map<string, { count: number; windowStart: number }>();

  /**
   * Checks if a dispatch is permitted across all 5 rate tiers.
   */
  public static evaluateLimits(tiers: RateLimitTiers): RateLimitCheckResult {
    const providerRemaining = Math.max(0, tiers.providerLimit.maxDaily - tiers.providerLimit.usedToday);
    const workspaceRemaining = Math.max(0, tiers.workspaceLimit.maxDaily - tiers.workspaceLimit.usedToday);
    const accountDailyRemaining = Math.max(0, tiers.accountLimit.maxDaily - tiers.accountLimit.usedToday);
    const accountHourlyRemaining = Math.max(0, tiers.accountLimit.maxHourly - tiers.accountLimit.usedThisHour);
    const campaignHourlyRemaining = tiers.campaignLimit
      ? Math.max(0, tiers.campaignLimit.maxHourly - tiers.campaignLimit.usedThisHour)
      : undefined;
    const safetyBurstRemaining = Math.max(0, tiers.safetyLimit.maxPerMinute - tiers.safetyLimit.usedThisMinute);

    const snapshot = {
      providerRemaining,
      workspaceRemaining,
      accountDailyRemaining,
      accountHourlyRemaining,
      campaignHourlyRemaining,
      safetyBurstRemaining,
    };

    // 1. Check Provider Quota
    if (providerRemaining <= 0) {
      return {
        allowed: false,
        bottleneckTier: "provider",
        reason: `Provider daily quota exceeded (${tiers.providerLimit.usedToday}/${tiers.providerLimit.maxDaily} sent). Reset at midnight UTC.`,
        limitsSnapshot: snapshot,
        delayMsRequired: 3600000,
      };
    }

    // 2. Check Workspace Quota
    if (workspaceRemaining <= 0) {
      return {
        allowed: false,
        bottleneckTier: "workspace",
        reason: `Workspace daily safety ceiling reached (${tiers.workspaceLimit.usedToday}/${tiers.workspaceLimit.maxDaily}).`,
        limitsSnapshot: snapshot,
        delayMsRequired: 3600000,
      };
    }

    // 3. Check Account Daily Quota (Account/Warmup limit)
    if (accountDailyRemaining <= 0) {
      return {
        allowed: false,
        bottleneckTier: "account_daily",
        reason: `Account daily limit reached (${tiers.accountLimit.usedToday}/${tiers.accountLimit.maxDaily}).`,
        limitsSnapshot: snapshot,
        delayMsRequired: 3600000,
      };
    }

    // 4. Check Account Hourly Quota
    if (accountHourlyRemaining <= 0) {
      return {
        allowed: false,
        bottleneckTier: "account_hourly",
        reason: `Account hourly pacing limit reached (${tiers.accountLimit.usedThisHour}/${tiers.accountLimit.maxHourly} in current hour).`,
        limitsSnapshot: snapshot,
        delayMsRequired: 600000, // 10 minutes delay
      };
    }

    // 5. Check Campaign Pacing Limit
    if (campaignHourlyRemaining !== undefined && campaignHourlyRemaining <= 0) {
      return {
        allowed: false,
        bottleneckTier: "campaign",
        reason: `Campaign hourly throttle reached (${tiers.campaignLimit!.usedThisHour}/${tiers.campaignLimit!.maxHourly}).`,
        limitsSnapshot: snapshot,
        delayMsRequired: 300000,
      };
    }

    // 6. Check Safety Burst Limit
    if (safetyBurstRemaining <= 0) {
      return {
        allowed: false,
        bottleneckTier: "safety_burst",
        reason: `Safety burst throttle: Exceeded ${tiers.safetyLimit.maxPerMinute} emails/minute for account to protect IP reputation.`,
        limitsSnapshot: snapshot,
        delayMsRequired: 15000, // 15s delay
      };
    }

    return {
      allowed: true,
      limitsSnapshot: snapshot,
    };
  }

  /**
   * Tracks a burst dispatch for an account.
   */
  public static recordBurst(accountId: string, maxPerMinute = 10): { allowed: boolean; waitMs: number } {
    const now = Date.now();
    const entry = this.burstCounters.get(accountId) || { count: 0, windowStart: now };

    if (now - entry.windowStart > 60000) {
      // New 1-minute window
      this.burstCounters.set(accountId, { count: 1, windowStart: now });
      return { allowed: true, waitMs: 0 };
    }

    if (entry.count >= maxPerMinute) {
      const waitMs = Math.max(1000, 60000 - (now - entry.windowStart));
      return { allowed: false, waitMs };
    }

    entry.count += 1;
    this.burstCounters.set(accountId, entry);
    return { allowed: true, waitMs: 0 };
  }
}

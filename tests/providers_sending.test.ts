import { describe, it, expect, beforeEach } from "vitest";
import { encryptToken, decryptToken } from "../src/lib/crypto/encryption";
import { GmailProvider } from "../src/lib/providers/gmail-provider";
import { ProviderRegistry } from "../src/lib/providers/provider-registry";
import { RateLimiter, RateLimitTiers } from "../src/lib/queue/rate-limiter";
import { DispatcherEngine, QueueJob } from "../src/lib/queue/dispatcher-engine";

describe("Prompt 5: Gmail OAuth + Provider Abstraction + Sending Engine", () => {
  // -------------------------------------------------------------
  // 1. AES-256-GCM Token Cryptography Tests
  // -------------------------------------------------------------
  describe("Token Cryptography & Security", () => {
    it("should encrypt and decrypt OAuth access and refresh tokens without loss", () => {
      const sampleRefreshToken = "1//04abCD_xyz123_GoogleRefreshTokenPayloadLongString_987654321";
      const encrypted = encryptToken(sampleRefreshToken);

      expect(encrypted).not.toBe(sampleRefreshToken);
      expect(encrypted).toContain(":"); // Format: iv:tag:ciphertext
      expect(encrypted.split(":").length).toBe(3);

      const decrypted = decryptToken(encrypted);
      expect(decrypted).toBe(sampleRefreshToken);
    });

    it("should reject corrupted or tampered encrypted payloads", () => {
      const sample = "my-secret-token";
      const encrypted = encryptToken(sample);
      const parts = encrypted.split(":");
      // Tamper ciphertext
      const tampered = `${parts[0]}:${parts[1]}:deadbeef`;

      expect(() => decryptToken(tampered)).toThrow();
    });

    it("should return empty string on blank token inputs", () => {
      expect(encryptToken("")).toBe("");
      expect(decryptToken("")).toBe("");
    });
  });

  // -------------------------------------------------------------
  // 2. Gmail Provider & OAuth Architecture
  // -------------------------------------------------------------
  describe("Gmail Provider & RFC 2822 Compilation", () => {
    it("should generate proper Google OAuth 2.0 authorization URL with offline consent", () => {
      const authUrl = GmailProvider.getAuthorizationUrl(
        "test-client-id.apps.googleusercontent.com",
        "https://mail.henuos.com/callback",
        "test-state-nonce"
      );

      expect(authUrl).toContain("https://accounts.google.com/o/oauth2/v2/auth");
      expect(authUrl).toContain("access_type=offline");
      expect(authUrl).toContain("prompt=consent");
      expect(authUrl).toContain("gmail.send");
      expect(authUrl).toContain("test-state-nonce");
    });

    it("should construct valid RFC 2822 MIME message with headers, plain text and HTML", () => {
      const mime = GmailProvider.buildMimeMessage({
        to: "recipient@example.com",
        toName: "Jane Doe",
        from: "sender@henuos.com",
        fromName: "HENU Dispatch",
        subject: "Q4 Enterprise Proposal",
        htmlContent: "<p>Hello Jane, welcome to HENU OS.</p>",
        textContent: "Hello Jane, welcome to HENU OS.",
        unsubscribeUrl: "https://mail.henuos.com/unsub",
        campaignId: "cmp-001",
      });

      expect(mime).toContain('From: "HENU Dispatch" <sender@henuos.com>');
      expect(mime).toContain('To: "Jane Doe" <recipient@example.com>');
      expect(mime).toContain("Subject: =?UTF-8?B?");
      expect(mime).toContain("List-Unsubscribe: <https://mail.henuos.com/unsub>");
      expect(mime).toContain("X-HENU-Campaign-ID: cmp-001");
      expect(mime).toContain("multipart/alternative");
    });

    it("should correctly encode MIME string to Google base64url without forbidden characters", () => {
      const raw = "Sample email message text with + and / characters";
      const base64Url = GmailProvider.toBase64Url(raw);

      expect(base64Url).not.toContain("+");
      expect(base64Url).not.toContain("/");
      expect(base64Url).not.toContain("=");
    });

    it("should classify Google rate limit and quota errors with exponential backoff advice", () => {
      const provider = new GmailProvider({
        accountId: "acc-1",
        clientId: "cid",
        clientSecret: "sec",
        redirectUri: "uri",
        credentials: { accessToken: "tok", expiresAt: Date.now() + 10000 },
        accountEmail: "outreach@henuos.com",
      });

      const rateLimitErr = {
        status: 429,
        data: { error: { message: "User rate limit exceeded", errors: [{ reason: "userRateLimitExceeded" }] } },
      };

      const classified = provider.classifyError(rateLimitErr);
      expect(classified.errorClass).toBe("rate_limit");
      expect(classified.retryable).toBe(true);
      expect(classified.retryAfterSeconds).toBeGreaterThan(0);
    });

    it("should classify revoked tokens as non-retryable auth errors", () => {
      const provider = new GmailProvider({
        accountId: "acc-1",
        clientId: "cid",
        clientSecret: "sec",
        redirectUri: "uri",
        credentials: { accessToken: "tok", expiresAt: Date.now() + 10000 },
        accountEmail: "outreach@henuos.com",
      });

      const authErr = {
        status: 401,
        data: { error: { message: "invalid_grant: Token has been expired or revoked." } },
      };

      const classified = provider.classifyError(authErr);
      expect(classified.errorClass).toBe("auth");
      expect(classified.retryable).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 3. Multi-Tier Rate Limiter Tests
  // -------------------------------------------------------------
  describe("Multi-Tier Rate Limiting", () => {
    const baseTiers: RateLimitTiers = {
      providerLimit: { name: "Gmail Workspace", maxDaily: 2000, usedToday: 100 },
      workspaceLimit: { maxDaily: 5000, usedToday: 200 },
      accountLimit: { accountId: "acc-1", maxDaily: 400, usedToday: 50, maxHourly: 60, usedThisHour: 10 },
      campaignLimit: { campaignId: "cmp-1", maxHourly: 50, usedThisHour: 5 },
      safetyLimit: { maxPerMinute: 10, usedThisMinute: 2 },
    };

    it("should allow sending when all tiers are within limits", () => {
      const res = RateLimiter.evaluateLimits(baseTiers);
      expect(res.allowed).toBe(true);
      expect(res.bottleneckTier).toBeUndefined();
    });

    it("should block when provider daily quota is reached", () => {
      const tiers = {
        ...baseTiers,
        providerLimit: { ...baseTiers.providerLimit, usedToday: 2000 },
      };
      const res = RateLimiter.evaluateLimits(tiers);
      expect(res.allowed).toBe(false);
      expect(res.bottleneckTier).toBe("provider");
      expect(res.reason).toContain("Provider daily quota exceeded");
    });

    it("should block when account hourly limit is reached", () => {
      const tiers = {
        ...baseTiers,
        accountLimit: { ...baseTiers.accountLimit, usedThisHour: 60 },
      };
      const res = RateLimiter.evaluateLimits(tiers);
      expect(res.allowed).toBe(false);
      expect(res.bottleneckTier).toBe("account_hourly");
      expect(res.reason).toContain("Account hourly pacing limit reached");
    });

    it("should block when safety burst limit is hit", () => {
      const tiers = {
        ...baseTiers,
        safetyLimit: { maxPerMinute: 10, usedThisMinute: 10 },
      };
      const res = RateLimiter.evaluateLimits(tiers);
      expect(res.allowed).toBe(false);
      expect(res.bottleneckTier).toBe("safety_burst");
    });
  });

  // -------------------------------------------------------------
  // 4. Pre-Flight Safety Checks & Sending Engine
  // -------------------------------------------------------------
  describe("Dispatcher Engine & Pre-Flight Safety Checks", () => {
    const validJob: QueueJob = {
      jobId: "job-101",
      campaignId: "cmp-500",
      recipientId: "rec-1",
      workspaceId: "ws-1",
      providerAccountId: "acc-gmail-01",
      recipient: {
        email: "alex.prospect@enterprise.com",
        firstName: "Alex",
        companyName: "Acme Corp",
      },
      template: {
        subject: "HENU OS Solutions for {{company_name}}",
        htmlContent: "<p>Hi {{first_name}}, please review our proposal.</p>",
      },
      sender: {
        email: "growth@henuos.com",
        displayName: "HENU Growth",
      },
      status: "pending",
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const emptySuppression = new Set<string>();
    const nominalTiers: RateLimitTiers = {
      providerLimit: { name: "Gmail", maxDaily: 500, usedToday: 10 },
      workspaceLimit: { maxDaily: 5000, usedToday: 10 },
      accountLimit: { accountId: "acc-1", maxDaily: 500, usedToday: 10, maxHourly: 50, usedThisHour: 5 },
      safetyLimit: { maxPerMinute: 10, usedThisMinute: 1 },
    };

    beforeEach(() => {
      DispatcherEngine.resumeGlobalSending();
    });

    it("should pass pre-flight safety check with clean recipient and auto-inject unsubscribe", () => {
      const check = DispatcherEngine.verifyPreFlightSafety(validJob, emptySuppression, nominalTiers);

      expect(check.passed).toBe(true);
      expect(check.renderedSubject).toBe("HENU OS Solutions for Acme Corp");
      expect(check.renderedHtml).toContain("Hi Alex");
      expect(check.renderedHtml).toContain("Unsubscribe"); // Auto-injected unsubscribe mechanism
    });

    it("should reject invalid recipient email format", () => {
      const badJob = {
        ...validJob,
        recipient: { ...validJob.recipient, email: "not-a-valid-email" },
      };
      const check = DispatcherEngine.verifyPreFlightSafety(badJob, emptySuppression, nominalTiers);

      expect(check.passed).toBe(false);
      expect(check.errorClass).toBe("invalid_recipient");
    });

    it("should reject recipients on active suppression list", () => {
      const suppressedList = new Set(["alex.prospect@enterprise.com"]);
      const check = DispatcherEngine.verifyPreFlightSafety(validJob, suppressedList, nominalTiers);

      expect(check.passed).toBe(false);
      expect(check.errorClass).toBe("suppressed");
      expect(check.blockReason).toContain("suppression");
    });

    it("should immediately block sending when Emergency Killswitch is engaged", () => {
      DispatcherEngine.triggerEmergencyPause("Manual operator shutdown");

      const check = DispatcherEngine.verifyPreFlightSafety(validJob, emptySuppression, nominalTiers);
      expect(check.passed).toBe(false);
      expect(check.blockReason).toContain("Global Sending Killswitch Active");

      DispatcherEngine.resumeGlobalSending();
      const checkAfterResume = DispatcherEngine.verifyPreFlightSafety(validJob, emptySuppression, nominalTiers);
      expect(checkAfterResume.passed).toBe(true);
    });

    it("should calculate controlled exponential backoff with jitter", () => {
      const backoffAttempt1 = DispatcherEngine.calculateBackoff(1, 30);
      const backoffAttempt2 = DispatcherEngine.calculateBackoff(2, 30);
      const backoffAttempt3 = DispatcherEngine.calculateBackoff(3, 30);

      expect(backoffAttempt1).toBeGreaterThanOrEqual(30);
      expect(backoffAttempt2).toBeGreaterThan(backoffAttempt1);
      expect(backoffAttempt3).toBeGreaterThan(backoffAttempt2);
    });

    it("should handle campaign lifecycle transitions", () => {
      const startRes = DispatcherEngine.setCampaignStatus("cmp-test-1", "sending");
      expect(startRes.newStatus).toBe("sending");

      const pauseRes = DispatcherEngine.setCampaignStatus("cmp-test-1", "paused");
      expect(pauseRes.newStatus).toBe("paused");
      expect(DispatcherEngine.getCampaignStatus("cmp-test-1")).toBe("paused");

      const cancelRes = DispatcherEngine.setCampaignStatus("cmp-test-1", "cancelled");
      expect(cancelRes.newStatus).toBe("cancelled");
    });
  });
});

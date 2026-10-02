/**
 * HENU MAIL - Failure Mode & Production Edge Case Test Suite
 * HENU OS PRIVATE LIMITED
 *
 * Verifies that the platform fails safely, isolates errors, and never leaks sensitive data.
 */

import { describe, it, expect } from "vitest";
import { GmailProvider } from "../src/lib/providers/gmail-provider";
import { formatSafeError, sanitizeInput } from "../src/lib/errors/error-handler";
import { RateLimiter, RateLimitTiers } from "../src/lib/queue/rate-limiter";
import { DispatcherEngine, QueueJob } from "../src/lib/queue/dispatcher-engine";
import { cleanAndValidateDataset } from "../src/lib/importer/cleaner-validator";
import { hasPermission } from "../src/lib/rbac/permissions";

describe("Prompt 8: Failure Testing & Safe Degradation", () => {
  // 1. Provider & OAuth Failures
  describe("Provider & Token Failure Modes", () => {
    const provider = new GmailProvider({
      accountId: "acc-fail",
      clientId: "cid",
      clientSecret: "sec",
      redirectUri: "uri",
      credentials: { accessToken: "tok", expiresAt: Date.now() + 10000 },
      accountEmail: "outreach@henuos.com",
    });

    it("should classify revoked / invalid OAuth grant as non-retryable auth error", () => {
      const authRevokedErr = {
        status: 401,
        data: { error: { message: "invalid_grant: Token has been revoked." } },
      };

      const classified = provider.classifyError(authRevokedErr);
      expect(classified.errorClass).toBe("auth");
      expect(classified.retryable).toBe(false);
    });

    it("should classify 429 quota errors with controlled backoff advice", () => {
      const quotaErr = {
        status: 429,
        data: { error: { message: "User rate limit exceeded", errors: [{ reason: "userRateLimitExceeded" }] } },
      };

      const classified = provider.classifyError(quotaErr);
      expect(classified.errorClass).toBe("rate_limit");
      expect(classified.retryable).toBe(true);
      expect(classified.retryAfterSeconds).toBeGreaterThan(0);
    });

    it("should classify 5xx Google server errors as temporary retryable exceptions", () => {
      const serverErr = {
        status: 503,
        data: { error: { message: "Backend error" } },
      };

      const classified = provider.classifyError(serverErr);
      expect(classified.errorClass).toBe("temporary");
      expect(classified.retryable).toBe(true);
    });
  });

  // 2. Data & Ingestion Edge Cases
  describe("Ingestion & Malformed Data Edge Cases", () => {
    it("should safely drop malformed emails and whitespace garbage", () => {
      const rawRows = [
        { email: "   ", name: "Empty" },
        { email: "not-an-email", name: "Malformed" },
        { email: "user@domain..com", name: "Double Dot" },
        { email: "@missingusername.com", name: "Missing User" },
      ];

      const res = cleanAndValidateDataset(rawRows, { email: "email", first_name: "name" }, new Set());
      expect(res.validRecords.length).toBe(0);
      expect(res.invalidCount).toBe(4);
    });

    it("should automatically screen out suppressed emails before send", () => {
      const suppressionSet = new Set(["optout@company.com"]);
      const rawRows = [
        { email: "optout@company.com", name: "Opted Out" },
        { email: "valid@company.com", name: "Valid" },
      ];

      const res = cleanAndValidateDataset(rawRows, { email: "email", first_name: "name" }, suppressionSet);
      expect(res.validRecords.length).toBe(1);
      expect(res.suppressedCount).toBe(1);
      expect(res.validRecords[0].email).toBe("valid@company.com");
    });
  });

  // 3. Security & Information Leakage Prevention
  describe("Security & Information Leakage Prevention", () => {
    it("should never expose internal filesystem paths or DB passwords in error responses", async () => {
      const rawError = new Error("Connection failed at J:\\HENU MAIL\\node_modules\\pg\\lib\\connection.js with pass: SuperSecret123!");
      const res = formatSafeError(rawError);
      const json = await res.json();

      expect(json.success).toBe(false);
      expect(json.error).not.toContain("SuperSecret123!");
      expect(json.error).not.toContain("J:\\HENU MAIL");
      expect(json.requestId).toBeDefined();
    });

    it("should neutralize script and onload XSS vectors", () => {
      const xssVector = '<svg onload=alert("XSS")><script>document.cookie</script>';
      const sanitized = sanitizeInput(xssVector);

      expect(sanitized).not.toContain("<svg");
      expect(sanitized).not.toContain("<script");
      expect(sanitized).toContain("&lt;svg");
    });

    it("should deny viewer role from modifying system settings or launching campaigns", () => {
      expect(hasPermission("viewer", "system_settings:edit")).toBe(false);
      expect(hasPermission("viewer", "campaigns:create")).toBe(false);
      expect(hasPermission("viewer", "campaigns:edit")).toBe(false);
      expect(hasPermission("viewer", "team:manage")).toBe(false);
    });
  });
});

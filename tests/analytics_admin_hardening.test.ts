import { describe, it, expect } from "vitest";
import { AnalyticsService } from "../src/lib/analytics/analytics-service";
import { formatSafeError, sanitizeInput } from "../src/lib/errors/error-handler";

describe("Prompt 7: Analytics + Admin + Team Management + Production Hardening", () => {
  // -------------------------------------------------------------
  // 1. Analytics Aggregation & Date Filtering
  // -------------------------------------------------------------
  describe("Analytics Telemetry & Date Range Engine", () => {
    it("should compute accurate aggregates for 7-day range", () => {
      const data = AnalyticsService.getAnalytics("7d", "Asia/Kolkata");

      expect(data.hasData).toBe(true);
      expect(data.range).toBe("7d");
      expect(data.overview.totalMessages).toBeGreaterThan(0);
      expect(data.overview.deliverySuccessRate).toBeGreaterThan(95);
      expect(data.overview.replyRate).toBeGreaterThan(0);
      expect(data.timeSeries.length).toBe(7);
      expect(data.providerAnalytics.length).toBeGreaterThanOrEqual(3);
    });

    it("should support 'today' and 'yesterday' hourly time series", () => {
      const todayData = AnalyticsService.getAnalytics("today", "Asia/Kolkata");
      expect(todayData.range).toBe("today");
      expect(todayData.timeSeries.length).toBe(5);

      const yesterdayData = AnalyticsService.getAnalytics("yesterday", "Asia/Kolkata");
      expect(yesterdayData.range).toBe("yesterday");
      expect(yesterdayData.timeSeries.length).toBe(4);
    });

    it("should return clean empty state without fake numbers when dataset is empty", () => {
      const empty = AnalyticsService.getEmptyDataset("7d", "UTC");

      expect(empty.hasData).toBe(false);
      expect(empty.overview.totalMessages).toBe(0);
      expect(empty.overview.successfulSends).toBe(0);
      expect(empty.overview.replies).toBe(0);
      expect(empty.timeSeries.length).toBe(0);
      expect(empty.campaignComparison.length).toBe(0);
    });
  });

  // -------------------------------------------------------------
  // 2. Production Security & Error Sanitization
  // -------------------------------------------------------------
  describe("Production Hardening & Error Sanitization", () => {
    it("should sanitize errors containing DB credentials or secret tokens", async () => {
      const sensitiveError = new Error("FATAL: password authentication failed for user postgres at DATABASE_URL:5432");
      const res = formatSafeError(sensitiveError);
      const json = await res.json();

      expect(json.success).toBe(false);
      expect(json.error).not.toContain("password");
      expect(json.error).not.toContain("DATABASE_URL");
      expect(json.error).toContain("secure database exception");
      expect(json.requestId).toBeDefined();
    });

    it("should preserve clean user-friendly validation error messages", async () => {
      const cleanError = new Error("Campaign name must contain at least 3 characters.");
      const res = formatSafeError(cleanError);
      const json = await res.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe("Campaign name must contain at least 3 characters.");
    });

    it("should escape XSS payloads and script tags in user inputs", () => {
      const malicious = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';
      const sanitized = sanitizeInput(malicious);

      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("<img");
      expect(sanitized).toContain("&lt;script&gt;");
      expect(sanitized).toContain("&lt;img");
    });
  });
});

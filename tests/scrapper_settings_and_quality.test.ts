// HENU MAIL / HENU SCRAPPER - Settings, API Management, Quality Gate & Multi-User Tests
// Organization: HENU OS Private Limited

import { describe, it, expect } from "vitest";
import {
  validateCin,
  validateEmailSyntax,
  normalizePhone,
  normalizeUrl,
  evaluateContactQualityGate,
} from "@/lib/scrapper/quality-gate";
import { hasPermission } from "@/lib/rbac/permissions";
import { Company } from "@/types/scrapper";
import { DiscoveredContact } from "@/lib/scrapper/types";

describe("HENU SCRAPPER - Deterministic Data Quality Rules", () => {
  it("should validate valid and invalid Indian Corporate Identity Numbers (CIN)", () => {
    // Valid 21-char CINs
    const valid1 = validateCin("U72200DL2021PTC384912");
    const valid2 = validateCin("L17110MH1973PLC019786");
    expect(valid1.isValid).toBe(true);
    expect(valid2.isValid).toBe(true);
    expect(valid1.errors.length).toBe(0);

    // Invalid CINs
    const invalidShort = validateCin("U72200DL2021PTC");
    const invalidFormat = validateCin("INVALID_CIN_1234567890123");
    expect(invalidShort.isValid).toBe(false);
    expect(invalidFormat.isValid).toBe(false);
    expect(invalidShort.errors.length).toBeGreaterThan(0);
  });

  it("should validate email syntax strictly", () => {
    expect(validateEmailSyntax("vikram.m@henutech.com").isValid).toBe(true);
    expect(validateEmailSyntax("ananya+scrapper@aura-pharma.in").isValid).toBe(true);

    expect(validateEmailSyntax("invalid-email@").isValid).toBe(false);
    expect(validateEmailSyntax("user@.com").isValid).toBe(false);
    expect(validateEmailSyntax("user..name@domain.com").isValid).toBe(false);
  });

  it("should normalize Indian phone numbers to standard format", () => {
    const norm1 = normalizePhone("9811044210");
    expect(norm1.isValid).toBe(true);
    expect(norm1.normalizedValue).toBe("+91 98110 44210");

    const norm2 = normalizePhone("+919820199310");
    expect(norm2.isValid).toBe(true);
    expect(norm2.normalizedValue).toBe("+91 98201 99310");
  });

  it("should normalize web URLs with HTTPS protocols", () => {
    const url1 = normalizeUrl("henutech.com");
    expect(url1.isValid).toBe(true);
    expect(url1.normalizedValue).toBe("https://henutech.com");

    const url2 = normalizeUrl("https://aurapharma.in/about///");
    expect(url2.isValid).toBe(true);
    expect(url2.normalizedValue).toBe("https://aurapharma.in/about");
  });
});

describe("HENU SCRAPPER - Contact Quality Gate", () => {
  const mockCompany: Company = {
    id: "comp-001",
    workspaceId: "ws-1",
    cin: "U72200DL2021PTC384912",
    originalCompanyName: "HENU TECH VENTURES PRIVATE LIMITED",
    verifiedCompanyName: "Henu Tech Ventures Pvt Ltd",
    verificationStatus: "verified",
    verificationConfidence: 0.94,
    companyStatus: "ACTIVE",
    researchStatus: "COMPLETED",
    directorCount: 2,
    contactCount: 2,
    evidenceCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockContact: DiscoveredContact = {
    value: "vikram.m@henutech.com",
    type: "email",
    personName: "Vikram Malhotra",
    source: "MCA Registry Imprint",
    sourceUrl: "https://mca.gov.in",
    evidence: "Signatory email registered with RoC Delhi",
    confidence: "HIGH",
    confidenceScore: 0.95,
    verificationStatus: "VERIFIED",
    discoveredTimestamp: new Date().toISOString(),
    isInferred: false,
  };

  it("should approve verified contact when all 7 quality criteria pass", () => {
    const evalResult = evaluateContactQualityGate(mockCompany, mockContact);
    expect(evalResult.isEligible).toBe(true);
    expect(evalResult.rejectionReasons.length).toBe(0);
    expect(evalResult.checks.companyIdentityValidated).toBe(true);
    expect(evalResult.checks.suppressionCleared).toBe(true);
  });

  it("should reject contact if present on global suppression list", () => {
    const suppressed = new Set(["vikram.m@henutech.com"]);
    const evalResult = evaluateContactQualityGate(mockCompany, mockContact, suppressed);

    expect(evalResult.isEligible).toBe(false);
    expect(evalResult.checks.suppressionCleared).toBe(false);
    expect(evalResult.rejectionReasons).toContain(
      "Email address is present on HENU MAIL global suppression/opt-out list."
    );
  });

  it("should reject contact if company identity is unverified or flagged", () => {
    const unverifiedCompany: Company = {
      ...mockCompany,
      verificationStatus: "flagged_mismatch",
    };

    const evalResult = evaluateContactQualityGate(unverifiedCompany, mockContact);
    expect(evalResult.isEligible).toBe(false);
    expect(evalResult.checks.companyIdentityValidated).toBe(false);
  });
});

describe("HENU SCRAPPER - Multi-User Granular RBAC Permissions", () => {
  it("should grant scrapper settings and api manage permissions to admin and owner only", () => {
    expect(hasPermission("owner", "scrapper:settings")).toBe(true);
    expect(hasPermission("owner", "scrapper:api_manage")).toBe(true);
    expect(hasPermission("owner", "scrapper:delete")).toBe(true);

    expect(hasPermission("admin", "scrapper:settings")).toBe(true);
    expect(hasPermission("admin", "scrapper:api_manage")).toBe(true);
    expect(hasPermission("admin", "scrapper:delete")).toBe(true);

    expect(hasPermission("campaign_manager", "scrapper:settings")).toBe(false);
    expect(hasPermission("campaign_manager", "scrapper:api_manage")).toBe(false);
    expect(hasPermission("campaign_manager", "scrapper:delete")).toBe(false);
  });

  it("should allow campaign managers to review and export to campaigns", () => {
    expect(hasPermission("campaign_manager", "scrapper:review")).toBe(true);
    expect(hasPermission("campaign_manager", "scrapper:campaign_export")).toBe(true);
    expect(hasPermission("campaign_manager", "scrapper:pause")).toBe(true);
  });
});

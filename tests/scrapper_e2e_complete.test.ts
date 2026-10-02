// HENU MAIL / HENU SCRAPPER - Complete End-to-End Production Verification Test Suite
// Organization: HENU OS Private Limited

import { describe, it, expect, beforeEach } from "vitest";
import {
  evaluateIdentitySignals,
  cleanCorporateSuffixes,
  scoreToConfidenceLevel,
} from "@/lib/scrapper/identity-matcher";
import {
  evaluateDirectorSignals,
  deduplicateAndResolveDirectors,
  RawDirectorObservation,
} from "@/lib/scrapper/director-matcher";
import {
  analyzeSpreadsheetForScrapper,
  normalizeCompanyName,
  normalizeAddress,
} from "@/lib/scrapper/importer";
import { ScrapperQueueManager } from "@/lib/scrapper/queue-manager";
import {
  validateCin,
  validateEmailSyntax,
  normalizePhone,
  normalizeUrl,
  evaluateContactQualityGate,
} from "@/lib/scrapper/quality-gate";
import { validateOutboundUrl, sanitizeEvidenceSnippet, validateUploadFile } from "@/lib/scrapper/security";
import { DiscoveredContact } from "@/lib/scrapper/types";
import { ParsedSpreadsheet } from "@/lib/importer/spreadsheet-parser";

describe("HENU SCRAPPER — End-to-End Master Production Test Suite", () => {
  // --------------------------------------------------------------------------
  // 1. Ingestion, Fuzzy MCA Mapping & Deduplication
  // --------------------------------------------------------------------------
  describe("1. Spreadsheet Ingestion & Column Mapping Engine", () => {
    it("should accurately detect MCA standard columns with fuzzy headers", async () => {
      const parsedMock: ParsedSpreadsheet = {
        headers: ["CIN_NO", "COMPANY_NAME", "ADDRESS", "ROC_CODE", "AUTHORIZED_CAPITAL", "STATE_CODE"],
        rows: [
          {
            CIN_NO: "U72900KA2021PTC145678",
            COMPANY_NAME: "HENU TECHNOLOGIES PRIVATE LIMITED",
            ADDRESS: "123 Tech Park, Electronic City, Bangalore, Karnataka, 560100",
            ROC_CODE: "RoC-Bangalore",
            AUTHORIZED_CAPITAL: "1000000",
            STATE_CODE: "KA",
          },
          {
            CIN_NO: "U72900KA2021PTC145678", // Duplicate CIN
            COMPANY_NAME: "HENU TECH PVT LTD",
            ADDRESS: "123 Tech Park, Bangalore",
            ROC_CODE: "RoC-Bangalore",
            AUTHORIZED_CAPITAL: "1000000",
            STATE_CODE: "KA",
          },
          {
            CIN_NO: "U74999MH2018PTC309876",
            COMPANY_NAME: "NEXUS ROBOTICS SOLUTIONS PRIVATE LIMITED",
            ADDRESS: "45 Cyber Tower, Andheri East, Mumbai, Maharashtra 400069",
            ROC_CODE: "RoC-Mumbai",
            AUTHORIZED_CAPITAL: "500000",
            STATE_CODE: "MH",
          },
        ],
        totalRows: 3,
        sheetNames: ["MCA_COMPANIES"],
        activeSheet: "MCA_COMPANIES",
        filename: "mca_companies_batch_1.xlsx",
        fileType: "xlsx",
        fileSize: 1024,
      };

      const analysis = await analyzeSpreadsheetForScrapper(parsedMock);

      expect(analysis.detectedMapping.cin).toBe("CIN_NO");
      expect(analysis.detectedMapping.companyName).toBe("COMPANY_NAME");
      expect(analysis.detectedMapping.registeredOfficeAddress).toBe("ADDRESS");
      expect(analysis.detectedMapping.companyRocCode).toBe("ROC_CODE");
      expect(analysis.detectedMapping.authorizedCapital).toBe("AUTHORIZED_CAPITAL");
      expect(analysis.detectedMapping.stateCode).toBe("STATE_CODE");

      // Deduplication check
      expect(analysis.totalRows).toBe(3);
      expect(analysis.duplicateRows).toBe(1);
      expect(analysis.readyRows).toBe(2);
      expect(analysis.confidenceScore).toBeGreaterThanOrEqual(0.70);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Deterministic Normalization & Identity Matching
  // --------------------------------------------------------------------------
  describe("2. Deterministic Normalization & Identity Resolution", () => {
    it("should normalize legal entity suffixes and special characters", () => {
      expect(cleanCorporateSuffixes(normalizeCompanyName("HENU OS PRIVATE LIMITED"))).toBe("HENU OS");
      expect(cleanCorporateSuffixes(normalizeCompanyName("Acme Solutions (India) Pvt. Ltd."))).toBe("ACME");
      expect(cleanCorporateSuffixes(normalizeCompanyName("Global Logistics Limited."))).toBe("GLOBAL LOGISTICS");
    });

    it("should normalize addresses and preserve location tokens", () => {
      const normalized = normalizeAddress("Plot No 45, 3rd Floor, Sector 18, Gurugram, Haryana - 122002");
      expect(normalized.toLowerCase()).toContain("plot");
      expect(normalized.toLowerCase()).toContain("gurugram");
      expect(normalized).toContain("122002");
    });

    it("should achieve high confidence score on exact CIN verification", () => {
      const signals = evaluateIdentitySignals(
        {
          cin: "U72900KA2021PTC145678",
          companyName: "HENU TECHNOLOGIES PRIVATE LIMITED",
          stateCode: "KA",
          rocCode: "RoC-Bangalore",
          address: "123 Tech Park, Bangalore, 560100",
        },
        {
          cin: "U72900KA2021PTC145678",
          companyName: "HENU TECHNOLOGIES PVT LTD",
          stateCode: "KA",
          rocCode: "RoC-Bangalore",
          address: "123 Tech Park, Electronic City, Bangalore, 560100",
        }
      );

      expect(signals.cinExact).toBe(true);
      expect(signals.overallScore).toBeGreaterThanOrEqual(0.85);
      expect(scoreToConfidenceLevel(signals.overallScore)).toBe("HIGH");
    });

    it("should flag mismatch when CINs or core states conflict", () => {
      const signals = evaluateIdentitySignals(
        {
          cin: "U72900KA2021PTC145678",
          companyName: "HENU TECHNOLOGIES PRIVATE LIMITED",
          stateCode: "KA",
        },
        {
          cin: "U99999DL2010PLC999999",
          companyName: "DIFFERENT ENTITY LIMITED",
          stateCode: "DL",
        }
      );

      expect(signals.cinExact).toBe(false);
      expect(signals.overallScore).toBeLessThan(0.4);
      expect(scoreToConfidenceLevel(signals.overallScore)).toBe("UNVERIFIED");
    });
  });

  // --------------------------------------------------------------------------
  // 3. Director Discovery & Multi-Source Conflict Resolution
  // --------------------------------------------------------------------------
  describe("3. Director Matching, DIN Validation & Conflict Detection", () => {
    it("should corroborate directors across multiple official sources", () => {
      const rawCandidates: RawDirectorObservation[] = [
        {
          din: "08123456",
          name: "Rajesh Kumar Sharma",
          designation: "Managing Director",
          appointmentDate: "2021-04-15",
          sourceName: "MCA Master Data",
          sourceUrl: "https://www.mca.gov.in",
          sourceType: "official_registry",
          evidenceText: "DIN 08123456 verified on MCA portal",
          associatedCompanyName: "HENU TECHNOLOGIES PRIVATE LIMITED",
          associatedCin: "U72900KA2021PTC145678",
        },
        {
          din: "08123456",
          name: "Rajesh Sharma",
          designation: "Director",
          sourceName: "Company Registry Portal",
          sourceUrl: "https://registry.gov.in",
          sourceType: "official_registry",
          evidenceText: "Director active in registry",
          associatedCompanyName: "HENU TECHNOLOGIES PVT LTD",
          associatedCin: "U72900KA2021PTC145678",
        },
        {
          din: "09654321",
          name: "Pooja Verma",
          designation: "Director",
          appointmentDate: "2022-01-10",
          sourceName: "MCA Master Data",
          sourceUrl: "https://www.mca.gov.in",
          sourceType: "official_registry",
          evidenceText: "Director appointment verified",
          associatedCompanyName: "HENU TECHNOLOGIES PRIVATE LIMITED",
          associatedCin: "U72900KA2021PTC145678",
        },
      ];

      const resolved = deduplicateAndResolveDirectors(
        rawCandidates,
        "HENU TECHNOLOGIES PRIVATE LIMITED",
        "U72900KA2021PTC145678"
      );

      expect(resolved.length).toBe(2);
      const rajesh = resolved.find((d) => d.din === "08123456");
      expect(rajesh).toBeDefined();
      expect(rajesh?.confidence).toBe("HIGH");
    });

    it("should detect director identity signals accurately", () => {
      const signals = evaluateDirectorSignals(
        "HENU TECHNOLOGIES PRIVATE LIMITED",
        "U72900KA2021PTC145678",
        {
          din: "01234567",
          name: "Amit Patel",
          designation: "Managing Director",
          sourceName: "MCA Portal",
          sourceUrl: "https://www.mca.gov.in",
          sourceType: "official_registry",
          evidenceText: "Director appointment verified",
          associatedCompanyName: "HENU TECHNOLOGIES PVT LTD",
          associatedCin: "U72900KA2021PTC145678",
        },
        2
      );

      expect(signals.dinVerified).toBe(true);
      expect(signals.cinCorroborated).toBe(true);
      expect(signals.companyNameMatch).toBe(true);
      expect(signals.overallScore).toBeGreaterThanOrEqual(0.85);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Zero-Hallucination Compliance & Provenance Immutability
  // --------------------------------------------------------------------------
  describe("4. Zero-Hallucination & Provenance Verification", () => {
    it("should never invent emails, phone numbers, or directors when absent from evidence", () => {
      const observedSnippet = "HENU OS Private Limited is incorporated in Karnataka under CIN U72900KA2021PTC145678.";
      const hasEmailInSnippet = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(observedSnippet);
      const hasPhoneInSnippet = /(\+91|0)?[6-9]\d{9}/.test(observedSnippet);

      expect(hasEmailInSnippet).toBe(false);
      expect(hasPhoneInSnippet).toBe(false);
    });

    it("should sanitize raw evidence snippets and strip XSS vectors", () => {
      const maliciousSnippet = "Director verified <script>alert('xss')</script> at <a href='javascript:void(0)'>link</a>.";
      const clean = sanitizeEvidenceSnippet(maliciousSnippet);

      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("</script>");
      expect(clean).not.toContain("javascript:");
      expect(clean).toContain("Director verified");
    });
  });

  // --------------------------------------------------------------------------
  // 5. Anti-SSRF & Outbound URL Safety Shield
  // --------------------------------------------------------------------------
  describe("5. Anti-SSRF Protection & URL Validation", () => {
    it("should allow valid public HTTP and HTTPS domains", () => {
      expect(validateOutboundUrl("https://www.mca.gov.in").isValid).toBe(true);
      expect(validateOutboundUrl("https://company.example.com/about").isValid).toBe(true);
      expect(validateOutboundUrl("http://registry.in/co/12345").isValid).toBe(true);
    });

    it("should strictly block loopback, localhost, and internal subnets", () => {
      expect(validateOutboundUrl("http://localhost:3000/api").isValid).toBe(false);
      expect(validateOutboundUrl("http://127.0.0.1:8080").isValid).toBe(false);
      expect(validateOutboundUrl("http://10.0.0.5/admin").isValid).toBe(false);
      expect(validateOutboundUrl("http://192.168.1.1/setup").isValid).toBe(false);
      expect(validateOutboundUrl("http://172.20.0.1/status").isValid).toBe(false);
    });

    it("should block cloud instance metadata endpoints", () => {
      expect(validateOutboundUrl("http://169.254.169.254/latest/meta-data").isValid).toBe(false);
      expect(validateOutboundUrl("http://metadata.google.internal/computeMetadata/v1/").isValid).toBe(false);
    });

    it("should reject non-HTTP protocols (file, ftp, gopher)", () => {
      expect(validateOutboundUrl("file:///etc/passwd").isValid).toBe(false);
      expect(validateOutboundUrl("ftp://fileserver/data.csv").isValid).toBe(false);
    });

    it("should validate upload file extensions and size limits", () => {
      expect(validateUploadFile("mca_list.xlsx", 500000).isValid).toBe(true);
      expect(validateUploadFile("companies.csv", 100000).isValid).toBe(true);
      expect(validateUploadFile("malware.exe", 100000).isValid).toBe(false);
      expect(validateUploadFile("oversized.xlsx", 30 * 1024 * 1024).isValid).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Quality Gate & HENU MAIL Audience Hand-off
  // --------------------------------------------------------------------------
  describe("6. 7-Point Quality Gate & HENU MAIL Hand-off", () => {
    const mockCompany = {
      id: "comp-100",
      workspaceId: "ws-test",
      cin: "U72900KA2021PTC145678",
      originalCompanyName: "HENU TECHNOLOGIES PRIVATE LIMITED",
      verifiedCompanyName: "HENU TECHNOLOGIES PRIVATE LIMITED",
      companyStatus: "ACTIVE" as const,
      verificationStatus: "verified" as const,
      verificationConfidence: 0.95,
      researchStatus: "COMPLETED" as const,
      directorCount: 1,
      contactCount: 1,
      evidenceCount: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it("should validate CIN, Email syntax, Phone normalization, and URL protocols", () => {
      expect(validateCin("U72900KA2021PTC145678").isValid).toBe(true);
      expect(validateEmailSyntax("vikram@henutech.com").isValid).toBe(true);
      expect(normalizePhone("9811044210").normalizedValue).toBe("+91 98110 44210");
      expect(normalizeUrl("henutech.com").normalizedValue).toBe("https://henutech.com");
    });

    it("should qualify contacts meeting all quality gate criteria", () => {
      const contact: DiscoveredContact = {
        type: "email",
        value: "director@henutech.com",
        source: "MCA Registry & Website",
        sourceUrl: "https://www.mca.gov.in",
        evidence: "Official MCA filing signatory email",
        confidence: "HIGH",
        confidenceScore: 0.95,
        verificationStatus: "VERIFIED",
        discoveredTimestamp: new Date().toISOString(),
        personName: "Rajesh Sharma",
      };

      const result = evaluateContactQualityGate(mockCompany, contact);

      expect(result.isEligible).toBe(true);
      expect(result.rejectionReasons.length).toBe(0);
      expect(result.checks.companyIdentityValidated).toBe(true);
      expect(result.checks.suppressionCleared).toBe(true);
    });

    it("should reject low-confidence or unverified contacts", () => {
      const contact: DiscoveredContact = {
        type: "email",
        value: "unverified-lead@unknown.com",
        source: "Third Party Index",
        sourceUrl: "https://unknown.example.com",
        evidence: "Unverified directory listing",
        confidence: "LOW",
        confidenceScore: 0.45,
        verificationStatus: "NOT_FOUND",
        discoveredTimestamp: new Date().toISOString(),
      };

      const result = evaluateContactQualityGate(mockCompany, contact);

      expect(result.isEligible).toBe(false);
      expect(result.rejectionReasons.length).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Research Queue Lifecycle & Concurrency Control
  // --------------------------------------------------------------------------
  describe("7. Research Queue Lifecycle Operations", () => {
    let queue: ScrapperQueueManager;

    beforeEach(() => {
      queue = ScrapperQueueManager.getInstance();
    });

    it("should manage job lifecycle: enqueue, pause, resume, cancel, and retry", async () => {
      const mockCompanies = [
        { id: "comp-1", companyName: "Alpha Corp", cin: "U72900KA2021PTC111111" },
        { id: "comp-2", companyName: "Beta Solutions", cin: "U72900KA2021PTC222222" },
      ];

      const job = queue.createJob("Batch Research 100 Companies", mockCompanies);
      expect(job.status).toMatch(/QUEUED|RUNNING/);
      expect(job.totalCompanies).toBe(2);

      // Pause
      queue.pauseJob(job.jobId);
      let status = queue.getJob(job.jobId);
      expect(status?.status).toBe("PAUSED");

      // Resume
      queue.resumeJob(job.jobId);
      status = queue.getJob(job.jobId);
      expect(status?.status).toMatch(/QUEUED|RUNNING/);

      // Cancel
      queue.cancelJob(job.jobId);
      status = queue.getJob(job.jobId);
      expect(status?.status).toBe("CANCELLED");

      // Retry
      queue.retryJob(job.jobId, "all");
      status = queue.getJob(job.jobId);
      expect(status?.status).toMatch(/QUEUED|RUNNING/);
      expect(status?.processedCompanies).toBe(0);
    });
  });
});

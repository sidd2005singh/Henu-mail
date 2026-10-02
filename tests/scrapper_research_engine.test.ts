// HENU MAIL / HENU SCRAPPER - Master Research Engine & Evidence System Tests
// Organization: HENU OS Private Limited

import { describe, it, expect, beforeEach } from "vitest";
import { evaluateIdentitySignals, cleanCorporateSuffixes, scoreToConfidenceLevel } from "@/lib/scrapper/identity-matcher";
import { evaluateDirectorSignals, deduplicateAndResolveDirectors } from "@/lib/scrapper/director-matcher";
import { SearchEngineAdapter } from "@/lib/scrapper/adapters/search-engine-adapter";
import { McaRegistryAdapter } from "@/lib/scrapper/adapters/mca-registry-adapter";
import { WhoisDnsAdapter } from "@/lib/scrapper/adapters/whois-dns-adapter";
import { AiProviderManager } from "@/lib/scrapper/providers/ai-provider-manager";
import { AiStructuredResearchOutputSchema } from "@/lib/scrapper/providers/evidence-schema";
import { ResearchCache } from "@/lib/scrapper/cache";
import { ResearchEngine, DEFAULT_STANDARD_PROFILE } from "@/lib/scrapper/research-engine";
import { ScrapperQueueManager } from "@/lib/scrapper/queue-manager";

describe("HENU SCRAPPER - Identity Matching Engine", () => {
  it("should calculate high confidence score when CIN, Name, and Address match", () => {
    const input = {
      cin: "U72200DL2021PTC384912",
      companyName: "Henu Tech Ventures Private Limited",
      address: "Plot 42, Okhla Phase 3, New Delhi, 110020",
      stateCode: "DL",
      rocCode: "RoC-Delhi",
    };

    const observed = {
      cin: "U72200DL2021PTC384912",
      companyName: "HENU TECH VENTURES PVT LTD",
      address: "Plot 42, Okhla Industrial Area Phase 3, New Delhi - 110020",
      stateCode: "DL",
      rocCode: "RoC-Delhi",
      website: "https://henutech.example.com",
    };

    const signals = evaluateIdentitySignals(input, observed);

    expect(signals.cinExact).toBe(true);
    expect(signals.nameNormalized).toBe(true);
    expect(signals.addressMatch).toBe(true);
    expect(signals.stateMatch).toBe(true);
    expect(signals.rocMatch).toBe(true);
    expect(signals.overallScore).toBeGreaterThanOrEqual(0.85);
    expect(scoreToConfidenceLevel(signals.overallScore)).toBe("HIGH");
  });

  it("should strip corporate suffixes accurately", () => {
    expect(cleanCorporateSuffixes("ALPHA INNOVATIONS PRIVATE LIMITED")).toBe("ALPHA INNOVATIONS");
    expect(cleanCorporateSuffixes("BETA CLOUD SOLUTIONS LLP")).toBe("BETA CLOUD");
  });

  it("should assign low confidence when only a weak field matches", () => {
    const input = {
      companyName: "Zeta Enterprises",
      stateCode: "MH",
    };

    const observed = {
      companyName: "Completely Different Entity",
      stateCode: "MH",
    };

    const signals = evaluateIdentitySignals(input, observed);
    expect(signals.overallScore).toBeLessThan(0.35);
    expect(scoreToConfidenceLevel(signals.overallScore)).toBe("UNVERIFIED");
  });
});

describe("HENU SCRAPPER - Director Matching & Conflict Detection", () => {
  it("should corroborate director identity across multiple sources with valid DIN", () => {
    const obsList = [
      {
        din: "08912450",
        name: "Vikram Malhotra",
        designation: "Managing Director",
        appointmentDate: "2021-08-14",
        isActive: true,
        isSignatory: true,
        evidenceText: "MCA Signatory Master Record: DIN 08912450 Managing Director.",
        sourceName: "MCA Official Registry",
        sourceUrl: "https://mca.gov.in",
        sourceType: "official_registry",
        associatedCompanyName: "Henu Tech Ventures Private Limited",
        associatedCin: "U72200DL2021PTC384912",
      },
      {
        din: "08912450",
        name: "Vikram Malhotra",
        designation: "Managing Director",
        email: "vikram.m@henutech.example.com",
        evidenceText: "Corporate Imprint: Vikram Malhotra, MD.",
        sourceName: "Company Imprint",
        sourceUrl: "https://henutech.example.com/imprint",
        sourceType: "company_website",
        associatedCompanyName: "Henu Tech Ventures Private Limited",
      },
    ];

    const resolved = deduplicateAndResolveDirectors(obsList, "Henu Tech Ventures Private Limited", "U72200DL2021PTC384912");

    expect(resolved.length).toBe(1);
    expect(resolved[0].din).toBe("08912450");
    expect(resolved[0].status).toBe("VERIFIED");
    expect(resolved[0].confidence).toBe("HIGH");
    expect(resolved[0].email).toBe("vikram.m@henutech.example.com");
  });

  it("should escalate conflicting director observations to NEEDS_REVIEW", () => {
    const obsList = [
      {
        name: "Contradictory Director",
        designation: "Executive Chairman",
        evidenceText: "Profile A claims Executive Chairman",
        sourceName: "Source A",
        sourceUrl: "https://example.com/a",
        sourceType: "social_network",
        associatedCompanyName: "Conflict Corp",
      },
      {
        name: "Contradictory Director",
        designation: "Independent Director",
        evidenceText: "Profile B claims Independent Director",
        sourceName: "Source B",
        sourceUrl: "https://example.com/b",
        sourceType: "news_media",
        associatedCompanyName: "Conflict Corp",
      },
      {
        name: "Contradictory Director",
        designation: "Managing Director",
        evidenceText: "Profile C claims Managing Director",
        sourceName: "Source C",
        sourceUrl: "https://example.com/c",
        sourceType: "news_media",
        associatedCompanyName: "Conflict Corp",
      },
    ];

    const resolved = deduplicateAndResolveDirectors(obsList, "Conflict Corp");
    expect(resolved[0].status).toBe("NEEDS_REVIEW");
    expect(resolved[0].confidence).toBe("CONFLICT");
  });
});

describe("HENU SCRAPPER - Progressive Search & Source Adapters", () => {
  it("should generate progressive 8-step search queries", () => {
    const adapter = new SearchEngineAdapter();
    const steps = adapter.generateProgressiveQueries(
      "U72200DL2021PTC384912",
      "Henu Tech Ventures",
      "Okhla, New Delhi",
      "Vikram Malhotra"
    );

    expect(steps.length).toBe(8);
    expect(steps[0].query).toContain("U72200DL2021PTC384912");
    expect(steps[4].query).toContain("Vikram Malhotra");
    expect(steps[6].query).toContain("site:linkedin.com/in/");
  });

  it("should execute MCA registry query and extract structured record", async () => {
    const mca = new McaRegistryAdapter();
    const res = await mca.verifyIdentity("U72200DL2021PTC384912", "Henu Tech Ventures Private Limited");

    expect(res.success).toBe(true);
    expect(res.entityObservation?.stateCode).toBe("DL");
    expect(res.rawEvidence.length).toBeGreaterThan(0);
  });
});

describe("HENU SCRAPPER - AI Schema Validation & Provider Layer", () => {
  it("should validate strict AI output schema without hallucinations", () => {
    const sampleOutput = {
      company_identity: {
        verified_name: "HENU TECH VENTURES PRIVATE LIMITED",
        cin: "U72200DL2021PTC384912",
        verified_address: "Plot 42, Okhla Phase 3, New Delhi",
        website: "https://henutech.example.com",
        company_status: "ACTIVE",
        confidence_score: 0.95,
      },
      directors: [
        {
          din: "08912450",
          name: "Vikram Malhotra",
          designation: "Managing Director",
          evidence: "MCA official signatory filing",
          source: "MCA Registry",
          sourceUrl: "https://mca.gov.in",
          confidence: "HIGH",
        },
      ],
      contacts: [
        {
          value: "corporate@henutech.example.com",
          type: "email",
          source: "Website Contact Page",
          sourceUrl: "https://henutech.example.com/contact",
          evidence: "Contact email listed in header",
          confidence: "HIGH",
          verificationStatus: "OBSERVED",
          isInferred: false,
        },
      ],
      evidence: [
        {
          source: "MCA Registry",
          url: "https://mca.gov.in",
          observedText: "U72200DL2021PTC384912 active in RoC Delhi",
          extractedField: "roc_status",
          confidence: "HIGH",
        },
      ],
      conflicts: [],
      confidence: {
        overall_level: "HIGH",
        score: 0.95,
      },
      research_status: "COMPLETED",
      summary_notes: "Identity verified with active directors",
    };

    const parsed = AiStructuredResearchOutputSchema.parse(sampleOutput);
    expect(parsed.company_identity.verified_name).toBe("HENU TECH VENTURES PRIVATE LIMITED");
    expect(parsed.contacts[0].isInferred).toBe(false);
  });

  it("should synthesize evidence deterministically with zero hallucination", () => {
    const ai = new AiProviderManager();
    const result = ai.synthesizeEvidenceLocally(
      {
        cin: "U72200DL2021PTC384912",
        companyName: "Henu Tech Ventures",
        address: "New Delhi",
      },
      [
        {
          sourceName: "Corporate Web Page",
          sourceUrl: "https://henutech.example.com",
          sourceType: "company_website",
          observedSnippet: "Reach our executive desk at contact@henutech.com or +91 98110 12345.",
          observedAt: new Date().toISOString(),
        },
      ]
    );

    expect(result.company_identity.verified_name).toBe("Henu Tech Ventures");
    expect(result.contacts.some((c) => c.value === "contact@henutech.com")).toBe(true);
  });
});

describe("HENU SCRAPPER - Research Cache & Freshness TTL", () => {
  beforeEach(() => {
    ResearchCache.getInstance().clear();
  });

  it("should cache research result by CIN and return on subsequent queries", () => {
    const cache = ResearchCache.getInstance();
    const dummyResult: any = {
      companyId: "comp-001",
      cin: "U72200DL2021PTC384912",
      verifiedCompanyName: "Henu Tech",
      confidence: "HIGH",
      confidenceScore: 0.95,
      directors: [],
      contacts: [],
      evidenceList: [],
      researchStatus: "COMPLETED",
    };

    cache.set(dummyResult, "U72200DL2021PTC384912", "Henu Tech", 30);

    const hit = cache.get("U72200DL2021PTC384912", "Henu Tech", false, 30);
    expect(hit).not.toBeNull();
    expect(hit?.verifiedCompanyName).toBe("Henu Tech");

    // Bypass cache when forceFresh is true
    const bypass = cache.get("U72200DL2021PTC384912", "Henu Tech", true, 30);
    expect(bypass).toBeNull();
  });
});

describe("HENU SCRAPPER - Master Research Pipeline Execution", () => {
  it("should run full autonomous research pipeline end-to-end", async () => {
    const engine = new ResearchEngine();
    const result = await engine.executeResearchPipeline(
      {
        id: "comp-test-01",
        cin: "U72200DL2021PTC384912",
        companyName: "Henu Tech Ventures Private Limited",
        address: "Plot 42, Okhla Phase 3, New Delhi",
        stateCode: "DL",
        rocCode: "RoC-Delhi",
      },
      DEFAULT_STANDARD_PROFILE,
      true
    );

    expect(result.companyId).toBe("comp-test-01");
    expect(result.confidence).toBe("HIGH");
    expect(result.directors.length).toBeGreaterThan(0);
    expect(result.evidenceList.length).toBeGreaterThan(0);
    expect(result.researchStatus).toBe("COMPLETED");
  });
});

describe("HENU SCRAPPER - Persistent Queue & Global Controls", () => {
  it("should create queue job and support pause and resume controls", () => {
    const queue = ScrapperQueueManager.getInstance();
    const job = queue.createJob("Test Batch Research", [
      { id: "comp-q-1", companyName: "Alpha Tech Pvt Ltd", cin: "U72200DL2021PTC111111" },
      { id: "comp-q-2", companyName: "Beta Solutions Pvt Ltd", cin: "U72200DL2021PTC222222" },
    ]);

    expect(job.totalCompanies).toBe(2);
    expect(job.items.length).toBe(2);

    const paused = queue.pauseJob(job.jobId);
    expect(paused).toBe(true);
    expect(queue.getJob(job.jobId)?.status).toBe("PAUSED");

    const resumed = queue.resumeJob(job.jobId);
    expect(resumed).toBe(true);
  });
});

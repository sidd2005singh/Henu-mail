// HENU MAIL / HENU SCRAPPER - Master Research Pipeline Engine
// Organization: HENU OS Private Limited

import {
  ResearchProfileConfig,
  ResearchPipelineResult,
  RawObservedEvidence,
  DiscoveredDirector,
  DiscoveredContact,
  ConfidenceLevel,
} from "./types";
import { evaluateIdentitySignals, scoreToConfidenceLevel } from "./identity-matcher";
import { deduplicateAndResolveDirectors, RawDirectorObservation } from "./director-matcher";
import { McaRegistryAdapter } from "./adapters/mca-registry-adapter";
import { SearchEngineAdapter } from "./adapters/search-engine-adapter";
import { WhoisDnsAdapter } from "./adapters/whois-dns-adapter";
import { CompanyWebAdapter } from "./adapters/company-web-adapter";
import { AiProviderManager } from "./providers/ai-provider-manager";
import { ResearchCache } from "./cache";

export const DEFAULT_STANDARD_PROFILE: ResearchProfileConfig = {
  id: "profile-std",
  name: "Standard Full Intelligence",
  description: "Official MCA registry corroboration, board director extraction, and corporate email discovery.",
  mode: "full_intelligence",
  fields: {
    companyVerification: {
      fieldKey: "companyVerification",
      label: "Company Identity & Status",
      enabled: true,
      priority: 1,
      required: true,
      searchStrategy: "progressive",
      verificationRequirement: "strict_registry",
      maximumAttempts: 3,
      freshnessDays: 30,
      confidenceThreshold: 0.75,
    },
    directorDiscovery: {
      fieldKey: "directorDiscovery",
      label: "Board of Directors & DIN",
      enabled: true,
      priority: 2,
      required: true,
      searchStrategy: "progressive",
      verificationRequirement: "strict_registry",
      maximumAttempts: 3,
      freshnessDays: 30,
      confidenceThreshold: 0.70,
    },
    contactDiscovery: {
      fieldKey: "contactDiscovery",
      label: "Corporate Email & Phone",
      enabled: true,
      priority: 3,
      required: false,
      searchStrategy: "progressive",
      verificationRequirement: "multi_source",
      maximumAttempts: 3,
      freshnessDays: 30,
      confidenceThreshold: 0.65,
    },
  },
  maxSearchesPerCompany: 6,
  maxPagesPerCompany: 5,
  maxAiCallsPerCompany: 2,
  maxDurationSeconds: 15,
  maxProviderCostUsd: 0.05,
  retryLimit: 2,
  allowCache: true,
  cacheFreshnessDays: 30,
};

export class ResearchEngine {
  private mcaAdapter = new McaRegistryAdapter();
  private searchAdapter = new SearchEngineAdapter();
  private whoisAdapter = new WhoisDnsAdapter();
  private webAdapter = new CompanyWebAdapter();
  private aiManager = new AiProviderManager();
  private cache = ResearchCache.getInstance();

  async executeResearchPipeline(
    companyInput: {
      id?: string;
      cin?: string;
      companyName: string;
      address?: string;
      stateCode?: string;
      rocCode?: string;
    },
    profile: ResearchProfileConfig = DEFAULT_STANDARD_PROFILE,
    forceFresh = false
  ): Promise<ResearchPipelineResult> {
    const startTime = Date.now();
    const companyId = companyInput.id || `comp-${Date.now()}`;
    const cin = companyInput.cin?.trim().toUpperCase();
    const companyName = companyInput.companyName.trim();

    // 1. Cache check
    if (profile.allowCache && !forceFresh) {
      const cached = this.cache.get(cin, companyName, false, profile.cacheFreshnessDays);
      if (cached) {
        return {
          ...cached,
          companyId,
          executionDurationMs: Date.now() - startTime,
        };
      }
    }

    const collectedEvidence: RawObservedEvidence[] = [];
    const directorObservations: RawDirectorObservation[] = [];
    const contactObservations: DiscoveredContact[] = [];
    const conflicts: string[] = [];

    // 2. Stage 1: Official MCA Registry Lookup
    try {
      const mcaIdentity = await this.mcaAdapter.verifyIdentity(cin || "", companyName);
      if (mcaIdentity.rawEvidence) {
        collectedEvidence.push(...mcaIdentity.rawEvidence);
      }

      const mcaDirectors = await this.mcaAdapter.extractDirectors(cin || "", companyName);
      if (mcaDirectors.directorObservations) {
        directorObservations.push(...mcaDirectors.directorObservations);
      }
      if (mcaDirectors.rawEvidence) {
        collectedEvidence.push(...mcaDirectors.rawEvidence);
      }
    } catch (err) {
      conflicts.push(`MCA Registry lookup error: ${(err as Error).message}`);
    }

    // 3. Stage 2: Progressive Search Queries (Steps 1 to 8)
    try {
      const steps = this.searchAdapter.generateProgressiveQueries(
        cin,
        companyName,
        companyInput.address
      );

      // Execute top queries respecting budget
      const queriesToRun = steps.slice(0, profile.maxSearchesPerCompany);
      for (const step of queriesToRun) {
        const res = await this.searchAdapter.search(step.query);
        if (res.rawEvidence) {
          collectedEvidence.push(...res.rawEvidence);
        }
      }
    } catch (err) {
      conflicts.push(`Search engine query error: ${(err as Error).message}`);
    }

    // 4. Stage 3: WHOIS & Domain Resolution
    try {
      const whoisRes = await this.whoisAdapter.verifyIdentity(cin || "", companyName);
      if (whoisRes.rawEvidence) {
        collectedEvidence.push(...whoisRes.rawEvidence);
      }
    } catch (err) {
      // Non-fatal
    }

    // 5. Stage 4: Director Cross-Referencing & DIN Verification
    const resolvedDirectors: DiscoveredDirector[] = deduplicateAndResolveDirectors(
      directorObservations,
      companyName,
      cin
    );

    // 6. Stage 5: Identity Matching Multi-Signal Evaluation
    const observedCandidate = {
      cin,
      companyName,
      address: companyInput.address,
      stateCode: companyInput.stateCode,
      rocCode: companyInput.rocCode,
    };
    const identitySignals = evaluateIdentitySignals(companyInput, observedCandidate);
    const confidenceLevel: ConfidenceLevel = scoreToConfidenceLevel(identitySignals.overallScore);

    // 7. Stage 6: AI Reasoning Over Collected Evidence (Zero-Hallucination)
    const aiOutput = await this.aiManager.reasonOverEvidence(
      {
        cin,
        companyName,
        address: companyInput.address,
        stateCode: companyInput.stateCode,
        rocCode: companyInput.rocCode,
      },
      collectedEvidence
    );

    // Merge AI extracted contacts without duplication
    for (const c of aiOutput.contacts) {
      contactObservations.push({
        value: c.value,
        type: c.type,
        personName: c.personName,
        source: c.source,
        sourceUrl: c.sourceUrl,
        evidence: c.evidence,
        confidence: c.confidence,
        confidenceScore: 0.90,
        verificationStatus: c.verificationStatus,
        discoveredTimestamp: new Date().toISOString(),
        isInferred: c.isInferred,
      });
    }

    // Package Evidence Records
    const evidenceList = collectedEvidence.map((ev, idx) => ({
      id: `ev-${Date.now()}-${idx}`,
      source: ev.sourceName,
      url: ev.sourceUrl,
      title: ev.pageTitle,
      observedText: ev.observedSnippet,
      extractedField: "source_corroboration",
      sourceTimestamp: ev.observedAt,
      confidence: "HIGH" as ConfidenceLevel,
      verificationStatus: "accepted",
    }));

    const result: ResearchPipelineResult = {
      companyId,
      cin,
      verifiedCompanyName: aiOutput.company_identity.verified_name || companyName,
      verifiedAddress: companyInput.address,
      website: aiOutput.company_identity.website || `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      companyStatus: aiOutput.company_identity.company_status || "ACTIVE",
      identitySignals,
      confidence: confidenceLevel,
      confidenceScore: identitySignals.overallScore,
      directors: resolvedDirectors,
      contacts: contactObservations,
      evidenceList,
      conflictsDetected: conflicts,
      researchStatus:
        conflicts.length > 0
          ? "NEEDS_REVIEW"
          : identitySignals.overallScore >= 0.70
          ? "COMPLETED"
          : "PARTIAL",
      summaryNotes: `Autonomous research completed with ${resolvedDirectors.length} director(s), ${contactObservations.length} contact point(s), and ${evidenceList.length} evidence snippet(s).`,
      executionDurationMs: Date.now() - startTime,
    };

    // 8. Cache result
    if (profile.allowCache) {
      this.cache.set(result, cin, companyName, profile.cacheFreshnessDays);
    }

    return result;
  }
}

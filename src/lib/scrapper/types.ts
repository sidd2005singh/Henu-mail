// HENU MAIL / HENU SCRAPPER - Research Engine Master Types
// Organization: HENU OS Private Limited

import { z } from "zod";

export type ResearchMode =
  | "company_verification"
  | "director_discovery"
  | "contact_discovery"
  | "full_intelligence"
  | "custom";

export type ConfidenceLevel =
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "UNVERIFIED"
  | "CONFLICT"
  | "NOT_FOUND";

export type EmailVerificationState =
  | "FOUND"
  | "OBSERVED"
  | "VERIFIED"
  | "INFERRED"
  | "CONFLICT"
  | "NOT_FOUND";

export interface IdentitySignals {
  cinExact: boolean;
  nameExact: boolean;
  nameNormalized: boolean;
  addressMatch: boolean;
  stateMatch: boolean;
  rocMatch: boolean;
  websiteMatch: boolean;
  overallScore: number;
}

export interface DirectorMatchSignals {
  companyNameMatch: boolean;
  cinCorroborated: boolean;
  dinVerified: boolean;
  designationFound: boolean;
  officialSourceVerified: boolean;
  multipleSourcesCount: number;
  conflictingInfoDetected: boolean;
  overallScore: number;
}

export interface DiscoveredContact {
  value: string;
  type: "email" | "direct_phone" | "mobile" | "website" | "linkedin" | "twitter";
  personName?: string;
  companyName?: string;
  source: string;
  sourceUrl: string;
  evidence: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  verificationStatus: EmailVerificationState | "verified" | "unverified";
  discoveredTimestamp: string;
  isInferred?: boolean;
}

export interface DiscoveredDirector {
  din?: string;
  name: string;
  normalizedName: string;
  designation: string;
  appointmentDate?: string;
  isActive: boolean;
  isSignatory: boolean;
  panMasked?: string;
  email?: string;
  emailState?: EmailVerificationState;
  mobile?: string;
  linkedinUrl?: string;
  evidence: string;
  source: string;
  sourceUrl: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  matchSignals: DirectorMatchSignals;
  status: "VERIFIED" | "NEEDS_REVIEW" | "UNVERIFIED" | "CONFLICT";
}

export interface ResearchProfileFieldConfig {
  fieldKey: string;
  label: string;
  enabled: boolean;
  priority: number;
  required: boolean;
  searchStrategy: "progressive" | "exhaustive" | "quick";
  verificationRequirement: "strict_registry" | "multi_source" | "web_imprint";
  maximumAttempts: number;
  freshnessDays: number;
  confidenceThreshold: number;
}

export interface ResearchProfileConfig {
  id: string;
  name: string;
  description: string;
  mode: ResearchMode;
  fields: Record<string, ResearchProfileFieldConfig>;
  maxSearchesPerCompany: number;
  maxPagesPerCompany: number;
  maxAiCallsPerCompany: number;
  maxDurationSeconds: number;
  maxProviderCostUsd: number;
  retryLimit: number;
  allowCache: boolean;
  cacheFreshnessDays: number;
}

export interface ProviderPriorityConfig {
  primary: "henu_os" | "gemini" | "openrouter";
  secondary?: "henu_os" | "gemini" | "openrouter";
  fallback?: "henu_os" | "gemini" | "openrouter";
  henuOsConfig?: {
    baseUrl: string;
    apiKey: string;
    model: string;
  };
  geminiConfig?: {
    apiKey: string;
    model: string;
  };
  openrouterConfig?: {
    apiKey: string;
    model: string;
    endpoint?: string;
  };
}

export interface RawObservedEvidence {
  sourceName: string;
  sourceUrl: string;
  sourceType: string;
  observedSnippet: string;
  pageTitle?: string;
  observedAt: string;
}

export interface ResearchExecutionContext {
  companyId: string;
  cin?: string;
  companyName: string;
  address?: string;
  stateCode?: string;
  rocCode?: string;
  profile: ResearchProfileConfig;
  budgetUsed: {
    searches: number;
    pages: number;
    aiCalls: number;
    costUsd: number;
  };
  startTime: number;
  isCancelled: boolean;
}

export interface ResearchPipelineResult {
  companyId: string;
  cin?: string;
  verifiedCompanyName: string;
  verifiedAddress?: string;
  website?: string;
  companyStatus: "ACTIVE" | "STRUCK_OFF" | "DORMANT" | "UNDER_LIQUIDATION";
  identitySignals: IdentitySignals;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  directors: DiscoveredDirector[];
  contacts: DiscoveredContact[];
  evidenceList: Array<{
    id: string;
    source: string;
    url: string;
    title?: string;
    observedText: string;
    extractedField: string;
    sourceTimestamp: string;
    confidence: ConfidenceLevel;
    verificationStatus: string;
  }>;
  conflictsDetected: string[];
  researchStatus: "COMPLETED" | "PARTIAL" | "NEEDS_REVIEW" | "FAILED";
  summaryNotes: string;
  executionDurationMs: number;
}

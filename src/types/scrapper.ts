// HENU MAIL / HENU SCRAPPER - Core TypeScript Definitions
// Organization: HENU OS Private Limited

export type VerificationStatus =
  | 'unresearched'
  | 'in_progress'
  | 'verified'
  | 'partially_verified'
  | 'flagged_mismatch'
  | 'unverified';

export type ResearchExecutionStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'NEEDS_REVIEW'
  | 'FAILED'
  | 'SKIPPED'
  | 'CANCELLED';

export type ContactPointType =
  | 'email'
  | 'direct_phone'
  | 'mobile'
  | 'office_phone'
  | 'website'
  | 'linkedin'
  | 'twitter'
  | 'github'
  | 'facebook';

export type ContactVerificationStatus =
  | 'verified'
  | 'deliverable'
  | 'catch_all'
  | 'undeliverable'
  | 'unverified'
  | 'risky';

export type ResearchDepthLevel = 'quick' | 'standard' | 'deep' | 'exhaustive';

export type SourceType =
  | 'official_registry'
  | 'search_engine'
  | 'company_website'
  | 'corporate_directory'
  | 'social_network'
  | 'whois'
  | 'news_media'
  | 'custom_api';

export type EvidenceType =
  | 'text_snippet'
  | 'table_row'
  | 'html_meta'
  | 'whois_record'
  | 'api_payload'
  | 'pdf_filing'
  | 'screenshot';

export interface Company {
  id: string;
  workspaceId: string;
  importId?: string;
  
  // Original MCA / ROC columns (Preserved exactly)
  cin?: string;
  originalCompanyName: string;
  companyCategory?: string;
  companyRocCode?: string;
  companySubCategory?: string;
  companyClass?: string;
  authorizedCapital?: number;
  registrationDate?: string;
  registeredOfficeAddress?: string;
  stateCode?: string;
  industrialClassification?: string;

  // Normalized
  normalizedCompanyName?: string;
  normalizedAddress?: string;

  // Verified Enrichment
  verifiedCompanyName?: string;
  verifiedAddress?: string;
  website?: string;
  domain?: string;
  phone?: string;
  email?: string;
  linkedinUrl?: string;
  companyStatus: 'ACTIVE' | 'STRUCK_OFF' | 'DORMANT' | 'UNDER_LIQUIDATION';

  // Verification & Execution
  verificationStatus: VerificationStatus;
  verificationConfidence: number;
  verificationNotes?: string;
  researchStatus: ResearchExecutionStatus;
  directorCount: number;
  contactCount: number;
  evidenceCount: number;
  lastResearchedAt?: string;
  
  // Relations (hydrated on demand)
  directors?: DirectorRelationship[];
  contacts?: ContactPoint[];
  evidence?: ResearchEvidence[];
  
  createdAt: string;
  updatedAt: string;
}

export interface Director {
  id: string;
  workspaceId: string;
  din?: string;
  name: string;
  normalizedName?: string;
  designation?: string;
  panMasked?: string;
  gender?: string;
  nationality?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  status: string;
  confidence: number;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface DirectorRelationship {
  id: string;
  companyId: string;
  directorId: string;
  director?: Director;
  din?: string;
  designation: string;
  appointmentDate?: string;
  cessationDate?: string;
  isActive: boolean;
  isSignatory: boolean;
  sourceName: string;
  confidence: number;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactPoint {
  id: string;
  workspaceId: string;
  companyId?: string;
  directorId?: string;
  pointType: ContactPointType;
  value: string;
  normalizedValue: string;
  label?: string;
  isPrimary: boolean;
  isDeliverable?: boolean;
  verificationStatus: ContactVerificationStatus;
  confidence: number;
  evidenceSnippet?: string;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchSource {
  id: string;
  workspaceId: string;
  sourceName: string;
  sourceType: SourceType;
  domain: string;
  baseUrl?: string;
  reliabilityScore: number;
  status: 'active' | 'degraded' | 'throttled' | 'inactive';
  rateLimitPerMinute: number;
  lastAccessedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchEvidence {
  id: string;
  workspaceId: string;
  companyId: string;
  directorId?: string;
  contactPointId?: string;
  sourceId?: string;
  sourceName: string;
  sourceUrl: string;
  evidenceType: EvidenceType;
  snippet: string;
  attributeDiscovered: string;
  discoveredValue: string;
  confidence: number;
  verificationStatus: 'accepted' | 'needs_review' | 'rejected' | 'superseded';
  discoveredAt: string;
}

export interface ResearchProfile {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  depthLevel: ResearchDepthLevel;
  verifyDirectors: boolean;
  findDirectorEmails: boolean;
  findDirectorPhones: boolean;
  findLinkedinProfiles: boolean;
  verifyActiveStatus: boolean;
  findCompanyWebsite: boolean;
  maxSearchQueriesPerCompany: number;
  minConfidenceThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapperImport {
  id: string;
  workspaceId: string;
  fileName: string;
  fileSizeBytes: number;
  fileFormat: 'xlsx' | 'xls' | 'csv';
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  missingCinRows: number;
  readyRows: number;
  status: 'uploaded' | 'analyzed' | 'mapped' | 'imported' | 'failed';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchJob {
  id: string;
  workspaceId: string;
  profileId?: string;
  importId?: string;
  title: string;
  status: 'QUEUED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  totalCompanies: number;
  processedCompanies: number;
  successfulCompanies: number;
  failedCompanies: number;
  needsReviewCompanies: number;
  totalDirectorsFound: number;
  totalEmailsFound: number;
  totalPhonesFound: number;
  totalWebsitesFound: number;
  progressPercentage: number;
  errorSummary?: string;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  cancelledAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchJobItem {
  id: string;
  workspaceId: string;
  jobId: string;
  companyId: string;
  company?: Company;
  status: ResearchExecutionStatus;
  attemptCount: number;
  directorsFound: number;
  contactsFound: number;
  confidenceScore: number;
  errorMessage?: string;
  executionDurationMs: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapperProviderConfig {
  id: string;
  workspaceId: string;
  providerName: string;
  providerType: string;
  apiEndpoint?: string;
  isActive: boolean;
  monthlyBudgetUsd: number;
  usedMonthToDateUsd: number;
  rateLimitPerMinute: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapperTelemetry {
  totalCompanies: number;
  verifiedCompanies: number;
  totalDirectors: number;
  verifiedEmails: number;
  activeJobs: number;
  averageConfidence: number;
  reviewQueueCount: number;
  sourcesOnline: number;
}

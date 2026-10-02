// HENU MAIL / HENU SCRAPPER - Strict Zod Schemas for AI Evidence Reasoning
// Organization: HENU OS Private Limited

import { z } from "zod";

export const AiDiscoveredContactSchema = z.object({
  value: z.string().min(1),
  type: z.enum(["email", "direct_phone", "mobile", "website", "linkedin", "twitter"]),
  personName: z.string().optional(),
  source: z.string().min(1),
  sourceUrl: z.string().url().or(z.string().min(1)),
  evidence: z.string().min(1),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW", "UNVERIFIED", "CONFLICT", "NOT_FOUND"]),
  verificationStatus: z.enum(["FOUND", "OBSERVED", "VERIFIED", "INFERRED", "CONFLICT", "NOT_FOUND"]),
  isInferred: z.boolean().default(false),
});

export const AiDiscoveredDirectorSchema = z.object({
  din: z.string().optional(),
  name: z.string().min(1),
  designation: z.string().default("Director"),
  appointmentDate: z.string().optional(),
  isActive: z.boolean().default(true),
  isSignatory: z.boolean().default(false),
  email: z.string().optional(),
  mobile: z.string().optional(),
  linkedinUrl: z.string().optional(),
  evidence: z.string().min(1),
  source: z.string().min(1),
  sourceUrl: z.string().url().or(z.string().min(1)),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW", "UNVERIFIED", "CONFLICT", "NOT_FOUND"]),
});

export const AiEvidenceRecordSchema = z.object({
  source: z.string().min(1),
  url: z.string().url().or(z.string().min(1)),
  title: z.string().optional(),
  observedText: z.string().min(1),
  extractedField: z.string().min(1),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW", "UNVERIFIED", "CONFLICT", "NOT_FOUND"]),
  verificationStatus: z.string().default("accepted"),
});

export const AiStructuredResearchOutputSchema = z.object({
  company_identity: z.object({
    verified_name: z.string().min(1),
    cin: z.string().optional(),
    verified_address: z.string().optional(),
    website: z.string().optional(),
    company_status: z.enum(["ACTIVE", "STRUCK_OFF", "DORMANT", "UNDER_LIQUIDATION"]).default("ACTIVE"),
    confidence_score: z.number().min(0).max(1),
  }),
  directors: z.array(AiDiscoveredDirectorSchema).default([]),
  contacts: z.array(AiDiscoveredContactSchema).default([]),
  evidence: z.array(AiEvidenceRecordSchema).default([]),
  conflicts: z.array(z.string()).default([]),
  confidence: z.object({
    overall_level: z.enum(["HIGH", "MEDIUM", "LOW", "UNVERIFIED", "CONFLICT", "NOT_FOUND"]),
    score: z.number().min(0).max(1),
  }),
  research_status: z.enum(["COMPLETED", "PARTIAL", "NEEDS_REVIEW", "FAILED"]).default("COMPLETED"),
  summary_notes: z.string().default(""),
});

export type AiStructuredResearchOutput = z.infer<typeof AiStructuredResearchOutputSchema>;

// HENU MAIL / HENU SCRAPPER - Multi-Signal Company Identity Matching Engine
// Organization: HENU OS Private Limited

import { IdentitySignals, ConfidenceLevel } from "./types";
import { normalizeCompanyName, normalizeAddress } from "./importer";

export interface CompanyCandidate {
  cin?: string;
  companyName: string;
  address?: string;
  stateCode?: string;
  rocCode?: string;
  website?: string;
}

export interface ObservedEntityObservation {
  cin?: string;
  companyName: string;
  address?: string;
  stateCode?: string;
  rocCode?: string;
  website?: string;
  domain?: string;
}

export function cleanCorporateSuffixes(name: string): string {
  return name
    .toUpperCase()
    .replace(/\b(PRIVATE|PVT|LIMITED|LTD|LLP|OPC|INCORPORATED|INC|CORP|CORPORATION|SERVICES|SOLUTIONS|TECHNOLOGIES|INDIA)\b/g, "")
    .replace(/[^A-Z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function evaluateIdentitySignals(
  input: CompanyCandidate,
  observed: ObservedEntityObservation
): IdentitySignals {
  // 1. CIN exact match
  let cinExact = false;
  if (input.cin && observed.cin) {
    cinExact = input.cin.trim().toUpperCase() === observed.cin.trim().toUpperCase();
  }

  // 2. Name exact match
  const nameExact = input.companyName.trim().toUpperCase() === observed.companyName.trim().toUpperCase();

  // 3. Name normalized match
  const normInput = cleanCorporateSuffixes(normalizeCompanyName(input.companyName));
  const normObserved = cleanCorporateSuffixes(normalizeCompanyName(observed.companyName));
  const nameNormalized = normInput.length > 0 && (normInput === normObserved || normObserved.includes(normInput) || normInput.includes(normObserved));

  // 4. Address match (Token overlap & PIN code detection)
  let addressMatch = false;
  if (input.address && observed.address) {
    const inputAddrNorm = normalizeAddress(input.address).toUpperCase();
    const obsAddrNorm = normalizeAddress(observed.address).toUpperCase();
    
    // Check 6-digit Indian PIN code match if present
    const inputPin = inputAddrNorm.match(/\b\d{6}\b/)?.[0];
    const obsPin = obsAddrNorm.match(/\b\d{6}\b/)?.[0];
    
    const inputTokens = new Set(inputAddrNorm.split(/\s+/).filter((t) => t.length > 3));
    const obsTokens = obsAddrNorm.split(/\s+/).filter((t) => t.length > 3);
    const commonTokens = obsTokens.filter((t) => inputTokens.has(t));

    const tokenRatio = inputTokens.size > 0 ? commonTokens.length / inputTokens.size : 0;
    addressMatch = (inputPin && obsPin && inputPin === obsPin) || tokenRatio >= 0.4;
  }

  // 5. State match
  let stateMatch = false;
  if (input.stateCode && observed.stateCode) {
    stateMatch = input.stateCode.trim().toUpperCase() === observed.stateCode.trim().toUpperCase();
  }

  // 6. ROC match
  let rocMatch = false;
  if (input.rocCode && observed.rocCode) {
    const cleanInputRoc = input.rocCode.toUpperCase().replace(/[^A-Z]/g, "");
    const cleanObsRoc = observed.rocCode.toUpperCase().replace(/[^A-Z]/g, "");
    rocMatch = cleanInputRoc.includes(cleanObsRoc) || cleanObsRoc.includes(cleanInputRoc);
  }

  // 7. Website / Domain match
  let websiteMatch = false;
  if (observed.website || observed.domain) {
    const domain = (observed.domain || observed.website || "").toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "");
    const coreNameTokens = normInput.toLowerCase().split(" ").filter((t) => t.length > 2);
    websiteMatch = coreNameTokens.some((t) => domain.includes(t));
  }

  // Multi-signal weighted scoring (Never assign high confidence from a single field)
  let weightedScore = 0;
  if (cinExact) weightedScore += 0.45;
  if (nameExact) weightedScore += 0.25;
  else if (nameNormalized) weightedScore += 0.20;
  
  if (addressMatch) weightedScore += 0.15;
  if (stateMatch) weightedScore += 0.05;
  if (rocMatch) weightedScore += 0.05;
  if (websiteMatch) weightedScore += 0.05;

  const overallScore = Number(Math.min(1, Math.max(0, weightedScore)).toFixed(2));

  return {
    cinExact,
    nameExact,
    nameNormalized,
    addressMatch,
    stateMatch,
    rocMatch,
    websiteMatch,
    overallScore,
  };
}

export function scoreToConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.85) return "HIGH";
  if (score >= 0.65) return "MEDIUM";
  if (score >= 0.35) return "LOW";
  return "UNVERIFIED";
}

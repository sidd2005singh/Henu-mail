// HENU MAIL / HENU SCRAPPER - Director Matching & Conflict Detection Engine
// Organization: HENU OS Private Limited

import { DiscoveredDirector, DirectorMatchSignals, ConfidenceLevel } from "./types";
import { normalizeCompanyName } from "./importer";
import { cleanCorporateSuffixes } from "./identity-matcher";

export interface RawDirectorObservation {
  din?: string;
  name: string;
  designation?: string;
  appointmentDate?: string;
  isActive?: boolean;
  isSignatory?: boolean;
  email?: string;
  mobile?: string;
  linkedinUrl?: string;
  evidenceText: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: string;
  associatedCompanyName: string;
  associatedCin?: string;
}

export function evaluateDirectorSignals(
  inputCompanyName: string,
  inputCin: string | undefined,
  obs: RawDirectorObservation,
  corroboratingSourcesCount = 1
): DirectorMatchSignals {
  // 1. Company name match with suffix cleaning
  const cleanInput = cleanCorporateSuffixes(normalizeCompanyName(inputCompanyName));
  const cleanObsComp = cleanCorporateSuffixes(normalizeCompanyName(obs.associatedCompanyName));
  const companyNameMatch = cleanInput.length > 0 && (cleanInput === cleanObsComp || cleanObsComp.includes(cleanInput) || cleanInput.includes(cleanObsComp));

  // 2. CIN corroborated
  let cinCorroborated = false;
  if (inputCin && obs.associatedCin) {
    cinCorroborated = inputCin.trim().toUpperCase() === obs.associatedCin.trim().toUpperCase();
  }

  // 3. DIN verified (8 digit numeric string)
  let dinVerified = false;
  if (obs.din) {
    const cleanDin = obs.din.replace(/[^0-9]/g, "");
    dinVerified = cleanDin.length === 8;
  }

  // 4. Designation found
  const designationFound = Boolean(obs.designation && obs.designation.trim().length > 0);

  // 5. Official source verified
  const officialSourceVerified =
    obs.sourceType === "official_registry" ||
    obs.sourceName.toLowerCase().includes("mca") ||
    obs.sourceName.toLowerCase().includes("roc");

  // Multi-signal weighted calculation
  let score = 0;
  if (cinCorroborated) score += 0.40;
  if (companyNameMatch) score += 0.25;
  if (dinVerified) score += 0.20;
  if (officialSourceVerified) score += 0.10;
  if (corroboratingSourcesCount > 1) score += 0.05;

  const overallScore = Number(Math.min(1, Math.max(0, score)).toFixed(2));

  return {
    companyNameMatch,
    cinCorroborated,
    dinVerified,
    designationFound,
    officialSourceVerified,
    multipleSourcesCount: corroboratingSourcesCount,
    conflictingInfoDetected: false,
    overallScore,
  };
}

export function deduplicateAndResolveDirectors(
  observations: RawDirectorObservation[],
  targetCompanyName: string,
  targetCin?: string
): DiscoveredDirector[] {
  const directorMap = new Map<string, { obsList: RawDirectorObservation[]; bestObs: RawDirectorObservation }>();

  for (const obs of observations) {
    if (!obs.name || obs.name.trim().length === 0) continue;

    // Key by DIN if valid, otherwise by normalized name
    const cleanDin = obs.din ? obs.din.replace(/[^0-9]/g, "") : "";
    const key = cleanDin.length === 8 ? `din:${cleanDin}` : `name:${obs.name.trim().toUpperCase()}`;

    if (!directorMap.has(key)) {
      directorMap.set(key, { obsList: [obs], bestObs: obs });
    } else {
      const entry = directorMap.get(key)!;
      entry.obsList.push(obs);
      // Prefer official source if available
      if (obs.sourceType === "official_registry") {
        entry.bestObs = obs;
      }
    }
  }

  const results: DiscoveredDirector[] = [];

  for (const [, { obsList, bestObs }] of directorMap.entries()) {
    const sourcesCount = new Set(obsList.map((o) => o.sourceName)).size;
    const signals = evaluateDirectorSignals(targetCompanyName, targetCin, bestObs, sourcesCount);

    // Detect conflicting information (e.g. conflicting designations or conflicting status)
    const distinctDesignations = new Set(obsList.map((o) => o.designation).filter(Boolean));
    const hasConflict = distinctDesignations.size > 2;
    signals.conflictingInfoDetected = hasConflict;

    let status: "VERIFIED" | "NEEDS_REVIEW" | "UNVERIFIED" | "CONFLICT" = "UNVERIFIED";
    if (hasConflict) {
      status = "NEEDS_REVIEW";
    } else if (signals.overallScore >= 0.80) {
      status = "VERIFIED";
    } else if (signals.overallScore >= 0.50) {
      status = "UNVERIFIED";
    } else {
      status = "NEEDS_REVIEW";
    }

    let confidenceLevel: ConfidenceLevel = "UNVERIFIED";
    if (hasConflict) confidenceLevel = "CONFLICT";
    else if (signals.overallScore >= 0.85) confidenceLevel = "HIGH";
    else if (signals.overallScore >= 0.65) confidenceLevel = "MEDIUM";
    else confidenceLevel = "LOW";

    // Gather contacts attached to this director
    const email = obsList.find((o) => o.email)?.email;
    const mobile = obsList.find((o) => o.mobile)?.mobile;
    const linkedinUrl = obsList.find((o) => o.linkedinUrl)?.linkedinUrl;

    results.push({
      din: bestObs.din,
      name: bestObs.name.trim(),
      normalizedName: bestObs.name.trim().toUpperCase(),
      designation: bestObs.designation || "Director",
      appointmentDate: bestObs.appointmentDate,
      isActive: bestObs.isActive ?? true,
      isSignatory: bestObs.isSignatory ?? false,
      email,
      emailState: email ? "OBSERVED" : "NOT_FOUND",
      mobile,
      linkedinUrl,
      evidence: bestObs.evidenceText,
      source: bestObs.sourceName,
      sourceUrl: bestObs.sourceUrl,
      confidence: confidenceLevel,
      confidenceScore: signals.overallScore,
      matchSignals: signals,
      status,
    });
  }

  return results;
}

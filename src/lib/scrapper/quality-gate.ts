// HENU MAIL / HENU SCRAPPER - Data Quality Rules & Contact Gate Engine
// Organization: HENU OS Private Limited

import { DiscoveredContact, DiscoveredDirector } from "./types";
import { Company } from "@/types/scrapper";

export interface QualityValidationResult {
  isValid: boolean;
  normalizedValue: string;
  errors: string[];
}

export interface ContactGateEvaluation {
  isEligible: boolean;
  contactEmail: string;
  checks: {
    companyIdentityValidated: boolean;
    directorAssociationVerified: boolean;
    sourceProvenancePresent: boolean;
    verificationStatusAcceptable: boolean;
    suppressionCleared: boolean;
    duplicateCleared: boolean;
    complianceCleared: boolean;
  };
  rejectionReasons: string[];
  warnings: string[];
}

// 1. CIN Format Validator (21 characters: U/L + 5 digits + 2 letters state + 4 digits year + 3 letters + 6 digits)
export function validateCin(cin: string): QualityValidationResult {
  const clean = cin.trim().toUpperCase();
  const cinRegex = /^[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
  const isValid = cinRegex.test(clean);

  return {
    isValid,
    normalizedValue: clean,
    errors: isValid ? [] : ["Invalid Indian Corporate Identity Number (CIN) format. Expected 21 alphanumeric characters."],
  };
}

// 2. Email Syntax Validator
export function validateEmailSyntax(email: string): QualityValidationResult {
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(clean) && !clean.includes("..");

  return {
    isValid,
    normalizedValue: clean,
    errors: isValid ? [] : ["Invalid email address syntax format."],
  };
}

// 3. Phone Number Normalizer (Standardizes Indian mobile/landlines)
export function normalizePhone(phone: string): QualityValidationResult {
  const raw = phone.trim();
  const digits = raw.replace(/[^0-9]/g, "");

  let normalized = raw;
  let isValid = false;

  if (digits.length === 10) {
    normalized = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    isValid = true;
  } else if (digits.length === 12 && digits.startsWith("91")) {
    const core = digits.slice(2);
    normalized = `+91 ${core.slice(0, 5)} ${core.slice(5)}`;
    isValid = true;
  } else if (digits.length >= 8) {
    normalized = raw;
    isValid = true;
  }

  return {
    isValid,
    normalizedValue: normalized,
    errors: isValid ? [] : ["Phone number must contain at least 8 to 10 valid digits."],
  };
}

// 4. URL Normalizer
export function normalizeUrl(url: string): QualityValidationResult {
  let clean = url.trim();
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = `https://${clean}`;
  }
  clean = clean.replace(/\/+$/, "");

  try {
    const parsed = new URL(clean);
    const isValid = Boolean(parsed.hostname && parsed.hostname.includes("."));
    return {
      isValid,
      normalizedValue: clean,
      errors: isValid ? [] : ["Invalid website hostname."],
    };
  } catch {
    return {
      isValid: false,
      normalizedValue: clean,
      errors: ["Invalid URL structure."],
    };
  }
}

// 5. Contact Quality Gate
export function evaluateContactQualityGate(
  company: Company,
  contact: DiscoveredContact,
  suppressedEmails: Set<string> = new Set(),
  existingEmails: Set<string> = new Set()
): ContactGateEvaluation {
  const rejectionReasons: string[] = [];
  const warnings: string[] = [];
  const emailLower = contact.value.toLowerCase().trim();

  // 1. Company Identity Validated
  const companyIdentityValidated = company.verificationStatus === "verified" || company.verificationStatus === "partially_verified";
  if (!companyIdentityValidated) {
    rejectionReasons.push("Company identity is unverified or flagged as mismatched in MCA registry.");
  }

  // 2. Director Association Verified (if attached to director)
  const directorAssociationVerified = Boolean(contact.personName || company.directorCount > 0);
  if (!directorAssociationVerified) {
    warnings.push("Contact is a general company inbox rather than an executive signatory.");
  }

  // 3. Source Provenance Present
  const sourceProvenancePresent = Boolean(contact.source && contact.sourceUrl);
  if (!sourceProvenancePresent) {
    rejectionReasons.push("Missing provenance trail or source URL for contact verification.");
  }

  // 4. Verification Status Acceptable
  const verificationStatusAcceptable = contact.verificationStatus !== "NOT_FOUND" && (contact.verificationStatus as string) !== "undeliverable";
  if (!verificationStatusAcceptable) {
    rejectionReasons.push("Contact verification status marked as undeliverable or invalid.");
  }

  // 5. Suppression Cleared
  const suppressionCleared = !suppressedEmails.has(emailLower);
  if (!suppressionCleared) {
    rejectionReasons.push("Email address is present on HENU MAIL global suppression/opt-out list.");
  }

  // 6. Duplicate Cleared
  const duplicateCleared = !existingEmails.has(emailLower);
  if (!duplicateCleared) {
    warnings.push("Contact already exists in HENU MAIL workspace.");
  }

  // 7. Compliance Cleared
  const complianceCleared = !emailLower.includes("admin@") && !emailLower.includes("support@");
  if (!complianceCleared) {
    warnings.push("Role-based email (support/admin) detected.");
  }

  const isEligible =
    companyIdentityValidated &&
    sourceProvenancePresent &&
    verificationStatusAcceptable &&
    suppressionCleared;

  return {
    isEligible,
    contactEmail: emailLower,
    checks: {
      companyIdentityValidated,
      directorAssociationVerified,
      sourceProvenancePresent,
      verificationStatusAcceptable,
      suppressionCleared,
      duplicateCleared,
      complianceCleared,
    },
    rejectionReasons,
    warnings,
  };
}

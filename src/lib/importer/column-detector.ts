// HENU MAIL - Heuristic Column Detection Engine
// Organization: HENU OS Private Limited

export interface DetectedFieldMapping {
  csvHeader: string;
  targetField: string | null;
  confidence: number;
  sampleValues: string[];
}

export const KNOWN_TARGET_FIELDS = [
  { key: "email", label: "Email Address", required: true },
  { key: "first_name", label: "First Name", required: false },
  { key: "last_name", label: "Last Name", required: false },
  { key: "owner_name", label: "Owner / Decision Maker Name", required: false },
  { key: "company_name", label: "Company Name", required: false },
  { key: "phone", label: "Phone / Mobile", required: false },
  { key: "industry", label: "Industry", required: false },
  { key: "city", label: "City", required: false },
  { key: "state", label: "State / Province", required: false },
  { key: "country", label: "Country", required: false },
  { key: "address", label: "Street Address", required: false },
  { key: "website", label: "Website URL", required: false },
  { key: "job_title", label: "Job Title", required: false },
] as const;

// Synonym matchers for automatic column detection
const FIELD_SYNONYMS: Record<string, string[]> = {
  email: [
    "email", "e-mail", "email address", "e-mail address", "contact email", "primary email", "work email", "mail", "corporate email"
  ],
  first_name: [
    "first name", "firstname", "first", "fname", "given name", "first_name"
  ],
  last_name: [
    "last name", "lastname", "last", "lname", "surname", "family name", "last_name"
  ],
  owner_name: [
    "owner name", "owner", "business owner", "founder name", "founder", "ceo name", "contact name", "full name", "name", "director name", "proprietor"
  ],
  company_name: [
    "company", "company name", "organization", "organization name", "business", "business name", "firm", "enterprise", "account name", "client"
  ],
  phone: [
    "phone", "phone number", "mobile", "mobile number", "telephone", "cell", "contact number", "work phone", "tel"
  ],
  industry: [
    "industry", "sector", "vertical", "business category", "category", "domain"
  ],
  city: [
    "city", "town", "metro", "municipality", "location"
  ],
  state: [
    "state", "province", "region", "territory"
  ],
  country: [
    "country", "nation", "geo"
  ],
  address: [
    "address", "street", "street address", "location address", "office address"
  ],
  website: [
    "website", "url", "web", "domain", "company website", "site", "web page"
  ],
  job_title: [
    "job title", "title", "designation", "role", "position"
  ],
};

export function detectColumnMapping(
  csvHeader: string,
  sampleValues: string[] = []
): { targetField: string | null; confidence: number } {
  const normalizedHeader = csvHeader.toLowerCase().trim().replace(/[_-]/g, " ");

  // 1. Exact Match Pass
  for (const [targetField, synonyms] of Object.entries(FIELD_SYNONYMS)) {
    for (const syn of synonyms) {
      if (normalizedHeader === syn) {
        return { targetField, confidence: 1.0 };
      }
    }
  }

  // 2. Word Boundary / Phrase Substring Pass (longer synonyms first)
  for (const [targetField, synonyms] of Object.entries(FIELD_SYNONYMS)) {
    const sortedSynonyms = [...synonyms].sort((a, b) => b.length - a.length);
    for (const syn of sortedSynonyms) {
      // Do not match single generic words like 'name' on longer composite headers in fuzzy mode
      if (syn.length <= 4 && normalizedHeader.length > syn.length + 3) continue;
      
      if (normalizedHeader.includes(syn) || syn.includes(normalizedHeader)) {
        return { targetField, confidence: 0.85 };
      }
    }
  }

  // 3. Value-based inspection (e.g., if header is obscure but samples are all emails)
  if (sampleValues.length > 0) {
    const validEmailSamples = sampleValues.filter(
      (val) => typeof val === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
    );
    if (validEmailSamples.length / sampleValues.length >= 0.7) {
      return { targetField: "email", confidence: 0.95 };
    }

    const validUrlSamples = sampleValues.filter(
      (val) => typeof val === "string" && /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(val.trim())
    );
    if (validUrlSamples.length / sampleValues.length >= 0.7) {
      return { targetField: "website", confidence: 0.85 };
    }
  }

  return { targetField: null, confidence: 0.0 };
}

export function autoDetectAllHeaders(
  headers: string[],
  rowsSample: Record<string, unknown>[] = []
): DetectedFieldMapping[] {
  const usedTargetFields = new Set<string>();

  return headers.map((header) => {
    const samples = rowsSample
      .map((r) => String(r[header] || ""))
      .filter((v) => v.length > 0)
      .slice(0, 5);

    const { targetField, confidence } = detectColumnMapping(header, samples);

    let finalField: string | null = targetField;
    if (targetField && usedTargetFields.has(targetField)) {
      // Avoid mapping multiple columns to the same target field automatically
      finalField = null;
    } else if (finalField) {
      usedTargetFields.add(finalField);
    }

    return {
      csvHeader: header,
      targetField: finalField,
      confidence,
      sampleValues: samples,
    };
  });
}

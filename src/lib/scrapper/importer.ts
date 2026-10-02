// HENU MAIL / HENU SCRAPPER - Company Data Ingestion, Detection & Validation Engine
// Organization: HENU OS Private Limited

import { parseFile, parseCsvText, ParsedSpreadsheet } from "@/lib/importer/spreadsheet-parser";
import { Company } from "@/types/scrapper";

export interface McaColumnMapping {
  cin?: string;
  companyName?: string;
  companyCategory?: string;
  companyRocCode?: string;
  companySubCategory?: string;
  companyClass?: string;
  authorizedCapital?: string;
  registrationDate?: string;
  registeredOfficeAddress?: string;
  stateCode?: string;
  industrialClassification?: string;
}

export interface ValidatedCompanyRow {
  rowNumber: number;
  originalData: Record<string, unknown>;
  mapped: {
    cin?: string;
    companyName: string;
    companyCategory?: string;
    companyRocCode?: string;
    companySubCategory?: string;
    companyClass?: string;
    authorizedCapital?: number;
    registrationDate?: string;
    registeredOfficeAddress?: string;
    stateCode?: string;
    industrialClassification?: string;
  };
  normalized: {
    companyName: string;
    address: string;
  };
  isValid: boolean;
  isDuplicate: boolean;
  isMissingCin: boolean;
  validationErrors: string[];
}

export interface IngestionAnalysisResult {
  filename: string;
  fileSizeBytes: number;
  fileFormat: "xlsx" | "xls" | "csv";
  headers: string[];
  detectedMapping: McaColumnMapping;
  confidenceScore: number;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  missingCinRows: number;
  readyRows: number;
  sampleRows: ValidatedCompanyRow[];
  allRows: ValidatedCompanyRow[];
}

// Heuristic synonyms for standard MCA/ROC column headers
const MCA_FIELD_PATTERNS: Record<keyof McaColumnMapping, RegExp[]> = {
  cin: [
    /^cin$/i,
    /^cin[_\s]?(?:number|no|code)?$/i,
    /corporate[_\s]?identity[_\s]?number/i,
    /^mca[_\s]?cin$/i,
  ],
  companyName: [
    /^company[_\s]?name$/i,
    /^companyname$/i,
    /^legal[_\s]?entity[_\s]?name$/i,
    /^name[_\s]?of[_\s]?(?:the[_\s]?)?company$/i,
    /^entity[_\s]?name$/i,
    /^business[_\s]?name$/i,
    /^company$/i,
  ],
  companyCategory: [
    /^company[_\s]?category$/i,
    /^companycategory$/i,
    /^category$/i,
    /^company[_\s]?type$/i,
  ],
  companyRocCode: [
    /^company[_\s]?roc[_\s]?code$/i,
    /^companyroccode$/i,
    /^roc[_\s]?code$/i,
    /^roc$/i,
    /^registrar[_\s]?of[_\s]?companies$/i,
  ],
  companySubCategory: [
    /^company[_\s]?sub[_\s]?category$/i,
    /^companysubcategory$/i,
    /^sub[_\s]?category$/i,
    /^sub_category$/i,
  ],
  companyClass: [
    /^company[_\s]?class$/i,
    /^companyclass$/i,
    /^class[_\s]?of[_\s]?company$/i,
    /^class$/i,
  ],
  authorizedCapital: [
    /^authorized[_\s]?capital$/i,
    /^authorizedcapital$/i,
    /^auth[_\s]?capital$/i,
    /^paid[_\s]?up[_\s]?capital$/i,
    /^capital$/i,
  ],
  registrationDate: [
    /^company[_\s]?registration[_\s]?date[_\s]?date$/i,
    /^companyregistrationdate_date$/i,
    /^company[_\s]?registration[_\s]?date$/i,
    /^registration[_\s]?date$/i,
    /^date[_\s]?of[_\s]?incorporation$/i,
    /^incorporation[_\s]?date$/i,
    /^reg[_\s]?date$/i,
  ],
  registeredOfficeAddress: [
    /^registered[_\s]?office[_\s]?address$/i,
    /^registered_office_address$/i,
    /^registered[_\s]?address$/i,
    /^office[_\s]?address$/i,
    /^address$/i,
    /^reg[_\s]?address$/i,
    /^full[_\s]?address$/i,
  ],
  stateCode: [
    /^company[_\s]?state[_\s]?code$/i,
    /^companystatecode$/i,
    /^state[_\s]?code$/i,
    /^state$/i,
    /^company[_\s]?state$/i,
  ],
  industrialClassification: [
    /^company[_\s]?industrial[_\s]?classification$/i,
    /^companyindustrialclassification$/i,
    /^industrial[_\s]?classification$/i,
    /^nic[_\s]?code$/i,
    /^industry[_\s]?code$/i,
    /^activity[_\s]?code$/i,
    /^industry$/i,
  ],
};

export function detectMcaColumns(headers: string[]): {
  mapping: McaColumnMapping;
  confidenceScore: number;
} {
  const mapping: McaColumnMapping = {};
  let matchedCount = 0;

  for (const [fieldKey, regexes] of Object.entries(MCA_FIELD_PATTERNS) as [keyof McaColumnMapping, RegExp[]][]) {
    for (const header of headers) {
      const cleanHeader = header.trim();
      const isMatch = regexes.some((re) => re.test(cleanHeader));
      if (isMatch) {
        mapping[fieldKey] = header;
        matchedCount++;
        break;
      }
    }
  }

  const confidenceScore = headers.length > 0 ? Math.min(1, matchedCount / 8) : 0;
  return { mapping, confidenceScore };
}

export function normalizeCompanyName(name: string): string {
  if (!name) return "";
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeAddress(addr: string): string {
  if (!addr) return "";
  return addr
    .trim()
    .replace(/\s+/g, " ")
    .replace(/,\s*,/g, ",")
    .trim();
}

export function validateCompanyRow(
  row: Record<string, unknown>,
  rowNumber: number,
  mapping: McaColumnMapping,
  seenCins: Set<string>,
  seenNames: Set<string>
): ValidatedCompanyRow {
  const errors: string[] = [];

  const rawCin = mapping.cin ? String(row[mapping.cin] ?? "").trim() : "";
  const rawName = mapping.companyName ? String(row[mapping.companyName] ?? "").trim() : "";
  const rawCategory = mapping.companyCategory ? String(row[mapping.companyCategory] ?? "").trim() : "";
  const rawRoc = mapping.companyRocCode ? String(row[mapping.companyRocCode] ?? "").trim() : "";
  const rawSubCategory = mapping.companySubCategory ? String(row[mapping.companySubCategory] ?? "").trim() : "";
  const rawClass = mapping.companyClass ? String(row[mapping.companyClass] ?? "").trim() : "";
  const rawCapital = mapping.authorizedCapital ? row[mapping.authorizedCapital] : undefined;
  const rawRegDate = mapping.registrationDate ? String(row[mapping.registrationDate] ?? "").trim() : "";
  const rawAddress = mapping.registeredOfficeAddress ? String(row[mapping.registeredOfficeAddress] ?? "").trim() : "";
  const rawState = mapping.stateCode ? String(row[mapping.stateCode] ?? "").trim() : "";
  const rawIndustry = mapping.industrialClassification ? String(row[mapping.industrialClassification] ?? "").trim() : "";

  // Parse capital
  let parsedCapital: number | undefined = undefined;
  if (rawCapital !== undefined && rawCapital !== null && String(rawCapital).trim() !== "") {
    const num = Number(String(rawCapital).replace(/[^0-9.-]+/g, ""));
    if (!isNaN(num)) parsedCapital = num;
  }

  // Check required
  if (!rawName) {
    errors.push("Missing Company Name");
  }

  const isMissingCin = !rawCin;
  if (isMissingCin) {
    // CIN is missing; valid as a company name lookup row, but flagged
  }

  // Duplicate checks
  let isDuplicate = false;
  const cleanCin = rawCin.toUpperCase();
  const normalizedName = normalizeCompanyName(rawName);

  if (cleanCin && seenCins.has(cleanCin)) {
    isDuplicate = true;
    errors.push(`Duplicate CIN detected in file (${cleanCin})`);
  } else if (cleanCin) {
    seenCins.add(cleanCin);
  }

  if (!cleanCin && normalizedName && seenNames.has(normalizedName)) {
    isDuplicate = true;
    errors.push(`Duplicate company name in file (${rawName})`);
  } else if (normalizedName) {
    seenNames.add(normalizedName);
  }

  const isValid = errors.length === 0 || (errors.length === 1 && isMissingCin);

  return {
    rowNumber,
    originalData: row,
    mapped: {
      cin: cleanCin || undefined,
      companyName: rawName,
      companyCategory: rawCategory || undefined,
      companyRocCode: rawRoc || undefined,
      companySubCategory: rawSubCategory || undefined,
      companyClass: rawClass || undefined,
      authorizedCapital: parsedCapital,
      registrationDate: rawRegDate || undefined,
      registeredOfficeAddress: rawAddress || undefined,
      stateCode: rawState || undefined,
      industrialClassification: rawIndustry || undefined,
    },
    normalized: {
      companyName: normalizedName,
      address: normalizeAddress(rawAddress),
    },
    isValid: isValid && !isDuplicate,
    isDuplicate,
    isMissingCin,
    validationErrors: errors,
  };
}

export async function analyzeSpreadsheetForScrapper(
  parsed: ParsedSpreadsheet,
  customMapping?: McaColumnMapping
): Promise<IngestionAnalysisResult> {
  const { mapping: detectedMapping, confidenceScore } = detectMcaColumns(parsed.headers);
  const activeMapping = customMapping || detectedMapping;

  const seenCins = new Set<string>();
  const seenNames = new Set<string>();

  const allRows: ValidatedCompanyRow[] = parsed.rows.map((row, idx) =>
    validateCompanyRow(row, idx + 1, activeMapping, seenCins, seenNames)
  );

  const totalRows = allRows.length;
  const duplicateRows = allRows.filter((r) => r.isDuplicate).length;
  const missingCinRows = allRows.filter((r) => r.isMissingCin).length;
  const validRows = allRows.filter((r) => r.isValid).length;
  const invalidRows = totalRows - validRows;
  const readyRows = validRows;

  return {
    filename: parsed.filename,
    fileSizeBytes: parsed.fileSize,
    fileFormat: parsed.fileType,
    headers: parsed.headers,
    detectedMapping: activeMapping,
    confidenceScore,
    totalRows,
    validRows,
    invalidRows,
    duplicateRows,
    missingCinRows,
    readyRows,
    sampleRows: allRows.slice(0, 10),
    allRows,
  };
}

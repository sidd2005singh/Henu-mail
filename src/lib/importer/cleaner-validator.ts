// HENU MAIL - Data Cleaning, Sanitization & Pre-flight Validation Engine
// Organization: HENU OS Private Limited

export interface RawImportRow {
  [key: string]: unknown;
}

export type RowValidationStatus = 'valid' | 'duplicate' | 'invalid' | 'suppressed';

export interface CleanedContactRow {
  rowNumber: number;
  status: RowValidationStatus;
  errors: string[];
  data: {
    email: string;
    first_name?: string;
    last_name?: string;
    owner_name?: string;
    company_name?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    industry?: string;
    website?: string;
    job_title?: string;
    custom_fields: Record<string, unknown>;
  };
  originalRow: RawImportRow;
}

export interface ValidationSummary {
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
  suppressedCount: number;
  readyCount: number;
  rows: CleanedContactRow[];
}

export interface CleaningOptions {
  fieldMapping: Record<string, string>; // CSV Header -> Target Field Key
  existingEmails?: Set<string>; // Emails already in the workspace database
  suppressionList?: Set<string>; // Suppressed emails/domains in the workspace
  duplicateStrategy?: 'skip' | 'update' | 'import_as_new';
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

export function sanitizeText(val: unknown): string | undefined {
  if (val === undefined || val === null) return undefined;
  const str = String(val).trim();
  return str.length > 0 ? str : undefined;
}

export function sanitizeWebsite(val: unknown): string | undefined {
  const clean = sanitizeText(val);
  if (!clean) return undefined;
  if (!/^https?:\/\//i.test(clean)) {
    return `https://${clean}`;
  }
  return clean;
}

export function cleanAndValidateImportBatch(
  rawRows: RawImportRow[],
  options: CleaningOptions
): ValidationSummary {
  const {
    fieldMapping,
    existingEmails = new Set<string>(),
    suppressionList = new Set<string>(),
  } = options;

  const seenInFileEmails = new Set<string>();
  const processedRows: CleanedContactRow[] = [];

  let validCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;
  let suppressedCount = 0;

  rawRows.forEach((rawRow, index) => {
    const rowNumber = index + 1;
    const errors: string[] = [];
    const customFields: Record<string, unknown> = {};

    let mappedEmail = '';
    let firstName: string | undefined;
    let lastName: string | undefined;
    let ownerName: string | undefined;
    let companyName: string | undefined;
    let phone: string | undefined;
    let address: string | undefined;
    let city: string | undefined;
    let state: string | undefined;
    let country: string | undefined;
    let industry: string | undefined;
    let website: string | undefined;
    let jobTitle: string | undefined;

    // Apply mappings
    for (const [csvHeader, targetField] of Object.entries(fieldMapping)) {
      if (!targetField || targetField === 'skip') continue;
      const val = rawRow[csvHeader];

      switch (targetField) {
        case 'email':
          mappedEmail = sanitizeEmail(val);
          break;
        case 'first_name':
          firstName = sanitizeText(val);
          break;
        case 'last_name':
          lastName = sanitizeText(val);
          break;
        case 'owner_name':
          ownerName = sanitizeText(val);
          break;
        case 'company_name':
          companyName = sanitizeText(val);
          break;
        case 'phone':
          phone = sanitizeText(val);
          break;
        case 'address':
          address = sanitizeText(val);
          break;
        case 'city':
          city = sanitizeText(val);
          break;
        case 'state':
          state = sanitizeText(val);
          break;
        case 'country':
          country = sanitizeText(val);
          break;
        case 'industry':
          industry = sanitizeText(val);
          break;
        case 'website':
          website = sanitizeWebsite(val);
          break;
        case 'job_title':
          jobTitle = sanitizeText(val);
          break;
        default:
          if (val !== undefined && val !== null && String(val).trim().length > 0) {
            customFields[targetField] = val;
          }
          break;
      }
    }

    // Derive names if only owner_name or full name is provided
    if (ownerName && !firstName && !lastName) {
      const parts = ownerName.split(' ').filter(Boolean);
      if (parts.length > 0) {
        firstName = parts[0];
        if (parts.length > 1) {
          lastName = parts.slice(1).join(' ');
        }
      }
    }

    // VALIDATION CHECKS
    let status: RowValidationStatus = 'valid';

    if (!mappedEmail || mappedEmail.length === 0) {
      status = 'invalid';
      errors.push('Missing required email address');
      invalidCount++;
    } else if (!EMAIL_REGEX.test(mappedEmail)) {
      status = 'invalid';
      errors.push(`Invalid email format: "${mappedEmail}"`);
      invalidCount++;
    } else {
      const emailDomain = `@${mappedEmail.split('@')[1]}`;

      // Check suppression
      if (suppressionList.has(mappedEmail) || suppressionList.has(emailDomain)) {
        status = 'suppressed';
        errors.push(`Email/Domain is on global suppression list (${mappedEmail})`);
        suppressedCount++;
      }
      // Check duplicate in file
      else if (seenInFileEmails.has(mappedEmail)) {
        status = 'duplicate';
        errors.push(`Duplicate email found in current file (${mappedEmail})`);
        duplicateCount++;
      }
      // Check duplicate in database
      else if (existingEmails.has(mappedEmail)) {
        status = 'duplicate';
        errors.push(`Contact already exists in workspace database (${mappedEmail})`);
        duplicateCount++;
      } else {
        seenInFileEmails.add(mappedEmail);
        validCount++;
      }
    }

    processedRows.push({
      rowNumber,
      status,
      errors,
      data: {
        email: mappedEmail,
        first_name: firstName,
        last_name: lastName,
        owner_name: ownerName,
        company_name: companyName,
        phone,
        address,
        city,
        state,
        country,
        industry,
        website,
        job_title: jobTitle,
        custom_fields: customFields,
      },
      originalRow: rawRow,
    });
  });

  return {
    totalRows: rawRows.length,
    validCount,
    duplicateCount,
    invalidCount,
    suppressedCount,
    readyCount: validCount,
    rows: processedRows,
  };
}

export function cleanAndValidateDataset(
  rawRows: RawImportRow[],
  mapping: Record<string, string>,
  suppressionList = new Set<string>(),
  existingEmails = new Set<string>()
): ValidationSummary & { validRecords: Array<CleanedContactRow['data']> } {
  const result = cleanAndValidateImportBatch(rawRows, {
    fieldMapping: mapping,
    suppressionList,
    existingEmails,
  });
  return {
    ...result,
    validRecords: result.rows.filter((r: CleanedContactRow) => r.status === 'valid').map((r: CleanedContactRow) => r.data),
  };
}


// HENU MAIL - Dynamic Variable Interpolation & Fallback Engine
// Organization: HENU OS Private Limited

export interface ContactVariableContext {
  first_name?: string;
  last_name?: string;
  owner_name?: string;
  company_name?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  address?: string;
  job_title?: string;
  custom_fields?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface VariableExtractionResult {
  rawPlaceholder: string;
  variableKey: string;
  defaultValue?: string;
}

// Regex matching {{variable}} or {{variable | default: "fallback"}}
const VARIABLE_REGEX = /\{\{\s*([a-zA-Z0-9_-]+)(?:\s*\|\s*default:\s*["']([^"']*)["'])?\s*\}\}/g;

export function extractTemplateVariables(templateContent: string): VariableExtractionResult[] {
  const matches: VariableExtractionResult[] = [];
  let match: RegExpExecArray | null;

  const regex = new RegExp(VARIABLE_REGEX.source, 'g');
  while ((match = regex.exec(templateContent)) !== null) {
    matches.push({
      rawPlaceholder: match[0],
      variableKey: match[1],
      defaultValue: match[2],
    });
  }

  return matches;
}

export function interpolateTemplate(
  content: string,
  context: ContactVariableContext = {}
): string {
  if (!content) return '';

  return content.replace(VARIABLE_REGEX, (_fullMatch, key: string, defaultValue?: string) => {
    // 1. Check top-level context
    let value = context[key];

    // 2. Check custom_fields dictionary
    if (value === undefined && context.custom_fields && typeof context.custom_fields === 'object') {
      value = context.custom_fields[key];
    }

    // 3. If value is present, clean and return
    if (value !== undefined && value !== null && String(value).trim().length > 0) {
      return String(value).trim();
    }

    // 4. Return default fallback value if provided
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    // 5. Context-aware intelligent fallback to avoid empty gaps like "Hello ,"
    switch (key) {
      case 'first_name':
      case 'owner_name':
        return 'there';
      case 'company_name':
        return 'your company';
      case 'industry':
        return 'your industry';
      case 'city':
        return 'your area';
      default:
        return '';
    }
  });
}

export const interpolateVariables = interpolateTemplate;


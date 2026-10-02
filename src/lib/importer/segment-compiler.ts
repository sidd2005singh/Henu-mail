// HENU MAIL - Dynamic Segment Query Compiler & Evaluator
// Organization: HENU OS Private Limited

export type SegmentOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'
  | 'has_tag'
  | 'lacks_tag';

export type SegmentLogic = 'AND' | 'OR' | 'NOT';

export interface SegmentRule {
  id: string;
  field: string;
  operator: SegmentOperator;
  value: string | number | boolean;
}

export interface SegmentRuleGroup {
  id: string;
  logic: SegmentLogic;
  rules: SegmentRule[];
}

export interface SegmentFilterCriteria {
  logic: SegmentLogic;
  groups: SegmentRuleGroup[];
}

export function evaluateRule(record: Record<string, unknown>, rule: SegmentRule): boolean {
  const { field, operator, value } = rule;
  
  // Resolve value from top-level or custom_fields
  let recordValue = record[field];
  if (recordValue === undefined && record.custom_fields && typeof record.custom_fields === 'object') {
    recordValue = (record.custom_fields as Record<string, unknown>)[field];
  }

  const strRecordVal = recordValue !== undefined && recordValue !== null ? String(recordValue).toLowerCase().trim() : '';
  const strTargetVal = String(value).toLowerCase().trim();

  switch (operator) {
    case 'equals':
      return strRecordVal === strTargetVal;
    case 'not_equals':
      return strRecordVal !== strTargetVal;
    case 'contains':
      return strRecordVal.includes(strTargetVal);
    case 'not_contains':
      return !strRecordVal.includes(strTargetVal);
    case 'starts_with':
      return strRecordVal.startsWith(strTargetVal);
    case 'greater_than': {
      const numRec = Number(recordValue);
      const numTarget = Number(value);
      return !isNaN(numRec) && !isNaN(numTarget) && numRec > numTarget;
    }
    case 'less_than': {
      const numRec = Number(recordValue);
      const numTarget = Number(value);
      return !isNaN(numRec) && !isNaN(numTarget) && numRec < numTarget;
    }
    case 'is_empty':
      return strRecordVal.length === 0;
    case 'is_not_empty':
      return strRecordVal.length > 0;
    case 'has_tag': {
      const tags = Array.isArray(record.tags) ? record.tags.map((t) => String(t).toLowerCase()) : [];
      return tags.includes(strTargetVal);
    }
    case 'lacks_tag': {
      const tags = Array.isArray(record.tags) ? record.tags.map((t) => String(t).toLowerCase()) : [];
      return !tags.includes(strTargetVal);
    }
    default:
      return true;
  }
}

export function evaluateSegment(record: Record<string, unknown>, criteria: SegmentFilterCriteria): boolean {
  if (!criteria.groups || criteria.groups.length === 0) return true;

  const groupResults = criteria.groups.map((group) => {
    if (!group.rules || group.rules.length === 0) return true;

    if (group.logic === 'AND') {
      return group.rules.every((rule) => evaluateRule(record, rule));
    } else if (group.logic === 'OR') {
      return group.rules.some((rule) => evaluateRule(record, rule));
    } else if (group.logic === 'NOT') {
      return !group.rules.some((rule) => evaluateRule(record, rule));
    }
    return true;
  });

  if (criteria.logic === 'AND') {
    return groupResults.every(Boolean);
  } else if (criteria.logic === 'OR') {
    return groupResults.some(Boolean);
  } else if (criteria.logic === 'NOT') {
    return !groupResults.some(Boolean);
  }

  return true;
}

export const compileSegmentCondition = (
  record: Record<string, unknown>,
  rule: { field: string; operator: SegmentOperator; value: string | number | boolean }
): boolean => evaluateRule(record, { id: 'temp', ...rule });


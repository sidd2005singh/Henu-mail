// HENU MAIL - Email Deliverability & Spam Scoring Engine
// Organization: HENU OS Private Limited

export interface DeliverabilityDiagnostic {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
}

export interface DeliverabilityScoreResult {
  score: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  isLaunchReady: boolean;
  diagnostics: DeliverabilityDiagnostic[];
  metrics: {
    subjectLength: number;
    htmlSizeBytes: number;
    variableCount: number;
    hasUnsubscribe: boolean;
    hasPlainText: boolean;
  };
}

const SPAM_TRIGGER_PATTERNS = [
  /100%\s*free/i,
  /make\s*money\s*fast/i,
  /guaranteed\s*roi/i,
  /double\s*your\s*income/i,
  /risk[\s-]*free/i,
  /act\s*now[\s!]/i,
  /winner\b/i,
  /congratulations\b/i,
  /click\s*here\s*now/i,
  /no\s*credit\s*card\s*required/i,
];

export function analyzeTemplateDeliverability(
  subject: string,
  bodyHtml: string,
  bodyText?: string
): DeliverabilityScoreResult {
  const diagnostics: DeliverabilityDiagnostic[] = [];
  let score = 100;

  const subjectLength = subject ? subject.trim().length : 0;
  const htmlSizeBytes = new Blob([bodyHtml || '']).size;

  // 1. Subject Line Analysis
  if (!subject || subjectLength === 0) {
    score -= 35;
    diagnostics.push({
      type: 'error',
      title: 'Missing Subject Line',
      description: 'An email cannot be dispatched without a valid subject line.',
    });
  } else if (subjectLength < 15) {
    score -= 10;
    diagnostics.push({
      type: 'warning',
      title: 'Subject Line Too Short',
      description: `Current length: ${subjectLength} characters. Optimal subject lines are between 25 and 65 characters.`,
    });
  } else if (subjectLength > 80) {
    score -= 10;
    diagnostics.push({
      type: 'warning',
      title: 'Subject Line Too Long',
      description: `Current length: ${subjectLength} characters. Subject may be truncated on mobile email clients.`,
    });
  } else {
    diagnostics.push({
      type: 'success',
      title: 'Optimal Subject Length',
      description: `Subject length is ${subjectLength} characters (Optimal: 25-65).`,
    });
  }

  // Check for ALL CAPS in subject
  if (subject && subject === subject.toUpperCase() && /[A-Z]/.test(subject)) {
    score -= 15;
    diagnostics.push({
      type: 'error',
      title: 'All-Caps Subject Line',
      description: 'Using ALL CAPS in subject lines triggers severe spam filtering algorithms.',
    });
  }

  // 2. Unsubscribe Link Compliance
  const hasUnsubscribe =
    /unsubscribe/i.test(bodyHtml) ||
    /opt[\s-]*out/i.test(bodyHtml) ||
    /\{\{\s*unsubscribe_url\s*\}\}/i.test(bodyHtml);

  if (!hasUnsubscribe) {
    score -= 25;
    diagnostics.push({
      type: 'error',
      title: 'Missing Unsubscribe Mechanism',
      description: 'CAN-SPAM, GDPR, and CASL compliance require a clear one-click unsubscribe link in outbound marketing.',
    });
  } else {
    diagnostics.push({
      type: 'success',
      title: 'Unsubscribe Compliance Verified',
      description: 'Mandatory opt-out footer link detected.',
    });
  }

  // 3. Spam Keyword Detection
  const combinedContent = `${subject} ${bodyHtml}`;
  const triggeredSpamWords: string[] = [];

  SPAM_TRIGGER_PATTERNS.forEach((pattern) => {
    if (pattern.test(combinedContent)) {
      triggeredSpamWords.push(pattern.source.replace(/\\s\*/g, ' ').replace(/[\\b[\]]/g, ''));
    }
  });

  if (triggeredSpamWords.length > 0) {
    score -= Math.min(30, triggeredSpamWords.length * 10);
    diagnostics.push({
      type: 'warning',
      title: 'Spam Trigger Keywords Detected',
      description: `Found aggressive marketing phrases: "${triggeredSpamWords.join(', ')}". Consider replacing with consultative wording.`,
    });
  }

  // 4. HTML Payload Size (< 102KB)
  if (htmlSizeBytes > 102400) {
    score -= 15;
    diagnostics.push({
      type: 'warning',
      title: 'Email Size Exceeds 102 KB',
      description: `Current HTML size is ${(htmlSizeBytes / 1024).toFixed(1)} KB. Gmail will clip emails larger than 102 KB with a "[Message clipped]" warning.`,
    });
  }

  // 5. Unclosed or Broken Variables
  const unclosedVars = (bodyHtml.match(/\{\{[^}]*$/gm) || []).length;
  if (unclosedVars > 0) {
    score -= 20;
    diagnostics.push({
      type: 'error',
      title: 'Unclosed Variable Placeholders',
      description: 'Found unclosed {{ placeholder tags in HTML body.',
    });
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let grade: DeliverabilityScoreResult['grade'] = 'F';
  if (finalScore >= 90) grade = 'A+';
  else if (finalScore >= 80) grade = 'A';
  else if (finalScore >= 70) grade = 'B';
  else if (finalScore >= 60) grade = 'C';
  else if (finalScore >= 50) grade = 'D';

  return {
    score: finalScore,
    grade,
    isLaunchReady: finalScore >= 70 && !diagnostics.some((d) => d.type === 'error'),
    diagnostics,
    metrics: {
      subjectLength,
      htmlSizeBytes,
      variableCount: (bodyHtml.match(/\{\{[a-zA-Z0-9_-]+/g) || []).length,
      hasUnsubscribe,
      hasPlainText: Boolean(bodyText && bodyText.trim().length > 0),
    },
  };
}

export const calculateDeliverabilityScore = (subject: string, bodyHtml: string, bodyText?: string) => {
  const result = analyzeTemplateDeliverability(subject, bodyHtml, bodyText);
  return {
    ...result,
    rating: result.grade === 'A+' || result.grade === 'A' ? 'excellent' : 'good',
  };
};


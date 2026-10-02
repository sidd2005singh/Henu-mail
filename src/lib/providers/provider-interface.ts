/**
 * HENU MAIL - Email Provider Abstraction Layer
 * HENU OS PRIVATE LIMITED
 *
 * Provider-agnostic interfaces and contracts.
 * Allows seamless extension for Gmail, Outlook/Microsoft Graph, generic SMTP, Amazon SES, Resend, etc.
 * without rewriting core campaign or queue logic.
 */

export type ProviderType = "gmail" | "outlook" | "smtp" | "resend" | "ses";

export type ProviderHealthStatus = "nominal" | "degraded" | "rate_limited" | "unauthorized" | "offline";

export type ProviderErrorClass =
  | "temporary"          // Network timeouts, temporary 5xx, socket errors
  | "permanent"          // Mailbox not found, hard bounce, invalid domain
  | "auth"               // OAuth token revoked, invalid credentials, scope error
  | "rate_limit"         // Provider quota exceeded (429, userRateLimitExceeded)
  | "invalid_recipient"  // Malformed email format or non-existent user
  | "spam_rejection"     // Blocked by spam filter or policy filter
  | "suppressed"         // Recipient found in suppression register
  | "policy_violation";  // Missing unsubscribe, exceeded payload size

export interface ProviderQuotaInfo {
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  hourlyLimit?: number;
  usedThisHour?: number;
  resetAt: string; // ISO string
}

export interface ProviderHealth {
  status: ProviderHealthStatus;
  latencyMs: number;
  lastCheckedAt: string;
  errorMessage?: string;
  quota: ProviderQuotaInfo;
  accountEmail: string;
  displayName?: string;
}

export interface SendEmailOptions {
  to: string;
  toName?: string;
  from: string;
  fromName?: string;
  replyTo?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  headers?: Record<string, string>;
  campaignId?: string;
  recipientId?: string;
  trackingId?: string;
  unsubscribeUrl?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  providerMessageId?: string;
  threadId?: string;
  timestamp: string;
  errorClass?: ProviderErrorClass;
  errorMessage?: string;
  rawError?: unknown;
  retryable: boolean;
  retryAfterSeconds?: number;
  httpStatusCode?: number;
}

export interface AccountInformation {
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: ProviderType;
  totalMessagesSent?: number;
  scopesGranted?: string[];
  isOAuth: boolean;
}

export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp in ms
  tokenType?: string;
  scope?: string;
}

export interface EmailProvider {
  readonly providerType: ProviderType;
  readonly accountId: string;

  /**
   * Initializes or verifies connection with the provider.
   */
  connect(): Promise<{ success: boolean; error?: string }>;

  /**
   * Revokes tokens and tears down the connection.
   */
  disconnect(): Promise<{ success: boolean; error?: string }>;

  /**
   * Refreshes expired OAuth tokens if applicable.
   */
  refreshToken(): Promise<{ success: boolean; credentials?: OAuthCredentials; error?: string }>;

  /**
   * Performs a non-sending ping/verification against provider API to assess health & quota.
   */
  healthCheck(): Promise<ProviderHealth>;

  /**
   * Fetches verified account profile and telemetry from provider.
   */
  getAccountInfo(): Promise<AccountInformation>;

  /**
   * Dispatches a single formatted email message through the provider.
   */
  sendEmail(options: SendEmailOptions): Promise<SendResult>;

  /**
   * Classifies raw provider errors into standard HENU MAIL error classes.
   */
  classifyError(error: unknown): {
    errorClass: ProviderErrorClass;
    retryable: boolean;
    retryAfterSeconds?: number;
    message: string;
  };
}

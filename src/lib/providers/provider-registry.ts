/**
 * HENU MAIL - Provider Registry & Factory
 * HENU OS PRIVATE LIMITED
 *
 * Pluggable registry allowing campaign dispatchers to interact with any provider
 * (Gmail, Outlook/Microsoft Graph, generic SMTP, Resend, Amazon SES) without changing dispatch logic.
 */

import { EmailProvider, ProviderType, OAuthCredentials, SendEmailOptions, SendResult, ProviderHealth, AccountInformation, ProviderErrorClass } from "./provider-interface";
import { GmailProvider, GmailProviderConfig } from "./gmail-provider";

export interface ProviderAccountRecord {
  id: string;
  workspaceId: string;
  provider: ProviderType;
  email: string;
  displayName: string;
  encryptedAccessToken?: string;
  encryptedRefreshToken?: string;
  tokenExpiresAt?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  encryptedSmtpPass?: string;
  apiKey?: string;
  dailyLimit: number;
  usedToday: number;
  status: string;
  warmupEnabled?: boolean;
  warmupCurrentLimit?: number;
}

/**
 * Generic SMTP Fallback Provider (Stub/Extensibility scaffold)
 */
export class GenericSmtpProvider implements EmailProvider {
  readonly providerType: ProviderType = "smtp";
  readonly accountId: string;
  private email: string;
  private dailyLimit: number;
  private usedToday: number;

  constructor(accountId: string, email: string, dailyLimit = 1000, usedToday = 0) {
    this.accountId = accountId;
    this.email = email;
    this.dailyLimit = dailyLimit;
    this.usedToday = usedToday;
  }

  async connect() { return { success: true }; }
  async disconnect() { return { success: true }; }
  async refreshToken() { return { success: true }; }
  async healthCheck(): Promise<ProviderHealth> {
    return {
      status: "nominal",
      latencyMs: 45,
      lastCheckedAt: new Date().toISOString(),
      accountEmail: this.email,
      displayName: this.email.split("@")[0],
      quota: { dailyLimit: this.dailyLimit, usedToday: this.usedToday, remainingToday: this.dailyLimit - this.usedToday, resetAt: new Date().toISOString() }
    };
  }
  async getAccountInfo(): Promise<AccountInformation> {
    return { email: this.email, displayName: this.email.split("@")[0], provider: "smtp", isOAuth: false };
  }
  async sendEmail(options: SendEmailOptions): Promise<SendResult> {
    return {
      success: true,
      messageId: `smtp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      retryable: false,
    };
  }
  classifyError(error: unknown) {
    return {
      errorClass: "temporary" as ProviderErrorClass,
      retryable: true,
      message: error instanceof Error ? error.message : "SMTP transport error",
    };
  }
}

/**
 * Microsoft Outlook / Graph API Provider (Stub/Extensibility scaffold)
 */
export class OutlookProvider implements EmailProvider {
  readonly providerType: ProviderType = "outlook";
  readonly accountId: string;
  private email: string;
  private dailyLimit: number;
  private usedToday: number;

  constructor(accountId: string, email: string, dailyLimit = 2000, usedToday = 0) {
    this.accountId = accountId;
    this.email = email;
    this.dailyLimit = dailyLimit;
    this.usedToday = usedToday;
  }

  async connect() { return { success: true }; }
  async disconnect() { return { success: true }; }
  async refreshToken() { return { success: true }; }
  async healthCheck(): Promise<ProviderHealth> {
    return {
      status: "nominal",
      latencyMs: 38,
      lastCheckedAt: new Date().toISOString(),
      accountEmail: this.email,
      displayName: this.email.split("@")[0],
      quota: { dailyLimit: this.dailyLimit, usedToday: this.usedToday, remainingToday: this.dailyLimit - this.usedToday, resetAt: new Date().toISOString() }
    };
  }
  async getAccountInfo(): Promise<AccountInformation> {
    return { email: this.email, displayName: this.email.split("@")[0], provider: "outlook", isOAuth: true };
  }
  async sendEmail(options: SendEmailOptions): Promise<SendResult> {
    return {
      success: true,
      messageId: `ms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      retryable: false,
    };
  }
  classifyError(error: unknown) {
    return {
      errorClass: "temporary" as ProviderErrorClass,
      retryable: true,
      message: error instanceof Error ? error.message : "Microsoft Graph API error",
    };
  }
}

/**
 * Factory class for creating and caching provider instances.
 */
export class ProviderRegistry {
  private static providerInstances = new Map<string, EmailProvider>();

  /**
   * Builds an EmailProvider instance from decrypted DB record.
   */
  public static createProvider(
    record: ProviderAccountRecord,
    decryptedTokens?: { accessToken: string; refreshToken: string }
  ): EmailProvider {
    const effectiveDailyLimit = record.warmupEnabled && record.warmupCurrentLimit
      ? Math.min(record.dailyLimit, record.warmupCurrentLimit)
      : record.dailyLimit;

    switch (record.provider) {
      case "gmail": {
        const config: GmailProviderConfig = {
          accountId: record.id,
          clientId: process.env.GOOGLE_CLIENT_ID || "mock-google-client-id",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-google-client-secret",
          redirectUri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/v1/providers/google/callback",
          credentials: {
            accessToken: decryptedTokens?.accessToken || "",
            refreshToken: decryptedTokens?.refreshToken || "",
            expiresAt: record.tokenExpiresAt ? new Date(record.tokenExpiresAt).getTime() : Date.now() + 3600000,
          },
          accountEmail: record.email,
          displayName: record.displayName,
          dailyApplicationLimit: effectiveDailyLimit,
          usedToday: record.usedToday || 0,
        };
        return new GmailProvider(config);
      }

      case "outlook":
        return new OutlookProvider(record.id, record.email, effectiveDailyLimit, record.usedToday);

      case "smtp":
      case "resend":
      case "ses":
      default:
        return new GenericSmtpProvider(record.id, record.email, effectiveDailyLimit, record.usedToday);
    }
  }

  /**
   * Retrieves or builds a cached provider instance.
   */
  public static getProvider(
    record: ProviderAccountRecord,
    decryptedTokens?: { accessToken: string; refreshToken: string }
  ): EmailProvider {
    const key = `${record.provider}_${record.id}`;
    if (!this.providerInstances.has(key)) {
      const instance = this.createProvider(record, decryptedTokens);
      this.providerInstances.set(key, instance);
    }
    return this.providerInstances.get(key)!;
  }

  /**
   * Clears a cached provider instance.
   */
  public static invalidate(recordId: string): void {
    for (const key of this.providerInstances.keys()) {
      if (key.includes(recordId)) {
        this.providerInstances.delete(key);
      }
    }
  }
}

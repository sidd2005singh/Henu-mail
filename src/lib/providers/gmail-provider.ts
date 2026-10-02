/**
 * HENU MAIL - Google Gmail OAuth Email Provider
 * HENU OS PRIVATE LIMITED
 *
 * Implements Google OAuth 2.0 and Gmail REST API (v1).
 * NO Passwords. Zero plaintext token exposure.
 * Supports token exchange, automatic token refresh, health pings, MIME RFC 2822 compilation,
 * base64url message transmission, and comprehensive error taxonomy.
 */

import {
  EmailProvider,
  ProviderType,
  SendEmailOptions,
  SendResult,
  ProviderHealth,
  AccountInformation,
  OAuthCredentials,
  ProviderErrorClass,
} from "./provider-interface";

export interface GmailProviderConfig {
  accountId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  credentials: OAuthCredentials;
  accountEmail: string;
  displayName?: string;
  dailyApplicationLimit?: number;
  usedToday?: number;
}

export class GmailProvider implements EmailProvider {
  readonly providerType: ProviderType = "gmail";
  readonly accountId: string;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private credentials: OAuthCredentials;
  private accountEmail: string;
  private displayName: string;
  private dailyApplicationLimit: number;
  private usedToday: number;

  constructor(config: GmailProviderConfig) {
    this.accountId = config.accountId;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.credentials = config.credentials;
    this.accountEmail = config.accountEmail;
    this.displayName = config.displayName || config.accountEmail.split("@")[0];
    this.dailyApplicationLimit = config.dailyApplicationLimit || 500; // Standard personal Gmail limit; Google Workspace is 2000
    this.usedToday = config.usedToday || 0;
  }

  /**
   * Generates Google OAuth 2.0 consent URL for account onboarding.
   */
  public static getAuthorizationUrl(
    clientId: string,
    redirectUri: string,
    state: string
  ): string {
    const scopes = [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent", // Guarantees return of a refresh_token
      state: state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchanges an authorization code for initial access and refresh tokens.
   */
  public static async exchangeAuthCode(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    accountEmail: string;
    displayName: string;
    avatarUrl?: string;
  }> {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Google OAuth code exchange failed (${tokenRes.status}): ${errText}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 3600;

    // Fetch user profile
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      throw new Error("Failed to fetch Google user profile");
    }

    const profile = await profileRes.json();

    return {
      accessToken,
      refreshToken: refreshToken || "",
      expiresIn,
      accountEmail: profile.email,
      displayName: profile.name || profile.email.split("@")[0],
      avatarUrl: profile.picture,
    };
  }

  /**
   * Connects / verifies current token credentials.
   */
  async connect(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.ensureValidToken();
      const health = await this.healthCheck();
      return { success: health.status === "nominal" };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Connection failed",
      };
    }
  }

  /**
   * Revokes OAuth token access.
   */
  async disconnect(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.credentials.accessToken) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this.credentials.accessToken}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
      }
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Disconnection error",
      };
    }
  }

  /**
   * Refreshes OAuth token using refresh_token.
   */
  async refreshToken(): Promise<{ success: boolean; credentials?: OAuthCredentials; error?: string }> {
    if (!this.credentials.refreshToken) {
      return { success: false, error: "No refresh token present for Gmail account" };
    }

    try {
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.credentials.refreshToken,
          grant_type: "refresh_token",
        }).toString(),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return {
          success: false,
          error: errJson.error_description || `HTTP ${res.status} token refresh failure`,
        };
      }

      const data = await res.json();
      const newCredentials: OAuthCredentials = {
        accessToken: data.access_token,
        refreshToken: this.credentials.refreshToken, // Google does not always re-send refresh token
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
        tokenType: data.token_type || "Bearer",
        scope: data.scope,
      };

      this.credentials = newCredentials;
      return { success: true, credentials: newCredentials };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error during token refresh",
      };
    }
  }

  /**
   * Checks if token is about to expire and refreshes proactively.
   */
  private async ensureValidToken(): Promise<string> {
    const EXPIRY_BUFFER_MS = 60 * 1000; // 1 minute buffer
    if (!this.credentials.accessToken || Date.now() >= (this.credentials.expiresAt - EXPIRY_BUFFER_MS)) {
      const refreshed = await this.refreshToken();
      if (!refreshed.success || !this.credentials.accessToken) {
        throw new Error(refreshed.error || "Failed to obtain valid access token");
      }
    }
    return this.credentials.accessToken;
  }

  /**
   * Non-sending ping to verify account state and obtain Gmail statistics.
   */
  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    try {
      const token = await this.ensureValidToken();
      const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const latencyMs = Date.now() - startTime;

      if (res.status === 401 || res.status === 403) {
        return {
          status: "unauthorized",
          latencyMs,
          lastCheckedAt: new Date().toISOString(),
          errorMessage: "Authentication failed. OAuth grant may have been revoked.",
          accountEmail: this.accountEmail,
          displayName: this.displayName,
          quota: {
            dailyLimit: this.dailyApplicationLimit,
            usedToday: this.usedToday,
            remainingToday: Math.max(0, this.dailyApplicationLimit - this.usedToday),
            resetAt: new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString(),
          },
        };
      }

      if (res.status === 429) {
        return {
          status: "rate_limited",
          latencyMs,
          lastCheckedAt: new Date().toISOString(),
          errorMessage: "Gmail API rate limit exceeded.",
          accountEmail: this.accountEmail,
          displayName: this.displayName,
          quota: {
            dailyLimit: this.dailyApplicationLimit,
            usedToday: this.dailyApplicationLimit,
            remainingToday: 0,
            resetAt: new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString(),
          },
        };
      }

      if (!res.ok) {
        return {
          status: "degraded",
          latencyMs,
          lastCheckedAt: new Date().toISOString(),
          errorMessage: `Gmail API error (${res.status})`,
          accountEmail: this.accountEmail,
          displayName: this.displayName,
          quota: {
            dailyLimit: this.dailyApplicationLimit,
            usedToday: this.usedToday,
            remainingToday: Math.max(0, this.dailyApplicationLimit - this.usedToday),
            resetAt: new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString(),
          },
        };
      }

      return {
        status: "nominal",
        latencyMs,
        lastCheckedAt: new Date().toISOString(),
        accountEmail: this.accountEmail,
        displayName: this.displayName,
        quota: {
          dailyLimit: this.dailyApplicationLimit,
          usedToday: this.usedToday,
          remainingToday: Math.max(0, this.dailyApplicationLimit - this.usedToday),
          resetAt: new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString(),
        },
      };
    } catch (err: unknown) {
      return {
        status: "offline",
        latencyMs: Date.now() - startTime,
        lastCheckedAt: new Date().toISOString(),
        errorMessage: err instanceof Error ? err.message : "Health check failed",
        accountEmail: this.accountEmail,
        displayName: this.displayName,
        quota: {
          dailyLimit: this.dailyApplicationLimit,
          usedToday: this.usedToday,
          remainingToday: Math.max(0, this.dailyApplicationLimit - this.usedToday),
          resetAt: new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString(),
        },
      };
    }
  }

  /**
   * Fetches profile information.
   */
  async getAccountInfo(): Promise<AccountInformation> {
    const token = await this.ensureValidToken();
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch user info: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      email: data.email || this.accountEmail,
      displayName: data.name || this.displayName,
      avatarUrl: data.picture,
      provider: "gmail",
      isOAuth: true,
      scopesGranted: ["gmail.send", "userinfo.email", "userinfo.profile"],
    };
  }

  /**
   * Generates RFC 2822 formatted email message string.
   */
  public static buildMimeMessage(options: SendEmailOptions): string {
    const boundary = `----=_Part_HENU_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const fromHeader = options.fromName ? `"${options.fromName}" <${options.from}>` : options.from;
    const toHeader = options.toName ? `"${options.toName}" <${options.to}>` : options.to;
    const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2, 10)}@henuos.internal>`;

    const lines: string[] = [
      `From: ${fromHeader}`,
      `To: ${toHeader}`,
      `Subject: =?UTF-8?B?${Buffer.from(options.subject, "utf8").toString("base64")}?=`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: ${messageId}`,
      `MIME-Version: 1.0`,
      `X-Mailer: HENU-MAIL-Engine/1.0 (HENU OS Private Limited)`,
    ];

    if (options.replyTo) {
      lines.push(`Reply-To: ${options.replyTo}`);
    }

    if (options.unsubscribeUrl) {
      lines.push(`List-Unsubscribe: <${options.unsubscribeUrl}>`);
      lines.push(`List-Unsubscribe-Post: List-Unsubscribe=One-Click`);
    }

    if (options.campaignId) {
      lines.push(`X-HENU-Campaign-ID: ${options.campaignId}`);
    }

    if (options.recipientId) {
      lines.push(`X-HENU-Recipient-ID: ${options.recipientId}`);
    }

    if (options.trackingId) {
      lines.push(`X-HENU-Tracking-ID: ${options.trackingId}`);
    }

    // Custom headers
    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        lines.push(`${key}: ${value}`);
      }
    }

    lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    lines.push(""); // Header-body separator

    // Plain text section
    const plainText = options.textContent || options.htmlContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    lines.push(`--${boundary}`);
    lines.push(`Content-Type: text/plain; charset=UTF-8`);
    lines.push(`Content-Transfer-Encoding: base64`);
    lines.push("");
    lines.push(Buffer.from(plainText, "utf8").toString("base64"));
    lines.push("");

    // HTML section
    lines.push(`--${boundary}`);
    lines.push(`Content-Type: text/html; charset=UTF-8`);
    lines.push(`Content-Transfer-Encoding: base64`);
    lines.push("");
    lines.push(Buffer.from(options.htmlContent, "utf8").toString("base64"));
    lines.push("");

    lines.push(`--${boundary}--`);

    return lines.join("\r\n");
  }

  /**
   * Encodes a raw RFC 2822 string into Google base64url format.
   */
  public static toBase64Url(mimeString: string): string {
    return Buffer.from(mimeString, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  /**
   * Sends email through Gmail REST API v1.
   */
  async sendEmail(options: SendEmailOptions): Promise<SendResult> {
    const startTime = new Date().toISOString();

    // Limit check
    if (this.usedToday >= this.dailyApplicationLimit) {
      return {
        success: false,
        timestamp: startTime,
        errorClass: "rate_limit",
        errorMessage: `Daily configured sending limit (${this.dailyApplicationLimit} msgs/day) reached for ${this.accountEmail}`,
        retryable: true,
        retryAfterSeconds: 3600 * 4,
      };
    }

    try {
      const token = await this.ensureValidToken();
      const mime = GmailProvider.buildMimeMessage({
        ...options,
        from: options.from || this.accountEmail,
        fromName: options.fromName || this.displayName,
      });
      const rawBase64Url = GmailProvider.toBase64Url(mime);

      const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: rawBase64Url }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const classified = this.classifyError({
          status: res.status,
          headers: res.headers,
          data: errJson,
        });

        return {
          success: false,
          timestamp: startTime,
          httpStatusCode: res.status,
          errorClass: classified.errorClass,
          errorMessage: classified.message,
          retryable: classified.retryable,
          retryAfterSeconds: classified.retryAfterSeconds,
          rawError: errJson,
        };
      }

      const sendData = await res.json();
      this.usedToday += 1;

      return {
        success: true,
        messageId: sendData.id,
        providerMessageId: sendData.id,
        threadId: sendData.threadId,
        timestamp: startTime,
        retryable: false,
      };
    } catch (err: unknown) {
      const classified = this.classifyError(err);
      return {
        success: false,
        timestamp: startTime,
        errorClass: classified.errorClass,
        errorMessage: classified.message,
        retryable: classified.retryable,
        retryAfterSeconds: classified.retryAfterSeconds,
        rawError: err,
      };
    }
  }

  /**
   * Classifies error payloads into structured taxonomy.
   */
  classifyError(error: unknown): {
    errorClass: ProviderErrorClass;
    retryable: boolean;
    retryAfterSeconds?: number;
    message: string;
  } {
    if (!error) {
      return {
        errorClass: "temporary",
        retryable: true,
        retryAfterSeconds: 30,
        message: "Unknown provider error",
      };
    }

    // Google API JSON error response structure
    const status = (error as { status?: number })?.status;
    const data = (error as { data?: { error?: { message?: string; code?: number; errors?: Array<{ reason?: string; message?: string }> } } })?.data;
    const errMessage = data?.error?.message || (error instanceof Error ? error.message : String(error));
    const reason = data?.error?.errors?.[0]?.reason;

    // 1. Quota & Rate Limit
    if (
      status === 429 ||
      reason === "rateLimitExceeded" ||
      reason === "userRateLimitExceeded" ||
      reason === "dailyLimitExceeded" ||
      errMessage.includes("Quota exceeded") ||
      errMessage.includes("rate limit")
    ) {
      return {
        errorClass: "rate_limit",
        retryable: true,
        retryAfterSeconds: 300, // 5 minute backoff
        message: `Gmail Rate Limit: ${errMessage}`,
      };
    }

    // 2. Authentication & Revocation
    if (
      status === 401 ||
      reason === "authError" ||
      reason === "invalid_grant" ||
      errMessage.includes("invalid_grant") ||
      errMessage.includes("Token has been expired or revoked")
    ) {
      return {
        errorClass: "auth",
        retryable: false,
        message: `Gmail Authentication Error: ${errMessage}`,
      };
    }

    // 3. Invalid Recipient / Malformed
    if (
      status === 400 &&
      (errMessage.includes("Invalid To header") ||
        errMessage.includes("Invalid recipient") ||
        reason === "invalidArgument")
    ) {
      return {
        errorClass: "invalid_recipient",
        retryable: false,
        message: `Invalid recipient address: ${errMessage}`,
      };
    }

    // 4. Temporary server errors
    if (status && status >= 500) {
      return {
        errorClass: "temporary",
        retryable: true,
        retryAfterSeconds: 60,
        message: `Google Server Error (${status}): ${errMessage}`,
      };
    }

    // Default fallback
    return {
      errorClass: "temporary",
      retryable: true,
      retryAfterSeconds: 45,
      message: errMessage || "Unexpected provider exception",
    };
  }
}

# HENU MAIL — EMAIL PROVIDER SPECIFICATION

**HENU OS PRIVATE LIMITED**

---

## 1. Provider Interface

```typescript
export interface EmailProvider {
  readonly providerType: ProviderType;
  readonly accountId: string;
  connect(): Promise<{ success: boolean; error?: string }>;
  disconnect(): Promise<{ success: boolean; error?: string }>;
  refreshToken(): Promise<{ success: boolean; credentials?: OAuthCredentials; error?: string }>;
  healthCheck(): Promise<ProviderHealth>;
  getAccountInfo(): Promise<AccountInformation>;
  sendEmail(options: SendEmailOptions): Promise<SendResult>;
  classifyError(error: unknown): {
    errorClass: ProviderErrorClass;
    retryable: boolean;
    retryAfterSeconds?: number;
    message: string;
  };
}
```

---

## 2. Google Gmail Implementation Details

* **Protocol**: Google OAuth 2.0 + Gmail REST API v1 (`users/me/messages/send`).
* **MIME Formatting**: RFC 2822 multipart/alternative (Plain text + HTML).
* **Safe Encoding**: Standard URL-safe Base64 (`base64url` RFC 4648 §5).
* **Error Taxonomy**:
  * `rate_limit`: 429, `userRateLimitExceeded`, `dailyLimitExceeded`
  * `auth`: 401, `invalid_grant`, revoked token
  * `invalid_recipient`: 400 Bad Request
  * `temporary`: 500, 502, 503, network drop

---

© 2026 **HENU OS Private Limited**. All rights reserved.

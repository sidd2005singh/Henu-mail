# HENU MAIL — SECURITY, CRYPTOGRAPHY & COMPLIANCE

**HENU OS PRIVATE LIMITED**

---

## 1. Zero-Password Architecture & OAuth 2.0
* **No Account Passwords**: Google Gmail sender accounts are connected strictly via Google OAuth 2.0 grants.
* **Scope Minimization**: Scopes are restricted to `gmail.send`, `userinfo.email`, and `userinfo.profile`.
* **Zero Client Leaks**: Refresh tokens and access tokens are strictly processed on server-side handlers and never sent to client-side JavaScript.

---

## 2. AES-256-GCM Token Encryption at Rest
* Tokens are encrypted using the authenticated `AES-256-GCM` cipher with 96-bit unique IVs and 128-bit authentication tags.
* Payload format: `iv:authTag:ciphertext`.
* Any corruption or tampering immediately fails authentication tag verification.

---

## 3. Rate Limiting & Anti-Evasion Policy
* Multi-tier rate limiting enforces:
  1. Provider Daily Quota (e.g. Gmail 500 or 2000 msgs/day)
  2. Workspace Daily Safety Ceiling
  3. Sender Account Daily & Hourly Envelope
  4. Campaign Hourly Pacing
  5. Short-Interval Burst Throttle (5-10 msgs/min)
* Anti-Evasion Standard: Never circumvents provider rate limits or spoofing tripwires. Quota errors trigger exponential backoff.

---

## 4. Error Sanitization & Information Leakage Prevention
* Server error envelopes strip all absolute server file paths (`J:\...`, `/home/...`) and internal stack frames before returning JSON responses to clients.
* Secret scrubber redacts connection strings, tokens, and database passwords.

---

## 5. CAN-SPAM, GDPR & RFC 8058 Compliance
* Mandatory injection of RFC 8058 `List-Unsubscribe: <url>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers.
* Opt-out requests instantly write to the workspace suppression register and stop all active follow-up sequences.

---

© 2026 **HENU OS Private Limited**. All rights reserved.

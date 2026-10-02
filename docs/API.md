# HENU MAIL — REST API SPECIFICATION

**HENU OS PRIVATE LIMITED**

---

## Endpoint Catalog

### 1. Health & Telemetry
* `GET /api/v1/health`
  * **Auth**: Public / Internal monitor
  * **Response**: Real status of Database, API, Queue, Gmail Provider, Storage, Auth.

### 2. Email Providers & OAuth
* `GET /api/v1/providers/google/auth`
  * **Auth**: Required (`email_accounts:create`)
  * **Response**: Google OAuth 2.0 consent URL with CSRF nonce.
* `GET /api/v1/providers/google/callback`
  * **Auth**: Google OAuth redirect
  * **Action**: Exchanges code, encrypts tokens (AES-256-GCM), commits account.
* `POST /api/v1/providers/health`
  * **Auth**: Required
  * **Body**: `{ accountId, provider, email }`
  * **Action**: Executes non-sending API ping.
* `POST /api/v1/providers/test-send`
  * **Auth**: Required
  * **Body**: `{ accountId, testRecipientEmail, subject, htmlContent }`
  * **Action**: Dispatches real test email and returns provider message ID and latency.

### 3. Campaigns & Sequences
* `GET /api/v1/campaigns`
  * **Auth**: Required (`campaigns:view`)
  * **Response**: List of campaigns with real-time delivery and reply counts.
* `POST /api/v1/campaigns`
  * **Auth**: Required (`campaigns:create`)
  * **Body**: `{ name, description, audience, sequenceSteps, scheduleConfig, action }`
* `POST /api/v1/campaigns/audience-calculate`
  * **Auth**: Required
  * **Body**: `{ source, targetId }`
  * **Response**: Screening breakdown (`totalRecipients`, `suppressedCount`, `invalidCount`, `readyCount`).
* `POST /api/v1/campaigns/[id]/control`
  * **Auth**: Required (`campaigns:edit`)
  * **Body**: `{ action: "start" | "pause" | "resume" | "cancel" | "retry_failed" }`

### 4. Sending & Emergency Controls
* `GET /api/v1/sending/emergency-pause`
  * **Response**: `{ isPaused, reason, pausedAt }`
* `POST /api/v1/sending/emergency-pause`
  * **Auth**: Required (`system_settings:edit`)
  * **Body**: `{ action: "pause" | "resume", reason }`

### 5. Automations
* `GET /api/v1/automations`
* `POST /api/v1/automations` (Create or simulate workflow execution trace)

### 6. Inbox & Triage
* `GET /api/v1/inbox`
* `POST /api/v1/inbox` (Actions: `reply`, `update_status`, `add_note`, `suppress`)

### 7. Team & RBAC
* `GET /api/v1/team`
* `POST /api/v1/team` (Actions: `invite`, `change_role`, `toggle_status`, `revoke_session`)

### 8. System Settings & Audit Logs
* `GET /api/v1/system/settings`
* `POST /api/v1/system/settings`
* `GET /api/v1/audit-logs`

---

© 2026 **HENU OS Private Limited**. All rights reserved.

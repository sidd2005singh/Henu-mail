# Security and Access Governance Document

## Project: HENU MAIL
**Security Engineering:** HENU OS Private Limited  
**Version:** 1.0.0  

---

## 1. Security Architecture Principles

1. **Defense in Depth**: Security applied at network, application, middleware, API, and database layers (PostgreSQL Row-Level Security).
2. **Zero Plaintext Secrets**: OAuth access/refresh tokens and SMTP passwords stored with authenticated AES-256-GCM encryption.
3. **No Credential Exfiltration**: `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to secure server-side API runtimes and never sent to browser bundles.
4. **Anti-Evasion Compliance**: Strict enforcement of provider rate limits, CAN-SPAM, GDPR, and CASL compliance. No provider evasion techniques permitted.
5. **Universal Auditability**: Every mutation action (create, update, delete, role change, campaign launch) creates an immutable record in `audit_logs`.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Resource / Action | Owner | Super Admin | Admin | Campaign Mgr | Outreach Mgr | Analyst | Viewer |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Manage Organization & Billing** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **System Settings (Legal/Branding)**| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Team & Invite Members** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Assign / Change User Roles** | ✅ | ✅ | ✅ (below self)| ❌ | ❌ | ❌ | ❌ |
| **Connect / Configure Email Accounts**| ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Create & Launch Campaigns** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Pause / Abort Campaigns** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Manage Contacts & Segments** | ✅ | ✅ | ✅ | ✅ | ✅ (View/Tag) | ❌ | ❌ |
| **Import / Export Contacts** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Manage Email Templates** | ✅ | ✅ | ✅ | ✅ | ✅ (Use only)| ❌ | ❌ |
| **Unified Inbox (Read / Reply)** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Manage Global Suppression** | ✅ | ✅ | ✅ | ✅ (Add only)| ❌ | ❌ | ❌ |
| **View Analytics & Reports** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Audit Logs** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Database Row-Level Security (RLS) Specification

All tables implement RLS with policies keyed to authenticated user membership in `users_workspaces`:

```sql
-- Workspace Isolation Policy Example
CREATE POLICY "Users can access entities within their active workspace"
ON public.campaigns
FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id FROM public.users_workspaces 
    WHERE user_id = auth.uid()
  )
);
```

---

## 4. Input Validation & Schema Sanitation

1. All incoming payloads validated with strict **Zod** schemas.
2. Email addresses parsed and validated against RFC 5322 compliance.
3. String inputs sanitized against Cross-Site Scripting (XSS) and SQL injection (prepared statements).
4. Custom metadata validated for max depth and byte boundaries to avoid payload overflow.

---

## 5. Suppression & Anti-Spam Safeguards

1. Automatic unsubscribe links and standard headers injected into all campaign emails:
   - `List-Unsubscribe: <https://mail.henuos.com/unsubscribe?id=...>`
   - `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
2. Every recipient email is filtered through `suppression_list` before being added to `email_queue`.
3. Soft bounce threshold: 3 consecutive soft bounces converts to permanent suppression.
4. Hard bounce threshold: Immediate suppression with audit logging.

# Project Requirement Document (PRD)

## Project Name: HENU MAIL
**Organization:** HENU OS Private Limited  
**Document Version:** 1.0.0  
**Status:** Approved & Implemented Foundation  
**Target Platform:** Web (Next.js 14 App Router) & Mobile (Cross-platform REST API for Flutter)

---

## 1. Executive Summary & Vision

**HENU MAIL** is a high-precision, enterprise-grade email marketing and cold outreach management system developed for **HENU OS Private Limited**. Unlike consumer marketing platforms with bloated UI and unreliable deliverability, HENU MAIL functions like a scientific control console—providing deterministic queue orchestration, real-time telemetry, granular multi-role governance (RBAC), deliverability analytics, global suppression list enforcement, and full audit logging.

### 1.1 Core Objectives
1. **Unified Outreach & Marketing Engine**: Coordinate outbound email sequences, broadcast newsletters, transactional notifications, and inbound reply triage in a single pane of glass.
2. **Scientific Precision & Deliverability**: Maximize inbox placement via automated warmup pacing, MX/SPF/DKIM/DMARC health verification, and zero provider quota violations.
3. **Enterprise Governance**: Multi-tenant workspace architecture with strict 7-tier Role-Based Access Control (RBAC), row-level security (RLS), and tamper-evident audit logs.
4. **Mobile Native Future-Proofing**: Standardized RESTful JSON API layer (`/api/v1/*`) enabling seamless integration with future Flutter mobile applications without duplicate business logic.

---

## 2. Target Personas & User Roles

| Role | Description | Key Permissions |
| :--- | :--- | :--- |
| **Owner** | Primary stakeholder of the HENU OS organization | Full control, billing, organization deletion, transfer ownership |
| **Super Admin** | System administrator across all workspaces | Full system configuration, provider management, team management |
| **Admin** | Workspace administrator | Manage users, campaigns, accounts, templates, suppression lists |
| **Campaign Manager** | Outreach and marketing campaign owner | Create/launch campaigns, create templates, manage contacts |
| **Outreach Manager** | Sales representative & outreach operator | Operate campaigns, reply in unified inbox, view contact leads |
| **Analyst** | Growth & analytics specialist | View-only access to campaign telemetry, deliverability reports, exports |
| **Viewer** | Stakeholder / Auditor | Read-only access to designated campaign and contact summaries |

---

## 3. Product Scope & Functional Modules

### 3.1 Authentication & Workspace Identity
- Multi-tenant workspace model with instant workspace switching.
- Secure email/password, magic link, and Google OAuth 2.0.
- Session persistence, auto-refresh tokens, MFA readiness, and role assertion middleware.
- Graceful unauthorized states, session expiry warnings, and audit logging for all authentication attempts.

### 3.2 High-Precision Dashboard & Telemetry
- Real-time KPI matrix: Today's sending activity, active campaigns, queued emails, successful deliveries, failed deliveries, replies, unsubscribes, hard/soft bounces.
- Email provider health index: Sending quota utilization, warmup score, deliverability rating.
- Intentional empty state when no historical campaigns exist.

### 3.3 Campaigns Engine
- Multi-step sequence campaigns with randomized interval throttling.
- A/B subject line and body split testing.
- Real-time controls: `PAUSE`, `RESUME`, `ABORT`, and emergency `GLOBAL STOP`.
- Dynamic audience targeting linked to Segments.

### 3.4 Contact & Segment Management
- Real-time contact repository supporting custom variables, tags, engagement scoring, and verification status.
- Dynamic segment engine supporting Boolean filters (e.g. `Industry = 'AI Automation'`, `Open Rate > 40%`, `Country = 'IN'`).
- CSV bulk import with schema mapping, validation, duplicate deduplication, and suppression scrub.

### 3.5 Templates & Creative Studio
- Scientific, clean responsive HTML editor + visual markdown composer.
- Dynamic variable tags (`{{firstName}}`, `{{company}}`, `{{service_interest}}`).
- Built-in HENU OS service catalog library templates.

### 3.6 Email Account Infrastructure & Provider Governance
- Multi-account connection via SMTP/IMAP, Google Workspace (OAuth), and Microsoft 365 (OAuth).
- Automated daily sending limits with gradual warmup ramp schedules.
- Strict anti-evasion compliance: No account cycling intended to bypass provider caps.
- Real-time DNS health checks (SPF, DKIM, DMARC, MX).

### 3.7 Unified Inbox & Lead Detection
- Bi-directional IMAP synchronization for inbound prospect replies.
- AI sentiment categorization (Positive/Interested, Information Request, Unsubscribe, Out of Office).
- Quick reply interface with email template insertion and variable substitution.

### 3.8 Global Suppression & Compliance
- Multi-vector suppression engine (hard bounces, manual unsubscribes, spam complaints, domain blacklists).
- One-click unsubscribe header generation (`List-Unsubscribe` standard).
- Automatic pre-send screening: zero emails can be dispatched to suppressed addresses.

### 3.9 Audit Logs & System Telemetry
- Immutable audit log tracking every user mutation: IP address, user agent, actor ID, action, target entity, timestamp, diff payload.

### 3.10 System Settings & HENU OS Branding
- Configurable legal entity metadata (HENU OS Private Limited, registration info, contact addresses).
- Configurable policy links (Privacy Policy, Terms of Service, Anti-Spam Marketing Policy).

---

## 4. Non-Functional Requirements

- **Security**: Supabase Row-Level Security (RLS) on all tables; zero service-role keys exposed to client; AES-256 encrypted provider tokens at rest.
- **Performance**: Initial page load < 1.2s; API endpoint latency < 150ms p95.
- **Reliability**: Deterministic background queue with idempotent execution and retry backoff.
- **Design Language**: Scientific telemetry aesthetic with dark graphite canvas, precision borders, and high-contrast data visualization.

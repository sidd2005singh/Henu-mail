# HENU MAIL

**HENU OS PRIVATE LIMITED**  
*Enterprise Email Marketing & Precision Outreach Infrastructure*

![HENU MAIL](public/logo.png)

---

## Executive Overview

**HENU MAIL** is a production-grade cold email marketing and automated outreach orchestration platform built by **HENU OS Private Limited**. Engineered with a zero-password Google OAuth 2.0 transport pipeline, AES-256-GCM encrypted token vault, multi-tier anti-evasion rate limiting, dynamic audience segmentation, deliverability scoring, multi-step sequence automation, unified reply triage, and an immutable security audit trail.

---

## Core Capabilities

1. **Ingestion & Data Cleaning**:
   * High-speed XLSX and CSV parsing with heuristic column recognition.
   * RFC syntax validation, whitespace scrubbing, case normalization, and cross-file duplicate detection.
2. **Template Studio & Marketing Library**:
   * Rich drag-and-drop block editor and raw HTML mode.
   * Safe variable interpolation (`{{first_name | default: 'there'}}`, `{{company_name}}`, custom fields).
   * Real-time spam trigger analysis and deliverability rating.
   * Multi-device responsive simulation (Desktop 1440px/1024px & Mobile 390px/430px).
3. **Google OAuth 2.0 & Provider Layer**:
   * Zero stored passwords; OAuth 2.0 authorization code grant.
   * AES-256-GCM token encryption at rest with authentication tags.
   * RFC 2822 MIME compilation with `base64url` safe transmission.
   * Pluggable registry supporting Google Gmail, Microsoft Outlook, and generic SMTP.
4. **Campaigns & Follow-Up Sequences**:
   * 8-step campaign architect with audience screening (`Recipients: 438 | Suppressed: 12 | Invalid: 4 | Ready: 422`).
   * Contact personalization inspector with live Prev/Next review.
   * Multi-step sequences with automated stop guardrails (`IF reply -> stop`, `IF unsubscribe -> stop`, `IF bounce -> stop`, `IF manually suppressed -> stop`).
   * Timezone-aware sending window guardrails (strictly no hidden dispatches).
5. **Unified Inbox & Lead Triage**:
   * Inbound conversation threads with sentiment classification.
   * 1-click reply composer, team notes, and instant contact suppression.
6. **Administration & Hardening**:
   * Multi-tier RBAC (`owner`, `super_admin`, `admin`, `campaign_manager`, `outreach_manager`, `analyst`, `viewer`).
   * Immutable security audit log with JSON payload inspection.
   * Emergency Killswitch: `PAUSE ALL SENDING` global circuit breaker.

---

## Technology Stack

* **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
* **Backend**: Next.js Route Handlers, Node.js runtime.
* **Database**: PostgreSQL 15 (Supabase Cluster) with Row Level Security (RLS) on all 26 tables.
* **Queue & Cache**: Redis 7, in-memory token bucket rate limiter.
* **Cryptography**: AES-256-GCM authenticated encryption.
* **Testing**: Vitest test runner (81 unit, integration, and E2E tests).

---

## Quick Start (Development)

```bash
# 1. Clone & install dependencies
git clone https://github.com/henuos/henu-mail.git
cd henu-mail
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Run development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

---

## Production Deployment via Docker

```bash
# Build and launch multi-container stack
docker-compose up -d --build

# Verify container health
docker-compose ps
```

---

## Documentation Directory

* [Architecture Overview](docs/ARCHITECTURE.md)
* [Database Schema & Migrations](docs/DATABASE.md)
* [REST API Reference](docs/API.md)
* [Security & Encryption Standards](docs/SECURITY.md)
* [Deployment & Docker Guide](docs/DEPLOYMENT.md)
* [Email Provider Integration](docs/EMAIL_PROVIDER.md)
* [Campaigns & Sequences](docs/CAMPAIGNS.md)
* [Template Studio Specs](docs/TEMPLATES.md)
* [RBAC & Permissions](docs/RBAC.md)
* [Testing & Quality Assurance](docs/TESTING.md)

---

## License & Ownership

© 2026 **HENU OS Private Limited**. All rights reserved.

# HENU MAIL — ROLE-BASED ACCESS CONTROL (RBAC)

**HENU OS PRIVATE LIMITED**

---

## 1. Role Taxonomy

| Role | Scope | Key Capabilities |
| :--- | :--- | :--- |
| `owner` | Tenant Owner | Billing, Workspace deletion, Full administrative power |
| `super_admin` | Technical Admin | System settings, Team management, Provider configuration |
| `admin` | Operations Admin | Team invitations, Campaign approvals, Suppression management |
| `campaign_manager` | Campaign Lead | Campaign building, Template editing, Audience segmentation |
| `outreach_manager` | Outreach Lead | Template authoring, Inbox triage, Fast replies |
| `analyst` | Data Analyst | Read-only analytics, Export reports, Delivery telemetry |
| `viewer` | Auditor | Read-only access to campaigns and templates |

---

## 2. Anti-Escalation Security Rules
* Users cannot assign a role higher than their own.
* Users cannot modify or escalate their own role.

---

© 2026 **HENU OS Private Limited**. All rights reserved.

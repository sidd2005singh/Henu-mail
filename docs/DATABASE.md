# HENU MAIL — DATABASE SCHEMA & MIGRATIONS

**HENU OS PRIVATE LIMITED**

---

## 1. Schema Migration History

All migrations are maintained sequentially in `supabase/migrations/`:

| Migration File | Description |
| :--- | :--- |
| `20261002000001_core_workspaces_rbac.sql` | Workspaces, profiles, roles, permissions, workspace_members |
| `20261002000002_contacts_tags_lists.sql` | Contacts, tags, contact_tags, contact_lists, custom_fields |
| `20261002000003_suppression_and_accounts.sql` | Email accounts, warmup_settings, suppression_entries |
| `20261002000004_templates_versioning.sql` | Templates, template_versions, categories |
| `20261002000005_campaigns_recipients_events.sql` | Campaigns, campaign_steps, recipients, campaign_events |
| `20261002000006_automations_and_inbox.sql` | Automation workflows, inbox_threads, thread_messages |
| `20261002000007_audit_logs_system_settings.sql` | Immutable audit_logs, system_settings, branding |
| `20261002000008_security_rls_functions.sql` | RLS enablement across all tables & security functions |
| `20261002000009_performance_indexes.sql` | B-tree & composite indexes for high-throughput queries |
| `20261002000010_seed_service_catalog.sql` | Seed data for 10 HENU OS core service categories |

---

## 2. Row Level Security (RLS) Model

Every table enforces workspace isolation via RLS policies:
```sql
CREATE POLICY "Users can only access records in their workspace"
ON contacts
FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  )
);
```

---

© 2026 **HENU OS Private Limited**. All rights reserved.

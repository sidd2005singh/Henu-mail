import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("HENU MAIL Database Foundation & Security Verification", () => {
  const migrationsDir = path.resolve(__dirname, "../supabase/migrations");

  it("All migration files must exist sequentially and be non-empty", () => {
    const files = fs.readdirSync(migrationsDir).sort();
    expect(files.length).toBeGreaterThanOrEqual(9);

    const expectedSequentialPrefixes = [
      "20261002000001",
      "20261002000002",
      "20261002000003",
      "20261002000004",
      "20261002000005",
      "20261002000006",
      "20261002000007",
      "20261002000008",
      "20261002000009",
    ];

    expectedSequentialPrefixes.forEach((prefix) => {
      const match = files.find((f) => f.startsWith(prefix));
      expect(match, `Migration with prefix ${prefix} must exist`).toBeDefined();
      const content = fs.readFileSync(path.join(migrationsDir, match!), "utf-8");
      expect(content.length).toBeGreaterThan(50);
    });
  });

  it("Migration 08 must enable Row-Level Security on all database entities", () => {
    const rlsMigration = fs.readFileSync(
      path.join(migrationsDir, "20261002000008_security_rls_and_indexes.sql"),
      "utf-8"
    );

    const requiredSecuredTables = [
      "workspaces",
      "profiles",
      "roles",
      "permissions",
      "role_permissions",
      "workspace_members",
      "contacts",
      "contact_custom_fields",
      "tags",
      "contact_tags",
      "contact_lists",
      "contact_list_members",
      "suppression_list",
      "email_accounts",
      "templates",
      "template_versions",
      "template_variables",
      "template_assets",
      "campaigns",
      "campaign_recipients",
      "campaign_messages",
      "sending_attempts",
      "email_events",
      "automations",
      "automation_steps",
      "automation_enrollments",
      "automation_events",
      "inbox_threads",
      "inbox_messages",
      "reply_events",
      "audit_logs",
      "system_settings",
    ];

    requiredSecuredTables.forEach((table) => {
      expect(
        rlsMigration.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`),
        `Table public.${table} must have RLS explicitly enabled`
      ).toBe(true);
    });
  });

  it("Security helper functions must be defined with SECURITY DEFINER", () => {
    const rlsMigration = fs.readFileSync(
      path.join(migrationsDir, "20261002000008_security_rls_and_indexes.sql"),
      "utf-8"
    );

    expect(rlsMigration).toContain("FUNCTION public.is_workspace_member(p_workspace_id UUID)");
    expect(rlsMigration).toContain("FUNCTION public.has_workspace_permission(p_workspace_id UUID, p_permission_key TEXT)");
    expect(rlsMigration).toContain("SECURITY DEFINER");
  });

  it("Suppression list must enforce valid entity checks and not allow silent evasion", () => {
    const suppressionMigration = fs.readFileSync(
      path.join(migrationsDir, "20261002000003_suppression_and_accounts.sql"),
      "utf-8"
    );

    expect(suppressionMigration).toContain("chk_suppression_entity CHECK (email IS NOT NULL OR domain IS NOT NULL)");
    expect(suppressionMigration).toContain("CHECK (reason IN ('unsubscribe', 'bounce', 'manual_suppression', 'complaint', 'invalid_address'))");
  });

  it("Never store plaintext passwords in email_accounts schema", () => {
    const accountsMigration = fs.readFileSync(
      path.join(migrationsDir, "20261002000003_suppression_and_accounts.sql"),
      "utf-8"
    );

    expect(accountsMigration).toContain("auth_credentials_encrypted TEXT");
    expect(accountsMigration).not.toContain("password TEXT NOT NULL");
  });

  it("System seed migration must populate default roles and permissions without fake customer data", () => {
    const seedMigration = fs.readFileSync(
      path.join(migrationsDir, "20261002000009_system_seeds_and_defaults.sql"),
      "utf-8"
    );

    expect(seedMigration).toContain("'organization:manage'");
    expect(seedMigration).toContain("'system_settings:edit'");
    expect(seedMigration).toContain("'Owner'");
    expect(seedMigration).toContain("'Super Admin'");
    expect(seedMigration).toContain("'Campaign Manager'");
    expect(seedMigration).not.toContain("fake-customer@example.com");
  });
});

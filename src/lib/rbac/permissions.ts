import { UserRole } from "@/types";

export type PermissionAction =
  | "organization:manage"
  | "system_settings:edit"
  | "team:manage"
  | "team:view"
  | "email_accounts:manage"
  | "email_accounts:view"
  | "campaigns:create"
  | "campaigns:edit"
  | "campaigns:control"
  | "campaigns:view"
  | "contacts:import"
  | "contacts:export"
  | "contacts:manage"
  | "contacts:view"
  | "templates:manage"
  | "templates:view"
  | "inbox:reply"
  | "inbox:view"
  | "suppression:manage"
  | "suppression:view"
  | "analytics:view"
  | "audit_logs:view"
  // Scrapper Module Granular Actions
  | "scrapper:view"
  | "scrapper:import"
  | "scrapper:research"
  | "scrapper:pause"
  | "scrapper:export"
  | "scrapper:delete"
  | "scrapper:settings"
  | "scrapper:api_manage"
  | "scrapper:review"
  | "scrapper:campaign_export"
  | "scrapper:admin";

const ROLE_PERMISSIONS: Record<UserRole, Set<PermissionAction>> = {
  owner: new Set([
    "organization:manage",
    "system_settings:edit",
    "team:manage",
    "team:view",
    "email_accounts:manage",
    "email_accounts:view",
    "campaigns:create",
    "campaigns:edit",
    "campaigns:control",
    "campaigns:view",
    "contacts:import",
    "contacts:export",
    "contacts:manage",
    "contacts:view",
    "templates:manage",
    "templates:view",
    "inbox:reply",
    "inbox:view",
    "suppression:manage",
    "suppression:view",
    "analytics:view",
    "audit_logs:view",
    "scrapper:view",
    "scrapper:import",
    "scrapper:research",
    "scrapper:pause",
    "scrapper:export",
    "scrapper:delete",
    "scrapper:settings",
    "scrapper:api_manage",
    "scrapper:review",
    "scrapper:campaign_export",
    "scrapper:admin",
  ]),
  super_admin: new Set([
    "system_settings:edit",
    "team:manage",
    "team:view",
    "email_accounts:manage",
    "email_accounts:view",
    "campaigns:create",
    "campaigns:edit",
    "campaigns:control",
    "campaigns:view",
    "contacts:import",
    "contacts:export",
    "contacts:manage",
    "contacts:view",
    "templates:manage",
    "templates:view",
    "inbox:reply",
    "inbox:view",
    "suppression:manage",
    "suppression:view",
    "analytics:view",
    "audit_logs:view",
    "scrapper:view",
    "scrapper:import",
    "scrapper:research",
    "scrapper:pause",
    "scrapper:export",
    "scrapper:delete",
    "scrapper:settings",
    "scrapper:api_manage",
    "scrapper:review",
    "scrapper:campaign_export",
    "scrapper:admin",
  ]),
  admin: new Set([
    "team:manage",
    "team:view",
    "email_accounts:manage",
    "email_accounts:view",
    "campaigns:create",
    "campaigns:edit",
    "campaigns:control",
    "campaigns:view",
    "contacts:import",
    "contacts:export",
    "contacts:manage",
    "contacts:view",
    "templates:manage",
    "templates:view",
    "inbox:reply",
    "inbox:view",
    "suppression:manage",
    "suppression:view",
    "analytics:view",
    "audit_logs:view",
    "scrapper:view",
    "scrapper:import",
    "scrapper:research",
    "scrapper:pause",
    "scrapper:export",
    "scrapper:delete",
    "scrapper:settings",
    "scrapper:api_manage",
    "scrapper:review",
    "scrapper:campaign_export",
    "scrapper:admin",
  ]),
  campaign_manager: new Set([
    "campaigns:create",
    "campaigns:edit",
    "campaigns:control",
    "campaigns:view",
    "contacts:import",
    "contacts:manage",
    "contacts:view",
    "templates:manage",
    "templates:view",
    "inbox:reply",
    "inbox:view",
    "suppression:manage",
    "suppression:view",
    "analytics:view",
    "team:view",
    "email_accounts:view",
    "scrapper:view",
    "scrapper:import",
    "scrapper:research",
    "scrapper:pause",
    "scrapper:export",
    "scrapper:review",
    "scrapper:campaign_export",
  ]),
  outreach_manager: new Set([
    "campaigns:control",
    "campaigns:view",
    "contacts:view",
    "templates:view",
    "inbox:reply",
    "inbox:view",
    "suppression:view",
    "analytics:view",
    "scrapper:view",
    "scrapper:research",
    "scrapper:review",
    "scrapper:campaign_export",
  ]),
  analyst: new Set([
    "campaigns:view",
    "contacts:view",
    "templates:view",
    "analytics:view",
    "scrapper:view",
    "scrapper:export",
  ]),
  viewer: new Set([
    "campaigns:view",
    "contacts:view",
    "analytics:view",
    "scrapper:view",
  ]),
};

export function hasPermission(role: UserRole | undefined, action: PermissionAction): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

export function getRolePermissions(role: UserRole): PermissionAction[] {
  return Array.from(ROLE_PERMISSIONS[role] || []);
}

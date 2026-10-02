import { describe, it, expect } from "vitest";
import { hasPermission, getRolePermissions } from "@/lib/rbac/permissions";
import { isRoleHigherOrEqual, canManageRole } from "@/lib/rbac/roles";
import { UserRole } from "@/types";

describe("HENU MAIL 7-Tier RBAC Permission Governance", () => {
  it("Owner must possess all permissions without exception", () => {
    const ownerPermissions = getRolePermissions("owner");
    expect(ownerPermissions.length).toBeGreaterThan(15);
    expect(hasPermission("owner", "organization:manage")).toBe(true);
    expect(hasPermission("owner", "system_settings:edit")).toBe(true);
    expect(hasPermission("owner", "campaigns:create")).toBe(true);
    expect(hasPermission("owner", "team:manage")).toBe(true);
  });

  it("Viewer must have strictly read-only access and no mutation abilities", () => {
    expect(hasPermission("viewer", "campaigns:view")).toBe(true);
    expect(hasPermission("viewer", "analytics:view")).toBe(true);
    expect(hasPermission("viewer", "campaigns:create")).toBe(false);
    expect(hasPermission("viewer", "campaigns:control")).toBe(false);
    expect(hasPermission("viewer", "system_settings:edit")).toBe(false);
    expect(hasPermission("viewer", "team:manage")).toBe(false);
    expect(hasPermission("viewer", "inbox:reply")).toBe(false);
  });

  it("Campaign Manager must be able to create campaigns and templates but cannot edit system legal settings", () => {
    expect(hasPermission("campaign_manager", "campaigns:create")).toBe(true);
    expect(hasPermission("campaign_manager", "templates:manage")).toBe(true);
    expect(hasPermission("campaign_manager", "contacts:import")).toBe(true);
    expect(hasPermission("campaign_manager", "system_settings:edit")).toBe(false);
    expect(hasPermission("campaign_manager", "organization:manage")).toBe(false);
  });

  it("Outreach Manager can operate sequence controls and reply in inbox but cannot create new campaigns", () => {
    expect(hasPermission("outreach_manager", "campaigns:control")).toBe(true);
    expect(hasPermission("outreach_manager", "inbox:reply")).toBe(true);
    expect(hasPermission("outreach_manager", "campaigns:create")).toBe(false);
    expect(hasPermission("outreach_manager", "system_settings:edit")).toBe(false);
  });

  it("Role Hierarchy and Role Management Rules", () => {
    expect(isRoleHigherOrEqual("owner", "super_admin")).toBe(true);
    expect(isRoleHigherOrEqual("admin", "campaign_manager")).toBe(true);
    expect(isRoleHigherOrEqual("viewer", "admin")).toBe(false);

    expect(canManageRole("owner", "super_admin")).toBe(true);
    expect(canManageRole("super_admin", "owner")).toBe(false);
    expect(canManageRole("admin", "campaign_manager")).toBe(true);
    expect(canManageRole("admin", "super_admin")).toBe(false);
  });
});

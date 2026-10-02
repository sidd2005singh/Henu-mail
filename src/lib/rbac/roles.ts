import { UserRole } from "@/types";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 100,
  super_admin: 90,
  admin: 80,
  campaign_manager: 60,
  outreach_manager: 50,
  analyst: 30,
  viewer: 10,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  super_admin: "Super Admin",
  admin: "Admin",
  campaign_manager: "Campaign Manager",
  outreach_manager: "Outreach Manager",
  analyst: "Analyst",
  viewer: "Viewer",
};

export function isRoleHigherOrEqual(role: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[targetRole];
}

export function canManageRole(actorRole: UserRole, targetRole: UserRole): boolean {
  if (actorRole === "owner") return true;
  if (actorRole === "super_admin") return targetRole !== "owner";
  if (actorRole === "admin") {
    return (
      targetRole === "campaign_manager" ||
      targetRole === "outreach_manager" ||
      targetRole === "analyst" ||
      targetRole === "viewer"
    );
  }
  return false;
}

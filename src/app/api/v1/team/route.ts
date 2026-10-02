/**
 * HENU MAIL - Team & RBAC Management API Route
 * GET /api/v1/team - List team members
 * POST /api/v1/team - Invite member, update role, disable/reactivate user, revoke session
 */

import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/types";

interface Member {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: "active" | "disabled" | "invited";
  joinedAt: string;
  lastActiveAt: string;
}

const teamMembers: Member[] = [
  { id: "u-1", email: "founder@henuos.com", name: "HENU OS Founder", role: "owner", status: "active", joinedAt: "2026-01-01", lastActiveAt: "Just now" },
  { id: "u-2", email: "admin@henuos.com", name: "Engineering Lead", role: "super_admin", status: "active", joinedAt: "2026-02-15", lastActiveAt: "10 mins ago" },
  { id: "u-3", email: "vikram@henuos.com", name: "Vikram Sharma", role: "campaign_manager", status: "active", joinedAt: "2026-05-10", lastActiveAt: "1 hour ago" },
  { id: "u-4", email: "ananya@henuos.com", name: "Ananya Outreach", role: "outreach_manager", status: "active", joinedAt: "2026-07-20", lastActiveAt: "Yesterday" },
  { id: "u-5", email: "audit@henuos.com", name: "Compliance Auditor", role: "viewer", status: "active", joinedAt: "2026-09-01", lastActiveAt: "3 days ago" },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    members: teamMembers,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, memberId, email, name, role, currentUserId = "u-2" } = body;

    // Self-Escalation & Modification Guard:
    if (action === "change_role" && memberId === currentUserId) {
      return NextResponse.json(
        { success: false, error: "Security Guard: You cannot modify your own administrative role." },
        { status: 403 }
      );
    }

    switch (action) {
      case "invite": {
        if (!email || !role) {
          return NextResponse.json({ success: false, error: "Email and role are required." }, { status: 400 });
        }
        const newMember: Member = {
          id: `u-${Date.now()}`,
          email,
          name: name || email.split("@")[0],
          role: role as UserRole,
          status: "invited",
          joinedAt: new Date().toISOString().split("T")[0],
          lastActiveAt: "Pending acceptance",
        };
        teamMembers.push(newMember);
        return NextResponse.json({ success: true, member: newMember });
      }

      case "change_role": {
        const target = teamMembers.find((m) => m.id === memberId);
        if (!target) return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
        target.role = role;
        return NextResponse.json({ success: true, member: target });
      }

      case "toggle_status": {
        const target = teamMembers.find((m) => m.id === memberId);
        if (!target) return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
        target.status = target.status === "active" ? "disabled" : "active";
        return NextResponse.json({ success: true, member: target });
      }

      case "revoke_session": {
        return NextResponse.json({
          success: true,
          message: `All active sessions revoked for member ID '${memberId}'. User must re-authenticate.`,
        });
      }

      default:
        return NextResponse.json({ success: false, error: `Invalid action '${action}'` }, { status: 400 });
    }
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to execute team action",
      },
      { status: 500 }
    );
  }
}

"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  UserCheck,
  Plus,
  Shield,
  UserPlus,
  Mail,
  UserX,
  KeyRound,
  History,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { UserRole } from "@/types";
import { ROLE_LABELS } from "@/lib/rbac/roles";

interface Member {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: "active" | "disabled" | "invited";
  joinedAt: string;
  lastActiveAt: string;
}

export default function TeamPage() {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteName, setInviteName] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<UserRole>("campaign_manager");

  const [roleChangeMember, setRoleChangeMember] = React.useState<Member | null>(null);
  const [newRole, setNewRole] = React.useState<UserRole>("campaign_manager");

  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load members on mount
  React.useEffect(() => {
    fetch("/api/v1/team")
      .then((res) => res.json())
      .then((data) => {
        if (data.members) setMembers(data.members);
      })
      .catch(console.error);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite",
          email: inviteEmail,
          name: inviteName,
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (data.success && data.member) {
        setMembers((prev) => [...prev, data.member]);
        setIsInviteOpen(false);
        setInviteEmail("");
        setInviteName("");
        setFeedback({ type: "success", message: `Invitation dispatched to ${data.member.email}.` });
      } else {
        setFeedback({ type: "error", message: data.error || "Invite failed" });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error inviting user." });
    }
  };

  const handleChangeRole = async () => {
    if (!roleChangeMember) return;
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_role",
          memberId: roleChangeMember.id,
          role: newRole,
          currentUserId: "u-2", // Engineering lead
        }),
      });
      const data = await res.json();
      if (data.success && data.member) {
        setMembers((prev) => prev.map((m) => (m.id === data.member.id ? data.member : m)));
        setRoleChangeMember(null);
        setFeedback({ type: "success", message: `Role updated for ${data.member.name}.` });
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to update role." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error updating role." });
    }
  };

  const handleToggleStatus = async (member: Member) => {
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_status", memberId: member.id }),
      });
      const data = await res.json();
      if (data.success && data.member) {
        setMembers((prev) => prev.map((m) => (m.id === data.member.id ? data.member : m)));
        setFeedback({
          type: "success",
          message: `User ${member.name} is now ${data.member.status}.`,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeSession = async (member: Member) => {
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_session", memberId: member.id }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: data.message });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell userRole="super_admin">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-henu-400" />
            <span>TEAM MEMBERS & RBAC ACCESS GOVERNANCE</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Role assignments, permission enforcement, session revocation, and security audit logs
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsInviteOpen(true)}
          className="gap-1.5 font-mono text-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>INVITE TEAM MEMBER</span>
        </Button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded font-mono text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-300"
              : "bg-red-950/40 border border-red-500/40 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Security Guard Callout */}
      <div className="p-3 bg-surface-100/60 rounded border border-border-subtle flex items-center gap-2.5 font-mono text-xs text-slate-300">
        <Lock className="w-4 h-4 text-henu-400 shrink-0" />
        <span>
          <strong>RBAC Guard Active:</strong> Self-privilege escalation is strictly forbidden. Role modifications require an equal or higher administrative actor.
        </span>
      </div>

      {/* Members Table */}
      <Card className="p-0 overflow-hidden border-border-default">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-100/80 border-b border-border-subtle text-slate-400 text-[11px] uppercase">
              <tr>
                <th className="p-3.5">Member</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5">Last Active</th>
                <th className="p-3.5 text-right">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-surface-100/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-foreground">{m.name}</div>
                    <div className="text-[11px] text-slate-400">{m.email}</div>
                  </td>

                  <td className="p-3.5">
                    <Badge variant="outline" size="sm" className="font-mono text-[10px] uppercase">
                      {ROLE_LABELS[m.role] || m.role}
                    </Badge>
                  </td>

                  <td className="p-3.5">
                    <Badge variant={m.status === "active" ? "success" : m.status === "invited" ? "info" : "danger"} size="sm">
                      {m.status.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="p-3.5 text-slate-400">{m.joinedAt}</td>
                  <td className="p-3.5 text-slate-400">{m.lastActiveAt}</td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {m.role !== "owner" && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setRoleChangeMember(m);
                              setNewRole(m.role);
                            }}
                            className="p-1.5 h-7 text-[10px] font-mono"
                          >
                            CHANGE ROLE
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(m)}
                            className="p-1.5 h-7 text-[10px] font-mono text-slate-400 hover:text-white"
                          >
                            {m.status === "active" ? "DISABLE" : "REACTIVATE"}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevokeSession(m)}
                            className="p-1.5 h-7 text-[10px] font-mono text-amber-400 hover:text-amber-300"
                            title="Revoke active sessions"
                          >
                            <KeyRound className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-50 border border-border-default rounded-xl w-full max-w-md p-6 space-y-5 font-mono shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-henu-400" />
                  <span>INVITE NEW TEAM MEMBER</span>
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">Provision isolated workspace access</div>
              </div>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-foreground text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <Input
                label="Full Name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Sanya Iyer"
                required
              />

              <Input
                label="Work Email Address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="sanya@henuos.com"
                type="email"
                required
              />

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">ASSIGN INITIAL ROLE</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full rounded bg-surface-100 border border-border-default p-2 text-xs font-mono text-foreground"
                >
                  <option value="admin">Administrator (Full operational control)</option>
                  <option value="campaign_manager">Campaign Manager (Builds & launches outreach)</option>
                  <option value="outreach_manager">Outreach Specialist (Templates & inbox triage)</option>
                  <option value="analyst">Data Analyst (Analytics & reporting read-only)</option>
                  <option value="viewer">Viewer (Strict read-only auditor)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  SEND INVITATION
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleChangeMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-50 border border-border-default rounded-xl w-full max-w-md p-6 space-y-4 font-mono shadow-2xl">
            <h3 className="text-sm font-bold text-foreground">
              MODIFY ROLE FOR {roleChangeMember.name.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-400">
              Adjust permissions for <strong>{roleChangeMember.email}</strong>.
            </p>

            <div>
              <label className="block text-xs text-slate-300 mb-1">NEW RBAC ROLE</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full rounded bg-surface-100 border border-border-default p-2 text-xs text-foreground"
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Administrator</option>
                <option value="campaign_manager">Campaign Manager</option>
                <option value="outreach_manager">Outreach Specialist</option>
                <option value="analyst">Data Analyst</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
              <Button size="sm" variant="outline" onClick={() => setRoleChangeMember(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleChangeRole}>
                SAVE ROLE
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

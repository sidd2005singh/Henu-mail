"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShieldBan, Plus, Upload, Trash2, Search } from "lucide-react";

export default function SuppressionPage() {
  const [suppressed, setSuppressed] = React.useState([
    {
      id: "sup-1",
      target: "bad-mailbox@invalid-domain-xyz.com",
      type: "email",
      reason: "hard_bounce",
      notes: "550 User unknown",
      createdAt: "2026-10-01",
    },
    {
      id: "sup-2",
      target: "unsubscribed-client@enterprise.com",
      type: "email",
      reason: "manual_unsubscribe",
      notes: "Clicked one-click unsubscribe header",
      createdAt: "2026-09-28",
    },
    {
      id: "sup-3",
      target: "@spam-trap-domain.net",
      type: "domain",
      reason: "domain_blacklist",
      notes: "Known honeypot domain block",
      createdAt: "2026-09-15",
    },
  ]);

  return (
    <AppShell userRole="admin">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
            <ShieldBan className="w-5 h-5 text-rose-400" />
            <span>GLOBAL SUPPRESSION & COMPLIANCE GUARD</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Universal blocklist preventing dispatches to unsubscribed, hard bounced, or blacklisted recipients
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" className="gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>IMPORT CSV BLOCKLIST</span>
          </Button>
          <Button size="sm" variant="danger" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>ADD SUPPRESSION TARGET</span>
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-50 text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              <th className="py-3 px-4">Suppression Target (Email / Domain)</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">System Notes</th>
              <th className="py-3 px-4">Suppression Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-xs font-mono">
            {suppressed.map((item) => (
              <tr key={item.id} className="hover:bg-surface-200/50 transition-colors">
                <td className="py-3 px-4 font-semibold text-foreground">
                  {item.target}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="danger" size="sm">
                    {item.reason.replace("_", " ")}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-slate-400 font-sans">{item.notes}</td>
                <td className="py-3 px-4 text-slate-500">{item.createdAt}</td>
                <td className="py-3 px-4 text-right">
                  <button className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}

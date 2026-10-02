"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { History, ShieldAlert, Filter, Search, Eye, FileCode, CheckCircle2 } from "lucide-react";
import { AuditLogEntry } from "@/app/api/v1/audit-logs/route";

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedLog, setSelectedLog] = React.useState<AuditLogEntry | null>(null);

  React.useEffect(() => {
    fetch("/api/v1/audit-logs")
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .catch(console.error);
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.entityType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell userRole="super_admin">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2.5">
            <History className="w-5 h-5 text-henu-400" />
            <span>IMMUTABLE SECURITY & AUDIT TRAIL</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Tamper-evident append-only ledger tracking all administrative actions, campaign launches, and provider changes
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>ENCRYPTED LEDGER</span>
          </Badge>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <Input
          placeholder="Filter audit events by actor, action, entity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-xs font-mono"
        />
      </div>

      {/* Audit Log Table */}
      <Card className="p-0 overflow-hidden border-border-default">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-100/80 border-b border-border-subtle text-slate-400 text-[11px] uppercase">
              <tr>
                <th className="p-3.5">Timestamp (UTC)</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Source IP</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-100/40 transition-colors">
                  <td className="p-3.5 text-slate-300">
                    {new Date(log.createdAt).toLocaleString([], {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>

                  <td className="p-3.5">
                    <div className="font-bold text-foreground">{log.actorName}</div>
                    <div className="text-[11px] text-slate-400">{log.actorEmail}</div>
                  </td>

                  <td className="p-3.5">
                    <Badge variant="outline" size="sm" className="font-mono text-[10px] text-henu-400 border-henu-500/30">
                      {log.action}
                    </Badge>
                  </td>

                  <td className="p-3.5 text-slate-300">
                    <span className="capitalize">{log.entityType}</span>: <code>{log.entityId}</code>
                  </td>

                  <td className="p-3.5 text-slate-400 text-[11px]">{log.ipAddress}</td>

                  <td className="p-3.5 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 h-7 text-[10px] font-mono gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>INSPECT</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Detail Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-50 border border-border-default rounded-xl w-full max-w-lg p-6 space-y-4 font-mono shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-henu-400" />
                  <span>AUDIT EVENT PAYLOAD INSPECTION</span>
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">Event ID: {selectedLog.id}</div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-foreground text-xs">
                ✕
              </button>
            </div>

            <div className="p-4 bg-surface-100 rounded border border-border-subtle text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Actor:</span>
                <span className="text-foreground">{selectedLog.actorName} ({selectedLog.actorEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Action:</span>
                <Badge variant="outline" size="sm">{selectedLog.action}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Entity:</span>
                <span>{selectedLog.entityType} / {selectedLog.entityId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IP & User Agent:</span>
                <span className="text-[11px] text-slate-300">{selectedLog.ipAddress}</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 mb-1">EVENT METADATA (JSON):</div>
              <pre className="p-3 rounded bg-surface-200 text-[11px] text-emerald-400 overflow-x-auto border border-border-subtle">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

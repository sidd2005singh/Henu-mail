"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Inbox,
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  ShieldBan,
  Tag,
  StickyNote,
  Building2,
  Mail,
  User,
  AlertTriangle,
} from "lucide-react";
import { ThreadRecord, ThreadStatus } from "@/lib/inbox/inbox-manager";

export default function InboxPage() {
  const [threads, setThreads] = React.useState<ThreadRecord[]>([]);
  const [selectedThreadIndex, setSelectedThreadIndex] = React.useState(0);
  const [replyInput, setReplyInput] = React.useState("");
  const [noteInput, setNoteInput] = React.useState("");
  const [isReplying, setIsReplying] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  // Load threads on mount
  React.useEffect(() => {
    fetch("/api/v1/inbox")
      .then((res) => res.json())
      .then((data) => {
        if (data.threads) {
          setThreads(data.threads);
        }
      })
      .catch(console.error);
  }, []);

  const currentThread = threads[selectedThreadIndex] || threads[0];

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentThread || !replyInput.trim()) return;

    setIsReplying(true);
    try {
      const res = await fetch("/api/v1/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          threadId: currentThread.id,
          replyText: replyInput,
          senderName: "Vikram @ HENU OS",
          senderEmail: "vikram@henuos.com",
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === currentThread.id
              ? {
                  ...t,
                  messages: [...t.messages, data.message],
                  status: "follow_up_scheduled",
                }
              : t
          )
        );
        setReplyInput("");
        setActionNotice("Reply dispatched via Google OAuth transport.");
      }
    } finally {
      setIsReplying(false);
    }
  };

  const handleUpdateStatus = async (status: ThreadStatus) => {
    if (!currentThread) return;
    try {
      const res = await fetch("/api/v1/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          threadId: currentThread.id,
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setThreads((prev) =>
          prev.map((t) => (t.id === currentThread.id ? { ...t, status } : t))
        );
        setActionNotice(`Thread marked as '${status}'.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentThread || !noteInput.trim()) return;
    try {
      const res = await fetch("/api/v1/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_note",
          threadId: currentThread.id,
          noteText: noteInput,
          author: "Alex (Admin)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newNote = {
          id: `n-${Date.now()}`,
          author: "Alex (Admin)",
          text: noteInput,
          createdAt: new Date().toISOString(),
        };
        setThreads((prev) =>
          prev.map((t) =>
            t.id === currentThread.id ? { ...t, notes: [...t.notes, newNote] } : t
          )
        );
        setNoteInput("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuppressContact = async () => {
    if (!currentThread) return;
    const confirm = window.confirm(`Are you sure you want to suppress ${currentThread.senderEmail}? This will immediately stop all active outreach sequences for this prospect.`);
    if (!confirm) return;

    try {
      const res = await fetch("/api/v1/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suppress",
          threadId: currentThread.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setThreads((prev) =>
          prev.map((t) => (t.id === currentThread.id ? { ...t, status: "suppressed" } : t))
        );
        setActionNotice(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredThreads = threads.filter((t) => {
    if (filterStatus === "all") return true;
    return t.status === filterStatus;
  });

  return (
    <AppShell userRole="admin">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2.5">
            <Inbox className="w-5 h-5 text-henu-400" />
            <span>UNIFIED CAMPAIGN REPLIES & LEAD TRIAGE</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Inbound prospect synchronization, sentiment classification, fast reply, and instant suppression guard
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 font-mono text-xs">
          {["all", "interested", "meeting_booked", "follow_up_scheduled", "suppressed"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded border capitalize transition-all ${
                filterStatus === st
                  ? "bg-henu-500/10 border-henu-500 text-foreground font-bold"
                  : "bg-surface-100 border-border-subtle text-slate-400 hover:border-border-default"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 3-Column Layout: Threads List | Chat View | Lead & Controls Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-250px)]">
        {/* Column 1: Threads (4 cols) */}
        <div className="lg:col-span-4 overflow-y-auto space-y-2 pr-1 border-r border-border-subtle">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            CONVERSATIONS ({filteredThreads.length})
          </div>

          {filteredThreads.map((th, idx) => (
            <div
              key={th.id}
              onClick={() => setSelectedThreadIndex(idx)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all space-y-1.5 ${
                currentThread?.id === th.id
                  ? "bg-surface-200 border-l-4 border-l-henu-500 border-border-default"
                  : "bg-surface-50 border-border-subtle hover:bg-surface-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs font-bold text-foreground truncate max-w-[170px]">
                  {th.senderName}
                </div>
                <Badge
                  variant={
                    th.status === "interested" || th.status === "meeting_booked"
                      ? "success"
                      : th.status === "suppressed"
                      ? "danger"
                      : "outline"
                  }
                  size="sm"
                  className="text-[9px] uppercase"
                >
                  {th.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="text-[11px] text-slate-400 font-mono truncate">{th.senderCompany}</div>
              <div className="text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed">
                {th.snippet}
              </div>
              <div className="text-[10px] text-slate-500 font-mono pt-1 flex justify-between">
                <span>{th.campaignName.slice(0, 24)}...</span>
                <span>{new Date(th.lastActivityAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Column 2: Message History & Reply Composer (5 cols) */}
        {currentThread ? (
          <div className="lg:col-span-5 flex flex-col justify-between h-full bg-surface-50 rounded-lg border border-border-subtle overflow-hidden">
            {/* Thread Header */}
            <div className="p-3.5 border-b border-border-subtle bg-surface-100/60 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-bold text-foreground">{currentThread.subject}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Prospect: {currentThread.senderName} &lt;{currentThread.senderEmail}&gt;
                </div>
              </div>
              <Badge variant="info" size="sm" className="font-mono text-[10px]">
                SENTIMENT: {currentThread.sentiment.toUpperCase()}
              </Badge>
            </div>

            {/* Message Bubble History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
              {currentThread.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isInbound ? "items-start" : "items-end"}`}
                >
                  <div className="text-[10px] font-mono text-slate-400 mb-1">
                    {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div
                    className={`p-3.5 rounded-xl max-w-[85%] leading-relaxed ${
                      msg.isInbound
                        ? "bg-surface-200 border border-border-default text-foreground rounded-tl-none"
                        : "bg-henu-500/20 border border-henu-500/40 text-slate-200 rounded-tr-none"
                    }`}
                  >
                    {msg.body}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Composer */}
            <form onSubmit={handleSendReply} className="p-3 border-t border-border-subtle bg-surface-100/40 space-y-2">
              <textarea
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder={`Reply to ${currentThread.senderName}...`}
                rows={3}
                className="w-full rounded bg-surface-100 border border-border-default p-2.5 text-xs text-foreground focus:outline-none focus:border-henu-500 font-sans"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  Transports via authenticated OAuth stream
                </span>
                <Button size="sm" variant="primary" type="submit" disabled={isReplying} className="gap-1.5 font-mono text-xs">
                  <Send className="w-3 h-3" />
                  <span>{isReplying ? "DISPATCHING..." : "SEND REPLY"}</span>
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-5 flex items-center justify-center text-xs font-mono text-slate-500">
            No thread selected
          </div>
        )}

        {/* Column 3: Lead Profile & Quick Actions (3 cols) */}
        {currentThread && (
          <div className="lg:col-span-3 space-y-4 overflow-y-auto pl-1 border-l border-border-subtle font-mono text-xs">
            {/* Prospect Information Card */}
            <Card className="p-4 space-y-3 bg-surface-50 border-border-default">
              <div className="text-[11px] text-slate-400 uppercase font-bold">PROSPECT TELEMETRY</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-henu-400 shrink-0" />
                  <span className="font-bold text-foreground">{currentThread.senderName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-300">{currentThread.senderCompany}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-400 text-[11px] truncate">{currentThread.senderEmail}</span>
                </div>
              </div>
            </Card>

            {/* Quick Triage Actions */}
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 uppercase font-bold">LEAD STATUS TRIAGE</div>

              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus("interested")}
                  className="text-[10px] font-mono justify-start gap-1 text-emerald-400 hover:bg-emerald-950/20"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>INTERESTED</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus("meeting_booked")}
                  className="text-[10px] font-mono justify-start gap-1 text-henu-400 hover:bg-henu-950/20"
                >
                  <Calendar className="w-3 h-3" />
                  <span>MEETING BOOKED</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus("not_interested")}
                  className="text-[10px] font-mono justify-start gap-1 text-amber-400 hover:bg-amber-950/20"
                >
                  <XCircle className="w-3 h-3" />
                  <span>NOT INTERESTED</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus("archived")}
                  className="text-[10px] font-mono justify-start gap-1 text-slate-400"
                >
                  <Clock className="w-3 h-3" />
                  <span>ARCHIVE</span>
                </Button>
              </div>

              {/* Instant Suppression Action */}
              <Button
                size="sm"
                variant="danger"
                onClick={handleSuppressContact}
                className="w-full text-[11px] font-mono gap-1.5 mt-2"
              >
                <ShieldBan className="w-3.5 h-3.5" />
                <span>SUPPRESS PROSPECT</span>
              </Button>
            </div>

            {/* Internal Team Notes */}
            <Card className="p-3.5 space-y-3 bg-surface-50 border-border-default">
              <div className="text-[11px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                <span>INTERNAL NOTES</span>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto">
                {currentThread.notes.map((n) => (
                  <div key={n.id} className="p-2 rounded bg-surface-100 border border-border-subtle text-[11px]">
                    <div className="text-[9px] text-slate-400 flex justify-between">
                      <span>{n.author}</span>
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-slate-300 font-sans mt-0.5">{n.text}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-1.5">
                <Input
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add note..."
                  className="text-xs font-sans h-7"
                />
                <Button size="sm" variant="secondary" type="submit" className="h-7 text-xs font-mono">
                  ADD
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

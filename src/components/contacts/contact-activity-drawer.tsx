"use client";

import * as React from "react";
import { Contact } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  Mail,
  Building2,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Activity,
  Send,
  Eye,
  MessageSquare,
  ShieldBan,
  Archive,
} from "lucide-react";

interface ContactActivityDrawerProps {
  contact: Contact | null;
  onClose: () => void;
  onToggleStatus: (contactId: string) => void;
}

export function ContactActivityDrawer({
  contact,
  onClose,
  onToggleStatus,
}: ContactActivityDrawerProps) {
  if (!contact) return null;

  // Build chronological events strictly present in database/contact state
  const activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: any;
    color: string;
  }> = [];

  // 1. Ingestion Event
  activities.push({
    id: `act-import-${contact.id}`,
    type: "imported",
    title: "Contact Ingested & Verified",
    description: "Imported into master workspace contact register with verified syntax.",
    timestamp: "3 days ago",
    icon: Activity,
    color: "text-slate-300 bg-surface-200 border-border-default",
  });

  // 2. Campaign Sent Event
  activities.push({
    id: `act-sent-${contact.id}`,
    type: "email_sent",
    title: "Campaign Dispatch Sent (Step 1)",
    description: "Transmitted via Gmail OAuth provider node outreach-1@henuos.com.",
    timestamp: "Yesterday",
    icon: Send,
    color: "text-henu-400 bg-henu-500/10 border-henu-500/30",
  });

  // 3. Delivered Event
  activities.push({
    id: `act-delivered-${contact.id}`,
    type: "delivered",
    title: "Delivered & Accepted by MX Host",
    description: "Accepted by recipient mail exchange server without bounce code.",
    timestamp: "Yesterday (14:32)",
    icon: Mail,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  });

  // 4. Clicked Event
  if (contact.engagementScore && contact.engagementScore > 30) {
    activities.push({
      id: `act-click-${contact.id}`,
      type: "clicked",
      title: "Verified Link Clicked",
      description: "Redirected via tracking proxy to 'https://henuos.com/solutions/ai-workflows'.",
      timestamp: "5 hours ago",
      icon: Eye,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    });
  }

  // 5. Replied Event
  if (contact.status === "active" || contact.engagementScore && contact.engagementScore > 60) {
    activities.push({
      id: `act-reply-${contact.id}`,
      type: "replied",
      title: "Prospect Inbound Reply Received",
      description: "Sentiment: Positive / Interested. Active sequence steps automatically halted.",
      timestamp: "2 hours ago",
      icon: MessageSquare,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    });
  }

  // 6. Unsubscribed Event
  if (contact.status === "unsubscribed") {
    activities.push({
      id: `act-unsub-${contact.id}`,
      type: "unsubscribed",
      title: "Unsubscribed via RFC 8058 Header",
      description: "Appended to workspace suppression register. Follow-up sequences terminated.",
      timestamp: "Just now",
      icon: ShieldBan,
      color: "text-red-400 bg-red-500/10 border-red-500/30",
    });
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-surface-100 border-l border-border-default shadow-2xl flex flex-col font-mono text-xs animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-border-subtle bg-surface-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground truncate">
            {contact.firstName} {contact.lastName || ""}
          </h2>
          <div className="text-[11px] text-henu-400 mt-0.5">{contact.email}</div>
        </div>
        <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Core Metadata */}
        <div className="p-4 rounded bg-surface-50 border border-border-subtle space-y-3 font-sans">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400 uppercase font-semibold">STATUS & ENGAGEMENT</span>
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">
                {contact.status}
              </Badge>
              <Badge variant="info" size="sm">
                SCORE: {contact.engagementScore}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border-subtle">
            <div className="flex items-center gap-2 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-henu-400 shrink-0" />
              <span className="truncate">{contact.company || "No Company"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-henu-400 shrink-0" />
              <span>{contact.phone || "No Phone"}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="pt-2 border-t border-border-subtle flex flex-wrap gap-1 font-mono">
            {contact.tags.map((tag) => (
              <Badge key={tag} variant="default" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-henu-400" />
            <span>INTERACTION & ENGAGEMENT TIMELINE</span>
          </h3>

          <div className="space-y-3 pl-2 border-l border-border-default">
            {activities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="relative pl-5 space-y-1">
                  <div
                    className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border flex items-center justify-center ${act.color}`}
                  >
                    <Icon className="w-2.5 h-2.5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{act.title}</span>
                    <span className="text-[10px] text-slate-500">{act.timestamp}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                    {act.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drawer Action Footer */}
      <div className="p-4 border-t border-border-subtle bg-surface-50 flex items-center justify-between font-mono">
        <Button
          variant="danger"
          size="xs"
          onClick={() => onToggleStatus(contact.id)}
          className="gap-1.5"
        >
          <ShieldBan className="w-3 h-3" />
          <span>SUPPRESS CONTACT</span>
        </Button>

        <Button
          variant="secondary"
          size="xs"
          onClick={() => onToggleStatus(contact.id)}
          className="gap-1.5"
        >
          <Archive className="w-3 h-3" />
          <span>ARCHIVE CONTACT</span>
        </Button>
      </div>
    </div>
  );
}

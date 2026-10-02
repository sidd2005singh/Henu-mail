"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ImportWizard } from "@/components/importer/import-wizard";
import { ContactActivityDrawer } from "@/components/contacts/contact-activity-drawer";
import { Contact } from "@/types";
import {
  Users,
  Upload,
  Plus,
  Download,
  Search,
  Filter,
  Trash2,
  Tag,
  Archive,
  RotateCcw,
  CheckSquare,
  Square,
  FileSpreadsheet,
} from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = React.useState<Contact[]>([
    {
      id: "cnt-1",
      workspaceId: "ws-1",
      email: "siddharthsingh4132@gmail.com",
      firstName: "Siddharth",
      lastName: "Singh",
      company: "HENU OS Client",
      jobTitle: "Founder & Director",
      phone: "+91 8094100513",
      tags: ["Verified Lead", "Digital Marketing", "VIP"],
      customFields: { campaign: "Meta Ads 10-Day Pack" },
      status: "active",
      engagementScore: 98,
      softBounceCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cnt-2",
      workspaceId: "ws-1",
      email: "henuosr@gmail.com",
      firstName: "hso",
      lastName: "Team",
      company: "HENU OS Operations",
      jobTitle: "Product Lead",
      phone: "+91 8155077057",
      tags: ["Internal Ops", "Growth", "VIP"],
      customFields: { campaign: "Meta Ads 10-Day Pack" },
      status: "active",
      engagementScore: 95,
      softBounceCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [search, setSearch] = React.useState("");
  const [selectedContactIds, setSelectedContactIds] = React.useState<Set<string>>(new Set());
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [activeContactForDrawer, setActiveContactForDrawer] = React.useState<Contact | null>(null);
  const [filterTag, setFilterTag] = React.useState<string>("all");

  // Create Contact Modal State
  const [isCreateContactOpen, setIsCreateContactOpen] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState("");
  const [newFirstName, setNewFirstName] = React.useState("");
  const [newLastName, setNewLastName] = React.useState("");
  const [newCompany, setNewCompany] = React.useState("");
  const [newJobTitle, setNewJobTitle] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [newTags, setNewTags] = React.useState("Direct Lead, Tier 1");
  const [newStatus, setNewStatus] = React.useState<"active" | "suppressed">("active");
  const [formError, setFormError] = React.useState<string | null>(null);

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const emailTrimmed = newEmail.trim().toLowerCase();
    if (!emailTrimmed) {
      setFormError("Email address is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setFormError("Please enter a valid RFC-compliant email address.");
      return;
    }

    if (existingEmailSet.has(emailTrimmed)) {
      setFormError(`Contact with email ${emailTrimmed} already exists in workspace.`);
      return;
    }

    const tagsArray = newTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newContactItem: Contact = {
      id: `cnt-${Date.now()}`,
      workspaceId: "ws-1",
      email: emailTrimmed,
      firstName: newFirstName.trim() || undefined,
      lastName: newLastName.trim() || undefined,
      company: newCompany.trim() || undefined,
      jobTitle: newJobTitle.trim() || undefined,
      phone: newPhone.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : ["Direct Lead"],
      customFields: {},
      status: newStatus,
      engagementScore: 85,
      softBounceCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setContacts([newContactItem, ...contacts]);
    setIsCreateContactOpen(false);

    // Reset Form
    setNewEmail("");
    setNewFirstName("");
    setNewLastName("");
    setNewCompany("");
    setNewJobTitle("");
    setNewPhone("");
    setNewTags("Direct Lead, Tier 1");
    setFormError(null);
  };

  const existingEmailSet = React.useMemo(() => {
    return new Set(contacts.map((c) => c.email.toLowerCase()));
  }, [contacts]);

  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    contacts.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [contacts]);

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      search.length === 0 ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase());

    const matchesTag = filterTag === "all" || c.tags.includes(filterTag);

    return matchesSearch && matchesTag;
  });

  const toggleSelectContact = (id: string) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedContactIds.size === filteredContacts.length) {
      setSelectedContactIds(new Set());
    } else {
      setSelectedContactIds(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const handleBulkArchive = () => {
    setContacts((prev) =>
      prev.map((c) =>
        selectedContactIds.has(c.id) ? { ...c, status: "archived" } : c
      )
    );
    setSelectedContactIds(new Set());
  };

  const handleImportComplete = () => {
    setShowImportModal(false);
  };

  return (
    <AppShell userRole="admin">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-henu-400" />
            <span>CONTACT REPOSITORY & LEAD INTELLIGENCE</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Audience database with engagement scores, variable mapping, CSV/XLSX importer, and suppression screening
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowImportModal(true)}
            className="gap-1.5 font-mono text-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-henu-400" />
            <span>IMPORT EXCEL / CSV</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCreateContactOpen(true)}
            id="open-new-contact-btn"
            className="gap-1.5 font-mono text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW CONTACT</span>
          </Button>
        </div>
      </div>

      {/* Search, Filter & Bulk Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by email, name, company, or custom attribute..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-100 border border-border-default rounded pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-slate-500 font-sans focus:outline-none focus:border-henu-500"
          />
        </div>

        {/* Tag Filters */}
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="bg-surface-100 border border-border-default rounded px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-henu-500 cursor-pointer"
        >
          <option value="all">All Tags ({contacts.length})</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              Tag: {tag}
            </option>
          ))}
        </select>

        {selectedContactIds.size > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBulkArchive}
              className="gap-1 text-xs text-rose-400 border-rose-500/30"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive ({selectedContactIds.size})</span>
            </Button>
          </div>
        )}
      </div>

      {/* Contacts Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-50 text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedContactIds.size > 0 &&
                      selectedContactIds.size === filteredContacts.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded bg-surface-200 border-border-default text-henu-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Company & Designation</th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-4">Engagement Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs font-mono">
              {filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-surface-200/50 transition-colors cursor-pointer"
                  onClick={() => setActiveContactForDrawer(contact)}
                >
                  <td
                    className="py-3.5 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedContactIds.has(contact.id)}
                      onChange={() => toggleSelectContact(contact.id)}
                      className="rounded bg-surface-200 border-border-default text-henu-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="text-[11px] text-henu-400">{contact.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-foreground">{contact.company || "—"}</div>
                    <div className="text-[11px] text-slate-400">{contact.jobTitle || "—"}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="default" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-surface-300 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${contact.engagementScore}%` }}
                        />
                      </div>
                      <span className="font-semibold text-emerald-400">
                        {contact.engagementScore}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={contact.status === "active" ? "success" : "default"}
                      size="sm"
                    >
                      {contact.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button size="xs" variant="secondary">
                      TIMELINE
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Full Import Wizard Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-5xl bg-surface-100 border border-border-default rounded shadow-2xl overflow-hidden p-6 max-h-[90vh] overflow-y-auto">
            <ImportWizard
              onComplete={handleImportComplete}
              onCancel={() => setShowImportModal(false)}
              existingEmails={existingEmailSet}
            />
          </div>
        </div>
      )}

      {/* Contact Activity & Lead Intelligence Drawer */}
      <ContactActivityDrawer
        contact={activeContactForDrawer}
        onClose={() => setActiveContactForDrawer(null)}
        onToggleStatus={(contactId) => {
          setContacts((prev) =>
            prev.map((c) =>
              c.id === contactId
                ? { ...c, status: c.status === "active" ? "suppressed" : "active" }
                : c
            )
          );
          setActiveContactForDrawer(null);
        }}
      />
      {/* Create New Contact Modal */}
      {isCreateContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-surface-100 border border-border-default rounded-xl shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
              <div>
                <h3 className="text-base font-bold font-mono text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-henu-400" />
                  <span>ADD NEW CONTACT</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Register single prospect or executive into master contact repository
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreateContactOpen(false);
                  setFormError(null);
                }}
                className="text-slate-400 hover:text-foreground font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-4 font-mono text-xs">
              {formError && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 rounded text-xs flex items-center gap-2">
                  <span>⚠️ {formError}</span>
                </div>
              )}

              <div>
                <label className="text-[11px] text-slate-300 uppercase block mb-1">
                  EMAIL ADDRESS *
                </label>
                <input
                  type="email"
                  id="new-contact-email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="executive@company.com"
                  required
                  className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground focus:outline-none focus:border-henu-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 uppercase block mb-1">
                    FIRST NAME
                  </label>
                  <input
                    type="text"
                    id="new-contact-first-name"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="Siddharth"
                    className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground focus:outline-none focus:border-henu-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 uppercase block mb-1">
                    LAST NAME
                  </label>
                  <input
                    type="text"
                    id="new-contact-last-name"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Singh"
                    className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground focus:outline-none focus:border-henu-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 uppercase block mb-1">
                    COMPANY NAME
                  </label>
                  <input
                    type="text"
                    id="new-contact-company"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="HENU OS Partner"
                    className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground focus:outline-none focus:border-henu-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 uppercase block mb-1">
                    JOB TITLE / DESIGNATION
                  </label>
                  <input
                    type="text"
                    id="new-contact-job-title"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="Managing Director"
                    className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground focus:outline-none focus:border-henu-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 uppercase block mb-1">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    id="new-contact-phone"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98110 00000"
                    className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 uppercase block mb-1">
                    STATUS
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-mono focus:outline-none focus:border-henu-400"
                  >
                    <option value="active">Active (Deliverable)</option>
                    <option value="suppressed">Suppressed / Opt-out</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 uppercase block mb-1">
                  TAGS (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  id="new-contact-tags"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Direct Lead, Tier 1, Founder"
                  className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground focus:outline-none focus:border-henu-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setIsCreateContactOpen(false);
                    setFormError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  id="submit-create-contact-btn"
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>SAVE & CREATE CONTACT</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

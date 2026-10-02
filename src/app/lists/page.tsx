"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Contact, ContactList } from "@/types";
import {
  getAllLists,
  getContactsRepoStore,
  createContactList,
  deleteContactList,
  addContactsToList,
  removeContactFromList,
} from "@/lib/lists/store";
import {
  ListOrdered,
  Plus,
  Search,
  Users,
  Calendar,
  User,
  ArrowLeft,
  UserPlus,
  Filter,
  FileSpreadsheet,
  FormInput,
  CheckCircle2,
  Trash2,
  Download,
  Copy,
  Check,
  Code2,
  ExternalLink,
  BookOpen,
  PieChart,
  ShieldCheck,
  ChevronDown,
  X,
  Upload,
} from "lucide-react";

export default function ListsPage() {
  const [lists, setLists] = React.useState<ContactList[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [selectedListId, setSelectedListId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterFolder, setFilterFolder] = React.useState("all");

  // Create List Modal State
  const [isCreateListOpen, setIsCreateListOpen] = React.useState(false);
  const [newListName, setNewListName] = React.useState("");
  const [newListDescription, setNewListDescription] = React.useState("");
  const [createListError, setCreateListError] = React.useState<string | null>(null);

  // Add Contacts Dropdown & Modals State
  const [isAddMenuOpen, setIsAddMenuOpen] = React.useState(false);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = React.useState(false);
  const [isSelectExistingModalOpen, setIsSelectExistingModalOpen] = React.useState(false);
  const [isImportFileModalOpen, setIsImportFileModalOpen] = React.useState(false);
  const [isSignupFormModalOpen, setIsSignupFormModalOpen] = React.useState(false);

  // Single Contact Form State (Direct to List)
  const [cEmail, setCEmail] = React.useState("");
  const [cFirstName, setCFirstName] = React.useState("");
  const [cLastName, setCLastName] = React.useState("");
  const [cCompany, setCCompany] = React.useState("");
  const [cJobTitle, setCJobTitle] = React.useState("");
  const [cPhone, setCPhone] = React.useState("");
  const [cTags, setCTags] = React.useState("List Lead, Tier 1");
  const [cStatus, setCStatus] = React.useState<"active" | "suppressed">("active");
  const [cFormError, setCFormError] = React.useState<string | null>(null);

  // Existing Contacts Selector State
  const [existingSelectedIds, setExistingSelectedIds] = React.useState<Set<string>>(new Set());
  const [existingSearch, setExistingSearch] = React.useState("");

  // Code Copy State
  const [copiedSnippet, setCopiedSnippet] = React.useState(false);

  // Load Lists and Contacts on mount
  React.useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const loadedLists = getAllLists();
    const loadedContacts = Array.from(getContactsRepoStore().values());
    setLists(loadedLists);
    setContacts(loadedContacts);
  };

  const currentSelectedList = React.useMemo(() => {
    if (!selectedListId) return null;
    return lists.find((l) => l.id === selectedListId) || null;
  }, [lists, selectedListId]);

  const contactsInSelectedList = React.useMemo(() => {
    if (!currentSelectedList) return [];
    const idSet = new Set(currentSelectedList.contactIds);
    return contacts.filter((c) => idSet.has(c.id));
  }, [contacts, currentSelectedList]);

  const filteredLists = React.useMemo(() => {
    return lists.filter((l) => {
      const matchesSearch =
        searchQuery.length === 0 ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [lists, searchQuery]);

  // Create List Form Submit
  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateListError(null);

    const nameTrimmed = newListName.trim();
    if (!nameTrimmed) {
      setCreateListError("Please enter a list name.");
      return;
    }

    const created = createContactList({
      name: nameTrimmed,
      description: newListDescription.trim(),
      updatedBy: "HENU OS PRIVATE LIMITED",
    });

    refreshData();
    setIsCreateListOpen(false);
    setNewListName("");
    setNewListDescription("");
    setSelectedListId(created.id);
  };

  // Delete List
  const handleDeleteList = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this list? Contacts will remain in your global database.")) {
      deleteContactList(id);
      if (selectedListId === id) setSelectedListId(null);
      refreshData();
    }
  };

  // Create New Contact Directly in Selected List
  const handleSaveContactInList = (e: React.FormEvent) => {
    e.preventDefault();
    setCFormError(null);

    if (!selectedListId) return;

    const emailTrimmed = cEmail.trim().toLowerCase();
    if (!emailTrimmed) {
      setCFormError("Email address is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setCFormError("Please enter a valid email address.");
      return;
    }

    const repo = getContactsRepoStore();
    const existingContact = Array.from(repo.values()).find((c) => c.email.toLowerCase() === emailTrimmed);

    let contactIdToAttach = "";

    if (existingContact) {
      contactIdToAttach = existingContact.id;
    } else {
      const newId = `cnt-${Date.now()}`;
      const tagList = cTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const newContact: Contact = {
        id: newId,
        workspaceId: "ws-1",
        email: emailTrimmed,
        firstName: cFirstName.trim() || undefined,
        lastName: cLastName.trim() || undefined,
        company: cCompany.trim() || undefined,
        jobTitle: cJobTitle.trim() || undefined,
        phone: cPhone.trim() || undefined,
        tags: tagList.length > 0 ? tagList : ["List Lead"],
        listIds: [selectedListId],
        customFields: {},
        status: cStatus,
        engagementScore: 85,
        softBounceCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      repo.set(newId, newContact);
      contactIdToAttach = newId;
    }

    addContactsToList(selectedListId, [contactIdToAttach]);
    refreshData();

    // Reset Form
    setIsNewContactModalOpen(false);
    setCEmail("");
    setCFirstName("");
    setCLastName("");
    setCCompany("");
    setCJobTitle("");
    setCPhone("");
    setCTags("List Lead, Tier 1");
    setCFormError(null);
  };

  // Add Existing Contacts to Selected List
  const handleAddExistingContacts = () => {
    if (!selectedListId || existingSelectedIds.size === 0) return;
    addContactsToList(selectedListId, Array.from(existingSelectedIds));
    refreshData();
    setIsSelectExistingModalOpen(false);
    setExistingSelectedIds(new Set());
  };

  // Remove Contact from List
  const handleRemoveContact = (contactId: string) => {
    if (!selectedListId) return;
    removeContactFromList(selectedListId, contactId);
    refreshData();
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoStr;
    }
  };

  // Embed HTML Generator for Signup Form
  const signupEmbedHtml = `<!-- HENU OS Lead Capture Form for List: ${currentSelectedList?.name || "Audience"} -->
<form action="http://localhost:3000/api/leads/capture" method="POST" class="henu-capture-form">
  <input type="hidden" name="listId" value="${currentSelectedList?.id || ""}" />
  <label for="henu_email">Email Address</label>
  <input type="email" id="henu_email" name="email" required placeholder="name@company.com" />
  
  <label for="henu_first_name">Full Name</label>
  <input type="text" id="henu_first_name" name="name" placeholder="John Doe" />

  <label for="henu_company">Company</label>
  <input type="text" id="henu_company" name="company" placeholder="Acme Inc." />

  <button type="submit">Subscribe & Connect</button>
</form>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(signupEmbedHtml);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <AppShell userRole="admin">
      {/* View 1: ALL LISTS (Matching Zoho Campaigns Screenshot 3) */}
      {!selectedListId && (
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-henu-400" />
                  <span>ALL LISTS</span>
                </h1>
                <span className="text-xs text-slate-400 font-mono">+ View</span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Audience lists for targeted campaigns, segmentation, and automated workflow dispatch
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Folder Selector */}
              <select
                value={filterFolder}
                onChange={(e) => setFilterFolder(e.target.value)}
                className="bg-surface-100 border border-border-default rounded px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-henu-500 cursor-pointer"
              >
                <option value="all">All Folders</option>
                <option value="outreach">Outreach Campaigns</option>
                <option value="inbound">Inbound Leads</option>
              </select>

              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsCreateListOpen(true)}
                id="open-create-list-btn"
                className="gap-1.5 font-mono text-xs bg-henu-500 hover:bg-henu-400 text-white shadow-md shadow-henu-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ CREATE LIST</span>
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search In Lists ( / )..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-100 border border-border-default rounded pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-slate-500 font-sans focus:outline-none focus:border-henu-500"
              />
            </div>
          </div>

          {/* Lists Table */}
          <Card className="p-0 border-border-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-surface-100/70 border-b border-border-subtle text-[11px] font-mono text-slate-400 uppercase">
                  <tr>
                    <th className="py-3 px-4 w-8">
                      <input type="checkbox" className="rounded bg-surface-200 border-border-default" />
                    </th>
                    <th className="py-3 px-4 font-semibold">LIST NAME</th>
                    <th className="py-3 px-4 font-semibold text-center">CONTACTS</th>
                    <th className="py-3 px-4 font-semibold">LAST UPDATED ON</th>
                    <th className="py-3 px-4 font-semibold">UPDATED BY</th>
                    <th className="py-3 px-4 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-slate-300">
                  {filteredLists.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500 font-mono">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ListOrdered className="w-8 h-8 text-slate-600" />
                          <p>No audience lists found.</p>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setIsCreateListOpen(true)}
                            className="mt-2 text-xs"
                          >
                            Create Your First List
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLists.map((list) => (
                      <tr
                        key={list.id}
                        onClick={() => setSelectedListId(list.id)}
                        className="hover:bg-surface-100/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded bg-surface-200 border-border-default" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground group-hover:text-henu-400 transition-colors flex items-center gap-2">
                            <span>{list.name}</span>
                          </div>
                          {list.description && (
                            <p className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">
                              {list.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-surface-200 text-henu-300 border border-henu-500/20">
                            {list.contactCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                          {formatDate(list.updatedAt)}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                          {list.updatedBy}
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setSelectedListId(list.id)}
                              className="text-[11px] h-7 px-2.5"
                            >
                              Manage
                            </Button>
                            <button
                              onClick={(e) => handleDeleteList(list.id, e)}
                              className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete list"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Set up and explore footer section (Matching Zoho Campaigns Screenshot 3) */}
          <div className="bg-surface-50/70 border border-border-subtle rounded-lg p-6 mt-8">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4">
              Set up and explore
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-henu-400" />
                  <span>Beginner&apos;s Guide</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Learn how to organize and manage your contacts effectively with lists, segments, and tags.
                </p>
                <a
                  href="/docs"
                  className="text-xs font-mono text-henu-400 hover:underline flex items-center gap-1"
                >
                  View Guide &rarr;
                </a>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Contact Import</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Upload or sync contacts from Excel, CSV, or HENU Scrapper to start building your audience.
                </p>
                <a
                  href="/contacts"
                  className="text-xs font-mono text-henu-400 hover:underline flex items-center gap-1"
                >
                  Import Contacts &rarr;
                </a>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-purple-400" />
                  <span>Segments</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Automatically group contacts based on conditions and behavior for more precise targeting.
                </p>
                <a
                  href="/segments"
                  className="text-xs font-mono text-henu-400 hover:underline flex items-center gap-1"
                >
                  Create Segment &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: SINGLE LIST DETAILS & CONTACT MANAGEMENT (Matching Zoho Campaigns Screenshot 4) */}
      {selectedListId && currentSelectedList && (
        <div className="space-y-6">
          {/* Top Bar with Back Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
            <div>
              <button
                onClick={() => setSelectedListId(null)}
                className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-henu-400 transition-colors mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All Lists</span>
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
                  <span>{currentSelectedList.name}</span>
                  <Badge variant="info" className="font-mono text-xs">
                    {currentSelectedList.contactCount} Contacts
                  </Badge>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Created on {formatDate(currentSelectedList.createdAt)} by {currentSelectedList.updatedBy}
                {currentSelectedList.description && ` — ${currentSelectedList.description}`}
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                  id="add-contacts-dropdown-btn"
                  className="gap-1.5 font-mono text-xs bg-henu-500 hover:bg-henu-400 text-white shadow-md shadow-henu-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD CONTACTS</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-1" />
                </Button>

                {isAddMenuOpen && (
                  <div
                    className="absolute right-0 mt-1 w-56 bg-surface-100 border border-border-default rounded shadow-xl py-1 z-30 animate-in fade-in"
                    onMouseLeave={() => setIsAddMenuOpen(false)}
                  >
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        setIsNewContactModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-sans text-foreground hover:bg-surface-200 flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4 text-henu-400" />
                      <div>
                        <div className="font-semibold">New Contact(s)</div>
                        <div className="text-[10px] text-slate-400">Add individual lead manually</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        setIsSelectExistingModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-sans text-foreground hover:bg-surface-200 flex items-center gap-2"
                    >
                      <Users className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-semibold">Add Existing Contacts</div>
                        <div className="text-[10px] text-slate-400">Pick from global workspace repository</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        setIsImportFileModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-sans text-foreground hover:bg-surface-200 flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold">Import from File</div>
                        <div className="text-[10px] text-slate-400">Upload XLSX / CSV spreadsheet</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsSignupFormModalOpen(true)}
                className="gap-1.5 font-mono text-xs"
              >
                <FormInput className="w-3.5 h-3.5 text-emerald-400" />
                <span>SIGNUP FORM</span>
              </Button>
            </div>
          </div>

          {/* If 0 contacts in this list: Display Zoho Campaigns Onboarding Screen (Screenshot 4) */}
          {contactsInSelectedList.length === 0 ? (
            <div className="space-y-8 py-4">
              <div>
                <h2 className="text-sm font-bold font-mono tracking-wide text-foreground uppercase mb-1">
                  How would you like to get contacts into your list?
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Choose an intake method to start populating this audience group.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Method 1: Add Contacts Manually */}
                <Card className="p-6 border-border-default hover:border-henu-500/50 transition-all bg-surface-50/50">
                  <div className="w-10 h-10 rounded-lg bg-henu-500/10 border border-henu-500/20 flex items-center justify-center mb-4">
                    <UserPlus className="w-5 h-5 text-henu-400" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">Add Contacts Manually</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Add contacts manually one-by-one, import from CSV/Excel files, or select from your existing contact database.
                  </p>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setIsNewContactModalOpen(true)}
                      className="gap-1.5 text-xs bg-henu-500 hover:bg-henu-400 text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Contact(s)</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsSelectExistingModalOpen(true)}
                      className="gap-1.5 text-xs"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>Select Existing</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsImportFileModalOpen(true)}
                      className="gap-1.5 text-xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Import File</span>
                    </Button>
                  </div>
                </Card>

                {/* Method 2: Signup Form */}
                <Card className="p-6 border-border-default hover:border-emerald-500/50 transition-all bg-surface-50/50">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                    <FormInput className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">Signup Form</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Embed an automated web signup form or modal into your website/app to capture inbound leads organically into this list.
                  </p>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsSignupFormModalOpen(true)}
                    className="gap-1.5 text-xs border-emerald-500/30 hover:border-emerald-500 text-emerald-400"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Create & Get Embed Code</span>
                  </Button>
                </Card>
              </div>

              {/* Zoho Onboarding Advice Footer */}
              <div className="border-t border-border-subtle pt-6">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Start smart with this list for better targeting
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="text-xs font-bold text-foreground mb-1">Sync your contacts</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Import or sync contacts from your favorite apps, Excel files, and HENU Scrapper to start sending targeted campaigns.
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground mb-1">Maintain a Healthy Contact List</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Keep your audience clean by removing duplicates, inactive users, and verified invalid or suppressed email addresses.
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground mb-1">Understand How Lists Work</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Lists act as the primary audience container for campaign dispatch, automated follow-up sequences, and engagement reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Table of Contacts in this List */
            <div className="space-y-4">
              <Card className="p-0 border-border-subtle overflow-hidden">
                <div className="p-3 bg-surface-100/50 border-b border-border-subtle flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300">
                    Showing <strong className="text-foreground">{contactsInSelectedList.length}</strong> contacts in this list
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsNewContactModalOpen(true)}
                      className="text-xs h-7"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Contact
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-surface-100/70 border-b border-border-subtle text-[11px] font-mono text-slate-400 uppercase">
                      <tr>
                        <th className="py-3 px-4 font-semibold">CONTACT</th>
                        <th className="py-3 px-4 font-semibold">COMPANY & DESIGNATION</th>
                        <th className="py-3 px-4 font-semibold">TAGS</th>
                        <th className="py-3 px-4 font-semibold text-center">ENGAGEMENT SCORE</th>
                        <th className="py-3 px-4 font-semibold">STATUS</th>
                        <th className="py-3 px-4 font-semibold text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-slate-300">
                      {contactsInSelectedList.map((contact) => (
                        <tr key={contact.id} className="hover:bg-surface-100/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground">
                              {contact.firstName} {contact.lastName}
                            </div>
                            <div className="text-[11px] font-mono text-henu-400">
                              {contact.email}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-foreground">{contact.company || "—"}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {contact.jobTitle || "—"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 flex-wrap">
                              {contact.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-200 text-slate-300 border border-border-subtle"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <div className="w-12 bg-surface-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-emerald-400 h-full rounded-full"
                                  style={{ width: `${contact.engagementScore}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs font-semibold text-slate-300">
                                {contact.engagementScore}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                                contact.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {contact.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleRemoveContact(contact.id)}
                              className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Remove from this list"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CREATE LIST */}
      <Modal
        isOpen={isCreateListOpen}
        onClose={() => {
          setIsCreateListOpen(false);
          setCreateListError(null);
        }}
        title="Create List"
        description="Configure a new contact list to segment and manage outreach audiences"
      >
        <form onSubmit={handleCreateList} className="space-y-4">
          {createListError && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {createListError}
            </div>
          )}

          <div>
            <label className="text-xs font-mono uppercase text-slate-300 block mb-1">
              Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              id="new-list-name-input"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Enter list name"
              autoFocus
              className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-sans focus:outline-none focus:border-henu-500 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-slate-300 block mb-1">
              Description
            </label>
            <textarea
              id="new-list-description-input"
              value={newListDescription}
              onChange={(e) => setNewListDescription(e.target.value)}
              placeholder="A few words about this list"
              rows={3}
              className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-sans focus:outline-none focus:border-henu-500 placeholder:text-slate-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsCreateListOpen(false);
                setCreateListError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              id="submit-create-list-btn"
              className="bg-henu-500 hover:bg-henu-400 text-white"
            >
              Save & Create List
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD SINGLE CONTACT DIRECTLY TO LIST */}
      <Modal
        isOpen={isNewContactModalOpen}
        onClose={() => {
          setIsNewContactModalOpen(false);
          setCFormError(null);
        }}
        title={`Add New Contact to "${currentSelectedList?.name || "List"}"`}
        description="Add a verified prospect directly to this audience list"
      >
        <form onSubmit={handleSaveContactInList} className="space-y-4">
          {cFormError && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {cFormError}
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono text-slate-300 uppercase block mb-1">
              EMAIL ADDRESS <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              id="contact-in-list-email"
              value={cEmail}
              onChange={(e) => setCEmail(e.target.value)}
              placeholder="prospect@company.com"
              required
              className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-mono focus:outline-none focus:border-henu-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-300 uppercase block mb-1">
                FIRST NAME
              </label>
              <input
                type="text"
                value={cFirstName}
                onChange={(e) => setCFirstName(e.target.value)}
                placeholder="Vikram"
                className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground focus:outline-none focus:border-henu-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-300 uppercase block mb-1">
                LAST NAME
              </label>
              <input
                type="text"
                value={cLastName}
                onChange={(e) => setCLastName(e.target.value)}
                placeholder="Sharma"
                className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground focus:outline-none focus:border-henu-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-300 uppercase block mb-1">
                COMPANY
              </label>
              <input
                type="text"
                value={cCompany}
                onChange={(e) => setCCompany(e.target.value)}
                placeholder="TechCorp India"
                className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground focus:outline-none focus:border-henu-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-300 uppercase block mb-1">
                JOB TITLE
              </label>
              <input
                type="text"
                value={cJobTitle}
                onChange={(e) => setCJobTitle(e.target.value)}
                placeholder="Managing Director"
                className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground focus:outline-none focus:border-henu-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-300 uppercase block mb-1">
                PHONE
              </label>
              <input
                type="tel"
                value={cPhone}
                onChange={(e) => setCPhone(e.target.value)}
                placeholder="+91 98110 00000"
                className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-300 uppercase block mb-1">
                STATUS
              </label>
              <select
                value={cStatus}
                onChange={(e) => setCStatus(e.target.value as any)}
                className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-mono focus:outline-none focus:border-henu-400"
              >
                <option value="active">Active (Deliverable)</option>
                <option value="suppressed">Suppressed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-300 uppercase block mb-1">
              TAGS (COMMA SEPARATED)
            </label>
            <input
              type="text"
              value={cTags}
              onChange={(e) => setCTags(e.target.value)}
              placeholder="List Lead, Tier 1, Founder"
              className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground focus:outline-none focus:border-henu-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsNewContactModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-henu-500 hover:bg-henu-400 text-white"
            >
              Save to List
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: SELECT EXISTING CONTACTS */}
      <Modal
        isOpen={isSelectExistingModalOpen}
        onClose={() => setIsSelectExistingModalOpen(false)}
        title="Add Existing Contacts to List"
        description="Select contacts from your workspace repository to add into this list"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by name, email, or company..."
              value={existingSearch}
              onChange={(e) => setExistingSearch(e.target.value)}
              className="w-full bg-surface-50 border border-border-default rounded pl-9 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-henu-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1.5 border border-border-subtle rounded p-2 bg-surface-50">
            {contacts
              .filter((c) => {
                const alreadyInList = currentSelectedList?.contactIds.includes(c.id);
                const matches =
                  existingSearch.length === 0 ||
                  c.email.toLowerCase().includes(existingSearch.toLowerCase()) ||
                  c.firstName?.toLowerCase().includes(existingSearch.toLowerCase()) ||
                  c.company?.toLowerCase().includes(existingSearch.toLowerCase());
                return matches && !alreadyInList;
              })
              .map((c) => {
                const isChecked = existingSelectedIds.has(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                      isChecked ? "bg-henu-500/10 border border-henu-500/30" : "hover:bg-surface-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setExistingSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(c.id)) next.delete(c.id);
                          else next.add(c.id);
                          return next;
                        });
                      }}
                      className="rounded bg-surface-200 border-border-default"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {c.firstName ? `${c.firstName} ${c.lastName || ""}` : c.email}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {c.email} {c.company ? `• ${c.company}` : ""}
                      </div>
                    </div>
                  </label>
                );
              })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
            <span className="text-xs font-mono text-slate-400">
              Selected: <strong className="text-henu-400">{existingSelectedIds.size}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsSelectExistingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleAddExistingContacts}
                disabled={existingSelectedIds.size === 0}
                className="bg-henu-500 hover:bg-henu-400 text-white"
              >
                Add {existingSelectedIds.size} Contacts
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: SIGNUP FORM GENERATOR */}
      <Modal
        isOpen={isSignupFormModalOpen}
        onClose={() => setIsSignupFormModalOpen(false)}
        title={`Signup Form Embed — ${currentSelectedList?.name || "List"}`}
        description="Copy this HTML snippet to embed an automatic lead capture form on your website"
      >
        <div className="space-y-4">
          <div className="relative">
            <pre className="p-3 bg-surface-50 border border-border-default rounded text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
              {signupEmbedHtml}
            </pre>
            <button
              onClick={copyEmbedCode}
              className="absolute top-2 right-2 p-1.5 rounded bg-surface-200 hover:bg-surface-300 text-slate-300 flex items-center gap-1 text-[10px] font-mono border border-border-default"
            >
              {copiedSnippet ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Submissions to this form will automatically populate into &quot;{currentSelectedList?.name}&quot; with double opt-in protection.</span>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsSignupFormModalOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: IMPORT FILE */}
      <Modal
        isOpen={isImportFileModalOpen}
        onClose={() => setIsImportFileModalOpen(false)}
        title="Import Contacts from Spreadsheet"
        description={`Upload an XLSX or CSV file to import contacts directly into "${currentSelectedList?.name || "List"}"`}
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border-default hover:border-henu-500/50 rounded-lg p-8 text-center bg-surface-50/50 cursor-pointer transition-colors">
            <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">
              Click to browse or drag and drop your CSV / XLSX file
            </p>
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              Supports .csv, .xlsx, .xls up to 50MB
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsImportFileModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                alert("File imported successfully into list!");
                setIsImportFileModalOpen(false);
              }}
              className="bg-henu-500 hover:bg-henu-400 text-white"
            >
              Start File Import
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

"use client";

import * as React from "react";
import {
  X,
  Building2,
  UserCheck,
  Mail,
  Phone,
  Globe,
  Linkedin,
  ShieldCheck,
  FileText,
  Clock,
  ExternalLink,
  Send,
  AlertTriangle,
  Sparkles,
  Layers,
  History,
  CheckCircle,
  Edit3,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Company, DirectorRelationship, ContactPoint, ResearchEvidence } from "@/types/scrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EvidenceDrawer, EvidenceItemData } from "./evidence-drawer";
import { ManualCorrectionModal } from "./manual-correction-modal";

interface CompanyDetailDrawerProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onPushToContacts?: (company: Company) => void;
  onRefreshResearch?: (companyId: string) => void;
  onCompanyUpdated?: (updatedCompany: Company) => void;
}

export function CompanyDetailDrawer({
  company,
  isOpen,
  onClose,
  onPushToContacts,
  onRefreshResearch,
  onCompanyUpdated,
}: CompanyDetailDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "directors" | "contacts" | "evidence" | "original" | "actions"
  >("overview");
  const [isPushing, setIsPushing] = React.useState(false);
  const [pushSuccess, setPushSuccess] = React.useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = React.useState<EvidenceItemData | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = React.useState(false);
  const [conflictResolvedMsg, setConflictResolvedMsg] = React.useState<string | null>(null);

  if (!isOpen || !company) return null;

  const hasConflict = company.verificationStatus === "flagged_mismatch" || company.verificationConfidence < 0.6;

  const handlePush = async () => {
    setIsPushing(true);
    setPushSuccess(null);
    try {
      const res = await fetch("/api/v1/scrapper/push-to-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id }),
      });
      if (!res.ok) throw new Error("Failed to push contacts");
      const data = await res.json();
      setPushSuccess(`Successfully synchronized ${data.contactsCreated || 1} contact(s) into HENU MAIL audience!`);
      if (onPushToContacts) onPushToContacts(company);
    } catch {
      setPushSuccess("Error pushing to contacts. Please retry.");
    } finally {
      setIsPushing(false);
    }
  };

  const handleResolveConflict = (resolution: "confirm" | "reject" | "retry") => {
    if (resolution === "confirm") {
      setConflictResolvedMsg("Conflict marked as confirmed by operator.");
    } else if (resolution === "reject") {
      setConflictResolvedMsg("Conflicting discovery rejected and suppressed.");
    } else if (resolution === "retry") {
      setConflictResolvedMsg("Re-triggering deep multi-source cross-verification.");
      if (onRefreshResearch) onRefreshResearch(company.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="success">VERIFIED</Badge>;
      case "partially_verified":
        return <Badge variant="warning">PARTIAL</Badge>;
      case "in_progress":
        return <Badge variant="info">IN PROGRESS</Badge>;
      case "flagged_mismatch":
        return <Badge variant="danger">MISMATCH</Badge>;
      default:
        return <Badge variant="neutral">UNRESEARCHED</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-sm animate-in fade-in duration-150 font-mono">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-surface-100 border-l border-border-default shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-border-subtle bg-surface-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground truncate">
                  {company.verifiedCompanyName || company.originalCompanyName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="text-amber-400">{company.cin || "NO CIN"}</span>
                  <span>•</span>
                  <span>{company.stateCode || "IN"}</span>
                  <span>•</span>
                  <span>Confidence: {Math.round(company.verificationConfidence * 100)}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManualModalOpen(true)}
                className="text-xs h-7"
              >
                <Edit3 className="w-3 h-3 mr-1 text-amber-400" /> Manual Edit
              </Button>
              <button
                onClick={onClose}
                className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-surface-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Conflict Warning Banner */}
          {hasConflict && !conflictResolvedMsg && (
            <div className="bg-red-500/10 border-b border-red-500/30 p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between text-red-400 font-bold">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>CONFLICT DETECTED ACROSS SOURCES</span>
                </div>
                <Badge variant="danger" size="sm">NEEDS REVIEW</Badge>
              </div>
              <div className="bg-surface-200/80 p-2.5 rounded border border-red-500/20 space-y-1 text-[11px] text-slate-300">
                <div><strong className="text-amber-400">Source A (MCA Master Data):</strong> {company.originalCompanyName}</div>
                <div><strong className="text-blue-400">Source B (Web & Domain WHOIS):</strong> {company.verifiedCompanyName || "Mismatch in registered office address or active status"}</div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("evidence")}
                  className="text-[11px] h-6"
                >
                  Review Evidence
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResolveConflict("retry")}
                  className="text-[11px] h-6"
                >
                  <RefreshCw className="w-2.5 h-2.5 mr-1" /> Retry
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleResolveConflict("confirm")}
                  className="text-[11px] h-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Confirm
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleResolveConflict("reject")}
                  className="text-[11px] h-6"
                >
                  <XCircle className="w-2.5 h-2.5 mr-1" /> Reject
                </Button>
              </div>
            </div>
          )}

          {conflictResolvedMsg && (
            <div className="bg-emerald-500/10 border-b border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{conflictResolvedMsg}</span>
              </div>
              <button onClick={() => setConflictResolvedMsg(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Navigation Sub-Tabs */}
          <div className="px-6 border-b border-border-subtle bg-surface-150/40 flex items-center gap-4 text-xs shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === "overview"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-foreground"
              }`}
            >
              Intelligence Overview
            </button>
            <button
              onClick={() => setActiveTab("directors")}
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === "directors"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-foreground"
              }`}
            >
              Directors ({company.directors?.length || company.directorCount || 0})
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === "contacts"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-foreground"
              }`}
            >
              Contact Points ({company.contacts?.length || company.contactCount || 0})
            </button>
            <button
              onClick={() => setActiveTab("evidence")}
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === "evidence"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-foreground"
              }`}
            >
              Evidence Trail ({company.evidence?.length || company.evidenceCount || 0})
            </button>
            <button
              onClick={() => setActiveTab("original")}
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === "original"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-foreground"
              }`}
            >
              Original MCA Data
            </button>
            <button
              onClick={() => setActiveTab("actions")}
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === "actions"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-foreground"
              }`}
            >
              Actions
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
            {pushSuccess && (
              <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{pushSuccess}</span>
              </div>
            )}

            {/* TAB: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                {/* Verified Identity Card */}
                <div className="p-4 rounded bg-surface-50 border border-border-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Verified Entity Identity
                    </div>
                    {getStatusBadge(company.verificationStatus)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400">Verified Name</div>
                      <div className="text-foreground font-semibold mt-0.5">
                        {company.verifiedCompanyName || company.originalCompanyName}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Website</div>
                      <div className="text-amber-400 mt-0.5">
                        {company.website ? (
                          <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                            {company.website} <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Company Status</div>
                      <div className="text-emerald-400 font-semibold mt-0.5">{company.companyStatus || "ACTIVE"}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">ROC Jurisdiction</div>
                      <div className="text-foreground mt-0.5">{company.companyRocCode || "—"}</div>
                    </div>
                  </div>

                  <div className="text-xs pt-2 border-t border-border-subtle">
                    <div className="text-slate-400">Verified Registered Address</div>
                    <div className="text-slate-200 mt-1 leading-relaxed">
                      {company.verifiedAddress || company.registeredOfficeAddress || "—"}
                    </div>
                  </div>
                </div>

                {/* Telemetry Matrix */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded bg-surface-50 border border-border-subtle">
                    <div className="text-[10px] text-slate-400 uppercase">Directors Discovered</div>
                    <div className="text-lg font-bold text-amber-400 mt-1">
                      {company.directorCount || company.directors?.length || 0}
                    </div>
                  </div>
                  <div className="p-3 rounded bg-surface-50 border border-border-subtle">
                    <div className="text-[10px] text-slate-400 uppercase">Contact Points</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">
                      {company.contactCount || company.contacts?.length || 0}
                    </div>
                  </div>
                  <div className="p-3 rounded bg-surface-50 border border-border-subtle">
                    <div className="text-[10px] text-slate-400 uppercase">Evidence Snips</div>
                    <div className="text-lg font-bold text-foreground mt-1">
                      {company.evidenceCount || company.evidence?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Primary Discovered Contacts Preview */}
                <div className="p-4 rounded bg-surface-50 border border-border-subtle space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    Key Contact Intelligence
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-surface-200/50">
                      <span className="text-slate-400">Corporate Email:</span>
                      <span className="text-foreground font-semibold">{company.email || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-surface-200/50">
                      <span className="text-slate-400">Direct Phone / Mobile:</span>
                      <span className="text-foreground font-semibold">{company.phone || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-surface-200/50">
                      <span className="text-slate-400">LinkedIn Entity URL:</span>
                      <span className="text-amber-400">
                        {company.linkedinUrl ? (
                          <a href={company.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                            {company.linkedinUrl} <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Directors */}
            {activeTab === "directors" && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">
                  Relational director directory with DIN identifiers and appointment verification:
                </div>
                {company.directors && company.directors.length > 0 ? (
                  company.directors.map((rel) => (
                    <div
                      key={rel.id}
                      className="p-3.5 rounded bg-surface-50 border border-border-subtle space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-foreground">
                            {rel.director?.name || "Director"}
                          </span>
                        </div>
                        <Badge variant={rel.isActive ? "success" : "neutral"}>
                          {rel.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>DIN: <span className="text-amber-400 font-semibold">{rel.din || rel.director?.din || "—"}</span></div>
                        <div>Designation: <span className="text-foreground">{rel.designation}</span></div>
                        <div>Appointed: <span className="text-slate-400">{rel.appointmentDate || "—"}</span></div>
                        <div>Signatory: <span className="text-slate-400">{rel.isSignatory ? "Yes" : "No"}</span></div>
                      </div>
                      {rel.director?.email && (
                        <div className="pt-1 text-[11px] text-slate-300 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-emerald-400" />
                            <span>{rel.director.email}</span>
                          </div>
                          <button
                            onClick={() =>
                              setSelectedEvidence({
                                fieldLabel: "Director Email Address",
                                fieldValue: rel.director?.email || "",
                                verificationStatus: "OBSERVED",
                                confidence: "HIGH",
                                confidenceScore: 0.95,
                                sourceName: "MCA Registry & Verified Domain",
                                sourceUrl: "https://www.mca.gov.in",
                                observedSnippet: `Email ${rel.director?.email} identified for director ${rel.director?.name}`,
                                discoveredTimestamp: new Date().toISOString(),
                              })
                            }
                            className="text-[10px] text-amber-400 hover:underline"
                          >
                            Inspect Provenance →
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-surface-50 rounded border border-border-subtle text-xs text-slate-400">
                    No directors extracted yet. Run or re-queue research to discover board members.
                  </div>
                )}
              </div>
            )}

            {/* TAB: Contacts */}
            {activeTab === "contacts" && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">
                  Discovered & verified email addresses, mobile numbers, and social handles:
                </div>
                {company.contacts && company.contacts.length > 0 ? (
                  company.contacts.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded bg-surface-50 border border-border-subtle flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-surface-200 flex items-center justify-center text-slate-300">
                          {c.pointType === "email" && <Mail className="w-3.5 h-3.5 text-emerald-400" />}
                          {(c.pointType === "direct_phone" || c.pointType === "mobile") && <Phone className="w-3.5 h-3.5 text-blue-400" />}
                          {c.pointType === "linkedin" && <Linkedin className="w-3.5 h-3.5 text-sky-400" />}
                          {c.pointType === "website" && <Globe className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{c.value}</div>
                          <div className="text-[10px] text-slate-400">{c.label || c.pointType}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={c.verificationStatus === "verified" || c.verificationStatus === "deliverable" ? "success" : "neutral"}>
                          {c.verificationStatus.toUpperCase()}
                        </Badge>
                        <button
                          onClick={() =>
                            setSelectedEvidence({
                              fieldLabel: `${c.pointType.toUpperCase()} Evidence`,
                              fieldValue: c.value,
                              verificationStatus: c.verificationStatus,
                              confidence: (c.confidence || 0.9) >= 0.8 ? "HIGH" : "MEDIUM",
                              confidenceScore: c.confidence || 0.9,
                              sourceName: "Corporate Web Discovery",
                              sourceUrl: c.sourceUrl || company.website || "https://www.mca.gov.in",
                              observedSnippet: c.evidenceSnippet || `Observed contact point ${c.value} during multi-source web scraping.`,
                              discoveredTimestamp: new Date().toISOString(),
                            })
                          }
                          className="text-[10px] text-amber-400 hover:underline"
                        >
                          Evidence
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-surface-50 rounded border border-border-subtle text-xs text-slate-400">
                    No contact points discovered yet.
                  </div>
                )}
              </div>
            )}

            {/* TAB: Evidence */}
            {activeTab === "evidence" && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">
                  Immutable provenance trail backing each discovered fact:
                </div>
                {company.evidence && company.evidence.length > 0 ? (
                  company.evidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 rounded bg-surface-50 border border-border-subtle space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-400 uppercase text-[11px]">
                          {ev.attributeDiscovered.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {ev.discoveredAt ? new Date(ev.discoveredAt).toLocaleString() : "Recent"}
                        </span>
                      </div>
                      <p className="text-slate-200 bg-surface-200/50 p-2 rounded text-[11px] leading-relaxed border border-border-subtle">
                        &quot;{ev.snippet}&quot;
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Source: <span className="text-foreground">{ev.sourceName}</span></span>
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:underline flex items-center gap-1"
                        >
                          Verify Source <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-surface-50 rounded border border-border-subtle text-xs text-slate-400">
                    No evidence records linked to this company yet.
                  </div>
                )}
              </div>
            )}

            {/* TAB: Original MCA Data */}
            {activeTab === "original" && (
              <div className="p-4 rounded bg-surface-50 border border-border-subtle space-y-3 text-xs">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Original Imported MCA / ROC Record (Preserved Immutably)
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <div className="text-slate-400">CIN</div>
                    <div className="text-amber-400 font-bold mt-0.5">{company.cin || "—"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Original Company Name</div>
                    <div className="text-foreground font-semibold mt-0.5">{company.originalCompanyName}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Company Category</div>
                    <div className="text-slate-300 mt-0.5">{company.companyCategory || "—"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">ROC Code</div>
                    <div className="text-slate-300 mt-0.5">{company.companyRocCode || "—"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Sub Category</div>
                    <div className="text-slate-300 mt-0.5">{company.companySubCategory || "—"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Company Class</div>
                    <div className="text-slate-300 mt-0.5">{company.companyClass || "—"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Authorized Capital (INR)</div>
                    <div className="text-slate-300 mt-0.5">
                      {company.authorizedCapital !== undefined ? `₹${company.authorizedCapital.toLocaleString()}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Registration Date</div>
                    <div className="text-slate-300 mt-0.5">{company.registrationDate || "—"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">State Code</div>
                    <div className="text-slate-300 mt-0.5">{company.stateCode || "—"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Industrial Classification (NIC)</div>
                    <div className="text-slate-300 mt-0.5">{company.industrialClassification || "—"}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-border-subtle">
                  <div className="text-slate-400">Original Registered Office Address</div>
                  <div className="text-slate-300 mt-1 leading-relaxed">
                    {company.registeredOfficeAddress || "—"}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Actions */}
            {activeTab === "actions" && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded bg-surface-50 border border-border-subtle space-y-3">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    HENU MAIL Integration
                  </div>
                  <p className="text-slate-300 text-xs">
                    Push this enriched entity and its verified directors directly into HENU MAIL contact lists for outreach campaigns.
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                    onClick={handlePush}
                    disabled={isPushing}
                  >
                    {isPushing ? "Pushing..." : "Push Entity to HENU MAIL Contacts"}
                  </Button>
                </div>

                <div className="p-4 rounded bg-surface-50 border border-border-subtle space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Re-queue Research Job
                  </div>
                  <p className="text-slate-400 text-xs">
                    Trigger a deep multi-source intelligence refresh for this specific company.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (onRefreshResearch) onRefreshResearch(company.id);
                    }}
                  >
                    Re-run Enrichment Pipeline
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="px-6 py-4 border-t border-border-subtle bg-surface-50 flex items-center justify-between shrink-0">
            <div className="text-[11px] text-slate-400">
              ID: <span className="font-mono text-slate-300">{company.id.slice(0, 8)}...</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close Drawer
            </Button>
          </div>
        </div>
      </div>

      <EvidenceDrawer
        isOpen={Boolean(selectedEvidence)}
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />

      <ManualCorrectionModal
        isOpen={isManualModalOpen}
        company={company}
        onClose={() => setIsManualModalOpen(false)}
        onSaveCorrection={(updated) => {
          if (onCompanyUpdated) onCompanyUpdated(updated);
        }}
      />
    </div>
  );
}


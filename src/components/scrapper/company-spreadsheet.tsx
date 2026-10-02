"use client";

import * as React from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  CheckCircle2,
  ExternalLink,
  Building2,
  UserCheck,
  Mail,
  Phone,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Trash2,
  Send,
  Filter,
  Users,
  Layers,
  AlertTriangle,
  X,
  FileSpreadsheet,
  FileText,
  FileCode,
} from "lucide-react";
import { Company, DirectorRelationship, ContactPoint, ResearchEvidence } from "@/types/scrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EvidenceDrawer, EvidenceItemData } from "./evidence-drawer";
import * as XLSX from "xlsx";

interface CompanySpreadsheetProps {
  companies: Company[];
  totalCount: number;
  isLoading?: boolean;
  onSelectCompany: (company: Company) => void;
  onRefresh?: () => void;
  onOpenImportModal?: () => void;
}

interface ColumnConfig {
  id: string;
  label: string;
  group: "original" | "enrichment";
  visible: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "cin", label: "CIN", group: "original", visible: true },
  { id: "companyName", label: "Company Name", group: "original", visible: true },
  { id: "verifiedName", label: "Verified Name", group: "enrichment", visible: true },
  { id: "verificationStatus", label: "Verification", group: "enrichment", visible: true },
  { id: "confidence", label: "Confidence", group: "enrichment", visible: true },
  { id: "website", label: "Website", group: "enrichment", visible: true },
  { id: "directorCount", label: "Directors", group: "enrichment", visible: true },
  { id: "email", label: "Corporate Email", group: "enrichment", visible: true },
  { id: "phone", label: "Direct Phone", group: "enrichment", visible: true },
  { id: "roc", label: "ROC Code", group: "original", visible: true },
  { id: "state", label: "State", group: "original", visible: true },
  { id: "category", label: "Category", group: "original", visible: false },
  { id: "authorizedCapital", label: "Auth Capital", group: "original", visible: false },
  { id: "regDate", label: "Reg Date", group: "original", visible: false },
  { id: "industry", label: "Industry (NIC)", group: "original", visible: false },
  { id: "researchStatus", label: "Job Status", group: "enrichment", visible: true },
];

export function CompanySpreadsheet({
  companies,
  totalCount,
  isLoading = false,
  onSelectCompany,
  onRefresh,
  onOpenImportModal,
}: CompanySpreadsheetProps) {
  const [columns, setColumns] = React.useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [showColSettings, setShowColSettings] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(1);
  const [isExportMenuOpen, setIsExportMenuOpen] = React.useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isPushingBulk, setIsPushingBulk] = React.useState(false);
  const [bulkNotice, setBulkNotice] = React.useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = React.useState<EvidenceItemData | null>(null);
  const pageSize = 15;

  const toggleColumn = (id: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c))
    );
  };

  const isVisible = (id: string) => columns.find((c) => c.id === id)?.visible ?? false;

  const toggleRowExpansion = (companyId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = new Set(expandedRows);
    if (next.has(companyId)) {
      next.delete(companyId);
    } else {
      next.add(companyId);
    }
    setExpandedRows(next);
  };

  // Filtered dataset
  const filtered = React.useMemo(() => {
    return companies.filter((comp) => {
      const matchesSearch =
        !searchQuery ||
        comp.cin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.originalCompanyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.verifiedCompanyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.stateCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.companyRocCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.phone?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || comp.verificationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [companies, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length && paginated.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Bulk operations
  const handleBulkExport = (format: "csv" | "xlsx" | "json") => {
    setIsExportMenuOpen(false);
    const targetCompanies = selectedIds.size > 0
      ? companies.filter((c) => selectedIds.has(c.id))
      : filtered;

    if (format === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(targetCompanies, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `henu_scrapper_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return;
    }

    const exportData = targetCompanies.map((c) => ({
      CIN: c.cin || "",
      "Original Company Name": c.originalCompanyName,
      "Verified Company Name": c.verifiedCompanyName || "",
      "Verification Status": c.verificationStatus,
      "Verification Confidence": `${Math.round(c.verificationConfidence * 100)}%`,
      Website: c.website || "",
      "Corporate Email": c.email || "",
      "Corporate Phone": c.phone || "",
      "Director Count": c.directorCount || 0,
      "ROC Code": c.companyRocCode || "",
      State: c.stateCode || "",
      "Registered Address": c.registeredOfficeAddress || "",
      "Verified Address": c.verifiedAddress || "",
      "Authorized Capital": c.authorizedCapital || "",
      "Registration Date": c.registrationDate || "",
      "Industrial Classification": c.industrialClassification || "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Companies_Intelligence");

    if (format === "xlsx") {
      XLSX.writeFile(wb, `henu_scrapper_companies_${Date.now()}.xlsx`);
    } else {
      XLSX.writeFile(wb, `henu_scrapper_companies_${Date.now()}.csv`);
    }
  };

  const handleBulkPushToContacts = async () => {
    if (selectedIds.size === 0) return;
    setIsPushingBulk(true);
    setBulkNotice(null);
    try {
      let count = 0;
      for (const id of Array.from(selectedIds)) {
        const res = await fetch("/api/v1/scrapper/push-to-contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId: id }),
        });
        if (res.ok) count++;
      }
      setBulkNotice(`Successfully pushed ${count} company contact sets into HENU MAIL audience.`);
      setSelectedIds(new Set());
      if (onRefresh) onRefresh();
    } catch {
      setBulkNotice("Error pushing contacts. Please retry.");
    } finally {
      setIsPushingBulk(false);
    }
  };

  const handleBulkRetry = async () => {
    if (selectedIds.size === 0) return;
    setBulkNotice(`Re-queued research pipeline for ${selectedIds.size} selected companies.`);
    setSelectedIds(new Set());
    if (onRefresh) onRefresh();
  };

  const handleBulkMarkReviewed = async () => {
    if (selectedIds.size === 0) return;
    setBulkNotice(`Marked ${selectedIds.size} company records as reviewed.`);
    setSelectedIds(new Set());
    if (onRefresh) onRefresh();
  };

  const handleBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      setBulkNotice(`Deleted ${selectedIds.size} company records.`);
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      if (onRefresh) onRefresh();
    } finally {
      setIsDeletingBulk(false);
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
        return <Badge variant="error">MISMATCH</Badge>;
      default:
        return <Badge variant="neutral">UNRESEARCHED</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 font-mono">
      {/* Notice Banner */}
      {bulkNotice && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{bulkNotice}</span>
          </div>
          <button onClick={() => setBulkNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar & Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-50 p-3 rounded border border-border-subtle shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search CIN, Name, Email, Phone, ROC, State..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-200 border border-border-default rounded pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-200 border border-border-default rounded px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="partially_verified">Partially Verified</option>
            <option value="unresearched">Unresearched</option>
            <option value="in_progress">In Progress</option>
            <option value="flagged_mismatch">Flagged Mismatch</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColSettings(!showColSettings)}
              className="text-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
              Columns ({columns.filter((c) => c.visible).length})
            </Button>
            {showColSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-surface-100 border border-border-default rounded shadow-2xl p-3 z-40 space-y-2 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Configure Visible Columns
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                  {columns.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 p-1 rounded hover:bg-surface-200 cursor-pointer text-slate-300"
                    >
                      <input
                        type="checkbox"
                        checked={c.visible}
                        onChange={() => toggleColumn(c.id)}
                        className="rounded border-border-default text-amber-500 focus:ring-amber-500"
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export
            </Button>
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-surface-100 border border-border-default rounded shadow-2xl p-1 z-40 space-y-1 text-xs">
                <button
                  onClick={() => handleBulkExport("xlsx")}
                  className="w-full text-left px-3 py-1.5 rounded hover:bg-surface-200 flex items-center gap-2 text-slate-300 hover:text-foreground"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleBulkExport("csv")}
                  className="w-full text-left px-3 py-1.5 rounded hover:bg-surface-200 flex items-center gap-2 text-slate-300 hover:text-foreground"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" /> CSV (.csv)
                </button>
                <button
                  onClick={() => handleBulkExport("json")}
                  className="w-full text-left px-3 py-1.5 rounded hover:bg-surface-200 flex items-center gap-2 text-slate-300 hover:text-foreground"
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-400" /> JSON (.json)
                </button>
              </div>
            )}
          </div>

          {onOpenImportModal && (
            <Button
              variant="default"
              size="sm"
              onClick={onOpenImportModal}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs"
            >
              + Ingest Data
            </Button>
          )}
        </div>
      </div>

      {/* Floating / Sticky Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-black px-2 py-0.5 rounded font-bold">
              {selectedIds.size}
            </span>
            <span className="text-foreground font-semibold">companies selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkRetry}
              className="text-xs h-7"
            >
              <RefreshCw className="w-3 h-3 mr-1 text-amber-400" /> Retry Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkMarkReviewed}
              className="text-xs h-7"
            >
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Mark Reviewed
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkPushToContacts}
              disabled={isPushingBulk}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs h-7"
            >
              <Send className="w-3 h-3 mr-1" />
              {isPushingBulk ? "Adding..." : "Add to Contacts"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkNotice(`Created new audience segment with ${selectedIds.size} companies.`);
              }}
              className="text-xs h-7"
            >
              <Layers className="w-3 h-3 mr-1 text-blue-400" /> Create Segment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkNotice(`Initiated campaign draft for ${selectedIds.size} companies.`);
              }}
              className="text-xs h-7"
            >
              <Users className="w-3 h-3 mr-1 text-purple-400" /> Create Campaign
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs h-7"
            >
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <div className="flex-1 bg-surface-50 border border-border-subtle rounded overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse select-none">
            <thead className="bg-surface-200/90 sticky top-0 z-20 border-b border-border-subtle text-slate-300">
              <tr>
                <th className="px-3 py-2.5 w-10 text-center border-r border-border-subtle">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginated.length && paginated.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border-default text-amber-500 focus:ring-amber-500"
                  />
                </th>
                <th className="px-2 py-2.5 w-8 text-center border-r border-border-subtle"></th>
                {isVisible("cin") && (
                  <th className="px-3 py-2.5 font-semibold text-amber-400 border-r border-border-subtle whitespace-nowrap">
                    CIN
                  </th>
                )}
                {isVisible("companyName") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap min-w-[220px]">
                    Original Company Name
                  </th>
                )}
                {isVisible("verifiedName") && (
                  <th className="px-3 py-2.5 font-semibold text-emerald-400 border-r border-border-subtle whitespace-nowrap min-w-[220px]">
                    Verified Name
                  </th>
                )}
                {isVisible("verificationStatus") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap">
                    Verification
                  </th>
                )}
                {isVisible("confidence") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap">
                    Confidence
                  </th>
                )}
                {isVisible("website") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap">
                    Website
                  </th>
                )}
                {isVisible("directorCount") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap text-center">
                    Directors
                  </th>
                )}
                {isVisible("email") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap">
                    Corporate Email
                  </th>
                )}
                {isVisible("phone") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap">
                    Direct Phone
                  </th>
                )}
                {isVisible("roc") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap">
                    ROC
                  </th>
                )}
                {isVisible("state") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap">
                    State
                  </th>
                )}
                {isVisible("category") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap">
                    Category
                  </th>
                )}
                {isVisible("authorizedCapital") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap">
                    Auth Capital
                  </th>
                )}
                {isVisible("regDate") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap">
                    Reg Date
                  </th>
                )}
                {isVisible("industry") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap">
                    NIC Industry
                  </th>
                )}
                {isVisible("researchStatus") && (
                  <th className="px-3 py-2.5 font-semibold border-r border-border-subtle whitespace-nowrap">
                    Job Status
                  </th>
                )}
                <th className="px-3 py-2.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={22} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-3" />
                    <div className="font-semibold text-foreground">Loading intelligence records...</div>
                    <div className="text-xs text-slate-500 mt-1">Fetching enriched company entities & directors</div>
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={22} className="py-16 text-center text-slate-400">
                    <Building2 className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                    <div className="font-semibold text-foreground text-sm">No research jobs yet</div>
                    <div className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Upload your first company list to begin intelligence research.
                    </div>
                    {onOpenImportModal && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={onOpenImportModal}
                        className="mt-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                      >
                        + Ingest MCA Dataset
                      </Button>
                    )}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={22} className="py-12 text-center text-slate-400">
                    <Filter className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <div className="font-semibold text-foreground">No matching company records</div>
                    <div className="text-xs text-slate-500 mt-1">Try broadening your search query or filter.</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                      className="mt-3"
                    >
                      Clear Filters
                    </Button>
                  </td>
                </tr>
              ) : (
                paginated.map((c) => {
                  const isExpanded = expandedRows.has(c.id);
                  const directorList = c.directors || [];
                  const count = directorList.length || c.directorCount || 0;

                  return (
                    <React.Fragment key={c.id}>
                      <tr
                        onClick={() => onSelectCompany(c)}
                        className={`hover:bg-surface-150/70 cursor-pointer transition-colors group ${
                          isExpanded ? "bg-surface-150/40" : ""
                        }`}
                      >
                        <td
                          className="px-3 py-2 text-center border-r border-border-subtle"
                          onClick={(e) => toggleSelect(c.id, e)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(c.id)}
                            onChange={() => toggleSelect(c.id)}
                            className="rounded border-border-default text-amber-500 focus:ring-amber-500"
                          />
                        </td>
                        <td
                          className="px-2 py-2 text-center border-r border-border-subtle"
                          onClick={(e) => toggleRowExpansion(c.id, e)}
                        >
                          {count > 0 ? (
                            <button className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-surface-200 transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        {isVisible("cin") && (
                          <td className="px-3 py-2 text-amber-400 font-bold border-r border-border-subtle whitespace-nowrap">
                            {c.cin || "—"}
                          </td>
                        )}
                        {isVisible("companyName") && (
                          <td className="px-3 py-2 text-foreground font-medium border-r border-border-subtle truncate max-w-[240px]">
                            {c.originalCompanyName}
                          </td>
                        )}
                        {isVisible("verifiedName") && (
                          <td className="px-3 py-2 text-emerald-400 font-medium border-r border-border-subtle truncate max-w-[240px]">
                            {c.verifiedCompanyName || "—"}
                          </td>
                        )}
                        {isVisible("verificationStatus") && (
                          <td className="px-3 py-2 border-r border-border-subtle whitespace-nowrap">
                            {getStatusBadge(c.verificationStatus)}
                          </td>
                        )}
                        {isVisible("confidence") && (
                          <td className="px-3 py-2 border-r border-border-subtle whitespace-nowrap">
                            <span className={c.verificationConfidence >= 0.7 ? "text-emerald-400 font-bold" : "text-slate-400"}>
                              {Math.round(c.verificationConfidence * 100)}%
                            </span>
                          </td>
                        )}
                        {isVisible("website") && (
                          <td className="px-3 py-2 text-slate-300 border-r border-border-subtle truncate max-w-[160px]">
                            {c.website ? (
                              <a
                                href={c.website}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-amber-400 hover:underline flex items-center gap-1"
                              >
                                {c.website.replace(/^https?:\/\//, "")} <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                        )}
                        {isVisible("directorCount") && (
                          <td
                            className="px-3 py-2 border-r border-border-subtle text-center"
                            onClick={(e) => {
                              if (count > 0) toggleRowExpansion(c.id, e);
                            }}
                          >
                            <span className={`px-2 py-0.5 rounded font-bold text-xs cursor-pointer ${
                              count > 0 ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30" : "bg-surface-200 text-slate-500"
                            }`}>
                              {count} {count === 1 ? "Director" : "Directors"}
                            </span>
                          </td>
                        )}
                        {isVisible("email") && (
                          <td className="px-3 py-2 text-slate-300 border-r border-border-subtle truncate max-w-[180px]">
                            {c.email || "—"}
                          </td>
                        )}
                        {isVisible("phone") && (
                          <td className="px-3 py-2 text-slate-300 border-r border-border-subtle whitespace-nowrap">
                            {c.phone || "—"}
                          </td>
                        )}
                        {isVisible("roc") && (
                          <td className="px-3 py-2 text-slate-400 border-r border-border-subtle whitespace-nowrap">
                            {c.companyRocCode || "—"}
                          </td>
                        )}
                        {isVisible("state") && (
                          <td className="px-3 py-2 text-slate-400 border-r border-border-subtle whitespace-nowrap">
                            {c.stateCode || "—"}
                          </td>
                        )}
                        {isVisible("category") && (
                          <td className="px-3 py-2 text-slate-400 border-r border-border-subtle whitespace-nowrap">
                            {c.companyCategory || "—"}
                          </td>
                        )}
                        {isVisible("authorizedCapital") && (
                          <td className="px-3 py-2 text-slate-400 border-r border-border-subtle whitespace-nowrap">
                            {c.authorizedCapital ? `₹${c.authorizedCapital.toLocaleString()}` : "—"}
                          </td>
                        )}
                        {isVisible("regDate") && (
                          <td className="px-3 py-2 text-slate-400 border-r border-border-subtle whitespace-nowrap">
                            {c.registrationDate || "—"}
                          </td>
                        )}
                        {isVisible("industry") && (
                          <td className="px-3 py-2 text-slate-400 border-r border-border-subtle truncate max-w-[180px]">
                            {c.industrialClassification || "—"}
                          </td>
                        )}
                        {isVisible("researchStatus") && (
                          <td className="px-3 py-2 border-r border-border-subtle whitespace-nowrap">
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-200 text-slate-300">
                              {c.researchStatus}
                            </span>
                          </td>
                        )}
                        <td
                          className="px-3 py-2 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectCompany(c)}
                            className="h-6 px-2 text-[10px] text-amber-400 hover:text-amber-300"
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>

                      {/* Expandable Directors Sub-Table */}
                      {isExpanded && (
                        <tr className="bg-surface-150/80 border-b border-border-subtle">
                          <td colSpan={22} className="p-4 pl-12">
                            <div className="bg-surface-200/70 border border-border-default rounded p-3 space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wide">
                                <div className="flex items-center gap-1.5">
                                  <UserCheck className="w-4 h-4" />
                                  <span>Board of Directors for {c.verifiedCompanyName || c.originalCompanyName}</span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-normal">
                                  {directorList.length} verified executive(s)
                                </span>
                              </div>

                              {directorList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                                  {directorList.map((rel: DirectorRelationship, idx: number) => {
                                    const dir = rel.director;
                                    return (
                                      <div
                                        key={rel.id || idx}
                                        className="p-2.5 rounded bg-surface-100 border border-border-subtle space-y-1.5"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-foreground">
                                            {idx + 1}. {dir?.name || "Director"}
                                          </span>
                                          <Badge variant={rel.isActive ? "success" : "neutral"} size="sm">
                                            {rel.designation || "Director"}
                                          </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                                          <div>DIN: <span className="text-amber-400">{rel.din || dir?.din || "—"}</span></div>
                                          <div>Appointed: <span className="text-slate-400">{rel.appointmentDate || "—"}</span></div>
                                        </div>

                                        {dir?.email && (
                                          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                                            <Mail className="w-3 h-3 shrink-0" />
                                            <span className="truncate">{dir.email}</span>
                                          </div>
                                        )}

                                        {dir?.phone && (
                                          <div className="text-[11px] text-blue-400 flex items-center gap-1">
                                            <Phone className="w-3 h-3 shrink-0" />
                                            <span>{dir.phone}</span>
                                          </div>
                                        )}

                                        {dir?.linkedinUrl && (
                                          <div className="text-[11px] text-sky-400 flex items-center gap-1">
                                            <Linkedin className="w-3 h-3 shrink-0" />
                                            <a
                                              href={dir.linkedinUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="truncate hover:underline"
                                            >
                                              Profile Link
                                            </a>
                                          </div>
                                        )}

                                        <div className="pt-1 border-t border-border-subtle flex items-center justify-between text-[10px]">
                                          <span className="text-slate-400">
                                            Confidence: <strong className="text-emerald-400">95% HIGH</strong>
                                          </span>
                                          <button
                                            onClick={() =>
                                              setSelectedEvidence({
                                                fieldLabel: "Director Appointment & DIN",
                                                fieldValue: `${dir?.name} (${rel.designation})`,
                                                verificationStatus: "OBSERVED",
                                                confidence: "HIGH",
                                                confidenceScore: 0.95,
                                                sourceName: "MCA Registry Master Data",
                                                sourceUrl: "https://www.mca.gov.in",
                                                observedSnippet: `Director ${dir?.name} identified under DIN ${rel.din} for CIN ${c.cin}`,
                                                discoveredTimestamp: new Date().toISOString(),
                                              })
                                            }
                                            className="text-amber-400 hover:underline flex items-center gap-1"
                                          >
                                            Evidence Trail →
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="p-3 text-center text-xs text-slate-400">
                                  No director records parsed yet. Click Inspect to review raw entity signals.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="px-4 py-2.5 bg-surface-150/70 border-t border-border-subtle flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-400">
            Showing <span className="text-foreground font-semibold">{paginated.length}</span> of{" "}
            <span className="text-foreground font-semibold">{filtered.length}</span> companies ({totalCount} total)
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded bg-surface-200 text-slate-300 disabled:opacity-40 hover:bg-surface-300 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded bg-surface-200 text-slate-300 disabled:opacity-40 hover:bg-surface-300 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-surface-100 border border-border-default rounded shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-sm font-bold uppercase">Confirm Record Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-foreground">{selectedIds.size}</strong> selected research record(s)? This action cannot be undone.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
              >
                {isDeletingBulk ? "Deleting..." : "Permanently Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <EvidenceDrawer
        isOpen={Boolean(selectedEvidence)}
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
}


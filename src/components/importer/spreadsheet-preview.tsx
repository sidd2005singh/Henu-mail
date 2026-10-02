"use client";

import * as React from "react";
import { CleanedContactRow, RowValidationStatus } from "@/lib/importer/cleaner-validator";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, AlertTriangle, ShieldAlert, CheckCircle2, Copy } from "lucide-react";

interface SpreadsheetPreviewProps {
  rows: CleanedContactRow[];
  headers: string[];
  fieldMapping: Record<string, string>;
  selectedRows: Set<number>;
  onToggleSelectRow: (rowNumber: number) => void;
  onToggleSelectAll: () => void;
}

export function SpreadsheetPreview({
  rows,
  headers,
  fieldMapping,
  selectedRows,
  onToggleSelectRow,
  onToggleSelectAll,
}: SpreadsheetPreviewProps) {
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<RowValidationStatus | "all">("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  const filteredRows = React.useMemo(() => {
    return rows.filter((r) => {
      const matchesStatus = filterStatus === "all" || r.status === filterStatus;
      const matchesSearch =
        search.length === 0 ||
        Object.values(r.originalRow).some((v) =>
          String(v || "").toLowerCase().includes(search.toLowerCase())
        ) ||
        r.data.email.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [rows, filterStatus, search]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const getStatusBadge = (status: RowValidationStatus, errors: string[]) => {
    switch (status) {
      case "valid":
        return (
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>VALID</span>
          </Badge>
        );
      case "duplicate":
        return (
          <Badge variant="warning" size="sm" className="gap-1" title={errors.join("; ")}>
            <Copy className="w-3 h-3" />
            <span>DUPLICATE</span>
          </Badge>
        );
      case "suppressed":
        return (
          <Badge variant="danger" size="sm" className="gap-1" title={errors.join("; ")}>
            <ShieldAlert className="w-3 h-3" />
            <span>SUPPRESSED</span>
          </Badge>
        );
      case "invalid":
        return (
          <Badge variant="danger" size="sm" className="gap-1" title={errors.join("; ")}>
            <AlertTriangle className="w-3 h-3" />
            <span>INVALID</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-50 p-2.5 rounded border border-border-subtle">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search within spreadsheet data..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-surface-100 border border-border-default rounded pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-slate-500 font-sans focus:outline-none focus:border-henu-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { setFilterStatus("all"); setPage(1); }}
            className={`px-2 py-1 rounded text-[11px] transition-colors ${
              filterStatus === "all" ? "bg-surface-300 text-foreground font-semibold" : "text-slate-400 hover:text-foreground"
            }`}
          >
            All ({rows.length})
          </button>
          <button
            onClick={() => { setFilterStatus("valid"); setPage(1); }}
            className={`px-2 py-1 rounded text-[11px] text-emerald-400 transition-colors ${
              filterStatus === "valid" ? "bg-emerald-500/20 font-semibold" : "hover:bg-emerald-500/10"
            }`}
          >
            Valid ({rows.filter((r) => r.status === "valid").length})
          </button>
          <button
            onClick={() => { setFilterStatus("duplicate"); setPage(1); }}
            className={`px-2 py-1 rounded text-[11px] text-amber-400 transition-colors ${
              filterStatus === "duplicate" ? "bg-amber-500/20 font-semibold" : "hover:bg-amber-500/10"
            }`}
          >
            Duplicates ({rows.filter((r) => r.status === "duplicate").length})
          </button>
          <button
            onClick={() => { setFilterStatus("suppressed"); setPage(1); }}
            className={`px-2 py-1 rounded text-[11px] text-rose-400 transition-colors ${
              filterStatus === "suppressed" ? "bg-rose-500/20 font-semibold" : "hover:bg-rose-500/10"
            }`}
          >
            Suppressed ({rows.filter((r) => r.status === "suppressed").length})
          </button>
          <button
            onClick={() => { setFilterStatus("invalid"); setPage(1); }}
            className={`px-2 py-1 rounded text-[11px] text-rose-500 transition-colors ${
              filterStatus === "invalid" ? "bg-rose-500/20 font-semibold" : "hover:bg-rose-500/10"
            }`}
          >
            Invalid ({rows.filter((r) => r.status === "invalid").length})
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid Container */}
      <div className="border border-border-default rounded bg-surface-100 overflow-hidden shadow-inner">
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-surface-50 border-b border-border-default">
              <tr className="text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="p-2.5 w-10 text-center border-r border-border-subtle bg-surface-50">
                  <input
                    type="checkbox"
                    checked={selectedRows.size > 0 && selectedRows.size === filteredRows.length}
                    onChange={onToggleSelectAll}
                    className="rounded bg-surface-200 border-border-default text-henu-500 cursor-pointer"
                  />
                </th>
                <th className="p-2.5 w-14 text-center border-r border-border-subtle">#</th>
                <th className="p-2.5 w-32 border-r border-border-subtle">Status</th>
                {headers.map((h) => (
                  <th key={h} className="p-2.5 border-r border-border-subtle truncate max-w-[180px]">
                    <div className="text-foreground font-semibold truncate">{h}</div>
                    <div className="text-[9px] text-henu-400 font-normal">
                      &rarr; {fieldMapping[h] || "skipped"}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs font-mono">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 3} className="p-8 text-center text-slate-500">
                    No records match the active search or validation filter.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={`hover:bg-surface-200/60 transition-colors ${
                      row.status === "invalid"
                        ? "bg-rose-500/5"
                        : row.status === "duplicate"
                        ? "bg-amber-500/5"
                        : row.status === "suppressed"
                        ? "bg-rose-900/10"
                        : ""
                    }`}
                  >
                    <td className="p-2.5 text-center border-r border-border-subtle">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.rowNumber)}
                        onChange={() => onToggleSelectRow(row.rowNumber)}
                        className="rounded bg-surface-200 border-border-default text-henu-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-2.5 text-center text-slate-500 border-r border-border-subtle font-mono">
                      {row.rowNumber}
                    </td>
                    <td className="p-2.5 border-r border-border-subtle whitespace-nowrap">
                      {getStatusBadge(row.status, row.errors)}
                    </td>
                    {headers.map((h) => {
                      const val = row.originalRow[h];
                      const isEmailCol = fieldMapping[h] === "email";
                      return (
                        <td
                          key={h}
                          className={`p-2.5 border-r border-border-subtle truncate max-w-[180px] ${
                            isEmailCol && row.status === "invalid"
                              ? "text-rose-400 font-bold bg-rose-500/10"
                              : "text-slate-200"
                          }`}
                          title={String(val || "")}
                        >
                          {val !== undefined && val !== null ? String(val) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-2.5 bg-surface-50 border-t border-border-subtle flex items-center justify-between text-slate-400 text-xs">
          <div>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length} rows ({selectedRows.size} selected)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-surface-200 text-slate-300 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-foreground font-semibold">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-surface-200 text-slate-300 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

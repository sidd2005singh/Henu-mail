"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, History, Download, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ImportSession {
  id: string;
  fileName: string;
  fileFormat: string;
  fileSizeBytes: number;
  totalRows: number;
  validRows: number;
  duplicateRows: number;
  missingCinRows: number;
  status: "imported" | "mapped" | "uploaded";
  createdAt: string;
}

const SAMPLE_IMPORTS: ImportSession[] = [
  {
    id: "import-1727800000000",
    fileName: "mca_delhi_active_companies_q3.xlsx",
    fileFormat: "xlsx",
    fileSizeBytes: 48920,
    totalRows: 50,
    validRows: 48,
    duplicateRows: 2,
    missingCinRows: 0,
    status: "imported",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "import-1727900000000",
    fileName: "roc_mumbai_pharma_dataset.csv",
    fileFormat: "csv",
    fileSizeBytes: 24100,
    totalRows: 25,
    validRows: 25,
    duplicateRows: 0,
    missingCinRows: 1,
    status: "imported",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export default function ScrapperImportsHistoryPage() {
  return (
    <AppShell title="HENU Scrapper — Batch Ingestion History">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-50 p-5 rounded border border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold font-mono text-foreground uppercase">
                Historical Dataset Ingestion Sessions
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Audit log of past MCA spreadsheets, row counts, duplicate resolutions, and linked research jobs.
            </p>
          </div>
          <Link href="/scrapper/companies">
            <Button variant="default" size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold font-mono text-xs">
              + Ingest New Spreadsheet
            </Button>
          </Link>
        </div>

        <div className="bg-surface-50 border border-border-subtle rounded overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface-200/50 text-slate-300 border-b border-border-subtle">
              <tr>
                <th className="px-4 py-2.5">File Name</th>
                <th className="px-4 py-2.5">Format</th>
                <th className="px-4 py-2.5 text-center">Total Rows</th>
                <th className="px-4 py-2.5 text-center">Ready / Valid</th>
                <th className="px-4 py-2.5 text-center">Duplicates</th>
                <th className="px-4 py-2.5 text-right">Uploaded Date</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {SAMPLE_IMPORTS.map((imp) => (
                <tr key={imp.id} className="hover:bg-surface-150/40">
                  <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{imp.fileName}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 uppercase text-[10px]">{imp.fileFormat}</td>
                  <td className="px-4 py-3 text-center text-foreground font-bold">{imp.totalRows}</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-semibold">{imp.validRows}</td>
                  <td className="px-4 py-3 text-center text-slate-400">{imp.duplicateRows}</td>
                  <td className="px-4 py-3 text-right text-slate-400">
                    {new Date(imp.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href="/scrapper/companies">
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-amber-400 hover:text-amber-300 font-mono">
                        Inspect Records →
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

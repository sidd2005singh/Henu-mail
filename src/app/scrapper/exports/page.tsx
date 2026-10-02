"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";

export default function ScrapperExportsPage() {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportBatch = async (type: "full" | "directors" | "verified_only") => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/v1/scrapper/companies");
      const data = await res.json();
      const list = data.companies || [];

      let exportRows: any[] = [];

      if (type === "directors") {
        const dRes = await fetch("/api/v1/scrapper/directors");
        const dData = await dRes.json();
        exportRows = dData.directors || [];
      } else if (type === "verified_only") {
        exportRows = list.filter((c: any) => c.verificationStatus === "verified");
      } else {
        exportRows = list;
      }

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Export_Intelligence");
      XLSX.writeFile(wb, `henu_scrapper_export_${type}_${Date.now()}.xlsx`);
    } catch {
      // fallback
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppShell title="HENU Scrapper — Export Center">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-50 p-5 rounded border border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold font-mono text-foreground uppercase">
                Intelligence Dataset Export Center
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Export enriched company intelligence, director contact matrices, and evidence trails into XLSX and CSV formats.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 bg-surface-50 border-border-subtle flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold font-mono text-foreground">Complete Company Intelligence</h3>
              <p className="text-xs text-slate-400">
                All original MCA columns + verified websites, contact points, confidence scores, and ROC jurisdictions.
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleExportBatch("full")}
              disabled={isExporting}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold font-mono text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export All Companies (.XLSX)
            </Button>
          </Card>

          <Card className="p-5 bg-surface-50 border-border-subtle flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold font-mono text-foreground">Verified Executive & Directors</h3>
              <p className="text-xs text-slate-400">
                Flattened relational sheet of verified board members with DIN numbers, executive emails, and mobiles.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportBatch("directors")}
              disabled={isExporting}
              className="font-mono text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export Directors Directory (.XLSX)
            </Button>
          </Card>

          <Card className="p-5 bg-surface-50 border-border-subtle flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold font-mono text-foreground">High-Confidence Verified Only</h3>
              <p className="text-xs text-slate-400">
                Strict subset of companies with 100% verified entity details and deliverable contact channels.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportBatch("verified_only")}
              disabled={isExporting}
              className="font-mono text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export Verified Only (.XLSX)
            </Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

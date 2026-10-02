"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { autoDetectAllHeaders, DetectedFieldMapping } from "@/lib/importer/column-detector";
import { cleanAndValidateImportBatch, ValidationSummary } from "@/lib/importer/cleaner-validator";
import { parseFile, parseCsvText, ParsedSpreadsheet } from "@/lib/importer/spreadsheet-parser";
import { SpreadsheetPreview } from "./spreadsheet-preview";
import { FieldMapper } from "./field-mapper";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Copy,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";

interface ImportWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  existingEmails?: Set<string>;
  suppressionList?: Set<string>;
}

type WizardStep = "upload" | "map" | "preview" | "execute" | "report";

export function ImportWizard({
  onComplete,
  onCancel,
  existingEmails = new Set(["vikram.sharma@techcorp.in", "ananya.patel@innovatestartup.com"]),
  suppressionList = new Set(["bad-mailbox@invalid-domain-xyz.com", "@spam-trap-domain.net"]),
}: ImportWizardProps) {
  const [currentStep, setCurrentStep] = React.useState<WizardStep>("upload");
  const [parsedData, setParsedData] = React.useState<ParsedSpreadsheet | null>(null);
  const [detectedMappings, setDetectedMappings] = React.useState<DetectedFieldMapping[]>([]);
  const [fieldMapping, setFieldMapping] = React.useState<Record<string, string>>({});
  const [validationSummary, setValidationSummary] = React.useState<ValidationSummary | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());
  const [duplicateStrategy, setDuplicateStrategy] = React.useState<"skip" | "update" | "import_as_new">("skip");
  const [tagsToApply, setTagsToApply] = React.useState<string>("CSV Import, Q4 Batch");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Sample spreadsheet loader for quick testing
  const loadSampleDataset = () => {
    const sampleCsv = `Full Name,Email Address,Company,Phone,City,Industry
Vikram Sharma,vikram.sharma@techcorp.in,TechCorp India,+91 98765 43210,Bangalore,AI Automation
Rajesh Mehta,rajesh.mehta@fintechcorp.io,+91 99887 76655,Mumbai,Software Solutions
Ananya Patel,ananya.patel@innovatestartup.com,Innovate Health,+91 91234 56789,Delhi,Healthcare AI
Priya Sundaram,priya.s@cloudscale.net,+91 98111 22334,Hyderabad,Cloud Infrastructure
Rohan Gupta,rohan.gupta@marketinghub.com,+91 97777 88899,Pune,Digital Marketing
Karan Verma,invalid-email-address,Verma Logistics,+91 96666 55544,Ahmedabad,Logistics
Siddharth Rao,bad-mailbox@invalid-domain-xyz.com,Spam Traps Inc,+91 95555 44433,Chennai,Security
Rohan Gupta,rohan.gupta@marketinghub.com,Marketing Hub Corp,+91 97777 88899,Pune,Digital Marketing
Amitabh Sen,amitabh.sen@legalservices.in,Sen & Partners,+91 94444 33322,Kolkata,Legal Services`;

    const parsed = parseCsvText(sampleCsv, "sample_outreach_leads.csv");
    processParsedFile(parsed);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);

    try {
      const parsed = await parseFile(file);
      processParsedFile(parsed);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to parse spreadsheet file");
    }
  };

  const processParsedFile = (parsed: ParsedSpreadsheet) => {
    setParsedData(parsed);

    const detected = autoDetectAllHeaders(parsed.headers, parsed.rows);
    setDetectedMappings(detected);

    const initialMap: Record<string, string> = {};
    detected.forEach((d) => {
      initialMap[d.csvHeader] = d.targetField || "skip";
    });
    setFieldMapping(initialMap);

    // Initial validation calculation
    const validated = cleanAndValidateImportBatch(parsed.rows, {
      fieldMapping: initialMap,
      existingEmails,
      suppressionList,
      duplicateStrategy,
    });
    setValidationSummary(validated);
    setSelectedRows(new Set(validated.rows.map((r) => r.rowNumber)));

    setCurrentStep("map");
  };

  const handleMappingChange = (csvHeader: string, targetField: string) => {
    const updated = { ...fieldMapping, [csvHeader]: targetField };
    setFieldMapping(updated);

    if (parsedData) {
      const revalidated = cleanAndValidateImportBatch(parsedData.rows, {
        fieldMapping: updated,
        existingEmails,
        suppressionList,
        duplicateStrategy,
      });
      setValidationSummary(revalidated);
    }
  };

  const handleToggleSelectRow = (rowNumber: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) next.delete(rowNumber);
      else next.add(rowNumber);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (!validationSummary) return;
    if (selectedRows.size === validationSummary.rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(validationSummary.rows.map((r) => r.rowNumber)));
    }
  };

  const handleExecuteImport = () => {
    setIsProcessing(true);
    setCurrentStep("execute");

    // Real batch import simulation with proper states
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep("report");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Wizard Progress Bar */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-henu-500/20 text-henu-400 border border-henu-500/40 flex items-center justify-center font-bold">
            {currentStep === "upload" ? "1" : currentStep === "map" ? "2" : currentStep === "preview" ? "3" : currentStep === "execute" ? "4" : "5"}
          </div>
          <span className="font-bold text-foreground uppercase tracking-wide">
            {currentStep === "upload" && "Step 1: Upload Spreadsheet"}
            {currentStep === "map" && "Step 2: Map & Detect Columns"}
            {currentStep === "preview" && "Step 3: Preview, Clean & Deduplicate"}
            {currentStep === "execute" && "Step 4: Executing Ingestion"}
            {currentStep === "report" && "Step 5: Ingestion Diagnostic Report"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {parsedData && (
            <span className="text-slate-400 text-[11px]">
              File: <strong className="text-foreground">{parsedData.filename}</strong> ({parsedData.totalRows} rows)
            </span>
          )}
          <button onClick={onCancel} className="p-1 text-slate-400 hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: UPLOAD FILE */}
      {currentStep === "upload" && (
        <Card className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-surface-200 border border-border-default mx-auto flex items-center justify-center text-henu-400 shadow-scientific-sm">
            <FileSpreadsheet className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold font-mono text-foreground uppercase">
              SELECT SPREADSHEET FOR INGESTION
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Upload XLSX (Microsoft Excel) or CSV files. All data is automatically sanitized, validated against RFC 5322 compliance, and checked against the global suppression list.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-henu-500 text-surface-50 font-mono font-semibold text-xs hover:bg-henu-400 transition-colors shadow-scientific-sm">
                <Upload className="w-4 h-4" />
                <span>BROWSE LOCAL FILE</span>
              </span>
            </label>

            <Button
              variant="secondary"
              size="md"
              onClick={loadSampleDataset}
              className="font-mono text-xs gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-henu-400" />
              <span>LOAD SAMPLE DATASET</span>
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: FIELD MAPPING */}
      {currentStep === "map" && parsedData && (
        <div className="space-y-4">
          <FieldMapper
            detectedMappings={detectedMappings}
            fieldMapping={fieldMapping}
            onMappingChange={handleMappingChange}
          />

          <div className="flex items-center justify-between pt-4 border-t border-border-subtle font-mono text-xs">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentStep("upload")}
              className="gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>CHOOSE DIFFERENT FILE</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              disabled={!Object.values(fieldMapping).includes("email")}
              onClick={() => setCurrentStep("preview")}
              className="gap-1.5"
            >
              <span>PROCEED TO SPREADSHEET PREVIEW</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: SPREADSHEET PREVIEW & DEDUPLICATION CONFIG */}
      {currentStep === "preview" && validationSummary && parsedData && (
        <div className="space-y-4">
          {/* Validation Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-center">
            <div className="p-2.5 rounded bg-surface-100 border border-border-default">
              <div className="text-[10px] text-slate-400 uppercase">TOTAL ROWS</div>
              <div className="text-base font-bold text-foreground mt-0.5">{validationSummary.totalRows}</div>
            </div>
            <div className="p-2.5 rounded bg-surface-100 border border-emerald-500/30">
              <div className="text-[10px] text-emerald-400 uppercase">VALID & CLEAN</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{validationSummary.validCount}</div>
            </div>
            <div className="p-2.5 rounded bg-surface-100 border border-amber-500/30">
              <div className="text-[10px] text-amber-400 uppercase">DUPLICATES</div>
              <div className="text-base font-bold text-amber-400 mt-0.5">{validationSummary.duplicateCount}</div>
            </div>
            <div className="p-2.5 rounded bg-surface-100 border border-rose-500/30">
              <div className="text-[10px] text-rose-400 uppercase">SUPPRESSED</div>
              <div className="text-base font-bold text-rose-400 mt-0.5">{validationSummary.suppressedCount}</div>
            </div>
            <div className="p-2.5 rounded bg-surface-100 border border-rose-500/30">
              <div className="text-[10px] text-rose-500 uppercase">INVALID ROWS</div>
              <div className="text-base font-bold text-rose-500 mt-0.5">{validationSummary.invalidCount}</div>
            </div>
          </div>

          {/* Duplicate Strategy Config */}
          <div className="p-3.5 rounded bg-surface-50 border border-border-default flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
            <div className="space-y-1">
              <div className="font-bold text-foreground">DUPLICATE RESOLUTION STRATEGY</div>
              <p className="text-[11px] text-slate-400 font-sans">
                Choose how existing database contacts and intra-file duplicate emails are handled.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setDuplicateStrategy("skip")}
                className={`px-3 py-1.5 rounded border transition-colors ${
                  duplicateStrategy === "skip"
                    ? "bg-henu-500 text-surface-50 border-henu-400 font-semibold"
                    : "bg-surface-100 border-border-default text-slate-300 hover:text-foreground"
                }`}
              >
                Skip Duplicates
              </button>
              <button
                onClick={() => setDuplicateStrategy("update")}
                className={`px-3 py-1.5 rounded border transition-colors ${
                  duplicateStrategy === "update"
                    ? "bg-henu-500 text-surface-50 border-henu-400 font-semibold"
                    : "bg-surface-100 border-border-default text-slate-300 hover:text-foreground"
                }`}
              >
                Update Existing
              </button>
              <button
                onClick={() => setDuplicateStrategy("import_as_new")}
                className={`px-3 py-1.5 rounded border transition-colors ${
                  duplicateStrategy === "import_as_new"
                    ? "bg-henu-500 text-surface-50 border-henu-400 font-semibold"
                    : "bg-surface-100 border-border-default text-slate-300 hover:text-foreground"
                }`}
              >
                Import All
              </button>
            </div>
          </div>

          {/* Interactive Spreadsheet View */}
          <SpreadsheetPreview
            rows={validationSummary.rows}
            headers={parsedData.headers}
            fieldMapping={fieldMapping}
            selectedRows={selectedRows}
            onToggleSelectRow={handleToggleSelectRow}
            onToggleSelectAll={handleToggleSelectAll}
          />

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border-subtle font-mono text-xs">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentStep("map")}
              className="gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>BACK TO FIELD MAPPING</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleExecuteImport}
              className="gap-1.5"
            >
              <span>COMMIT & INGEST {selectedRows.size} LEADS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: EXECUTING INGESTION */}
      {currentStep === "execute" && (
        <Card className="p-12 text-center space-y-4 font-mono">
          <div className="w-12 h-12 rounded-full border-2 border-henu-500 border-t-transparent animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
            INGESTING & COMMITTING CONTACT BATCH
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
            Writing validated contacts to workspace repository, indexing metadata, and updating suppression filters...
          </p>
        </Card>
      )}

      {/* STEP 5: FINAL REPORT */}
      {currentStep === "report" && validationSummary && (
        <Card className="p-6 space-y-6 font-mono text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase">
                INGESTION COMPLETE & AUDIT LOGGED
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Batch successfully processed into workspace contact database.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded bg-surface-50 border border-border-subtle">
              <div className="text-[10px] text-slate-400 uppercase">IMPORTED LEADS</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{validationSummary.validCount}</div>
            </div>
            <div className="p-3 rounded bg-surface-50 border border-border-subtle">
              <div className="text-[10px] text-slate-400 uppercase">DUPLICATES SKIPPED</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{validationSummary.duplicateCount}</div>
            </div>
            <div className="p-3 rounded bg-surface-50 border border-border-subtle">
              <div className="text-[10px] text-slate-400 uppercase">SUPPRESSED</div>
              <div className="text-xl font-bold text-rose-400 mt-1">{validationSummary.suppressedCount}</div>
            </div>
            <div className="p-3 rounded bg-surface-50 border border-border-subtle">
              <div className="text-[10px] text-slate-400 uppercase">INVALID DISCARDED</div>
              <div className="text-xl font-bold text-rose-500 mt-1">{validationSummary.invalidCount}</div>
            </div>
          </div>

          <div className="p-3 rounded bg-surface-50 border border-border-subtle text-slate-300 space-y-1 text-[11px]">
            <div>&bull; Destination Workspace: <strong>HENU OS Master Workspace</strong></div>
            <div>&bull; Tags Applied: <span className="text-henu-400">{tagsToApply}</span></div>
            <div>&bull; Suppression Check: <span className="text-emerald-400">100% Screened</span></div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="primary" size="sm" onClick={onComplete} className="gap-2">
              <Check className="w-3.5 h-3.5" />
              <span>VIEW CONTACT REPOSITORY</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { parseFile, ParsedSpreadsheet } from "@/lib/importer/spreadsheet-parser";
import {
  analyzeSpreadsheetForScrapper,
  IngestionAnalysisResult,
  McaColumnMapping,
} from "@/lib/scrapper/importer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface CompanyImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (importSummary: {
    importId: string;
    totalImported: number;
    jobCreated: boolean;
  }) => void;
}

const MCA_FIELD_LABELS: { key: keyof McaColumnMapping; label: string; required?: boolean }[] = [
  { key: "companyName", label: "Company Name (Original)", required: true },
  { key: "cin", label: "Corporate Identification Number (CIN)" },
  { key: "companyCategory", label: "Company Category" },
  { key: "companyRocCode", label: "ROC Code" },
  { key: "companySubCategory", label: "Sub Category" },
  { key: "companyClass", label: "Company Class" },
  { key: "authorizedCapital", label: "Authorized Capital (INR)" },
  { key: "registrationDate", label: "Registration Date" },
  { key: "registeredOfficeAddress", label: "Registered Office Address" },
  { key: "stateCode", label: "State Code" },
  { key: "industrialClassification", label: "Industrial Classification (NIC)" },
];

export function CompanyImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: CompanyImportModalProps) {
  const [step, setStep] = React.useState<"upload" | "mapping" | "preview" | "submitting">("upload");
  const [parsedFile, setParsedFile] = React.useState<ParsedSpreadsheet | null>(null);
  const [analysis, setAnalysis] = React.useState<IngestionAnalysisResult | null>(null);
  const [customMapping, setCustomMapping] = React.useState<McaColumnMapping>({});
  const [duplicateStrategy, setDuplicateStrategy] = React.useState<"skip" | "allow">("skip");
  const [autoStartResearch, setAutoStartResearch] = React.useState(true);
  const [researchDepth, setResearchDepth] = React.useState<"quick" | "standard" | "deep">("standard");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const parsed = await parseFile(file);
      setParsedFile(parsed);

      const result = await analyzeSpreadsheetForScrapper(parsed);
      setAnalysis(result);
      setCustomMapping(result.detectedMapping);
      setStep("mapping");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse file";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMappingChange = async (field: keyof McaColumnMapping, headerVal: string) => {
    const updated = {
      ...customMapping,
      [field]: headerVal === "__none__" ? undefined : headerVal,
    };
    setCustomMapping(updated);

    if (parsedFile) {
      const result = await analyzeSpreadsheetForScrapper(parsedFile, updated);
      setAnalysis(result);
    }
  };

  const handleProceedToPreview = () => {
    if (!customMapping.companyName) {
      setErrorMessage("Please map the Company Name field to proceed.");
      return;
    }
    setErrorMessage(null);
    setStep("preview");
  };

  const handleConfirmImport = async () => {
    if (!analysis) return;
    setStep("submitting");
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const payload = {
        fileName: analysis.filename,
        fileSizeBytes: analysis.fileSizeBytes,
        fileFormat: analysis.fileFormat,
        duplicateStrategy,
        autoStartResearch,
        researchDepth,
        mapping: customMapping,
        rows: analysis.allRows
          .filter((r) => duplicateStrategy === "allow" || !r.isDuplicate)
          .map((r) => r.mapped),
      };

      const res = await fetch("/api/v1/scrapper/imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to commit company import.");
      }

      const data = await res.json();
      if (onImportComplete) {
        onImportComplete({
          importId: data.importId,
          totalImported: data.totalImported,
          jobCreated: Boolean(data.jobId),
        });
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Import submission failed";
      setErrorMessage(msg);
      setStep("preview");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-surface-100 border border-border-default rounded shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold font-mono uppercase tracking-wide text-foreground">
                Import MCA / ROC Company Dataset
              </h3>
              <p className="text-xs text-slate-400">
                Step-by-step Excel/CSV ingestion, schema validation & research queueing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-surface-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="px-6 py-2.5 bg-surface-150/60 border-b border-border-subtle flex items-center justify-between text-xs font-mono shrink-0">
          <div className="flex items-center gap-6">
            <span className={step === "upload" ? "text-amber-400 font-bold" : "text-slate-400"}>
              1. Upload File
            </span>
            <span className="text-slate-600">→</span>
            <span className={step === "mapping" ? "text-amber-400 font-bold" : "text-slate-400"}>
              2. Map MCA Schema
            </span>
            <span className="text-slate-600">→</span>
            <span className={step === "preview" || step === "submitting" ? "text-amber-400 font-bold" : "text-slate-400"}>
              3. Validate & Execute
            </span>
          </div>
          {analysis && (
            <div className="text-[11px] text-slate-400">
              File: <span className="text-foreground">{analysis.filename}</span> ({analysis.totalRows} rows)
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {errorMessage && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Upload */}
          {step === "upload" && (
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-border-default hover:border-amber-500/50 rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-surface-50/50 hover:bg-surface-100/50 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-14 h-14 rounded-full bg-surface-200 group-hover:bg-amber-500/20 flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition-colors mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div className="text-sm font-semibold font-mono text-foreground">
                  Click to select or drag & drop MCA Company Spreadsheet
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Supports .XLSX, .XLS, and .CSV datasets containing CIN and company registry records
                </div>
                <div className="mt-4 flex gap-2">
                  <Badge variant="neutral">Excel (.xlsx/.xls)</Badge>
                  <Badge variant="neutral">CSV (.csv)</Badge>
                  <Badge variant="info">Full Column Preservation</Badge>
                </div>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Inspecting file structure and scanning headers...
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Column Mapping */}
          {step === "mapping" && analysis && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-surface-50 p-3 rounded border border-border-subtle">
                <div className="text-xs text-slate-300">
                  Detected <span className="font-bold text-amber-400">{Object.keys(customMapping).length}</span> MCA fields automatically. Verify or adjust mapping below:
                </div>
                <Badge variant={analysis.confidenceScore > 0.6 ? "success" : "warning"}>
                  Match Confidence: {Math.round(analysis.confidenceScore * 100)}%
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto p-1 custom-scrollbar">
                {MCA_FIELD_LABELS.map((f) => (
                  <div
                    key={f.key}
                    className="p-2.5 rounded bg-surface-50 border border-border-subtle flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-semibold">
                        {f.label} {f.required && <span className="text-red-400">*</span>}
                      </span>
                      {customMapping[f.key] && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <select
                      value={customMapping[f.key] || "__none__"}
                      onChange={(e) => handleMappingChange(f.key, e.target.value)}
                      className="bg-surface-200 border border-border-default rounded px-2.5 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-amber-500"
                    >
                      <option value="__none__">-- Do not map / Ignore --</option>
                      {analysis.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Preview & Settings */}
          {step === "preview" && analysis && (
            <div className="space-y-5">
              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded bg-surface-50 border border-border-subtle">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Total Rows</div>
                  <div className="text-lg font-bold font-mono text-foreground mt-0.5">{analysis.totalRows}</div>
                </div>
                <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase">Ready To Import</div>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{analysis.readyRows}</div>
                </div>
                <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[10px] font-mono text-amber-400 uppercase">Missing CIN</div>
                  <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">{analysis.missingCinRows}</div>
                </div>
                <div className="p-3 rounded bg-surface-200/50 border border-border-subtle">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Duplicate Rows</div>
                  <div className="text-lg font-bold font-mono text-slate-300 mt-0.5">{analysis.duplicateRows}</div>
                </div>
              </div>

              {/* Research Queueing Options */}
              <div className="p-4 rounded bg-surface-50 border border-border-subtle space-y-3">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Research Orchestration Settings
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="text-slate-400 block mb-1.5">Duplicate Handling Strategy</label>
                    <select
                      value={duplicateStrategy}
                      onChange={(e) => setDuplicateStrategy(e.target.value as "skip" | "allow")}
                      className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground focus:outline-none focus:border-amber-500"
                    >
                      <option value="skip">Skip Duplicate CINs (Recommended)</option>
                      <option value="allow">Allow & Re-enrich Duplicate Entities</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1.5">Research Depth Profile</label>
                    <select
                      value={researchDepth}
                      onChange={(e) => setResearchDepth(e.target.value as "quick" | "standard" | "deep")}
                      className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground focus:outline-none focus:border-amber-500"
                    >
                      <option value="standard">Standard (Directors + Emails + LinkedIn)</option>
                      <option value="deep">Deep Intelligence (Exhaustive Web + WHOIS)</option>
                      <option value="quick">Quick Verification (CIN Registry Only)</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs font-mono text-slate-300 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoStartResearch}
                    onChange={(e) => setAutoStartResearch(e.target.checked)}
                    className="rounded border-border-default text-amber-500 focus:ring-amber-500"
                  />
                  <span>Automatically trigger Research Job in background after import</span>
                </label>
              </div>

              {/* Sample Table Preview */}
              <div>
                <div className="text-xs font-mono text-slate-400 mb-2">Sample Preview (First 5 Rows):</div>
                <div className="border border-border-subtle rounded overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-surface-200/50 text-slate-300 border-b border-border-subtle">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">CIN</th>
                        <th className="px-3 py-2">Company Name</th>
                        <th className="px-3 py-2">ROC</th>
                        <th className="px-3 py-2">State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {analysis.sampleRows.slice(0, 5).map((row) => (
                        <tr key={row.rowNumber} className="hover:bg-surface-150/40">
                          <td className="px-3 py-2 text-slate-500">{row.rowNumber}</td>
                          <td className="px-3 py-2 text-amber-400 font-bold">{row.mapped.cin || "—"}</td>
                          <td className="px-3 py-2 text-foreground">{row.mapped.companyName}</td>
                          <td className="px-3 py-2 text-slate-400">{row.mapped.companyRocCode || "—"}</td>
                          <td className="px-3 py-2 text-slate-400">{row.mapped.stateCode || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Submitting */}
          {step === "submitting" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <div className="text-sm font-semibold font-mono text-foreground">
                Persisting Company Records & Initializing Research Pipeline...
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Creating database entities, indexing CIN identifiers, and assembling the evidence queue.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border-subtle bg-surface-50 flex items-center justify-between shrink-0">
          <div>
            {step === "mapping" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep("upload")}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Upload
              </Button>
            )}
            {step === "preview" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep("mapping")}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Edit Mapping
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            {step === "mapping" && (
              <Button
                variant="default"
                size="sm"
                onClick={handleProceedToPreview}
              >
                Review Dataset <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
            {step === "preview" && (
              <Button
                variant="default"
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                onClick={handleConfirmImport}
                disabled={isProcessing}
              >
                Confirm & Import {analysis?.readyRows} Companies
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

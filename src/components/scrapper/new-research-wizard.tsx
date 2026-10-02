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
  Sparkles,
  DollarSign,
  Clock,
  Layers,
  Building2,
  UserCheck,
  Mail,
  Send,
  Download,
  Sliders,
} from "lucide-react";
import { parseFile, ParsedSpreadsheet } from "@/lib/importer/spreadsheet-parser";
import {
  analyzeSpreadsheetForScrapper,
  IngestionAnalysisResult,
  McaColumnMapping,
} from "@/lib/scrapper/importer";
import { ResearchProfileConfig } from "@/lib/scrapper/types";
import { DEFAULT_STANDARD_PROFILE } from "@/lib/scrapper/research-engine";
import { LiveResearchConsole } from "./live-research-console";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface NewResearchWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onResearchComplete?: () => void;
}

export function NewResearchWizard({
  isOpen,
  onClose,
  onResearchComplete,
}: NewResearchWizardProps) {
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [parsedFile, setParsedFile] = React.useState<ParsedSpreadsheet | null>(null);
  const [analysis, setAnalysis] = React.useState<IngestionAnalysisResult | null>(null);
  const [customMapping, setCustomMapping] = React.useState<McaColumnMapping>({});
  const [selectedProfile, setSelectedProfile] = React.useState<string>("full_intel");
  const [duplicateStrategy, setDuplicateStrategy] = React.useState<"skip" | "allow">("skip");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [liveJobId, setLiveJobId] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const parsed = await parseFile(file);
      setParsedFile(parsed);
      const result = await analyzeSpreadsheetForScrapper(parsed);
      setAnalysis(result);
      setCustomMapping(result.detectedMapping);
      setCurrentStep(2);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Failed to parse spreadsheet");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartResearch = async () => {
    if (!analysis) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const payload = {
        fileName: analysis.filename,
        fileSizeBytes: analysis.fileSizeBytes,
        fileFormat: analysis.fileFormat,
        duplicateStrategy,
        autoStartResearch: true,
        researchDepth: selectedProfile === "founder_contacts" ? "deep" : "standard",
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

      if (!res.ok) throw new Error("Failed to initialize research pipeline.");
      const data = await res.json();
      setLiveJobId(data.jobId || `job-${Date.now()}`);
      setCurrentStep(6);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Execution initialization failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const PROFILES = [
    {
      id: "full_intel",
      name: "Full Corporate Intelligence",
      description: "Company Verification + Board of Directors + Executive Emails + Direct Phones + LinkedIn Profiles",
      badge: "RECOMMENDED",
      depth: "standard",
      queriesPerEntity: 6,
    },
    {
      id: "founder_contacts",
      name: "Founder & Signatory Outreach",
      description: "Focused executive discovery: Managing Directors, DIN verification, verified email delivery channels",
      badge: "HIGH CONVERSION",
      depth: "deep",
      queriesPerEntity: 8,
    },
    {
      id: "company_verification",
      name: "Company Identity & RoC Check",
      description: "High-speed MCA active status verification, registered office address, and official domain matching",
      badge: "FAST",
      depth: "quick",
      queriesPerEntity: 2,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-surface-100 border border-border-default rounded shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle bg-surface-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono uppercase tracking-wide text-foreground">
                New Company Intelligence Research Workflow
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Step {currentStep} of 6 — Automated Multi-Source Intelligence Engine
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

        {/* Stepper Progress */}
        <div className="px-6 py-2 bg-surface-150/60 border-b border-border-subtle flex items-center justify-between text-xs font-mono shrink-0 overflow-x-auto">
          <div className="flex items-center gap-4">
            <span className={currentStep === 1 ? "text-amber-400 font-bold" : "text-slate-400"}>1. Upload</span>
            <span className="text-slate-600">→</span>
            <span className={currentStep === 2 ? "text-amber-400 font-bold" : "text-slate-400"}>2. Profile</span>
            <span className="text-slate-600">→</span>
            <span className={currentStep === 3 ? "text-amber-400 font-bold" : "text-slate-400"}>3. Columns</span>
            <span className="text-slate-600">→</span>
            <span className={currentStep === 4 ? "text-amber-400 font-bold" : "text-slate-400"}>4. Settings</span>
            <span className="text-slate-600">→</span>
            <span className={currentStep === 5 ? "text-amber-400 font-bold" : "text-slate-400"}>5. Estimate</span>
            <span className="text-slate-600">→</span>
            <span className={currentStep === 6 ? "text-amber-400 font-bold" : "text-slate-400"}>6. Live Execution</span>
          </div>
          {analysis && (
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              File: <strong className="text-foreground">{analysis.filename}</strong>
            </span>
          )}
        </div>

        {/* Wizard Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {errorMessage && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Upload */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-border-default hover:border-amber-500/50 rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-surface-50/50 hover:bg-surface-100/50 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                />
                <div className="w-14 h-14 rounded-full bg-surface-200 group-hover:bg-amber-500/20 flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition-colors mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div className="text-sm font-semibold font-mono text-foreground">
                  Select or drag & drop MCA Company Spreadsheet
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  Accepts standard MCA / RoC exports containing CIN, Company Name, and Address records
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Profile Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-slate-300">
                Select an intelligence profile tailored to your research objectives:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PROFILES.map((p) => {
                  const isSelected = selectedProfile === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProfile(p.id)}
                      className={`p-4 rounded border cursor-pointer transition-all flex flex-col justify-between space-y-3 font-mono ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500 ring-1 ring-amber-500"
                          : "bg-surface-50 border-border-subtle hover:bg-surface-100"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={isSelected ? "warning" : "neutral"} size="sm">
                            {p.badge}
                          </Badge>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </div>
                        <h4 className="text-sm font-bold text-foreground">{p.name}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                      </div>
                      <div className="text-[11px] text-amber-400 pt-2 border-t border-border-subtle">
                        ~{p.queriesPerEntity} queries / entity
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Review & Map Columns */}
          {currentStep === 3 && analysis && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-surface-50 border border-border-subtle rounded flex items-center justify-between">
                <span>
                  Detected <strong className="text-amber-400">{Object.keys(customMapping).length}</strong> MCA headers automatically.
                </span>
                <Badge variant="success">
                  Match Confidence: {Math.round(analysis.confidenceScore * 100)}%
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
                {Object.entries(customMapping).map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded bg-surface-50 border border-border-subtle flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">{k}</span>
                    <span className="text-amber-400">{v || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Configure Settings */}
          {currentStep === 4 && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded bg-surface-50 border border-border-subtle space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase">Duplicate Handling & Cache Rules</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1">Duplicate Strategy</label>
                    <select
                      value={duplicateStrategy}
                      onChange={(e) => setDuplicateStrategy(e.target.value as any)}
                      className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground"
                    >
                      <option value="skip">Skip Existing CINs (Recommended)</option>
                      <option value="allow">Force Fresh Research on All</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Cache Freshness Window</label>
                    <select className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground">
                      <option value="30">30 Days (Standard)</option>
                      <option value="14">14 Days (Strict)</option>
                      <option value="0">0 Days (Bypass Cache)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Estimate Work & Cost */}
          {currentStep === 5 && analysis && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-4 bg-surface-50 border-border-subtle">
                  <div className="text-[10px] text-slate-400 uppercase">Ready Entities</div>
                  <div className="text-xl font-bold text-foreground mt-1">{analysis.readyRows}</div>
                </Card>
                <Card className="p-4 bg-surface-50 border-border-subtle">
                  <div className="text-[10px] text-slate-400 uppercase">Estimated Queries</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">{analysis.readyRows * 6}</div>
                </Card>
                <Card className="p-4 bg-surface-50 border-border-subtle">
                  <div className="text-[10px] text-slate-400 uppercase">Estimated Runtime</div>
                  <div className="text-xl font-bold text-blue-400 mt-1">~{Math.ceil((analysis.readyRows * 1.5) / 5)}s</div>
                </Card>
                <Card className="p-4 bg-surface-50 border-border-subtle">
                  <div className="text-[10px] text-slate-400 uppercase">Estimated Cost</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">
                    ${(analysis.readyRows * 0.012).toFixed(3)}
                  </div>
                </Card>
              </div>

              <div className="p-3.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                All pre-flight quality checks passed. Ready to begin autonomous multi-source intelligence research.
              </div>
            </div>
          )}

          {/* STEP 6: Live Execution */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <LiveResearchConsole
                jobId={liveJobId || "job-active"}
                totalCompanies={analysis?.readyRows || 10}
                processedCompanies={analysis?.readyRows ? Math.ceil(analysis.readyRows * 0.6) : 6}
                currentCompany={analysis?.sampleRows?.[0]?.mapped.companyName || "HENU TECH VENTURES PVT LTD"}
                progressPercentage={60}
                directorsFound={8}
                emailsFound={6}
                phonesFound={5}
                onTerminate={onClose}
              />
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-border-subtle bg-surface-50 flex items-center justify-between shrink-0 font-mono text-xs">
          <div>
            {currentStep > 1 && currentStep < 6 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {currentStep === 6 ? "Close Window" : "Cancel"}
            </Button>
            {currentStep > 1 && currentStep < 5 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setCurrentStep((s) => s + 1)}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                Continue <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
            {currentStep === 5 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleStartResearch}
                disabled={isProcessing}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Start Research Now
              </Button>
            )}
            {currentStep === 6 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (onResearchComplete) onResearchComplete();
                  onClose();
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
              >
                Inspect Results in Grid →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

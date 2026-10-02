"use client";

import * as React from "react";
import { KNOWN_TARGET_FIELDS, DetectedFieldMapping } from "@/lib/importer/column-detector";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, AlertCircle } from "lucide-react";

interface FieldMapperProps {
  detectedMappings: DetectedFieldMapping[];
  fieldMapping: Record<string, string>;
  onMappingChange: (csvHeader: string, targetField: string) => void;
}

export function FieldMapper({
  detectedMappings,
  fieldMapping,
  onMappingChange,
}: FieldMapperProps) {
  const isEmailMapped = Object.values(fieldMapping).includes("email");

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Required Field Status Banner */}
      <div className={`p-3 rounded border flex items-center justify-between ${
        isEmailMapped ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"
      }`}>
        <div className="flex items-center gap-2">
          {isEmailMapped ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>
            {isEmailMapped
              ? "Required identifier mapped: Email Address"
              : "Action required: Map at least one column to 'Email Address' to proceed with import."}
          </span>
        </div>
        <span className="text-[10px] uppercase font-semibold">
          {isEmailMapped ? "MAPPING READY" : "INCOMPLETE"}
        </span>
      </div>

      {/* Field Mapping Grid */}
      <div className="border border-border-default rounded bg-surface-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-50 border-b border-border-subtle text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="p-3 w-1/3">File Column Header</th>
              <th className="p-3 w-1/3">Sample Values</th>
              <th className="p-3 w-1/3">Mapped System Field</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {detectedMappings.map((dm) => {
              const currentTarget = fieldMapping[dm.csvHeader] || "";
              return (
                <tr key={dm.csvHeader} className="hover:bg-surface-200/50 transition-colors">
                  {/* File Header */}
                  <td className="p-3">
                    <div className="font-semibold text-foreground">{dm.csvHeader}</div>
                    {dm.confidence > 0 && (
                      <div className="text-[10px] text-emerald-400 mt-0.5">
                        Auto-detected ({Math.round(dm.confidence * 100)}% match)
                      </div>
                    )}
                  </td>

                  {/* Samples */}
                  <td className="p-3 text-slate-400">
                    <div className="flex flex-wrap gap-1">
                      {dm.sampleValues.length > 0 ? (
                        dm.sampleValues.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-surface-200 text-slate-300 text-[10px] truncate max-w-[150px]"
                            title={s}
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 text-[11px]">No sample data</span>
                      )}
                    </div>
                  </td>

                  {/* Target Mapping Select */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <select
                        value={currentTarget}
                        onChange={(e) => onMappingChange(dm.csvHeader, e.target.value)}
                        className={`w-full bg-surface-50 border rounded px-2.5 py-1.5 text-xs font-sans transition-colors focus:outline-none focus:border-henu-500 ${
                          currentTarget === "email"
                            ? "border-emerald-500 text-emerald-300 font-semibold"
                            : currentTarget && currentTarget !== "skip"
                            ? "border-henu-500 text-foreground"
                            : "border-border-default text-slate-400"
                        }`}
                      >
                        <option value="skip">-- Skip this column --</option>
                        <optgroup label="Standard Contact Fields">
                          {KNOWN_TARGET_FIELDS.map((kf) => (
                            <option key={kf.key} value={kf.key}>
                              {kf.label} {kf.required ? "(Required)" : ""}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Custom Metadata">
                          <option value={`custom_${dm.csvHeader.toLowerCase().replace(/[^a-z0-9]/g, "_")}`}>
                            Save as custom field "{dm.csvHeader}"
                          </option>
                        </optgroup>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

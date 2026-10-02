"use client";

import * as React from "react";
import {
  Sparkles,
  Sliders,
  ShieldCheck,
  Search,
  DollarSign,
  Clock,
  Database,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  X,
} from "lucide-react";
import { ResearchProfileConfig, ResearchProfileFieldConfig } from "@/lib/scrapper/types";
import { DEFAULT_STANDARD_PROFILE } from "@/lib/scrapper/research-engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ResearchProfileBuilderProps {
  initialProfile?: ResearchProfileConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: ResearchProfileConfig) => void;
}

export function ResearchProfileBuilder({
  initialProfile = DEFAULT_STANDARD_PROFILE,
  isOpen,
  onClose,
  onSaveProfile,
}: ResearchProfileBuilderProps) {
  const [profile, setProfile] = React.useState<ResearchProfileConfig>(initialProfile);
  const [newFieldName, setNewFieldName] = React.useState("");

  if (!isOpen) return null;

  const handleFieldToggle = (fieldKey: string) => {
    setProfile((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: {
          ...prev.fields[fieldKey],
          enabled: !prev.fields[fieldKey].enabled,
        },
      },
    }));
  };

  const handleFieldChange = (
    fieldKey: string,
    updates: Partial<ResearchProfileFieldConfig>
  ) => {
    setProfile((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: {
          ...prev.fields[fieldKey],
          ...updates,
        },
      },
    }));
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return;
    const key = newFieldName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    setProfile((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: {
          fieldKey: key,
          label: newFieldName.trim(),
          enabled: true,
          priority: Object.keys(prev.fields).length + 1,
          required: false,
          searchStrategy: "progressive",
          verificationRequirement: "multi_source",
          maximumAttempts: 3,
          freshnessDays: 30,
          confidenceThreshold: 0.70,
        },
      },
    }));
    setNewFieldName("");
  };

  const handleSave = () => {
    onSaveProfile(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-surface-100 border border-border-default rounded shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle bg-surface-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold font-mono uppercase tracking-wide text-foreground">
                Research Profile & Strategy Builder
              </h3>
              <p className="text-xs text-slate-400">
                Design custom extraction priorities, verification rules, search strategies & cost limits
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

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {/* General Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Profile Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Research Mode</label>
              <select
                value={profile.mode}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    mode: e.target.value as ResearchProfileConfig["mode"],
                  })
                }
                className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground focus:outline-none focus:border-amber-500"
              >
                <option value="full_intelligence">Full Intelligence (All Layers)</option>
                <option value="company_verification">Company Identity Verification Only</option>
                <option value="director_discovery">Director & DIN Discovery Only</option>
                <option value="contact_discovery">Contact Points (Email/Phone) Only</option>
                <option value="custom">Custom Field Rules</option>
              </select>
            </div>
          </div>

          {/* Field Rules Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wide text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Target Extraction Fields & Verification Criteria
              </h4>
            </div>

            <div className="border border-border-subtle rounded overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface-200/50 text-slate-300 border-b border-border-subtle">
                  <tr>
                    <th className="px-3 py-2 w-12 text-center">Enable</th>
                    <th className="px-3 py-2">Field Target</th>
                    <th className="px-3 py-2">Search Strategy</th>
                    <th className="px-3 py-2">Verification Rule</th>
                    <th className="px-3 py-2 text-center">Min Confidence</th>
                    <th className="px-3 py-2 text-center">Max Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {Object.entries(profile.fields).map(([key, f]) => (
                    <tr key={key} className="hover:bg-surface-150/40">
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={f.enabled}
                          onChange={() => handleFieldToggle(key)}
                          className="rounded border-border-default text-amber-500 focus:ring-amber-500"
                        />
                      </td>
                      <td className="px-3 py-2 font-semibold text-foreground">{f.label}</td>
                      <td className="px-3 py-2">
                        <select
                          value={f.searchStrategy}
                          onChange={(e) =>
                            handleFieldChange(key, {
                              searchStrategy: e.target.value as any,
                            })
                          }
                          className="bg-surface-200 border border-border-default rounded px-2 py-1 text-[11px] text-slate-300"
                        >
                          <option value="progressive">Progressive (8-Step)</option>
                          <option value="exhaustive">Exhaustive Deep Crawl</option>
                          <option value="quick">Quick Registry Only</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={f.verificationRequirement}
                          onChange={(e) =>
                            handleFieldChange(key, {
                              verificationRequirement: e.target.value as any,
                            })
                          }
                          className="bg-surface-200 border border-border-default rounded px-2 py-1 text-[11px] text-slate-300"
                        >
                          <option value="strict_registry">Strict MCA Registry</option>
                          <option value="multi_source">Multi-Source Corroboration</option>
                          <option value="web_imprint">Official Web Imprint</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          step="0.05"
                          min="0.4"
                          max="1.0"
                          value={f.confidenceThreshold}
                          onChange={(e) =>
                            handleFieldChange(key, {
                              confidenceThreshold: parseFloat(e.target.value),
                            })
                          }
                          className="w-16 bg-surface-200 border border-border-default rounded px-1.5 py-0.5 text-center text-amber-400"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={f.maximumAttempts}
                          onChange={(e) =>
                            handleFieldChange(key, {
                              maximumAttempts: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-12 bg-surface-200 border border-border-default rounded px-1.5 py-0.5 text-center text-slate-300"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add custom field */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add custom extraction field (e.g. GSTIN, Import Export Code)..."
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="flex-1 bg-surface-200 border border-border-default rounded px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCustomField}
                className="text-xs font-mono"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Field
              </Button>
            </div>
          </div>

          {/* Research Budget & Cost Limits */}
          <div className="p-4 rounded bg-surface-50 border border-border-subtle space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wide text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Safety & Research Budget Limits Per Company
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Max Searches</label>
                <input
                  type="number"
                  value={profile.maxSearchesPerCompany}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      maxSearchesPerCompany: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full bg-surface-200 border border-border-default rounded px-2.5 py-1.5 text-foreground"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Max Pages Scraped</label>
                <input
                  type="number"
                  value={profile.maxPagesPerCompany}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      maxPagesPerCompany: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full bg-surface-200 border border-border-default rounded px-2.5 py-1.5 text-foreground"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Max AI Calls</label>
                <input
                  type="number"
                  value={profile.maxAiCallsPerCompany}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      maxAiCallsPerCompany: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full bg-surface-200 border border-border-default rounded px-2.5 py-1.5 text-foreground"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Max Cost (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={profile.maxProviderCostUsd}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      maxProviderCostUsd: parseFloat(e.target.value),
                    })
                  }
                  className="w-full bg-surface-200 border border-border-default rounded px-2.5 py-1.5 text-emerald-400 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle bg-surface-50 flex items-center justify-between shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs font-mono">
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold font-mono text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" /> Save & Activate Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

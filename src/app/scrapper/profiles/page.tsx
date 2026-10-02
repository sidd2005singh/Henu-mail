"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Sliders, ShieldCheck } from "lucide-react";
import { ResearchProfileBuilder } from "@/components/scrapper/research-profile-builder";
import { ResearchProfileConfig } from "@/lib/scrapper/types";
import { DEFAULT_STANDARD_PROFILE } from "@/lib/scrapper/research-engine";

export default function ScrapperProfilesPage() {
  const [profiles, setProfiles] = React.useState<ResearchProfileConfig[]>([
    DEFAULT_STANDARD_PROFILE,
    {
      id: "profile-deep",
      name: "Exhaustive Forensic Intelligence",
      description: "Deep multi-source web crawling including WHOIS records, RoC historic filings, and news mention cross-referencing.",
      mode: "full_intelligence",
      fields: {
        ...DEFAULT_STANDARD_PROFILE.fields,
        phoneDiscovery: {
          fieldKey: "phoneDiscovery",
          label: "Executive Direct Lines",
          enabled: true,
          priority: 4,
          required: false,
          searchStrategy: "exhaustive",
          verificationRequirement: "multi_source",
          maximumAttempts: 5,
          freshnessDays: 30,
          confidenceThreshold: 0.85,
        },
      },
      maxSearchesPerCompany: 10,
      maxPagesPerCompany: 8,
      maxAiCallsPerCompany: 4,
      maxDurationSeconds: 30,
      maxProviderCostUsd: 0.15,
      retryLimit: 3,
      allowCache: true,
      cacheFreshnessDays: 14,
    },
    {
      id: "profile-quick",
      name: "Quick Registry Verification",
      description: "High-speed CIN & RoC identity lookup without deep external web scraping.",
      mode: "company_verification",
      fields: {
        companyVerification: DEFAULT_STANDARD_PROFILE.fields.companyVerification,
      },
      maxSearchesPerCompany: 2,
      maxPagesPerCompany: 2,
      maxAiCallsPerCompany: 1,
      maxDurationSeconds: 5,
      maxProviderCostUsd: 0.02,
      retryLimit: 1,
      allowCache: true,
      cacheFreshnessDays: 60,
    },
  ]);

  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);
  const [activeProfileToEdit, setActiveProfileToEdit] = React.useState<ResearchProfileConfig | undefined>(undefined);

  const handleSaveProfile = (newProfile: ResearchProfileConfig) => {
    setProfiles((prev) => {
      const idx = prev.findIndex((p) => p.id === newProfile.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newProfile;
        return next;
      }
      return [newProfile, ...prev];
    });
  };

  return (
    <AppShell title="HENU Scrapper — Research Profiles">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-50 p-5 rounded border border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold font-mono text-foreground uppercase">
                Reusable Research Configurations
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Customize research depth, attribute targets, search query quotas, and confidence thresholds.
            </p>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setActiveProfileToEdit({
                ...DEFAULT_STANDARD_PROFILE,
                id: `profile-${Date.now()}`,
                name: "Custom Founder Research",
              });
              setIsBuilderOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold font-mono text-xs"
          >
            + Create New Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <Card key={p.id} className="p-5 bg-surface-50 border-border-subtle flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={p.mode === "full_intelligence" ? "warning" : "info"}>
                    {p.mode.replace("_", " ").toUpperCase()}
                  </Badge>
                  <span className="text-[11px] font-mono text-slate-400">
                    Max: {p.maxSearchesPerCompany} queries
                  </span>
                </div>
                <h3 className="text-sm font-bold font-mono text-foreground">{p.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                <div className="pt-2 border-t border-border-subtle space-y-1.5 text-xs font-mono">
                  {Object.values(p.fields).map((f) => (
                    <div key={f.fieldKey} className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Check className={`w-3.5 h-3.5 ${f.enabled ? "text-emerald-400" : "text-slate-600"}`} />
                        {f.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {Math.round(f.confidenceThreshold * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveProfileToEdit(p);
                  setIsBuilderOpen(true);
                }}
                className="w-full text-xs font-mono"
              >
                <Sliders className="w-3.5 h-3.5 mr-1.5" /> Configure Profile
              </Button>
            </Card>
          ))}
        </div>

        <ResearchProfileBuilder
          isOpen={isBuilderOpen}
          initialProfile={activeProfileToEdit}
          onClose={() => setIsBuilderOpen(false)}
          onSaveProfile={handleSaveProfile}
        />
      </div>
    </AppShell>
  );
}

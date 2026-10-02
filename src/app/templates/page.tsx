"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateStudio } from "@/components/templates/template-studio";
import {
  HENU_OS_PREBUILT_TEMPLATES,
  PrebuiltTemplate,
} from "@/lib/templates/service-catalog-templates";
import {
  FileCode2,
  Plus,
  Sparkles,
  Copy,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Layers,
  Trash2,
} from "lucide-react";

export default function TemplatesPage() {
  const [templates, setTemplates] = React.useState<PrebuiltTemplate[]>(
    HENU_OS_PREBUILT_TEMPLATES
  );
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [studioTemplate, setStudioTemplate] = React.useState<PrebuiltTemplate | null>(
    null
  );
  const [isStudioOpen, setIsStudioOpen] = React.useState(false);

  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    templates.forEach((t) => cats.add(t.category));
    return Array.from(cats);
  }, [templates]);

  const filteredTemplates = templates.filter((t) => {
    const matchesCat = activeCategory === "all" || t.category === activeCategory;
    const matchesSearch =
      search.length === 0 ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenStudio = (template?: PrebuiltTemplate) => {
    if (template) {
      setStudioTemplate(template);
    } else {
      setStudioTemplate({
        id: "tpl-" + Date.now(),
        name: "New Custom Outreach Template",
        category: "General Outreach",
        outreachType: "introduction",
        subject: "Introducing tailored software solutions to {{company_name | default: 'your team'}}",
        description: "Custom outbound email sequence crafted in Template Studio.",
        variables: ["first_name", "company_name", "industry"],
        bodyHtml: `<p>Hi {{first_name | default: "there"}},</p><p>We noticed {{company_name | default: "your company"}} is expanding its technology operations.</p><p>At HENU OS, our engineering teams help companies build scalable cloud and mobile systems.</p><p>Best,<br>HENU OS Private Limited</p><hr/><p style="font-size:11px;color:#64748b;">To opt out, <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>`,
        bodyText: "Hi {{first_name | default: 'there'}},\n\nAt HENU OS, our engineering teams help companies build scalable systems.\n\nBest,\nHENU OS",
      });
    }
    setIsStudioOpen(true);
  };

  const handleDuplicateTemplate = (t: PrebuiltTemplate) => {
    const duplicated: PrebuiltTemplate = {
      ...t,
      id: "tpl-" + Date.now(),
      name: `${t.name} (Copy)`,
    };
    setTemplates([duplicated, ...templates]);
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete template "${name}"?`)) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleSaveStudio = (templateData: {
    name: string;
    category: string;
    subject: string;
    bodyHtml: string;
    bodyText: string;
  }) => {
    if (studioTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === studioTemplate.id
            ? { ...t, ...templateData }
            : t
        )
      );
    }
    setIsStudioOpen(false);
  };

  return (
    <AppShell userRole="admin">
      {isStudioOpen ? (
        <TemplateStudio
          initialTemplate={studioTemplate || undefined}
          onSave={handleSaveStudio}
          onBack={() => setIsStudioOpen(false)}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
            <div>
              <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-henu-400" />
                <span>TEMPLATE STUDIO & HENU OS SERVICE CATALOG</span>
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Author, version, test, and score responsive outbound email templates with dynamic fallback variables
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => handleOpenStudio()}
              className="gap-1.5 font-mono text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>LAUNCH TEMPLATE STUDIO</span>
            </Button>
          </div>

          {/* Search and Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search templates by title, subject line, or service category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-100 border border-border-default rounded pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-slate-500 font-sans focus:outline-none focus:border-henu-500"
              />
            </div>

            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="bg-surface-100 border border-border-default rounded px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-henu-500 cursor-pointer"
            >
              <option value="all">All Service Categories ({templates.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tpl) => (
              <Card key={tpl.id} className="space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <CardHeader className="pb-2 mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold font-mono text-foreground">
                          {tpl.name}
                        </h3>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                        <Badge variant="info" size="sm">
                          {tpl.category}
                        </Badge>
                        <span className="capitalize text-slate-500">&bull; {tpl.outreachType.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDuplicateTemplate(tpl)}
                        className="p-1.5 rounded bg-surface-200 text-slate-300 hover:text-foreground hover:bg-surface-300 transition-colors"
                        title="Duplicate Template"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                        className="p-1.5 rounded bg-surface-200 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardHeader>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="bg-surface-50 p-3 rounded border border-border-subtle font-mono text-xs text-slate-300">
                    <span className="text-slate-500">SUBJECT: </span>
                    <span className="text-foreground">{tpl.subject}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      VARIABLES:
                    </span>
                    {tpl.variables.map((v) => (
                      <span
                        key={v}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-200 text-henu-400 border border-border-default"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between font-mono">
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => handleOpenStudio(tpl)}
                    className="w-full gap-1.5"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>OPEN IN TEMPLATE STUDIO</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

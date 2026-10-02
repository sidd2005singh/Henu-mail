"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmailBlock, EmailCanvasStyle, DEFAULT_BLOCK_TEMPLATES, DEFAULT_CANVAS_STYLE } from "@/lib/templates/block-types";
import {
  HENU_OS_PREBUILT_TEMPLATES,
  PrebuiltTemplate,
} from "@/lib/templates/service-catalog-templates";
import {
  Layout,
  Sparkles,
  Code2,
  Columns,
  Square,
  AlignLeft,
  X,
  Layers,
  ArrowRight,
  Check,
} from "lucide-react";

export interface LayoutOption {
  id: string;
  name: string;
  category: string;
  description: string;
  badge?: string;
  blocks: EmailBlock[];
}

export const LAYOUT_PRESETS: LayoutOption[] = [
  {
    id: "layout-digital-marketing-master",
    name: "HENU OS — Digital Marketing Meta Ads 10-Days Pack",
    category: "Digital Marketing",
    badge: "DEFAULT",
    description: "Official HENU OS Digital Marketing template: Header logo, Workspace visual, Meta Ads ₹8,689/- Pack, WhatsApp CTA, 2-column What We Do vs Why Choose Us, and direct contact dispatch.",
    blocks: [
      { id: "b-1", type: "header", content: { logoUrl: "/logo.png", slogan: "Transform Your Tech" } },
      { id: "b-2", type: "heading", content: { text: "INTRODUCING: HENU OS - THE FUTURE OF BUSINESS EFFICIENCY", level: "h1", align: "center", textColor: "#ffffff" } },
      { id: "b-3", type: "image", content: { imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80", imageAlt: "Workspace & Monitors" } },
      { id: "b-4", type: "paragraph", content: { text: "Hi {{client_name | default: 'there'}},\n\nReady to turn clicks into paying customers?\n\nAt HENU OS Private Limited, we deliver high-performing digital marketing designed to scale your business fast.\n\n🔥 Special Meta Ads 10-Day Growth Pack\n• Offer Price: Just ₹8,689/-\n• What's Included: Targeted Meta Ad setup, promo video creatives, daily optimization, and performance tracking.\n• Our Promise: HENU OS Ka Vaada, Result Pakka!", align: "left" } },
      { id: "b-5", type: "button", content: { buttonText: "👉 CLAIM YOUR 10-DAY PACK ON WHATSAPP", buttonUrl: "https://wa.me/918094100513", buttonColor: "#22c55e", align: "center" } },
      { id: "b-6", type: "button", content: { buttonText: "HENU OS KA VAADA, RESULT PAKKA!", buttonUrl: "https://henu-build.netlify.app/services", buttonColor: "#7c3aed", align: "center" } },
      { id: "b-7", type: "columns", content: { columns: { col1: "<strong>• WHAT WE DO •</strong><br/>1. STRATEGIC AD PLANNING<br/>2. TARGETED AUDIENCE REACH<br/>3. PROMO VIDEO CREATION<br/>4. ENGAGEMENT BOOST<br/>5. PERFORMANCE TRACKING", col2: "<strong>• WHY CHOOSE HENU OS? •</strong><br/>• RESULT FOCUSED APPROACH<br/>• CREATIVE THAT CONVERTS<br/>• TRANSPARENT & HONEST WORK<br/>• DAILY MONITORING & OPTIMIZATION<br/>• BETTER ROI, MAXIMUM IMPACT" } } },
      { id: "b-8", type: "footer", content: { companyName: "HENU OS PRIVATE LIMITED", physicalAddress: "Bangalore, India" } },
    ],
  },
];

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLayout: (blocks: EmailBlock[], name: string, subject?: string) => void;
  onSelectHtmlEditor: () => void;
}

export function TemplateSelectionModal({
  isOpen,
  onClose,
  onSelectLayout,
  onSelectHtmlEditor,
}: TemplateSelectionModalProps) {
  const [activeTab, setActiveTab] = React.useState<"layouts" | "gallery">("layouts");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-5xl bg-surface-50 border border-border-default rounded-xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-100/50">
          <div className="flex items-center gap-2.5">
            <Layout className="w-5 h-5 text-henu-400" />
            <div>
              <h2 className="text-base font-bold font-mono text-foreground">Select an Email Template or Layout</h2>
              <p className="text-xs text-slate-400 font-mono">Choose a structured layout or select from the pre-built marketing catalogue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-surface-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Category Navigation */}
          <div className="w-64 border-r border-border-subtle bg-surface-100/40 p-4 space-y-6 shrink-0">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-2">
                TEMPLATE GALLERY
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("layouts")}
                  className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs flex items-center gap-2.5 transition-all ${
                    activeTab === "layouts"
                      ? "bg-henu-500/10 text-henu-400 font-bold border border-henu-500/30"
                      : "text-slate-400 hover:text-foreground hover:bg-surface-200"
                  }`}
                >
                  <Columns className="w-4 h-4" />
                  <span>Responsive Layouts</span>
                </button>

                <button
                  onClick={() => setActiveTab("gallery")}
                  className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs flex items-center gap-2.5 transition-all ${
                    activeTab === "gallery"
                      ? "bg-henu-500/10 text-henu-400 font-bold border border-henu-500/30"
                      : "text-slate-400 hover:text-foreground hover:bg-surface-200"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Pre-built Themes</span>
                  <Badge variant="success" size="sm" className="ml-auto text-[9px] py-0 px-1.5">
                    NEW
                  </Badge>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-border-subtle">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-2">
                CREATE YOUR OWN
              </div>
              <button
                onClick={() => {
                  onSelectHtmlEditor();
                  onClose();
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg font-mono text-xs flex items-center gap-2.5 border border-dashed border-border-default hover:border-henu-400 text-slate-300 hover:text-foreground transition-all hover:bg-surface-200"
              >
                <Code2 className="w-4 h-4 text-purple-400" />
                <span>Raw HTML Editor</span>
              </button>
            </div>
          </div>

          {/* Right Grid Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-surface-50">
            {activeTab === "layouts" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-mono text-foreground uppercase">
                    MODULAR COLUMN LAYOUTS
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{LAYOUT_PRESETS.length} Layouts Available</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {LAYOUT_PRESETS.map((lp) => (
                    <div
                      key={lp.id}
                      onClick={() => {
                        onSelectLayout(lp.blocks, lp.name);
                        onClose();
                      }}
                      className="group p-5 rounded-xl bg-surface-100 border border-border-subtle hover:border-henu-500/60 transition-all cursor-pointer flex flex-col justify-between space-y-3 hover:shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-mono text-sm font-bold text-foreground group-hover:text-henu-400 transition-colors">
                            {lp.name}
                          </h4>
                          {lp.badge && (
                            <Badge variant="info" size="sm" className="text-[9px]">
                              {lp.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-1.5 leading-relaxed">
                          {lp.description}
                        </p>
                      </div>

                      {/* Visual Wireframe Preview */}
                      <div className="p-3 bg-surface-200 rounded border border-border-subtle flex flex-col gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <div className="h-2 w-1/3 bg-slate-500 rounded" />
                        <div className="h-3 w-full bg-slate-600 rounded" />
                        <div className="h-2 w-2/3 bg-slate-500 rounded" />
                        <div className="h-4 w-1/4 bg-henu-500 rounded self-center mt-1" />
                      </div>

                      <div className="flex items-center text-xs font-mono text-henu-400 group-hover:translate-x-1 transition-transform">
                        <span>Use This Layout</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-mono text-foreground uppercase">
                    PRODUCTION MARKETING CATALOGUE
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {HENU_OS_PREBUILT_TEMPLATES.length} Pre-built Themes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {HENU_OS_PREBUILT_TEMPLATES.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        // Load as layout block or HTML template
                        onSelectLayout(DEFAULT_BLOCK_TEMPLATES.product ? [
                          { id: "b-1", type: "header", content: { slogan: "HENU OS One OS. Infinite Possibilities." } },
                          { id: "b-2", type: "heading", content: { text: t.name, level: "h1", align: "center" } },
                          { id: "b-3", type: "paragraph", content: { text: t.description, align: "center" } },
                          { id: "b-4", type: "button", content: { buttonText: "Claim Offer Now", buttonUrl: "mailto:henuospvtltd@gmail.com", align: "center" } },
                          { id: "b-5", type: "footer", content: {} },
                        ] : [], t.name, t.subject);
                        onClose();
                      }}
                      className="group p-5 rounded-xl bg-surface-100 border border-border-subtle hover:border-henu-500/60 transition-all cursor-pointer flex flex-col justify-between space-y-3 hover:shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-henu-400 uppercase font-bold">
                            {t.category}
                          </span>
                          <Badge variant="outline" size="sm" className="text-[9px]">
                            {t.outreachType.replace("_", " ")}
                          </Badge>
                        </div>
                        <h4 className="font-mono text-sm font-bold text-foreground mt-1 group-hover:text-henu-400 transition-colors">
                          {t.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-sans mt-1 line-clamp-2">
                          {t.description}
                        </p>
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 truncate bg-surface-200 p-2 rounded border border-border-subtle">
                        Subject: <em>{t.subject}</em>
                      </div>

                      <div className="flex items-center text-xs font-mono text-henu-400 group-hover:translate-x-1 transition-transform">
                        <span>Load Template</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

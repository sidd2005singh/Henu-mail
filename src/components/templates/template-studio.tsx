"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  EmailBlock,
  EmailCanvasStyle,
  DEFAULT_BLOCK_TEMPLATES,
  DEFAULT_CANVAS_STYLE,
} from "@/lib/templates/block-types";
import { generateHtmlFromBlocks } from "@/lib/templates/html-generator";
import { analyzeTemplateDeliverability } from "@/lib/templates/deliverability-scorer";
import { TemplateScorerBadge } from "./template-scorer-badge";
import { TemplatePreviewFrame } from "./template-preview-frame";
import { VisualBlockEditor } from "./visual-block-editor";
import { VersionHistoryDialog, TemplateVersionItem } from "./version-history-dialog";
import { TemplateSelectionModal } from "./template-selection-modal";
import {
  FileCode2,
  Eye,
  Code2,
  Save,
  Send,
  History,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";

interface TemplateStudioProps {
  initialTemplate?: {
    id?: string;
    name: string;
    category: string;
    subject: string;
    bodyHtml: string;
    bodyText?: string;
  };
  onSave: (templateData: {
    name: string;
    category: string;
    subject: string;
    bodyHtml: string;
    bodyText: string;
  }) => void;
  onBack: () => void;
}

type StudioTab = "visual" | "html" | "preview";

export function TemplateStudio({
  initialTemplate,
  onSave,
  onBack,
}: TemplateStudioProps) {
  const [activeTab, setActiveTab] = React.useState<StudioTab>("visual");
  const [previewDevice, setPreviewDevice] = React.useState<"desktop" | "mobile">("desktop");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);

  const [templateName, setTemplateName] = React.useState(
    initialTemplate?.name || "HENU OS — Digital Marketing Meta Ads 10-Days Pack (₹8,689/-)"
  );
  const [category, setCategory] = React.useState(
    initialTemplate?.category || "Digital Marketing"
  );
  const [subject, setSubject] = React.useState(
    initialTemplate?.subject ||
      "🚀 Dikhaiye Apna Brand, Badhaaiye Apna Business — HENU OS Digital Marketing"
  );
  const [bodyHtml, setBodyHtml] = React.useState(
    initialTemplate?.bodyHtml || ""
  );
  const [bodyText, setBodyText] = React.useState(
    initialTemplate?.bodyText ||
      "HENU OS - One OS. Infinite Possibilities.\nDikhaiye Apna Brand, Badhaaiye Apna Business\n\nMeta Ads 10 Days Pack Just ₹8,689/- Only."
  );

  const [canvasStyle, setCanvasStyle] = React.useState<EmailCanvasStyle>(DEFAULT_CANVAS_STYLE);

  // Initial Blocks
  const [blocks, setBlocks] = React.useState<EmailBlock[]>([
    {
      id: "b-header",
      type: "header",
      content: {
        logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60",
        logoAlt: "HENU OS",
        slogan: "One OS. Infinite Possibilities.",
      },
    },
    {
      id: "b-hero",
      type: "heading",
      content: {
        text: "Dikhaiye Apna Brand, Badhaaiye Apna Business",
        level: "h1",
        fontSize: "26px",
        textColor: "#0f172a",
        align: "center",
      },
    },
    {
      id: "b-subhead",
      type: "paragraph",
      content: {
        text: "Smart Strategies. Powerful Campaigns. Real Results.\nSpecial Promotional Launch Package for High-Growth Businesses.",
        align: "center",
      },
    },
    {
      id: "b-product",
      type: "product",
      content: {
        product: {
          id: "prod-meta-10",
          title: "Meta Ads 10-Days Pack",
          description: "Strategic Ad Planning, Targeted Reach, Promo Video & Professional Logo Design.",
          price: "JUST ₹8,689/-",
          originalPrice: "₹14,999/-",
          badge: "SPECIAL OFFER",
          imageUrl: "https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&auto=format&fit=crop&q=60",
          buttonText: "HENU OS KA VAADA, RESULT PAKKA!",
          buttonUrl: "mailto:henuospvtltd@gmail.com?subject=Meta%20Ads%20Booking",
        },
      },
    },
    {
      id: "b-columns",
      type: "columns",
      content: {
        columns: {
          col1: "<strong>🎯 Strategic Ad Planning</strong><br/><span style='color:#64748b;font-size:12px;'>Laser-focused audience targeting & ROI tracking.</span>",
          col2: "<strong>🎬 Promo Videos & Logo</strong><br/><span style='color:#64748b;font-size:12px;'>High-converting reels & brand creative package.</span>",
        },
      },
    },
    {
      id: "b-quote",
      type: "quote",
      content: {
        text: '"Soch Badlo, Business Badhega! Every rupee spent is monitored and optimized daily."',
        quoteAuthor: "HENU OS Growth Guarantee",
      },
    },
    {
      id: "b-btn",
      type: "button",
      content: {
        buttonText: "Book Your 10-Days Pack Now →",
        buttonUrl: "mailto:henuospvtltd@gmail.com?subject=Interested%20in%20Meta%20Ads%2010%20Days%20Pack",
        buttonColor: "#7c3aed",
        align: "center",
      },
    },
    {
      id: "b-social",
      type: "social",
      content: {
        socialLinks: DEFAULT_BLOCK_TEMPLATES.social.socialLinks,
      },
    },
    {
      id: "b-footer",
      type: "footer",
      content: {
        companyName: "HENU OS PRIVATE LIMITED",
        physicalAddress: "Plot 42, Okhla Industrial Area Phase 3, New Delhi, DL 110020 IN",
        copyrightText: "© 2026 HENU OS Private Limited. All rights reserved.",
        text: 'If you prefer not to receive promotional updates, <a href="{{unsubscribe_url}}" style="color: #7c3aed; text-decoration: underline;">unsubscribe here</a>.',
      },
    },
  ]);

  const [currentVersionNumber, setCurrentVersionNumber] = React.useState(1);
  const [versions, setVersions] = React.useState<TemplateVersionItem[]>([
    {
      id: "v-1",
      versionNumber: 1,
      subject,
      bodyHtml,
      changeSummary: "Initial visual block design with Meta Ads 10 Days Pack promo offer",
      author: "Admin User",
      createdAt: "Today at 10:00 AM",
    },
  ]);

  const [showVersionHistory, setShowVersionHistory] = React.useState(false);
  const [showTestModal, setShowTestModal] = React.useState(false);
  const [testEmailAddress, setTestEmailAddress] = React.useState("siddharthsingh4132@gmail.com");
  const [isSendingTest, setIsSendingTest] = React.useState(false);
  const [testSendResult, setTestSendResult] = React.useState<{ success: boolean; messageId?: string; error?: string } | null>(null);

  // Sync visual blocks to HTML
  React.useEffect(() => {
    if (activeTab === "visual") {
      const generated = generateHtmlFromBlocks(blocks, canvasStyle);
      setBodyHtml(generated);
    }
  }, [blocks, canvasStyle, activeTab]);

  const deliverabilityScore = React.useMemo(() => {
    return analyzeTemplateDeliverability(subject, bodyHtml, bodyText);
  }, [subject, bodyHtml, bodyText]);

  const handleSaveDraft = () => {
    const nextVer = currentVersionNumber + 1;
    setCurrentVersionNumber(nextVer);

    const newVersionItem: TemplateVersionItem = {
      id: "v-" + Date.now(),
      versionNumber: nextVer,
      subject,
      bodyHtml,
      changeSummary: `Revision #${nextVer} updated from Visual Template Studio`,
      author: "Admin User",
      createdAt: "Just now",
    };
    setVersions([newVersionItem, ...versions]);
    onSave({ name: templateName, category, subject, bodyHtml, bodyText });
  };

  const handleRestoreVersion = (ver: TemplateVersionItem) => {
    setSubject(ver.subject);
    setBodyHtml(ver.bodyHtml);
    setCurrentVersionNumber(ver.versionNumber);
  };

  const handleInsertVariable = (varPlaceholder: string) => {
    setSubject((prev) => `${prev} ${varPlaceholder}`);
  };

  const handleSelectLayoutFromModal = (newBlocks: EmailBlock[], name: string, newSubject?: string) => {
    if (newBlocks.length > 0) {
      setBlocks(newBlocks);
    }
    if (newSubject) {
      setSubject(newSubject);
    }
    setTemplateName(name);
  };

  const handleSendLiveTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingTest(true);
    setTestSendResult(null);

    try {
      const res = await fetch("/api/v1/providers/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: "henuospvtltd@gmail.com",
          senderName: "HENU OS",
          password: "khcwolerxtixzmem",
          testRecipientEmail: testEmailAddress,
          subject,
          htmlContent: bodyHtml,
          sampleContact: {
            first_name: "Siddharth",
            last_name: "Singh",
            company_name: "Growth Enterprise Partner",
          },
        }),
      });
      const data = await res.json();
      setTestSendResult(data);
    } catch (err: unknown) {
      setTestSendResult({
        success: false,
        error: err instanceof Error ? err.message : "Test dispatch failed",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Studio Master Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-border-subtle bg-surface-50 p-3 rounded-lg">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="xs" onClick={onBack} className="gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>EXIT STUDIO</span>
          </Button>
          <div>
            <h1 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-henu-400" />
              <span>{templateName}</span>
              <span className="text-slate-500 font-normal">v{currentVersionNumber}.0</span>
            </h1>
            <div className="text-[11px] text-slate-400 font-sans mt-0.5">
              Category: <span className="text-henu-400">{category}</span> &bull; Visual Drag-and-Drop Canvas &bull; Safe Variable Engine
            </div>
          </div>
        </div>

        {/* Deliverability Badge & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <TemplateScorerBadge scoreResult={deliverabilityScore} />

          <Button
            variant="secondary"
            size="xs"
            onClick={() => setShowVersionHistory(true)}
            className="gap-1 text-slate-300"
          >
            <History className="w-3.5 h-3.5" />
            <span>VERSIONS ({versions.length})</span>
          </Button>

          <Button
            variant="secondary"
            size="xs"
            onClick={() => setShowTestModal(true)}
            className="gap-1 text-henu-400 border-henu-500/30"
            id="open-test-send-modal-btn"
          >
            <Send className="w-3.5 h-3.5" />
            <span>DISPATCH TEST</span>
          </Button>

          <Button
            variant="primary"
            size="xs"
            onClick={handleSaveDraft}
            className="gap-1.5 font-bold"
            id="save-template-version-btn"
          >
            <Save className="w-3.5 h-3.5" />
            <span>SAVE VERSION</span>
          </Button>
        </div>
      </div>

      {/* Editor Subject Line Input */}
      <div className="bg-surface-50 p-3 rounded border border-border-subtle space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-slate-400 uppercase font-semibold">
            EMAIL SUBJECT LINE
          </label>
          <span className="text-[10px] text-slate-500">{subject.length} characters (Optimal: 25-65)</span>
        </div>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. 🚀 Dikhaiye Apna Brand, Badhaaiye Apna Business"
          className="w-full bg-surface-100 border border-border-default rounded px-3 py-2 text-xs text-foreground font-sans focus:outline-none focus:border-henu-500"
        />
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <button
          onClick={() => setActiveTab("visual")}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
            activeTab === "visual"
              ? "bg-surface-200 text-henu-400 font-semibold"
              : "text-slate-400 hover:text-foreground"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>VISUAL DRAG & DROP BUILDER</span>
        </button>

        <button
          onClick={() => setActiveTab("html")}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
            activeTab === "html"
              ? "bg-surface-200 text-henu-400 font-semibold"
              : "text-slate-400 hover:text-foreground"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>RAW HTML & CODE MODE</span>
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
            activeTab === "preview"
              ? "bg-surface-200 text-henu-400 font-semibold"
              : "text-slate-400 hover:text-foreground"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>RESPONSIVE MULTI-DEVICE PREVIEW</span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === "visual" && (
        <VisualBlockEditor
          blocks={blocks}
          onChangeBlocks={setBlocks}
          onInsertVariable={handleInsertVariable}
          canvasStyle={canvasStyle}
          onChangeCanvasStyle={setCanvasStyle}
          previewDevice={previewDevice}
          onChangePreviewDevice={setPreviewDevice}
          onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
        />
      )}

      {activeTab === "html" && (
        <div className="space-y-3">
          <textarea
            rows={20}
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            className="w-full bg-surface-100 border border-border-default rounded p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-henu-500 leading-relaxed"
          />
        </div>
      )}

      {activeTab === "preview" && (
        <TemplatePreviewFrame subject={subject} bodyHtml={bodyHtml} />
      )}

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectLayout={handleSelectLayoutFromModal}
        onSelectHtmlEditor={() => setActiveTab("html")}
      />

      {/* Version History Modal */}
      <VersionHistoryDialog
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        versions={versions}
        currentVersionNumber={currentVersionNumber}
        onRestoreVersion={handleRestoreVersion}
      />

      {/* Test Email Dispatch Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-surface-100 border border-border-default rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase flex items-center gap-2">
              <Send className="w-4 h-4 text-henu-400" />
              <span>DISPATCH TEST EMAIL (LIVE SMTP)</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Transmits a live email via <code>henuospvtltd@gmail.com</code> with dynamic variables to test client inbox rendering.
            </p>

            <form onSubmit={handleSendLiveTestEmail} className="space-y-3">
              <Input
                label="Recipient Email Address"
                type="email"
                id="test-modal-email-input"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="siddharthsingh4132@gmail.com"
                required
              />

              {testSendResult && (
                <div
                  className={`p-3 rounded border font-mono text-xs space-y-1 ${
                    testSendResult.success
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-red-950/40 border-red-500/40 text-red-300"
                  }`}
                >
                  <div className="font-bold">
                    {testSendResult.success ? "LIVE DISPATCH DELIVERED!" : "DISPATCH FAILED"}
                  </div>
                  {testSendResult.messageId && (
                    <div className="text-[10px] text-slate-400 truncate">
                      Message ID: {testSendResult.messageId}
                    </div>
                  )}
                  {testSendResult.error && <div>{testSendResult.error}</div>}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="xs" type="button" onClick={() => setShowTestModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="xs" disabled={isSendingTest} className="gap-1.5">
                  <Send className="w-3 h-3" />
                  <span>{isSendingTest ? "TRANSMITTING..." : "SEND LIVE TEST"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

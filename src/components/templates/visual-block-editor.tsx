"use client";

import * as React from "react";
import {
  EmailBlock,
  EmailBlockType,
  EmailCanvasStyle,
  DEFAULT_BLOCK_TEMPLATES,
  DEFAULT_CANVAS_STYLE,
  SocialLinkItem,
  ProductItem,
} from "@/lib/templates/block-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Heading,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Square,
  Minus,
  MoveVertical,
  PenTool,
  Quote,
  Columns,
  Code2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Video,
  Share2,
  ShoppingBag,
  Layers,
  Palette,
  LayoutGrid,
  Smartphone,
  Monitor,
  Undo,
  Redo,
  Sparkles,
  ExternalLink,
  Copy,
  Sliders,
  Type,
  Link as LinkIcon,
  HelpCircle,
  Check,
  Tag,
  Upload,
  X,
} from "lucide-react";

interface VisualBlockEditorProps {
  blocks: EmailBlock[];
  onChangeBlocks: (blocks: EmailBlock[]) => void;
  onInsertVariable: (varPlaceholder: string) => void;
  canvasStyle: EmailCanvasStyle;
  onChangeCanvasStyle: (style: EmailCanvasStyle) => void;
  previewDevice: "desktop" | "mobile";
  onChangePreviewDevice: (device: "desktop" | "mobile") => void;
  onOpenTemplateModal: () => void;
}

type LeftSidebarTab = "style" | "gallery" | "elements";
type StyleSubTab = "general" | "layout";

export function VisualBlockEditor({
  blocks,
  onChangeBlocks,
  onInsertVariable,
  canvasStyle,
  onChangeCanvasStyle,
  previewDevice,
  onChangePreviewDevice,
  onOpenTemplateModal,
}: VisualBlockEditorProps) {
  const [activeTab, setActiveTab] = React.useState<LeftSidebarTab>("elements");
  const [styleSubTab, setStyleSubTab] = React.useState<StyleSubTab>("general");
  const [activeBlockId, setActiveBlockId] = React.useState<string | null>(
    blocks[0]?.id || null
  );

  // Undo / Redo History Stack
  const [history, setHistory] = React.useState<EmailBlock[][]>([blocks]);
  const [historyIndex, setHistoryIndex] = React.useState(0);

  const pushHistory = (newBlocks: EmailBlock[]) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push(newBlocks);
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
    onChangeBlocks(newBlocks);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChangeBlocks(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChangeBlocks(next);
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) onComplete(res);
    };
    reader.readAsDataURL(file);
  };

  // Add block from palette
  const handleAddBlock = (type: EmailBlockType) => {
    const newBlock: EmailBlock = {
      id: "blk-" + Date.now(),
      type,
      mobileScale: true,
      content: JSON.parse(JSON.stringify(DEFAULT_BLOCK_TEMPLATES[type] || {})),
    };
    const updated = [...blocks, newBlock];
    pushHistory(updated);
    setActiveBlockId(newBlock.id);
  };

  // Duplicate block
  const handleDuplicateBlock = (id: string) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const target = blocks[idx];
    const duplicated: EmailBlock = {
      ...JSON.parse(JSON.stringify(target)),
      id: "blk-" + Date.now(),
    };
    const updated = [...blocks.slice(0, idx + 1), duplicated, ...blocks.slice(idx + 1)];
    pushHistory(updated);
    setActiveBlockId(duplicated.id);
  };

  // Update block content
  const handleUpdateBlock = (id: string, updates: Partial<EmailBlock["content"]>) => {
    const updated = blocks.map((b) =>
      b.id === id ? { ...b, content: { ...b.content, ...updates } } : b
    );
    pushHistory(updated);
  };

  // Delete block
  const handleDeleteBlock = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    pushHistory(updated);
    if (activeBlockId === id) {
      setActiveBlockId(updated[0]?.id || null);
    }
  };

  // Move block
  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const clone = [...blocks];
    const temp = clone[index];
    clone[index] = clone[newIndex];
    clone[newIndex] = temp;
    pushHistory(clone);
  };

  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  return (
    <div className="flex flex-col space-y-3 font-mono text-xs">
      {/* Top Visual Editor Controls Bar (Compose Content Header) */}
      <div className="bg-surface-100 border border-border-default rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Left Toolbar: Font & Formatting Quick Tools */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Font Family Dropdown */}
          <select
            value={canvasStyle.fontFamily}
            onChange={(e) =>
              onChangeCanvasStyle({ ...canvasStyle, fontFamily: e.target.value })
            }
            className="bg-surface-50 border border-border-subtle rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-henu-400"
            title="Global Typography Font Family"
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="Helvetica, sans-serif">Helvetica</option>
            <option value="Tahoma, sans-serif">Tahoma</option>
            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="'Inter', sans-serif">Inter</option>
            <option value="'Roboto', sans-serif">Roboto</option>
          </select>

          {/* Device Switcher (Desktop / Mobile) */}
          <div className="flex items-center bg-surface-200 p-0.5 rounded border border-border-subtle ml-2">
            <button
              onClick={() => onChangePreviewDevice("desktop")}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                previewDevice === "desktop"
                  ? "bg-henu-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-foreground"
              }`}
              title="Desktop View (Full Width)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => onChangePreviewDevice("mobile")}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                previewDevice === "mobile"
                  ? "bg-henu-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-foreground"
              }`}
              title="Mobile Responsive Scaling Simulation (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1 border-l border-border-subtle pl-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="p-1.5 rounded text-slate-400 hover:text-foreground hover:bg-surface-200 disabled:opacity-30"
              title="Undo Action"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="p-1.5 rounded text-slate-400 hover:text-foreground hover:bg-surface-200 disabled:opacity-30"
              title="Redo Action"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Merge Tags Quick Selector */}
          <div className="flex items-center gap-1 border-l border-border-subtle pl-2">
            <Tag className="w-3 h-3 text-henu-400" />
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onInsertVariable(e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="bg-surface-50 border border-border-subtle rounded px-2 py-1 text-xs text-henu-400 focus:outline-none focus:border-henu-400 font-bold"
            >
              <option value="" disabled>
                + Insert Merge Tag
              </option>
              <option value="{{first_name | default: 'Partner'}}">{"{{first_name}}"}</option>
              <option value="{{company_name | default: 'your company'}}">{"{{company_name}}"}</option>
              <option value="{{industry | default: 'technology'}}">{"{{industry}}"}</option>
              <option value="{{city | default: 'your market'}}">{"{{city}}"}</option>
              <option value="{{unsubscribe_url}}">{"{{unsubscribe_url}}"}</option>
            </select>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="outline"
            onClick={onOpenTemplateModal}
            className="gap-1.5 font-mono text-henu-400 border-henu-500/30"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>CHANGE LAYOUT</span>
          </Button>
        </div>
      </div>

      {/* Main 3-Column Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* 1. LEFT SIDEBAR: Style / Gallery / Elements (3 Cols) */}
        <div className="lg:col-span-3 bg-surface-100 border border-border-default rounded-xl overflow-hidden shadow-sm flex flex-col">
          {/* Main 3 Tabs (Zoho Style) */}
          <div className="grid grid-cols-3 border-b border-border-subtle bg-surface-200/50 text-center font-bold text-[11px]">
            <button
              onClick={() => setActiveTab("style")}
              className={`py-3 flex flex-col items-center gap-1 transition-all ${
                activeTab === "style"
                  ? "bg-surface-100 text-henu-400 border-b-2 border-henu-400 font-bold"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Style</span>
            </button>

            <button
              onClick={() => setActiveTab("gallery")}
              className={`py-3 flex flex-col items-center gap-1 transition-all ${
                activeTab === "gallery"
                  ? "bg-surface-100 text-henu-400 border-b-2 border-henu-400 font-bold"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Gallery</span>
            </button>

            <button
              onClick={() => setActiveTab("elements")}
              className={`py-3 flex flex-col items-center gap-1 transition-all ${
                activeTab === "elements"
                  ? "bg-surface-100 text-henu-400 border-b-2 border-henu-400 font-bold"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Elements</span>
            </button>
          </div>

          {/* TAB 1: STYLE */}
          {activeTab === "style" && (
            <div className="p-4 space-y-5">
              <div className="flex border-b border-border-subtle pb-2 gap-4 text-xs font-bold">
                <button
                  onClick={() => setStyleSubTab("general")}
                  className={`pb-1 ${styleSubTab === "general" ? "text-henu-400 border-b-2 border-henu-400" : "text-slate-400"}`}
                >
                  General
                </button>
                <button
                  onClick={() => setStyleSubTab("layout")}
                  className={`pb-1 ${styleSubTab === "layout" ? "text-henu-400 border-b-2 border-henu-400" : "text-slate-400"}`}
                >
                  Layout
                </button>
              </div>

              {styleSubTab === "general" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">PRIMARY BRAND COLOR</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={canvasStyle.primaryColor}
                        onChange={(e) =>
                          onChangeCanvasStyle({ ...canvasStyle, primaryColor: e.target.value })
                        }
                        className="w-8 h-8 rounded border border-border-default cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={canvasStyle.primaryColor}
                        onChange={(e) =>
                          onChangeCanvasStyle({ ...canvasStyle, primaryColor: e.target.value })
                        }
                        className="flex-1 bg-surface-50 border border-border-default rounded px-2.5 py-1 text-xs text-foreground font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">SECONDARY ACCENT COLOR</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={canvasStyle.secondaryColor}
                        onChange={(e) =>
                          onChangeCanvasStyle({ ...canvasStyle, secondaryColor: e.target.value })
                        }
                        className="w-8 h-8 rounded border border-border-default cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={canvasStyle.secondaryColor}
                        onChange={(e) =>
                          onChangeCanvasStyle({ ...canvasStyle, secondaryColor: e.target.value })
                        }
                        className="flex-1 bg-surface-50 border border-border-default rounded px-2.5 py-1 text-xs text-foreground font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">TYPOGRAPHY FONT</label>
                    <select
                      value={canvasStyle.fontFamily}
                      onChange={(e) =>
                        onChangeCanvasStyle({ ...canvasStyle, fontFamily: e.target.value })
                      }
                      className="w-full bg-surface-50 border border-border-default rounded px-2.5 py-1.5 text-xs text-foreground"
                    >
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                      <option value="Helvetica, sans-serif">Helvetica</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Times New Roman', serif">Times New Roman</option>
                    </select>
                  </div>
                </div>
              )}

              {styleSubTab === "layout" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">EMAIL BACKGROUND</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={canvasStyle.emailBackground}
                        onChange={(e) =>
                          onChangeCanvasStyle({ ...canvasStyle, emailBackground: e.target.value })
                        }
                        className="w-8 h-8 rounded border border-border-default cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={canvasStyle.emailBackground}
                        onChange={(e) =>
                          onChangeCanvasStyle({ ...canvasStyle, emailBackground: e.target.value })
                        }
                        className="flex-1 bg-surface-50 border border-border-default rounded px-2.5 py-1 text-xs text-foreground font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">CONTENT CARD BACKGROUND</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={canvasStyle.contentBackground}
                        onChange={(e) =>
                          onChangeCanvasStyle({ ...canvasStyle, contentBackground: e.target.value })
                        }
                        className="w-8 h-8 rounded border border-border-default cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={canvasStyle.contentBackground}
                        onChange={(e) =>
                          onChangeCanvasStyle({ ...canvasStyle, contentBackground: e.target.value })
                        }
                        className="flex-1 bg-surface-50 border border-border-default rounded px-2.5 py-1 text-xs text-foreground font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">CANVAS WIDTH (PX)</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[600, 700, 800, 900].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => onChangeCanvasStyle({ ...canvasStyle, widthPx: w })}
                          className={`py-1.5 rounded font-mono text-xs border text-center transition-all ${
                            canvasStyle.widthPx === w
                              ? "bg-henu-500 text-slate-950 font-bold border-henu-400"
                              : "bg-surface-50 border-border-subtle text-slate-400 hover:text-foreground"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">TEXT DIRECTION</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onChangeCanvasStyle({ ...canvasStyle, textDirection: "ltr" })}
                        className={`py-1.5 rounded font-mono text-xs border text-center ${
                          canvasStyle.textDirection === "ltr"
                            ? "bg-henu-500 text-slate-950 font-bold border-henu-400"
                            : "bg-surface-50 border-border-subtle text-slate-400"
                        }`}
                      >
                        LTR (Left to Right)
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeCanvasStyle({ ...canvasStyle, textDirection: "rtl" })}
                        className={`py-1.5 rounded font-mono text-xs border text-center ${
                          canvasStyle.textDirection === "rtl"
                            ? "bg-henu-500 text-slate-950 font-bold border-henu-400"
                            : "bg-surface-50 border-border-subtle text-slate-400"
                        }`}
                      >
                        RTL (Right to Left)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GALLERY */}
          {activeTab === "gallery" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">SELECT STRUCTURE</span>
                <Button size="xs" variant="outline" onClick={onOpenTemplateModal}>
                  Browse All
                </Button>
              </div>

              {/* Blank Structure Blocks */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-300">Blank Columns</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleAddBlock("paragraph")}
                    className="p-2.5 rounded bg-surface-50 border border-border-subtle hover:border-henu-400 text-center flex flex-col items-center gap-1 group"
                  >
                    <div className="h-6 w-full bg-surface-200 border border-dashed border-border-default rounded flex items-center justify-center text-[10px] text-slate-400 group-hover:text-henu-400">
                      1 Col
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddBlock("columns")}
                    className="p-2.5 rounded bg-surface-50 border border-border-subtle hover:border-henu-400 text-center flex flex-col items-center gap-1 group"
                  >
                    <div className="h-6 w-full grid grid-cols-2 gap-1">
                      <div className="bg-surface-200 border border-dashed border-border-default rounded text-[9px] flex items-center justify-center">
                        2
                      </div>
                      <div className="bg-surface-200 border border-dashed border-border-default rounded text-[9px] flex items-center justify-center">
                        Col
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddBlock("product_list")}
                    className="p-2.5 rounded bg-surface-50 border border-border-subtle hover:border-henu-400 text-center flex flex-col items-center gap-1 group"
                  >
                    <div className="h-6 w-full grid grid-cols-3 gap-0.5">
                      <div className="bg-surface-200 border border-dashed border-border-default rounded text-[8px] flex items-center justify-center">
                        3
                      </div>
                      <div className="bg-surface-200 border border-dashed border-border-default rounded text-[8px] flex items-center justify-center">
                        Col
                      </div>
                      <div className="bg-surface-200 border border-dashed border-border-default rounded text-[8px] flex items-center justify-center">
                        Grid
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Structured Blocks */}
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <div className="text-[11px] font-bold text-slate-300">Structured Cards</div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      handleAddBlock("header");
                      handleAddBlock("heading");
                      handleAddBlock("button");
                    }}
                    className="w-full p-2.5 rounded bg-surface-50 border border-border-subtle hover:border-henu-400 text-left text-xs font-mono text-slate-300 hover:text-foreground flex items-center justify-between"
                  >
                    <span>Hero Header & CTA</span>
                    <Plus className="w-3.5 h-3.5 text-henu-400" />
                  </button>

                  <button
                    onClick={() => handleAddBlock("product")}
                    className="w-full p-2.5 rounded bg-surface-50 border border-border-subtle hover:border-henu-400 text-left text-xs font-mono text-slate-300 hover:text-foreground flex items-center justify-between"
                  >
                    <span>Special Offer Product Card</span>
                    <Plus className="w-3.5 h-3.5 text-henu-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ELEMENTS (Add Element - Zoho Style Grid) */}
          {activeTab === "elements" && (
            <div className="p-3.5 space-y-4 max-h-[680px] overflow-y-auto">
              {/* Basics */}
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                  BASICS
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: "paragraph" as EmailBlockType, label: "Text", icon: Type },
                    { type: "image" as EmailBlockType, label: "Image", icon: ImageIcon },
                    { type: "button" as EmailBlockType, label: "Button", icon: Square },
                    { type: "video" as EmailBlockType, label: "Video", icon: Video },
                    { type: "divider" as EmailBlockType, label: "Separator", icon: Minus },
                    { type: "social" as EmailBlockType, label: "Social", icon: Share2 },
                    { type: "spacer" as EmailBlockType, label: "Spacer", icon: MoveVertical },
                    { type: "heading" as EmailBlockType, label: "Heading", icon: Heading },
                    { type: "quote" as EmailBlockType, label: "Quote", icon: Quote },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => handleAddBlock(item.type)}
                      className="p-3 rounded-lg bg-surface-50 border border-border-subtle hover:border-henu-400 hover:bg-surface-200 text-center flex flex-col items-center justify-center gap-1.5 transition-all group shadow-sm"
                    >
                      <item.icon className="w-4 h-4 text-slate-400 group-hover:text-henu-400 transition-colors" />
                      <span className="text-[11px] font-mono text-slate-300 group-hover:text-foreground">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Header and Footer */}
              <div className="pt-2 border-t border-border-subtle">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                  HEADER AND FOOTER
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddBlock("header")}
                    className="p-3 rounded-lg bg-surface-50 border border-border-subtle hover:border-henu-400 hover:bg-surface-200 text-center flex flex-col items-center justify-center gap-1.5 transition-all group"
                  >
                    <Layers className="w-4 h-4 text-slate-400 group-hover:text-henu-400" />
                    <span className="text-[11px] font-mono text-slate-300 group-hover:text-foreground">
                      Header
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddBlock("footer")}
                    className="p-3 rounded-lg bg-surface-50 border border-border-subtle hover:border-henu-400 hover:bg-surface-200 text-center flex flex-col items-center justify-center gap-1.5 transition-all group"
                  >
                    <AlignLeft className="w-4 h-4 text-slate-400 group-hover:text-henu-400" />
                    <span className="text-[11px] font-mono text-slate-300 group-hover:text-foreground">
                      Footer
                    </span>
                  </button>
                </div>
              </div>

              {/* Ecommerce */}
              <div className="pt-2 border-t border-border-subtle">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                  ECOMMERCE
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddBlock("product")}
                    className="p-3 rounded-lg bg-surface-50 border border-border-subtle hover:border-henu-400 hover:bg-surface-200 text-center flex flex-col items-center justify-center gap-1.5 transition-all group"
                  >
                    <ShoppingBag className="w-4 h-4 text-slate-400 group-hover:text-henu-400" />
                    <span className="text-[11px] font-mono text-slate-300 group-hover:text-foreground">
                      Product
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddBlock("product_list")}
                    className="p-3 rounded-lg bg-surface-50 border border-border-subtle hover:border-henu-400 hover:bg-surface-200 text-center flex flex-col items-center justify-center gap-1.5 transition-all group"
                  >
                    <LayoutGrid className="w-4 h-4 text-slate-400 group-hover:text-henu-400" />
                    <span className="text-[11px] font-mono text-slate-300 group-hover:text-foreground">
                      Product Lists
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. CENTER: Interactive Email Canvas (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div
            className="w-full transition-all duration-300 p-4 rounded-xl border border-border-default overflow-y-auto max-h-[780px]"
            style={{
              backgroundColor: canvasStyle.emailBackground,
              maxWidth: previewDevice === "mobile" ? "420px" : "100%",
            }}
          >
            {/* Inner Content Card */}
            <div
              className="mx-auto rounded-lg border border-slate-200/80 shadow-md divide-y divide-slate-100 transition-all"
              style={{
                backgroundColor: canvasStyle.contentBackground,
                maxWidth: `${canvasStyle.widthPx}px`,
                borderRadius: `${canvasStyle.borderRadiusPx}px`,
                fontFamily: canvasStyle.fontFamily,
                direction: canvasStyle.textDirection,
              }}
            >
              {blocks.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-3 font-sans">
                  <Sparkles className="w-8 h-8 text-henu-400 mx-auto opacity-80 animate-pulse" />
                  <div className="font-bold text-sm text-foreground">Canvas is Empty</div>
                  <p className="text-xs">Click elements on the left or select a template to build your design.</p>
                  <Button size="xs" variant="primary" onClick={onOpenTemplateModal}>
                    Browse Templates & Layouts
                  </Button>
                </div>
              ) : (
                blocks.map((block, index) => {
                  const isSelected = block.id === activeBlockId;

                  return (
                    <div
                      key={block.id}
                      onClick={() => setActiveBlockId(block.id)}
                      className={`relative group p-3 transition-all cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-henu-500 bg-henu-500/5"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      {/* Selection Action Halo (Up, Down, Duplicate, Delete) */}
                      {isSelected && (
                        <div className="absolute -top-3 right-3 z-20 flex items-center gap-1 bg-slate-900 text-white rounded-md px-2 py-1 shadow-lg font-mono text-[10px] animate-in fade-in">
                          <span className="text-henu-400 font-bold uppercase">{block.type}</span>
                          <div className="h-3 w-[1px] bg-slate-700 mx-1" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(index, "up");
                            }}
                            disabled={index === 0}
                            title="Move Up"
                            className="p-0.5 hover:text-henu-400 disabled:opacity-30"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(index, "down");
                            }}
                            disabled={index === blocks.length - 1}
                            title="Move Down"
                            className="p-0.5 hover:text-henu-400 disabled:opacity-30"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateBlock(block.id);
                            }}
                            title="Duplicate"
                            className="p-0.5 hover:text-henu-400"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(block.id);
                            }}
                            title="Delete"
                            className="p-0.5 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Render Visual Representation in Canvas */}
                      {block.type === "header" && (
                        <div className={`text-${block.content.align || "center"} py-2`}>
                          {block.content.logoUrl && (
                            <img
                              src={block.content.logoUrl}
                              alt={block.content.logoAlt || "Logo"}
                              className="max-h-12 mx-auto mb-2 rounded"
                            />
                          )}
                          {block.content.slogan && (
                            <div className="text-xs text-slate-500 italic">{block.content.slogan}</div>
                          )}
                        </div>
                      )}

                      {block.type === "heading" && (
                        <div
                          style={{
                            textAlign: block.content.align || "left",
                            color: block.content.textColor || "#0f172a",
                            fontSize: block.content.fontSize || "20px",
                            fontWeight: 800,
                          }}
                        >
                          {block.content.text || "Heading text"}
                        </div>
                      )}

                      {block.type === "paragraph" && (
                        <div
                          style={{
                            textAlign: block.content.align || "left",
                            color: block.content.textColor || "#334155",
                            fontSize: "14px",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {block.content.text || "Paragraph text"}
                        </div>
                      )}

                      {block.type === "button" && (
                        <div className={`text-${block.content.align || "center"} py-2`}>
                          <span
                            style={{
                              backgroundColor: block.content.buttonColor || canvasStyle.primaryColor,
                              color: block.content.buttonTextColor || "#ffffff",
                              borderRadius: `${block.content.buttonBorderRadius || 6}px`,
                              padding: "10px 24px",
                              display: "inline-block",
                              fontWeight: 700,
                              fontSize: "13px",
                            }}
                          >
                            {block.content.buttonText || "Click Button"}
                          </span>
                        </div>
                      )}

                      {block.type === "image" && (
                        <div className={`text-${block.content.align || "center"} py-1`}>
                          <img
                            src={block.content.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"}
                            alt={block.content.imageAlt || "Image"}
                            className="max-w-full rounded-md mx-auto"
                            style={{ width: block.content.imageWidth || "100%" }}
                          />
                        </div>
                      )}

                      {block.type === "video" && (
                        <div className="relative rounded-lg overflow-hidden border border-slate-200">
                          <img
                            src={block.content.videoThumbnailUrl || "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800"}
                            alt={block.content.videoTitle || "Video"}
                            className="w-full max-h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg font-bold text-lg">
                              ▶
                            </div>
                          </div>
                          <div className="p-2 bg-slate-900 text-white text-xs font-bold text-center">
                            {block.content.videoTitle || "Watch Video Showcase"}
                          </div>
                        </div>
                      )}

                      {block.type === "divider" && (
                        <div className="py-2">
                          <hr
                            style={{
                              border: "none",
                              borderTop: `1px ${block.content.dividerStyle || "solid"} ${block.content.dividerColor || "#e2e8f0"}`,
                            }}
                          />
                        </div>
                      )}

                      {block.type === "spacer" && (
                        <div
                          style={{ height: `${block.content.spaceHeight || 24}px` }}
                          className="w-full flex items-center justify-center text-[10px] text-slate-300 border border-dashed border-slate-200 rounded"
                        >
                          Spacer ({block.content.spaceHeight || 24}px)
                        </div>
                      )}

                      {block.type === "social" && (
                        <div className={`text-${block.content.align || "center"} py-2 flex justify-center gap-2 flex-wrap`}>
                          {(block.content.socialLinks || []).filter(l => l.enabled).map((l) => (
                            <span
                              key={l.platform}
                              className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-bold uppercase"
                              style={{ color: canvasStyle.primaryColor }}
                            >
                              {l.platform}
                            </span>
                          ))}
                        </div>
                      )}

                      {block.type === "product" && block.content.product && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-4">
                          {block.content.product.imageUrl && (
                            <img
                              src={block.content.product.imageUrl}
                              alt={block.content.product.title}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1">
                            {block.content.product.badge && (
                              <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                {block.content.product.badge}
                              </span>
                            )}
                            <div className="font-bold text-sm text-slate-900 mt-1">
                              {block.content.product.title}
                            </div>
                            <div className="text-xs text-slate-500 line-clamp-1">
                              {block.content.product.description}
                            </div>
                            <div className="font-extrabold text-sm text-purple-600 mt-1">
                              {block.content.product.price}
                            </div>
                          </div>
                        </div>
                      )}

                      {block.type === "product_list" && (
                        <div className={`grid grid-cols-${block.content.productColumns || 2} gap-2`}>
                          {(block.content.products || []).map((p) => (
                            <div key={p.id} className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                              {p.imageUrl && (
                                <img src={p.imageUrl} alt={p.title} className="h-16 w-full object-cover rounded mb-1" />
                              )}
                              <div className="font-bold text-xs text-slate-900 truncate">{p.title}</div>
                              <div className="font-extrabold text-xs text-purple-600">{p.price}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {block.type === "quote" && (
                        <blockquote
                          className="p-3 rounded border-l-4 italic text-xs bg-slate-50 text-slate-700"
                          style={{ borderColor: canvasStyle.primaryColor }}
                        >
                          {block.content.text}
                          {block.content.quoteAuthor && (
                            <div className="font-bold not-italic mt-1 text-purple-600">— {block.content.quoteAuthor}</div>
                          )}
                        </blockquote>
                      )}

                      {block.type === "columns" && (
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                          <div
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded"
                            dangerouslySetInnerHTML={{ __html: block.content.columns?.col1 || "" }}
                          />
                          <div
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded"
                            dangerouslySetInnerHTML={{ __html: block.content.columns?.col2 || "" }}
                          />
                        </div>
                      )}

                      {block.type === "footer" && (
                        <div className="text-center text-[10px] text-slate-400 py-3 space-y-1">
                          <div className="font-bold text-slate-600">{block.content.companyName}</div>
                          <div>{block.content.physicalAddress}</div>
                          <div dangerouslySetInnerHTML={{ __html: block.content.text || "" }} />
                        </div>
                      )}

                      {block.type === "unsubscribe" && (
                        <div
                          className="text-center text-[10px] text-slate-400 py-2"
                          dangerouslySetInnerHTML={{ __html: block.content.text || "" }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 3. RIGHT SIDEBAR: Contextual Properties & Setup Inspector (3 Cols) */}
        <div className="lg:col-span-3 bg-surface-100 border border-border-default rounded-xl p-4 space-y-4 shadow-sm max-h-[780px] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Sliders className="w-4 h-4 text-henu-400" />
              <span>BLOCK PROPERTIES</span>
            </div>
            {activeBlock && (
              <Badge variant="info" size="sm" className="font-mono text-[9px] uppercase">
                {activeBlock.type}
              </Badge>
            )}
          </div>

          {!activeBlock ? (
            <div className="p-8 text-center text-slate-400 font-sans text-xs">
              Select any block in the canvas to inspect and configure its setup and properties.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Common Alignment Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  ALIGNMENT
                </label>
                <div className="grid grid-cols-4 gap-1 bg-surface-50 p-1 rounded border border-border-subtle">
                  {[
                    { align: "left" as const, icon: AlignLeft },
                    { align: "center" as const, icon: AlignCenter },
                    { align: "right" as const, icon: AlignRight },
                    { align: "justify" as const, icon: AlignJustify },
                  ].map((item) => (
                    <button
                      key={item.align}
                      type="button"
                      onClick={() => handleUpdateBlock(activeBlock.id, { align: item.align })}
                      className={`p-1.5 rounded flex items-center justify-center transition-all ${
                        activeBlock.content.align === item.align
                          ? "bg-henu-500 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* HEADER BLOCK INSPECTOR (LOGO UPLOAD & SLOGAN) */}
              {activeBlock.type === "header" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      HEADER LOGO IMAGE
                    </label>

                    {/* Logo Preview & Actions */}
                    {activeBlock.content.logoUrl ? (
                      <div className="p-3 bg-surface-50 rounded-lg border border-border-default space-y-2">
                        <div className="flex items-center justify-center p-2 bg-surface-200/60 rounded border border-border-subtle">
                          <img
                            src={activeBlock.content.logoUrl}
                            alt={activeBlock.content.logoAlt || "Logo"}
                            className="max-h-16 w-auto object-contain rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <label className="flex-1 cursor-pointer">
                            <span className="w-full text-center block px-2.5 py-1.5 rounded bg-surface-200 hover:bg-surface-300 text-foreground font-mono text-[11px] font-bold border border-border-default transition-colors">
                              Upload New Logo
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileUpload(e, (url) =>
                                  handleUpdateBlock(activeBlock.id, { logoUrl: url })
                                )
                              }
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleUpdateBlock(activeBlock.id, { logoUrl: "" })}
                            className="p-1.5 rounded bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-800/40 transition-colors"
                            title="Remove Logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-border-default hover:border-henu-400 bg-surface-50 hover:bg-surface-200/50 cursor-pointer transition-all group">
                        <div className="w-10 h-10 rounded-full bg-henu-500/10 flex items-center justify-center text-henu-400 mb-2 group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-xs font-bold text-foreground">
                          Click to Upload Logo File
                        </span>
                        <span className="text-[10px] text-slate-500 font-sans mt-0.5">
                          PNG, JPG, SVG or WEBP (Max 5MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, (url) =>
                              handleUpdateBlock(activeBlock.id, { logoUrl: url })
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      OR ENTER LOGO IMAGE URL
                    </label>
                    <input
                      type="url"
                      value={activeBlock.content.logoUrl || ""}
                      onChange={(e) => handleUpdateBlock(activeBlock.id, { logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      LOGO ALT TEXT
                    </label>
                    <input
                      type="text"
                      value={activeBlock.content.logoAlt || ""}
                      onChange={(e) => handleUpdateBlock(activeBlock.id, { logoAlt: e.target.value })}
                      placeholder="HENU OS Logo"
                      className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      SLOGAN / SUBTITLE
                    </label>
                    <input
                      type="text"
                      value={activeBlock.content.slogan || ""}
                      onChange={(e) => handleUpdateBlock(activeBlock.id, { slogan: e.target.value })}
                      placeholder="One OS. Infinite Possibilities."
                      className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground"
                    />
                  </div>
                </div>
              )}

              {/* HEADING BLOCK INSPECTOR */}
              {activeBlock.type === "heading" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      HEADING TEXT
                    </label>
                    <textarea
                      rows={2}
                      value={activeBlock.content.text || ""}
                      onChange={(e) => handleUpdateBlock(activeBlock.id, { text: e.target.value })}
                      className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground focus:outline-none focus:border-henu-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      FONT SIZE (PX)
                    </label>
                    <input
                      type="text"
                      value={activeBlock.content.fontSize || "22px"}
                      onChange={(e) => handleUpdateBlock(activeBlock.id, { fontSize: e.target.value })}
                      placeholder="e.g. 26px"
                      className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground"
                    />
                  </div>
                </div>
              )}

              {/* PARAGRAPH BLOCK INSPECTOR */}
              {activeBlock.type === "paragraph" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      CONTENT BODY
                    </label>
                    <textarea
                      rows={6}
                      value={activeBlock.content.text || ""}
                      onChange={(e) => handleUpdateBlock(activeBlock.id, { text: e.target.value })}
                      className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-sans focus:outline-none focus:border-henu-400"
                    />
                  </div>
                </div>
              )}

              {/* BUTTON BLOCK INSPECTOR (Zoho Properties Style) */}
              {activeBlock.type === "button" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      BUTTON LABEL
                    </label>
                    <input
                      type="text"
                      value={activeBlock.content.buttonText || ""}
                      onChange={(e) => handleUpdateBlock(activeBlock.id, { buttonText: e.target.value })}
                      className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      LINK TO
                    </label>
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      {(["url", "email", "phone"] as const).map((lt) => (
                        <button
                          key={lt}
                          type="button"
                          onClick={() => handleUpdateBlock(activeBlock.id, { linkType: lt })}
                          className={`py-1 text-[10px] font-mono rounded uppercase border ${
                            activeBlock.content.linkType === lt
                              ? "bg-henu-500 text-slate-950 font-bold border-henu-400"
                              : "bg-surface-50 border-border-subtle text-slate-400"
                          }`}
                        >
                          {lt}
                        </button>
                      ))}
                    </div>

                    {activeBlock.content.linkType === "url" && (
                      <input
                        type="url"
                        value={activeBlock.content.buttonUrl || ""}
                        onChange={(e) => handleUpdateBlock(activeBlock.id, { buttonUrl: e.target.value })}
                        placeholder="https://company.com"
                        className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-mono"
                      />
                    )}

                    {activeBlock.content.linkType === "email" && (
                      <div className="space-y-2">
                        <input
                          type="email"
                          value={activeBlock.content.buttonUrl || ""}
                          onChange={(e) => handleUpdateBlock(activeBlock.id, { buttonUrl: e.target.value })}
                          placeholder="email@company.com"
                          className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-mono"
                        />
                        <input
                          type="text"
                          value={activeBlock.content.emailSubject || ""}
                          onChange={(e) => handleUpdateBlock(activeBlock.id, { emailSubject: e.target.value })}
                          placeholder="Email Subject"
                          className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground"
                        />
                      </div>
                    )}

                    {activeBlock.content.linkType === "phone" && (
                      <input
                        type="tel"
                        value={activeBlock.content.phoneNumber || ""}
                        onChange={(e) => handleUpdateBlock(activeBlock.id, { phoneNumber: e.target.value })}
                        placeholder="+91 98110 00000"
                        className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-mono"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      BUTTON COLOR
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeBlock.content.buttonColor || canvasStyle.primaryColor}
                        onChange={(e) => handleUpdateBlock(activeBlock.id, { buttonColor: e.target.value })}
                        className="w-8 h-8 rounded border border-border-default bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={activeBlock.content.buttonColor || canvasStyle.primaryColor}
                        onChange={(e) => handleUpdateBlock(activeBlock.id, { buttonColor: e.target.value })}
                        className="flex-1 bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* IMAGE BLOCK INSPECTOR */}
              {activeBlock.type === "image" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      UPLOAD IMAGE FROM DEVICE
                    </label>
                    <label className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed border-border-default hover:border-henu-400 bg-surface-50 hover:bg-surface-200/50 cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5 text-henu-400" />
                      <span className="font-mono text-xs text-foreground font-bold">Browse / Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload(e, (url) =>
                            handleUpdateBlock(activeBlock.id, { imageUrl: url })
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      OR IMAGE URL
                    </label>
                    <input
                      type="url"
                      value={activeBlock.content.imageUrl || ""}
                      onChange={(e) => handleUpdateBlock(activeBlock.id, { imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      ALTERNATE TEXT
                    </label>
                    <input
                      type="text"
                      value={activeBlock.content.imageAlt || ""}
                      onChange={(e) => handleUpdateBlock(activeBlock.id, { imageAlt: e.target.value })}
                      placeholder="A special promotional banner"
                      className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground"
                    />
                  </div>
                </div>
              )}

              {/* VIDEO BLOCK INSPECTOR */}
              {activeBlock.type === "video" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      VIDEO URL (YOUTUBE / VIMEO)
                    </label>
                    <input
                      type="url"
                      value={activeBlock.content.videoUrl || ""}
                      onChange={(e) => handleUpdateBlock(activeBlock.id, { videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-mono"
                    />
                    <span className="text-[10px] text-slate-500 font-sans mt-0.5 block">
                      YouTube and Vimeo links will generate a thumbnail automatically.
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      CUSTOM THUMBNAIL URL
                    </label>
                    <input
                      type="url"
                      value={activeBlock.content.videoThumbnailUrl || ""}
                      onChange={(e) => handleUpdateBlock(activeBlock.id, { videoThumbnailUrl: e.target.value })}
                      className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground font-mono"
                    />
                  </div>
                </div>
              )}

              {/* SOCIAL BLOCK INSPECTOR */}
              {activeBlock.type === "social" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">
                    SOCIAL CHANNELS
                  </label>
                  {(activeBlock.content.socialLinks || []).map((link, i) => (
                    <div key={link.platform} className="p-2 bg-surface-50 rounded border border-border-subtle space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-foreground capitalize">
                        <span>{link.platform}</span>
                        <input
                          type="checkbox"
                          checked={link.enabled}
                          onChange={(e) => {
                            const clone = [...(activeBlock.content.socialLinks || [])];
                            clone[i].enabled = e.target.checked;
                            handleUpdateBlock(activeBlock.id, { socialLinks: clone });
                          }}
                        />
                      </div>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => {
                          const clone = [...(activeBlock.content.socialLinks || [])];
                          clone[i].url = e.target.value;
                          handleUpdateBlock(activeBlock.id, { socialLinks: clone });
                        }}
                        className="w-full bg-surface-100 border border-border-default rounded px-2 py-1 text-[11px] text-foreground font-mono"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* PRODUCT BLOCK INSPECTOR */}
              {activeBlock.type === "product" && activeBlock.content.product && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      PRODUCT TITLE
                    </label>
                    <input
                      type="text"
                      value={activeBlock.content.product.title}
                      onChange={(e) =>
                        handleUpdateBlock(activeBlock.id, {
                          product: { ...activeBlock.content.product!, title: e.target.value },
                        })
                      }
                      className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        PRICE
                      </label>
                      <input
                        type="text"
                        value={activeBlock.content.product.price}
                        onChange={(e) =>
                          handleUpdateBlock(activeBlock.id, {
                            product: { ...activeBlock.content.product!, price: e.target.value },
                          })
                        }
                        className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        BADGE
                      </label>
                      <input
                        type="text"
                        value={activeBlock.content.product.badge || ""}
                        onChange={(e) =>
                          handleUpdateBlock(activeBlock.id, {
                            product: { ...activeBlock.content.product!, badge: e.target.value },
                          })
                        }
                        className="w-full bg-surface-50 border border-border-default rounded p-2 text-xs text-foreground"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SPACER BLOCK INSPECTOR */}
              {activeBlock.type === "spacer" && (
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                    <span>HEIGHT (PX)</span>
                    <span className="text-henu-400">{activeBlock.content.spaceHeight || 24}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="96"
                    step="4"
                    value={activeBlock.content.spaceHeight || 24}
                    onChange={(e) => handleUpdateBlock(activeBlock.id, { spaceHeight: Number(e.target.value) })}
                    className="w-full accent-henu-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

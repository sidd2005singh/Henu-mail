"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, X, CheckCircle2, GitCompare } from "lucide-react";

export interface TemplateVersionItem {
  id: string;
  versionNumber: number;
  subject: string;
  bodyHtml: string;
  changeSummary: string;
  author: string;
  createdAt: string;
}

interface VersionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  versions: TemplateVersionItem[];
  currentVersionNumber: number;
  onRestoreVersion: (version: TemplateVersionItem) => void;
}

export function VersionHistoryDialog({
  isOpen,
  onClose,
  versions,
  currentVersionNumber,
  onRestoreVersion,
}: VersionHistoryDialogProps) {
  const [selectedVersionId, setSelectedVersionId] = React.useState<string>(
    versions[0]?.id || ""
  );

  if (!isOpen) return null;

  const selectedVersion =
    versions.find((v) => v.id === selectedVersionId) || versions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-surface-100 border border-border-default rounded shadow-2xl overflow-hidden font-mono text-xs flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-border-subtle bg-surface-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-henu-400" />
            <h3 className="font-bold text-sm text-foreground uppercase">
              TEMPLATE VERSION HISTORY & REVISION LOG
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Versions List (1 Col) */}
          <div className="border-r border-border-subtle p-3 space-y-2 overflow-y-auto bg-surface-50/50">
            <div className="text-[10px] uppercase text-slate-400 font-semibold mb-2">
              SAVED VERSIONS ({versions.length})
            </div>
            {versions.map((ver) => (
              <button
                key={ver.id}
                onClick={() => setSelectedVersionId(ver.id)}
                className={`w-full text-left p-2.5 rounded border transition-colors ${
                  selectedVersion?.id === ver.id
                    ? "bg-surface-200 border-henu-500 text-foreground font-semibold"
                    : "bg-surface-100 border-border-default text-slate-400 hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-henu-400">v{ver.versionNumber}.0</span>
                  {ver.versionNumber === currentVersionNumber && (
                    <Badge variant="success" size="sm">
                      CURRENT
                    </Badge>
                  )}
                </div>
                <div className="text-[11px] text-foreground truncate">{ver.changeSummary}</div>
                <div className="text-[10px] text-slate-500 mt-1">{ver.createdAt}</div>
              </button>
            ))}
          </div>

          {/* Version Snapshot Preview (2 Cols) */}
          <div className="md:col-span-2 p-5 space-y-4 overflow-y-auto bg-surface-100">
            {selectedVersion ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Version {selectedVersion.versionNumber}.0 Snapshot
                    </h4>
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                      By {selectedVersion.author} &bull; {selectedVersion.createdAt}
                    </div>
                  </div>

                  {selectedVersion.versionNumber !== currentVersionNumber && (
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => {
                        onRestoreVersion(selectedVersion);
                        onClose();
                      }}
                      className="gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>RESTORE THIS VERSION</span>
                    </Button>
                  )}
                </div>

                <div className="p-2.5 bg-surface-50 rounded border border-border-subtle text-slate-300">
                  <span className="text-slate-500">SUBJECT: </span>
                  <span className="text-foreground">{selectedVersion.subject}</span>
                </div>

                <div className="p-4 bg-white rounded border border-border-subtle text-slate-900 font-sans text-xs max-h-60 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: selectedVersion.bodyHtml }} />
                </div>
              </>
            ) : (
              <p className="text-slate-500">Select a version to inspect details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

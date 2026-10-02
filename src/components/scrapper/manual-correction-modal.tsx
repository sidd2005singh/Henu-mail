"use client";

import * as React from "react";
import {
  Edit3,
  ShieldCheck,
  Save,
  X,
  AlertTriangle,
  History,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Company } from "@/types/scrapper";
import { Button } from "@/components/ui/button";

interface ManualCorrectionModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCorrection: (updatedCompany: Company) => void;
}

export function ManualCorrectionModal({
  company,
  isOpen,
  onClose,
  onSaveCorrection,
}: ManualCorrectionModalProps) {
  const [verifiedName, setVerifiedName] = React.useState("");
  const [cin, setCin] = React.useState("");
  const [verifiedAddress, setVerifiedAddress] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (company) {
      setVerifiedName(company.verifiedCompanyName || company.originalCompanyName);
      setCin(company.cin || "");
      setVerifiedAddress(company.verifiedAddress || company.registeredOfficeAddress || "");
      setWebsite(company.website || "");
      setEmail(company.email || "");
      setPhone(company.phone || "");
      setReason("");
    }
  }, [company]);

  if (!isOpen || !company) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedCompany: Company = {
        ...company,
        verifiedCompanyName: verifiedName,
        cin: cin || undefined,
        verifiedAddress,
        website: website || undefined,
        email: email || undefined,
        phone: phone || undefined,
        verificationStatus: "verified",
        verificationConfidence: 1.0,
        verificationNotes: `Manual correction applied: ${reason || "Verified by operator."}`,
        updatedAt: new Date().toISOString(),
      };

      await fetch(`/api/v1/scrapper/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCompany),
      });

      onSaveCorrection(updatedCompany);
      onClose();
    } catch {
      // fallback
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-surface-100 border border-border-default rounded shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle bg-surface-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                Manual Intelligence Correction
              </h3>
              <p className="text-[11px] text-slate-400">
                Non-destructive override preserving original registry evidence
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh] custom-scrollbar">
          <div className="p-3 rounded bg-surface-150/60 border border-border-subtle flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Original Imported Name:</span>
            <strong className="text-foreground">{company.originalCompanyName}</strong>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">Verified Legal Entity Name</label>
              <input
                type="text"
                value={verifiedName}
                onChange={(e) => setVerifiedName(e.target.value)}
                required
                className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Corporate Identity Number (CIN)</label>
              <input
                type="text"
                value={cin}
                onChange={(e) => setCin(e.target.value)}
                className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Official Website URL</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Corporate Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 block mb-1">Verified Registered Address</label>
              <textarea
                rows={2}
                value={verifiedAddress}
                onChange={(e) => setVerifiedAddress(e.target.value)}
                className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 block mb-1">Reason for Correction / Audit Note</label>
              <input
                type="text"
                placeholder="e.g. Verified against latest RoC quarterly filing..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-surface-200 border border-border-default rounded px-3 py-2 text-foreground placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              type="submit"
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" /> Save Verified Correction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

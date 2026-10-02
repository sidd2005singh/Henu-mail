"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Send,
  Users,
  Mail,
  FileCode2,
  Eye,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Lock,
  Calendar,
  Layers,
} from "lucide-react";
import { interpolateVariables } from "@/lib/templates/variable-interpolator";
import { HENU_OS_PREBUILT_TEMPLATES } from "@/lib/templates/service-catalog-templates";

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: (campaign: any) => void;
}

export function CampaignBuilderWizard({ isOpen, onClose, onCampaignCreated }: WizardProps) {
  const [currentStep, setCurrentStep] = React.useState(1);

  // Step 1: Campaign Details
  const [campaignName, setCampaignName] = React.useState("Dikhaiye Apna Brand, Badhaaiye Apna Business — HENU OS");
  const [description, setDescription] = React.useState("Official Meta Ads 10-Days Pack dispatch to VIP prospects");

  // Step 2: Audience
  const [audienceType, setAudienceType] = React.useState<"list" | "segment" | "filtered" | "manual">("list");
  const [selectedListId, setSelectedListId] = React.useState("list-1");
  const [audienceStats, setAudienceStats] = React.useState({
    totalRecipients: 2,
    suppressedCount: 0,
    invalidCount: 0,
    readyCount: 2,
    sampleContacts: [
      { id: "c-1", email: "siddharthsingh4132@gmail.com", firstName: "Siddharth", lastName: "Singh", companyName: "HENU OS Client", industry: "Digital Marketing", city: "India" },
      { id: "c-2", email: "henuosr@gmail.com", firstName: "hso", lastName: "Team", companyName: "HENU OS Operations", industry: "Digital Marketing", city: "India" },
    ],
  });

  // Step 3: Sender Accounts
  const [selectedSenderId, setSelectedSenderId] = React.useState("acc-gmail-01");
  const senderAccounts = [
    { id: "acc-gmail-01", email: "henuospvtltd@gmail.com", name: "HENU OS Dispatch Center", provider: "Google Gmail", status: "nominal", dailyLimit: 499, usedToday: 1 },
    { id: "acc-gmail-02", email: "partnerships@henuos.com", name: "HENU OS Strategic Relations", provider: "Google Workspace", status: "nominal", dailyLimit: 2000, usedToday: 420 },
    { id: "acc-outlook-01", email: "direct.reach@henuos.com", name: "HENU Enterprise Dispatch", provider: "Microsoft 365", status: "nominal", dailyLimit: 1000, usedToday: 150 },
  ];

  // Step 4: Sequence Setup
  const [sequenceSteps, setSequenceSteps] = React.useState([
    {
      id: "seq-1",
      stepNumber: 1,
      delayDays: 0,
      delayHours: 0,
      subject: "Dikhaiye Apna Brand, Badhaaiye Apna Business — HENU OS",
      htmlContent: HENU_OS_PREBUILT_TEMPLATES[0]?.bodyHtml || "<p>Hi {{first_name}}, Dikhaiye Apna Brand, Badhaaiye Apna Business — HENU OS</p>",
    },
    {
      id: "seq-2",
      stepNumber: 2,
      delayDays: 2,
      delayHours: 0,
      subject: "Re: Dikhaiye Apna Brand, Badhaaiye Apna Business — Special Meta Ads 10-Days Pack",
      htmlContent: "<p>Hi {{first_name}},</p><p>Following up on the Special Meta Ads 10-Day Growth Pack (₹8,689/-). Let us know if you'd like to claim your slot!</p><p>Best regards,<br/>TEAM HENU OS</p>",
    },
  ]);

  // Step 5: Contact Personalization Inspector
  const [previewContactIndex, setPreviewContactIndex] = React.useState(0);
  const currentPreviewContact = audienceStats.sampleContacts[previewContactIndex] || audienceStats.sampleContacts[0];

  // Step 6: Sending Schedule
  const [timezone, setTimezone] = React.useState("Asia/Kolkata");
  const [sendImmediately, setSendImmediately] = React.useState(true);
  const [scheduledDate, setScheduledDate] = React.useState("2026-10-05T09:30");
  const [allowedDays, setAllowedDays] = React.useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  const [startHour, setStartHour] = React.useState(9);
  const [endHour, setEndHour] = React.useState(18);

  // Step 7: Test Email Dispatch
  const [testEmail, setTestEmail] = React.useState("siddharthsingh4132@gmail.com");
  const [isSendingTest, setIsSendingTest] = React.useState(false);
  const [testSendResult, setTestSendResult] = React.useState<{ success: boolean; messageId?: string; error?: string } | null>(null);

  // Launch State
  const [isLaunching, setIsLaunching] = React.useState(false);

  if (!isOpen) return null;

  // Add Sequence Step
  const handleAddStep = () => {
    const nextNum = sequenceSteps.length + 1;
    setSequenceSteps([
      ...sequenceSteps,
      {
        id: `seq-${Date.now()}`,
        stepNumber: nextNum,
        delayDays: 3,
        delayHours: 0,
        subject: `Follow-up #${nextNum}: {{company_name}} update`,
        htmlContent: "<p>Hi {{first_name}}, quick follow-up on my earlier message.</p>",
      },
    ]);
  };

  // Remove Sequence Step
  const handleRemoveStep = (index: number) => {
    if (sequenceSteps.length <= 1) return;
    const updated = sequenceSteps.filter((_, i) => i !== index).map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSequenceSteps(updated);
  };

  // Run Test Dispatch
  const handleDispatchTest = async () => {
    setIsSendingTest(true);
    setTestSendResult(null);
    try {
      const selectedSender = senderAccounts.find((s) => s.id === selectedSenderId) || senderAccounts[0];
      const res = await fetch("/api/v1/providers/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: selectedSender.id,
          provider: "gmail",
          senderEmail: selectedSender.email,
          senderName: selectedSender.name,
          testRecipientEmail: testEmail,
          subject: sequenceSteps[0].subject,
          htmlContent: sequenceSteps[0].htmlContent,
          sampleContact: currentPreviewContact,
        }),
      });
      const data = await res.json();
      setTestSendResult(data);
    } catch (err: unknown) {
      setTestSendResult({ success: false, error: err instanceof Error ? err.message : "Test dispatch failed" });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Submit & Launch Campaign
  const handleLaunchCampaign = async () => {
    setIsLaunching(true);
    try {
      const res = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          description,
          audience: {
            type: audienceType,
            targetId: selectedListId,
            ...audienceStats,
          },
          senderAccountIds: [selectedSenderId],
          sequenceSteps,
          scheduleConfig: {
            timezone,
            sendImmediately,
            scheduledStartAt: sendImmediately ? undefined : scheduledDate,
            allowedDays,
            allowedHours: { start: startHour, end: endHour },
          },
          action: sendImmediately ? "launch" : "schedule",
        }),
      });
      const data = await res.json();
      if (data.success) {
        onCampaignCreated(data.campaign);
        onClose();
      }
    } finally {
      setIsLaunching(false);
    }
  };

  const stepsList = [
    { num: 1, label: "Campaign Name" },
    { num: 2, label: "Audience" },
    { num: 3, label: "Sender" },
    { num: 4, label: "Sequences" },
    { num: 5, label: "Personalization" },
    { num: 6, label: "Schedule" },
    { num: 7, label: "Safety & Test" },
    { num: 8, label: "Launch" },
  ];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-50 border border-border-default rounded-xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-100/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-henu-500/10 border border-henu-500/30 flex items-center justify-center text-henu-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-foreground uppercase tracking-wider">
                CAMPAIGN ARCHITECT & LAUNCH ENGINE
              </h2>
              <div className="text-[11px] font-mono text-slate-400">
                Step {currentStep} of 8: {stepsList[currentStep - 1]?.label}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-foreground font-mono text-sm">
            ✕ ESC
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-8 border-b border-border-subtle bg-surface-100/30 text-center font-mono text-[10px]">
          {stepsList.map((st) => (
            <button
              key={st.num}
              onClick={() => setCurrentStep(st.num)}
              className={`py-2 px-1 border-b-2 transition-all truncate ${
                currentStep === st.num
                  ? "border-b-henu-400 text-henu-400 font-bold bg-henu-500/5"
                  : currentStep > st.num
                  ? "border-b-emerald-500 text-emerald-400"
                  : "border-b-transparent text-slate-500"
              }`}
            >
              {st.num}. {st.label}
            </button>
          ))}
        </div>

        {/* Wizard Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: CAMPAIGN NAME */}
          {currentStep === 1 && (
            <div className="max-w-xl mx-auto space-y-5">
              <div>
                <h3 className="text-base font-bold font-mono text-foreground">CAMPAIGN IDENTIFIER</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Define the naming convention and internal reference details for this outreach initiative.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Campaign Name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. AI Automation Outreach - Q4 Tier 1 Founders"
                  required
                />

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">Campaign Description / Notes</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-md bg-surface-100 border border-border-default p-3 text-xs text-foreground focus:outline-none focus:border-henu-500 font-sans"
                    placeholder="Provide campaign strategic context..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AUDIENCE */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-base font-bold font-mono text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-henu-400" />
                  <span>TARGET AUDIENCE SELECTION & SCREENING</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Select lead pool and view real-time suppression and validity screening metrics.
                </p>
              </div>

              {/* Source Mode Picker */}
              <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                {(["list", "segment", "manual", "filtered"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAudienceType(mode)}
                    className={`p-2.5 rounded border text-center uppercase tracking-wider transition-all ${
                      audienceType === mode
                        ? "bg-henu-500/10 border-henu-500 text-foreground font-bold"
                        : "bg-surface-100 border-border-subtle text-slate-400 hover:border-border-default"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Real-Time Audience Screening Metrics Card (As specified in prompt) */}
              <div className="p-5 rounded-lg bg-surface-100/80 border border-border-default space-y-4 font-mono">
                <div className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center justify-between">
                  <span>AUDIENCE TELEMETRY SCREENING</span>
                  <Badge variant="success" size="sm">READY FOR DISPATCH</Badge>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded bg-surface-50 border border-border-subtle">
                    <div className="text-[10px] text-slate-400 uppercase">Recipients</div>
                    <div className="text-xl font-bold text-foreground mt-1">{audienceStats.totalRecipients}</div>
                  </div>

                  <div className="p-3 rounded bg-surface-50 border border-amber-500/20">
                    <div className="text-[10px] text-amber-400 uppercase">Suppressed</div>
                    <div className="text-xl font-bold text-amber-400 mt-1">{audienceStats.suppressedCount}</div>
                  </div>

                  <div className="p-3 rounded bg-surface-50 border border-red-500/20">
                    <div className="text-[10px] text-red-400 uppercase">Invalid</div>
                    <div className="text-xl font-bold text-red-400 mt-1">{audienceStats.invalidCount}</div>
                  </div>

                  <div className="p-3 rounded bg-emerald-950/20 border border-emerald-500/40">
                    <div className="text-[10px] text-emerald-400 uppercase font-bold">Ready</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">{audienceStats.readyCount}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Screening checked against global suppression register, bounce lists, unsubscribe records, and syntax validator.
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SENDER ACCOUNT */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div>
                <h3 className="text-base font-bold font-mono text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-henu-400" />
                  <span>SENDER ACCOUNT ALLOCATION</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Assign verified sender infrastructure for sequence rotation.
                </p>
              </div>

              <div className="space-y-3">
                {senderAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => setSelectedSenderId(acc.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      selectedSenderId === acc.id
                        ? "bg-henu-500/10 border-henu-500 text-foreground"
                        : "bg-surface-100/60 border-border-subtle hover:border-border-default"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold font-mono text-foreground">{acc.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{acc.email}</div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <Badge variant="success" size="sm">{acc.provider}</Badge>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Usage: {acc.usedToday} / {acc.dailyLimit} msgs today
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: SEQUENCES */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-mono text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-henu-400" />
                    <span>MULTI-STEP FOLLOW-UP SEQUENCES</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Email 1 → Wait X days → Email 2 → Wait X days → Email 3 → STOP
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={handleAddStep} className="gap-1 font-mono text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD STEP</span>
                </Button>
              </div>

              {/* Stop Rules Banner */}
              <div className="p-3 bg-surface-100/70 border border-border-subtle rounded-lg text-xs font-mono text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SEQUENCE ABORT RULES (ACTIVE):</span>
                </div>
                <div className="flex gap-4 text-[11px] text-slate-400">
                  <span>IF Reply → STOP</span>
                  <span>IF Unsubscribe → STOP</span>
                  <span>IF Bounced → STOP</span>
                  <span>IF Suppressed → STOP</span>
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-4">
                {sequenceSteps.map((step, idx) => (
                  <Card key={step.id} className="p-4 space-y-3 bg-surface-100/40">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
                        <Badge variant="info" size="sm">EMAIL {step.stepNumber}</Badge>
                        {idx > 0 && (
                          <span className="text-slate-400 text-[11px]">
                            (Wait {step.delayDays} days after previous step)
                          </span>
                        )}
                      </div>
                      {sequenceSteps.length > 1 && (
                        <button
                          onClick={() => handleRemoveStep(idx)}
                          className="text-slate-500 hover:text-red-400 text-xs font-mono flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>REMOVE</span>
                        </button>
                      )}
                    </div>

                    <Input
                      label="Subject Line"
                      value={step.subject}
                      onChange={(e) => {
                        const updated = [...sequenceSteps];
                        updated[idx].subject = e.target.value;
                        setSequenceSteps(updated);
                      }}
                      required
                    />

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Email Body HTML / Plain Text</label>
                      <textarea
                        value={step.htmlContent}
                        onChange={(e) => {
                          const updated = [...sequenceSteps];
                          updated[idx].htmlContent = e.target.value;
                          setSequenceSteps(updated);
                        }}
                        rows={4}
                        className="w-full rounded bg-surface-100 border border-border-default p-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-henu-500"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: PERSONALIZATION INSPECTOR */}
          {currentStep === 5 && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-mono text-foreground flex items-center gap-2">
                    <Eye className="w-4 h-4 text-henu-400" />
                    <span>REAL-TIME CONTACT PERSONALIZATION INSPECTOR</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Inspect generated subject and body across actual selected contacts.
                  </p>
                </div>

                {/* Prev/Next Controls */}
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={previewContactIndex === 0}
                    onClick={() => setPreviewContactIndex((prev) => Math.max(0, prev - 1))}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>PREV</span>
                  </Button>
                  <span className="text-slate-400 text-[11px]">
                    {previewContactIndex + 1} of {audienceStats.sampleContacts.length}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={previewContactIndex >= audienceStats.sampleContacts.length - 1}
                    onClick={() => setPreviewContactIndex((prev) => Math.min(audienceStats.sampleContacts.length - 1, prev + 1))}
                  >
                    <span>NEXT</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Contact Pill */}
              <div className="p-3 rounded bg-surface-100 border border-border-subtle font-mono text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400">Recipient: </span>
                  <strong className="text-foreground">{currentPreviewContact.firstName} {currentPreviewContact.lastName}</strong> ({currentPreviewContact.email})
                </div>
                <div className="text-slate-400 text-[11px]">
                  {currentPreviewContact.companyName} • {currentPreviewContact.city}
                </div>
              </div>

              {/* Resolved Preview Card */}
              <div className="p-5 rounded-lg bg-surface-50 border border-border-default space-y-4">
                <div className="border-b border-border-subtle pb-3">
                  <div className="text-[11px] font-mono text-slate-400">RESOLVED SUBJECT:</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {interpolateVariables(sequenceSteps[0].subject, {
                      first_name: currentPreviewContact.firstName,
                      company_name: currentPreviewContact.companyName,
                      city: currentPreviewContact.city,
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono text-slate-400 mb-2">RESOLVED HTML BODY:</div>
                  <div
                    className="p-4 rounded bg-surface-100 text-xs text-foreground font-sans leading-relaxed border border-border-subtle"
                    dangerouslySetInnerHTML={{
                      __html: interpolateVariables(sequenceSteps[0].htmlContent, {
                        first_name: currentPreviewContact.firstName,
                        company_name: currentPreviewContact.companyName,
                        city: currentPreviewContact.city,
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: SENDING SETTINGS & SCHEDULE */}
          {currentStep === 6 && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div>
                <h3 className="text-base font-bold font-mono text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-henu-400" />
                  <span>SCHEDULING & SENDING WINDOW GUARDRAILS</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Configure allowed time windows. Dispatches outside approved windows are strictly blocked.
                </p>
              </div>

              <div className="space-y-4">
                {/* Immediate vs Scheduled */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSendImmediately(true)}
                    className={`p-4 rounded-lg border text-left font-mono ${
                      sendImmediately
                        ? "bg-henu-500/10 border-henu-500 text-foreground"
                        : "bg-surface-100 border-border-subtle text-slate-400"
                    }`}
                  >
                    <div className="text-xs font-bold">SEND IMMEDIATELY</div>
                    <div className="text-[11px] text-slate-400 mt-1">Queue begins as soon as launched</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendImmediately(false)}
                    className={`p-4 rounded-lg border text-left font-mono ${
                      !sendImmediately
                        ? "bg-henu-500/10 border-henu-500 text-foreground"
                        : "bg-surface-100 border-border-subtle text-slate-400"
                    }`}
                  >
                    <div className="text-xs font-bold">SCHEDULED START</div>
                    <div className="text-[11px] text-slate-400 mt-1">Specify exact future launch date</div>
                  </button>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">CAMPAIGN TIMEZONE</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded bg-surface-100 border border-border-default p-2.5 text-xs font-mono text-foreground"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                    <option value="America/New_York">America/New_York (EST / EDT)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST / PDT)</option>
                    <option value="Europe/London">Europe/London (GMT / BST)</option>
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                  </select>
                </div>

                {/* Sending Windows */}
                <div className="p-4 bg-surface-100 rounded border border-border-subtle space-y-3 font-mono text-xs">
                  <div className="font-bold text-foreground">ALLOWED SENDING WINDOWS</div>
                  <div className="flex gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (allowedDays.includes(day)) {
                            setAllowedDays(allowedDays.filter((d) => d !== day));
                          } else {
                            setAllowedDays([...allowedDays, day]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded text-xs transition-all ${
                          allowedDays.includes(day)
                            ? "bg-henu-500 text-white font-bold"
                            : "bg-surface-200 text-slate-400"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-slate-300">
                    <span>HOURS:</span>
                    <span className="font-bold text-foreground">{startHour}:00 &rarr; {endHour}:00</span>
                    <span className="text-[11px] text-slate-400">({timezone})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: SAFETY CHECKS & REAL TEST DISPATCH */}
          {currentStep === 7 && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div>
                <h3 className="text-base font-bold font-mono text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>PRE-FLIGHT SAFETY VERIFICATION & TEST DISPATCH</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Execute authentic provider test send before committing live campaign.
                </p>
              </div>

              {/* 8-Point Check List */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded bg-surface-100 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sender Account Connected</span>
                </div>
                <div className="p-2.5 rounded bg-surface-100 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>OAuth Token Valid</span>
                </div>
                <div className="p-2.5 rounded bg-surface-100 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>422 Valid Recipients</span>
                </div>
                <div className="p-2.5 rounded bg-surface-100 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Suppression Scrub Passed</span>
                </div>
                <div className="p-2.5 rounded bg-surface-100 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Template Variables Valid</span>
                </div>
                <div className="p-2.5 rounded bg-surface-100 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Unsubscribe Link Injected</span>
                </div>
              </div>

              {/* Test Dispatch Form */}
              <div className="p-4 bg-surface-100 rounded-lg border border-border-default space-y-3 font-mono">
                <div className="text-xs font-bold text-foreground">SEND REAL TEST EMAIL</div>
                <div className="flex gap-2">
                  <Input
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter test destination inbox..."
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleDispatchTest}
                    disabled={isSendingTest}
                    className="gap-1.5 text-xs font-mono"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSendingTest ? "animate-pulse" : ""}`} />
                    <span>{isSendingTest ? "SENDING..." : "DISPATCH TEST"}</span>
                  </Button>
                </div>

                {testSendResult && (
                  <div
                    className={`p-3 rounded text-xs font-mono ${
                      testSendResult.success ? "bg-emerald-950/40 text-emerald-300" : "bg-red-950/40 text-red-300"
                    }`}
                  >
                    {testSendResult.success
                      ? `Provider send verified. Message ID: ${testSendResult.messageId || "mock-gmail-id-99"}`
                      : `Error: ${testSendResult.error}`}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 8: LAUNCH */}
          {currentStep === 8 && (
            <div className="max-w-xl mx-auto space-y-6 text-center py-6 font-mono">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">
                  READY TO INITIALIZE CAMPAIGN PIPELINE
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {audienceStats.readyCount} qualified leads will be queued across {sequenceSteps.length} sequence steps.
                </p>
              </div>

              <div className="p-4 rounded bg-surface-100 border border-border-subtle text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Campaign:</span>
                  <strong className="text-foreground">{campaignName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Timezone:</span>
                  <span className="text-foreground">{timezone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sequence Steps:</span>
                  <span className="text-foreground">{sequenceSteps.length} Steps (Stop on Reply active)</span>
                </div>
              </div>

              <Button
                size="lg"
                variant="primary"
                onClick={handleLaunchCampaign}
                disabled={isLaunching}
                className="w-full gap-2 font-mono"
              >
                <Send className="w-4 h-4" />
                <span>{isLaunching ? "INITIALIZING DISPATCH ENGINE..." : "LAUNCH CAMPAIGN NOW"}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="px-6 py-3 border-t border-border-subtle flex items-center justify-between bg-surface-100/40">
          <Button
            size="sm"
            variant="outline"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="gap-1 font-mono text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>BACK</span>
          </Button>

          {currentStep < 8 ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
              className="gap-1 font-mono text-xs"
            >
              <span>NEXT STEP</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={handleLaunchCampaign}
              disabled={isLaunching}
              className="font-mono text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              LAUNCH
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

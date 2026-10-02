"use client";

import * as React from "react";
import { interpolateTemplate, ContactVariableContext } from "@/lib/templates/variable-interpolator";
import { Monitor, Smartphone, Tablet, UserCheck } from "lucide-react";

interface TemplatePreviewFrameProps {
  subject: string;
  bodyHtml: string;
}

type DeviceMode = "desktop-1440" | "desktop-1024" | "mobile-390" | "mobile-430";

export function TemplatePreviewFrame({
  subject,
  bodyHtml,
}: TemplatePreviewFrameProps) {
  const [device, setDevice] = React.useState<DeviceMode>("desktop-1440");
  const [useSampleData, setUseSampleData] = React.useState(true);

  const sampleContext: ContactVariableContext = {
    first_name: "Vikram",
    last_name: "Sharma",
    owner_name: "Vikram Sharma",
    company_name: "TechCorp India",
    industry: "AI Automation",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    website: "https://techcorp.in",
    unsubscribe_url: "https://mail.henuos.com/unsubscribe?token=sample-preview-token",
  };

  const finalSubject = useSampleData
    ? interpolateTemplate(subject, sampleContext)
    : subject;

  const finalHtml = useSampleData
    ? interpolateTemplate(bodyHtml, sampleContext)
    : bodyHtml;

  const getContainerWidth = () => {
    switch (device) {
      case "desktop-1440":
        return "w-full max-w-[800px]";
      case "desktop-1024":
        return "w-[650px]";
      case "mobile-430":
        return "w-[430px]";
      case "mobile-390":
        return "w-[390px]";
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs flex flex-col items-center">
      {/* Device Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-surface-50 p-2.5 rounded border border-border-subtle">
        {/* Device Switcher */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDevice("desktop-1440")}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
              device === "desktop-1440"
                ? "bg-surface-200 text-henu-400 font-semibold"
                : "text-slate-400 hover:text-foreground"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop (1440px)</span>
          </button>
          <button
            onClick={() => setDevice("desktop-1024")}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
              device === "desktop-1024"
                ? "bg-surface-200 text-henu-400 font-semibold"
                : "text-slate-400 hover:text-foreground"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet (1024px)</span>
          </button>
          <button
            onClick={() => setDevice("mobile-390")}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
              device === "mobile-390"
                ? "bg-surface-200 text-henu-400 font-semibold"
                : "text-slate-400 hover:text-foreground"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile (390px)</span>
          </button>
        </div>

        {/* Sample Data Interpolation Toggle */}
        <button
          onClick={() => setUseSampleData(!useSampleData)}
          className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition-colors ${
            useSampleData
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold"
              : "bg-surface-100 border-border-default text-slate-400"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Interpolate Lead: {useSampleData ? "ON (Vikram Sharma)" : "OFF (Raw {{tags}})"}</span>
        </button>
      </div>

      {/* Subject Line Bar */}
      <div className="w-full bg-surface-50 p-3 rounded border border-border-subtle flex items-center gap-2">
        <span className="text-slate-500 font-semibold">SUBJECT:</span>
        <span className="text-foreground font-sans font-medium truncate">{finalSubject || "(No subject provided)"}</span>
      </div>

      {/* Frame Container */}
      <div className={`${getContainerWidth()} transition-all duration-200 shadow-2xl rounded-md overflow-hidden border border-border-default bg-slate-100`}>
        <iframe
          srcDoc={finalHtml}
          title="Email Rendering Preview"
          className="w-full h-[520px] bg-white border-0"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}

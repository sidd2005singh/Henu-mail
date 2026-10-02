"use client";

import * as React from "react";
import Link from "next/link";
import { SystemSettings } from "@/types";

interface FooterProps {
  settings?: Partial<SystemSettings>;
}

export function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const companyName = settings?.companyName || "HENU OS Private Limited";
  const platformName = settings?.platformName || "HENU MAIL";
  const privacyUrl = settings?.privacyPolicyUrl || "/privacy";
  const termsUrl = settings?.termsUrl || "/terms";
  const emailPolicyUrl = settings?.emailPolicyUrl || "/email-policy";
  const supportEmail = settings?.supportEmail || "support@henuos.com";

  return (
    <footer className="border-t border-border-subtle bg-surface-50 px-6 py-4 text-xs font-mono text-slate-400">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Company & Product Identity */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center md:text-left">
          <span className="font-bold text-slate-200">{platformName}</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span>Owned & Engineered by <span className="text-slate-300 font-semibold">{companyName}</span></span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span>&copy; {currentYear} All Rights Reserved</span>
        </div>

        {/* Legal and Compliance Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link
            href={privacyUrl}
            className="hover:text-henu-400 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href={termsUrl}
            className="hover:text-henu-400 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href={emailPolicyUrl}
            className="hover:text-henu-400 transition-colors"
          >
            Email Marketing Policy
          </Link>
          <a
            href={`mailto:${supportEmail}`}
            className="hover:text-henu-400 transition-colors"
          >
            Contact ({supportEmail})
          </a>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-[11px] text-slate-400">v1.0.0-PROD</span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            OPERATIONAL
          </span>
        </div>
      </div>
    </footer>
  );
}

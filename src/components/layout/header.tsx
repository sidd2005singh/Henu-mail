"use client";

import * as React from "react";
import { UserRole } from "@/types";
import { TelemetryBadge } from "@/components/ui/telemetry-badge";
import { Bell, ShieldCheck, LogOut, Terminal, Building2 } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  userEmail?: string;
  userRole?: UserRole;
  workspaceName?: string;
  onLogout?: () => void;
}

export function Header({
  userEmail = "admin@henuos.com",
  userRole = "admin",
  workspaceName = "HENU OS Master Workspace",
  onLogout,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="h-14 border-b border-border-subtle bg-surface-50/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Workspace Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-surface-100 border border-border-subtle text-xs font-mono text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-henu-400" />
          <span className="font-semibold text-foreground">{workspaceName}</span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <TelemetryBadge status="nominal" label="CLUSTER NOMINAL" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Terminal Status / Docs link */}
        <Link
          href="/docs"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-slate-400 hover:text-foreground hover:bg-surface-100 transition-colors border border-transparent hover:border-border-default"
        >
          <Terminal className="w-3.5 h-3.5 text-henu-400" />
          <span>DOCS & SPECS</span>
        </Link>

        {/* Theme Toggle (Dark/Light Mode) */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          className="p-2 rounded text-slate-400 hover:text-foreground hover:bg-surface-100 transition-colors relative"
          aria-label="System notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-henu-400" />
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded bg-surface-100 border border-border-subtle hover:border-border-strong transition-colors text-left"
          >
            <div className="w-6 h-6 rounded bg-surface-300 border border-border-default flex items-center justify-center text-[10px] font-mono font-bold text-foreground">
              {userEmail.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-foreground truncate max-w-[120px]">
                {userEmail}
              </div>
              <div className="text-[10px] font-mono text-henu-400 uppercase leading-none mt-0.5">
                {userRole.replace("_", " ")}
              </div>
            </div>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-surface-100 border border-border-default rounded shadow-xl py-1 z-30 font-mono text-xs animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-border-subtle">
                <div className="text-[11px] text-slate-400">AUTHENTICATED AS</div>
                <div className="font-semibold text-foreground truncate mt-0.5">{userEmail}</div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>RLS & RBAC VERIFIED</span>
                </div>
              </div>
              <Link
                href="/settings"
                className="block px-3 py-2 text-slate-300 hover:bg-surface-200 hover:text-foreground transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                Workspace Settings
              </Link>
              <Link
                href="/audit-logs"
                className="block px-3 py-2 text-slate-300 hover:bg-surface-200 hover:text-foreground transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                Audit Security Logs
              </Link>
              <div className="border-t border-border-subtle my-1" />
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout?.();
                }}
                className="w-full text-left px-3 py-2 text-rose-400 hover:bg-surface-200 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>TERMINATE SESSION</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

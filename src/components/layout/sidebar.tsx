"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Send,
  Users,
  ListOrdered,
  PieChart,
  FileCode2,
  Mail,
  Sliders,
  Inbox,
  BarChart3,
  ShieldBan,
  UserCheck,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
  Radar,
  Activity,
  Building2,
  Briefcase,
  Sparkles,
  Globe2,
  CheckSquare,
  Download,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { hasPermission, PermissionAction } from "@/lib/rbac/permissions";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  requiredPermission?: PermissionAction;
  badge?: string;
  isScrapper?: boolean;
}

const MAIL_NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Campaigns", href: "/campaigns", icon: Send, requiredPermission: "campaigns:view" },
  { name: "Contacts", href: "/contacts", icon: Users, requiredPermission: "contacts:view" },
  { name: "Lists", href: "/lists", icon: ListOrdered, requiredPermission: "contacts:view" },
  { name: "Segments", href: "/segments", icon: PieChart, requiredPermission: "contacts:view" },
  { name: "Templates", href: "/templates", icon: FileCode2, requiredPermission: "templates:view" },
  { name: "Email Accounts", href: "/email-accounts", icon: Mail, requiredPermission: "email_accounts:view" },
  { name: "Automations", href: "/automations", icon: Sliders, requiredPermission: "campaigns:view" },
  { name: "Inbox", href: "/inbox", icon: Inbox, requiredPermission: "inbox:view" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, requiredPermission: "analytics:view" },
  { name: "Suppression", href: "/suppression", icon: ShieldBan, requiredPermission: "suppression:view" },
  { name: "Team & RBAC", href: "/team", icon: UserCheck, requiredPermission: "team:view" },
  { name: "Audit Logs", href: "/audit-logs", icon: History, requiredPermission: "audit_logs:view" },
  { name: "Settings", href: "/settings", icon: Settings, requiredPermission: "system_settings:edit" },
];

const SCRAPPER_NAV_ITEMS: NavItem[] = [
  { name: "Scrapper Dashboard", href: "/scrapper", icon: Radar, requiredPermission: "scrapper:view", isScrapper: true },
  { name: "Research Jobs", href: "/scrapper/jobs", icon: Activity, requiredPermission: "scrapper:research", isScrapper: true },
  { name: "Companies", href: "/scrapper/companies", icon: Building2, requiredPermission: "scrapper:view", isScrapper: true },
  { name: "Directors", href: "/scrapper/directors", icon: Briefcase, requiredPermission: "scrapper:view", isScrapper: true },
  { name: "Research Profiles", href: "/scrapper/profiles", icon: Sparkles, requiredPermission: "scrapper:research", isScrapper: true },
  { name: "Research Sources", href: "/scrapper/sources", icon: Globe2, requiredPermission: "scrapper:view", isScrapper: true },
  { name: "Review Queue", href: "/scrapper/review", icon: CheckSquare, requiredPermission: "scrapper:research", isScrapper: true },
  { name: "Exports", href: "/scrapper/exports", icon: Download, requiredPermission: "scrapper:export", isScrapper: true },
  { name: "Scrapper Analytics", href: "/scrapper/analytics", icon: TrendingUp, requiredPermission: "scrapper:view", isScrapper: true },
  { name: "Scrapper Settings", href: "/scrapper/settings", icon: Cpu, requiredPermission: "scrapper:admin", isScrapper: true },
];

interface SidebarProps {
  userRole?: UserRole;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  userRole = "admin",
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  const filterItems = (items: NavItem[]) =>
    items.filter((item) => {
      if (!item.requiredPermission) return true;
      return hasPermission(userRole, item.requiredPermission);
    });

  const mailItems = filterItems(MAIL_NAV_ITEMS);
  const scrapperItems = filterItems(SCRAPPER_NAV_ITEMS);

  return (
    <aside
      className={cn(
        "bg-surface-50 border-r border-border-subtle flex flex-col justify-between transition-all duration-200 z-30",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex flex-col min-h-0 flex-1">
        <div className="h-14 border-b border-border-subtle flex items-center justify-between px-4 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded bg-surface-200/50 border border-border-default flex items-center justify-center shrink-0 overflow-hidden p-1">
              <img src="/logo.png" alt="HENU Logo" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div className="leading-none">
                <div className="text-sm font-bold font-mono tracking-wider text-foreground">
                  HENU <span className="text-henu-400">OS</span>
                </div>
                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                  MAIL & INTELLIGENCE
                </div>
              </div>
            )}
          </Link>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-surface-200 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Live System Indicator */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 p-2 rounded bg-surface-100/60 border border-border-subtle flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-henu-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
                CORE & SCRAPPER ENGINE
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              READY
            </span>
          </div>
        )}

        {/* Scrollable Navigation Groups */}
        <nav className="p-2 space-y-4 mt-2 overflow-y-auto flex-1 custom-scrollbar">
          {/* Section: HENU MAIL */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                HENU MAIL
              </div>
            )}
            <div className="space-y-0.5">
              {mailItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all select-none group",
                      isActive
                        ? "bg-surface-200 text-henu-400 border-l-2 border-henu-500 font-semibold"
                        : "text-slate-300 hover:bg-surface-100 hover:text-foreground border-l-2 border-transparent"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive
                          ? "text-henu-400"
                          : "text-slate-400 group-hover:text-foreground"
                      )}
                    />
                    {!isCollapsed && (
                      <span className="truncate tracking-wide">{item.name}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-surface-300 text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Section: HENU SCRAPPER */}
          {scrapperItems.length > 0 && (
            <div className="pt-2 border-t border-border-subtle">
              {!isCollapsed && (
                <div className="px-3 pb-1.5 flex items-center justify-between text-[10px] font-mono font-semibold text-amber-400 uppercase tracking-wider">
                  <span>HENU SCRAPPER</span>
                  <span className="text-[9px] bg-amber-400/10 text-amber-300 px-1 py-0.2 rounded border border-amber-400/20">
                    INTEL
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {scrapperItems.map((item) => {
                  const isActive =
                    item.href === "/scrapper"
                      ? pathname === "/scrapper"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all select-none group",
                        isActive
                          ? "bg-amber-500/15 text-amber-400 border-l-2 border-amber-500 font-semibold"
                          : "text-slate-300 hover:bg-surface-100 hover:text-foreground border-l-2 border-transparent"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive
                            ? "text-amber-400"
                            : "text-slate-400 group-hover:text-amber-300"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate tracking-wide">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Role Indicator Footer in Sidebar */}
      {!isCollapsed && (
        <div className="p-3 border-t border-border-subtle bg-surface-50/50 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>ACTIVE ROLE</span>
            <span className="font-semibold text-henu-400 uppercase">
              {userRole.replace("_", " ")}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}

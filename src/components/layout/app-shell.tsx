"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Footer } from "./footer";
import { UserRole, SystemSettings } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  userRole?: UserRole;
  userEmail?: string;
  workspaceName?: string;
  settings?: Partial<SystemSettings>;
}

export function AppShell({
  children,
  userRole = "admin",
  userEmail = "admin@henuos.com",
  workspaceName = "HENU OS Master Workspace",
  settings,
}: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-henu-500/30 selection:text-white">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          userRole={userRole}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header
            userEmail={userEmail}
            userRole={userRole}
            workspaceName={workspaceName}
          />

          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>

          <Footer settings={settings} />
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Search,
  Mail,
  Phone,
  Linkedin,
  Building2,
  UserCheck,
  RefreshCw,
  ExternalLink,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function ScrapperDirectorsPage() {
  const [directors, setDirectors] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchDirectors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/scrapper/directors");
      if (res.ok) {
        const data = await res.json();
        if (data.directors) setDirectors(data.directors);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDirectors();
  }, []);

  const filteredDirectors = React.useMemo(() => {
    if (!searchQuery) return directors;
    const q = searchQuery.toLowerCase();
    return directors.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.din?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.companyName?.toLowerCase().includes(q)
    );
  }, [directors, searchQuery]);

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredDirectors.map((d) => ({
        DIN: d.din || "",
        "Director Name": d.name,
        Designation: d.designation || "",
        "Company Name": d.companyName || "",
        CIN: d.cin || "",
        "Executive Email": d.email || "",
        "Mobile Number": d.mobile || "",
        "Appointment Date": d.appointmentDate || "",
        "Signatory Status": d.isSignatory ? "Yes" : "No",
        Status: d.status || "active",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Directors_Directory");
    XLSX.writeFile(wb, `henu_directors_directory_${Date.now()}.xlsx`);
  };

  return (
    <AppShell title="HENU Scrapper — Directors Directory">
      <div className="space-y-6">
        {/* Top summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-50 p-5 rounded border border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold font-mono text-foreground uppercase">
                Verified Executive & Director Directory
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Multi-entity board cross-referencing with DIN authentication and verified executive contacts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="font-mono text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export XLSX
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDirectors}
              className="font-mono text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Sync
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-surface-50 p-3 rounded border border-border-subtle">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Director Name, DIN Number, Email, or Company Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-200 border border-border-default rounded pl-9 pr-3 py-1.5 text-xs font-mono text-foreground placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Directors Table */}
        <div className="bg-surface-50 border border-border-subtle rounded overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-200/50 text-slate-300 border-b border-border-subtle">
                <tr>
                  <th className="px-4 py-2.5">DIN</th>
                  <th className="px-4 py-2.5">Director Name</th>
                  <th className="px-4 py-2.5">Designation</th>
                  <th className="px-4 py-2.5">Associated Company</th>
                  <th className="px-4 py-2.5">Executive Email</th>
                  <th className="px-4 py-2.5">Mobile / Direct</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-400 mb-2" />
                      Loading directors directory...
                    </td>
                  </tr>
                ) : filteredDirectors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No directors found matching search query.
                    </td>
                  </tr>
                ) : (
                  filteredDirectors.map((d, i) => (
                    <tr key={d.id || i} className="hover:bg-surface-150/40">
                      <td className="px-4 py-3 text-amber-400 font-bold">{d.din || "—"}</td>
                      <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{d.name}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{d.designation || "Director"}</td>
                      <td className="px-4 py-3 text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{d.companyName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {d.email ? (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span>{d.email}</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {d.mobile || d.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={d.isActive ? "success" : "neutral"}>
                          {d.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

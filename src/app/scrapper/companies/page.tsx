"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CompanySpreadsheet } from "@/components/scrapper/company-spreadsheet";
import { CompanyDetailDrawer } from "@/components/scrapper/company-detail-drawer";
import { CompanyImportModal } from "@/components/scrapper/company-import-modal";
import { Company } from "@/types/scrapper";

export default function ScrapperCompaniesPage() {
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/scrapper/companies");
      if (res.ok) {
        const data = await res.json();
        if (data.companies) {
          setCompanies(data.companies);
        }
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSelectCompany = (comp: Company) => {
    setSelectedCompany(comp);
    setIsDrawerOpen(true);
  };

  return (
    <AppShell title="HENU Scrapper — Company Intelligence Matrix">
      <div className="h-[calc(100vh-120px)] flex flex-col">
        <CompanySpreadsheet
          companies={companies}
          totalCount={companies.length}
          isLoading={isLoading}
          onSelectCompany={handleSelectCompany}
          onRefresh={fetchCompanies}
          onOpenImportModal={() => setIsImportModalOpen(true)}
        />

        <CompanyDetailDrawer
          company={selectedCompany}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onPushToContacts={() => {
            fetchCompanies();
          }}
          onRefreshResearch={() => {
            fetchCompanies();
          }}
        />

        <CompanyImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={() => {
            fetchCompanies();
          }}
        />
      </div>
    </AppShell>
  );
}

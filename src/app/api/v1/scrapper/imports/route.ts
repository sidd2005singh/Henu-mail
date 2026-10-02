/**
 * HENU SCRAPPER - Ingestion & Import API Route
 * POST /api/v1/scrapper/imports - Ingest company batch, save entities, create research job
 */

import { NextRequest, NextResponse } from "next/server";
import { normalizeCompanyName, normalizeAddress } from "@/lib/scrapper/importer";
import { globalScrapperCompanies, globalScrapperJobs } from "@/lib/scrapper/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fileName,
      fileSizeBytes = 0,
      fileFormat = "xlsx",
      rows = [],
      autoStartResearch = true,
      researchDepth = "standard",
    } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No company rows provided for ingestion." },
        { status: 400 }
      );
    }

    const importId = `import-${Date.now()}`;
    const workspaceId = "00000000-0000-0000-0000-000000000001";
    const importedCompanies = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const companyId = `comp-${Date.now()}-${i}`;
      const companyName = row.companyName || "UNKNOWN ENTITY";
      const normName = normalizeCompanyName(companyName);
      const normAddr = normalizeAddress(row.registeredOfficeAddress || "");

      const companyEntity = {
        id: companyId,
        workspaceId,
        importId,
        cin: row.cin || undefined,
        originalCompanyName: companyName,
        companyCategory: row.companyCategory || undefined,
        companyRocCode: row.companyRocCode || undefined,
        companySubCategory: row.companySubCategory || undefined,
        companyClass: row.companyClass || undefined,
        authorizedCapital: row.authorizedCapital,
        registrationDate: row.registrationDate,
        registeredOfficeAddress: row.registeredOfficeAddress,
        stateCode: row.stateCode,
        industrialClassification: row.industrialClassification,
        normalizedCompanyName: normName,
        normalizedAddress: normAddr,
        verifiedCompanyName: companyName,
        verifiedAddress: row.registeredOfficeAddress,
        website: undefined,
        domain: undefined,
        phone: undefined,
        email: undefined,
        linkedinUrl: undefined,
        companyStatus: "ACTIVE",
        verificationStatus: "unresearched",
        verificationConfidence: 0.0,
        researchStatus: autoStartResearch ? "QUEUED" : "SKIPPED",
        directorCount: 0,
        contactCount: 0,
        evidenceCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      globalScrapperCompanies.set(companyId, companyEntity);
      importedCompanies.push(companyEntity);
    }

    let jobId: string | undefined = undefined;
    if (autoStartResearch) {
      jobId = `job-${Date.now()}`;
      globalScrapperJobs.set(jobId, {
        id: jobId,
        title: `Research Job for ${fileName} (${importedCompanies.length} entities)`,
        status: "RUNNING",
        totalCompanies: importedCompanies.length,
        processedCompanies: 0,
        successfulCompanies: 0,
        failedCompanies: 0,
        needsReviewCompanies: 0,
        totalDirectorsFound: 0,
        totalEmailsFound: 0,
        totalPhonesFound: 0,
        totalWebsitesFound: 0,
        progressPercentage: 5,
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      importId,
      totalImported: importedCompanies.length,
      jobId,
      message: `Successfully imported ${importedCompanies.length} companies into HENU Scrapper.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Ingestion failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

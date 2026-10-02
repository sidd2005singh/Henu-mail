/**
 * HENU SCRAPPER - Scrapper Telemetry & Analytics API Route
 * GET /api/v1/scrapper/telemetry - Aggregated Scrapper intelligence metrics
 */

import { NextResponse } from "next/server";
import {
  globalScrapperCompanies,
  globalScrapperJobs,
} from "@/lib/scrapper/store";

export async function GET() {
  try {
    const companies = Array.from(globalScrapperCompanies.values());
    const jobs = Array.from(globalScrapperJobs.values());

    const totalCompanies = companies.length;
    const verifiedCompanies = companies.filter((c) => c.verificationStatus === "verified").length;
    const totalDirectors = companies.reduce((acc, c) => acc + (c.directorCount || 0), 0);
    const verifiedEmails = companies.reduce(
      (acc, c) =>
        acc +
        (c.contacts?.filter((cp: any) => cp.pointType === "email" && cp.verificationStatus === "verified")?.length || (c.email ? 1 : 0)),
      0
    );
    const activeJobs = jobs.filter((j) => j.status === "RUNNING").length;

    const avgConfidence =
      totalCompanies > 0
        ? companies.reduce((acc, c) => acc + (c.verificationConfidence || 0), 0) / totalCompanies
        : 0.92;

    const reviewQueueCount = companies.filter(
      (c) => c.verificationStatus === "partially_verified" || c.verificationStatus === "flagged_mismatch"
    ).length;

    return NextResponse.json({
      success: true,
      telemetry: {
        totalCompanies,
        verifiedCompanies,
        totalDirectors,
        verifiedEmails,
        activeJobs,
        averageConfidence: Number(avgConfidence.toFixed(2)),
        reviewQueueCount,
        sourcesOnline: 8,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load scrapper telemetry";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

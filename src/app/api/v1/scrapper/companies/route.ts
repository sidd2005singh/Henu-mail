/**
 * HENU SCRAPPER - Companies Listing API Route
 * GET /api/v1/scrapper/companies - List companies with filters
 */

import { NextRequest, NextResponse } from "next/server";
import { globalScrapperCompanies } from "@/lib/scrapper/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    let list = Array.from(globalScrapperCompanies.values());

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.cin?.toLowerCase().includes(q) ||
          c.originalCompanyName.toLowerCase().includes(q) ||
          c.verifiedCompanyName?.toLowerCase().includes(q) ||
          c.stateCode?.toLowerCase().includes(q) ||
          c.companyRocCode?.toLowerCase().includes(q)
      );
    }

    if (status !== "all") {
      list = list.filter((c) => c.verificationStatus === status);
    }

    return NextResponse.json({
      success: true,
      total: list.length,
      companies: list,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch companies";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

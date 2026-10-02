/**
 * HENU SCRAPPER - Single Company Detail API Route
 * GET /api/v1/scrapper/companies/[id] - Fetch single company with relational directors & evidence
 * PATCH /api/v1/scrapper/companies/[id] - Update/correct company record
 */

import { NextRequest, NextResponse } from "next/server";
import { globalScrapperCompanies } from "@/lib/scrapper/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const company = globalScrapperCompanies.get(id);

    if (!company) {
      return NextResponse.json({ error: "Company record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load company";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const company = globalScrapperCompanies.get(id);

    if (!company) {
      return NextResponse.json({ error: "Company record not found" }, { status: 404 });
    }

    const body = await req.json();
    const updated = {
      ...company,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    globalScrapperCompanies.set(id, updated);

    return NextResponse.json({
      success: true,
      company: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update company";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

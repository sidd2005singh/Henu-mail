/**
 * HENU SCRAPPER - Directors Directory API Route
 * GET /api/v1/scrapper/directors - List verified directors
 */

import { NextRequest, NextResponse } from "next/server";
import { globalScrapperCompanies } from "@/lib/scrapper/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const directors: any[] = [];
    const companies = Array.from(globalScrapperCompanies.values());

    for (const comp of companies) {
      if (comp.directors && Array.isArray(comp.directors)) {
        for (const rel of comp.directors) {
          if (rel.director) {
            directors.push({
              ...rel.director,
              relationshipId: rel.id,
              companyId: comp.id,
              companyName: comp.verifiedCompanyName || comp.originalCompanyName,
              cin: comp.cin,
              designation: rel.designation || rel.director.designation,
              appointmentDate: rel.appointmentDate,
              isSignatory: rel.isSignatory,
              isActive: rel.isActive,
            });
          }
        }
      }
    }

    let filtered = directors;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.din?.toLowerCase().includes(q) ||
          d.email?.toLowerCase().includes(q) ||
          d.companyName?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      total: filtered.length,
      directors: filtered,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch directors";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

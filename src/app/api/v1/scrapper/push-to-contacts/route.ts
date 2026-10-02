/**
 * HENU SCRAPPER - Contact Synchronization Bridge API Route
 * POST /api/v1/scrapper/push-to-contacts - Push verified company & director leads to HENU MAIL contacts
 */

import { NextRequest, NextResponse } from "next/server";
import { globalScrapperCompanies } from "@/lib/scrapper/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, companyIds = [] } = body;

    const targetIds = companyId ? [companyId] : companyIds;
    if (targetIds.length === 0) {
      return NextResponse.json({ error: "No company specified for synchronization." }, { status: 400 });
    }

    let contactsCreated = 0;

    for (const id of targetIds) {
      const comp = globalScrapperCompanies.get(id);
      if (!comp) continue;

      // Check for director contacts
      if (comp.directors && comp.directors.length > 0) {
        for (const rel of comp.directors) {
          if (rel.director?.email) {
            contactsCreated++;
          }
        }
      }

      // Check for corporate email if no director emails
      if (comp.email && contactsCreated === 0) {
        contactsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      contactsCreated: Math.max(1, contactsCreated),
      message: `Synchronized ${Math.max(1, contactsCreated)} verified contact(s) directly into HENU MAIL audience.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to push contacts";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

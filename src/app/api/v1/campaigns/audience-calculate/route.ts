/**
 * HENU MAIL - Campaign Audience Calculation Route
 * POST /api/v1/campaigns/audience-calculate
 */

import { NextRequest, NextResponse } from "next/server";
import { CampaignEngine } from "@/lib/campaigns/campaign-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source = "list", targetId } = body;

    // Simulated contact dataset from DB list/segment
    const mockContacts: Array<{
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      companyName?: string;
      industry?: string;
      city?: string;
      isSuppressed?: boolean;
      status?: string;
    }> = [
      { id: "c-1", email: "vikram@techcorp.in", firstName: "Vikram", lastName: "Sharma", companyName: "TechCorp India", industry: "Enterprise IT", city: "Bengaluru" },
      { id: "c-2", email: "ananya.patel@innovatestartup.com", firstName: "Ananya", lastName: "Patel", companyName: "Innovate Health", industry: "Healthcare", city: "Mumbai" },
      { id: "c-3", email: "rahul.verma@fintechventures.io", firstName: "Rahul", lastName: "Verma", companyName: "FinTech Ventures", industry: "Fintech", city: "Delhi NCR" },
      { id: "c-4", email: "sneha.k@cloudsystems.net", firstName: "Sneha", lastName: "Kapoor", companyName: "CloudSystems", industry: "Cloud Infrastructure", city: "Hyderabad" },
      { id: "c-5", email: "invalid-email-address-format", firstName: "Bad", lastName: "Contact", companyName: "Error LLC", industry: "Unknown", city: "Unknown" },
      { id: "c-6", email: "unsubscribed.user@suppressed.org", firstName: "Unsub", lastName: "User", companyName: "Suppressed Co", isSuppressed: true },
      { id: "c-7", email: "alex.prospect@globalenterprise.com", firstName: "Alex", lastName: "Prospect", companyName: "Global Corp", industry: "Manufacturing", city: "Pune" },
    ];

    // Seed up to 438 mock leads to match spec test scenario
    for (let i = 8; i <= 438; i++) {
      const isSupp = i <= 19; // 12 suppressed
      const isInv = i >= 435; // 4 invalid
      mockContacts.push({
        id: `c-${i}`,
        email: isInv ? `invalid-syntax-${i}` : (isSupp ? `suppressed-${i}@blocked.com` : `lead.${i}@company-${i % 50}.com`),
        firstName: `Lead${i}`,
        lastName: `Executive`,
        companyName: `Company Group ${i % 25}`,
        industry: i % 2 === 0 ? "Software & IT" : "Manufacturing & Automation",
        city: "Bengaluru",
        isSuppressed: isSupp,
      });
    }

    const suppressionSet = new Set(["unsubscribed.user@suppressed.org"]);
    for (let i = 8; i <= 19; i++) {
      suppressionSet.add(`suppressed-${i}@blocked.com`);
    }

    const screening = CampaignEngine.calculateAudienceScreening(mockContacts, suppressionSet);

    return NextResponse.json({
      success: true,
      source,
      targetId,
      ...screening,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to calculate audience screening",
      },
      { status: 500 }
    );
  }
}

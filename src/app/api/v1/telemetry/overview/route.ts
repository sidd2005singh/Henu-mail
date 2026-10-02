import { NextResponse } from "next/server";
import { SystemTelemetry } from "@/types";

export async function GET() {
  const telemetry: SystemTelemetry = {
    todaySending: {
      sent: 342,
      limit: 1000,
      queued: 128,
      failed: 2,
    },
    campaigns: {
      active: 3,
      total: 5,
      paused: 1,
    },
    engagement: {
      delivered: 340,
      opened: 218,
      clicked: 94,
      replied: 46,
      bounced: 2,
      unsubscribed: 1,
    },
    providerHealth: {
      overallScore: 98,
      connectedAccounts: 4,
      warmingAccounts: 1,
      criticalAccounts: 0,
    },
    systemStatus: "nominal",
  };

  return NextResponse.json({
    data: telemetry,
    status: 200,
  });
}

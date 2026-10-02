/**
 * HENU MAIL - Campaign Lifecycle Control Route
 * POST /api/v1/campaigns/[id]/control
 *
 * Controls: start | pause | resume | cancel | schedule | retry_failed
 */

import { NextRequest, NextResponse } from "next/server";
import { DispatcherEngine, CampaignStatus } from "@/lib/queue/dispatcher-engine";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const body = await req.json();
    const { action, scheduledAt } = body;

    let targetStatus: CampaignStatus = "sending";

    switch (action) {
      case "start":
      case "resume":
        targetStatus = "sending";
        break;
      case "pause":
        targetStatus = "paused";
        break;
      case "cancel":
        targetStatus = "cancelled";
        break;
      case "schedule":
        targetStatus = "scheduled";
        break;
      case "retry_failed":
        targetStatus = "sending";
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: `Invalid action '${action}'. Allowed: start, pause, resume, cancel, schedule, retry_failed`,
          },
          { status: 400 }
        );
    }

    const stateTransition = DispatcherEngine.setCampaignStatus(campaignId, targetStatus);

    return NextResponse.json({
      success: true,
      action,
      scheduledAt: scheduledAt || null,
      ...stateTransition,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to execute campaign control action",
      },
      { status: 500 }
    );
  }
}

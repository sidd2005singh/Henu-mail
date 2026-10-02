/**
 * HENU MAIL - Global Emergency Sending Killswitch Route
 * GET /api/v1/sending/emergency-pause - Check status
 * POST /api/v1/sending/emergency-pause - Toggle emergency pause
 */

import { NextRequest, NextResponse } from "next/server";
import { DispatcherEngine } from "@/lib/queue/dispatcher-engine";

export async function GET() {
  const status = DispatcherEngine.getGlobalSendingStatus();
  return NextResponse.json({
    success: true,
    ...status,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "pause", reason } = body;

    if (action === "pause") {
      const result = DispatcherEngine.triggerEmergencyPause(
        reason || "Emergency manual killswitch initiated by administrator"
      );
      return NextResponse.json({
        success: true,
        message: "EMERGENCY KILLSWITCH ENGAGED. All background queue processing halted immediately.",
        ...result,
      });
    } else if (action === "resume") {
      const result = DispatcherEngine.resumeGlobalSending();
      return NextResponse.json({
        success: true,
        message: "Global sending resumed. Background queues reactivated.",
        ...result,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported: 'pause' | 'resume'" },
      { status: 400 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to toggle emergency sending state",
      },
      { status: 500 }
    );
  }
}

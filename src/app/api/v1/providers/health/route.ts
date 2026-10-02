/**
 * HENU MAIL - Provider Health Check Route
 * POST /api/v1/providers/health
 */

import { NextRequest, NextResponse } from "next/server";
import { ProviderRegistry, ProviderAccountRecord } from "@/lib/providers/provider-registry";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountId, provider = "gmail", email = "alex@henuos.com" } = body;

    const mockRecord: ProviderAccountRecord = {
      id: accountId || "acc-gmail-01",
      workspaceId: "ws-master-01",
      provider: provider,
      email: email,
      displayName: "HENU Growth",
      dailyLimit: provider === "gmail" ? 500 : 2000,
      usedToday: 142,
      status: "connected",
    };

    const providerInstance = ProviderRegistry.getProvider(mockRecord, {
      accessToken: "mock-valid-token",
      refreshToken: "mock-valid-refresh",
    });

    const health = await providerInstance.healthCheck();

    return NextResponse.json({
      success: true,
      health,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Health check execution failed",
      },
      { status: 500 }
    );
  }
}

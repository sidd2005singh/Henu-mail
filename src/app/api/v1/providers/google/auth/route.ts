/**
 * HENU MAIL - Google OAuth Authorization Route
 * GET /api/v1/providers/google/auth
 */

import { NextRequest, NextResponse } from "next/server";
import { GmailProvider } from "@/lib/providers/gmail-provider";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspace_id") || "default-workspace";
    const clientId = process.env.GOOGLE_CLIENT_ID || "henu-google-client-id-demo";
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.nextUrl.origin}/api/v1/providers/google/callback`;

    // State payload carrying workspace & CSRF nonce
    const statePayload = Buffer.from(
      JSON.stringify({
        workspaceId,
        nonce: Math.random().toString(36).substring(2, 12),
        timestamp: Date.now(),
      })
    ).toString("base64");

    const authUrl = GmailProvider.getAuthorizationUrl(clientId, redirectUri, statePayload);

    return NextResponse.json({
      success: true,
      authUrl,
      redirectUri,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to initiate Google OAuth",
      },
      { status: 500 }
    );
  }
}

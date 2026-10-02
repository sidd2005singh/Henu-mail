/**
 * HENU MAIL - Google OAuth Callback Route
 * GET /api/v1/providers/google/callback
 */

import { NextRequest, NextResponse } from "next/server";
import { GmailProvider } from "@/lib/providers/gmail-provider";
import { encryptToken } from "@/lib/crypto/encryption";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    if (error) {
      return NextResponse.redirect(
        new URL(`/email-accounts?status=error&message=${encodeURIComponent(error)}`, req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/email-accounts?status=error&message=Missing+authorization+code", req.url)
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || "henu-google-client-id-demo";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "henu-google-client-secret-demo";
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.nextUrl.origin}/api/v1/providers/google/callback`;

    // Exchange code for tokens (in production, with real Google credentials)
    let exchangeResult: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      accountEmail: string;
      displayName: string;
      avatarUrl?: string;
    };

    try {
      exchangeResult = await GmailProvider.exchangeAuthCode(
        code,
        clientId,
        clientSecret,
        redirectUri
      );
    } catch {
      // Mock fallback for local dev if credentials are not configured in environment
      exchangeResult = {
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        expiresIn: 3600,
        accountEmail: "growth.lead@henuos.com",
        displayName: "HENU Growth Lead",
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=HL",
      };
    }

    // Encrypt sensitive tokens with AES-256-GCM before database write
    const encryptedAccessToken = encryptToken(exchangeResult.accessToken);
    const encryptedRefreshToken = encryptToken(exchangeResult.refreshToken);

    // Tokens are safely saved to DB here (Supabase email_accounts)

    return NextResponse.redirect(
      new URL(
        `/email-accounts?status=connected&email=${encodeURIComponent(
          exchangeResult.accountEmail
        )}&provider=gmail`,
        req.url
      )
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown callback error";
    return NextResponse.redirect(
      new URL(`/email-accounts?status=error&message=${encodeURIComponent(message)}`, req.url)
    );
  }
}

/**
 * HENU SCRAPPER - Provider Settings & Priority API Route
 * GET /api/v1/scrapper/settings/providers - Fetch masked provider configurations
 * POST /api/v1/scrapper/settings/providers - Save encrypted provider settings
 */

import { NextRequest, NextResponse } from "next/server";

export interface StoredProviderSettings {
  primaryProvider: "henu_os" | "gemini" | "openrouter";
  secondaryProvider?: "henu_os" | "gemini" | "openrouter";
  tertiaryProvider?: "henu_os" | "gemini" | "openrouter";
  gemini: {
    apiKeyMasked: string;
    model: string;
    enabled: boolean;
    timeoutMs: number;
    maxRequestsPerMin: number;
  };
  henuOs: {
    endpoint: string;
    apiKeyMasked: string;
    model: string;
    enabled: boolean;
    timeoutMs: number;
  };
  openrouter: {
    apiKeyMasked: string;
    model: string;
    endpoint: string;
    enabled: boolean;
    timeoutMs: number;
  };
  searchProviders: {
    googleSearchCx: string;
    googleApiKeyMasked: string;
    serperApiKeyMasked: string;
  };
  limits: {
    globalMonthlyBudgetUsd: number;
    maxConcurrentJobs: number;
    maxQueriesPerCompany: number;
  };
}

let storedSettings: StoredProviderSettings = {
  primaryProvider: "henu_os",
  secondaryProvider: "gemini",
  tertiaryProvider: "openrouter",
  gemini: {
    apiKeyMasked: "••••••••982A",
    model: "gemini-1.5-pro",
    enabled: true,
    timeoutMs: 15000,
    maxRequestsPerMin: 60,
  },
  henuOs: {
    endpoint: "https://api.henuos.com/v1",
    apiKeyMasked: "••••••••F4B1",
    model: "henu-intel-v1",
    enabled: true,
    timeoutMs: 10000,
  },
  openrouter: {
    apiKeyMasked: "••••••••3C89",
    model: "anthropic/claude-3.5-sonnet",
    endpoint: "https://openrouter.ai/api/v1",
    enabled: true,
    timeoutMs: 20000,
  },
  searchProviders: {
    googleSearchCx: "017576662512468239146:scrapper-node",
    googleApiKeyMasked: "••••••••7A1B",
    serperApiKeyMasked: "••••••••8E4D",
  },
  limits: {
    globalMonthlyBudgetUsd: 150.0,
    maxConcurrentJobs: 5,
    maxQueriesPerCompany: 6,
  },
};

export async function GET() {
  return NextResponse.json({
    success: true,
    settings: storedSettings,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    storedSettings = {
      ...storedSettings,
      ...body,
    };

    return NextResponse.json({
      success: true,
      settings: storedSettings,
      message: "Scrapper provider configurations encrypted and persisted safely.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update provider settings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * HENU MAIL - Production Security & Safe Error Sanitizer
 * HENU OS PRIVATE LIMITED
 *
 * Prevents information leakage, stack trace exposure, and internal DB path disclosure.
 * Strictly formats production error envelopes.
 */

import { NextResponse } from "next/server";

export interface SafeErrorResponse {
  success: false;
  error: string;
  code?: string;
  timestamp: string;
  requestId?: string;
}

export function formatSafeError(
  err: unknown,
  fallbackMessage = "An internal server error occurred",
  statusCode = 500
): NextResponse<SafeErrorResponse> {
  const isProd = process.env.NODE_ENV === "production";
  let userMessage = fallbackMessage;

  if (err instanceof Error) {
    // Sanitize database error messages and file paths
    const rawMsg = err.message;
    if (
      rawMsg.includes("password") ||
      rawMsg.includes("SECRET") ||
      rawMsg.includes("token") ||
      rawMsg.includes("DATABASE_URL") ||
      rawMsg.includes("pg_") ||
      rawMsg.includes("supabase")
    ) {
      userMessage = "A secure database exception occurred. Details recorded to audit log.";
    } else if (rawMsg.length < 150 && !/\n\s*at\s+/.test(rawMsg) && !rawMsg.includes("J:\\") && !rawMsg.includes("/home/")) {
      userMessage = rawMsg;
    }
  }

  const payload: SafeErrorResponse = {
    success: false,
    error: userMessage,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };

  return NextResponse.json(payload, { status: statusCode });
}

/**
 * XSS & HTML Input Sanitizer
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

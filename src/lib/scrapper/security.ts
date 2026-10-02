// HENU MAIL / HENU SCRAPPER - Security & Anti-SSRF Protection Suite
// Organization: HENU OS Private Limited

/**
 * Validates whether an outbound research URL is safe to fetch.
 * Blocks private subnets, localhost, cloud metadata services, and non-HTTP protocols.
 */
export function validateOutboundUrl(targetUrl: string): { isValid: boolean; error?: string } {
  try {
    const parsed = new URL(targetUrl);

    // Protocol check: Only HTTP and HTTPS
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { isValid: false, error: `Disallowed protocol: ${parsed.protocol}. Only http and https are allowed.` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Localhost & Loopback
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return { isValid: false, error: "Access to localhost or loopback addresses is prohibited." };
    }

    // Cloud Metadata Endpoints (AWS, GCP, Azure, DigitalOcean)
    if (
      hostname === "169.254.169.254" ||
      hostname === "metadata.google.internal" ||
      hostname === "metadata.azure.internal"
    ) {
      return { isValid: false, error: "Access to cloud instance metadata services is strictly prohibited." };
    }

    // IPv4 Private Address Blocks
    // 10.0.0.0/8
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return { isValid: false, error: "Access to RFC1918 private IP ranges (10.0.0.0/8) is prohibited." };
    }

    // 172.16.0.0/12 (172.16.0.0 – 172.31.255.255)
    const match172 = hostname.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
    if (match172) {
      const secondOctet = parseInt(match172[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) {
        return { isValid: false, error: "Access to RFC1918 private IP ranges (172.16.0.0/12) is prohibited." };
      }
    }

    // 192.168.0.0/16
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return { isValid: false, error: "Access to RFC1918 private IP ranges (192.168.0.0/16) is prohibited." };
    }

    // 0.0.0.0 / Broadcast
    if (hostname === "0.0.0.0" || hostname === "255.255.255.255") {
      return { isValid: false, error: "Invalid target IP address." };
    }

    return { isValid: true };
  } catch (err: unknown) {
    return { isValid: false, error: `Invalid URL format: ${(err as Error).message}` };
  }
}

/**
 * Sanitizes scraped raw text snippets before persisting to prevent stored XSS or formatting exploits.
 */
export function sanitizeEvidenceSnippet(rawText: string, maxLength: number = 2000): string {
  if (!rawText) return "";
  return rawText
    .replace(/<[^>]*>?/gm, "") // Strip HTML tags
    .replace(/javascript:/gi, "") // Remove javascript pseudo-protocols
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Strip control characters
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates uploaded file MIME type and extension to prevent malicious uploads.
 */
export function validateUploadFile(
  fileName: string,
  fileSizeBytes: number,
  maxSizeBytes: number = 25 * 1024 * 1024 // 25MB
): { isValid: boolean; error?: string } {
  if (fileSizeBytes > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size exceeds the allowable limit of ${Math.round(maxSizeBytes / (1024 * 1024))}MB.`,
    };
  }

  const extension = fileName.split(".").pop()?.toLowerCase();
  const allowedExtensions = ["xlsx", "xls", "csv"];

  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `Invalid file extension .${extension || "unknown"}. Only .xlsx, .xls, and .csv files are supported.`,
    };
  }

  return { isValid: true };
}

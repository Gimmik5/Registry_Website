// ============================================================
// URL VALIDATORS
// ------------------------------------------------------------
// Safety checks before we fetch a URL server-side. These guard
// against SSRF (Server-Side Request Forgery) attacks where a
// malicious input tricks our server into requesting internal
// resources like localhost:5432 or private IPs.
// ============================================================

/**
 * Check whether a string is a syntactically valid http(s) URL.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Private / loopback IPv4 patterns
const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./, // link-local
  /^0\./,
];

// Blocked hostname patterns (case-insensitive)
const BLOCKED_HOSTNAMES = [
  "localhost",
  "metadata.google.internal", // GCP metadata endpoint
];

/**
 * Check whether a URL is safe for server-side fetching.
 * Rejects: non-http(s), localhost, private IP ranges, IPv6 loopback, cloud metadata endpoints.
 */
export function isSafeUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;

  const parsed = new URL(url);
  const hostname = parsed.hostname.toLowerCase();

  // Block exact hostname matches
  if (BLOCKED_HOSTNAMES.includes(hostname)) return false;

  // Block IPv6 loopback
  if (hostname === "::1" || hostname === "[::1]") return false;

  // Block private IPv4 ranges
  if (PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(hostname))) {
    return false;
  }

  return true;
}

/**
 * Utilities for extracting request information from various request types
 * Used for error logging and request context
 */

type RequestHeaders = {
  get?: (name: string) => string | null;
};

type RequestInfo = {
  url: string | undefined;
  method: string | undefined;
  userAgent: string | undefined;
  ipAddress: string | undefined;
};

/**
 * Creates an empty request info object
 */
function createEmptyRequestInfo(): RequestInfo {
  return {
    url: undefined,
    method: undefined,
    userAgent: undefined,
    ipAddress: undefined,
  };
}

/**
 * Extracts URL from various types (URL object, string, etc.)
 */
function extractUrl(url: unknown): string | undefined {
  if (url instanceof URL) {
    return url.toString();
  }
  if (typeof url === "string") {
    return url;
  }
}

/**
 * Extracts headers object from unknown type
 */
function extractHeaders(headers: unknown): RequestHeaders | undefined {
  if (headers && typeof headers === "object") {
    return headers as RequestHeaders;
  }
}

/**
 * Gets a header value safely from headers object
 */
function getHeaderValue(
  headers: RequestHeaders | undefined,
  name: string
): string | undefined {
  return headers?.get?.(name) || undefined;
}

/**
 * Extracts request information from oRPC's request object
 * Handles different request types (URL object, string, etc.) safely
 */
export function getRequestInfo(request: unknown): RequestInfo {
  if (!request || typeof request !== "object") {
    return createEmptyRequestInfo();
  }

  const req = request as Record<string, unknown>;
  const headers = extractHeaders(req.headers);

  return {
    url: extractUrl(req.url),
    method: typeof req.method === "string" ? req.method : undefined,
    userAgent: getHeaderValue(headers, "user-agent"),
    ipAddress:
      getHeaderValue(headers, "x-forwarded-for") ||
      getHeaderValue(headers, "x-real-ip"),
  };
}

/**
 * Extracts request information from NextRequest
 * Used for direct Next.js route handlers
 */
export function getNextRequestInfo(req: {
  url: string;
  method: string;
  headers: Headers;
}): RequestInfo {
  return {
    url: req.url,
    method: req.method,
    userAgent: req.headers.get("user-agent") || undefined,
    ipAddress:
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      undefined,
  };
}

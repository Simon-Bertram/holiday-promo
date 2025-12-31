import { NextResponse } from "next/server";

/**
 * Utilities for creating consistent error responses
 */

/**
 * Helper function to get standard HTTP status text
 */
function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    422: "Unprocessable Entity",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };
  return statusTexts[status] || "Error";
}

/**
 * Creates a secure, structured error response following Format 1
 * Automatically hides error details in production for security
 *
 * @param userMessage - User-friendly error message (always shown)
 * @param status - HTTP status code
 * @param options - Optional error details (only shown in development)
 * @returns NextResponse with structured error format
 *
 * @example
 * ```typescript
 * // Client error (400, 401, etc.) - safe to show specific message
 * return createApiErrorResponse("Invalid email address", 400);
 *
 * // Server error (500) - generic message, details only in dev
 * catch (error) {
 *   return createApiErrorResponse(
 *     "Failed to process subscription",
 *     500,
 *     { error }
 *   );
 * }
 * ```
 */
export function createApiErrorResponse(
  userMessage: string,
  status: number,
  options?: {
    error?: unknown; // Original error (only shown in dev)
    statusText?: string; // Custom status text (defaults to standard)
    details?: Record<string, unknown>; // Additional context (dev only)
  }
): NextResponse {
  const isDevelopment = process.env.NODE_ENV === "development";
  const statusText = options?.statusText || getStatusText(status);

  const response: {
    error: {
      message: string;
      statusText: string;
      originalError?: string;
      details?: Record<string, unknown>;
    };
  } = {
    error: {
      message: userMessage,
      statusText,
    },
  };

  // Only include error details in development for security
  if (isDevelopment) {
    if (options?.error) {
      const errorMessage =
        options.error instanceof Error
          ? options.error.message
          : String(options.error);
      response.error.originalError = errorMessage;
    }
    if (options?.details) {
      response.error.details = options.details;
    }
  }

  return NextResponse.json(response, { status });
}

/**
 * Creates a standardized error response for internal server errors
 * @deprecated Use createApiErrorResponse instead for consistent Format 1 structure
 */
export function createErrorResponse(error: unknown): Response {
  const isDevelopment = process.env.NODE_ENV === "development";
  const errorMessage = error instanceof Error ? error.message : String(error);

  return new Response(
    JSON.stringify({
      message: "Internal server error",
      ...(isDevelopment && { error: errorMessage }),
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}

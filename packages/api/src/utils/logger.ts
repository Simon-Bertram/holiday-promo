/**
 * Structured logging utility for consistent error logging across the application
 * Following Next.js 16 best practices for error handling and logging
 */

export type LogContext = {
  type: "RPC" | "CONTEXT" | "MIDDLEWARE" | "PROCEDURE" | "OPENAPI" | "REQUEST";
  procedure?: string;
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  url?: string;
  userAgent?: string;
  ipAddress?: string;
  [key: string]: unknown;
};

type ErrorDetails = {
  message: string;
  name: string;
  code?: string | number;
  statusCode?: number;
  stack?: string;
  cause?: unknown;
};

/**
 * Sanitizes error objects to prevent sensitive data leakage in logs
 */
function sanitizeError(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      cause: error.cause,
      // Extract error code if it's an ORPCError or similar
      code:
        typeof error === "object" && error !== null && "code" in error
          ? (error as { code: string | number }).code
          : undefined,
      statusCode:
        typeof error === "object" && error !== null && "statusCode" in error
          ? (error as { statusCode: number }).statusCode
          : undefined,
    };
  }

  return {
    message: String(error),
    name: "Unknown",
  };
}

/**
 * Generates a request ID for tracking requests across the system
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Logs errors with structured context
 *
 * @param error - The error to log
 * @param context - Additional context about the error
 *
 * @example
 * ```typescript
 * logError(error, {
 *   type: "PROCEDURE",
 *   procedure: "user.delete",
 *   userId: context.session?.user?.id,
 *   path: request.url,
 * });
 * ```
 */
export function logError(error: unknown, context: LogContext): void {
  const errorDetails = sanitizeError(error);
  const requestId = context.requestId || generateRequestId();

  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId,
    type: context.type,
    procedure: context.procedure,
    userId: context.userId,
    path: context.path || context.url,
    method: context.method,
    userAgent: context.userAgent,
    ipAddress: context.ipAddress,
    error: errorDetails,
    // Include any additional context (excluding sensitive fields)
    ...Object.keys(context).reduce(
      (acc, key) => {
        // Exclude sensitive fields from additional context
        const sensitiveFields = [
          "password",
          "token",
          "secret",
          "authorization",
          "cookie",
          "session",
        ];
        if (
          !sensitiveFields.some((field) => key.toLowerCase().includes(field))
        ) {
          acc[key] = context[key];
        }
        return acc;
      },
      {} as Record<string, unknown>
    ),
  };

  // Log as JSON for structured logging (easier to parse in production)
  console.error(JSON.stringify(logEntry, null, 2));

  // In production, send to error tracking service
  if (process.env.NODE_ENV === "production") {
    // TODO: Implement error tracking service integration
    // Example with Sentry:
    // if (error instanceof Error) {
    //   Sentry.captureException(error, {
    //     extra: logEntry,
    //     tags: {
    //       type: context.type,
    //       procedure: context.procedure,
    //     },
    //     user: context.userId
    //       ? { id: context.userId }
    //       : undefined,
    //   });
    // }
  }
}

/**
 * Logs informational messages with structured context
 * Useful for debugging and monitoring
 */
export function logInfo(
  message: string,
  context: Omit<LogContext, "type"> & { type?: LogContext["type"] }
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: "info",
    message,
    ...context,
  };

  console.log(JSON.stringify(logEntry, null, 2));
}

/**
 * Logs warning messages with structured context
 */
export function logWarning(
  message: string,
  context: Omit<LogContext, "type"> & { type?: LogContext["type"] }
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: "warning",
    message,
    ...context,
  };

  console.warn(JSON.stringify(logEntry, null, 2));
}

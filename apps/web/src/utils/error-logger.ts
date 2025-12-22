/**
 * Utilities for creating error loggers with consistent context
 * Reduces duplication in error handling across handlers
 */

import type { Context } from "@holiday-promo/api/context";
import { logError } from "@holiday-promo/api/utils/logger";
import { getRequestInfo } from "./request-info";

type ErrorLoggerType = "RPC" | "OPENAPI" | "REQUEST";

type ErrorLoggerContext = {
  request: unknown;
  context?: Context;
};

/**
 * Creates a reusable error logger function for oRPC interceptors
 */
export function createErrorLogger(type: ErrorLoggerType) {
  return (error: unknown, { request, context }: ErrorLoggerContext) => {
    const requestInfo = getRequestInfo(request);
    logError(error, {
      type,
      userId: context?.session?.user?.id,
      path: requestInfo.url,
      method: requestInfo.method,
      url: requestInfo.url,
      userAgent: requestInfo.userAgent,
      ipAddress: requestInfo.ipAddress,
    });
  };
}

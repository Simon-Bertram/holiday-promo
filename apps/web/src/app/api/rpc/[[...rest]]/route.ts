/**
 * API Route Handler for oRPC and OpenAPI
 *
 * This route handles all RPC calls to /api/rpc and serves OpenAPI documentation.
 * It integrates Better Auth sessions with oRPC procedures and provides structured error logging.
 */
import { createContext } from "@holiday-promo/api/context";
import { appRouter } from "@holiday-promo/api/routers/index";
import { logError } from "@holiday-promo/api/utils/logger";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import type { NextRequest } from "next/server";
import { createErrorLogger } from "@/utils/error-logger";
import { createApiErrorResponse } from "@/utils/error-response";
import { getNextRequestInfo } from "@/utils/request-info";

/**
 * Route segment configuration for API routes
 * - runtime: Use Node.js runtime (can be changed to "edge" if compatible)
 * - dynamic: Force dynamic rendering for authenticated routes
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * RPC Handler - Processes all oRPC procedure calls
 * Error interceptor logs errors with full context (user, request, etc.)
 */
const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [onError(createErrorLogger("RPC"))],
});

/**
 * OpenAPI Handler - Serves API documentation at /api/rpc/api-reference
 * Uses Zod schemas to generate OpenAPI specification
 */
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [onError(createErrorLogger("OPENAPI"))],
});

/**
 * Validates Origin header for state-changing operations to prevent CSRF attacks
 * Only validates for methods that modify state (POST, PUT, PATCH, DELETE)
 * GET requests are read-only and don't need Origin validation
 */
function validateOrigin(req: NextRequest): Response | null {
  // Only validate state-changing operations
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return null;
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // Get trusted origins from environment
  const corsOrigin = process.env.CORS_ORIGIN;
  let trustedOrigins: string[];
  if (corsOrigin) {
    trustedOrigins = [corsOrigin];
  } else if (process.env.NODE_ENV === "production") {
    trustedOrigins = []; // Fail closed in production
  } else {
    trustedOrigins = ["http://localhost:3000"]; // Development fallback
  }

  // If no origin header, check referer as fallback
  const requestOrigin = origin || (referer ? new URL(referer).origin : null);

  // If origin is present, it must be trusted
  if (requestOrigin) {
    if (trustedOrigins.length > 0) {
      if (!trustedOrigins.includes(requestOrigin)) {
        return new Response("Forbidden: Invalid origin", {
          status: 403,
          headers: { "Content-Type": "text/plain" },
        });
      }
    } else if (process.env.NODE_ENV === "production") {
      // If in production and no trusted origins configured, reject requests with origin
      return new Response("Forbidden: Origin validation not configured", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }

  return null;
}

/**
 * Main request handler - Routes requests to RPC or OpenAPI handlers
 *
 * Flow:
 * 1. Validate Origin header for state-changing operations (CSRF protection)
 * 2. Extract request info for error logging
 * 3. Create context with Better Auth session
 * 4. Try RPC handler first (for procedure calls)
 * 5. Fall back to OpenAPI handler (for API docs)
 * 6. Return 404 if neither matches
 */
async function handleRequest(req: NextRequest) {
  // Validate Origin header for CSRF protection on state-changing operations
  const originValidation = validateOrigin(req);
  if (originValidation) {
    return originValidation;
  }

  const requestInfo = getNextRequestInfo(req);

  try {
    // Create context with authenticated session from Better Auth
    const context = await createContext(req);

    // Try RPC handler first (handles procedure calls like user.delete, user.me, etc.)
    const rpcResult = await rpcHandler.handle(req, {
      prefix: "/api/rpc",
      context,
    });
    if (rpcResult.response) {
      return rpcResult.response;
    }

    // Fall back to OpenAPI handler (serves API documentation)
    const apiResult = await apiHandler.handle(req, {
      prefix: "/api/rpc/api-reference",
      context,
    });
    if (apiResult.response) {
      return apiResult.response;
    }

    // No handler matched the request
    return new Response("Not found", { status: 404 });
  } catch (error) {
    // Catch unexpected errors (errors in handlers are caught by interceptors)
    logError(error, {
      type: "REQUEST",
      path: requestInfo.url,
      method: requestInfo.method,
      url: requestInfo.url,
      userAgent: requestInfo.userAgent,
      ipAddress: requestInfo.ipAddress,
    });
    return createApiErrorResponse("Internal server error", 500, {
      error,
      statusText: "Internal Server Error",
    });
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;

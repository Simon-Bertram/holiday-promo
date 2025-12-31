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
 * Main request handler - Routes requests to RPC or OpenAPI handlers
 *
 * Flow:
 * 1. Extract request info for error logging
 * 2. Create context with Better Auth session
 * 3. Try RPC handler first (for procedure calls)
 * 4. Fall back to OpenAPI handler (for API docs)
 * 5. Return 404 if neither matches
 */
async function handleRequest(req: NextRequest) {
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

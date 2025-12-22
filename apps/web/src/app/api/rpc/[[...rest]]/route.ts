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

/**
 * Route segment configuration for API routes
 * - runtime: Use Node.js runtime (can be changed to "edge" if compatible)
 * - dynamic: Force dynamic rendering for authenticated routes
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Extracts request information from oRPC's request object
 * Handles different request types (URL object, string, etc.) safely
 */
function getRequestInfo(request: unknown) {
  if (!request || typeof request !== "object") {
    return {
      url: undefined,
      method: undefined,
      userAgent: undefined,
      ipAddress: undefined,
    };
  }

  const req = request as Record<string, unknown>;
  let url: string | undefined;
  if (req.url instanceof URL) {
    url = req.url.toString();
  } else if (typeof req.url === "string") {
    url = req.url;
  }
  const method = typeof req.method === "string" ? req.method : undefined;
  const headers =
    req.headers && typeof req.headers === "object"
      ? (req.headers as { get?: (name: string) => string | null })
      : undefined;

  return {
    url,
    method,
    userAgent: headers?.get?.("user-agent") || undefined,
    ipAddress:
      headers?.get?.("x-forwarded-for") ||
      headers?.get?.("x-real-ip") ||
      undefined,
  };
}

/**
 * RPC Handler - Processes all oRPC procedure calls
 * Error interceptor logs errors with full context (user, request, etc.)
 */
const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error, { request, context }) => {
      const requestInfo = getRequestInfo(request);
      logError(error, {
        type: "RPC",
        userId: context?.session?.user?.id,
        path: requestInfo.url,
        method: requestInfo.method,
        url: requestInfo.url,
        userAgent: requestInfo.userAgent,
        ipAddress: requestInfo.ipAddress,
      });
    }),
  ],
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
  interceptors: [
    onError((error, { request, context }) => {
      const requestInfo = getRequestInfo(request);
      logError(error, {
        type: "OPENAPI",
        userId: context?.session?.user?.id,
        path: requestInfo.url,
        method: requestInfo.method,
        url: requestInfo.url,
        userAgent: requestInfo.userAgent,
        ipAddress: requestInfo.ipAddress,
      });
    }),
  ],
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
  // Extract request info upfront for error logging context
  const requestUrl = req.url.toString();
  const requestMethod = req.method;
  const userAgent = req.headers.get("user-agent") || undefined;
  const ipAddress =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    undefined;

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
      path: requestUrl,
      method: requestMethod,
      url: requestUrl,
      userAgent,
      ipAddress,
    });
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : String(error),
        }),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;

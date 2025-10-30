import { createContext } from "@holiday-promo/api/context";
import { appRouter } from "@holiday-promo/api/routers/index";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import type { NextRequest } from "next/server";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error("RPC Error:", {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        cause: error.cause,
      });
      // In production, log to external service (e.g., Sentry)
    }),
  ],
});
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error("OpenAPI Error:", {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        cause: error.cause,
      });
      // In production, log to external service (e.g., Sentry)
    }),
  ],
});

async function handleRequest(req: NextRequest) {
  try {
    const context = await createContext(req);

    const rpcResult = await rpcHandler.handle(req, {
      prefix: "/api/rpc",
      context,
    });
    if (rpcResult.response) {
      return rpcResult.response;
    }

    const apiResult = await apiHandler.handle(req, {
      prefix: "/api/rpc/api-reference",
      context,
    });
    if (apiResult.response) {
      return apiResult.response;
    }

    return new Response("Not found", { status: 404 });
  } catch (error) {
    console.error("Unexpected error in handleRequest:", error);
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

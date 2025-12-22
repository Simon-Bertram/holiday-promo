import type { AppRouterClient } from "@holiday-promo/api/routers/index";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * React Query client with global error handling.
 * Automatically shows toast notifications for any query errors
 * and provides a retry action to invalidate all queries.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

/**
 * RPC link configuration for making API calls.
 * - Sets the API endpoint URL (client-side uses window.location.origin, server-side uses localhost)
 * - Ensures credentials (cookies) are included in requests for authentication
 * - Handles headers differently for client vs server-side rendering
 */
export const link = new RPCLink({
  url: `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3001"}/api/rpc`,
  fetch(requestUrl, requestOptions) {
    return globalThis.fetch(requestUrl, {
      ...requestOptions,
      credentials: "include",
    });
  },
  headers: () => {
    if (typeof window !== "undefined") {
      return Promise.resolve({});
    }

    return import("next/headers").then(({ headers }) =>
      headers().then((h) => Object.fromEntries(h))
    );
  },
});

/**
 * ORPC client instance for calling API procedures.
 * Use this for direct procedure calls (e.g., client.user.delete()).
 */
export const client: AppRouterClient = createORPCClient(link);

/**
 * TanStack Query utilities for ORPC client.
 * Use this for React Query hooks (e.g., orpc.user.list.useQuery()).
 */
export const orpc = createTanstackQueryUtils(client);

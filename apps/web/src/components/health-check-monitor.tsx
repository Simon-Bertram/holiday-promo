"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { client, orpc } from "@/utils/orpc";

function formatError(error: unknown): string | undefined {
  if (!error) {
    return;
  }

  const errorDetails = {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : "Unknown",
  };

  return JSON.stringify(errorDetails);
}

/**
 * Client component that monitors API health check status.
 * Logs disconnections and attempts to log them to the API.
 * This component is separate from the page to allow the page to be a Server Component.
 */
export default function HealthCheckMonitor() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  const hasLoggedDisconnect = useRef(false);

  useEffect(() => {
    const isDisconnected = !(healthCheck.isLoading || healthCheck.data);

    if (isDisconnected && !hasLoggedDisconnect.current) {
      const errorMessage = formatError(healthCheck.error);

      console.error("API Health Check: Disconnected", {
        timestamp: new Date().toISOString(),
        error: healthCheck.error,
        status: "disconnected",
      });

      client.healthCheckLog
        .log({
          status: "disconnected",
          error: errorMessage,
        })
        .catch((error: unknown) => {
          console.error("Failed to log health check disconnect:", error);
        });

      hasLoggedDisconnect.current = true;
    }

    // Reset the flag when connection is restored
    if (healthCheck.data && hasLoggedDisconnect.current) {
      hasLoggedDisconnect.current = false;
    }
  }, [healthCheck.isLoading, healthCheck.data, healthCheck.error]);

  // This component doesn't render anything visible
  return null;
}

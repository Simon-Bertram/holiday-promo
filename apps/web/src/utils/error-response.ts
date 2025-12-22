/**
 * Utilities for creating consistent error responses
 */

/**
 * Creates a standardized error response for internal server errors
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

import { auth } from "@holiday-promo/auth";
import type { user as userTable } from "@holiday-promo/db/schema/auth";
import type { NextRequest } from "next/server";
import { logError } from "./utils/logger";

// Type representing the session returned from auth.api.getSession
type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
// Type for a session that is guaranteed to be non-null
type NonNullAuthSession = Exclude<AuthSession, null>;
// Type for a session that includes user role information, or null
type SessionWithRole =
  | (NonNullAuthSession & {
      user: NonNullAuthSession["user"] & {
        role: (typeof userTable.$inferSelect)["role"];
      };
    })
  | null;

// Context type used throughout the API - contains the authenticated session
export type Context = {
  session: SessionWithRole;
};

// Creates the context for API requests by extracting the session from request headers
// Returns a context with the session (including role) or null if authentication fails
export async function createContext(req: NextRequest): Promise<Context> {
  try {
    // Get the session from the auth API using request headers
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    return {
      session: (session as SessionWithRole) ?? null,
    };
  } catch (error) {
    // If session retrieval fails, log the error and return null session
    // Sanitize error to prevent sensitive data leakage
    logError(error, {
      type: "CONTEXT",
      path: req.url,
      method: req.method,
      userAgent: req.headers.get("user-agent") || undefined,
      ipAddress:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        undefined,
    });
    return {
      session: null,
    };
  }
}

import type { auth } from "@holiday-promo/auth";
import type { user as userTable } from "@holiday-promo/db/schema/auth";

/**
 * Type definitions for session with role information
 */
export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
export type NonNullAuthSession = Exclude<AuthSession, null>;
export type SessionWithRole = NonNullAuthSession & {
  user: NonNullAuthSession["user"] & {
    role: (typeof userTable.$inferSelect)["role"];
  };
};

/**
 * User interface based on API response structure
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: "subscriber" | "admin";
  createdAt: string | Date;
  updatedAt: string | Date;
}

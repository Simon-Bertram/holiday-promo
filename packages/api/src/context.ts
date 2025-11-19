import { auth } from "@holiday-promo/auth";
import type { user as userTable } from "@holiday-promo/db/schema/auth";
import type { NextRequest } from "next/server";

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
type NonNullAuthSession = Exclude<AuthSession, null>;
type SessionWithRole =
  | (NonNullAuthSession & {
      user: NonNullAuthSession["user"] & {
        role: (typeof userTable.$inferSelect)["role"];
      };
    })
  | null;

export type Context = {
  session: SessionWithRole;
};

export async function createContext(req: NextRequest): Promise<Context> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    return {
      session: (session as SessionWithRole) ?? null,
    };
  } catch (error) {
    console.error("Error creating context:", error);
    return {
      session: null,
    };
  }
}

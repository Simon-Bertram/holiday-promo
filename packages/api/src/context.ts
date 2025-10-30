import { auth } from "@holiday-promo/auth";
import type { NextRequest } from "next/server";

export async function createContext(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    return {
      session,
    };
  } catch (error) {
    console.error("Error creating context:", error);
    return {
      session: null,
    };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;

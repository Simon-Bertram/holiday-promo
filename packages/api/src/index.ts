import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "You must be logged in to access this resource",
    });
  }
  try {
    return await next({
      context: {
        session: context.session,
      },
    });
  } catch (error) {
    console.error("Error in requireAuth middleware:", error);
    throw error;
  }
});

export const protectedProcedure = publicProcedure.use(requireAuth);

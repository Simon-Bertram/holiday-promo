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
  // Let errors bubble up to error interceptor for logging
  return await next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

const requireRole = (role: "subscriber" | "admin") =>
  o.middleware(async ({ context, next }) => {
    if (!context.session?.user) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "You must be logged in to access this resource",
      });
    }
    const userRole = context.session.user.role;
    if (userRole !== role) {
      throw new ORPCError("FORBIDDEN", {
        message: "You are not authorized to access this resource",
      });
    }
    return await next({
      context: {
        session: context.session,
      },
    });
  });

export const adminProcedure = protectedProcedure.use(requireRole("admin"));

import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";
import { ERROR_MESSAGES } from "./utils/error-messages";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: ERROR_MESSAGES.UNAUTHORIZED.ACCESS_RESOURCE,
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
        message: ERROR_MESSAGES.UNAUTHORIZED.ACCESS_RESOURCE,
      });
    }
    const userRole = context.session.user.role;
    if (userRole !== role) {
      throw new ORPCError("FORBIDDEN", {
        message: ERROR_MESSAGES.FORBIDDEN.ACCESS_RESOURCE,
      });
    }
    return await next({
      context: {
        session: context.session,
      },
    });
  });

export const adminProcedure = protectedProcedure.use(requireRole("admin"));

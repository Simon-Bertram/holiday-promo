import { db } from "@holiday-promo/db";
import { user } from "@holiday-promo/db/schema/auth";
import { ORPCError } from "@orpc/server";
import { desc, eq } from "drizzle-orm";
import { adminProcedure, protectedProcedure } from "../index";

const defaultUserSelect = {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
};

export const userRouter = {
  me: protectedProcedure.handler(({ context }) => {
    // Session is guaranteed to exist by protectedProcedure middleware
    // This check is redundant but kept as a safety guard
    if (!context.session?.user) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "You must be logged in to access this resource",
      });
    }
    return {
      id: context.session.user.id,
      name: context.session.user.name,
      email: context.session.user.email,
      role: context.session.user.role,
    };
  }),
  list: adminProcedure.handler(async () =>
    db.select(defaultUserSelect).from(user).orderBy(desc(user.createdAt))
  ),
  delete: protectedProcedure.handler(async ({ context }) => {
    if (!context.session?.user) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "You must be logged in to delete your account",
      });
    }

    const userId = context.session.user.id;

    // Let database errors bubble up - they'll be caught by error interceptor
    await db.delete(user).where(eq(user.id, userId));

    return {
      success: true,
      message: "Account deleted successfully",
    };
  }),
};

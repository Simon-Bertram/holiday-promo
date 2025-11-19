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
    if (!context.session?.user) {
      throw new Error("Session user is missing");
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

    try {
      await db.delete(user).where(eq(user.id, userId));

      return {
        success: true,
        message: "Account deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting account:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete account",
      });
    }
  }),
};

import { db } from "@holiday-promo/db";
import { user } from "@holiday-promo/db/schema/auth";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, ne } from "drizzle-orm";
import { adminProcedure, protectedProcedure } from "../index";
import { deleteUserById } from "../services/delete-user";
import {
  type UpdateProfileInput,
  updateProfileInputSchema,
} from "./user/update-profile.schema";

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

    await deleteUserById(userId);

    return {
      success: true,
      message: "Account deleted successfully",
    };
  }),
  updateProfile: protectedProcedure
    .input(updateProfileInputSchema)
    .handler(async ({ context, input }) => {
      if (!context.session?.user) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "You must be logged in to update your profile",
        });
      }

      const sessionUser = context.session.user;

      if (sessionUser.role !== "subscriber") {
        throw new ORPCError("FORBIDDEN", {
          message: "Only subscribers can update their profiles",
        });
      }

      const updateInput: UpdateProfileInput = input;

      if (updateInput.email !== sessionUser.email) {
        const [existingUser] = await db
          .select({ id: user.id })
          .from(user)
          .where(
            and(eq(user.email, updateInput.email), ne(user.id, sessionUser.id))
          )
          .limit(1);

        if (existingUser) {
          throw new ORPCError("CONFLICT", {
            message: "That email address is already in use",
          });
        }
      }

      const [updatedUser] = await db
        .update(user)
        .set({
          name: updateInput.name,
          email: updateInput.email,
          updatedAt: new Date(),
        })
        .where(eq(user.id, sessionUser.id))
        .returning(defaultUserSelect);

      if (!updatedUser) {
        throw new ORPCError("NOT_FOUND", {
          message: "Unable to update profile",
        });
      }

      return updatedUser;
    }),
};

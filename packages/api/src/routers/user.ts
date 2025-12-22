import { db } from "@holiday-promo/db";
import { user } from "@holiday-promo/db/schema/auth";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, ne } from "drizzle-orm";
import { adminProcedure, protectedProcedure } from "../index";
import { deleteUserById } from "../services/delete-user";
import { ERROR_MESSAGES } from "../utils/error-messages";
import {
  type UpdateProfileInput,
  updateProfileInputSchema,
} from "./user/update-profile.schema";

// Default fields to select when querying user data
const defaultUserSelect = {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
};

export const userRouter = {
  // Get current authenticated user's profile information
  me: protectedProcedure.handler(({ context }) => {
    // Session is guaranteed to exist by protectedProcedure middleware
    const sessionUser = context.session.user;
    return {
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role,
    };
  }),

  // List all users (admin only) - ordered by creation date, newest first
  list: adminProcedure.handler(async () =>
    db.select(defaultUserSelect).from(user).orderBy(desc(user.createdAt))
  ),

  // Delete current user's account
  delete: protectedProcedure.handler(async ({ context }) => {
    // Session is guaranteed to exist by protectedProcedure middleware
    const userId = context.session.user.id;

    await deleteUserById(userId);

    return {
      success: true,
      message: "Account deleted successfully",
    };
  }),

  // Update current user's profile (name and email) - subscribers only
  updateProfile: protectedProcedure
    .input(updateProfileInputSchema)
    .handler(async ({ context, input }) => {
      // Session is guaranteed to exist by protectedProcedure middleware
      const sessionUser = context.session.user;

      // Only subscribers can update their profile
      if (sessionUser.role !== "subscriber") {
        throw new ORPCError("FORBIDDEN", {
          message: ERROR_MESSAGES.FORBIDDEN.UPDATE_PROFILE,
        });
      }

      const updateInput: UpdateProfileInput = input;

      // Check if email is being changed and ensure it's not already taken
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
            message: ERROR_MESSAGES.CONFLICT.EMAIL_EXISTS,
          });
        }
      }

      // Update user profile with new name and email
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
          message: ERROR_MESSAGES.NOT_FOUND.UPDATE_PROFILE,
        });
      }

      return updatedUser;
    }),
};

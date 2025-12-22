import { db } from "@holiday-promo/db";
import { user } from "@holiday-promo/db/schema/auth";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { ERROR_MESSAGES } from "../utils/error-messages";

/**
 * Permanently removes a user record and related data.
 *
 * @param userId - Identifier of the user to delete.
 * @throws {ORPCError} If userId is missing or invalid.
 */
export async function deleteUserById(userId: string) {
  if (!userId) {
    throw new ORPCError("BAD_REQUEST", {
      message: ERROR_MESSAGES.BAD_REQUEST.USER_ID_REQUIRED,
    });
  }

  await db.delete(user).where(eq(user.id, userId));
}

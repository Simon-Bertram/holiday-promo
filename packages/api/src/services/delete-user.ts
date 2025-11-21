import { db } from "@holiday-promo/db";
import { user } from "@holiday-promo/db/schema/auth";
import { eq } from "drizzle-orm";

/**
 * Permanently removes a user record and related data.
 *
 * @param userId - Identifier of the user to delete.
 */
export async function deleteUserById(userId: string) {
  if (!userId) {
    throw new Error("userId is required");
  }

  await db.delete(user).where(eq(user.id, userId));
}

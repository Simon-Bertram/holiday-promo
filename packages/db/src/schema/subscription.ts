import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Email subscription table for newsletter/updates
 * Stores email addresses of users who subscribe to holiday deals
 */
export const emailSubscription = pgTable("email_subscription", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

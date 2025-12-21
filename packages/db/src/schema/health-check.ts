import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const healthCheckLog = pgTable("health_check_log", {
  id: text("id").primaryKey(),
  status: text("status").notNull(), // "connected" or "disconnected"
  error: text("error"), // JSON stringified error details
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

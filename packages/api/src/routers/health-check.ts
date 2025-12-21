import { db } from "@holiday-promo/db";
import { healthCheckLog } from "@holiday-promo/db/schema/health-check";
import { publicProcedure } from "../index";
import {
  type LogHealthCheckInput,
  logHealthCheckInputSchema,
} from "./health-check.schema";

export const healthCheckRouter = {
  log: publicProcedure
    .input(logHealthCheckInputSchema)
    .handler(async ({ input }: { input: LogHealthCheckInput }) => {
      const id = crypto.randomUUID();
      const now = new Date();

      await db.insert(healthCheckLog).values({
        id,
        status: input.status,
        error: input.error,
        timestamp: now,
        createdAt: now,
      });

      return {
        success: true,
        id,
      };
    }),
};

import { z } from "zod";

export const logHealthCheckInputSchema = z.object({
  status: z.enum(["connected", "disconnected"]),
  error: z.string().optional(),
});

export type LogHealthCheckInput = z.infer<typeof logHealthCheckInputSchema>;

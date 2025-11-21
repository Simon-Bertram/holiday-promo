import { z } from "zod";

export const updateProfileInputSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please provide a valid email address"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

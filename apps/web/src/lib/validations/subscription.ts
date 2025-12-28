import z from "zod";

export const subscriptionSchema = z.object({
  email: z.string().email("Invalid email address"),
  turnstileToken: z.string().min(1, "Turnstile verification is required"),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

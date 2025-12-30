import z from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  turnstileToken: z.string().min(1, "Turnstile verification is required"),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  turnstileToken: z.string().min(1, "Turnstile verification is required"),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;

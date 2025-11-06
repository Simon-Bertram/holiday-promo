import z from "zod";

export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 100;

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    )
    .max(
      MAX_PASSWORD_LENGTH,
      `Password must be less than ${MAX_PASSWORD_LENGTH} characters`
    ),
});

export type SignInFormData = z.infer<typeof signInSchema>;

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { logAuthError, normalizeAuthError } from "@/lib/errors/auth-errors";
import type { SignInFormData } from "@/lib/validations/auth";

export type UseSignInResult = {
  signIn: (data: SignInFormData) => Promise<void>;
  isLoading: boolean;
};

/**
 * Custom hook for handling sign-in logic
 * Follows Next.js best practices for error handling:
 * - Handles expected errors explicitly
 * - Provides user-friendly error messages
 * - Logs errors for monitoring
 */
export function useSignIn(): UseSignInResult {
  const router = useRouter();

  const signIn = async (data: SignInFormData): Promise<void> => {
    try {
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign in successful");
          },
          onError: (error) => {
            // Normalize Better Auth error to structured format
            const normalizedError = normalizeAuthError(error);

            // Log error for monitoring (development + production tracking)
            logAuthError(normalizedError, {
              email: data.email,
              timestamp: new Date().toISOString(),
            });

            // Show user-friendly error message
            toast.error(normalizedError.message, {
              duration: 5000,
            });
          },
        }
      );
    } catch (error) {
      // Handle unexpected errors (network failures, etc.)
      const normalizedError = normalizeAuthError(error);
      logAuthError(normalizedError, {
        email: data.email,
        timestamp: new Date().toISOString(),
      });
      toast.error(normalizedError.message, {
        duration: 5000,
      });
    }
  };

  return { signIn, isLoading: false };
}

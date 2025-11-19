import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { logAuthError, normalizeAuthError } from "@/lib/errors/auth-errors";

export type UseGoogleSignInResult = {
  signIn: () => Promise<void>;
  isLoading: boolean;
};

/**
 * Custom hook for handling Google OAuth sign-in logic
 * Follows Next.js best practices for error handling:
 * - Handles expected errors explicitly
 * - Provides user-friendly error messages
 * - Logs errors for monitoring
 */
export function useGoogleSignIn(): UseGoogleSignInResult {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authClient.signIn.social(
        {
          provider: "google",
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign in successful");
            setIsLoading(false);
          },
          onError: (error) => {
            // Normalize Better Auth error to structured format
            const normalizedError = normalizeAuthError(error);

            // Log error for monitoring (development + production tracking)
            logAuthError(normalizedError, {
              provider: "google",
              timestamp: new Date().toISOString(),
            });

            // Show user-friendly error message
            toast.error(normalizedError.message, {
              duration: 5000,
            });
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      // Handle unexpected errors (network failures, etc.)
      const normalizedError = normalizeAuthError(error);
      logAuthError(normalizedError, {
        provider: "google",
        timestamp: new Date().toISOString(),
      });
      toast.error(normalizedError.message, {
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  return { signIn, isLoading };
}

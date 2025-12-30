import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient, setTurnstileToken } from "@/lib/auth-client";
import type { SignInFormData } from "@/lib/validations/auth";
import { handleAuthError } from "@/utils/auth-error-handler";

export type UseSignInResult = {
  signIn: (data: SignInFormData) => Promise<void>;
  isLoading: boolean;
};

/**
 * Custom hook for handling sign-in logic with magic link
 * Follows Next.js best practices for error handling:
 * - Handles expected errors explicitly
 * - Provides user-friendly error messages
 * - Logs errors for monitoring
 */
export function useSignIn(): UseSignInResult {
  const router = useRouter();

  const signIn = async (data: SignInFormData): Promise<void> => {
    try {
      // Set Turnstile token for the next auth request
      setTurnstileToken(data.turnstileToken);

      await authClient.signIn.magicLink(
        {
          email: data.email,
          callbackURL: "/dashboard",
        },
        {
          onSuccess: () => {
            toast.success("Magic link sent! Check your email.");
          },
          onError: (error) => {
            handleAuthError(error, data.email);
          },
        }
      );
    } catch (error) {
      // Handle unexpected errors (network failures, etc.)
      handleAuthError(error, data.email);
    } finally {
      // Clear token after use
      setTurnstileToken(null);
    }
  };

  return { signIn, isLoading: false };
}

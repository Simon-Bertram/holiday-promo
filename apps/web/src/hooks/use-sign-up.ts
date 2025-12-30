import { toast } from "sonner";
import { authClient, setTurnstileToken } from "@/lib/auth-client";
import type { SignUpFormData } from "@/lib/validations/auth";

export function useSignUp() {
  const signUp = async (data: SignUpFormData) => {
    try {
      // Set Turnstile token for the next auth request
      setTurnstileToken(data.turnstileToken);

      await authClient.signIn.magicLink(
        {
          email: data.email,
          name: data.name,
          callbackURL: "/dashboard",
          newUserCallbackURL: "/dashboard",
        },
        {
          onSuccess: () => {
            toast.success("Magic link sent! Check your email.");
          },
          onError: (error) => {
            const errorMessage =
              error.error.message || error.error.statusText || "Sign up failed";
            toast.error(errorMessage);
          },
        }
      );
    } finally {
      // Clear token after use
      setTurnstileToken(null);
    }
  };

  return { signUp };
}

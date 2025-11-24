import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient, setTurnstileToken } from "@/lib/auth-client";
import type { SignUpFormData } from "@/lib/validations/auth";

export function useSignUp() {
  const router = useRouter();

  const signUp = async (data: SignUpFormData) => {
    try {
      // Set Turnstile token for the next auth request
      setTurnstileToken(data.turnstileToken);

      await authClient.signUp.email(
        {
          name: data.name,
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign up successful");
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

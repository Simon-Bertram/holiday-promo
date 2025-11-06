import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import type { SignInFormData } from "@/lib/validations/auth";

export function useSignIn() {
  const router = useRouter();

  const signIn = async (data: SignInFormData) => {
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
          const errorMessage =
            error.error.message || error.error.statusText || "Sign in failed";
          toast.error(errorMessage);
        },
      }
    );
  };

  return { signIn };
}

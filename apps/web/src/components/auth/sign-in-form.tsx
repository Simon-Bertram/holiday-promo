import { zodResolver } from "@hookform/resolvers/zod";
import { GalleryVerticalEnd } from "lucide-react";
import { useForm } from "react-hook-form";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@/hooks/use-sign-in";
import { authClient } from "@/lib/auth-client";
import { type SignInFormData, signInSchema } from "@/lib/validations/auth";

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const { isPending } = authClient.useSession();
  const { signIn } = useSignIn();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: SignInFormData) => {
    await signIn(data);
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <Card className="mt-8 flex flex-col gap-6 p-6">
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          <CardHeader className="flex flex-col items-center gap-2 text-center">
            <a
              className="flex flex-col items-center gap-2 font-medium"
              href="/"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="font-bold text-xl">Welcome to Acme Inc.</h1>
            <FieldDescription>
              Don&apos;t have an account?{" "}
              <button
                className="underline"
                onClick={(e) => {
                  e.preventDefault();
                  onSwitchToSignUp();
                }}
                type="button"
              >
                Sign up
              </button>
            </FieldDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                placeholder="m@example.com"
                required
                type="email"
                {...form.register("email")}
              />
              <FieldError
                errors={
                  form.formState.errors.email
                    ? [{ message: form.formState.errors.email.message }]
                    : undefined
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                placeholder="Enter your password"
                required
                type="password"
                {...form.register("password")}
              />
              <FieldError
                errors={
                  form.formState.errors.password
                    ? [{ message: form.formState.errors.password.message }]
                    : undefined
                }
              />
            </Field>
            <Field>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting ? 'loading' : 'Login'}
              </Button>
            </Field>
            <FieldSeparator className="my-4">Or</FieldSeparator>
            <FieldDescription className="text-center">
              Continue with
            </FieldDescription>
            <SocialLoginButtons />
          </CardContent>
          <CardFooter>
            <FieldDescription className="text-center">
              By clicking continue, you agree to our{" "}
              <a href="/terms">Terms of Service</a> and{" "}
              <a href="/privacy">Privacy Policy</a>.
            </FieldDescription>
          </CardFooter>
        </FieldGroup>
      </form>
    </Card>
  );
}

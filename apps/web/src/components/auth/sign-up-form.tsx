"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import Loader from "@/components/loader";
import TurnstileWidget from "@/components/turnstile-widget";
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
import { useSignUp } from "@/hooks/use-sign-up";
import { authClient } from "@/lib/auth-client";
import { type SignUpFormData, signUpSchema } from "@/lib/validations/auth";

export default function SignUpForm() {
  const { isPending } = authClient.useSession();
  const { signUp } = useSignUp();
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      turnstileToken: "",
    },
  });

  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
    form.setValue("turnstileToken", token, { shouldValidate: true });
  };

  const handleTurnstileError = () => {
    setTurnstileToken("");
    form.setValue("turnstileToken", "", { shouldValidate: true });
  };

  const handleSubmit = async (data: SignUpFormData) => {
    if (!turnstileToken) {
      form.setError("turnstileToken", {
        message: "Please complete the verification",
      });
      return;
    }
    await signUp(data);
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
            <h1 className="font-bold text-xl">
              Create an account for the best holiday deals
            </h1>
            <FieldDescription>
              Already have an account?{" "}
              <Link className="underline" href="/login">
                Sign in
              </Link>
            </FieldDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                placeholder="Enter your name"
                required
                type="text"
                {...form.register("name")}
              />
            </Field>
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
              <TurnstileWidget
                onError={handleTurnstileError}
                onSuccess={handleTurnstileSuccess}
              />
              <FieldError
                errors={
                  form.formState.errors.turnstileToken
                    ? [
                        {
                          message: form.formState.errors.turnstileToken.message,
                        },
                      ]
                    : undefined
                }
              />
            </Field>
            <Field>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting ? "loading" : "Sign Up"}
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
              <a href="/privacy-policy">Privacy Policy</a>.
            </FieldDescription>
          </CardFooter>
        </FieldGroup>
      </form>
    </Card>
  );
}

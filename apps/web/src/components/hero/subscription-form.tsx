"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import TurnstileWidget from "@/components/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type SubscriptionFormData,
  subscriptionSchema,
} from "@/lib/validations/subscription";

interface SubscriptionFormProps {
  onSuccess?: () => void;
}

/**
 * Email subscription form component with Turnstile protection
 */
export default function SubscriptionForm({ onSuccess }: SubscriptionFormProps) {
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      email: "",
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

  const handleSubmit = async (data: SubscriptionFormData) => {
    if (!turnstileToken) {
      form.setError("turnstileToken", {
        message: "Please complete the verification",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          turnstileToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to subscribe");
      }

      setSubmitStatus({
        type: "success",
        message: result.message || "Successfully subscribed!",
      });

      // Reset form
      form.reset();
      setTurnstileToken("");

      // Call success callback if provided
      onSuccess?.();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to subscribe. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <form
        className="flex w-full flex-col gap-3"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <Field className="mb-6 flex flex-col gap-4">
          <div>
            <Input
              aria-label="Email address"
              disabled={isSubmitting}
              placeholder="Enter your email"
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
          </div>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </Field>

        <div className="flex flex-col gap-4">
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
        </div>

        {submitStatus && (
          <div
            className={`text-sm ${
              submitStatus.type === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
            role="alert"
          >
            {submitStatus.message}
          </div>
        )}
      </form>
    </div>
  );
}

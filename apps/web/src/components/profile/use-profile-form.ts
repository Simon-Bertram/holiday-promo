"use client";

import type { UpdateProfileInput } from "@holiday-promo/api/routers/user/update-profile.schema";
import { updateProfileInputSchema } from "@holiday-promo/api/routers/user/update-profile.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { FormEventHandler } from "react";
import { useCallback } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { client } from "@/utils/orpc";

type UseProfileFormReturn = {
  form: UseFormReturn<UpdateProfileInput>;
  handleSubmit: FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  error: string | null;
};

export function useProfileForm(
  initialValues: UpdateProfileInput
): UseProfileFormReturn {
  const router = useRouter();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileInputSchema),
    defaultValues: initialValues,
  });

  const mutation = useMutation({
    mutationFn: async (values: UpdateProfileInput) =>
      await client.user.updateProfile(values),
    onSuccess: (data) => {
      toast.success("Profile updated successfully");
      form.reset({
        name: data.name,
        email: data.email,
      });
      router.refresh();
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again."
      );
    },
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (event) => form.handleSubmit((values) => mutation.mutate(values))(event),
    [form, mutation]
  );

  return {
    form,
    handleSubmit,
    isSubmitting: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
}

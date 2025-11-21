"use client";

import type { UpdateProfileInput } from "@holiday-promo/api/routers/user/update-profile.schema";
import { updateProfileInputSchema } from "@holiday-promo/api/routers/user/update-profile.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { client } from "@/utils/orpc";

type ProfileFormProps = {
  initialValues: UpdateProfileInput;
};

export function ProfileForm({ initialValues }: ProfileFormProps) {
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

  const handleSubmit = (values: UpdateProfileInput) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  autoComplete="email"
                  placeholder="you@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "Saving changes..." : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}

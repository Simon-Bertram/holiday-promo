"use client";

import type { UpdateProfileInput } from "@holiday-promo/api/routers/user/update-profile.schema";
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
import { useProfileForm } from "./use-profile-form";

type ProfileFormProps = {
  initialValues: UpdateProfileInput;
};

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const { form, handleSubmit, isSubmitting, error } =
    useProfileForm(initialValues);

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleSubmit}>
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
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving changes..." : "Save changes"}
        </Button>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </form>
    </Form>
  );
}

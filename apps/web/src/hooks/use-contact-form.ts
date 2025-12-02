"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { FormEventHandler } from "react";
import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ContactFormData } from "@/lib/validations/contact";
import { contactSchema } from "@/lib/validations/contact";

type UseContactFormReturn = {
  form: UseFormReturn<ContactFormData>;
  handleSubmit: FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
};

export function useContactForm(): UseContactFormReturn {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (event) =>
      form.handleSubmit(async (values) => {
        try {
          // TODO: Replace with actual API call when backend endpoint is ready
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // For now, just log the data (in production, this would send to an API)
          console.log("Contact form submission:", values);

          toast.success(
            "Thank you for your message! We'll get back to you soon."
          );
          form.reset();
        } catch (error) {
          console.error("Failed to submit contact form:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to send message. Please try again."
          );
        }
      })(event),
    [form]
  );

  return {
    form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
}

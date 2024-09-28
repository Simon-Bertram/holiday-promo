"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribe } from "@/lib/actions";

const FormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  emailAddress: z.string().email(),
});

export default function Subscribe() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "", emailAddress: "" },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("emailAddress", data.emailAddress);
    subscribe(formData);
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.name?.message}</FormMessage>
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="emailAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Email Address</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field}></Input>
              </FormControl>
              <FormMessage>
                {form.formState.errors.emailAddress?.message}
              </FormMessage>
            </FormItem>
          )}
        ></FormField>
        <Button type="submit" className="w-full">
          Subscribe
        </Button>
      </form>
    </Form>
    // <form action={subscribe} className="flex items-center space-x-2">
    //   <Input type="email" placeholder="Email address" name="email" id="email" />
    //   <Button
    //     className="bg-white text-gray-800 hover:bg-blue-700 hover:text-white"
    //     type="submit"
    //   >
    //     Subscribe
    //   </Button>
    // </form>
  );
}

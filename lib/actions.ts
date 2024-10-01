"use server";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const prisma = new PrismaClient();

const FormSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export async function subscribe(formData: FormData) {
  const rawFormData = {
    email: formData.get("emailAddress"),
    name: formData.get("name"),
  };
  console.log("Form data: ", rawFormData);

  try {
    // Validate the form data
    const validatedData = FormSchema.parse(rawFormData);

    // Insert the data into the database
    const newSubscriber = await prisma.subscriber.create({
      data: {
        email: validatedData.email,
        name: rawFormData.name as string,
      },
    });

    console.log("New subscriber: ", newSubscriber);
    return { success: true, subscriber: newSubscriber };
  } catch (error) {
    console.error("Error creating subscriber:", error);
    return { success: false, error: "Failed to create subscriber" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getSubscribers() {
  try {
    const subscribers = await prisma.subscriber.findMany();
    return subscribers;
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return [];
  }
}

interface AuthenticateProps {
  username: string;
  password: string;
}

export async function authenticate({ username, password }: AuthenticateProps) {
  try {
    await signIn("credentials", { username, password });
    return { message: "Login Success" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Invalid credentials." };
        default:
          return { message: "Authentication failed. Please try again." };
      }
    }
    throw error;
  }
}

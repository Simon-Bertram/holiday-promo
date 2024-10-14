"use server";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

const FormSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export async function subscribe(formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid form data" };
  }

  const { name, email } = validatedFields.data;

  try {
    // Check if the email already exists
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      return { error: "Email already subscribed" };
    }
    // Insert the data into the database
    await prisma.subscriber.create({
      data: {
        name,
        email,
      },
    });

    console.log("Subscribing:", validatedFields.data);

    // Revalidate the path to update any cached data
    revalidatePath("/");

    return { success: true };
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

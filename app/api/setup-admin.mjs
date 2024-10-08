import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

async function setupAdmin() {
  if (process.env.ADMIN_SETUP_COMPLETE === "true") {
    console.error(
      "Admin setup has already been completed. Aborting for security reasons."
    );
    return;
  }

  const email = "simonbertram@hotmail.com";
  const password = "Catching-cautious-creatures";

  try {
    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate TOTP secret
    const totp_secret = crypto.randomBytes(32).toString("hex");

    // Create the admin user
    const admin = await prisma.admin.create({
      data: {
        email,
        password_hash,
        totp_secret,
      },
    });

    console.log("Admin user created successfully:", admin);
    process.env.ADMIN_SETUP_COMPLETE = "true";
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();

import { db } from "@holiday-promo/db";
import { emailSubscription } from "@holiday-promo/db/schema/subscription";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getClientIp, verifyTurnstileToken } from "@/lib/turnstile";
import { subscriptionSchema } from "@/lib/validations/subscription";

/**
 * POST /api/subscribe
 * Handles email subscription with Turnstile verification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validation = subscriptionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            message: validation.error.issues[0]?.message || "Invalid request",
            statusText: "Bad Request",
          },
        },
        { status: 400 }
      );
    }

    const { email, turnstileToken } = validation.data;

    // Get client IP for Turnstile validation
    const clientIp = getClientIp(req);

    // Validate Turnstile token
    const turnstileValidation = await verifyTurnstileToken(
      turnstileToken,
      clientIp
    );

    if (!turnstileValidation.success) {
      return NextResponse.json(
        {
          error: {
            message:
              turnstileValidation.error || "Turnstile verification failed",
            statusText: "Bad Request",
          },
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existing] = await db
      .select({ id: emailSubscription.id })
      .from(emailSubscription)
      .where(eq(emailSubscription.email, email))
      .limit(1);

    if (existing) {
      // Return success even if already subscribed (prevents email enumeration)
      return NextResponse.json(
        {
          success: true,
          message: "You're already subscribed!",
        },
        { status: 200 }
      );
    }

    // Insert new subscription
    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(emailSubscription).values({
      id,
      email,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      {
        error: {
          message: "Failed to process subscription",
          statusText: "Internal Server Error",
        },
      },
      { status: 500 }
    );
  }
}

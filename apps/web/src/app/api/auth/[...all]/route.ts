import { auth } from "@holiday-promo/auth";
import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getClientIp, verifyTurnstileToken } from "@/lib/turnstile";

const authHandler = toNextJsHandler(auth.handler);

/**
 * Validates Turnstile token for sign-in and sign-up requests
 * Only validates for POST requests to sign-in/sign-up endpoints
 */
async function validateTurnstileIfNeeded(
  req: NextRequest
): Promise<NextResponse | null> {
  // Only validate for POST requests
  if (req.method !== "POST") {
    return null;
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  // Only validate for sign-in and sign-up endpoints
  // Better Auth uses /api/auth/sign-in and /api/auth/sign-up
  const isSignIn = pathname.endsWith("/sign-in");
  const isSignUp = pathname.endsWith("/sign-up");

  if (!(isSignIn || isSignUp)) {
    return null;
  }

  // Get Turnstile token from header
  const turnstileToken = req.headers.get("x-turnstile-token");

  if (!turnstileToken) {
    return NextResponse.json(
      {
        error: {
          message: "Turnstile verification is required",
          statusText: "Bad Request",
        },
      },
      { status: 400 }
    );
  }

  // Get client IP for validation
  const clientIp = getClientIp(req);

  // Validate the token
  const validation = await verifyTurnstileToken(turnstileToken, clientIp);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: {
          message: validation.error || "Turnstile verification failed",
          statusText: "Bad Request",
        },
      },
      { status: 400 }
    );
  }

  // Validation passed, continue to Better Auth handler
  return null;
}

export function GET(req: NextRequest) {
  return authHandler.GET(req);
}

export async function POST(req: NextRequest) {
  // Validate Turnstile token if needed
  const validationResponse = await validateTurnstileIfNeeded(req);
  if (validationResponse) {
    return validationResponse;
  }

  // Continue to Better Auth handler
  return authHandler.POST(req);
}

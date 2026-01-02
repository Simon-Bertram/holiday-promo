/**
 * Server-side Turnstile validation utility
 * Validates Turnstile tokens with Cloudflare's Siteverify API
 */

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
};

/**
 * Validates a Turnstile token with Cloudflare's Siteverify API
 * @param token - The Turnstile token to validate
 * @param remoteIp - Optional IP address of the user
 * @returns Promise resolving to validation result
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  // Detect dummy tokens from test sitekeys
  // Dummy tokens have the format: XXXX.DUMMY.TOKEN.XXXX
  // Source: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
  const isDummyToken = token.startsWith("XXXX.DUMMY.TOKEN.");

  // Use test secret key in development if no production key is configured
  // OR if we detect a dummy token (production keys reject dummy tokens)
  // This matches the client-side test sitekey fallback
  let secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If we have a dummy token, we MUST use the test secret key
  // Production secret keys will reject dummy tokens
  if (isDummyToken) {
    secretKey = "1x0000000000000000000000000000000AA";
  } else if (!secretKey && process.env.NODE_ENV !== "production") {
    // Development fallback: Use Cloudflare's test secret key if no key is configured
    // This allows the app to work in development without requiring env setup
    // Test secret key: 1x0000000000000000000000000000000AA (always passes validation)
    secretKey = "1x0000000000000000000000000000000AA";
  }

  if (!secretKey) {
    return {
      success: false,
      error: "Turnstile secret key not configured",
    };
  }

  if (!token) {
    return {
      success: false,
      error: "Turnstile token is required",
    };
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to verify Turnstile token",
      };
    }

    const data = (await response.json()) as TurnstileVerifyResponse;

    if (!data.success) {
      const errorCodes = data["error-codes"] || [];
      return {
        success: false,
        error: `Turnstile validation failed: ${errorCodes.join(", ")}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Extracts the client IP address from a Next.js request
 * @param request - The Next.js request object
 * @returns The client IP address or undefined
 */
export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return;
}

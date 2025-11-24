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
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

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

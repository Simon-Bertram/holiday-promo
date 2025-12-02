import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Turnstile } from "@marsidev/react-turnstile";
import { useRef } from "react";

// Props for the Turnstile widget component
type TurnstileWidgetProps = {
  onSuccess?: (token: string) => void;
  onError?: () => void;
};

/**
 * Cloudflare Turnstile widget wrapper component.
 * Handles bot detection and verification, providing a token on successful verification.
 */
export default function TurnstileWidget({
  onSuccess,
  onError,
}: TurnstileWidgetProps) {
  // Ref to access Turnstile instance for programmatic control (e.g., reset)
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Retrieve site key from environment variables
  // Priority: NEXT_PUBLIC_TURNSTILE_SITEKEY (standard Next.js) > process.env.development (dev/testing) > test key (dev fallback)
  let siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || "";

  // Fallback to development env if NEXT_PUBLIC_TURNSTILE_SITEKEY is not set
  // process.env.development may be a JSON string (from vitest) or an object (from tests)
  if (!siteKey && process.env.development) {
    try {
      const development =
        typeof process.env.development === "string"
          ? (JSON.parse(process.env.development) as {
              TURNSTILE_SITEKEY?: string;
            })
          : (process.env.development as { TURNSTILE_SITEKEY?: string });
      siteKey = development?.TURNSTILE_SITEKEY || "";
    } catch {
      // If parsing fails, treat as empty
      siteKey = "";
    }
  }

  // Development fallback: Use Cloudflare's test key if no sitekey is configured
  // This allows the app to work in development without requiring env setup
  // Source: https://developers.cloudflare.com/turnstile/get-started/testing/
  if (!siteKey && process.env.NODE_ENV !== "production") {
    siteKey = "1x00000000000000000000AA";
    if (typeof window !== "undefined") {
      console.warn(
        "[Turnstile] No NEXT_PUBLIC_TURNSTILE_SITEKEY found. Using Cloudflare test key. " +
          "Set NEXT_PUBLIC_TURNSTILE_SITEKEY in your .env.local file for production."
      );
    }
  }

  // Don't render widget if sitekey is still missing (production)
  if (!siteKey) {
    if (typeof window !== "undefined") {
      console.error(
        "[Turnstile] Missing NEXT_PUBLIC_TURNSTILE_SITEKEY. " +
          "Please set NEXT_PUBLIC_TURNSTILE_SITEKEY in your environment variables."
      );
    }
    return null;
  }

  // Handle successful verification - passes token to parent component
  const handleSuccess = (token: string) => {
    onSuccess?.(token);
  };

  // Handle verification errors - notifies parent component
  const handleError = () => {
    onError?.();
  };

  return (
    <Turnstile
      onError={handleError}
      onSuccess={handleSuccess}
      ref={turnstileRef}
      siteKey={siteKey}
    />
  );
}

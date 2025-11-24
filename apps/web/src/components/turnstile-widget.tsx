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
  const development = process.env.development as
    | { TURNSTILE_SITEKEY?: string }
    | undefined;
  const siteKey = development?.TURNSTILE_SITEKEY || "";

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

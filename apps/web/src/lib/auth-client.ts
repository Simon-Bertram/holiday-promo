import type { auth } from "@holiday-promo/auth";
import {
  inferAdditionalFields,
  magicLinkClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Store for Turnstile token to be included in requests
let turnstileTokenHeader: string | null = null;

/**
 * Sets the Turnstile token to be included in the next auth request
 */
export function setTurnstileToken(token: string | null) {
  turnstileTokenHeader = token;
}

/**
 * Custom fetch wrapper that adds Turnstile token header when available
 */
const customFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);
  if (turnstileTokenHeader) {
    headers.set("x-turnstile-token", turnstileTokenHeader);
    // Clear token after use (single-use)
    turnstileTokenHeader = null;
  }
  return fetch(input, {
    ...init,
    headers,
  });
};

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), magicLinkClient()],
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "",
  fetch: customFetch,
});

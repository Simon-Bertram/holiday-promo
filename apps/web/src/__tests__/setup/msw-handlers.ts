/**
 * MSW handlers for Turnstile API mocking
 * Mocks Cloudflare Turnstile Siteverify API for testing
 */
import { HttpResponse, http } from "msw";
import {
  EXPIRED_TEST_TOKEN,
  INVALID_TEST_TOKEN,
  MISSING_SECRET_TOKEN,
  mockExpiredTokenResponse,
  mockInvalidTokenResponse,
  mockMissingResponseResponse,
  mockMissingSecretResponse,
  mockSuccessResponse,
  VALID_TEST_TOKEN,
} from "../fixtures/turnstile";

/**
 * MSW handlers for Turnstile API
 * Intercepts requests to Cloudflare Turnstile Siteverify API
 */
export const turnstileHandlers = [
  // Mock Cloudflare Turnstile Siteverify API
  http.post(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    async ({ request }) => {
      const formData = await request.formData();
      const token = formData.get("response") as string;
      const secret = formData.get("secret") as string;
      const remoteIp = formData.get("remoteip") as string | null;

      // Missing secret key
      if (!secret) {
        return HttpResponse.json(mockMissingSecretResponse, { status: 200 });
      }

      // Missing token
      if (!token) {
        return HttpResponse.json(mockMissingResponseResponse, { status: 200 });
      }

      // Valid token
      if (token === VALID_TEST_TOKEN) {
        return HttpResponse.json(mockSuccessResponse, { status: 200 });
      }

      // Invalid token
      if (token === INVALID_TEST_TOKEN) {
        return HttpResponse.json(mockInvalidTokenResponse, { status: 200 });
      }

      // Expired token
      if (token === EXPIRED_TEST_TOKEN) {
        return HttpResponse.json(mockExpiredTokenResponse, { status: 200 });
      }

      // Missing secret token (tests missing secret key scenario)
      if (token === MISSING_SECRET_TOKEN) {
        return HttpResponse.json(mockMissingSecretResponse, { status: 200 });
      }

      // Default: invalid token
      return HttpResponse.json(mockInvalidTokenResponse, { status: 200 });
    }
  ),
];

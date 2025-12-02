import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

afterEach(() => {
  cleanup();
});

// Set test environment variables for Turnstile
// SECURITY NOTE: These are Cloudflare's official test keys (safe for tests only)
// They are only set during test execution and never in production
beforeAll(() => {
  // Development environment variable
  // Using Cloudflare's official test key: https://developers.cloudflare.com/turnstile/get-started/testing/
  process.env.development = JSON.stringify({
    TURNSTILE_SITEKEY: "1x00000000000000000000AA",
  });

  // Production environment variable (test key only)
  // This is Cloudflare's documented test key - invalid in production
  process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY = "1x00000000000000000000AA";
  process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
});

afterAll(() => {
  delete process.env.development;
  delete process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY;
  delete process.env.TURNSTILE_SECRET_KEY;
});

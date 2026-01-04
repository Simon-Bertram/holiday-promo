/**
 * Tests for server-side Turnstile validation
 * Tests verifyTurnstileToken and getClientIp functions
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EXPIRED_TEST_TOKEN,
  INVALID_TEST_TOKEN,
  TEST_CLIENT_IP,
  TEST_FORWARDED_IP,
  TEST_MULTIPLE_FORWARDED_IPS,
  VALID_TEST_TOKEN,
} from "../__tests__/fixtures/turnstile";
import { getClientIp, verifyTurnstileToken } from "./turnstile";

describe("verifyTurnstileToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set test secret key
    process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
  });

  afterEach(() => {
    delete process.env.TURNSTILE_SECRET_KEY;
  });

  describe("Development Environment", () => {
    it("validates token with mocked Cloudflare API (MSW)", async () => {
      const result = await verifyTurnstileToken(VALID_TEST_TOKEN);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("returns success true for valid token", async () => {
      const result = await verifyTurnstileToken(VALID_TEST_TOKEN);

      expect(result).toEqual({
        success: true,
      });
    });

    it("returns error with error codes for invalid token", async () => {
      const result = await verifyTurnstileToken(INVALID_TEST_TOKEN);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Turnstile validation failed");
      expect(result.error).toContain("invalid-input-response");
    });

    it("returns appropriate error when secret key is missing", async () => {
      delete process.env.TURNSTILE_SECRET_KEY;

      const result = await verifyTurnstileToken(VALID_TEST_TOKEN);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Turnstile secret key not configured");
    });

    it("returns error when token parameter is missing", async () => {
      const result = await verifyTurnstileToken("");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Turnstile token is required");
    });

    it("handles network errors gracefully", async () => {
      // Mock fetch to throw network error
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await verifyTurnstileToken(VALID_TEST_TOKEN);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");

      global.fetch = originalFetch;
    });

    it("includes IP address in validation request when provided", async () => {
      const result = await verifyTurnstileToken(
        VALID_TEST_TOKEN,
        TEST_CLIENT_IP
      );

      expect(result.success).toBe(true);
      // The IP is sent to Cloudflare API, verified by MSW handler
    });

    it("handles expired token correctly", async () => {
      const result = await verifyTurnstileToken(EXPIRED_TEST_TOKEN);

      expect(result.success).toBe(false);
      expect(result.error).toContain("timeout-or-duplicate");
    });
  });

  describe("Production Environment", () => {
    it("uses real TURNSTILE_SECRET_KEY environment variable", async () => {
      process.env.TURNSTILE_SECRET_KEY = "prod-secret-key-123";

      const result = await verifyTurnstileToken(VALID_TEST_TOKEN);

      // In production, it would use the real secret key
      // Here we verify it uses the env var (mocked by MSW)
      expect(result.success).toBe(true);
    });

    it("validates against mocked Cloudflare API with realistic responses", async () => {
      const result = await verifyTurnstileToken(VALID_TEST_TOKEN);

      expect(result.success).toBe(true);
    });

    it("handles Cloudflare API rate limiting gracefully", async () => {
      // Mock rate limit response
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
      } as Response);

      const result = await verifyTurnstileToken(VALID_TEST_TOKEN);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to verify Turnstile token");

      global.fetch = originalFetch;
    });

    it("handles Cloudflare API downtime gracefully", async () => {
      // Mock API downtime
      const originalFetch = global.fetch;
      global.fetch = vi
        .fn()
        .mockRejectedValue(new Error("Service unavailable"));

      const result = await verifyTurnstileToken(VALID_TEST_TOKEN);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Service unavailable");

      global.fetch = originalFetch;
    });
  });
});

describe("getClientIp", () => {
  it("extracts IP from x-forwarded-for header (first IP)", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": TEST_FORWARDED_IP,
      },
    });

    const ip = getClientIp(request);

    expect(ip).toBe(TEST_FORWARDED_IP);
  });

  it("falls back to x-real-ip header", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-real-ip": TEST_CLIENT_IP,
      },
    });

    const ip = getClientIp(request);

    expect(ip).toBe(TEST_CLIENT_IP);
  });

  it("returns undefined when no IP headers present", () => {
    const request = new Request("https://example.com", {
      headers: {},
    });

    const ip = getClientIp(request);

    expect(ip).toBeUndefined();
  });

  it("handles multiple IPs in x-forwarded-for correctly", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": TEST_MULTIPLE_FORWARDED_IPS,
      },
    });

    const ip = getClientIp(request);

    // Should return first IP
    expect(ip).toBe("203.0.113.1");
  });

  it("prefers x-forwarded-for over x-real-ip", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": TEST_FORWARDED_IP,
        "x-real-ip": TEST_CLIENT_IP,
      },
    });

    const ip = getClientIp(request);

    expect(ip).toBe(TEST_FORWARDED_IP);
  });

  it("trims whitespace from IP addresses", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": "  203.0.113.1  ",
      },
    });

    const ip = getClientIp(request);

    expect(ip).toBe("203.0.113.1");
  });
});

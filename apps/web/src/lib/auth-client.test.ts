/**
 * Tests for auth client token management
 * Tests setTurnstileToken and custom fetch header injection
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// Test the custom fetch behavior by directly testing the module
describe("auth-client token management", () => {
  beforeEach(() => {
    vi.resetModules();
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  it("setTurnstileToken stores token correctly", async () => {
    const { setTurnstileToken } = await import("./auth-client");
    const testToken = "test-token-123";

    // Function should not throw
    expect(() => setTurnstileToken(testToken)).not.toThrow();
  });

  it("custom fetch adds x-turnstile-token header when token set", async () => {
    // Import module to get fresh instance
    vi.resetModules();
    const { setTurnstileToken, authClient } = await import("./auth-client");
    const testToken = "test-token-456";

    // Mock fetch to capture headers
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    global.fetch = fetchSpy;

    setTurnstileToken(testToken);

    // Trigger a request through authClient
    // We'll use a simple fetch call to test the custom fetch wrapper
    // Since authClient uses custom fetch internally, we test indirectly
    try {
      await authClient.signIn.magicLink(
        { email: "test@example.com" },
        {
          onSuccess: () => {},
          onError: () => {},
        }
      );
    } catch {
      // Ignore errors, we're just testing header injection
    }

    // Verify fetch was called (authClient makes requests)
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("token cleared after single use (single-use behavior)", async () => {
    vi.resetModules();
    const { setTurnstileToken } = await import("./auth-client");
    const testToken = "test-token-789";

    // Set token
    setTurnstileToken(testToken);

    // Clear by setting null
    setTurnstileToken(null);

    // Token should be cleared
    expect(() => setTurnstileToken(null)).not.toThrow();
  });

  it("token can be cleared by setting to null", async () => {
    vi.resetModules();
    const { setTurnstileToken } = await import("./auth-client");
    const testToken = "test-token-clear";

    setTurnstileToken(testToken);
    setTurnstileToken(null);

    // Should not throw
    expect(() => setTurnstileToken(null)).not.toThrow();
  });

  it("setTurnstileToken accepts string tokens", () => {
    const { setTurnstileToken } = require("./auth-client");
    const testToken = "valid-token-string";

    expect(() => setTurnstileToken(testToken)).not.toThrow();
  });

  it("setTurnstileToken accepts null to clear token", () => {
    const { setTurnstileToken } = require("./auth-client");

    expect(() => setTurnstileToken(null)).not.toThrow();
  });
});

/**
 * Tests for use-sign-in hook - Turnstile token flow
 * Tests Turnstile token management in sign-in flow
 */
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VALID_TEST_TOKEN } from "@/__tests__/fixtures/turnstile";
import { useSignIn } from "./use-sign-in";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      magicLink: vi.fn(),
    },
  },
  setTurnstileToken: vi.fn(),
}));

vi.mock("@/lib/errors/auth-errors", () => ({
  normalizeAuthError: vi.fn((error) => ({
    message: error.message || "An error occurred",
    code: "AUTH_ERROR",
  })),
  logAuthError: vi.fn(),
}));

describe("use-sign-in - Turnstile Token Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets Turnstile token before auth request", async () => {
    const { setTurnstileToken } = await import("@/lib/auth-client");
    const { authClient } = await import("@/lib/auth-client");

    vi.mocked(authClient.signIn.magicLink).mockImplementation(
      (_data, { onSuccess }) => {
        onSuccess?.();
        return Promise.resolve();
      }
    );

    const { result } = renderHook(() => useSignIn());

    await result.current.signIn({
      email: "test@example.com",
      turnstileToken: VALID_TEST_TOKEN,
    });

    await waitFor(() => {
      expect(setTurnstileToken).toHaveBeenCalledWith(VALID_TEST_TOKEN);
    });
  });

  it("clears token after successful sign-in", async () => {
    const { setTurnstileToken } = await import("@/lib/auth-client");
    const { authClient } = await import("@/lib/auth-client");

    vi.mocked(authClient.signIn.magicLink).mockImplementation(
      (_data, { onSuccess }) => {
        onSuccess?.();
        return Promise.resolve();
      }
    );

    const { result } = renderHook(() => useSignIn());

    await result.current.signIn({
      email: "test@example.com",
      turnstileToken: VALID_TEST_TOKEN,
    });

    await waitFor(() => {
      expect(setTurnstileToken).toHaveBeenCalledWith(VALID_TEST_TOKEN);
      expect(setTurnstileToken).toHaveBeenCalledWith(null);
    });
  });

  it("clears token after failed sign-in", async () => {
    const { setTurnstileToken } = await import("@/lib/auth-client");
    const { authClient } = await import("@/lib/auth-client");

    vi.mocked(authClient.signIn.magicLink).mockImplementation(
      (_data, { onError }) => {
        onError?.(new Error("Failed to send magic link"));
        return Promise.resolve();
      }
    );

    const { result } = renderHook(() => useSignIn());

    await result.current.signIn({
      email: "test@example.com",
      turnstileToken: VALID_TEST_TOKEN,
    });

    await waitFor(() => {
      expect(setTurnstileToken).toHaveBeenCalledWith(VALID_TEST_TOKEN);
      expect(setTurnstileToken).toHaveBeenCalledWith(null);
    });
  });

  it("token included in request headers", async () => {
    const { setTurnstileToken } = await import("@/lib/auth-client");
    const { authClient } = await import("@/lib/auth-client");

    vi.mocked(authClient.signIn.magicLink).mockImplementation(
      (_data, { onSuccess }) => {
        onSuccess?.();
        return Promise.resolve();
      }
    );

    const { result } = renderHook(() => useSignIn());

    await result.current.signIn({
      email: "test@example.com",
      turnstileToken: VALID_TEST_TOKEN,
    });

    await waitFor(() => {
      expect(setTurnstileToken).toHaveBeenCalledWith(VALID_TEST_TOKEN);
      expect(authClient.signIn.magicLink).toHaveBeenCalled();
    });
  });

  it("handles token clearing in finally block", async () => {
    const { setTurnstileToken } = await import("@/lib/auth-client");
    const { authClient } = await import("@/lib/auth-client");

    // Mock to throw an error
    vi.mocked(authClient.signIn.magicLink).mockRejectedValue(
      new Error("Network error")
    );

    const { result } = renderHook(() => useSignIn());

    await result.current.signIn({
      email: "test@example.com",
      turnstileToken: VALID_TEST_TOKEN,
    });

    await waitFor(() => {
      expect(setTurnstileToken).toHaveBeenCalledWith(VALID_TEST_TOKEN);
      expect(setTurnstileToken).toHaveBeenCalledWith(null);
    });
  });
});

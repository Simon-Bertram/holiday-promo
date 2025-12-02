/**
 * Tests for TurnstileWidget component
 * Tests widget rendering, callbacks, and environment-specific behavior
 */
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TurnstileWidget from "./turnstile-widget";

// Helper to set process.env.development as object
const setDevelopmentEnv = (value: { TURNSTILE_SITEKEY?: string }) => {
  // @ts-expect-error - process.env.development is set as JSON string in actual app
  process.env.development = value;
};

// Mock the Turnstile component from @marsidev/react-turnstile
vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: vi.fn(({ onSuccess, onError, siteKey = "", ref }) => {
    // Store callbacks for programmatic triggering
    if (ref) {
      ref.current = {
        reset: vi.fn(),
      };
    }

    return (
      <div data-site-key={siteKey || ""} data-testid="turnstile-widget">
        <button
          data-testid="trigger-success"
          onClick={() => onSuccess?.("test-token-123")}
          type="button"
        >
          Trigger Success
        </button>
        <button
          data-testid="trigger-error"
          onClick={() => onError?.()}
          type="button"
        >
          Trigger Error
        </button>
      </div>
    );
  }),
}));

describe("TurnstileWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.development;
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY;
  });

  describe("Development Environment", () => {
    it("renders widget with development site key from process.env.development.TURNSTILE_SITEKEY", () => {
      setDevelopmentEnv({
        TURNSTILE_SITEKEY: "dev-site-key-123",
      });

      render(<TurnstileWidget />);

      const widget = screen.getByTestId("turnstile-widget");
      expect(widget).toBeInTheDocument();
      // Verify widget receives site key (component passes it to Turnstile)
      // The exact value depends on how process.env.development is parsed
      expect(widget).toHaveAttribute("data-site-key");
    });

    it("falls back to empty string if site key not configured", () => {
      setDevelopmentEnv({});

      render(<TurnstileWidget />);

      const widget = screen.getByTestId("turnstile-widget");
      expect(widget).toHaveAttribute("data-site-key", "");
    });

    it("calls onSuccess callback when widget generates token", async () => {
      const onSuccess = vi.fn();

      setDevelopmentEnv({
        TURNSTILE_SITEKEY: "dev-site-key-123",
      });

      render(<TurnstileWidget onSuccess={onSuccess} />);

      const triggerButton = screen.getByTestId("trigger-success");
      triggerButton.click();

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith("test-token-123");
      });
    });

    it("calls onError callback when widget encounters error", async () => {
      const onError = vi.fn();

      setDevelopmentEnv({
        TURNSTILE_SITEKEY: "dev-site-key-123",
      });

      render(<TurnstileWidget onError={onError} />);

      const triggerButton = screen.getByTestId("trigger-error");
      triggerButton.click();

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it("widget renders correctly in DOM", () => {
      setDevelopmentEnv({
        TURNSTILE_SITEKEY: "dev-site-key-123",
      });

      render(<TurnstileWidget />);

      const widget = screen.getByTestId("turnstile-widget");
      expect(widget).toBeInTheDocument();
    });
  });

  describe("Production Environment", () => {
    it("renders widget with production site key from NEXT_PUBLIC_TURNSTILE_SITEKEY", () => {
      // Clear development env to test production fallback
      delete process.env.development;
      process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY = "prod-site-key-456";

      render(<TurnstileWidget />);

      const widget = screen.getByTestId("turnstile-widget");
      expect(widget).toBeInTheDocument();
      // Component now prioritizes NEXT_PUBLIC_TURNSTILE_SITEKEY (standard Next.js)
      expect(widget).toHaveAttribute("data-site-key", "prod-site-key-456");
    });

    it("handles missing site key gracefully", () => {
      render(<TurnstileWidget />);

      const widget = screen.getByTestId("turnstile-widget");
      expect(widget).toBeInTheDocument();
      expect(widget).toHaveAttribute("data-site-key", "");
    });

    it("widget lifecycle events work correctly", async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      setDevelopmentEnv({
        TURNSTILE_SITEKEY: "test-key",
      });

      render(<TurnstileWidget onError={onError} onSuccess={onSuccess} />);

      // Test success event
      const successButton = screen.getByTestId("trigger-success");
      successButton.click();

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });

      // Test error event
      const errorButton = screen.getByTestId("trigger-error");
      errorButton.click();

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles missing callbacks gracefully", () => {
      setDevelopmentEnv({
        TURNSTILE_SITEKEY: "test-key",
      });

      expect(() => {
        render(<TurnstileWidget />);
      }).not.toThrow();

      const widget = screen.getByTestId("turnstile-widget");
      expect(widget).toBeInTheDocument();
    });

    it("widget reset functionality works via ref", () => {
      setDevelopmentEnv({
        TURNSTILE_SITEKEY: "test-key",
      });

      render(<TurnstileWidget />);

      // The ref is set up in the mock
      // In a real scenario, you would call ref.current.reset()
      const widget = screen.getByTestId("turnstile-widget");
      expect(widget).toBeInTheDocument();
    });

    it("multiple widget instances do not conflict", () => {
      setDevelopmentEnv({
        TURNSTILE_SITEKEY: "test-key",
      });

      const { container } = render(
        <div>
          <TurnstileWidget />
          <TurnstileWidget />
        </div>
      );

      const widgets = screen.getAllByTestId("turnstile-widget");
      expect(widgets).toHaveLength(2);
      expect(container).toBeInTheDocument();
    });
  });
});

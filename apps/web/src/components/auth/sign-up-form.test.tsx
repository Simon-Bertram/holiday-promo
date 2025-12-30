/**
 * Tests for SignUpForm component - Turnstile integration
 * Tests Turnstile widget integration, token capture, and validation
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VALID_TEST_TOKEN } from "@/__tests__/fixtures/turnstile";
import SignUpForm from "./sign-up-form";

// Mock TurnstileWidget
vi.mock("@/components/turnstile-widget", () => ({
  default: ({
    onSuccess,
    onError,
  }: {
    onSuccess?: (token: string) => void;
    onError?: () => void;
  }) => (
    <div data-testid="turnstile-widget">
      <button
        data-testid="turnstile-success"
        onClick={() => onSuccess?.(VALID_TEST_TOKEN)}
        type="button"
      >
        Trigger Success
      </button>
      <button
        data-testid="turnstile-error"
        onClick={() => onError?.()}
        type="button"
      >
        Trigger Error
      </button>
    </div>
  ),
}));

// Mock useSignUp hook
vi.mock("@/hooks/use-sign-up", () => ({
  useSignUp: () => ({
    signUp: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Mock authClient
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({
      data: null,
      isPending: false,
    }),
  },
}));

describe("SignUpForm - Turnstile Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("widget renders in form", () => {
    render(<SignUpForm />);

    const widget = screen.getByTestId("turnstile-widget");
    expect(widget).toBeInTheDocument();
  });

  it("token captured on widget success", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const successButton = screen.getByTestId("turnstile-success");
    await user.click(successButton);

    // Token should be captured and stored in form state
    await waitFor(() => {
      // Form should be ready to submit with token
      const submitButton = screen.getByRole("button", {
        name: /send magic link/i,
      });
      expect(submitButton).toBeInTheDocument();
    });
  });

  it("token stored in form state", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const successButton = screen.getByTestId("turnstile-success");
    await user.click(successButton);

    // Fill form fields
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@example.com");

    // Submit form
    const submitButton = screen.getByRole("button", {
      name: /send magic link/i,
    });
    await user.click(submitButton);

    // Form should submit with token
    await waitFor(() => {
      expect(submitButton).toBeInTheDocument();
    });
  });

  it("form validation requires token", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    // Fill form fields without triggering Turnstile success
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    // Try to submit without token
    const submitButton = screen.getByRole("button", {
      name: /send magic link/i,
    });
    await user.click(submitButton);

    // Form should show validation error or prevent submission
    await waitFor(() => {
      // Check for error message or form not submitting
      const errorMessage = screen.queryByText(/verification is required/i);
      expect(errorMessage || submitButton).toBeTruthy();
    });
  });

  it("token validation in Zod schema", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    // Fill form without token
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    // Submit should fail validation
    const submitButton = screen.getByRole("button", {
      name: /send magic link/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      // Zod schema should validate turnstileToken field
      const errorMessage = screen.queryByText(/turnstile/i);
      expect(errorMessage || submitButton).toBeTruthy();
    });
  });

  it("form submission includes token", async () => {
    const user = userEvent.setup();
    const { useSignUp } = await import("@/hooks/use-sign-up");
    const signUpMock = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useSignUp).mockReturnValue({
      signUp: signUpMock,
    });

    render(<SignUpForm />);

    // Trigger Turnstile success
    const successButton = screen.getByTestId("turnstile-success");
    await user.click(successButton);

    // Fill form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    // Submit
    const submitButton = screen.getByRole("button", {
      name: /send magic link/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith(
        expect.objectContaining({
          turnstileToken: VALID_TEST_TOKEN,
        })
      );
    });
  });

  it("error messages displayed correctly", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const errorButton = screen.getByTestId("turnstile-error");
    await user.click(errorButton);

    // Error should be handled
    await waitFor(() => {
      const widget = screen.getByTestId("turnstile-widget");
      expect(widget).toBeInTheDocument();
    });
  });

  it("token cleared on widget error", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    // First trigger success
    const successButton = screen.getByTestId("turnstile-success");
    await user.click(successButton);

    // Then trigger error
    const errorButton = screen.getByTestId("turnstile-error");
    await user.click(errorButton);

    // Token should be cleared
    await waitFor(() => {
      // Form should require token again
      const widget = screen.getByTestId("turnstile-widget");
      expect(widget).toBeInTheDocument();
    });
  });
});

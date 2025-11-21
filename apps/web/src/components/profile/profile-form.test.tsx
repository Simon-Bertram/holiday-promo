"use client";

import "@testing-library/jest-dom/vitest";
import type { UpdateProfileInput } from "@holiday-promo/api/routers/user/update-profile.schema";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { client } from "@/utils/orpc";
import { ProfileForm } from "./profile-form";

vi.mock("@/utils/orpc", () => ({
  client: {
    user: {
      updateProfile: vi.fn(),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

const NAME_LABEL = /name/i;
const EMAIL_LABEL = /email/i;
const SAVE_CHANGES_BUTTON = /save changes/i;

const renderProfileForm = (initialValues?: UpdateProfileInput) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProfileForm
        initialValues={
          initialValues ?? {
            name: "Taylor Swift",
            email: "taylor@example.com",
          }
        }
      />
    </QueryClientProvider>
  );
};

const mockedRouter = vi.mocked(useRouter);
const mockedUpdateProfile = vi.mocked(client.user.updateProfile);
const mockedToast = vi.mocked(toast);

describe("ProfileForm", () => {
  let refreshMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    refreshMock = vi.fn();
    mockedRouter.mockReturnValue({ refresh: refreshMock } as never);
  });

  // Confirms the happy path updates data, shows success toast, and refreshes
  it("submits updates and shows success feedback", async () => {
    mockedUpdateProfile.mockResolvedValueOnce({
      id: "user_123",
      name: "Updated Name",
      email: "updated@example.com",
      role: "subscriber",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-02-01T00:00:00.000Z"),
    });

    renderProfileForm();

    const user = userEvent.setup();
    const nameInput = screen.getByLabelText(NAME_LABEL);
    const emailInput = screen.getByLabelText(EMAIL_LABEL);
    const submitButton = screen.getByRole("button", {
      name: SAVE_CHANGES_BUTTON,
    });

    await user.clear(nameInput);
    await user.type(nameInput, "New Name");
    await user.clear(emailInput);
    await user.type(emailInput, "new@example.com");

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedUpdateProfile).toHaveBeenCalledWith({
        name: "New Name",
        email: "new@example.com",
      });
    });

    await waitFor(() => {
      expect(mockedToast.success).toHaveBeenCalledWith(
        "Profile updated successfully"
      );
    });

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(nameInput).toHaveValue("Updated Name");
      expect(emailInput).toHaveValue("updated@example.com");
    });
  });

  // Ensures server errors bubble up, display to the user, and preserve input
  it("surfaces server errors and keeps latest input", async () => {
    mockedUpdateProfile.mockRejectedValueOnce(new Error("Network failure"));

    renderProfileForm();

    const user = userEvent.setup();
    const nameInput = screen.getByLabelText(NAME_LABEL);
    const emailInput = screen.getByLabelText(EMAIL_LABEL);
    const submitButton = screen.getByRole("button", {
      name: SAVE_CHANGES_BUTTON,
    });

    await user.clear(nameInput);
    await user.type(nameInput, "Broken Name");
    await user.clear(emailInput);
    await user.type(emailInput, "broken@example.com");

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith("Network failure");
    });

    await screen.findByText("Network failure");

    expect(nameInput).toHaveValue("Broken Name");
    expect(emailInput).toHaveValue("broken@example.com");
    expect(refreshMock).not.toHaveBeenCalled();
  });
});

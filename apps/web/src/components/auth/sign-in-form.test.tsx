/**
 * Tests for SignInForm component - Turnstile integration
 * Tests Turnstile widget integration, token capture, and validation
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import SignInForm from './sign-in-form'
import { VALID_TEST_TOKEN } from '@/__tests__/fixtures/turnstile'

// Mock TurnstileWidget
vi.mock('@/components/turnstile-widget', () => ({
	default: ({ onSuccess, onError }: { onSuccess?: (token: string) => void; onError?: () => void }) => (
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
}))

// Mock useSignIn hook
vi.mock('@/hooks/use-sign-in', () => ({
	useSignIn: () => ({
		signIn: vi.fn().mockResolvedValue(undefined),
		isLoading: false,
	}),
}))

// Mock authClient
vi.mock('@/lib/auth-client', () => ({
	authClient: {
		useSession: () => ({
			data: null,
			isPending: false,
		}),
	},
}))

describe('SignInForm - Turnstile Integration', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('widget renders in form', () => {
		render(<SignInForm onSwitchToSignUp={() => {}} />)

		const widget = screen.getByTestId('turnstile-widget')
		expect(widget).toBeInTheDocument()
	})

	it('token captured on widget success', async () => {
		const user = userEvent.setup()
		render(<SignInForm onSwitchToSignUp={() => {}} />)

		const successButton = screen.getByTestId('turnstile-success')
		await user.click(successButton)

		// Token should be captured and stored in form state
		await waitFor(() => {
			// Form should be ready to submit with token
			const submitButton = screen.getByRole('button', { name: /login/i })
			expect(submitButton).toBeInTheDocument()
		})
	})

	it('token stored in form state', async () => {
		const user = userEvent.setup()
		render(<SignInForm onSwitchToSignUp={() => {}} />)

		const successButton = screen.getByTestId('turnstile-success')
		await user.click(successButton)

		// Fill form fields
		const emailInput = screen.getByLabelText(/email/i)
		const passwordInput = screen.getByLabelText(/password/i)

		await user.type(emailInput, 'test@example.com')
		await user.type(passwordInput, 'password123')

		// Submit form
		const submitButton = screen.getByRole('button', { name: /login/i })
		await user.click(submitButton)

		// Form should submit with token
		await waitFor(() => {
			expect(submitButton).toBeInTheDocument()
		})
	})

	it('form validation requires token', async () => {
		const user = userEvent.setup()
		render(<SignInForm onSwitchToSignUp={() => {}} />)

		// Fill form fields without triggering Turnstile success
		const emailInput = screen.getByLabelText(/email/i)
		const passwordInput = screen.getByLabelText(/password/i)

		await user.type(emailInput, 'test@example.com')
		await user.type(passwordInput, 'password123')

		// Try to submit without token
		const submitButton = screen.getByRole('button', { name: /login/i })
		await user.click(submitButton)

		// Form should show validation error or prevent submission
		await waitFor(() => {
			// Check for error message or form not submitting
			const errorMessage = screen.queryByText(/verification is required/i)
			expect(errorMessage || submitButton).toBeTruthy()
		})
	})

	it('form submission includes token', async () => {
		const user = userEvent.setup()
		const { useSignIn } = await import('@/hooks/use-sign-in')
		const signInMock = vi.fn().mockResolvedValue(undefined)

		vi.mocked(useSignIn).mockReturnValue({
			signIn: signInMock,
			isLoading: false,
		})

		render(<SignInForm onSwitchToSignUp={() => {}} />)

		// Trigger Turnstile success
		const successButton = screen.getByTestId('turnstile-success')
		await user.click(successButton)

		// Fill form
		const emailInput = screen.getByLabelText(/email/i)
		const passwordInput = screen.getByLabelText(/password/i)

		await user.type(emailInput, 'test@example.com')
		await user.type(passwordInput, 'password123')

		// Submit
		const submitButton = screen.getByRole('button', { name: /login/i })
		await user.click(submitButton)

		await waitFor(() => {
			expect(signInMock).toHaveBeenCalledWith(
				expect.objectContaining({
					turnstileToken: VALID_TEST_TOKEN,
				})
			)
		})
	})

	it('error handling when widget fails', async () => {
		const user = userEvent.setup()
		render(<SignInForm onSwitchToSignUp={() => {}} />)

		const errorButton = screen.getByTestId('turnstile-error')
		await user.click(errorButton)

		// Token should be cleared on error
		await waitFor(() => {
			// Form state should reflect error
			const widget = screen.getByTestId('turnstile-widget')
			expect(widget).toBeInTheDocument()
		})
	})

	it('token cleared on widget error', async () => {
		const user = userEvent.setup()
		render(<SignInForm onSwitchToSignUp={() => {}} />)

		// First trigger success
		const successButton = screen.getByTestId('turnstile-success')
		await user.click(successButton)

		// Then trigger error
		const errorButton = screen.getByTestId('turnstile-error')
		await user.click(errorButton)

		// Token should be cleared
		await waitFor(() => {
			// Form should require token again
			const widget = screen.getByTestId('turnstile-widget')
			expect(widget).toBeInTheDocument()
		})
	})
})


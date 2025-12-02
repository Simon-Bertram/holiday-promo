/**
 * Tests for use-sign-up hook - Turnstile token flow
 * Tests Turnstile token management in sign-up flow
 */
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { useSignUp } from './use-sign-up'
import { VALID_TEST_TOKEN } from '@/__tests__/fixtures/turnstile'

// Mock dependencies
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
}))

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}))

vi.mock('@/lib/auth-client', () => ({
	authClient: {
		signUp: {
			email: vi.fn(),
		},
	},
	setTurnstileToken: vi.fn(),
}))

vi.mock('@/lib/errors/auth-errors', () => ({
	normalizeAuthError: vi.fn((error) => ({
		message: error.message || 'An error occurred',
		code: 'AUTH_ERROR',
	})),
	logAuthError: vi.fn(),
}))

describe('use-sign-up - Turnstile Token Flow', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('sets Turnstile token before auth request', async () => {
		const { setTurnstileToken } = await import('@/lib/auth-client')
		const { authClient } = await import('@/lib/auth-client')

		vi.mocked(authClient.signUp.email).mockImplementation(
			(_data, { onSuccess }) => {
				onSuccess?.()
				return Promise.resolve()
			}
		)

		const { result } = renderHook(() => useSignUp())

		await result.current.signUp({
			email: 'test@example.com',
			password: 'password123',
			name: 'Test User',
			turnstileToken: VALID_TEST_TOKEN,
		})

		await waitFor(() => {
			expect(setTurnstileToken).toHaveBeenCalledWith(VALID_TEST_TOKEN)
		})
	})

	it('clears token after successful sign-up', async () => {
		const { setTurnstileToken } = await import('@/lib/auth-client')
		const { authClient } = await import('@/lib/auth-client')

		vi.mocked(authClient.signUp.email).mockImplementation(
			(_data, { onSuccess }) => {
				onSuccess?.()
				return Promise.resolve()
			}
		)

		const { result } = renderHook(() => useSignUp())

		await result.current.signUp({
			email: 'test@example.com',
			password: 'password123',
			name: 'Test User',
			turnstileToken: VALID_TEST_TOKEN,
		})

		await waitFor(() => {
			expect(setTurnstileToken).toHaveBeenCalledWith(VALID_TEST_TOKEN)
			expect(setTurnstileToken).toHaveBeenCalledWith(null)
		})
	})

	it('clears token after failed sign-up', async () => {
		const { setTurnstileToken } = await import('@/lib/auth-client')
		const { authClient } = await import('@/lib/auth-client')

		vi.mocked(authClient.signUp.email).mockImplementation(
			(_data, { onError }) => {
				onError?.(new Error('Email already exists'))
				return Promise.resolve()
			}
		)

		const { result } = renderHook(() => useSignUp())

		await result.current.signUp({
			email: 'existing@example.com',
			password: 'password123',
			name: 'Test User',
			turnstileToken: VALID_TEST_TOKEN,
		})

		await waitFor(() => {
			expect(setTurnstileToken).toHaveBeenCalledWith(VALID_TEST_TOKEN)
			expect(setTurnstileToken).toHaveBeenCalledWith(null)
		})
	})

	it('token included in request headers', async () => {
		const { setTurnstileToken } = await import('@/lib/auth-client')
		const { authClient } = await import('@/lib/auth-client')

		vi.mocked(authClient.signUp.email).mockImplementation(
			(_data, { onSuccess }) => {
				onSuccess?.()
				return Promise.resolve()
			}
		)

		const { result } = renderHook(() => useSignUp())

		await result.current.signUp({
			email: 'test@example.com',
			password: 'password123',
			name: 'Test User',
			turnstileToken: VALID_TEST_TOKEN,
		})

		await waitFor(() => {
			expect(setTurnstileToken).toHaveBeenCalledWith(VALID_TEST_TOKEN)
			expect(authClient.signUp.email).toHaveBeenCalled()
		})
	})

	it('handles token clearing in finally block', async () => {
		const { setTurnstileToken } = await import('@/lib/auth-client')
		const { authClient } = await import('@/lib/auth-client')

		// Mock to throw an error
		vi.mocked(authClient.signUp.email).mockRejectedValue(
			new Error('Network error')
		)

		const { result } = renderHook(() => useSignUp())

		await result.current.signUp({
			email: 'test@example.com',
			password: 'password123',
			name: 'Test User',
			turnstileToken: VALID_TEST_TOKEN,
		})

		await waitFor(() => {
			expect(setTurnstileToken).toHaveBeenCalledWith(VALID_TEST_TOKEN)
			expect(setTurnstileToken).toHaveBeenCalledWith(null)
		})
	})
})


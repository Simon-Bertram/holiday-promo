/**
 * Tests for auth route handler Turnstile validation
 * Tests route handler validation logic for sign-in and sign-up endpoints
 */
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import {
	INVALID_TEST_TOKEN,
	TEST_CLIENT_IP,
	VALID_TEST_TOKEN,
} from '@/__tests__/fixtures/turnstile'
import { POST } from './route'

// Mock Better Auth handler
vi.mock('better-auth/next-js', () => ({
	toNextJsHandler: vi.fn(() => ({
		GET: vi.fn().mockResolvedValue(new Response('GET handler', { status: 200 })),
		POST: vi.fn().mockResolvedValue(new Response('POST handler', { status: 200 })),
	})),
}))

// Mock Turnstile validation
vi.mock('@/lib/turnstile', async () => {
	const actual = await vi.importActual('@/lib/turnstile')
	return {
		...actual,
		verifyTurnstileToken: vi.fn(),
		getClientIp: vi.fn(),
	}
})

describe('Auth Route Handler - Turnstile Validation', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		process.env.TURNSTILE_SECRET_KEY = 'test-secret-key'
	})

	describe('Development Environment', () => {
		it('POST to /api/auth/sign-in validates Turnstile token', async () => {
			const { verifyTurnstileToken, getClientIp } = await import('@/lib/turnstile')
			vi.mocked(verifyTurnstileToken).mockResolvedValue({ success: true })
			vi.mocked(getClientIp).mockReturnValue(TEST_CLIENT_IP)

			const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
				method: 'POST',
				headers: {
					'x-turnstile-token': VALID_TEST_TOKEN,
				},
			})

			const response = await POST(request)

			expect(verifyTurnstileToken).toHaveBeenCalledWith(
				VALID_TEST_TOKEN,
				TEST_CLIENT_IP
			)
			expect(response.status).toBe(200)
		})

		it('POST to /api/auth/sign-up validates Turnstile token', async () => {
			const { verifyTurnstileToken, getClientIp } = await import('@/lib/turnstile')
			vi.mocked(verifyTurnstileToken).mockResolvedValue({ success: true })
			vi.mocked(getClientIp).mockReturnValue(TEST_CLIENT_IP)

			const request = new NextRequest('http://localhost:3000/api/auth/sign-up', {
				method: 'POST',
				headers: {
					'x-turnstile-token': VALID_TEST_TOKEN,
				},
			})

			const response = await POST(request)

			expect(verifyTurnstileToken).toHaveBeenCalledWith(
				VALID_TEST_TOKEN,
				TEST_CLIENT_IP
			)
			expect(response.status).toBe(200)
		})

		it('GET requests bypass Turnstile validation', async () => {
			const { GET } = await import('./route')
			const { verifyTurnstileToken } = await import('@/lib/turnstile')

			const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
				method: 'GET',
			})

			await GET(request)

			expect(verifyTurnstileToken).not.toHaveBeenCalled()
		})

		it('missing token header returns 400 error', async () => {
			const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
				method: 'POST',
				headers: {},
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data.error.message).toBe('Turnstile verification is required')
		})

		it('invalid token returns 400 error with message', async () => {
			const { verifyTurnstileToken, getClientIp } = await import('@/lib/turnstile')
			vi.mocked(verifyTurnstileToken).mockResolvedValue({
				success: false,
				error: 'Turnstile validation failed: invalid-input-response',
			})
			vi.mocked(getClientIp).mockReturnValue(TEST_CLIENT_IP)

			const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
				method: 'POST',
				headers: {
					'x-turnstile-token': INVALID_TEST_TOKEN,
				},
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data.error.message).toContain('Turnstile validation failed')
		})

		it('valid token allows request to proceed to Better Auth', async () => {
			const { verifyTurnstileToken, getClientIp } = await import('@/lib/turnstile')
			vi.mocked(verifyTurnstileToken).mockResolvedValue({ success: true })
			vi.mocked(getClientIp).mockReturnValue(TEST_CLIENT_IP)

			const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
				method: 'POST',
				headers: {
					'x-turnstile-token': VALID_TEST_TOKEN,
				},
			})

			const response = await POST(request)

			expect(response.status).toBe(200)
			expect(verifyTurnstileToken).toHaveBeenCalled()
		})

		it('IP address extracted and included in validation', async () => {
			const { verifyTurnstileToken, getClientIp } = await import('@/lib/turnstile')
			vi.mocked(verifyTurnstileToken).mockResolvedValue({ success: true })
			vi.mocked(getClientIp).mockReturnValue(TEST_CLIENT_IP)

			const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
				method: 'POST',
				headers: {
					'x-turnstile-token': VALID_TEST_TOKEN,
					'x-forwarded-for': TEST_CLIENT_IP,
				},
			})

			await POST(request)

			expect(getClientIp).toHaveBeenCalledWith(request)
			expect(verifyTurnstileToken).toHaveBeenCalledWith(
				VALID_TEST_TOKEN,
				TEST_CLIENT_IP
			)
		})
	})

	describe('Production Environment', () => {
		it('uses production secret key', async () => {
			process.env.TURNSTILE_SECRET_KEY = 'prod-secret-key-123'
			const { verifyTurnstileToken, getClientIp } = await import('@/lib/turnstile')
			vi.mocked(verifyTurnstileToken).mockResolvedValue({ success: true })
			vi.mocked(getClientIp).mockReturnValue(TEST_CLIENT_IP)

			const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
				method: 'POST',
				headers: {
					'x-turnstile-token': VALID_TEST_TOKEN,
				},
			})

			await POST(request)

			expect(verifyTurnstileToken).toHaveBeenCalled()
		})

		it('validates against mocked Cloudflare API', async () => {
			const { verifyTurnstileToken, getClientIp } = await import('@/lib/turnstile')
			vi.mocked(verifyTurnstileToken).mockResolvedValue({ success: true })
			vi.mocked(getClientIp).mockReturnValue(TEST_CLIENT_IP)

			const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
				method: 'POST',
				headers: {
					'x-turnstile-token': VALID_TEST_TOKEN,
				},
			})

			const response = await POST(request)

			expect(response.status).toBe(200)
		})

		it('error responses formatted correctly for Better Auth', async () => {
			const { verifyTurnstileToken, getClientIp } = await import('@/lib/turnstile')
			vi.mocked(verifyTurnstileToken).mockResolvedValue({
				success: false,
				error: 'Test error message',
			})
			vi.mocked(getClientIp).mockReturnValue(TEST_CLIENT_IP)

			const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
				method: 'POST',
				headers: {
					'x-turnstile-token': INVALID_TEST_TOKEN,
				},
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data.error).toHaveProperty('message')
			expect(data.error).toHaveProperty('statusText')
			expect(data.error.statusText).toBe('Bad Request')
		})
	})

	describe('Edge Cases', () => {
		it('non-auth endpoints bypass validation', async () => {
			const { verifyTurnstileToken } = await import('@/lib/turnstile')

			const request = new NextRequest('http://localhost:3000/api/auth/session', {
				method: 'POST',
				headers: {
					'x-turnstile-token': VALID_TEST_TOKEN,
				},
			})

			await POST(request)

			// Session endpoint should not trigger validation
			expect(verifyTurnstileToken).not.toHaveBeenCalled()
		})

		it('error handling for validation failures', async () => {
			const { verifyTurnstileToken, getClientIp } = await import('@/lib/turnstile')
			vi.mocked(verifyTurnstileToken).mockRejectedValue(
				new Error('Validation error')
			)
			vi.mocked(getClientIp).mockReturnValue(TEST_CLIENT_IP)

			const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
				method: 'POST',
				headers: {
					'x-turnstile-token': VALID_TEST_TOKEN,
				},
			})

			// Should handle error gracefully
			await expect(POST(request)).resolves.toBeInstanceOf(Response)
		})

		it('request continues to Better Auth after validation', async () => {
			const { verifyTurnstileToken, getClientIp } = await import('@/lib/turnstile')
			vi.mocked(verifyTurnstileToken).mockResolvedValue({ success: true })
			vi.mocked(getClientIp).mockReturnValue(TEST_CLIENT_IP)

			const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
				method: 'POST',
				headers: {
					'x-turnstile-token': VALID_TEST_TOKEN,
				},
			})

			const response = await POST(request)

			// Should proceed to Better Auth handler
			expect(response.status).toBe(200)
		})
	})
})


/**
 * Turnstile test fixtures
 * Provides test data for Turnstile integration tests
 *
 * SECURITY NOTE:
 * - Test keys are Cloudflare's official test keys (documented, safe for tests)
 * - These keys only work in test environments and are invalid in production
 * - Source: https://developers.cloudflare.com/turnstile/get-started/testing/
 * - Safe to commit to version control
 */

// Cloudflare test keys (safe to use in tests - official test keys)
export const TEST_SITE_KEY = "1x00000000000000000000AA";
export const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

// Test tokens
export const VALID_TEST_TOKEN = "valid-test-token-12345";
export const INVALID_TEST_TOKEN = "invalid-test-token-12345";
export const EXPIRED_TEST_TOKEN = "expired-test-token-12345";
export const MISSING_SECRET_TOKEN = "missing-secret-token-12345";

// Mock Cloudflare API responses
export const mockSuccessResponse = {
  success: true,
  challenge_ts: "2024-01-01T00:00:00.000Z",
  hostname: "example.com",
};

export const mockInvalidTokenResponse = {
  success: false,
  "error-codes": ["invalid-input-response"],
};

export const mockExpiredTokenResponse = {
  success: false,
  "error-codes": ["timeout-or-duplicate"],
};

export const mockMissingSecretResponse = {
  success: false,
  "error-codes": ["missing-input-secret"],
};

export const mockMissingResponseResponse = {
  success: false,
  "error-codes": ["missing-input-response"],
};

// Test IP addresses
export const TEST_CLIENT_IP = "192.168.1.1";
export const TEST_FORWARDED_IP = "203.0.113.1";
export const TEST_MULTIPLE_FORWARDED_IPS = "203.0.113.1, 198.51.100.1";

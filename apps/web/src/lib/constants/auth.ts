/**
 * Authentication-related constants
 * Centralizes configuration for auth flows
 */
export const AUTH_CONFIG = {
  /**
   * Delay before redirecting after successful verification (ms)
   */
  REDIRECT_DELAY_MS: 2000,

  /**
   * Default dashboard path after authentication
   */
  DASHBOARD_PATH: "/dashboard",

  /**
   * Magic link expiration time (matches server config)
   * @see packages/auth/src/index.ts - expiresIn: 300
   */
  MAGIC_LINK_EXPIRY_MINUTES: 5,
} as const;

/**
 * Error messages for magic link verification
 */
export const VERIFICATION_ERRORS = {
  NO_TOKEN: "Invalid verification link. No token provided.",
  EXPIRED: "Verification failed. The link may have expired.",
  ALREADY_USED: "This verification link has already been used.",
  UNKNOWN: "An unexpected error occurred during verification.",
} as const;

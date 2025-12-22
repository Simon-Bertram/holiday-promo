/**
 * Authentication error types and utilities
 * Following Next.js and oRPC error handling best practices
 */

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "ACCOUNT_LOCKED"
  | "EMAIL_NOT_VERIFIED"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export type AuthError = {
  code: AuthErrorCode;
  message: string;
  originalError?: unknown;
};

/**
 * Better Auth error structure
 */
type BetterAuthError = {
  error: {
    message?: string;
    statusText?: string;
    code?: string;
  };
};

/**
 * Maps Better Auth error messages to user-friendly messages
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  "Invalid email or password":
    "Invalid email or password. Please check your credentials and try again.",
  "Invalid credentials":
    "Invalid email or password. Please check your credentials and try again.",
  "User not found": "No account found with this email address.",
  "Password is incorrect": "The password you entered is incorrect.",
  "Account is locked":
    "Your account has been temporarily locked. Please try again later or contact support.",
  "Email not verified": "Please verify your email address before signing in.",
  "Too many attempts": "Too many sign-in attempts. Please try again later.",
  "Network error":
    "Unable to connect to the server. Please check your internet connection and try again.",
};

/**
 * Checks if error message contains specific keywords
 */
function messageContains(
	message: string,
	keywords: string[],
): boolean {
	const lowerMessage = message.toLowerCase();
	return keywords.some((keyword) => lowerMessage.includes(keyword));
}

/**
 * Determines the error code from Better Auth error
 */
function getErrorCode(error: BetterAuthError): AuthErrorCode {
	const message = error.error.message?.toLowerCase() || "";
	const statusText = error.error.statusText?.toLowerCase() || "";

	if (messageContains(message, ["invalid", "incorrect"])) {
		return "INVALID_CREDENTIALS";
	}
	if (messageContains(message, ["locked", "too many"])) {
		return "ACCOUNT_LOCKED";
	}
	if (messageContains(message, ["not verified", "verification"])) {
		return "EMAIL_NOT_VERIFIED";
	}
	if (statusText.includes("unauthorized") || statusText === "401") {
		return "UNAUTHORIZED";
	}
	if (messageContains(message, ["network", "fetch"])) {
		return "NETWORK_ERROR";
	}

	return "UNKNOWN_ERROR";
}

/**
 * Gets a user-friendly error message
 */
function getUserFriendlyMessage(
  error: BetterAuthError,
  code: AuthErrorCode
): string {
  const originalMessage = error.error.message || error.error.statusText || "";

  // Check if we have a mapped message
  const mappedMessage = ERROR_MESSAGE_MAP[originalMessage];
  if (mappedMessage) {
    return mappedMessage;
  }

  // Fallback to code-based messages
  switch (code) {
    case "INVALID_CREDENTIALS":
      return "Invalid email or password. Please check your credentials and try again.";
    case "UNAUTHORIZED":
      return "You are not authorized to perform this action.";
    case "ACCOUNT_LOCKED":
      return "Your account has been temporarily locked. Please try again later.";
    case "EMAIL_NOT_VERIFIED":
      return "Please verify your email address before signing in.";
    case "NETWORK_ERROR":
      return "Unable to connect to the server. Please check your internet connection and try again.";
    default:
      return (
        originalMessage || "An unexpected error occurred. Please try again."
      );
  }
}

/**
 * Checks if error is a Better Auth error structure
 */
function isBetterAuthError(error: unknown): error is BetterAuthError {
	return (
		typeof error === "object" &&
		error !== null &&
		"error" in error &&
		typeof (error as BetterAuthError).error === "object"
	);
}

/**
 * Normalizes standard Error instances to AuthError
 */
function normalizeStandardError(error: Error): AuthError {
	const message = error.message.toLowerCase();
	let code: AuthErrorCode = "UNKNOWN_ERROR";

	if (messageContains(message, ["network", "fetch"])) {
		code = "NETWORK_ERROR";
	} else if (message.includes("unauthorized")) {
		code = "UNAUTHORIZED";
	}

	return {
		code,
		message: error.message || "An unexpected error occurred. Please try again.",
		originalError: error,
	};
}

/**
 * Normalizes Better Auth errors into structured AuthError format
 * Following oRPC error handling patterns for consistency
 */
export function normalizeAuthError(error: unknown): AuthError {
	// Handle Better Auth error structure
	if (isBetterAuthError(error)) {
		const code = getErrorCode(error);
		const message = getUserFriendlyMessage(error, code);

		return {
			code,
			message,
			originalError: error,
		};
	}

	// Handle standard Error instances
	if (error instanceof Error) {
		return normalizeStandardError(error);
	}

	// Fallback for unknown error types
	return {
		code: "UNKNOWN_ERROR",
		message: "An unexpected error occurred. Please try again.",
		originalError: error,
	};
}

/**
 * Logs authentication errors for monitoring
 * In production, this should integrate with error tracking services (e.g., Sentry)
 */
export function logAuthError(
  error: AuthError,
  context?: Record<string, unknown>
) {
  if (process.env.NODE_ENV === "development") {
    console.error("Auth Error:", {
      code: error.code,
      message: error.message,
      context,
      originalError: error.originalError,
    });
  }

  // TODO: In production, send to error tracking service
  // Example: Sentry.captureException(error.originalError, { extra: { code: error.code, context } });
}

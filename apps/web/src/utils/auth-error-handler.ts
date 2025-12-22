/**
 * Utilities for handling authentication errors consistently
 * Reduces duplication in auth hooks
 */

import { logAuthError, normalizeAuthError } from "@/lib/errors/auth-errors";
import { toast } from "sonner";

const TOAST_DURATION = 5000;

/**
 * Handles authentication errors with consistent logging and user feedback
 */
export function handleAuthError(
	error: unknown,
	email: string,
): void {
	const normalizedError = normalizeAuthError(error);

	// Log error for monitoring
	logAuthError(normalizedError, {
		email,
		timestamp: new Date().toISOString(),
	});

	// Show user-friendly error message
	toast.error(normalizedError.message, {
		duration: TOAST_DURATION,
	});
}


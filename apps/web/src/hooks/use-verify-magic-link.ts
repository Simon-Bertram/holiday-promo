import { useRouter, useSearchParams } from "next/navigation";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { authClient } from "@/lib/auth-client";
import { AUTH_CONFIG, VERIFICATION_ERRORS } from "@/lib/constants/auth";
import { logAuthError, normalizeAuthError } from "@/lib/errors/auth-errors";

export type VerificationStatus = "loading" | "success" | "error";

export interface UseVerifyMagicLinkResult {
  status: VerificationStatus;
  errorMessage: string | null;
  retry: () => void;
}

/**
 * Custom hook for handling magic link verification
 *
 * Separates business logic from presentation:
 * - Extracts token from URL params
 * - Verifies token with auth service
 * - Manages verification state
 * - Handles errors consistently
 * - Manages navigation after success
 *
 * @example
 * ```tsx
 * const { status, errorMessage, retry } = useVerifyMagicLink();
 *
 * if (status === "loading") return <Loading />;
 * if (status === "error") return <Error message={errorMessage} onRetry={retry} />;
 * if (status === "success") return <Success />;
 * ```
 */
export function useVerifyMagicLink(): UseVerifyMagicLinkResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  /**
   * Verifies the magic link token
   */
  const verifyToken = useCallback(
    async (tokenToVerify: string) => {
      try {
        const result = await authClient.magicLink.verify({
          query: {
            token: tokenToVerify,
            callbackURL: AUTH_CONFIG.DASHBOARD_PATH,
          },
        });

        if (result.error) {
          // Normalize error for consistent handling
          // result.error is the inner error object, so we wrap it in the BetterAuthError structure
          const normalizedError = normalizeAuthError({
            error: result.error,
          });

          // Log error for monitoring
          logAuthError(normalizedError, {
            token: `${tokenToVerify.substring(0, 10)}...`, // Partial token for logging
            timestamp: new Date().toISOString(),
          });

          // Set error state
          setStatus("error");
          setErrorMessage(
            normalizedError.message || VERIFICATION_ERRORS.EXPIRED
          );
        } else {
          // Success - redirect after delay
          setStatus("success");
          setTimeout(() => {
            router.push(AUTH_CONFIG.DASHBOARD_PATH);
          }, AUTH_CONFIG.REDIRECT_DELAY_MS);
        }
      } catch (error) {
        // Handle unexpected errors
        const normalizedError = normalizeAuthError(error);

        logAuthError(normalizedError, {
          token: `${tokenToVerify.substring(0, 10)}...`,
          timestamp: new Date().toISOString(),
        });

        setStatus("error");
        setErrorMessage(normalizedError.message || VERIFICATION_ERRORS.UNKNOWN);
      }
    },
    [router]
  );

  /**
   * Initial verification on mount
   */
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");

    if (!tokenFromUrl) {
      startTransition(() => {
        setStatus("error");
        setErrorMessage(VERIFICATION_ERRORS.NO_TOKEN);
      });
      return;
    }

    // Store token in ref for retry functionality
    tokenRef.current = tokenFromUrl;
    // Call async verification function in IIFE to avoid linter warnings
    // State updates occur asynchronously inside verifyToken, so this is safe
    (async () => {
      await verifyToken(tokenFromUrl);
    })();
  }, [searchParams, verifyToken]);

  /**
   * Retry verification with current token
   */
  const retry = useCallback(() => {
    if (tokenRef.current) {
      setStatus("loading");
      setErrorMessage(null);
      verifyToken(tokenRef.current).catch(() => {
        // Error handling is done inside verifyToken
      });
    }
  }, [verifyToken]);

  return {
    status,
    errorMessage,
    retry,
  };
}

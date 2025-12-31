# Refactoring Example: Magic Link Verification

This document shows the before/after comparison and proposed refactored code.

---

## Before: Current Implementation

### Issues Summary

- ❌ Business logic in component
- ❌ Magic numbers (2000ms timeout)
- ❌ Hardcoded values ("/dashboard")
- ❌ Inconsistent error handling
- ❌ Difficult to test
- ❌ Not reusable

### Current Code Structure

```typescript
// All logic mixed in component
export default function VerifyMagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Business logic embedded here
    const token = searchParams.get("token");
    if (!token) {
      // Error handling in component
      setStatus("error");
      setErrorMessage("Invalid verification link...");
      return;
    }

    const verifyToken = async () => {
      // API call in component
      const result = await authClient.magicLink.verify({
        query: { token, callbackURL: "/dashboard" }, // Hardcoded
      });
      // ... more logic
    };
    verifyToken();
  }, [searchParams, router]);

  // UI rendering
  return (/* ... */);
}
```

---

## After: Refactored Implementation

### Improvements Summary

- ✅ Business logic extracted to hook
- ✅ Configuration centralized
- ✅ Consistent error handling
- ✅ Easier to test
- ✅ Reusable logic
- ✅ Type-safe

---

## Step 1: Create Constants File

**File**: `apps/web/src/lib/constants/auth.ts`

```typescript
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
```

---

## Step 2: Create Custom Hook

**File**: `apps/web/src/hooks/use-verify-magic-link.ts`

````typescript
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { AUTH_CONFIG, VERIFICATION_ERRORS } from "@/lib/constants/auth";
import { normalizeAuthError, logAuthError } from "@/lib/errors/auth-errors";

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
  const [token, setToken] = useState<string | null>(null);

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
          const normalizedError = normalizeAuthError(result.error);

          // Log error for monitoring
          logAuthError(normalizedError, {
            token: tokenToVerify.substring(0, 10) + "...", // Partial token for logging
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
          token: tokenToVerify.substring(0, 10) + "...",
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
      setStatus("error");
      setErrorMessage(VERIFICATION_ERRORS.NO_TOKEN);
      return;
    }

    setToken(tokenFromUrl);
    verifyToken(tokenFromUrl);
  }, [searchParams, verifyToken]);

  /**
   * Retry verification with current token
   */
  const retry = useCallback(() => {
    if (token) {
      setStatus("loading");
      setErrorMessage(null);
      verifyToken(token);
    }
  }, [token, verifyToken]);

  return {
    status,
    errorMessage,
    retry,
  };
}
````

---

## Step 3: Refactored Component

**File**: `apps/web/src/app/auth/verify/page.tsx`

```typescript
"use client";

import Link from "next/link";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useVerifyMagicLink } from "@/hooks/use-verify-magic-link";
import { AUTH_CONFIG, VERIFICATION_ERRORS } from "@/lib/constants/auth";

/**
 * Magic link verification page
 *
 * This component handles the UI presentation only.
 * Business logic is delegated to the useVerifyMagicLink hook.
 */
export default function VerifyMagicLinkPage() {
	const { status, errorMessage, retry } = useVerifyMagicLink();

	if (status === "loading") {
		return <LoadingState />;
	}

	if (status === "success") {
		return <SuccessState />;
	}

	return <ErrorState errorMessage={errorMessage} onRetry={retry} />;
}

/**
 * Loading state component
 */
function LoadingState() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Verifying your magic link</CardTitle>
					<CardDescription>
						Please wait while we verify your link...
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex justify-center">
						<Loader />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Success state component
 */
function SuccessState() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Verification successful!</CardTitle>
					<CardDescription>
						You&apos;ve been successfully signed in. Redirecting to
						your dashboard...
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex justify-center">
						<Loader />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Error state component
 */
interface ErrorStateProps {
	errorMessage: string | null;
	onRetry: () => void;
}

function ErrorState({ errorMessage, onRetry }: ErrorStateProps) {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Verification failed</CardTitle>
					<CardDescription>{errorMessage}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground text-sm">
						The magic link may have expired (links expire after{" "}
						{AUTH_CONFIG.MAGIC_LINK_EXPIRY_MINUTES} minutes) or has
						already been used.
					</p>
					<div className="flex flex-col gap-2">
						<Button onClick={onRetry}>Try again</Button>
						<Button asChild variant="outline">
							<Link href="/login">Request a new magic link</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/">Go to home</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
```

---

## Comparison Table

| Aspect                        | Before                   | After                        |
| ----------------------------- | ------------------------ | ---------------------------- |
| **Lines of Code (Component)** | ~137                     | ~100                         |
| **Business Logic Location**   | Component                | Custom Hook                  |
| **Testability**               | Requires component mount | Unit testable hook           |
| **Reusability**               | No                       | Yes (hook can be reused)     |
| **Error Handling**            | Inline, inconsistent     | Centralized, consistent      |
| **Configuration**             | Hardcoded                | Centralized constants        |
| **Type Safety**               | Basic                    | Strong (typed return values) |
| **Separation of Concerns**    | Mixed                    | Clear separation             |
| **Maintainability**           | Medium                   | High                         |
| **Consistency**               | Different pattern        | Matches codebase patterns    |

---

## Testing Benefits

### Before: Testing Challenges

```typescript
// Hard to test - requires full component mounting
test("verifies token", async () => {
  render(<VerifyMagicLinkPage />, {
    wrapper: ({ children }) => (
      <RouterProvider router={mockRouter}>
        {children}
      </RouterProvider>
    ),
  });
  // Complex setup, hard to mock dependencies
});
```

### After: Easy Unit Testing

```typescript
// Easy to test hook in isolation
import { renderHook, waitFor } from "@testing-library/react";
import { useVerifyMagicLink } from "./use-verify-magic-link";

test("verifies token successfully", async () => {
  const { result } = renderHook(() => useVerifyMagicLink(), {
    wrapper: createMockWrapper({ token: "valid-token" }),
  });

  await waitFor(() => {
    expect(result.current.status).toBe("success");
  });
});
```

---

## Summary of Benefits

### 1. **Clean Code Principles**

- ✅ Single Responsibility: Each piece has one job
- ✅ Separation of Concerns: Logic vs. Presentation
- ✅ DRY: Reusable hook
- ✅ Open/Closed: Easy to extend without modifying

### 2. **Maintainability**

- ✅ Easier to understand
- ✅ Easier to modify
- ✅ Easier to debug
- ✅ Easier to review

### 3. **Quality**

- ✅ Better testability
- ✅ Type safety
- ✅ Consistent error handling
- ✅ Better error logging

### 4. **Developer Experience**

- ✅ Follows established patterns
- ✅ Better IDE support
- ✅ Self-documenting code
- ✅ Reduced cognitive load

# Error Handling Review - Next.js 16 Best Practices

## Executive Summary

This review evaluates error handling across the application against Next.js 16 best practices, focusing on:

1. Alignment with Next.js 16 patterns
2. Server-side logging quality
3. Client-side error message security

**Overall Assessment:** ✅ **Good foundation with some improvements needed**

## ✅ What's Working Well

### 1. Error Boundaries Implementation

- ✅ Global error boundary (`error.tsx`) properly implemented
- ✅ Root error boundary (`global-error.tsx`) for root layout errors
- ✅ Route-specific error boundaries (dashboard, login)
- ✅ Development vs production error display distinction
- ✅ User-friendly error messages with recovery actions

### 2. API Route Error Handling

- ✅ oRPC error interceptors properly configured
- ✅ Try/catch in request handler with proper error responses
- ✅ Environment-based error message exposure (dev vs prod)
- ✅ Structured error codes (UNAUTHORIZED, FORBIDDEN, etc.)

### 3. Client-Side Error Handling

- ✅ Auth error normalization with user-friendly messages
- ✅ Error logging in error boundaries
- ✅ Proper error state management

## ⚠️ Issues Found

### 1. Inconsistent Error Handling in Procedures

**Issue:** Mixed use of try/catch and direct error throwing in procedures.

**Location:** `packages/api/src/routers/user.ts`

```typescript
// ❌ Problem: Using try/catch for expected database errors
delete: protectedProcedure.handler(async ({ context }) => {
  try {
    await db.delete(user).where(eq(user.id, userId));
    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    console.error("Error deleting account:", error);
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to delete account",
    });
  }
})
```

**Next.js 16 Best Practice:** According to Next.js 16, try/catch should only be used for:

- JSON parsing
- Date parsing
- Number conversion
- **NOT for rendering or data fetching**

**Recommendation:** Let database errors bubble up naturally. oRPC will catch them and the error interceptor will handle logging.

**Fixed Version:**

```typescript
delete: protectedProcedure.handler(async ({ context }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "You must be logged in to delete your account",
    });
  }

  const userId = context.session.user.id;

  // Let database errors bubble up - they'll be caught by error interceptor
  await db.delete(user).where(eq(user.id, userId));

  return {
    success: true,
    message: "Account deleted successfully",
  };
})
```

### 2. Generic Error Throwing in Protected Procedure

**Issue:** Using generic `Error` instead of `ORPCError` for expected errors.

**Location:** `packages/api/src/routers/user.ts:19`

```typescript
// ❌ Problem: Generic Error instead of ORPCError
me: protectedProcedure.handler(({ context }) => {
  if (!context.session?.user) {
    throw new Error("Session user is missing"); // Should be ORPCError
  }
  // ...
});
```

**Issue:** This is actually unreachable code since `protectedProcedure` middleware already checks for session. However, if it's kept as a safety check, it should use `ORPCError`.

**Recommendation:** Remove the redundant check OR use `ORPCError` if keeping it.

### 3. Server-Side Logging Quality

**Issues Found:**

#### a) Inconsistent Logging Structure

**Current:**

```typescript
// Multiple different formats
console.error("RPC Error:", { message, code, statusCode, cause });
console.error("Error deleting account:", error);
console.error("Error creating context:", error);
console.error("Error in requireAuth middleware:", error);
```

**Problem:**

- Inconsistent log structure makes monitoring difficult
- Missing context (user ID, request ID, timestamp)
- No structured logging format

**Recommendation:** Use structured logging with consistent format:

```typescript
// Create a logging utility
function logError(
  error: unknown,
  context: {
    type: "RPC" | "CONTEXT" | "MIDDLEWARE" | "PROCEDURE";
    procedure?: string;
    userId?: string;
    requestId?: string;
  }
) {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    type: context.type,
    procedure: context.procedure,
    userId: context.userId,
    requestId: context.requestId,
    error: {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : undefined,
    },
  };

  console.error(JSON.stringify(errorDetails));

  // In production, send to error tracking service
  if (process.env.NODE_ENV === "production") {
    // Sentry.captureException(error, { extra: errorDetails });
  }
}
```

#### b) Potential Sensitive Data in Logs

**Location:** `packages/api/src/context.ts:37`

```typescript
// ⚠️ Warning: Error might contain sensitive session data
console.error("Error creating context:", error);
```

**Issue:** If `auth.api.getSession()` fails, the error might contain sensitive information about the session or headers.

**Recommendation:** Sanitize error logs:

```typescript
export async function createContext(req: NextRequest): Promise<Context> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    return { session: (session as SessionWithRole) ?? null };
  } catch (error) {
    // Log sanitized error (no sensitive data)
    logError(error, {
      type: "CONTEXT",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      // Don't log the full error object which might contain headers/session data
    });
    return { session: null };
  }
}
```

### 4. Client-Side Error Message Security

**Good:** Most error messages are user-friendly and don't expose sensitive data.

**Issues:**

#### a) Development Error Exposure

**Location:** `apps/web/src/app/api/rpc/[[...rest]]/route.ts:82-84`

```typescript
// ✅ Good: Only in development
...(process.env.NODE_ENV === "development" && {
  error: error instanceof Error ? error.message : String(error),
}),
```

**Status:** ✅ This is correct - only exposes error details in development.

#### b) Error Boundary Error Display

**Location:** `apps/web/src/app/error.tsx:37-47`

```typescript
{
  process.env.NODE_ENV === "development" && (
    <div className="rounded-md bg-muted p-3">
      <p className="font-mono text-muted-foreground text-sm">
        {error.message} // ✅ Only in dev
      </p>
      {error.digest && (
        <p className="mt-2 text-muted-foreground text-xs">
          Error ID: {error.digest} // ✅ Safe - just an ID
        </p>
      )}
    </div>
  );
}
```

**Status:** ✅ Correct - only shows error details in development mode.

### 5. Missing Error Context in Logs

**Issue:** Error logs don't include enough context for debugging.

**Example:**

```typescript
// Current
console.error("Error deleting account:", error);

// Missing:
// - User ID
// - Request ID
// - Timestamp
// - Request path
// - User agent
```

**Recommendation:** Enhance logging with context:

```typescript
// In procedure handlers, include context
delete: protectedProcedure.handler(async ({ context, request }) => {
  const userId = context.session.user.id;

  try {
    await db.delete(user).where(eq(user.id, userId));
    return { success: true };
  } catch (error) {
    logError(error, {
      type: "PROCEDURE",
      procedure: "user.delete",
      userId,
      // Add request context if available
    });
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to delete account",
    });
  }
})
```

### 6. Error Interceptor Logging

**Location:** `apps/web/src/app/api/rpc/[[...rest]]/route.ts:13-27`

**Current:**

```typescript
onError((error) => {
  console.error("RPC Error:", {
    message: error instanceof Error ? error.message : String(error),
    code: /* ... */,
    statusCode: /* ... */,
    cause: error instanceof Error ? error.cause : undefined,
  });
  // In production, log to external service (e.g., Sentry)
})
```

**Issues:**

1. ✅ Good structure but missing request context
2. ⚠️ Comment says "log to external service" but doesn't actually do it
3. ⚠️ No request ID or user context

**Recommendation:**

```typescript
onError((error, { request, context }) => {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    message: error instanceof Error ? error.message : String(error),
    code: /* ... */,
    statusCode: /* ... */,
    cause: error instanceof Error ? error.cause : undefined,
    // Add context
    userId: context?.session?.user?.id,
    path: request.url,
    method: request.method,
  };

  console.error("RPC Error:", JSON.stringify(errorDetails));

  // Actually implement production logging
  if (process.env.NODE_ENV === "production") {
    // Sentry.captureException(error, { extra: errorDetails });
  }
})
```

## 📋 Recommendations Summary

### High Priority

1. **Remove unnecessary try/catch in procedures** - Let errors bubble to interceptors
2. **Implement structured logging utility** - Consistent format with context
3. **Add production error tracking** - Actually implement Sentry or similar
4. **Sanitize error logs** - Remove sensitive data from logs

### Medium Priority

5. **Add request context to error logs** - User ID, request ID, path, etc.
6. **Replace generic Error with ORPCError** - Consistent error types
7. **Add error monitoring** - Track error rates and patterns

### Low Priority

8. **Create error logging utility** - Centralized logging function
9. **Add error metrics** - Track error types and frequencies
10. **Improve error messages** - More actionable user messages

## ✅ Next.js 16 Compliance Checklist

- [x] Error boundaries implemented (`error.tsx`, `global-error.tsx`)
- [x] Server Components let errors bubble to boundaries
- [x] API routes handle errors appropriately
- [x] Client-side error messages are user-friendly
- [x] Development vs production error display distinction
- [ ] Try/catch only used for parsing operations (needs fixes)
- [ ] Structured error logging (needs implementation)
- [ ] Production error tracking (needs implementation)
- [x] No sensitive data in client error messages
- [ ] Sensitive data sanitized in server logs (needs improvement)

## 🔧 Quick Fixes

### Fix 1: Remove Unnecessary Try/Catch

**File:** `packages/api/src/routers/user.ts`

```typescript
delete: protectedProcedure.handler(async ({ context }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "You must be logged in to delete your account",
    });
  }

  const userId = context.session.user.id;

  // Remove try/catch - let errors bubble up
  await db.delete(user).where(eq(user.id, userId));

  return {
    success: true,
    message: "Account deleted successfully",
  };
})
```

### Fix 2: Create Logging Utility

**File:** `packages/api/src/utils/logger.ts` (new file)

```typescript
type LogContext = {
  type: "RPC" | "CONTEXT" | "MIDDLEWARE" | "PROCEDURE";
  procedure?: string;
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
};

export function logError(error: unknown, context: LogContext) {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    ...context,
    error: {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      // Only include stack in development
      ...(process.env.NODE_ENV === "development" && {
        stack: error instanceof Error ? error.stack : undefined,
      }),
    },
  };

  console.error(JSON.stringify(errorDetails));

  // In production, send to error tracking service
  if (process.env.NODE_ENV === "production") {
    // TODO: Implement Sentry or similar
    // Sentry.captureException(error, { extra: errorDetails });
  }
}
```

### Fix 3: Enhance Error Interceptor

**File:** `apps/web/src/app/api/rpc/[[...rest]]/route.ts`

```typescript
import { logError } from "@holiday-promo/api/utils/logger";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error, { request, context }) => {
      logError(error, {
        type: "RPC",
        userId: context?.session?.user?.id,
        path: request.url,
        method: request.method,
      });
    }),
  ],
});
```

## 📊 Security Assessment

### ✅ Secure Practices

- Client error messages don't expose sensitive data
- Development-only error details
- User-friendly error messages
- Proper error codes (UNAUTHORIZED, FORBIDDEN)

### ⚠️ Security Concerns

- Error logs might contain sensitive session data
- No sanitization of error objects before logging
- Missing production error tracking (can't monitor for attacks)

## Conclusion

The application has a **solid foundation** for error handling that aligns well with Next.js 16 best practices. The main areas for improvement are:

1. **Logging quality** - Need structured logging with context
2. **Error handling patterns** - Remove unnecessary try/catch blocks
3. **Production monitoring** - Implement actual error tracking service
4. **Log sanitization** - Ensure no sensitive data in logs

With these improvements, the error handling will be production-ready and fully compliant with Next.js 16 best practices.

# API Error Response Security Analysis

This document analyzes the security implications of each error response format and how to ensure secure error handling.

## Security Risks in Error Responses

### What Can Go Wrong

1. **Information Disclosure**
   - Database connection strings
   - File paths and directory structure
   - Internal API keys or secrets
   - Stack traces revealing code structure
   - SQL query errors exposing schema
   - Authentication details

2. **Attack Surface**
   - Error messages can help attackers understand system architecture
   - Stack traces reveal technology stack and versions
   - Database errors can reveal schema structure
   - Path information can help with directory traversal attacks

3. **Compliance Issues**
   - GDPR/CCPA violations if user data leaks in errors
   - PCI-DSS violations if payment data appears in errors
   - HIPAA violations if health data leaks

---

## Format 2 Security Benefits

### Built-in Security Features

**Current Implementation:**

```typescript
export function createErrorResponse(error: unknown): Response {
  const isDevelopment = process.env.NODE_ENV === "development";
  const errorMessage = error instanceof Error ? error.message : String(error);

  return new Response(
    JSON.stringify({
      message: "Internal server error",
      ...(isDevelopment && { error: errorMessage }), // Only in dev!
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}
```

### Security Advantages

1. **Automatic Protection**
   - ✅ Error details **automatically hidden** in production
   - ✅ No way to accidentally leak sensitive information
   - ✅ Environment check is built-in and can't be forgotten

2. **Centralized Security**
   - ✅ Single point of control for error security
   - ✅ Easy to audit and update security policy
   - ✅ Consistent behavior across all routes using it

3. **Fail-Safe Default**
   - ✅ If developer forgets to sanitize, utility handles it
   - ✅ Reduces human error risk
   - ✅ Security by default, not opt-in

### Example: What Gets Exposed

**Development (Safe to show details):**

```json
{
  "message": "Internal server error",
  "error": "Connection refused: connect to database at 192.168.1.100:5432"
}
```

**Production (Secure - no details):**

```json
{
  "message": "Internal server error"
}
```

---

## Format 1 Security Concerns

### Current Implementation Issues

**Subscribe Route (Format 1):**

```typescript
} catch (error) {
  console.error("Subscription error:", error);
  return NextResponse.json(
    {
      error: {
        message: "Failed to process subscription", // ✅ Generic message
        statusText: "Internal Server Error",
      },
    },
    { status: 500 }
  );
}
```

**Facebook Route (Format 3):**

```typescript
} catch (error) {
  console.error("Facebook data deletion error", error);
  return NextResponse.json(
    { error: "Unable to process data deletion request" }, // ✅ Generic message
    { status: 500 }
  );
}
```

### Security Risks

1. **Manual Security (Error-Prone)**
   - ⚠️ Developer must remember to use generic messages
   - ⚠️ Easy to accidentally expose error details
   - ⚠️ No enforcement mechanism
   - ⚠️ Inconsistent implementation across routes

2. **Example of What Could Go Wrong**

   **Bad (Accidental Information Leak):**

   ```typescript
   } catch (error) {
     // ❌ DANGEROUS: Exposes internal error details
     return NextResponse.json(
       {
         error: {
           message: error.message, // Could contain sensitive info!
           statusText: "Internal Server Error",
         },
       },
       { status: 500 }
     );
   }
   ```

   **What Could Leak:**

   ```json
   {
     "error": {
       "message": "Database connection failed: postgresql://user:password@db.internal:5432/holiday_promo",
       "statusText": "Internal Server Error"
     }
   }
   ```

3. **No Environment Awareness**
   - ⚠️ Can't show helpful details in development
   - ⚠️ Must manually check `NODE_ENV` everywhere
   - ⚠️ Easy to forget environment checks

---

## Enhanced Format 1 with Security

### Solution: Add Security to Format 1

You can get **all the security benefits of Format 2** while keeping Format 1's structure and flexibility:

```typescript
// apps/web/src/utils/api-error-response.ts

/**
 * Creates a secure, structured error response
 * Automatically hides error details in production
 */
export function createApiErrorResponse(
  userMessage: string,
  status: number,
  options?: {
    error?: unknown; // Original error (only shown in dev)
    statusText?: string;
    details?: Record<string, unknown>; // Additional context (dev only)
  }
): NextResponse {
  const isDevelopment = process.env.NODE_ENV === "development";
  const statusText = options?.statusText || getStatusText(status);

  const response: {
    error: {
      message: string;
      statusText: string;
      details?: unknown;
      originalError?: string;
    };
  } = {
    error: {
      message: userMessage,
      statusText,
    },
  };

  // Only include error details in development
  if (isDevelopment) {
    if (options?.error) {
      const errorMessage =
        options.error instanceof Error
          ? options.error.message
          : String(options.error);
      response.error.originalError = errorMessage;
    }
    if (options?.details) {
      response.error.details = options.details;
    }
  }

  return NextResponse.json(response, { status });
}

/**
 * Helper for common error status codes
 */
function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
  };
  return statusTexts[status] || "Error";
}
```

### Usage Examples

**Client Errors (400, 401, 403, 404):**

```typescript
// Validation error - safe to show specific message
return createApiErrorResponse("Invalid email address", 400, {
  statusText: "Bad Request",
});
```

**Server Errors (500):**

```typescript
// Internal error - generic message, details only in dev
try {
  await db.insert(...);
} catch (error) {
  console.error("Database error:", error);
  return createApiErrorResponse(
    "Failed to process subscription", // Generic user message
    500,
    {
      error, // Original error (only shown in dev)
      statusText: "Internal Server Error",
    }
  );
}
```

### Security Benefits

1. **Automatic Protection**
   - ✅ Error details automatically hidden in production
   - ✅ Same security as Format 2
   - ✅ Environment-aware by default

2. **Maintains Format 1 Structure**
   - ✅ Keeps structured error object
   - ✅ Matches Better Auth format
   - ✅ Flexible and extensible

3. **Best of Both Worlds**
   - ✅ Security of Format 2
   - ✅ Structure and flexibility of Format 1
   - ✅ Centralized utility function

---

## Security Comparison

| Security Feature              | Format 1 (Current) | Format 1 (Enhanced) | Format 2               |
| ----------------------------- | ------------------ | ------------------- | ---------------------- |
| **Auto-hide details in prod** | ❌ Manual          | ✅ Automatic        | ✅ Automatic           |
| **Environment-aware**         | ❌ Manual          | ✅ Built-in         | ✅ Built-in            |
| **Centralized security**      | ❌ Per-route       | ✅ Utility function | ✅ Utility function    |
| **Fail-safe default**         | ❌ No              | ✅ Yes              | ✅ Yes                 |
| **Can show details in dev**   | ⚠️ Manual          | ✅ Automatic        | ✅ Automatic           |
| **Structured format**         | ✅ Yes             | ✅ Yes              | ❌ Different structure |
| **Better Auth compatible**    | ✅ Yes             | ✅ Yes              | ❌ No                  |

---

## Security Best Practices

### 1. Never Expose Internal Errors Directly

**❌ BAD:**

```typescript
catch (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

**✅ GOOD:**

```typescript
catch (error) {
  console.error("Error:", error); // Log for monitoring
  return createApiErrorResponse(
    "An error occurred", // Generic user message
    500,
    { error } // Details only in dev
  );
}
```

### 2. Sanitize Error Messages

**❌ BAD:**

```typescript
catch (error) {
  return NextResponse.json({
    error: {
      message: `Database error: ${error.message}`, // Could contain sensitive info
    },
  });
}
```

**✅ GOOD:**

```typescript
catch (error) {
  // Log full error for monitoring
  logError(error, { context: "subscription" });

  // Return generic message to user
  return createApiErrorResponse(
    "Failed to process subscription",
    500,
    { error } // Only shown in dev
  );
}
```

### 3. Use Environment Checks

**✅ GOOD:**

```typescript
const isDevelopment = process.env.NODE_ENV === "development";

if (isDevelopment) {
  // Show helpful details for debugging
  response.error.details = { stack: error.stack };
}
```

### 4. Log Errors Securely

**✅ GOOD:**

```typescript
// Log full error with context (server-side only)
console.error("Subscription error:", {
  message: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString(),
  // Don't log sensitive user data
});
```

---

## Recommendation: Enhanced Format 1

**For maximum security while maintaining flexibility:**

1. **Use Enhanced Format 1** (Format 1 structure + Format 2 security)
2. **Create utility functions** that enforce security automatically
3. **Standardize across all routes** for consistency

**Benefits:**

- ✅ Automatic security (like Format 2)
- ✅ Structured format (like Format 1)
- ✅ Better Auth compatible
- ✅ Flexible and extensible
- ✅ Environment-aware
- ✅ Centralized security policy

**Implementation:**

- Create `createApiErrorResponse()` utility with built-in security
- Update all routes to use the utility
- Document security policy in code

---

## Security Checklist

When implementing error responses, ensure:

- [ ] Error details are never exposed in production
- [ ] Generic user-friendly messages are used
- [ ] Environment checks are in place
- [ ] Sensitive data is never in error messages
- [ ] Errors are logged server-side for monitoring
- [ ] Stack traces are hidden from clients
- [ ] Database errors are sanitized
- [ ] File paths are not exposed
- [ ] API keys/secrets are never in errors
- [ ] User data is not leaked in errors

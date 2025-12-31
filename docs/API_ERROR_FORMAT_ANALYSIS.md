# API Error Response Format Analysis

This document analyzes the three different error response formats currently used in the codebase and evaluates their pros and cons.

## Current Formats

### Format 1: Structured Error Object (subscribe, auth routes)

**Structure:**

```typescript
NextResponse.json(
  {
    error: {
      message: "Turnstile verification is required",
      statusText: "Bad Request",
    },
  },
  { status: 400 }
);
```

**Used in:**

- `apps/web/src/app/api/subscribe/route.ts`
- `apps/web/src/app/api/auth/[...all]/route.ts`

**Example Response:**

```json
{
  "error": {
    "message": "Turnstile verification is required",
    "statusText": "Bad Request"
  }
}
```

**Pros:**

- ✅ Structured and consistent
- ✅ Provides both user-friendly message and HTTP status text
- ✅ Easy to parse on client side
- ✅ Can be extended with additional fields (code, details, etc.)
- ✅ Matches Better Auth error format expectations
- ✅ Type-safe with TypeScript interfaces
- ✅ Already used in 2 routes (most common pattern)

**Cons:**

- ⚠️ Slightly more verbose than simple string format
- ⚠️ Requires consistent structure across all routes

---

### Format 2: Utility Function (rpc route)

**Structure:**

```typescript
createErrorResponse(error); // Returns Response with:
{
  message: "Internal server error",
  ...(isDevelopment && { error: errorMessage })
}
```

**Used in:**

- `apps/web/src/app/api/rpc/[[...rest]]/route.ts`
- `apps/web/src/utils/error-response.ts` (utility function)

**Example Response (Production):**

```json
{
  "message": "Internal server error"
}
```

**Example Response (Development):**

```json
{
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

**Pros:**

- ✅ Centralized error handling
- ✅ Environment-aware (hides details in production)
- ✅ Consistent format via utility function
- ✅ Security-focused (doesn't leak error details in production)
- ✅ DRY principle (single source of truth)

**Cons:**

- ❌ Only handles 500 errors (hardcoded status)
- ❌ Different structure from Format 1 (no `error` wrapper)
- ❌ Less flexible for different error types (400, 401, 403, etc.)
- ❌ Doesn't provide status text
- ❌ Limited to internal server errors

**Current Implementation:**

```typescript
export function createErrorResponse(error: unknown): Response {
  const isDevelopment = process.env.NODE_ENV === "development";
  const errorMessage = error instanceof Error ? error.message : String(error);

  return new Response(
    JSON.stringify({
      message: "Internal server error",
      ...(isDevelopment && { error: errorMessage }),
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}
```

---

### Format 3: Simple String Error (facebook route)

**Structure:**

```typescript
NextResponse.json({ error: "signed_request missing" }, { status: 400 });
```

**Used in:**

- `apps/web/src/app/api/facebook/data-deletion/route.ts`

**Example Response:**

```json
{
  "error": "signed_request missing"
}
```

**Pros:**

- ✅ Simple and concise
- ✅ Easy to read and understand
- ✅ Minimal payload size
- ✅ Quick to implement

**Cons:**

- ❌ No structure for additional error metadata
- ❌ Inconsistent with other routes
- ❌ Harder to extend with error codes, details, etc.
- ❌ No status text field
- ❌ Less type-safe (just a string)
- ❌ Doesn't match Better Auth expectations

---

## Comparison Matrix

| Feature                | Format 1 (Structured) | Format 2 (Utility)  | Format 3 (Simple) |
| ---------------------- | --------------------- | ------------------- | ----------------- |
| **Consistency**        | ✅ Used in 2 routes   | ⚠️ Only 1 route     | ❌ Only 1 route   |
| **Flexibility**        | ✅ High               | ❌ Low (500 only)   | ⚠️ Medium         |
| **Type Safety**        | ✅ Strong             | ✅ Strong           | ⚠️ Weak           |
| **Extensibility**      | ✅ Easy to extend     | ⚠️ Limited          | ❌ Hard to extend |
| **Security**           | ⚠️ Manual             | ✅ Built-in         | ⚠️ Manual         |
| **Better Auth Compat** | ✅ Matches            | ❌ Different        | ❌ Different      |
| **Client Parsing**     | ✅ Easy               | ✅ Easy             | ✅ Easy           |
| **Verbosity**          | ⚠️ More verbose       | ✅ Moderate         | ✅ Minimal        |
| **Centralization**     | ❌ Manual             | ✅ Utility function | ❌ Manual         |

---

## Recommendations

### Option A: Standardize on Format 1 (Structured Error Object) ⭐ **RECOMMENDED**

**Rationale:**

- Already used in 2 routes (most common)
- Matches Better Auth error format expectations
- Most flexible and extensible
- Type-safe and structured
- Can be enhanced with utility functions

**Implementation:**

1. Create utility functions for common error responses:

   ```typescript
   // apps/web/src/utils/api-error-response.ts
   export function createApiErrorResponse(
     message: string,
     status: number,
     statusText?: string
   ): NextResponse {
     return NextResponse.json(
       {
         error: {
           message,
           statusText: statusText || getStatusText(status),
         },
       },
       { status }
     );
   }
   ```

2. Update Format 2 (rpc route) to use structured format for consistency
3. Update Format 3 (facebook route) to use structured format

**Pros:**

- Consistent across all routes
- Maintains flexibility
- Can add utility functions for DRY
- Matches Better Auth format

**Cons:**

- Requires updating 2 routes
- Slightly more verbose than Format 3

---

### Option B: Enhance Format 2 (Utility Function) to Support All Status Codes

**Rationale:**

- Centralized error handling
- Environment-aware security
- DRY principle

**Implementation:**

1. Enhance `createErrorResponse` to support all status codes:

   ```typescript
   export function createErrorResponse(
     error: unknown,
     status: number = 500,
     userMessage?: string
   ): Response {
     const isDevelopment = process.env.NODE_ENV === "development";
     const errorMessage =
       error instanceof Error ? error.message : String(error);

     return new Response(
       JSON.stringify({
         error: {
           message: userMessage || getDefaultMessage(status),
           statusText: getStatusText(status),
           ...(isDevelopment && { details: errorMessage }),
         },
       }),
       {
         status,
         headers: { "Content-Type": "application/json" },
       }
     );
   }
   ```

2. Update all routes to use this utility

**Pros:**

- Centralized and DRY
- Security built-in
- Consistent format

**Cons:**

- Requires significant refactoring
- Different from Better Auth format
- Less flexible than Format 1

---

### Option C: Hybrid Approach

**Rationale:**

- Use Format 1 for client-facing errors (400, 401, 403, 404)
- Use Format 2 (enhanced) for server errors (500)

**Implementation:**

1. Create two utility functions:
   - `createClientErrorResponse()` - For 4xx errors (Format 1)
   - `createServerErrorResponse()` - For 5xx errors (Format 2 enhanced)

**Pros:**

- Best of both worlds
- Clear distinction between client and server errors

**Cons:**

- More complex
- Two patterns to maintain

---

## Recommendation Summary

**Recommended: Option A - Standardize on Format 1 (Structured Error Object)**

**Reasons:**

1. Already the most common pattern (2 routes)
2. Matches Better Auth expectations
3. Most flexible and extensible
4. Can be enhanced with utility functions for DRY
5. Type-safe and structured
6. Minimal refactoring needed (only 2 routes to update)

**Next Steps:**

1. Create utility functions for Format 1 to reduce duplication
2. Update rpc route to use Format 1
3. Update facebook route to use Format 1
4. Document the standard in API documentation

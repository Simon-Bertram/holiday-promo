# Error Handling Documentation

This document outlines the error handling strategy implemented in the Holiday Promo application, following [Next.js 16 error handling best practices](https://nextjs.org/docs/app/getting-started/error-handling).

## Overview

Error handling in this application follows Next.js best practices, distinguishing between:

1. **Expected Errors** - Handled as return values or thrown `ORPCError` instances
2. **Uncaught Exceptions** - Handled by Error Boundaries

Our multi-layered approach includes:

1. **Error Boundaries** - Catch React rendering errors
2. **API Route Error Handling** - Handle server-side errors
3. **oRPC Error Handling** - Structured error responses
4. **Client-side Error Handling** - User-friendly error states

## Error Boundaries

Error boundaries are React components that catch JavaScript errors in their child component tree. We've implemented error boundaries at key boundaries:

### Global Error Boundary (`error.tsx`)

- **Location**: `apps/web/src/app/error.tsx`
- **Purpose**: Catches errors in the application layout
- **Features**:
  - User-friendly error message
  - "Try again" button to reset the error
  - Error details shown in development mode
  - Links to go home

### Root Error Boundary (`global-error.tsx`)

- **Location**: `apps/web/src/app/global-error.tsx`
- **Purpose**: Catches errors in the root layout (html/body)
- **Features**:
  - Must be a client component
  - Provides fallback UI when the entire app crashes
  - Minimal styling (doesn't rely on theme or providers)

### Route-specific Error Boundaries

- **Dashboard**: `apps/web/src/app/dashboard/error.tsx`
- **Todos**: `apps/web/src/app/todos/error.tsx`
- **Login**: `apps/web/src/app/login/error.tsx`

These catch errors in specific routes and provide contextual error messages.

### 404 Not Found

- **Location**: `apps/web/src/app/not-found.tsx`
- **Purpose**: Handles page not found errors
- **Features**: User-friendly message with link to home

## API Route Error Handling

### oRPC Error Handling

The oRPC API routes implement comprehensive error handling:

#### Error Interceptors

**Location**: `apps/web/src/app/api/rpc/[[...rest]]/route.ts`

```typescript
const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error("RPC Error:", {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        cause: error.cause,
      });
      // In production, log to external service (e.g., Sentry)
    }),
  ],
});
```

#### Try/Catch in Request Handler

```typescript
async function handleRequest(req: NextRequest) {
  try {
    const context = await createContext(req);
    // ... handle request
  } catch (error) {
    console.error("Unexpected error in handleRequest:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : String(error),
        }),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
```

## oRPC Procedure Error Handling

### Error Handling in Procedures

Following Next.js best practices, we **avoid try/catch for expected errors** and instead handle them explicitly. Unexpected errors (bugs) bubble up to error boundaries automatically.

**Example from todo router**:

```typescript
export const todoRouter = {
  getAll: publicProcedure.handler(async () => {
    // Let database errors bubble up to error boundary
    return await db.select().from(todo);
  }),

  toggle: publicProcedure.handler(async ({ input }) => {
    const result = await db
      .update(todo)
      .set({ completed: input.completed })
      .where(eq(todo.id, input.id))
      .returning();

    // Handle expected error - resource not found
    if (result.length === 0) {
      throw new ORPCError("NOT_FOUND", {
        message: "Todo not found",
      });
    }

    return result[0];
  }),
};
```

**Key principle**: Throw `ORPCError` for expected errors (UNAUTHORIZED, NOT_FOUND), let unexpected errors (database failures, bugs) bubble up to be caught by error boundaries.

### Structured Error Responses

oRPC provides structured error codes:

- `UNAUTHORIZED` - Authentication required
- `NOT_FOUND` - Resource not found
- `INTERNAL_SERVER_ERROR` - Server-side error
- `BAD_REQUEST` - Invalid request

**Example usage**:

```typescript
if (!context.session?.user) {
  throw new ORPCError("UNAUTHORIZED", {
    message: "You must be logged in to access this resource",
  });
}

if (result.length === 0) {
  throw new ORPCError("NOT_FOUND", {
    message: "Todo not found",
  });
}
```

## Client-side Error Handling

### Authentication Error Handling

Authentication errors are handled using a structured approach similar to oRPC error handling patterns:

**Location**: `apps/web/src/lib/errors/auth-errors.ts`

```typescript
// Normalize Better Auth errors to structured format
const normalizedError = normalizeAuthError(error);

// Log error for monitoring
logAuthError(normalizedError, { email, timestamp });

// Show user-friendly error message
toast.error(normalizedError.message);
```

**Error Types**:

- `INVALID_CREDENTIALS` - Invalid email or password
- `UNAUTHORIZED` - Authentication required
- `ACCOUNT_LOCKED` - Account temporarily locked
- `EMAIL_NOT_VERIFIED` - Email verification required
- `NETWORK_ERROR` - Connection issues
- `UNKNOWN_ERROR` - Unexpected errors

**Usage in hooks** (`apps/web/src/hooks/use-sign-in.ts`):

```typescript
export function useSignIn() {
  const signIn = async (data: SignInFormData) => {
    try {
      await authClient.signIn.email(data, {
        onSuccess: () => router.push("/dashboard"),
        onError: (error) => {
          const normalizedError = normalizeAuthError(error);
          logAuthError(normalizedError, { email: data.email });
          toast.error(normalizedError.message);
        },
      });
    } catch (error) {
      // Handle unexpected errors
      const normalizedError = normalizeAuthError(error);
      logAuthError(normalizedError, { email: data.email });
      toast.error(normalizedError.message);
    }
  };
}
```

### React Query Error Handling

The query client is configured with error handling in `apps/web/src/utils/orpc.ts`:

```typescript
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});
```

### Component-level Error States

Components handle loading and error states explicitly:

```typescript
if (privateData.isLoading) {
  return <p>Loading...</p>;
}

if (privateData.isError) {
  return (
    <div className="rounded-md bg-destructive/10 p-4 text-destructive">
      Failed to load data.
    </div>
  );
}
```

### Mutation Error Handling

Mutations include onError callbacks:

```typescript
const createMutation = useMutation(
  orpc.todo.create.mutationOptions({
    onSuccess: () => {
      todos.refetch();
      setNewTodoText("");
    },
    onError: (error) => {
      console.error("Error creating todo:", error);
    },
  })
);
```

## Context Creation Error Handling

The context creator includes error handling to prevent authentication errors from breaking the entire app:

```typescript
export async function createContext(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    return {
      session,
    };
  } catch (error) {
    console.error("Error creating context:", error);
    return {
      session: null,
    };
  }
}
```

## Middleware Error Handling

Authentication middleware includes error handling:

```typescript
const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "You must be logged in to access this resource",
    });
  }
  try {
    return await next({
      context: {
        session: context.session,
      },
    });
  } catch (error) {
    console.error("Error in requireAuth middleware:", error);
    throw error;
  }
});
```

## Best Practices

Following [Next.js error handling best practices](https://nextjs.org/docs/app/getting-started/error-handling):

### ✅ DO

1. **Handle expected errors as return values or throw ORPCError**

   - Model expected errors (validation failures, not found) as return values
   - Throw `ORPCError` for structured expected errors
   - Let unexpected errors (bugs) bubble up to error boundaries

2. **Use error boundaries at module boundaries**

   - Place `error.tsx` files where errors should be caught
   - Use `global-error.tsx` for root-level errors

3. **Provide user-friendly error messages**

   - Avoid technical jargon
   - Offer actionable steps (e.g., "Try again" button)
   - Show helpful context when appropriate

4. **Log errors to external services in production**

   - Add Sentry or similar service
   - Include relevant context (user, request, stack trace)
   - Filter sensitive information

5. **Use try/catch ONLY for parsing operations**

   - JSON parsing
   - Date parsing
   - Number conversion
   - **Not for rendering or data fetching**

6. **Handle async errors properly**

   - Use onError callbacks in React Query mutations
   - Let Server Component errors bubble to boundaries

7. **Return appropriate error codes**
   - Use ORPCError for structured expected errors
   - Return proper HTTP status codes

### ❌ DON'T

1. **Don't use try/catch for rendering logic or Server Components**

   - Error boundaries handle rendering errors
   - Don't wrap Server Component rendering in try/catch
   - Don't wrap data fetching in Server Components with try/catch

2. **Don't model uncaught exceptions as return values**

   - Uncaught exceptions indicate bugs - let them bubble to error boundaries
   - Only use return values for expected errors (validation, etc.)

3. **Don't show technical error messages to users in production**

   - Hide stack traces
   - Sanitize error messages
   - Use environment checks

4. **Don't swallow errors**

   - Always log errors
   - Re-throw errors when appropriate
   - Don't use empty catch blocks

5. **Don't rely solely on console.error in production**
   - Implement proper error tracking
   - Monitor error rates
   - Alert on critical errors

## Future Improvements

1. **Error Tracking Service Integration**

   - Add Sentry or similar service
   - Implement error grouping and deduplication
   - Set up alerts for critical errors

2. **Error Analytics**

   - Track error rates per route
   - Monitor error trends over time
   - Identify common error patterns

3. **Enhanced Error Messages**

   - Localization support
   - Context-specific messages
   - Suggested solutions

4. **Retry Logic**
   - Implement automatic retries for transient errors
   - Exponential backoff
   - Maximum retry limits

## Testing Error Handling

To test error handling:

1. **Simulate network errors**: Disable network in dev tools
2. **Simulate API errors**: Throw errors in procedures
3. **Simulate rendering errors**: Throw errors in components
4. **Simulate authentication errors**: Access protected routes without auth

## Related Files

- Error Boundaries: `apps/web/src/app/error.tsx`
- Global Error: `apps/web/src/app/global-error.tsx`
- Not Found: `apps/web/src/app/not-found.tsx`
- Login Error: `apps/web/src/app/login/error.tsx`
- API Routes: `apps/web/src/app/api/rpc/[[...rest]]/route.ts`
- Todo Router: `packages/api/src/routers/todo.ts`
- Context: `packages/api/src/context.ts`
- Middleware: `packages/api/src/index.ts`
- Query Client: `apps/web/src/utils/orpc.ts`
- Auth Error Utilities: `apps/web/src/lib/errors/auth-errors.ts`
- Sign In Hook: `apps/web/src/hooks/use-sign-in.ts`

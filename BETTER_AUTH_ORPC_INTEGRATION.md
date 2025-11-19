# Better Auth & oRPC Integration Guide

This document explains how Better Auth and oRPC work together in this application to provide authentication and API access.

## Overview

This application uses a **two-layer authentication architecture**:

1. **Better Auth** - Handles authentication (sign in, sign out, session management)
2. **oRPC** - Handles business logic API calls with session-based authorization

The two systems work together seamlessly: Better Auth manages sessions via cookies, and oRPC uses those sessions to authorize API requests.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Side                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  authClient (Better Auth)          client/orpc (oRPC)        │
│  ├─ signIn()                      ├─ client.user.delete()   │
│  ├─ signOut()                     ├─ orpc.user.list()      │
│  └─ useSession()                  └─ orpc.user.me()        │
│                                                               │
└───────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │ (with cookies)
                         │
┌───────────────────────▼─────────────────────────────────────┐
│                      Server Side                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /api/auth/[...all]              /api/rpc/[[...rest]]       │
│  ├─ Better Auth Handler         ├─ oRPC Handler            │
│  └─ Session Management           ├─ createContext()         │
│                                  └─ auth.api.getSession()   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### 1. User Signs In

```typescript
// Client-side (e.g., apps/web/src/hooks/use-sign-in.ts)
await authClient.signIn.email({
  email: "user@example.com",
  password: "password"
})
```

**What happens:**
- Request goes to `/api/auth/sign-in` (Better Auth endpoint)
- Better Auth validates credentials
- Creates a session in the database
- Sets session cookie in the browser
- Returns success/error response

### 2. Session Cookie is Set

Better Auth automatically sets an HTTP-only cookie containing the session token. This cookie is:
- Sent with every subsequent request
- Used by oRPC to identify the authenticated user
- Managed by Better Auth's `nextCookies()` plugin

## API Request Flow

### 1. Client Makes oRPC Call

```typescript
// Option 1: Direct client call
await client.user.delete()

// Option 2: React Query hook
const { data } = useQuery(orpc.user.me.queryOptions())
```

**What happens:**
- Request goes to `/api/rpc` endpoint
- Includes session cookie (via `credentials: "include"`)

### 2. Server Creates Context

```typescript
// packages/api/src/context.ts
export async function createContext(req: NextRequest): Promise<Context> {
  const session = await auth.api.getSession({
    headers: req.headers,  // Contains the session cookie
  })
  
  return {
    session: session ?? null
  }
}
```

**What happens:**
- Extracts session cookie from request headers
- Calls `auth.api.getSession()` to validate and retrieve session
- Returns context with session (or null if not authenticated)

### 3. oRPC Handler Processes Request

```typescript
// apps/web/src/app/api/rpc/[[...rest]]/route.ts
async function handleRequest(req: NextRequest) {
  const context = await createContext(req)  // Gets session from Better Auth
  
  const rpcResult = await rpcHandler.handle(req, {
    prefix: "/api/rpc",
    context,  // Session is now available in all procedures
  })
  
  return rpcResult.response
}
```

### 4. Procedure Executes with Session

```typescript
// packages/api/src/routers/user.ts
export const userRouter = {
  delete: protectedProcedure.handler(async ({ context }) => {
    // context.session is available here
    const userId = context.session.user.id
    await db.delete(user).where(eq(user.id, userId))
  })
}
```

## Key Components

### Better Auth Configuration

**Location:** `packages/auth/src/index.ts`

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  plugins: [nextCookies()],  // Enables cookie-based sessions
  // ... other config
})
```

**Responsibilities:**
- User authentication (email/password, OAuth)
- Session management
- Cookie handling
- Database operations for auth tables

### oRPC Context Creation

**Location:** `packages/api/src/context.ts`

```typescript
export async function createContext(req: NextRequest): Promise<Context> {
  const session = await auth.api.getSession({
    headers: req.headers,
  })
  
  return { session }
}
```

**Responsibilities:**
- Extracts session from request cookies
- Validates session with Better Auth
- Provides session to all oRPC procedures

### oRPC Procedures

**Location:** `packages/api/src/index.ts`

```typescript
// Public procedure - no auth required
export const publicProcedure = o

// Protected procedure - requires valid session
export const protectedProcedure = publicProcedure.use(requireAuth)

// Admin procedure - requires admin role
export const adminProcedure = protectedProcedure.use(requireRole("admin"))
```

**Responsibilities:**
- Define access levels (public, protected, admin)
- Enforce authentication/authorization
- Provide session context to handlers

### Client-Side Setup

**Location:** `apps/web/src/utils/orpc.ts`

```typescript
export const link = new RPCLink({
  url: "/api/rpc",
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",  // Sends cookies with requests
    })
  },
})

export const client = createORPCClient(link)
export const orpc = createTanstackQueryUtils(client)
```

**Responsibilities:**
- Configure oRPC client
- Ensure cookies are sent with requests
- Provide React Query integration

## Usage Examples

### Authentication (Better Auth)

```typescript
// Sign in
await authClient.signIn.email({
  email: "user@example.com",
  password: "password"
})

// Sign out
authClient.signOut({
  fetchOptions: {
    onSuccess: () => {
      router.push("/")
    }
  }
})

// Check session
const { data: session } = authClient.useSession()
```

### API Calls (oRPC)

```typescript
// Direct call (no caching)
await client.user.delete()

// React Query hook (with caching)
const { data, isLoading } = useQuery(orpc.user.me.queryOptions())

// Mutation
const deleteMutation = useMutation({
  mutationFn: () => client.user.delete(),
  onSuccess: () => {
    toast.success("Account deleted")
  }
})
```

### Protected Procedures

```typescript
// packages/api/src/routers/user.ts
export const userRouter = {
  // Requires authentication
  me: protectedProcedure.handler(({ context }) => {
    return context.session.user  // Session guaranteed to exist
  }),
  
  // Requires admin role
  list: adminProcedure.handler(async () => {
    return db.select().from(user)  // Only admins can access
  }),
  
  // Public access
  healthCheck: publicProcedure.handler(() => "OK")
}
```

## Data Flow Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Sign In Request
       ▼
┌─────────────────────┐
│ /api/auth/sign-in   │  Better Auth
│ (Better Auth)       │  - Validates credentials
│                     │  - Creates session
│                     │  - Sets cookie
└─────────────────────┘
       │
       │ 2. Cookie Set
       ▼
┌─────────────┐
│   Browser   │  Cookie stored
│  (Cookie)   │
└──────┬──────┘
       │
       │ 3. API Request (with cookie)
       ▼
┌─────────────────────┐
│ /api/rpc            │  oRPC Handler
│                     │
│  createContext()    │  - Extracts cookie
│       │             │  - Calls auth.api.getSession()
│       ▼             │
│  auth.api.getSession│  Better Auth
│       │             │  - Validates cookie
│       ▼             │  - Returns session
│  Context { session } │
└──────┬──────────────┘
       │
       │ 4. Procedure Execution
       ▼
┌─────────────────────┐
│ protectedProcedure  │  - Checks context.session
│ .handler()          │  - Executes business logic
│                     │  - Returns result
└─────────────────────┘
```

## Best Practices

### 1. Use Better Auth for Authentication

✅ **Do:**
- Use `authClient.signIn()` for authentication
- Use `authClient.signOut()` for signing out
- Use `authClient.useSession()` to check auth status

❌ **Don't:**
- Don't create custom auth endpoints when Better Auth provides them
- Don't manually manage session cookies

### 2. Use oRPC for Business Logic

✅ **Do:**
- Use `client` for direct API calls
- Use `orpc` hooks for React Query integration
- Define business logic in oRPC routers

❌ **Don't:**
- Don't mix authentication logic with business logic
- Don't bypass oRPC procedures for data access

### 3. Session Access in Procedures

✅ **Do:**
```typescript
protectedProcedure.handler(({ context }) => {
  // context.session is guaranteed to exist
  const userId = context.session.user.id
})
```

❌ **Don't:**
```typescript
publicProcedure.handler(({ context }) => {
  // context.session might be null
  const userId = context.session?.user.id  // ❌ Use protectedProcedure instead
})
```

### 4. Error Handling

✅ **Do:**
```typescript
try {
  await client.user.delete()
} catch (error) {
  // Handle ORPCError
  if (error.code === "UNAUTHORIZED") {
    // Redirect to login
  }
}
```

## Common Patterns

### Pattern 1: Delete Account with Sign Out

```typescript
const handleDelete = async () => {
  try {
    // 1. Delete account via oRPC
    await client.user.delete()
    
    // 2. Sign out via Better Auth
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
        }
      }
    })
  } catch (error) {
    toast.error("Failed to delete account")
  }
}
```

### Pattern 2: Protected Route with Session Check

```typescript
// Server Component
export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  
  if (!session) {
    redirect("/login")
  }
  
  return <ProfileContent user={session.user} />
}
```

### Pattern 3: Client-Side Session Check

```typescript
// Client Component
function ProtectedComponent() {
  const { data: session, isPending } = authClient.useSession()
  
  if (isPending) return <Loading />
  if (!session) return <LoginPrompt />
  
  return <ProtectedContent />
}
```

## Troubleshooting

### Issue: Session not available in oRPC procedures

**Solution:** Ensure `credentials: "include"` is set in the oRPC link configuration.

### Issue: Unauthorized errors on protected routes

**Check:**
1. Is the user signed in? (Check `authClient.useSession()`)
2. Is the cookie being sent? (Check browser DevTools → Network → Cookies)
3. Is the session valid? (Check `auth.api.getSession()` in `createContext`)

### Issue: Session exists but user data is missing

**Solution:** Ensure Better Auth session includes the user role field. Check `packages/auth/src/index.ts` for `user.additionalFields.role` configuration.

## Summary

- **Better Auth** = Authentication & session management
- **oRPC** = Business logic API with session-based authorization
- **Integration** = oRPC uses Better Auth sessions via cookies
- **Flow** = Sign in → Cookie set → API request → Context created → Session validated → Procedure executes

This architecture provides:
- ✅ Secure, cookie-based authentication
- ✅ Type-safe API calls
- ✅ Automatic session validation
- ✅ Role-based access control
- ✅ Seamless integration between auth and business logic


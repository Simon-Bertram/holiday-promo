# Security Audit Report: Authentication Bypass & OWASP Top 10 Analysis

**Date:** 2025-01-27  
**Scope:** Authentication mechanisms, API security, and OWASP Top 10 vulnerabilities

---

## Executive Summary

This audit identified **several critical and high-severity vulnerabilities** that could allow authentication bypass and expose the application to various attacks. The application uses Better Auth for session management and oRPC for API calls, but several security gaps exist.

---

## 🔴 CRITICAL VULNERABILITIES

### 1. **Authentication Bypass via GET Requests** (CRITICAL)

**Location:** `apps/web/src/app/api/auth/[...all]/route.ts`

**Issue:**
The Turnstile validation only applies to POST requests. GET requests bypass validation entirely:

```61:63:apps/web/src/app/api/auth/[...all]/route.ts
export function GET(req: NextRequest) {
  return authHandler.GET(req);
}
```

**Vulnerability:**
- GET requests to auth endpoints bypass Turnstile validation
- Better Auth may expose sensitive endpoints via GET (session info, user data)
- No rate limiting on GET requests

**Impact:**
- Potential information disclosure
- Session enumeration
- Bypass of bot protection

**Recommendation:**
```typescript
export function GET(req: NextRequest) {
  // Validate Turnstile for sensitive GET endpoints
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  // Protect session/user info endpoints
  if (pathname.includes('/session') || pathname.includes('/user')) {
    // Require authentication or additional validation
  }
  
  return authHandler.GET(req);
}
```

---

### 2. **Missing Rate Limiting** (CRITICAL)

**Issue:**
No rate limiting is implemented on:
- Authentication endpoints (`/api/auth/*`)
- API endpoints (`/api/rpc/*`)
- Subscription endpoint (`/api/subscribe`)

**Impact:**
- **Brute force attacks** on authentication
- **DDoS attacks** on API endpoints
- **Email enumeration** via subscription endpoint
- **Resource exhaustion**

**Recommendation:**
Implement rate limiting using:
- Vercel Edge Config + Upstash Redis
- Next.js middleware with rate limiting
- Better Auth rate limiting plugin (if available)

```typescript
// Example: apps/web/src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request: NextRequest) {
  // Rate limit auth endpoints
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)
    if (!success) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }
  
  return NextResponse.next()
}
```

---

### 3. **CSRF Protection Analysis** (UPDATED - MEDIUM)

**Better Auth CSRF Protection:**
Better Auth includes **built-in CSRF protection** with multiple layers:

1. **Avoid Simple Requests** - Only allows requests with:
   - Non-simple headers (e.g., `Content-Type: application/json`)
   - Prevents simple GET/POST form submissions from external sites

2. **Origin Validation** - Verifies `Origin` header against `trustedOrigins`:
```20:20:packages/auth/src/index.ts
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
```

3. **SameSite Cookies** - Uses `SameSite=Lax` by default (via `nextCookies()` plugin)
   - Prevents cookies from being sent with most cross-site requests
   - `Lax` allows cookies on top-level navigation (needed for OAuth)

4. **No Mutations on GET** - GET requests are read-only
   - OAuth callbacks use `state` and `nonce` parameters for validation

**Current Configuration:**
- ✅ Better Auth endpoints (`/api/auth/*`) are protected
- ⚠️ **Gap:** oRPC endpoints (`/api/rpc/*`) may not inherit all CSRF protections
- ⚠️ `trustedOrigins` has empty string fallback (could disable origin check)

**Remaining Risks:**
1. **oRPC Endpoints** - `/api/rpc/*` routes don't go through Better Auth's CSRF checks
   - These endpoints accept state-changing operations (delete, update)
   - Rely on session cookies but may not validate Origin header

2. **Empty String Fallback** - If `CORS_ORIGIN` is not set:
   - `trustedOrigins: [""]` may allow requests from any origin
   - Could bypass origin validation

**Recommendation:**
1. **Fix trustedOrigins configuration:**
```typescript
// packages/auth/src/index.ts
export const auth = betterAuth({
  // ... existing config
  trustedOrigins: process.env.CORS_ORIGIN 
    ? [process.env.CORS_ORIGIN] 
    : (process.env.NODE_ENV === 'production' 
      ? [] // Fail closed in production
      : ['http://localhost:3000']), // Dev fallback
})
```

2. **Add Origin validation to oRPC handler:**
```typescript
// apps/web/src/app/api/rpc/[[...rest]]/route.ts
async function handleRequest(req: NextRequest) {
  // Validate Origin header for state-changing operations
  const origin = req.headers.get('origin')
  const trustedOrigins = [process.env.CORS_ORIGIN || '']
  
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    if (origin && !trustedOrigins.includes(origin)) {
      return new Response('Forbidden', { status: 403 })
    }
  }
  
  // ... rest of handler
}
```

3. **Consider stricter SameSite for non-OAuth flows:**
   - Better Auth uses `Lax` for OAuth compatibility
   - For internal API calls, `Strict` would be more secure
   - This is handled automatically by Better Auth

---

## 🟠 HIGH SEVERITY VULNERABILITIES

### 4. **Insufficient Authorization Checks** (HIGH)

**Location:** `packages/api/src/routers/user.ts`

**Issue:**
Role-based authorization relies solely on session data without re-validation:

```54:66:packages/api/src/routers/user.ts
  // Update current user's profile (name and email) - subscribers only
  updateProfile: protectedProcedure
    .input(updateProfileInputSchema)
    .handler(async ({ context, input }) => {
      // Session is guaranteed to exist by protectedProcedure middleware
      const sessionUser = context.session.user;

      // Only subscribers can update their profile
      if (sessionUser.role !== "subscriber") {
        throw new ORPCError("FORBIDDEN", {
          message: ERROR_MESSAGES.FORBIDDEN.UPDATE_PROFILE,
        });
      }
```

**Vulnerability:**
- Role checks happen after authentication
- If session is compromised or role is modified, authorization may fail
- No database re-validation of user role before critical operations

**Impact:**
- Privilege escalation if session is tampered with
- Role changes not immediately reflected

**Recommendation:**
Re-validate user role from database for critical operations:
```typescript
// Before critical operations, re-fetch user from DB
const dbUser = await db.select().from(user).where(eq(user.id, sessionUser.id)).limit(1)
if (!dbUser || dbUser.role !== "subscriber") {
  throw new ORPCError("FORBIDDEN", ...)
}
```

---

### 5. **Path Traversal in Auth Route Handler** (HIGH)

**Location:** `apps/web/src/app/api/auth/[...all]/route.ts`

**Issue:**
Pathname validation uses `endsWith()` which can be bypassed:

```27:28:apps/web/src/app/api/auth/[...all]/route.ts
  const isMagicLinkSignIn = pathname.endsWith("/sign-in-magic-link");
  const isSignUp = pathname.endsWith("/sign-up");
```

**Vulnerability:**
- `endsWith()` can be bypassed with path traversal: `/api/auth/../sign-in-magic-link`
- URL normalization may not catch all variations

**Impact:**
- Bypass Turnstile validation
- Access protected endpoints

**Recommendation:**
Use exact path matching or normalize URLs:
```typescript
const normalizedPath = new URL(req.url).pathname.replace(/\/+/g, '/')
const isMagicLinkSignIn = normalizedPath === '/api/auth/sign-in-magic-link'
const isSignUp = normalizedPath === '/api/auth/sign-up'
```

---

### 6. **IP Address Spoofing Vulnerability** (HIGH)

**Location:** `apps/web/src/lib/turnstile.ts`

**Issue:**
Client IP extraction from headers is unreliable:

```105:117:apps/web/src/lib/turnstile.ts
export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return;
}
```

**Vulnerability:**
- `X-Forwarded-For` and `X-Real-IP` headers can be spoofed
- No validation that IP comes from trusted proxy
- Turnstile validation uses potentially spoofed IP

**Impact:**
- Bypass IP-based rate limiting
- Bypass IP-based Turnstile validation
- Geolocation-based restrictions bypassed

**Recommendation:**
1. **Trust only specific proxies** (Vercel, Cloudflare)
2. **Use Vercel's built-in IP detection**:
```typescript
// In Vercel, use request.ip (set by platform)
const clientIp = request.ip || 
  (process.env.VERCEL ? undefined : getClientIp(request))
```

3. **Validate proxy headers** against known proxy IPs

---

## 🟡 MEDIUM SEVERITY VULNERABILITIES

### 7. **Information Disclosure in Error Messages** (MEDIUM)

**Location:** Multiple error handlers

**Issue:**
Error messages may leak sensitive information in development mode:

```96:99:apps/web/src/app/api/rpc/[[...rest]]/route.ts
    return createApiErrorResponse("Internal server error", 500, {
      error,
      statusText: "Internal Server Error",
    });
```

**Vulnerability:**
- Error objects passed to response may contain stack traces
- Database errors may leak schema information
- Path information in errors

**Impact:**
- Information disclosure
- Attack surface mapping

**Recommendation:**
Ensure `createApiErrorResponse` sanitizes errors in production:
```typescript
// Verify this utility sanitizes errors
export function createApiErrorResponse(
  message: string,
  status: number,
  options?: { error?: unknown }
) {
  const isDev = process.env.NODE_ENV === 'development'
  return NextResponse.json(
    {
      message,
      ...(isDev && options?.error ? { error: String(options.error) } : {})
    },
    { status }
  )
}
```

---

### 8. **Missing Input Length Limits** (MEDIUM)

**Location:** Validation schemas

**Issue:**
While Zod schemas exist, some may not have sufficient length limits:

```3:9:packages/api/src/routers/user/update-profile.schema.ts
export const updateProfileInputSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please provide a valid email address"),
});
```

**Vulnerability:**
- Email validation doesn't specify max length
- Potential DoS via extremely long email addresses
- Database may not enforce limits

**Impact:**
- Resource exhaustion
- Database errors

**Recommendation:**
Add max length to all string fields:
```typescript
email: z.string()
  .email("Please provide a valid email address")
  .max(255, "Email must be less than 255 characters")
```

---

### 9. **Session Fixation Risk** (MEDIUM)

**Issue:**
No explicit session regeneration on privilege changes or login.

**Impact:**
- If session token is compromised before login, attacker maintains access
- Role changes may not invalidate existing sessions

**Recommendation:**
- Regenerate session on login
- Invalidate all sessions when role changes
- Implement session rotation

---

## 🟢 LOW SEVERITY / BEST PRACTICES

### 10. **Missing Security Headers** (LOW)

**Recommendation:**
Add security headers via Next.js middleware:
```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' challenges.cloudflare.com;"
  )
  
  return response
}
```

---

### 11. **CORS Configuration** (LOW)

**Location:** `packages/auth/src/index.ts`

**Issue:**
CORS origin uses environment variable with empty string fallback:

```20:20:packages/auth/src/index.ts
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
```

**Recommendation:**
- Fail fast if CORS_ORIGIN is not set in production
- Validate CORS origin format
- Use array of allowed origins

---

## OWASP Top 10 2021 Mapping

### A01:2021 – Broken Access Control ✅/❌
- ✅ Protected procedures require authentication
- ❌ Missing rate limiting allows brute force
- ⚠️ CSRF protection exists for Better Auth endpoints, but oRPC endpoints may be vulnerable
- ⚠️ Role checks don't re-validate from database

### A02:2021 – Cryptographic Failures ✅
- ✅ Uses HTTPS (assumed in production)
- ✅ Passwords handled by Better Auth (assumed secure)
- ✅ Session tokens in HTTP-only cookies

### A03:2021 – Injection ✅
- ✅ Uses Drizzle ORM (parameterized queries)
- ✅ Zod validation on inputs
- ✅ No raw SQL queries found

### A04:2021 – Insecure Design ⚠️
- ⚠️ Missing rate limiting design
- ⚠️ No CSRF protection design
- ⚠️ IP spoofing not considered

### A05:2021 – Security Misconfiguration ⚠️
- ⚠️ CORS origin fallback to empty string
- ⚠️ Missing security headers
- ⚠️ Error messages may leak info

### A06:2021 – Vulnerable Components ✅
- ✅ Uses modern, maintained libraries
- ⚠️ No dependency vulnerability scanning mentioned

### A07:2021 – Authentication Failures 🔴
- 🔴 **CRITICAL:** GET requests bypass Turnstile
- 🔴 **CRITICAL:** No rate limiting
- ⚠️ Session fixation risk

### A08:2021 – Software and Data Integrity Failures ✅
- ✅ Uses package manager (Bun)
- ⚠️ No lock file verification in CI/CD

### A09:2021 – Security Logging and Monitoring ⚠️
- ✅ Error logging exists
- ⚠️ No security event monitoring
- ⚠️ No intrusion detection

### A10:2021 – Server-Side Request Forgery (SSRF) ✅
- ✅ No external URL fetching found
- ✅ Turnstile API uses hardcoded URL

---

## Immediate Action Items (Priority Order)

1. **🔴 CRITICAL:** Implement rate limiting on all auth endpoints
2. **🔴 CRITICAL:** Fix GET request bypass in auth route handler
3. **🟠 HIGH:** Add Origin validation to oRPC endpoints (Better Auth already protects its endpoints)
4. **🟠 HIGH:** Fix `trustedOrigins` empty string fallback
4. **🟠 HIGH:** Fix path traversal in pathname validation
5. **🟠 HIGH:** Implement proper IP address validation
6. **🟠 HIGH:** Add database re-validation for role checks
7. **🟡 MEDIUM:** Add security headers via middleware
8. **🟡 MEDIUM:** Sanitize all error messages in production
9. **🟡 MEDIUM:** Add max length to all input validations
10. **🟢 LOW:** Improve CORS configuration validation

---

## Testing Recommendations

1. **Penetration Testing:**
   - Attempt authentication bypass via GET requests
   - Test rate limiting with automated tools
   - Attempt CSRF attacks on state-changing endpoints

2. **Security Scanning:**
   - Run OWASP ZAP or Burp Suite
   - Dependency vulnerability scanning (npm audit, Snyk)
   - SAST (Static Application Security Testing)

3. **Manual Testing:**
   - Test IP spoofing with modified headers
   - Test path traversal variations
   - Test session fixation scenarios

---

## Conclusion

The application has a solid foundation with Better Auth and parameterized queries, but **critical gaps in rate limiting, CSRF protection, and authentication validation** create significant security risks. Immediate remediation of the critical items is strongly recommended before production deployment.

**Overall Security Posture:** 🟠 **NEEDS IMPROVEMENT**

**Risk Level:** **HIGH** - Multiple critical vulnerabilities that could lead to authentication bypass and unauthorized access.


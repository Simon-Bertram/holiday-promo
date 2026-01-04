# Better Auth CSRF Protection Analysis

## Overview

Better Auth includes **built-in, multi-layered CSRF protection** that is enabled by default. This document explains how it works and what protections are in place for your application.

---

## Better Auth's CSRF Protection Mechanisms

Better Auth implements **4 layers of CSRF protection**:

### 1. **Avoid Simple Requests** ✅

Better Auth only allows requests with:
- **Non-simple headers** (prevents basic form submissions from external sites)
- **Content-Type: application/json** (required for JSON requests)

This prevents simple HTML forms on external sites from submitting to your auth endpoints.

**How it works:**
- Browsers enforce CORS preflight for requests with non-simple headers
- Simple requests (GET, POST with form data) are blocked unless they include proper headers
- Better Auth validates that requests have appropriate headers

### 2. **Origin Validation** ✅

Better Auth validates the `Origin` header against a list of trusted origins.

**Your Configuration:**
```typescript
// packages/auth/src/index.ts
trustedOrigins: [process.env.CORS_ORIGIN || ""],
```

**How it works:**
- Each request's `Origin` header is checked
- Requests from untrusted origins are rejected
- Default: trusts your app's base URL
- Additional origins can be added via `trustedOrigins`

**⚠️ Issue in Your Config:**
- Empty string fallback (`|| ""`) could disable origin checking if `CORS_ORIGIN` is not set
- Should fail closed in production

### 3. **SameSite Cookie Protection** ✅

Better Auth uses `SameSite=Lax` cookies by default (via `nextCookies()` plugin).

**How it works:**
- `SameSite=Lax` prevents cookies from being sent with most cross-site requests
- Cookies are only sent with:
  - Same-site requests (your domain)
  - Top-level navigation (needed for OAuth redirects)
- Prevents CSRF attacks from external sites

**Why `Lax` instead of `Strict`:**
- OAuth flows require top-level navigation redirects
- `Strict` would break OAuth callbacks
- `Lax` provides good protection while maintaining OAuth compatibility

**Cookie Security Features:**
- ✅ `httpOnly: true` - Prevents JavaScript access
- ✅ `secure: true` - HTTPS only (when base URL uses HTTPS)
- ✅ `sameSite: 'lax'` - CSRF protection

### 4. **No Mutations on GET Requests** ✅

Better Auth assumes GET requests are read-only and should not alter state.

**Special Case - OAuth Callbacks:**
- OAuth callbacks use GET requests (provider redirects)
- Better Auth adds extra safeguards:
  - Validates `state` parameter (prevents CSRF)
  - Validates `nonce` parameter (prevents replay attacks)
  - Ensures callback belongs to the same browser session

---

## What's Protected

### ✅ Better Auth Endpoints (`/api/auth/*`)

All Better Auth endpoints are protected by the CSRF mechanisms above:
- `/api/auth/sign-in`
- `/api/auth/sign-up`
- `/api/auth/sign-out`
- `/api/auth/session`
- `/api/auth/callback/*` (OAuth)
- All other Better Auth routes

**Protection includes:**
- Origin validation
- SameSite cookie enforcement
- Non-simple request requirement
- State/nonce validation for OAuth

### ⚠️ oRPC Endpoints (`/api/rpc/*`)

**Current Status:**
- oRPC endpoints do **NOT** go through Better Auth's CSRF checks
- They rely on session cookies for authentication
- May not validate `Origin` header

**Risk:**
- State-changing operations (DELETE, PUT, PATCH, POST) could be vulnerable to CSRF
- Examples: `user.delete()`, `user.updateProfile()`

**Why this matters:**
- An attacker could craft a form on `evil.com` that submits to `/api/rpc`
- If user is logged in, the request would include their session cookie
- SameSite=Lax cookies ARE sent with top-level form submissions
- The request could succeed if Origin validation is missing

---

## Current Protection Status

| Endpoint Type | Origin Check | SameSite Cookie | Non-Simple Request | Protection Level |
|--------------|--------------|-----------------|-------------------|------------------|
| `/api/auth/*` | ✅ Yes | ✅ Lax | ✅ Yes | **Strong** |
| `/api/rpc/*` | ⚠️ Unknown | ✅ Lax | ⚠️ Unknown | **Moderate** |
| `/api/subscribe` | ❌ No | ✅ Lax | ✅ JSON | **Moderate** |

---

## Recommendations

### 1. Fix `trustedOrigins` Configuration

**Current (Problematic):**
```typescript
trustedOrigins: [process.env.CORS_ORIGIN || ""],
```

**Recommended:**
```typescript
trustedOrigins: process.env.CORS_ORIGIN
  ? [process.env.CORS_ORIGIN]
  : process.env.NODE_ENV === 'production'
    ? [] // Fail closed in production
    : ['http://localhost:3000'], // Dev fallback
```

**Why:**
- Empty string in `trustedOrigins` may disable origin checking
- Production should fail closed (reject if not configured)
- Development needs a fallback for local testing

### 2. Add Origin Validation to oRPC Handler

**Location:** `apps/web/src/app/api/rpc/[[...rest]]/route.ts`

```typescript
async function handleRequest(req: NextRequest) {
  // Validate Origin for state-changing operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.headers.get('origin')
    const trustedOrigins = process.env.CORS_ORIGIN
      ? [process.env.CORS_ORIGIN]
      : []
    
    // If origin is present, it must be trusted
    if (origin && !trustedOrigins.includes(origin)) {
      return new Response('Forbidden: Invalid origin', { status: 403 })
    }
  }
  
  // ... rest of handler
}
```

### 3. Verify SameSite Cookie Settings

Better Auth's `nextCookies()` plugin should already set `SameSite=Lax`. Verify this is working:

```typescript
// Check in browser DevTools → Application → Cookies
// Session cookie should have:
// - HttpOnly: ✓
// - Secure: ✓ (in production)
// - SameSite: Lax
```

### 4. Consider Additional Protection for Critical Operations

For highly sensitive operations (account deletion, role changes), consider:
- Requiring explicit user confirmation
- Adding a second factor (re-authentication)
- Using POST with explicit CSRF tokens (though SameSite cookies should be sufficient)

---

## Testing CSRF Protection

### Test 1: Origin Validation

```bash
# Should be rejected (wrong origin)
curl -X POST https://your-app.com/api/auth/sign-in \
  -H "Origin: https://evil.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test 2: Simple Request Blocking

```html
<!-- This should fail on external site -->
<form action="https://your-app.com/api/auth/sign-in" method="POST">
  <input name="email" value="test@example.com">
  <button>Submit</button>
</form>
```

### Test 3: oRPC Endpoint Protection

```bash
# Test if oRPC validates origin
curl -X POST https://your-app.com/api/rpc \
  -H "Origin: https://evil.com" \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{"procedure":"user.delete"}'
```

---

## Summary

**Better Auth provides strong CSRF protection** for its own endpoints through:
1. ✅ Origin validation
2. ✅ SameSite cookies (Lax)
3. ✅ Non-simple request requirement
4. ✅ State/nonce validation for OAuth

**Your application has:**
- ✅ Better Auth endpoints are well-protected
- ⚠️ oRPC endpoints may need additional Origin validation
- ⚠️ `trustedOrigins` configuration should be fixed

**Action Items:**
1. Fix `trustedOrigins` empty string fallback
2. Add Origin validation to oRPC handler
3. Test CSRF protection with the methods above

---

## References

- [Better Auth Security Documentation](https://www.better-auth.com/docs/security)
- [MDN: CSRF Prevention](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF)
- [OWASP: CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)


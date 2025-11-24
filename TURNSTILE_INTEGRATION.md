# Cloudflare Turnstile Integration

This document describes the Cloudflare Turnstile CAPTCHA integration for protecting sign-in and sign-up forms from automated abuse.

## Overview

Cloudflare Turnstile is a privacy-first CAPTCHA alternative that protects authentication endpoints without requiring user interaction in most cases. This integration validates Turnstile tokens on both the client and server side to ensure robust security.

## Architecture

The Turnstile integration consists of several components working together:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Side                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Sign-In Form / Sign-Up Form                                 │
│  ├─ TurnstileWidget Component                                │
│  ├─ Captures token on success                                │
│  └─ Includes token in form submission                        │
│                                                               │
│  Auth Hooks (use-sign-in.ts / use-sign-up.ts)                │
│  ├─ Sets token in auth client                                │
│  └─ Sends token via custom fetch header                      │
│                                                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP Request with x-turnstile-token header
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                      Server Side                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /api/auth/[...all]/route.ts                                 │
│  ├─ Intercepts sign-in/sign-up POST requests                 │
│  ├─ Validates Turnstile token                                │
│  └─ Passes to Better Auth if valid                           │
│                                                               │
│  lib/turnstile.ts                                            │
│  ├─ verifyTurnstileToken()                                   │
│  └─ Calls Cloudflare Siteverify API                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Turnstile Widget Component

**Location:** `apps/web/src/components/turnstile-widget.tsx`

A reusable React component that renders the Cloudflare Turnstile widget.

**Props:**
- `onSuccess?: (token: string) => void` - Callback when token is generated
- `onError?: () => void` - Callback when widget encounters an error

**Usage:**
```tsx
<TurnstileWidget
  onSuccess={(token) => {
    // Handle token
  }}
  onError={() => {
    // Handle error
  }}
/>
```

**Features:**
- Automatically loads site key from environment variables
- Supports token reset via ref
- Handles widget lifecycle events

### 2. Form Integration

**Locations:**
- `apps/web/src/components/auth/sign-in-form.tsx`
- `apps/web/src/components/auth/sign-up-form.tsx`

Both forms integrate the Turnstile widget and capture tokens before submission.

**Flow:**
1. Widget renders when form loads
2. User completes form fields
3. Widget generates token automatically (or user completes challenge)
4. Token is captured via `onSuccess` callback
5. Token is stored in form state and validated
6. On form submission, token is sent to server

**Validation:**
- Token is required (enforced by Zod schema)
- Form submission is blocked if token is missing
- Error messages displayed if validation fails

### 3. Form Schemas

**Location:** `apps/web/src/lib/validations/auth.ts`

Both `signInSchema` and `signUpSchema` include a required `turnstileToken` field:

```typescript
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  turnstileToken: z.string().min(1, "Turnstile verification is required"),
});
```

### 4. Auth Client Customization

**Location:** `apps/web/src/lib/auth-client.ts`

The Better Auth client is configured with a custom fetch function that automatically includes the Turnstile token in request headers.

**Key Features:**
- Token stored temporarily in module-level variable
- Custom fetch wrapper adds `x-turnstile-token` header
- Token cleared after single use (prevents reuse)
- Seamless integration with Better Auth client

**API:**
```typescript
setTurnstileToken(token: string | null) // Set token for next request
```

### 5. Auth Hooks

**Locations:**
- `apps/web/src/hooks/use-sign-in.ts`
- `apps/web/src/hooks/use-sign-up.ts`

Both hooks:
1. Set the Turnstile token before making auth requests
2. Clear the token after request completes (success or error)
3. Handle errors appropriately

### 6. Server-Side Validation

**Location:** `apps/web/src/lib/turnstile.ts`

Provides server-side token validation utilities.

**Functions:**
- `verifyTurnstileToken(token: string, remoteIp?: string)` - Validates token with Cloudflare API
- `getClientIp(request: Request)` - Extracts client IP from request headers

**Validation Process:**
1. Receives token and optional IP address
2. Makes POST request to Cloudflare Siteverify API
3. Includes secret key, token, and IP in request
4. Returns validation result with success status and error details

### 7. Auth Route Handler

**Location:** `apps/web/src/app/api/auth/[...all]/route.ts`

Intercepts authentication requests to validate Turnstile tokens before processing.

**Validation Logic:**
- Only validates POST requests to `/api/auth/sign-in` and `/api/auth/sign-up`
- Extracts token from `x-turnstile-token` header
- Validates token with Cloudflare API
- Returns 400 error if validation fails
- Passes request to Better Auth handler if validation succeeds

## Setup

### 1. Obtain Turnstile Keys

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** section
3. Create a new site/widget
4. Copy the **Site Key** (public, used in client)
5. Copy the **Secret Key** (private, used on server)

### 2. Configure Environment Variables

Add the following to your `apps/web/.env` file:

```env
# Turnstile Configuration
TURNSTILE_SECRET_KEY=your_secret_key_here

# For custom env structure (if using process.env.development)
development.TURNSTILE_SITEKEY=your_site_key_here

# OR use standard Next.js env var (recommended)
NEXT_PUBLIC_TURNSTILE_SITEKEY=your_site_key_here
```

**Important:**
- `TURNSTILE_SECRET_KEY` must be kept secret (server-side only)
- Site key can be public (client-side)
- Never commit secret keys to version control

### 3. Install Dependencies

The Turnstile React component is already installed:

```bash
bun install @marsidev/react-turnstile
```

## Security Features

### Client-Side Protection
- Widget renders on both sign-in and sign-up forms
- Token generation is automatic (invisible to users in most cases)
- Tokens are single-use and time-limited
- Form submission blocked without valid token

### Server-Side Validation
- Every sign-in/sign-up request requires valid token
- Token validated with Cloudflare before authentication
- IP address included in validation for enhanced security
- Failed validation returns 400 error, preventing auth

### Token Management
- Tokens are single-use (cleared after use)
- Tokens expire after 5 minutes
- No token reuse possible
- Each form submission requires fresh token

## Request Flow

### Sign-In/Sign-Up Request Flow

1. **User fills form** → Form fields populated
2. **Turnstile widget generates token** → Token captured via `onSuccess`
3. **User submits form** → Token included in form data
4. **Hook sets token** → `setTurnstileToken()` called
5. **Auth client makes request** → Custom fetch adds `x-turnstile-token` header
6. **Server intercepts request** → Route handler validates token
7. **Token validated** → Cloudflare Siteverify API called
8. **Validation result**:
   - ✅ **Success**: Request passed to Better Auth
   - ❌ **Failure**: 400 error returned, auth blocked

### Error Handling

**Client-Side Errors:**
- Widget error → `onError` callback triggered
- Form validation error → Error message displayed
- Missing token → Form submission blocked

**Server-Side Errors:**
- Missing token header → 400 error: "Turnstile verification is required"
- Invalid token → 400 error: "Turnstile verification failed"
- Validation API error → 400 error with specific error message

## Testing

### Development Testing

1. **Test with valid token:**
   - Fill form normally
   - Widget should generate token automatically
   - Form should submit successfully

2. **Test with missing token:**
   - Submit form without completing widget
   - Should see validation error
   - Form submission blocked

3. **Test token expiration:**
   - Generate token
   - Wait 5+ minutes
   - Submit form
   - Should see validation error

### Production Considerations

- Monitor validation failure rates
- Track IP addresses for suspicious patterns
- Log validation errors for debugging
- Set up alerts for high failure rates

## Troubleshooting

### Widget Not Appearing

**Possible causes:**
- Site key not configured in environment variables
- Environment variable not accessible (check `NEXT_PUBLIC_` prefix)
- Network issues blocking Cloudflare CDN

**Solutions:**
- Verify `development.TURNSTILE_SITEKEY` or `NEXT_PUBLIC_TURNSTILE_SITEKEY` is set
- Check browser console for errors
- Verify network connectivity

### Validation Always Failing

**Possible causes:**
- Secret key incorrect or not set
- Token not being sent in request header
- IP address extraction failing
- Cloudflare API issues

**Solutions:**
- Verify `TURNSTILE_SECRET_KEY` is set correctly
- Check request headers in network tab
- Verify token is being set before auth request
- Check server logs for validation errors

### Token Not Being Captured

**Possible causes:**
- `onSuccess` callback not firing
- Form state not updating
- Widget not rendering

**Solutions:**
- Check browser console for widget errors
- Verify callback functions are defined
- Check form state updates in React DevTools

## Best Practices

1. **Always validate server-side** - Client-side validation can be bypassed
2. **Use HTTPS** - Required for Turnstile to work properly
3. **Monitor validation rates** - Track success/failure patterns
4. **Handle errors gracefully** - Provide clear user feedback
5. **Keep keys secure** - Never expose secret keys in client code
6. **Test thoroughly** - Verify both success and failure paths

## API Reference

### `verifyTurnstileToken(token: string, remoteIp?: string)`

Validates a Turnstile token with Cloudflare's Siteverify API.

**Parameters:**
- `token: string` - The Turnstile token to validate (required)
- `remoteIp?: string` - Client IP address (optional, recommended)

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

**Example:**
```typescript
const result = await verifyTurnstileToken(token, clientIp);
if (result.success) {
  // Proceed with authentication
} else {
  // Handle error
  console.error(result.error);
}
```

### `getClientIp(request: Request)`

Extracts the client IP address from a Next.js request.

**Parameters:**
- `request: Request` - The Next.js request object

**Returns:**
```typescript
string | undefined
```

**Example:**
```typescript
const clientIp = getClientIp(request);
const result = await verifyTurnstileToken(token, clientIp);
```

## Related Documentation

- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

## Support

For issues related to:
- **Turnstile widget**: Check Cloudflare documentation
- **Integration**: Review this document and code comments
- **Better Auth**: Consult Better Auth documentation
- **Next.js**: Refer to Next.js documentation


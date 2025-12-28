---
name: Production deployment configuration
overview: Configure all environment variables, OAuth provider settings, and production URLs required for the site and social logins (Google and Facebook) to work in production.
todos:
  - id: env-vars
    content: "Configure all required environment variables in production hosting platform (Vercel/dashboard): NEXT_PUBLIC_BASE_URL, CORS_ORIGIN, DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, META_CLIENT_ID, META_CLIENT_SECRET, TURNSTILE_SECRET_KEY, NEXT_PUBLIC_TURNSTILE_SITEKEY"
    status: pending
  - id: google-oauth
    content: "Configure Google OAuth in Google Cloud Console: create OAuth 2.0 credentials, add authorized redirect URI (https://yourdomain.com/api/auth/callback/google), add authorized JavaScript origin, copy credentials to environment variables"
    status: pending
  - id: facebook-oauth
    content: "Configure Facebook OAuth in Meta Developer Console: add OAuth redirect URI (https://yourdomain.com/api/auth/callback/facebook), configure app domains and site URL, copy App ID and App Secret to environment variables"
    status: pending
  - id: turnstile-config
    content: "Configure Cloudflare Turnstile: create site, add production domain, copy site key and secret key to environment variables"
    status: pending
  - id: verify-urls
    content: "Verify all production URLs are consistent: NEXT_PUBLIC_BASE_URL matches CORS_ORIGIN, OAuth redirect URIs match production domain, all URLs use HTTPS"
    status: pending
  - id: test-deployment
    content: "Test production deployment: verify homepage loads, test email/password auth, test Google OAuth, test Facebook OAuth, verify sessions persist, test protected routes, verify Turnstile validation"
    status: pending
---

# Production Deployme

nt Configuration PlanThis plan outlines all changes required for the site and social logins to work in production.

## Overview

The application uses Better Auth with Google and Facebook OAuth providers. All configuration is done through environment variables and OAuth provider dashboards. No code changes are required - only configuration.

## Required Changes

### 1. Environment Variables Configuration

All environment variables must be set in your production hosting platform (e.g., Vercel dashboard).

#### Core Application Variables

- **`NEXT_PUBLIC_BASE_URL`** (Required)
- Set to your production domain: `https://yourdomain.com` or `https://your-app.vercel.app`
- Used by Better Auth client for API calls
- Location: [apps/web/src/lib/auth-client.ts](apps/web/src/lib/auth-client.ts:33)
- **`CORS_ORIGIN`** (Required)
- Set to your production domain: `https://yourdomain.com` or `https://your-app.vercel.app`
- Must match `NEXT_PUBLIC_BASE_URL`
- Used by Better Auth for trusted origins
- Location: [packages/auth/src/index.ts](packages/auth/src/index.ts:18)

#### Database Configuration

- **`DATABASE_URL`** (Required)
- PostgreSQL connection string (e.g., Neon serverless)
- Already configured for Edge runtime (poolQueryViaFetch enabled)
- Location: [packages/db/src/index.ts](packages/db/src/index.ts:9)

#### Google OAuth Configuration

- **`GOOGLE_CLIENT_ID`** (Required for Google login)
- Google OAuth 2.0 Client ID from Google Cloud Console
- Location: [packages/auth/src/index.ts](packages/auth/src/index.ts:33)
- **`GOOGLE_CLIENT_SECRET`** (Required for Google login)
- Google OAuth 2.0 Client Secret from Google Cloud Console
- Location: [packages/auth/src/index.ts](packages/auth/src/index.ts:34)

#### Facebook/Meta OAuth Configuration

- **`META_CLIENT_ID`** (Required for Facebook login)
- Facebook App ID from Meta Developer Console
- Location: [packages/auth/src/index.ts](packages/auth/src/index.ts:37)
- **`META_CLIENT_SECRET`** (Required for Facebook login)
- Facebook App Secret from Meta Developer Console
- Location: [packages/auth/src/index.ts](packages/auth/src/index.ts:38)

#### Cloudflare Turnstile Configuration

- **`TURNSTILE_SECRET_KEY`** (Required)
- Server-side secret key from Cloudflare Turnstile
- Used for sign-in/sign-up validation
- Location: [apps/web/src/app/api/auth/[...all]/route.ts](apps/web/src/app/api/auth/[...all]/route.ts:52)
- **`NEXT_PUBLIC_TURNSTILE_SITEKEY`** (Required)
- Client-side site key from Cloudflare Turnstile
- Used in frontend forms
- Location: Referenced in Turnstile widget component

#### Optional: Facebook Data Deletion

- **`FACEBOOK_APP_SECRET`** (Optional)
- Facebook App Secret for data deletion callback validation
- Location: Referenced in Facebook data deletion route
- **`FACEBOOK_DELETION_STATUS_URL`** (Optional)
- Absolute URL for Facebook to poll deletion status
- Format: `https://yourdomain.com/facebook-deletion-status`

### 2. Google Cloud Console Configuration

Configure OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/):

1. **Create OAuth 2.0 Credentials**

- Navigate to: APIs & Services → Credentials
- Create OAuth 2.0 Client ID (Web application type)

2. **Configure Authorized Redirect URIs**

- Add your production callback URL:
     ```javascript
               https://yourdomain.com/api/auth/callback/google
     ```




- If using Vercel preview deployments, also add:
     ```javascript
               https://your-app.vercel.app/api/auth/callback/google
     ```




3. **Configure Authorized JavaScript Origins**

- Add your production domain:
     ```javascript
               https://yourdomain.com
     ```




4. **Copy Credentials**

- Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Add to production environment variables

### 3. Meta (Facebook) Developer Console Configuration

Configure OAuth settings in [Meta for Developers](https://developers.facebook.com/):

1. **Create/Select Facebook App**

- Navigate to your app in Meta Developer Console

2. **Configure OAuth Redirect URIs**

- Go to: Settings → Basic → Add Platform → Website
- Add Valid OAuth Redirect URIs:
     ```javascript
               https://yourdomain.com/api/auth/callback/facebook
     ```




- If using Vercel preview deployments, also add:
     ```javascript
               https://your-app.vercel.app/api/auth/callback/facebook
     ```




3. **Configure App Domains**

- Add your production domain: `yourdomain.com`
- Add site URL: `https://yourdomain.com`

4. **Copy Credentials**

- Copy App ID → `META_CLIENT_ID`
- Copy App Secret → `META_CLIENT_SECRET`
- Add to production environment variables

5. **Privacy Policy URL** (Required for Facebook)

- Ensure your app has a privacy policy URL configured
- Location: [apps/web/src/app/privacy-policy/page.tsx](apps/web/src/app/privacy-policy/page.tsx) exists

### 4. Cloudflare Turnstile Configuration

1. **Create Turnstile Site**

- Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
- Navigate to Turnstile section
- Create a new site

2. **Copy Keys**

- Site Key → `NEXT_PUBLIC_TURNSTILE_SITEKEY`
- Secret Key → `TURNSTILE_SECRET_KEY`
- Add to production environment variables

3. **Configure Domain**

- Add your production domain to allowed domains

### 5. Production URL Verification

Ensure all URLs are consistent:

- `NEXT_PUBLIC_BASE_URL` = `CORS_ORIGIN` = Production domain
- OAuth redirect URIs match production domain
- All environment variables use HTTPS URLs (no HTTP in production)

### 6. Deployment Platform Configuration

#### For Vercel (if applicable):

- `vercel.json` already exists and is configured correctly
- Root directory: `apps/web`
- Build command: `bun build`
- Output directory: `apps/web/.next`

## Testing Checklist

After deployment, verify:

- [ ] Homepage loads correctly
- [ ] Email/password sign-up works
- [ ] Email/password sign-in works
- [ ] Google OAuth sign-in redirects correctly
- [ ] Google OAuth callback completes successfully
- [ ] Facebook OAuth sign-in redirects correctly
- [ ] Facebook OAuth callback completes successfully
- [ ] User sessions persist after authentication
- [ ] Protected routes require authentication
- [ ] Turnstile validation works on sign-in/sign-up
- [ ] Database connections work in production
- [ ] API routes (`/api/rpc`) function correctly

## Important Notes

1. **Better Auth OAuth Callback URLs**

- Format: `{BASE_URL}/api/auth/callback/{provider}`
- Providers: `google`, `facebook`
- Better Auth handles these routes automatically via [apps/web/src/app/api/auth/[...all]/route.ts](apps/web/src/app/api/auth/[...all]/route.ts)

2. **Environment Variable Fallbacks**

- Current code uses empty string fallbacks (`|| ""`)
- This will cause silent failures if variables are missing
- Ensure all required variables are set in production

3. **Database Edge Compatibility**

- Already configured: `poolQueryViaFetch = true` in [packages/db/src/index.ts](packages/db/src/index.ts:9)
- No changes needed for Vercel Edge Functions

4. **Cookie Domain**

- Better Auth uses `nextCookies()` plugin
- Cookies will be set for the production domain automatically
- Ensure `CORS_ORIGIN` matches the cookie domain

## Summary

**No code changes required.** All configuration is done through:

1. Environment variables in hosting platform
2. OAuth provider dashboards (Google Cloud Console, Meta Developer Console)
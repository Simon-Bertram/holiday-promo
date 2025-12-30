# Vercel Deployment Review

## ✅ Overall Status: **READY FOR DEPLOYMENT** with Required Configuration

Your app is well-structured and ready for Vercel deployment. This document outlines all requirements and recommendations.

---

## 🔧 Required Configuration

### 1. Monorepo Configuration (`vercel.json`)

Vercel needs to know which app to build. Create `vercel.json` in the root directory.

**Status:** ⚠️ **MISSING** - Needs to be created

### 2. Environment Variables

The following environment variables **MUST** be configured in Vercel before deployment:

#### Database

- `DATABASE_URL` - Neon PostgreSQL connection string (required)

#### Authentication (Better Auth)

- `CORS_ORIGIN` - Your production domain (e.g., `https://yourdomain.com`) (required)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (if using Google login)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (if using Google login)
- `META_CLIENT_ID` - Facebook OAuth client ID (if using Facebook login)
- `META_CLIENT_SECRET` - Facebook OAuth client secret (if using Facebook login)

#### Magic Link Email (Resend)

- `RESEND_API_KEY` - Resend API key for sending magic link emails (required for production)
- `RESEND_FROM_EMAIL` - Verified sender email address (e.g., `noreply@yourdomain.com`) (required for production)
- **Note:** In development, magic links are logged to console instead of being sent via email

#### Cloudflare Turnstile

- `TURNSTILE_SECRET_KEY` - Server-side secret key (required for sign-in/sign-up)
- `NEXT_PUBLIC_TURNSTILE_SITEKEY` - Client-side site key (required)

#### Application

- `NEXT_PUBLIC_BASE_URL` - Your production URL (e.g., `https://yourdomain.com`) (required)

#### Facebook Data Deletion (Optional)

- `FACEBOOK_APP_SECRET` - Facebook app secret for data deletion callback
- `FACEBOOK_DELETION_STATUS_URL` - Status URL for Facebook polling

**Status:** ⚠️ **REQUIRES SETUP** - All must be added in Vercel dashboard

---

## ✅ What's Already Good

### Project Structure

- ✅ Turborepo monorepo properly configured
- ✅ Next.js 16 with App Router
- ✅ TypeScript with proper types
- ✅ Proper `.gitignore` configuration

### Build Configuration

- ✅ `package.json` has correct build scripts
- ✅ Turbo build pipeline configured correctly
- ✅ Next.js config is production-ready
- ✅ Database using Neon serverless (perfect for Vercel)

### Security

- ✅ Test files properly excluded from production
- ✅ Environment variables properly scoped
- ✅ No secrets committed to repository
- ✅ Cloudflare Turnstile integration properly implemented

### Code Quality

- ✅ Error boundaries configured
- ✅ Proper error handling
- ✅ API routes properly structured
- ✅ Authentication flow complete

---

## 🔍 Issues & Recommendations

### 🔴 Critical Issues

#### 1. Missing `vercel.json` Configuration

**Impact:** Vercel won't know which app to build  
**Action Required:** Create `vercel.json` (see below)

#### 2. Metadata Not Production-Ready

**Location:** `apps/web/src/app/layout.tsx`  
**Issue:** Generic title and description  
**Action Required:** Update metadata with your app's actual information

```typescript
export const metadata: Metadata = {
  title: "Your App Name",
  description: "Your app description",
};
```

### 🟡 Important Recommendations

#### 1. Database Connection for Edge Runtime

**Location:** `packages/db/src/index.ts`  
**Current:** Uses WebSocket connection (may not work in Edge)  
**Recommendation:** Enable fetch-based querying for better Edge compatibility:

```typescript
neonConfig.poolQueryViaFetch = true;
```

This is commented out but should be enabled for Vercel Edge Functions.

#### 2. Environment Variables Documentation

**Status:** No `.env.example` file  
**Recommendation:** Create `.env.example` to document required variables

#### 3. Production Base URL Configuration

**Location:** `apps/web/src/lib/auth-client.ts`  
**Current:** Falls back to empty string  
**Issue:** May cause auth issues if not set  
**Action:** Ensure `NEXT_PUBLIC_BASE_URL` is always set in production

#### 4. Build Output Verification

**Recommendation:** Test the build locally first:

```bash
bun build
```

Ensure all packages build successfully before deploying.

---

## 📝 Step-by-Step Deployment Checklist

### Pre-Deployment

- [ ] Create `vercel.json` configuration file
- [ ] Update metadata in `layout.tsx`
- [ ] Enable `neonConfig.poolQueryViaFetch` in `packages/db/src/index.ts`
- [ ] Test build locally: `bun build`
- [ ] Create `.env.example` file for documentation

### Vercel Dashboard Setup

- [ ] Connect your GitHub repository to Vercel
- [ ] Set Root Directory to project root
- [ ] Configure Framework Preset: **Next.js**
- [ ] Set Build Command: `bun build`
- [ ] Set Output Directory: `apps/web/.next`
- [ ] Set Install Command: `bun install`

### Environment Variables Setup

Add all required environment variables in Vercel Dashboard:

- [ ] `DATABASE_URL`
- [ ] `CORS_ORIGIN`
- [ ] `NEXT_PUBLIC_BASE_URL`
- [ ] `TURNSTILE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_TURNSTILE_SITEKEY`
- [ ] `GOOGLE_CLIENT_ID` (if using)
- [ ] `GOOGLE_CLIENT_SECRET` (if using)
- [ ] `META_CLIENT_ID` (if using)
- [ ] `META_CLIENT_SECRET` (if using)
- [ ] `RESEND_API_KEY` (required for magic link emails)
- [ ] `RESEND_FROM_EMAIL` (required for magic link emails)
- [ ] `FACEBOOK_APP_SECRET` (if using)
- [ ] `FACEBOOK_DELETION_STATUS_URL` (if using)

### Post-Deployment Verification

- [ ] Verify homepage loads
- [ ] Test authentication (sign up / sign in)
- [ ] Test API routes (`/api/rpc`)
- [ ] Verify database connections
- [ ] Test Turnstile integration
- [ ] Check error pages
- [ ] Verify social login redirects (if enabled)
- [ ] Test Facebook data deletion callback (if configured)

---

## 🚀 Monorepo-Specific Considerations

### Build Process

Vercel will need to:

1. Install dependencies at root (`bun install`)
2. Build all packages in dependency order (handled by Turbo)
3. Build the Next.js app in `apps/web`

### Workspace Dependencies

Your monorepo uses workspace dependencies:

- `@holiday-promo/api` → `workspace:*`
- `@holiday-promo/auth` → `workspace:*`
- `@holiday-promo/db` → `workspace:*`

These will be resolved automatically by the package manager (Bun).

### Node.js Version

Vercel supports Bun, but you may want to specify Node.js version in `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 📚 Additional Resources

- [Vercel Monorepo Documentation](https://vercel.com/docs/monorepos)
- [Neon Serverless Documentation](https://neon.tech/docs/serverless)
- [Better Auth Deployment Guide](https://www.better-auth.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

---

## 🐛 Common Issues & Solutions

### Issue: Build fails with "Cannot find module"

**Solution:** Ensure all workspace packages are built. The Turbo pipeline should handle this, but verify `turbo.json` has correct dependencies.

### Issue: Database connection fails

**Solution:**

1. Verify `DATABASE_URL` is correct
2. Enable `poolQueryViaFetch` for Edge compatibility
3. Check Neon dashboard for connection limits

### Issue: Authentication redirects fail

**Solution:**

1. Verify `CORS_ORIGIN` matches your Vercel domain
2. Verify `NEXT_PUBLIC_BASE_URL` is set correctly
3. Update OAuth redirect URIs in Google/Facebook dashboards

### Issue: Environment variables not available

**Solution:**

1. Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding environment variables
3. Check Vercel logs for environment variable access

---

## ✨ Summary

Your app is **production-ready** from a code perspective. The main tasks are:

1. **Create `vercel.json`** - Required for Vercel to build the correct app
2. **Configure Environment Variables** - All must be set in Vercel dashboard
3. **Update Metadata** - Make your app SEO-friendly
4. **Enable Edge-Compatible Database** - Uncomment `poolQueryViaFetch`

After completing these steps, you should be able to deploy successfully! 🎉

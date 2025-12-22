# Next.js Performance Analysis & Optimization Recommendations

## Executive Summary

This document provides a comprehensive performance analysis of the Holiday Promo Next.js application with specific recommendations for Vercel deployment. The analysis covers bundle optimization, rendering strategies, caching, and runtime performance.

## Critical Issues (High Priority)

### 1. React Query Devtools in Production

**Issue**: `ReactQueryDevtools` is included in production builds, adding unnecessary bundle size.

**Location**: `apps/web/src/components/providers.tsx:19`

**Impact**: ~50-100KB of unnecessary JavaScript in production

**Fix**:

```typescript
// apps/web/src/components/providers.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/orpc";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

// Conditionally import devtools
const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? require("@tanstack/react-query-devtools").ReactQueryDevtools
    : () => null;

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
```

### 2. Missing API Route Caching Configuration

**Issue**: API routes have no caching strategy, causing unnecessary database queries and context creation on every request.

**Location**: `apps/web/src/app/api/rpc/[[...rest]]/route.ts`

**Impact**: Slower API responses, higher database load, increased costs

**Fix**: Add route segment config for caching:

```typescript
// Add at the top of route.ts after imports
export const runtime = "nodejs"; // or "edge" if compatible
export const dynamic = "force-dynamic"; // or "auto" for better caching
export const revalidate = 0; // Adjust based on needs

// For health check endpoint specifically, consider:
// export const revalidate = 60; // Cache for 60 seconds
```

### 3. Client Component on Home Page

**Issue**: The home page (`apps/web/src/app/page.tsx`) is a client component that only needs to render the Hero component.

**Impact**: Unnecessary JavaScript bundle, slower initial page load, no server-side rendering benefits

**Fix**: Convert to Server Component and move health check logic:

```typescript
// apps/web/src/app/page.tsx
import Hero from "@/components/hero/hero";

export default function Home() {
  return <Hero />;
}
```

Move health check to a separate client component if needed:

```typescript
// apps/web/src/components/health-check-monitor.tsx
"use client";
// ... existing health check logic
```

### 4. Missing Query Client Default Options

**Issue**: React Query client lacks default stale time and cache time configuration.

**Location**: `apps/web/src/utils/orpc.ts`

**Impact**: Unnecessary refetches, poor caching behavior

**Fix**:

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
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

## High Priority Optimizations

### 5. Lazy Load Heavy Components

**Issue**: Video player and other heavy components load immediately.

**Location**: `apps/web/src/components/hero/video-bg.tsx`

**Impact**: Large initial bundle size, slower Time to Interactive (TTI)

**Fix**: Use dynamic imports with loading states:

```typescript
// apps/web/src/components/hero/hero.tsx
"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import HeroCta from "./hero-cta";

const VideoBg = dynamic(() => import("./video-bg"), {
  loading: () => <div className="absolute inset-0 bg-gray-200 animate-pulse" />,
  ssr: false,
});

export default function Hero() {
  return (
    <div className="relative flex min-h-dvh w-full items-end justify-start">
      <Image
        alt="Holiday destination background"
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src="https://res.cloudinary.com/dulwhlyqt/image/upload/v1766139373/jennifer-kalenberg-D1ZtQGk3AB8-unsplash_nfo8gh.jpg"
      />
      {/* Conditionally load video on desktop */}
      {typeof window !== "undefined" && window.innerWidth >= 768 && <VideoBg />}
      <div className="z-10 mb-6 ml-4 flex w-full max-w-md flex-col sm:mb-8 sm:ml-6 md:mb-10 md:ml-8 md:w-1/2 lg:ml-12">
        <HeroCta />
      </div>
    </div>
  );
}
```

### 6. Optimize Font Loading

**Issue**: Three Google Fonts loaded with all weights, some may not be used.

**Location**: `apps/web/src/app/layout.tsx` and `apps/web/src/lib/fonts.ts`

**Impact**: Unnecessary font downloads, layout shift

**Fix**:

- Use `display: "swap"` for better performance
- Preload critical fonts
- Consider subsetting fonts
- Remove unused font weights

```typescript
// apps/web/src/app/layout.tsx
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "700", "900"], // Only load what you use
  display: "swap",
  preload: true,
});

// Remove geistMono if not used
```

### 7. Add Route Segment Config for Static Pages

**Issue**: No explicit caching/rendering strategy for static pages.

**Location**: Various page files

**Fix**: Add to static pages:

```typescript
// apps/web/src/app/privacy-policy/page.tsx
export const revalidate = 3600; // Revalidate every hour
// or
export const dynamic = "force-static";
```

### 8. Optimize Image Loading

**Issue**: Hero image uses Cloudinary but could benefit from additional optimizations.

**Location**: `apps/web/src/components/hero/hero.tsx`

**Fix**:

- Use Cloudinary transformations in URL for better compression
- Add `placeholder="blur"` with blur data URL
- Consider using `next-cloudinary` CldImage component

```typescript
<Image
  alt="Holiday destination background"
  className="object-cover"
  fill
  priority
  sizes="100vw"
  src="https://res.cloudinary.com/dulwhlyqt/image/upload/q_auto,f_auto,w_1920/v1766139373/jennifer-kalenberg-D1ZtQGk3AB8-unsplash_nfo8gh.jpg"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..." // Generate from image
/>
```

## Medium Priority Optimizations

### 9. Add Next.js Configuration Optimizations

**Location**: `apps/web/next.config.ts`

**Fix**:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,

  // Compiler optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Experimental features for Next.js 16
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      // Add other heavy packages
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    // Add image optimization settings
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 10. Optimize Mobile Menu Component

**Issue**: Mobile menu loads all navigation components even when closed.

**Location**: `apps/web/src/components/navigation/mobile-menu.tsx`

**Fix**: Lazy load mobile menu:

```typescript
// In header.tsx
const MobileMenu = dynamic(() => import("./navigation/mobile-menu"), {
  ssr: false,
});
```

### 11. Add Bundle Analyzer

**Issue**: No visibility into bundle size and composition.

**Fix**: Add to `package.json`:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^16.1.0"
  }
}
```

Update `next.config.ts`:

```typescript
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
```

### 12. Optimize API Route Response Headers

**Issue**: API routes don't set optimal caching headers.

**Location**: `apps/web/src/app/api/rpc/[[...rest]]/route.ts`

**Fix**: Add appropriate headers:

```typescript
// For health check
if (requestUrl.includes("healthCheck")) {
  return new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
```

## Low Priority / Nice to Have

### 13. Add Edge Middleware for Performance

**Location**: Create `apps/web/src/middleware.ts`

**Fix**: Add middleware for edge caching and optimizations:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add performance headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### 14. Optimize Turnstile Widget Loading

**Issue**: Turnstile widget loads on every page that needs it.

**Location**: `apps/web/src/components/turnstile-widget.tsx`

**Fix**: Lazy load only when form is visible:

```typescript
const TurnstileWidget = dynamic(() => import("./turnstile-widget"), {
  ssr: false,
});
```

### 15. Add Service Worker for Offline Support

**Benefit**: Better caching, offline support, improved performance

**Fix**: Use Next.js PWA plugin or implement custom service worker.

## Vercel-Specific Optimizations

### 16. Configure Vercel Analytics

Add to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // ... existing config
  // Enable Vercel Analytics
  // Install: npm install @vercel/analytics
};
```

### 17. Optimize for Vercel Edge Functions

Consider moving API routes to Edge Runtime if compatible:

```typescript
export const runtime = "edge";
```

### 18. Configure ISR (Incremental Static Regeneration)

For pages that can be statically generated:

```typescript
export const revalidate = 3600; // Revalidate every hour
```

## Performance Metrics to Monitor

1. **Core Web Vitals**:

   - Largest Contentful Paint (LCP): Target < 2.5s
   - First Input Delay (FID): Target < 100ms
   - Cumulative Layout Shift (CLS): Target < 0.1

2. **Bundle Size**:

   - First Load JS: Target < 200KB
   - Total Bundle: Monitor and optimize

3. **API Performance**:

   - API Response Time: Target < 200ms
   - Database Query Time: Monitor and optimize

4. **Image Performance**:
   - Image Load Time: Optimize with proper sizing
   - Image Format: Use WebP/AVIF

## Implementation Priority

1. **Immediate** (Do First):

   - Fix React Query Devtools in production (#1)
   - Add API route caching (#2)
   - Optimize Query Client defaults (#4)

2. **High Priority** (This Week):

   - Convert home page to Server Component (#3)
   - Lazy load heavy components (#5)
   - Optimize fonts (#6)

3. **Medium Priority** (This Month):

   - Add Next.js config optimizations (#9)
   - Add bundle analyzer (#11)
   - Optimize API headers (#12)

4. **Low Priority** (When Time Permits):
   - Edge middleware (#13)
   - Service worker (#15)
   - Additional optimizations

## Testing Performance

After implementing changes, test with:

- Lighthouse (Chrome DevTools)
- WebPageTest
- Vercel Analytics
- Next.js Bundle Analyzer

## Estimated Impact

- **Bundle Size Reduction**: 15-25% (removing devtools, lazy loading)
- **Initial Load Time**: 20-30% improvement
- **API Response Time**: 30-40% improvement (with caching)
- **Time to Interactive**: 25-35% improvement

## Notes

- All optimizations are compatible with Next.js 16
- Vercel automatically handles many optimizations (image optimization, edge caching)
- Monitor performance after each change to measure impact
- Consider A/B testing for major changes

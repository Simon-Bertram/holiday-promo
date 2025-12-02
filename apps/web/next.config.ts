import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // Note: Next.js automatically excludes .test.ts and .test.tsx files from production builds
  // Test files in __tests__ directory are also excluded by default
  // MSW and test dependencies are in devDependencies, ensuring they're not included in production
};

export default nextConfig;

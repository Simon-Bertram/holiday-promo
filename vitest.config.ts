import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [path.resolve(__dirname, "vitest.setup.ts")],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
    },
    include: [
      "apps/**/*.{test,spec}.{ts,tsx}",
      "packages/**/*.{test,spec}.{ts,tsx}",
    ],
  },
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, "apps/web/src/")}/`,
    },
  },
});

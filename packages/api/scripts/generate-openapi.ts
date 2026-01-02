/**
 * OpenAPI Specification Generator
 *
 * Generates an OpenAPI 3.0 specification from the oRPC router.
 * Run with: bun run packages/api/scripts/generate-openapi.ts
 */

// Set dummy DATABASE_URL BEFORE any imports to prevent database initialization errors
// The database connection is not needed for OpenAPI spec generation
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://dummy:dummy@localhost:5432/dummy";
}

// Use dynamic imports to ensure env var is set before database initialization
const { OpenAPIGenerator } = await import("@orpc/openapi");
const { ZodToJsonSchemaConverter } = await import("@orpc/zod/zod4");
const { appRouter } = await import("../src/routers/index.js");

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

const spec = await generator.generate(appRouter, {
  info: {
    title: "Holiday Promo API",
    version: "1.0.0",
    description:
      "API for the Holiday Promo application. Provides user management, health checks, and authentication endpoints.",
  },
  servers: [
    {
      url: "http://localhost:3000/api/rpc",
      description: "Local development server",
    },
    {
      url: "https://your-production-domain.com/api/rpc",
      description: "Production server",
    },
  ],
});

console.log(JSON.stringify(spec, null, 2));

# OpenAPI Specification Generation

This directory contains scripts for generating OpenAPI specifications from your oRPC router.

## Quick Start

Generate the OpenAPI spec and save it to `openapi.json`:

```bash
# From the packages/api directory
bun run generate:openapi

# Or from the project root
cd packages/api && bun run generate:openapi
```

Or output to console:

```bash
# From the packages/api directory
bun run generate:openapi:console
```

## Current Status

Your current routes use RPC-style procedures. The generator will create an OpenAPI spec, but for full REST-style OpenAPI compliance with HTTP methods and paths, you'll need to add `.route()` and `.output()` definitions to your procedures.

## Enhancing Routes for Full OpenAPI Compliance

To make your routes fully OpenAPI-compliant with REST-style endpoints, add `.route()` and `.output()` to your procedures:

### Example: Converting a Procedure

**Before (RPC-style):**

```typescript
export const userRouter = {
  me: protectedProcedure.handler(({ context }) => {
    return { id: context.session.user.id, name: context.session.user.name };
  }),
};
```

**After (OpenAPI-compliant):**

```typescript
import { os } from "@orpc/server";
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(["subscriber", "admin"]),
});

export const userRouter = {
  me: protectedProcedure
    .route({ method: "GET", path: "/user/me" })
    .output(UserSchema)
    .handler(({ context }) => {
      return {
        id: context.session.user.id,
        name: context.session.user.name,
        email: context.session.user.email,
        role: context.session.user.role,
      };
    }),
};
```

### Key Enhancements:

1. **`.route({ method, path })`** - Defines HTTP method and REST path
2. **`.output(schema)`** - Defines the response schema for OpenAPI
3. **Path parameters** - Use `{id}` syntax: `/user/{id}`
4. **Query parameters** - Define in `.input()` with `z.coerce` for automatic parsing

### Example with Path Parameters:

```typescript
find: publicProcedure
  .route({ method: 'GET', path: '/user/{id}' })
  .input(z.object({ id: z.coerce.number().int().min(1) }))
  .output(UserSchema)
  .handler(async ({ input }) => {
    // input.id is automatically parsed as a number
    return await getUserById(input.id);
  }),
```

## Generated Spec Location

The generated `openapi.json` file will be created in the `packages/api/` directory.

## Integration with API Documentation

You can serve the OpenAPI spec at runtime using the `OpenAPIHandler` (already configured in your route handler). The spec will be available at `/api/rpc/api-reference`.

## Next Steps

1. Run the generator to see the current spec
2. Review the generated `openapi.json`
3. Optionally enhance routes with `.route()` and `.output()` for full REST compliance
4. Use the spec with tools like Swagger UI, Postman, or API documentation generators

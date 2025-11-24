# holiday-promo

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Self, ORPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **oRPC** - End-to-end type-safe APIs with OpenAPI integration
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Architecture Overview

This project uses a modular monorepo structure to support type-safe, full-stack development with shared types and logic. Major concepts:

- **Monorepo**: Utilizes Turborepo to manage separate apps and packages.
- **Next.js App Router** (in `apps/web`): Powers the main web application, providing both the frontend and API layers.
- **ORPC Routers** (in `packages/api`): Define all backend/server procedures in a type-safe, composable fashion. These routers are automatically used for backend API resolution and are also accessible through OpenAPI for documentation.
- **API route handler** (in `apps/web/src/app/api/rpc/[[...rest]]/route.ts`): Bridges Next.js edge API endpoints to the compiled ORPC routers and OpenAPI handler. Handles all REST verbs and routes requests to the correct procedure.
- **Authentication** (in `packages/auth`): Plugs into the API context, providing user sessions, guards, and auth endpoints via Better Auth.
- **Database** (in `packages/db`): Houses Drizzle ORM schema and SQL queries shared across routers.
- **React Query & ORPC Client** (in `apps/web/src/utils/orpc.ts`): Encapsulates the client-side wiring for seamless React Query hooks powered by type-safe router calls.

### Request Lifecycle:

1. UI uses `orpc` hooks (e.g. `useQuery`, `useMutation`) from shared ORPC client
2. Calls go to `/api/rpc` endpoint on the Next.js edge layer
3. Handler delegates to the right ORPC router procedure, with context (incl. session)
4. Business logic (CRUD, auth, validation) executes in router, returns result or error
5. Response flows back through ORPC client to UI, populating React Query cache

## API Routes & Handlers Summary

Below is a summary of the major API endpoints, routers, and handlers:

### Next.js App API Endpoints

- **`/api/rpc/[[...rest]]`**: Main RPC & OpenAPI catch-all.
  - Delegates:
    - RPC requests via `RPCHandler` to the ORPC `appRouter`. Handles all router procedures.
    - OpenAPI (API reference/docs) via `OpenAPIHandler`.
    - Injects context (auth session) into each procedure call.
    - All HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) supported.
- **`/api/auth/[...all]`**: Authentication endpoints (sessions, signin, signout, etc.) handled by Better Auth handler. Includes Turnstile token validation for sign-in and sign-up requests.
- **`/api/facebook/data-deletion`**: Facebook data deletion callback that validates `signed_request`, deletes the mapped Better Auth user via `deleteUserById`, and responds with a confirmation URL for Facebook polling.

### ORPC Routers (`packages/api/src/routers`)

- **`appRouter`**: Root router combining core features (e.g. `healthCheck`, `privateData`, `user`).
  - **`healthCheck`**: Simple public procedure returns 'OK' (for monitoring/tests).
  - **`privateData`**: Protected route, returns user info; requires auth.
  - **`user`**: User-specific procedures (e.g., `me`, `list`).

### Middleware & Context

- **Procedures**: Use `publicProcedure` (no auth), or `protectedProcedure` (enforces user session via middleware).
- **Context**: Created per request with user session attached (see `createContext`). Required for access control and session-aware logic.

### Client (Frontend)

- **`orpc` client**: Provides hooks to seamlessly call server procedures from frontend components. Integrates with TanStack React Query for caching, mutations, and error management.

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/web/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:

```bash
bun db:push
```

Then, run the development server:

```bash
bun dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see your fullstack application.

## Project Structure

```
holiday-promo/
├── apps/
│   └── web/         # Fullstack application (Next.js)
├── packages/
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun dev`: Start all applications in development mode
- `bun build`: Build all applications
- `bun check-types`: Check TypeScript types across all apps
- `bun db:push`: Push schema changes to database
- `bun db:studio`: Open database studio UI

## Cloudflare Turnstile Integration

This project includes Cloudflare Turnstile CAPTCHA protection for sign-in and sign-up forms. Turnstile provides privacy-first bot protection without requiring user interaction in most cases.

**Configuration Required:**
- `TURNSTILE_SECRET_KEY`: Server-side secret key for token validation
- `development.TURNSTILE_SITEKEY` or `NEXT_PUBLIC_TURNSTILE_SITEKEY`: Client-side site key

**Features:**
- Automatic token generation on form load
- Server-side validation before authentication
- Single-use tokens with 5-minute expiration
- IP address validation for enhanced security

For detailed documentation, see [TURNSTILE_INTEGRATION.md](./TURNSTILE_INTEGRATION.md).

## Facebook Data Deletion Callback

To comply with Facebook's data deletion requirements you must configure:

- `FACEBOOK_APP_SECRET`: The app secret used to verify `signed_request`.
- `FACEBOOK_DELETION_STATUS_URL`: Absolute URL that Facebook can poll (e.g., `https://your-domain.com/facebook-deletion-status`).

When Facebook calls `/api/facebook/data-deletion`, the server validates the signature, deletes the associated Better Auth user (if one exists), and responds with:

```json
{
  "url": "https://your-domain.com/facebook-deletion-status?confirmation_code=..."
}
```

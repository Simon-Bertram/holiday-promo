# @holiday-promo/db

This package contains the Drizzle ORM schema and helpers for the Holiday Promo monorepo.

## Features

- Database schema (Postgres/Drizzle ORM)
- Migrations, generate, and studio scripts
- Validated with Zod

## Usage

Import schema or DB client for access to the app’s data layer.

## Scripts

- `npm run db:push` — Push schema to database
- `npm run db:generate` — Generate Drizzle ORM types
- `npm run db:migrate` — Run migrations
- `npm run build` — Build types with tsdown

## Updating the database

1. Ensure `DATABASE_URL` is present in the repo root `.env`.
2. After changing the schema (for example, adding the `role` column), run `bun run db:generate` to produce a migration SQL file.
3. Inspect the generated file under `packages/db/drizzle/` and adjust if you need to backfill data.
4. Apply changes with `bun run db:migrate` (preferred) or `bun run db:push` for a direct sync.
5. Commit both the schema change and the generated migration so other environments stay in sync.

## Dependencies

- drizzle-orm
- @neondatabase/serverless
- ws
- dotenv
- zod

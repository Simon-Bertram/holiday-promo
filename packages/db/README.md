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

## Dependencies

- drizzle-orm
- @neondatabase/serverless
- ws
- dotenv
- zod

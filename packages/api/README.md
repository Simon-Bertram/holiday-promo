# @holiday-promo/api

This package provides core API logic and RPC routers for the Holiday Promo monorepo.

## Features

- App-level RPC routing for business logic
- Integrates with `@holiday-promo/auth` (authentication) and `@holiday-promo/db` (database)
- Input/output validation via Zod

## Usage

Import and register routers in your app or server. See `/src/routers` for available endpoints.

## Scripts

- `npm run build` — Build the package using tsdown

## Dependencies

- next
- drizzle-orm
- @holiday-promo/auth
- @holiday-promo/db

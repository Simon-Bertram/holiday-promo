# Testing Guide - Running Turnstile Tests

## Quick Start

### Run All Tests
```bash
bun run test
```

### Run Tests in Watch Mode (Recommended for Development)
```bash
bun run test:watch
```

### Run Tests with UI (Visual Test Runner)
```bash
bun run test:ui
```

### Run Tests with Coverage Report
```bash
bun run test:coverage
```

## Running Specific Tests

### Run a Specific Test File
```bash
bun run test turnstile-widget
# or
bun run test apps/web/src/components/turnstile-widget.test.tsx
```

### Run Tests Matching a Pattern
```bash
bun run test --testNamePattern="TurnstileWidget"
```

### Run Tests in a Specific Directory
```bash
bun run test apps/web/src/lib
```

## Available Test Scripts

| Command | Description |
|---------|-------------|
| `bun run test` | Run all tests once |
| `bun run test:watch` | Run tests in watch mode (re-runs on file changes) |
| `bun run test:ui` | Open Vitest UI for interactive test running |
| `bun run test:coverage` | Generate coverage report |

## Test Files Location

All Turnstile tests are located in:
- `apps/web/src/components/turnstile-widget.test.tsx` - Widget component tests
- `apps/web/src/lib/turnstile.test.ts` - Server-side validation tests
- `apps/web/src/lib/auth-client.test.ts` - Auth client token management tests
- `apps/web/src/app/api/auth/[...all]/route.test.ts` - Route handler tests
- `apps/web/src/hooks/use-sign-in.test.ts` - Sign-in hook tests
- `apps/web/src/hooks/use-sign-up.test.ts` - Sign-up hook tests
- `apps/web/src/components/auth/sign-in-form.test.tsx` - Sign-in form tests
- `apps/web/src/components/auth/sign-up-form.test.tsx` - Sign-up form tests

## Test Configuration

Tests are configured in:
- `vitest.config.ts` - Main test configuration
- `vitest.setup.ts` - Test setup and environment variables
- `apps/web/src/__tests__/setup/msw-setup.ts` - MSW (Mock Service Worker) setup

## Troubleshooting

### Tests Not Running
1. Ensure dependencies are installed: `bun install`
2. Check that MSW is installed: `bun list msw`
3. Verify test files match the pattern: `**/*.{test,spec}.{ts,tsx}`

### MSW Not Working
- MSW requires Node.js environment
- Ensure `msw-setup.ts` is included in `vitest.config.ts` setupFiles

### Environment Variables Not Set
- Test environment variables are set in `vitest.setup.ts`
- They're automatically configured when running tests

## Example: Running Turnstile Tests

```bash
# Run all Turnstile-related tests
bun run test turnstile

# Run widget component tests only
bun run test turnstile-widget

# Run server-side validation tests
bun run test turnstile.test.ts

# Run with coverage for Turnstile files
bun run test:coverage -- turnstile
```

## CI/CD Integration

For CI/CD pipelines, use:
```bash
bun run test
```

This runs all tests once and exits with the appropriate exit code for CI systems.


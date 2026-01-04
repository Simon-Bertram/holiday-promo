/**
 * MSW setup for tests
 * Initializes Mock Service Worker server for API mocking
 *
 * SECURITY NOTE:
 * - This file should ONLY be imported in test configuration (vitest.config.ts)
 * - MSW is in devDependencies and will not be included in production builds
 * - Never import this file in production code
 */

import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";
import { turnstileHandlers } from "./msw-handlers";

/**
 * MSW server instance
 * Handles all mocked API requests during tests
 */
export const server = setupServer(...turnstileHandlers);

/**
 * Setup MSW server before all tests
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

/**
 * Reset handlers after each test
 * Ensures test isolation
 */
afterEach(() => {
  server.resetHandlers();
});

/**
 * Cleanup MSW server after all tests
 */
afterAll(() => {
  server.close();
});

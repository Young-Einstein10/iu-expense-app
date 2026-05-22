import { beforeAll, afterAll, beforeEach, afterEach } from "@jest/globals";

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env["NODE_ENV"] = "test";
  process.env["DATABASE_URL"] = "sqlite::memory:";
  process.env["JWT_SECRET"] = "test-jwt-secret";
  process.env["JWT_REFRESH_SECRET"] = "test-refresh-secret";
});

afterAll(async () => {
  // Cleanup after all tests
});

beforeEach(async () => {
  // Setup before each test
});

afterEach(async () => {
  // Cleanup after each test
});

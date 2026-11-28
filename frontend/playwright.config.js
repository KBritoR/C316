import { defineConfig, devices } from "@playwright/test";

// O E2E roda contra a aplicacao completa ja no ar (frontend + API + PostgreSQL).
// O `make e2e` sobe uma stack isolada e aponta E2E_BASE_URL para ela.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});

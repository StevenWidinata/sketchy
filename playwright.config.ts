import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  fullyParallel: false,
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:5173",
    channel: process.env.PW_CHANNEL ?? "chrome",
    trace: "retain-on-failure",
  },
  // Set BASE_URL to test an already running server (for example the production build).
  webServer: process.env.BASE_URL
    ? undefined
    : { command: "npm run dev", url: "http://localhost:5173", reuseExistingServer: true, timeout: 60_000 },
});

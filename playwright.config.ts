import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";
import { ADMIN_AUTH_FILE } from "./support/auth-state";

export default defineConfig({
  testDir: "./tests",
  globalSetup: require.resolve("./support/global-setup"),
  globalTeardown: require.resolve("./support/global-teardown"),
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.DIDAXIS_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ADMIN_AUTH_FILE,
      },
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
});

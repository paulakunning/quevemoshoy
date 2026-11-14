import { defineConfig, devices } from "@playwright/test";

// End-to-end tests: a real browser against the running app and the real TMDB API
export default defineConfig({
  testDir: "e2e",
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:3000",
    // Records what happened only when a test had to be retried
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // CI tests the production build; locally the dev server is enough
  webServer: {
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: "http://localhost:3000/es",
    reuseExistingServer: !process.env.CI,
  },
});

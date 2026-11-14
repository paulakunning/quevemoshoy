import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // next-intl imports "next/navigation" without extension, which Node can't resolve on its own
    server: { deps: { inline: ["next-intl"] } },
  },
});

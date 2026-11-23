import { defineConfig } from "vitest/config";

// Evals call the real AI, so they need the key from .env.local
// and never run with `npm test` or in CI
process.loadEnvFile(".env.local");

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["evals/**/*.eval.ts"],
    // 30 requests with pauses between them take a few minutes
    testTimeout: 0,
    // The report (failed cases, score, tokens) is the point, even when it passes
    reporters: ["default"],
  },
});

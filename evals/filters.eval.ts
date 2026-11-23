import { setTimeout as sleep } from "node:timers/promises";
import { expect, it, vi } from "vitest";
import { textToFilters } from "@/lib/ai/filters";
import type { Filters } from "@/lib/ai/schemas";
import { CASES } from "./cases";

vi.mock("server-only", () => ({}));

// An AI is not right or wrong once: it is measured on many cases, as a score
const PASS_MARK = 24;
// Groq allows 8,000 tokens per minute and a search uses about 460
const PAUSE_MS = 4_000;

// Same genres in any order: ["comedy", "drama"] matches ["drama", "comedy"]
const sameGenres = (a: string[], b: string[]) =>
  [...a].sort().join() === [...b].sort().join();

function matches(got: Filters, expected: Filters): boolean {
  return (
    sameGenres(got.include, expected.include) &&
    sameGenres(got.exclude, expected.exclude) &&
    got.maxRuntime === expected.maxRuntime
  );
}

it(`turns at least ${PASS_MARK} of ${CASES.length} requests into the expected filters`, async () => {
  let passed = 0;
  let tokens = 0;
  let answered = 0;

  for (const [index, { text, expected }] of CASES.entries()) {
    if (index > 0) await sleep(PAUSE_MS);
    const result = await textToFilters(text);
    if (result.status === "ok") {
      answered++;
      tokens += result.tokens;
    }
    if (result.status === "ok" && matches(result.filters, expected)) {
      passed++;
    } else {
      console.log(
        `✗ "${text}"\n  expected ${JSON.stringify(expected)}\n  got      ${
          result.status === "ok" ? JSON.stringify(result.filters) : "error"
        }`,
      );
    }
  }

  console.log(
    `${passed}/${CASES.length} passed · ${Math.round(tokens / answered)} tokens per search on average`,
  );
  expect(passed).toBeGreaterThanOrEqual(PASS_MARK);
});

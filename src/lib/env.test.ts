import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "./env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("env", () => {
  it("returns the variable when it is set", () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    expect(env("GROQ_API_KEY")).toBe("test-key");
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
  ])("throws when the variable is %s", (_, value) => {
    vi.stubEnv("GROQ_API_KEY", value);
    expect(() => env("GROQ_API_KEY")).toThrow("GROQ_API_KEY is not set");
  });
});

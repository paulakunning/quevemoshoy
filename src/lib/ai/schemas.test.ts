import { describe, expect, it } from "vitest";
import { filtersSchema } from "./schemas";

describe("filtersSchema", () => {
  it.each([
    [{ include: ["mystery"], exclude: ["horror"], maxRuntime: 30 }],
    [{ include: [], exclude: [], maxRuntime: null }],
  ])("accepts %j", (filters) => {
    expect(filtersSchema.parse(filters)).toEqual(filters);
  });

  it.each([
    [
      "a genre outside the list",
      { include: ["anime"], exclude: [], maxRuntime: null },
    ],
    [
      "4 genres in include",
      {
        include: ["action", "comedy", "drama", "war"],
        exclude: [],
        maxRuntime: null,
      },
    ],
    ["a runtime of 0", { include: [], exclude: [], maxRuntime: 0 }],
    ["a runtime of 181", { include: [], exclude: [], maxRuntime: 181 }],
    ["a runtime of 30.5", { include: [], exclude: [], maxRuntime: 30.5 }],
    ["an object without exclude", { include: [], maxRuntime: null }],
  ])("rejects %s", (_, filters) => {
    expect(filtersSchema.safeParse(filters).success).toBe(false);
  });
});

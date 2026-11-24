import { describe, expect, it } from "vitest";
import type { Filters } from "./ai/schemas";
import { searchToHomeState, toHomeState } from "./home-state";
import type { ShowSummary } from "./tmdb/shows";

const shows: ShowSummary[] = [
  {
    id: 19885,
    name: "Sherlock",
    year: 2010,
    rating: 8.5,
    posterPath: "/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg",
    overview: "A modern update of the famous detective.",
  },
];

describe("toHomeState", () => {
  it("turns an ok answer into results with its shows", () => {
    expect(toHomeState("mystery", { status: "ok", shows })).toEqual({
      kind: "results",
      pill: "mystery",
      shows,
    });
  });

  it("turns an answer with no results into empty", () => {
    expect(toHomeState("comedy", { status: "no_results" })).toEqual({
      kind: "empty",
      pill: "comedy",
    });
  });

  it("turns a failed answer into error", () => {
    expect(toHomeState("drama", { status: "error" })).toEqual({
      kind: "error",
      pill: "drama",
    });
  });
});

describe("searchToHomeState", () => {
  const filters: Filters = {
    include: ["mystery"],
    exclude: [],
    maxRuntime: null,
  };

  const quota = { left: 3, global: false };

  it("turns ok into results with its shows and filters, without a pill", () => {
    expect(searchToHomeState({ status: "ok", shows, filters, quota })).toEqual({
      kind: "results",
      shows,
      filters,
    });
  });

  it("turns no_results into empty", () => {
    expect(searchToHomeState({ status: "no_results", filters, quota })).toEqual(
      {
        kind: "empty",
      },
    );
  });

  it("turns ai_error into error", () => {
    expect(searchToHomeState({ status: "ai_error", quota })).toEqual({
      kind: "error",
    });
  });

  it("turns error into error", () => {
    expect(searchToHomeState({ status: "error" })).toEqual({ kind: "error" });
  });

  it.each([[false], [true]])(
    "turns quota (global: %s) into quota",
    (global) => {
      expect(
        searchToHomeState({ status: "quota", quota: { left: 0, global } }),
      ).toEqual({ kind: "quota", global });
    },
  );

  it("turns invalid_input into idle", () => {
    expect(searchToHomeState({ status: "invalid_input" })).toEqual({
      kind: "idle",
    });
  });
});

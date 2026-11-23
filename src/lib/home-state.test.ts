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

  it("turns ok into results with its shows and filters, without a pill", () => {
    expect(searchToHomeState({ status: "ok", shows, filters })).toEqual({
      kind: "results",
      shows,
      filters,
    });
  });

  it("turns no_results into empty", () => {
    expect(searchToHomeState({ status: "no_results", filters })).toEqual({
      kind: "empty",
    });
  });

  it.each([["ai_error" as const], ["error" as const]])(
    "turns %s into error",
    (status) => {
      expect(searchToHomeState({ status })).toEqual({ kind: "error" });
    },
  );

  it("turns invalid_input into idle", () => {
    expect(searchToHomeState({ status: "invalid_input" })).toEqual({
      kind: "idle",
    });
  });
});

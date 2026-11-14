import { describe, expect, it } from "vitest";
import { toHomeState } from "./home-state";
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
      genre: "mystery",
      shows,
    });
  });

  it("turns an answer with no results into empty", () => {
    expect(toHomeState("comedy", { status: "no_results" })).toEqual({
      kind: "empty",
      genre: "comedy",
    });
  });

  it("turns a failed answer into error", () => {
    expect(toHomeState("drama", { status: "error" })).toEqual({
      kind: "error",
      genre: "drama",
    });
  });
});

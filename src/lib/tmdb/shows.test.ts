import { describe, expect, it } from "vitest";
import {
  posterUrl,
  toShowDetail,
  toShowSummary,
  type TmdbShowDetail,
} from "./shows";

// Sherlock as TMDB returns it for language=es-AR (trimmed to the fields we use)
const sherlock: TmdbShowDetail = {
  id: 19885,
  name: "Sherlock",
  poster_path: "/x.jpg",
  first_air_date: "2010-07-25",
  vote_average: 8.503,
  vote_count: 5412,
  overview: "Una versión moderna del detective Sherlock Holmes.",
  genres: [
    { id: 80, name: "Crimen" },
    { id: 18, name: "Drama" },
    { id: 9648, name: "Misterio" },
  ],
};

describe("toShowSummary", () => {
  it("converts a TMDB show", () => {
    expect(toShowSummary(sherlock)).toEqual({
      id: 19885,
      name: "Sherlock",
      year: 2010,
      rating: 8.5,
      posterPath: "/x.jpg",
      overview: "Una versión moderna del detective Sherlock Holmes.",
    });
  });

  it("has no year when first_air_date is missing or empty", () => {
    expect(toShowSummary({ ...sherlock, first_air_date: "" }).year).toBeNull();
    expect(
      toShowSummary({ ...sherlock, first_air_date: undefined }).year,
    ).toBeNull();
  });

  it("has no rating when nobody voted", () => {
    expect(toShowSummary({ ...sherlock, vote_count: 0 }).rating).toBeNull();
  });

  it("has an empty overview when it is missing", () => {
    expect(toShowSummary({ ...sherlock, overview: undefined }).overview).toBe(
      "",
    );
  });
});

describe("toShowDetail", () => {
  it("adds the genre names", () => {
    expect(toShowDetail(sherlock).genres).toEqual([
      "Crimen",
      "Drama",
      "Misterio",
    ]);
  });
});

describe("posterUrl", () => {
  it("builds the image URL for a size", () => {
    expect(posterUrl("/x.jpg", "w342")).toEqual(
      "https://image.tmdb.org/t/p/w342/x.jpg",
    );
  });
});

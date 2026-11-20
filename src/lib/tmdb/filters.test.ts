import { describe, expect, it } from "vitest";
import { FILTER_GENRES, type Filters } from "@/lib/ai/schemas";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { toDiscoverQuery } from "./filters";

const none: Filters = { include: [], exclude: [], maxRuntime: null };

describe("toDiscoverQuery", () => {
  it.each<[string, Filters, Record<string, string>]>([
    ["no filters", none, {}],
    [
      "included genres",
      { ...none, include: ["mystery", "comedy"] },
      { with_genres: "9648,35" },
    ],
    [
      "an excluded keyword",
      { ...none, exclude: ["horror"] },
      { without_keywords: "315058" },
    ],
    [
      "an included keyword",
      { ...none, include: ["romance"] },
      { with_keywords: "9840" },
    ],
    [
      "an excluded genre",
      { ...none, exclude: ["animation"] },
      { without_genres: "16" },
    ],
    [
      "a max runtime",
      { ...none, maxRuntime: 30 },
      { "with_runtime.gte": "1", "with_runtime.lte": "30" },
    ],
    [
      "the same genre included and excluded",
      { ...none, include: ["drama"], exclude: ["drama"] },
      { without_genres: "18" },
    ],
  ])("turns %s into discover params", (_, filters, query) => {
    expect(toDiscoverQuery(filters)).toEqual(query);
  });
});

describe("FILTER_GENRES", () => {
  it("has a label in both languages for every genre", () => {
    for (const slug of FILTER_GENRES) {
      expect(en.FilterGenres).toHaveProperty(slug);
      expect(es.FilterGenres).toHaveProperty(slug);
    }
  });
});

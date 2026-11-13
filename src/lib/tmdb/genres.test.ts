import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { GENRES, genreFromSlug } from "./genres";

describe("genreFromSlug", () => {
  it("finds a genre by its slug", () => {
    expect(genreFromSlug("mystery")).toEqual({ slug: "mystery", tmdbId: 9648 });
  });

  it.each([[undefined], [""], ["nope"], ["Mystery"], [["mystery", "comedy"]]])(
    "returns undefined for %j",
    (value) => {
      expect(genreFromSlug(value)).toBeUndefined();
    },
  );
});

describe("GENRES", () => {
  it("has a label in both languages for every genre", () => {
    for (const { slug } of GENRES) {
      expect(en.Genres).toHaveProperty(slug);
      expect(es.Genres).toHaveProperty(slug);
    }
  });
});

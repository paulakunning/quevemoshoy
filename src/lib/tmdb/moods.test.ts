import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { MOODS, moodFromSlug } from "./moods";

describe("moodFromSlug", () => {
  it("finds a mood by its slug", () => {
    expect(moodFromSlug("binge")).toMatchObject({
      slug: "binge",
      minSeasons: 4,
    });
  });

  it.each([[undefined], [""], ["nope"], ["Binge"], [["light", "short"]]])(
    "returns undefined for %j",
    (value) => {
      expect(moodFromSlug(value)).toBeUndefined();
    },
  );
});

describe("MOODS", () => {
  it("has a label in both languages for every mood", () => {
    for (const { slug } of MOODS) {
      expect(en.Moods).toHaveProperty(slug);
      expect(es.Moods).toHaveProperty(slug);
    }
  });
});

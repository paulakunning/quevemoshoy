import type { DiscoverQuery } from "./client";

// Moods are not TMDB genres: each one is a fixed set of discover filters.
// In TMDB filters "," means AND and "|" means OR
export const MOODS = [
  { slug: "light", query: { with_genres: "35" } },
  {
    slug: "short",
    // Many shows have no runtime in TMDB; `gte` leaves those out.
    // Without animation, kids, news, soaps and talk shows, which fill the top otherwise
    query: {
      "with_runtime.gte": "1",
      "with_runtime.lte": "30",
      without_genres: "16,10762,10763,10766,10767",
    },
  },
  {
    slug: "binge",
    query: { with_genres: "9648|80", "vote_average.gte": "7.5" },
    minSeasons: 4,
  },
  {
    slug: "couple",
    // 9840 is the "romance" keyword: TMDB has no romance genre for TV.
    // The keyword alone also tags crime and fantasy shows, so those are left out
    query: {
      with_keywords: "9840",
      with_genres: "18|35",
      without_genres: "16,10762,80,9648,10765",
    },
  },
] as const satisfies readonly {
  slug: string;
  query: DiscoverQuery;
  minSeasons?: number;
}[];

export type Mood = (typeof MOODS)[number];
export type MoodSlug = Mood["slug"];

// `value` is what Next gives for ?mood=…: missing, one value, or several if repeated
export function moodFromSlug(
  value: string | string[] | undefined,
): Mood | undefined {
  if (typeof value !== "string") return undefined;
  return MOODS.find((mood) => mood.slug === value);
}

import { z } from "zod";

// Genres the AI may pick from. For TV, TMDB has horror and romance as keywords, not genres
export const FILTER_GENRES = [
  "action",
  "animation",
  "comedy",
  "crime",
  "documentary",
  "drama",
  "family",
  "horror",
  "mystery",
  "reality",
  "romance",
  "sci-fi",
  "war",
  "western",
] as const;

export type FilterGenre = (typeof FILTER_GENRES)[number];

export const filtersSchema = z.object({
  include: z.array(z.enum(FILTER_GENRES)).max(3),
  exclude: z.array(z.enum(FILTER_GENRES)).max(3),
  maxRuntime: z.number().int().min(5).max(180).nullable(),
});

export type Filters = z.infer<typeof filtersSchema>;

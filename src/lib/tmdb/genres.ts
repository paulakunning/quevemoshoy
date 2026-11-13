// TMDB genre IDs for TV shows (GET /genre/tv/list); the movie list uses different ones
export const GENRES = [
  { slug: "mystery", tmdbId: 9648 },
  { slug: "comedy", tmdbId: 35 },
  { slug: "drama", tmdbId: 18 },
  { slug: "sci-fi", tmdbId: 10765 },
  { slug: "crime", tmdbId: 80 },
  { slug: "animation", tmdbId: 16 },
] as const;

export type Genre = (typeof GENRES)[number];
export type GenreSlug = Genre["slug"];

// `value` is what Next gives for ?genre=…: missing, one value, or several if repeated
export function genreFromSlug(
  value: string | string[] | undefined,
): Genre | undefined {
  if (typeof value !== "string") return undefined;
  return GENRES.find((genre) => genre.slug === value);
}

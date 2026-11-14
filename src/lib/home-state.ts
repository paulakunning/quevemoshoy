import type { GenreSlug } from "@/lib/tmdb/genres";
import type { ShowSummary } from "@/lib/tmdb/shows";

// Everything the home page can be showing. `kind` says which case it is,
// and each case carries only the data that exists in it
export type HomeState =
  | { kind: "idle" }
  | { kind: "loading"; genre: GenreSlug }
  | { kind: "results"; genre: GenreSlug; shows: ShowSummary[] }
  | { kind: "empty"; genre: GenreSlug }
  | { kind: "error"; genre: GenreSlug };

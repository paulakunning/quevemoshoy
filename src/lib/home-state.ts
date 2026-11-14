import type { DiscoverResult } from "@/lib/tmdb/client";
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

// Turns what TMDB answered into what the home page shows
export function toHomeState(
  genre: GenreSlug,
  result: DiscoverResult,
): HomeState {
  switch (result.status) {
    case "ok":
      return { kind: "results", genre, shows: result.shows };
    case "no_results":
      return { kind: "empty", genre };
    case "error":
      return { kind: "error", genre };
  }
}

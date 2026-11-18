import type { DiscoverResult } from "@/lib/tmdb/client";
import type { GenreSlug } from "@/lib/tmdb/genres";
import type { MoodSlug } from "@/lib/tmdb/moods";
import type { ShowSummary } from "@/lib/tmdb/shows";

// A pill is a genre or a mood; their slugs never repeat
export type PillSlug = GenreSlug | MoodSlug;

// Everything the home page can be showing. `kind` says which case it is,
// and each case carries only the data that exists in it
export type HomeState =
  | { kind: "idle" }
  | { kind: "loading"; pill: PillSlug }
  | { kind: "results"; pill: PillSlug; shows: ShowSummary[] }
  | { kind: "empty"; pill: PillSlug }
  | { kind: "error"; pill: PillSlug };

// Turns what TMDB answered into what the home page shows
export function toHomeState(pill: PillSlug, result: DiscoverResult): HomeState {
  switch (result.status) {
    case "ok":
      return { kind: "results", pill, shows: result.shows };
    case "no_results":
      return { kind: "empty", pill };
    case "error":
      return { kind: "error", pill };
  }
}

import type { Filters } from "@/lib/ai/schemas";
import type { SearchResult } from "@/lib/search";
import type { DiscoverResult } from "@/lib/tmdb/client";
import type { GenreSlug } from "@/lib/tmdb/genres";
import type { MoodSlug } from "@/lib/tmdb/moods";
import type { ShowSummary } from "@/lib/tmdb/shows";

// A pill is a genre or a mood; their slugs never repeat
export type PillSlug = GenreSlug | MoodSlug;

// Everything the home page can be showing. `kind` says which case it is,
// and each case carries only the data that exists in it.
// Without `pill`, the state comes from the text search
export type HomeState =
  | { kind: "idle" }
  | { kind: "loading"; pill: PillSlug }
  | { kind: "thinking" }
  | {
      kind: "results";
      pill?: PillSlug;
      shows: ShowSummary[];
      filters?: Filters;
    }
  | { kind: "empty"; pill?: PillSlug }
  | { kind: "error"; pill?: PillSlug };

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

// Turns what the text search answered into what the home page shows
export function searchToHomeState(result: SearchResult): HomeState {
  switch (result.status) {
    case "ok":
      return { kind: "results", shows: result.shows, filters: result.filters };
    case "no_results":
      return { kind: "empty" };
    case "ai_error":
    case "error":
      return { kind: "error" };
    case "invalid_input":
      return { kind: "idle" };
  }
}

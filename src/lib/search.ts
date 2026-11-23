import type { Locale } from "next-intl";
import { textToFilters } from "./ai/filters";
import type { Filters } from "./ai/schemas";
import { discoverShows } from "./tmdb/client";
import { toDiscoverQuery } from "./tmdb/filters";
import type { ShowSummary } from "./tmdb/shows";

export type SearchResult =
  | { status: "ok"; shows: ShowSummary[]; filters: Filters }
  | { status: "no_results"; filters: Filters }
  | { status: "invalid_input" }
  | { status: "ai_error" }
  | { status: "error" };

const MAX_LENGTH = 200;

// `text` arrives as a Server Action argument: anyone can send anything, not only a string
export async function searchByText(
  text: unknown,
  locale: Locale,
): Promise<SearchResult> {
  if (typeof text !== "string") return { status: "invalid_input" };
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
    return { status: "invalid_input" };
  }

  const ai = await textToFilters(trimmed);
  if (ai.status === "error") return { status: "ai_error" };

  const result = await discoverShows(toDiscoverQuery(ai.filters), locale);
  if (result.status === "ok") {
    return { status: "ok", shows: result.shows, filters: ai.filters };
  }
  if (result.status === "no_results") {
    return { status: "no_results", filters: ai.filters };
  }
  return { status: "error" };
}

import type { Locale } from "next-intl";
import { textToFilters } from "./ai/filters";
import type { Filters } from "./ai/schemas";
import { takeSearch, type Quota } from "./rate-limit";
import { discoverShows } from "./tmdb/client";
import { toDiscoverQuery } from "./tmdb/filters";
import type { ShowSummary } from "./tmdb/shows";

// Every search that got counted says how many are left. `error` only lacks it
// when the database is the one that failed
export type SearchResult =
  | { status: "ok"; shows: ShowSummary[]; filters: Filters; quota: Quota }
  | { status: "no_results"; filters: Filters; quota: Quota }
  | { status: "quota"; quota: Quota }
  | { status: "invalid_input" }
  | { status: "ai_error"; quota: Quota }
  | { status: "error"; quota?: Quota };

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

  // Counted before calling the AI: a search that fails later still counts
  const usage = await takeSearch();
  if (usage.status !== "ok") return usage;
  const { quota } = usage;

  const ai = await textToFilters(trimmed);
  if (ai.status === "error") return { status: "ai_error", quota };

  const result = await discoverShows(toDiscoverQuery(ai.filters), locale);
  if (result.status === "ok") {
    return { status: "ok", shows: result.shows, filters: ai.filters, quota };
  }
  if (result.status === "no_results") {
    return { status: "no_results", filters: ai.filters, quota };
  }
  return { status: "error", quota };
}

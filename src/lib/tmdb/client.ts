import "server-only";
import { cacheLife } from "next/cache";
import type { Locale } from "next-intl";
import {
  toShowDetail,
  toShowSummary,
  type ShowDetail,
  type ShowSummary,
  type TmdbShow,
  type TmdbShowDetail,
} from "./shows";

export type DiscoverResult =
  | { status: "ok"; shows: ShowSummary[] }
  | { status: "no_results" }
  | { status: "error" };

export type ShowResult =
  | { status: "ok"; show: ShowDetail }
  | { status: "not_found" }
  | { status: "error" };

const TMDB_LANGUAGE: Record<Locale, string> = { es: "es-AR", en: "en-US" };

// Read on each request, not on import, so `next build` works without the token
function token(): string {
  const value = process.env.TMDB_TOKEN;
  if (!value) throw new Error("TMDB_TOKEN is not set");
  return value;
}

// Throws on failure so an error never gets stored in the cache
async function fetchTmdb(
  path: string,
  query: Record<string, string>,
): Promise<{ found: true; body: unknown } | { found: false }> {
  "use cache";
  cacheLife("hours");

  const url = `https://api.themoviedb.org/3${path}?${new URLSearchParams(query)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token()}` },
  });

  if (res.status === 404) return { found: false };
  if (!res.ok) throw new Error(`TMDB responded ${res.status} for ${path}`);
  return { found: true, body: await res.json() };
}

// Filters for TMDB's discover, e.g. { with_genres: "35" }
export type DiscoverQuery = Record<string, string>;

export async function discoverShows(
  query: DiscoverQuery,
  locale: Locale,
  minSeasons?: number,
): Promise<DiscoverResult> {
  try {
    const language = TMDB_LANGUAGE[locale];
    const res = await fetchTmdb("/discover/tv", {
      ...query,
      language,
      sort_by: "popularity.desc",
      include_adult: "false",
      "vote_count.gte": "200",
    });
    if (!res.found) return { status: "error" };
    let { results } = res.body as { results: TmdbShow[] };
    if (minSeasons !== undefined) {
      results = await keepLongShows(results, minSeasons, language);
    }
    if (results.length === 0) return { status: "no_results" };
    return { status: "ok", shows: results.slice(0, 5).map(toShowSummary) };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
}

// Discover can't filter by number of seasons: that is only in each show's detail.
// The details are asked for in parallel and stay cached like any other request
async function keepLongShows(
  shows: TmdbShow[],
  minSeasons: number,
  language: string,
): Promise<TmdbShow[]> {
  const details = await Promise.all(
    shows.map((show) => fetchTmdb(`/tv/${show.id}`, { language })),
  );
  // seasons[i] is how many seasons shows[i] has; 0 when TMDB doesn't know
  const seasons = details.map((detail) =>
    detail.found ? ((detail.body as TmdbShowDetail).number_of_seasons ?? 0) : 0,
  );
  return shows.filter((show, index) => (seasons[index] ?? 0) >= minSeasons);
}

export async function getShow(id: number, locale: Locale): Promise<ShowResult> {
  try {
    const res = await fetchTmdb(`/tv/${id}`, {
      language: TMDB_LANGUAGE[locale],
    });
    if (!res.found) return { status: "not_found" };
    const show = res.body as TmdbShowDetail;
    return { status: "ok", show: toShowDetail(show) };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
}

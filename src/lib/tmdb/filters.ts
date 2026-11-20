import type { FilterGenre, Filters } from "@/lib/ai/schemas";
import type { DiscoverQuery } from "./client";

// TV genre IDs from TMDB; horror and romance only exist as keywords for TV
const TMDB_IDS: Record<
  FilterGenre,
  { kind: "genres" | "keywords"; id: number }
> = {
  action: { kind: "genres", id: 10759 },
  animation: { kind: "genres", id: 16 },
  comedy: { kind: "genres", id: 35 },
  crime: { kind: "genres", id: 80 },
  documentary: { kind: "genres", id: 99 },
  drama: { kind: "genres", id: 18 },
  family: { kind: "genres", id: 10751 },
  horror: { kind: "keywords", id: 315058 },
  mystery: { kind: "genres", id: 9648 },
  reality: { kind: "genres", id: 10764 },
  romance: { kind: "keywords", id: 9840 },
  "sci-fi": { kind: "genres", id: 10765 },
  war: { kind: "genres", id: 10768 },
  western: { kind: "genres", id: 37 },
};

export function toDiscoverQuery({
  include,
  exclude,
  maxRuntime,
}: Filters): DiscoverQuery {
  // A genre both wanted and excluded would always give zero shows: exclusion wins
  const wanted = include.filter((slug) => !exclude.includes(slug));
  const query: DiscoverQuery = {
    ...toParams("with", wanted),
    ...toParams("without", exclude),
  };
  if (maxRuntime !== null) {
    // Many shows have no runtime in TMDB; `gte` leaves those out
    query["with_runtime.gte"] = "1";
    query["with_runtime.lte"] = String(maxRuntime);
  }
  return query;
}

// ["mystery", "horror"] with "with" → { with_genres: "9648", with_keywords: "315058" }.
// "," means AND in TMDB filters: every included genre has to be there
function toParams(
  prefix: "with" | "without",
  slugs: readonly FilterGenre[],
): DiscoverQuery {
  const params: DiscoverQuery = {};
  for (const kind of ["genres", "keywords"] as const) {
    const ids = slugs
      .filter((slug) => TMDB_IDS[slug].kind === kind)
      .map((slug) => TMDB_IDS[slug].id);
    if (ids.length > 0) params[`${prefix}_${kind}`] = ids.join(",");
  }
  return params;
}

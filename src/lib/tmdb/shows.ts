// What TMDB sends for a show in a list. Only the fields the app uses;
// most are optional because TMDB leaves them out or empty for some shows.
export type TmdbShow = {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  overview?: string;
};

// What TMDB sends for GET /tv/{id}
export type TmdbShowDetail = TmdbShow & {
  genres?: { id: number; name: string }[];
};

// What the app works with
export type ShowSummary = {
  id: number;
  name: string;
  year: number | null;
  rating: number | null;
  posterPath: string | null;
  overview: string;
};

export type ShowDetail = ShowSummary & { genres: string[] };

export function toShowSummary(raw: TmdbShow): ShowSummary {
  return {
    id: raw.id,
    name: raw.name,
    year: raw.first_air_date
      ? parseInt(raw.first_air_date.substring(0, 4))
      : null,
    rating:
      raw.vote_count && raw.vote_count > 0
        ? Math.round((raw.vote_average ?? 0) * 10) / 10
        : null,
    posterPath: raw.poster_path,
    overview: raw.overview ?? "",
  };
}

export function toShowDetail(raw: TmdbShowDetail): ShowDetail {
  return {
    ...toShowSummary(raw),
    genres: raw.genres?.map((g) => g.name) || [],
  };
}

export function posterUrl(
  path: string,
  size: "w185" | "w342" | "w500",
): string {
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

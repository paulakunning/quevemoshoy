import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { discoverShows, getShow } from "./client";

// These two only work inside Next, so the tests replace them with empty versions
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: vi.fn() }));

// A fake `fetch`: no test in this file reaches the real TMDB
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("TMDB_TOKEN", "test-token");
  // The client logs its errors; keep them out of the test output
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

// Makes the fake `fetch` answer with this status and body
function respond(status: number, body: unknown = {}) {
  fetchMock.mockResolvedValue(Response.json(body, { status }));
}

// The URL and headers the client passed to `fetch`
function request() {
  const [url, options] = fetchMock.mock.calls[0]!;
  return { url: new URL(url as string), headers: options?.headers };
}

// A show as TMDB sends it in a list
function tmdbShow(id: number) {
  return {
    id,
    name: `Show ${id}`,
    poster_path: "/x.jpg",
    first_air_date: "2010-07-25",
    vote_average: 8.503,
    vote_count: 5412,
    overview: "An overview.",
  };
}

describe("discoverShows", () => {
  it("asks TMDB for popular shows of that genre, with the token", async () => {
    respond(200, { results: [] });
    await discoverShows({ with_genres: "35" }, "es");
    expect(request().url.pathname).toBe("/3/discover/tv");
    expect(request().url.searchParams.get("with_genres")).toBe("35");
    expect(request().url.searchParams.get("language")).toBe("es-AR");
    expect(request().url.searchParams.get("sort_by")).toBe("popularity.desc");
    expect(request().url.searchParams.get("include_adult")).toBe("false");
    expect(request().url.searchParams.get("vote_count.gte")).toBe("200");
    expect(request().headers).toEqual({ Authorization: "Bearer test-token" });
  });
  it("asks in English for the en locale", async () => {
    respond(200, { results: [] });
    await discoverShows({ with_genres: "35" }, "en");
    expect(request().url.searchParams.get("language")).toBe("en-US");
  });

  it("returns the first 5 shows, converted", async () => {
    respond(200, { results: [1, 2, 3, 4, 5, 6, 7].map(tmdbShow) });
    const result = await discoverShows({ with_genres: "35" }, "es");
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.shows).toHaveLength(5);
      expect(result.shows[0]?.year).toBe(2010);
    }
  });

  it("returns error when TMDB responds 500", async () => {
    respond(500);
    const result = await discoverShows({ with_genres: "35" }, "es");
    expect(result).toEqual({ status: "error" });
  });

  it("returns error when the network fails", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const result = await discoverShows({ with_genres: "35" }, "es");
    expect(result).toEqual({ status: "error" });
  });

  it("returns error without calling TMDB when the token is missing", async () => {
    vi.stubEnv("TMDB_TOKEN", "");
    const result = await discoverShows({ with_genres: "35" }, "es");
    expect(result).toEqual({ status: "error" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("returns no_results when TMDB finds nothing", async () => {
    respond(200, { results: [] });
    const result = await discoverShows({ with_genres: "9648" }, "es");
    expect(result).toEqual({ status: "no_results" });
  });

  it("sends every filter of the query to TMDB", async () => {
    respond(200, { results: [] });
    await discoverShows(
      { with_genres: "9648|80", "vote_average.gte": "7.5" },
      "es",
    );
    expect(request().url.searchParams.get("with_genres")).toBe("9648|80");
    expect(request().url.searchParams.get("vote_average.gte")).toBe("7.5");
  });

  describe("with a minimum of seasons", () => {
    // The list answers with these shows, and each /tv/{id} with its seasons
    // (or with that status code when it is not a number of seasons)
    function respondWithSeasons(seasons: Record<number, number>) {
      const ids = Object.keys(seasons).map(Number);
      fetchMock.mockImplementation(async (url) => {
        const { pathname } = new URL(url as string);
        if (pathname === "/3/discover/tv") {
          return Response.json({ results: ids.map(tmdbShow) });
        }
        const id = Number(pathname.split("/").pop());
        const value = seasons[id]!;
        return value >= 400
          ? Response.json({}, { status: value })
          : Response.json({ ...tmdbShow(id), number_of_seasons: value });
      });
    }

    it("keeps the shows with that many seasons or more, in order", async () => {
      respondWithSeasons({ 1: 5, 2: 2, 3: 4, 4: 1, 5: 7, 6: 4 });
      const result = await discoverShows({ with_genres: "9648" }, "es", 4);
      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.shows.map((show) => show.id)).toEqual([1, 3, 5, 6]);
      }
    });

    it("returns at most 5 shows", async () => {
      respondWithSeasons({ 1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4 });
      const result = await discoverShows({ with_genres: "9648" }, "es", 4);
      if (result.status === "ok") {
        expect(result.shows.map((show) => show.id)).toEqual([1, 2, 3, 4, 5]);
      }
      expect(result.status).toBe("ok");
    });

    it("returns no_results when no show has enough seasons", async () => {
      respondWithSeasons({ 1: 1, 2: 3 });
      const result = await discoverShows({ with_genres: "9648" }, "es", 4);
      expect(result).toEqual({ status: "no_results" });
    });

    it("skips a show whose detail is not found", async () => {
      respondWithSeasons({ 1: 5, 2: 404, 3: 6 });
      const result = await discoverShows({ with_genres: "9648" }, "es", 4);
      if (result.status === "ok") {
        expect(result.shows.map((show) => show.id)).toEqual([1, 3]);
      }
      expect(result.status).toBe("ok");
    });

    it("returns error when a detail fails", async () => {
      respondWithSeasons({ 1: 5, 2: 500 });
      const result = await discoverShows({ with_genres: "9648" }, "es", 4);
      expect(result).toEqual({ status: "error" });
    });
  });
});

describe("getShow", () => {
  it("asks TMDB for that show and returns its detail", async () => {
    respond(200, tmdbShow(19885));
    const result = await getShow(19885, "es");
    expect(request().url.pathname).toBe("/3/tv/19885");
    expect(result.status).toBe("ok");
  });
  it("returns not_found when TMDB responds 404", async () => {
    respond(404);
    const result = await getShow(19885, "es");
    expect(result).toEqual({ status: "not_found" });
  });
  it("returns error when TMDB responds 500", async () => {
    respond(500);
    const result = await getShow(19885, "es");
    expect(result).toEqual({ status: "error" });
  });
});

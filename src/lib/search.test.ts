import { beforeEach, describe, expect, it, vi } from "vitest";
import { textToFilters } from "./ai/filters";
import type { Filters } from "./ai/schemas";
import { takeSearch, type Quota } from "./rate-limit";
import { searchByText } from "./search";
import { discoverShows } from "./tmdb/client";
import { toDiscoverQuery } from "./tmdb/filters";
import type { ShowSummary } from "./tmdb/shows";

// The AI, TMDB and the usage limit are replaced by fakes: each test decides what they answer
vi.mock("./ai/filters", () => ({ textToFilters: vi.fn() }));
vi.mock("./tmdb/client", () => ({ discoverShows: vi.fn() }));
vi.mock("./rate-limit", () => ({ takeSearch: vi.fn() }));

const filters: Filters = {
  include: ["mystery"],
  exclude: [],
  maxRuntime: null,
};
const shows: ShowSummary[] = [
  {
    id: 1,
    name: "Dark",
    year: 2017,
    rating: 8.4,
    posterPath: null,
    overview: "",
  },
];
const quota: Quota = { left: 4, global: false };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(takeSearch).mockResolvedValue({ status: "ok", quota });
  vi.mocked(textToFilters).mockResolvedValue({
    status: "ok",
    filters,
    tokens: 100,
  });
  vi.mocked(discoverShows).mockResolvedValue({ status: "ok", shows });
});

describe("searchByText", () => {
  it("trims the text and returns the shows, the filters and the quota", async () => {
    const result = await searchByText("  misterio  ", "es");

    expect(textToFilters).toHaveBeenCalledWith("misterio");
    expect(result).toEqual({ status: "ok", shows, filters, quota });
  });

  it("searches TMDB with the filters and the language", async () => {
    await searchByText("misterio", "es");

    expect(discoverShows).toHaveBeenCalledWith(toDiscoverQuery(filters), "es");
  });

  it.each([[""], ["   "], ["a".repeat(201)], [42], [undefined]])(
    "returns invalid_input for %j without counting it or calling the AI",
    async (text) => {
      expect(await searchByText(text, "es")).toEqual({
        status: "invalid_input",
      });
      expect(takeSearch).not.toHaveBeenCalled();
      expect(textToFilters).not.toHaveBeenCalled();
    },
  );

  it("accepts 200 characters", async () => {
    const result = await searchByText("a".repeat(200), "es");

    expect(result.status).not.toBe("invalid_input");
  });

  it.each([
    ["this IP", { left: 0, global: false }],
    ["everyone", { left: 0, global: true }],
  ])(
    "returns quota without calling the AI when %s ran out",
    async (_, empty) => {
      vi.mocked(takeSearch).mockResolvedValue({
        status: "quota",
        quota: empty,
      });

      expect(await searchByText("misterio", "es")).toEqual({
        status: "quota",
        quota: empty,
      });
      expect(textToFilters).not.toHaveBeenCalled();
    },
  );

  it("returns error without calling the AI when the database fails", async () => {
    vi.mocked(takeSearch).mockResolvedValue({ status: "error" });

    expect(await searchByText("misterio", "es")).toEqual({ status: "error" });
    expect(textToFilters).not.toHaveBeenCalled();
  });

  it("returns ai_error with the quota, without calling TMDB, when the AI fails", async () => {
    vi.mocked(textToFilters).mockResolvedValue({ status: "error" });

    expect(await searchByText("misterio", "es")).toEqual({
      status: "ai_error",
      quota,
    });
    expect(discoverShows).not.toHaveBeenCalled();
  });

  it("returns no_results with the filters and the quota when TMDB finds nothing", async () => {
    vi.mocked(discoverShows).mockResolvedValue({ status: "no_results" });

    expect(await searchByText("misterio", "es")).toEqual({
      status: "no_results",
      filters,
      quota,
    });
  });

  it("returns error with the quota when TMDB fails", async () => {
    vi.mocked(discoverShows).mockResolvedValue({ status: "error" });

    expect(await searchByText("misterio", "es")).toEqual({
      status: "error",
      quota,
    });
  });
});

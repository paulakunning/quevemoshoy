import { beforeEach, describe, expect, it, vi } from "vitest";
import { textToFilters } from "./ai/filters";
import type { Filters } from "./ai/schemas";
import { searchByText } from "./search";
import { discoverShows } from "./tmdb/client";
import { toDiscoverQuery } from "./tmdb/filters";
import type { ShowSummary } from "./tmdb/shows";

// The AI and TMDB are replaced by fakes: each test decides what they answer
vi.mock("./ai/filters", () => ({ textToFilters: vi.fn() }));
vi.mock("./tmdb/client", () => ({ discoverShows: vi.fn() }));

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

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(textToFilters).mockResolvedValue({
    status: "ok",
    filters,
    tokens: 100,
  });
  vi.mocked(discoverShows).mockResolvedValue({ status: "ok", shows });
});

describe("searchByText", () => {
  it("trims the text and returns the shows with the filters", async () => {
    const result = await searchByText("  misterio  ", "es");

    expect(textToFilters).toHaveBeenCalledWith("misterio");
    expect(result).toEqual({ status: "ok", shows, filters });
  });

  it("searches TMDB with the filters and the language", async () => {
    await searchByText("misterio", "es");

    expect(discoverShows).toHaveBeenCalledWith(toDiscoverQuery(filters), "es");
  });

  it.each([[""], ["   "], ["a".repeat(201)], [42], [undefined]])(
    "returns invalid_input for %j without calling the AI",
    async (text) => {
      expect(await searchByText(text, "es")).toEqual({
        status: "invalid_input",
      });
      expect(textToFilters).not.toHaveBeenCalled();
    },
  );

  it("accepts 200 characters", async () => {
    const result = await searchByText("a".repeat(200), "es");

    expect(result.status).not.toBe("invalid_input");
  });

  it("returns ai_error without calling TMDB when the AI fails", async () => {
    vi.mocked(textToFilters).mockResolvedValue({ status: "error" });

    expect(await searchByText("misterio", "es")).toEqual({
      status: "ai_error",
    });
    expect(discoverShows).not.toHaveBeenCalled();
  });

  it("returns no_results with the filters when TMDB finds nothing", async () => {
    vi.mocked(discoverShows).mockResolvedValue({ status: "no_results" });

    expect(await searchByText("misterio", "es")).toEqual({
      status: "no_results",
      filters,
    });
  });

  it("returns error when TMDB fails", async () => {
    vi.mocked(discoverShows).mockResolvedValue({ status: "error" });

    expect(await searchByText("misterio", "es")).toEqual({ status: "error" });
  });
});

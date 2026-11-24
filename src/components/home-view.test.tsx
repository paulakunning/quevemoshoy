import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import type { Filters } from "@/lib/ai/schemas";
import type { HomeState } from "@/lib/home-state";
import type { ShowSummary } from "@/lib/tmdb/shows";
import es from "@/messages/es.json";
import { HomeView } from "./home-view";
import { SearchProvider } from "./search-provider";

vi.mock("@/app/[locale]/actions", () => ({ searchAction: vi.fn() }));

// The components read their texts from next-intl, so the test gives them the Spanish ones.
// The search form inside the view needs its provider
function renderView(state: HomeState) {
  return render(
    <NextIntlClientProvider locale="es" messages={es}>
      <SearchProvider>
        <HomeView state={state} />
      </SearchProvider>
    </NextIntlClientProvider>,
  );
}

const shows: ShowSummary[] = [
  {
    id: 5920,
    name: "El mentalista",
    year: 2008,
    rating: 8.4,
    posterPath: "/zZEndCRk5mWKw7LB9kAAO4LcgRh.jpg",
    overview: "Patrick Jane, ex médium, trabaja de asesor para la policía.",
  },
  {
    id: 1695,
    name: "Monk",
    year: 2002,
    rating: 7.9,
    posterPath: "/3axGMbUecXXOPSeG47v2i9wK5y5.jpg",
    overview: "Un ex policía obsesivo resuelve los casos más complicados.",
  },
  {
    id: 873,
    name: "Colombo",
    year: 1971,
    rating: 8.1,
    posterPath: "/10AFO1tXhQWXrqPyyeSzk3E2ciu.jpg",
    overview: "Un detective desaliñado al que todos subestiman.",
  },
  {
    id: 19885,
    name: "Sherlock",
    year: 2010,
    rating: 8.5,
    posterPath: "/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg",
    overview: "El detective de Conan Doyle, en el Londres de hoy.",
  },
  {
    id: 78191,
    name: "You",
    year: 2018,
    rating: 8,
    posterPath: "/30vdq2GJKUgYW3utQnXDOiE6tvn.jpg",
    overview: "Un hombre encantador y obsesivo se mete en vidas ajenas.",
  },
];

describe("HomeView", () => {
  describe("idle", () => {
    it("shows the title", () => {
      renderView({ kind: "idle" });
      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveTextContent("¿Qué vemos hoy?");
    });

    it("shows six genre and four mood links and none is the current one", () => {
      renderView({ kind: "idle" });
      const pillLinks = screen.getAllByRole("link");
      expect(pillLinks).toHaveLength(10);
      for (const link of pillLinks) {
        expect(link).not.toHaveAttribute("aria-current");
      }
    });

    it("links Misterio to /es?genre=mystery", () => {
      renderView({ kind: "idle" });
      const mysteryLink = screen.getByRole("link", { name: "Misterio" });
      expect(mysteryLink).toHaveAttribute("href", "/es?genre=mystery");
    });
  });

  describe("results", () => {
    it("shows the first show as a level 2 heading", () => {
      renderView({ kind: "results", pill: "mystery", shows });
      const firstShowHeading = screen.getByRole("heading", { level: 2 });
      expect(firstShowHeading).toHaveTextContent("El mentalista");
    });
    it("links 'Ver detalle' to the first show's page", () => {
      renderView({ kind: "results", pill: "mystery", shows });
      const detailLink = screen.getByRole("link", { name: "Ver detalle" });
      expect(detailLink).toHaveAttribute("href", "/es/shows/5920");
    });
    it("lists the other four shows", () => {
      renderView({ kind: "results", pill: "mystery", shows });
      const otherShowsList = screen.getByRole("list");
      const otherShowsItems = within(otherShowsList).getAllByRole("listitem");
      expect(otherShowsItems).toHaveLength(4);
      expect(otherShowsItems[0]).toHaveTextContent("Monk");
      expect(otherShowsItems[1]).toHaveTextContent("Colombo");
      expect(otherShowsItems[2]).toHaveTextContent("Sherlock");
      expect(otherShowsItems[3]).toHaveTextContent("You");
    });
    it("announces how many shows there are and which is the first", () => {
      renderView({ kind: "results", pill: "mystery", shows });
      const announcement = screen.getByRole("status");
      expect(announcement).toHaveTextContent(
        "Listo: 5 series. La primera es El mentalista.",
      );
    });
    it("marks the active genre as the current page", () => {
      renderView({ kind: "results", pill: "mystery", shows });
      const mysteryLink = screen.getByRole("link", { name: "Misterio" });
      expect(mysteryLink).toHaveAttribute("aria-current", "page");
    });

    it("marks the active mood as the current page", () => {
      renderView({ kind: "results", pill: "binge", shows });
      const bingeLink = screen.getByRole("link", { name: "Para engancharme" });
      expect(bingeLink).toHaveAttribute("aria-current", "page");
      expect(bingeLink).toHaveAttribute("href", "/es?mood=binge");
    });

    it("groups the pills under Género and Ánimo", () => {
      renderView({ kind: "results", pill: "binge", shows });
      const genres = screen.getByRole("group", { name: "Género" });
      const moods = screen.getByRole("group", { name: "Ánimo" });
      expect(within(genres).getAllByRole("link")).toHaveLength(6);
      expect(within(moods).getAllByRole("link")).toHaveLength(4);
    });

    it("says there is no synopsis when a show has none", () => {
      const show: ShowSummary = {
        id: 1,
        name: "Serie de prueba",
        year: 2020,
        rating: 7,
        posterPath: null,
        overview: "",
      };
      renderView({ kind: "results", pill: "mystery", shows: [show] });

      expect(
        screen.getByText("Todavía no hay sinopsis en español."),
      ).toBeInTheDocument();
    });
    it("leaves out the rating when a show has none", () => {
      const show: ShowSummary = {
        id: 1,
        name: "Serie de prueba",
        year: 2020,
        rating: null,
        posterPath: null,
        overview: "Una serie de prueba sin calificación.",
      };
      renderView({ kind: "results", pill: "mystery", shows: [show] });
      expect(screen.queryByText("Puntaje en TMDB:")).not.toBeInTheDocument();
    });

    it("shows no list when there is only one show", () => {
      const show: ShowSummary = {
        id: 1,
        name: "Serie de prueba",
        year: 2020,
        rating: 7,
        posterPath: null,
        overview: "Una serie de prueba.",
      };
      renderView({ kind: "results", pill: "mystery", shows: [show] });
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  describe("loading", () => {
    it("announces that the ball is thinking", () => {
      renderView({ kind: "loading", pill: "mystery" });
      expect(screen.getByRole("status")).toHaveTextContent(
        "La bola está pensando…",
      );
    });

    it("shows no level 2 heading", () => {
      renderView({ kind: "loading", pill: "mystery" });
      expect(
        screen.queryByRole("heading", { level: 2 }),
      ).not.toBeInTheDocument();
    });
  });

  describe("empty", () => {
    it("shows the 'Muy dudoso' message and keeps the genre active", () => {
      renderView({ kind: "empty", pill: "mystery" });
      expect(screen.getByText("Muy dudoso")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Misterio" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  });

  describe("error", () => {
    it("shows the 'Respuesta confusa' message and keeps the pills", () => {
      renderView({ kind: "error", pill: "mystery" });
      expect(screen.getByText("Respuesta confusa")).toBeInTheDocument();
      expect(screen.getAllByRole("link")).toHaveLength(10);
    });
  });

  describe("text search", () => {
    const filters: Filters = {
      include: ["mystery"],
      exclude: ["horror"],
      maxRuntime: 30,
    };

    it("shows what the ball understood", () => {
      renderView({ kind: "results", shows, filters });
      const chips = screen.getByRole("region", {
        name: "Lo que entendió la bola",
      });
      expect(within(chips).getByText("Misterio")).toBeInTheDocument();
      expect(within(chips).getByText("Sin terror")).toBeInTheDocument();
      expect(
        within(chips).getByText("Episodios de hasta 30 min"),
      ).toBeInTheDocument();
    });

    it("offers to ask again and marks no pill as current", () => {
      renderView({ kind: "results", shows, filters });
      expect(
        screen.getByRole("button", { name: "Preguntar otra cosa" }),
      ).toBeInTheDocument();
      for (const link of screen.getAllByRole("link")) {
        expect(link).not.toHaveAttribute("aria-current");
      }
    });

    it("shows no chips when the ball understood nothing", () => {
      renderView({
        kind: "results",
        shows,
        filters: { include: [], exclude: [], maxRuntime: null },
      });
      expect(
        screen.queryByText("Lo que entendió la bola"),
      ).not.toBeInTheDocument();
    });

    it("shows no chips for a pill", () => {
      renderView({ kind: "results", pill: "mystery", shows });
      expect(
        screen.queryByText("Lo que entendió la bola"),
      ).not.toBeInTheDocument();
    });

    it("shows the text search message when nothing was found", () => {
      renderView({ kind: "empty" });
      expect(
        screen.getByText(
          "No encontramos series para ese pedido. Probá sacando una condición.",
        ),
      ).toBeInTheDocument();
    });

    it("tells this person to ask tomorrow when their searches ran out", () => {
      renderView({ kind: "quota", global: false });
      expect(screen.getByText("PREGUNTÁ")).toBeInTheDocument();
      expect(screen.getByText("MAÑANA")).toBeInTheDocument();
      expect(screen.getByText("Preguntá mañana")).toBeInTheDocument();
      expect(
        screen.getByText(/Se terminaron tus búsquedas de hoy/),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("link")).toHaveLength(10);
    });

    it("says the searches ran out for everyone at the global ceiling", () => {
      renderView({ kind: "quota", global: true });
      expect(
        screen.getByText(/Hoy se terminaron las búsquedas para todos/),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Se terminaron tus búsquedas de hoy/),
      ).not.toBeInTheDocument();
    });

    it("shows neither results nor a message while thinking", () => {
      renderView({ kind: "thinking" });
      expect(
        screen.queryByRole("heading", { level: 2 }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Muy dudoso")).not.toBeInTheDocument();
      expect(screen.queryByText("Respuesta confusa")).not.toBeInTheDocument();
    });
  });
});

import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import type { HomeState } from "@/lib/home-state";
import type { ShowSummary } from "@/lib/tmdb/shows";
import es from "@/messages/es.json";
import { HomeView } from "./home-view";

// The components read their texts from next-intl, so the test gives them the Spanish ones
function renderView(state: HomeState) {
  return render(
    <NextIntlClientProvider locale="es" messages={es}>
      <HomeView state={state} />
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

    it("shows six genre links and none is the current one", () => {
      renderView({ kind: "idle" });
      const genreLinks = screen.getAllByRole("link");
      expect(genreLinks).toHaveLength(6);
      for (const link of genreLinks) {
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
      renderView({ kind: "results", genre: "mystery", shows });
      const firstShowHeading = screen.getByRole("heading", { level: 2 });
      expect(firstShowHeading).toHaveTextContent("El mentalista");
    });
    it("links 'Ver detalle' to the first show's page", () => {
      renderView({ kind: "results", genre: "mystery", shows });
      const detailLink = screen.getByRole("link", { name: "Ver detalle" });
      expect(detailLink).toHaveAttribute("href", "/es/shows/5920");
    });
    it("lists the other four shows", () => {
      renderView({ kind: "results", genre: "mystery", shows });
      const otherShowsList = screen.getByRole("list");
      const otherShowsItems = within(otherShowsList).getAllByRole("listitem");
      expect(otherShowsItems).toHaveLength(4);
      expect(otherShowsItems[0]).toHaveTextContent("Monk");
      expect(otherShowsItems[1]).toHaveTextContent("Colombo");
      expect(otherShowsItems[2]).toHaveTextContent("Sherlock");
      expect(otherShowsItems[3]).toHaveTextContent("You");
    });
    it("announces how many shows there are and which is the first", () => {
      renderView({ kind: "results", genre: "mystery", shows });
      const announcement = screen.getByRole("status");
      expect(announcement).toHaveTextContent(
        "Listo: 5 series. La primera es El mentalista.",
      );
    });
    it("marks the active genre as the current page", () => {
      renderView({ kind: "results", genre: "mystery", shows });
      const mysteryLink = screen.getByRole("link", { name: "Misterio" });
      expect(mysteryLink).toHaveAttribute("aria-current", "page");
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
      renderView({ kind: "results", genre: "mystery", shows: [show] });

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
      renderView({ kind: "results", genre: "mystery", shows: [show] });
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
      renderView({ kind: "results", genre: "mystery", shows: [show] });
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  describe("loading", () => {
    it("announces that the ball is thinking", () => {
      renderView({ kind: "loading", genre: "mystery" });
      expect(screen.getByRole("status")).toHaveTextContent(
        "La bola está pensando…",
      );
    });

    it("shows no level 2 heading", () => {
      renderView({ kind: "loading", genre: "mystery" });
      expect(
        screen.queryByRole("heading", { level: 2 }),
      ).not.toBeInTheDocument();
    });
  });

  describe("empty", () => {
    it("shows the 'Muy dudoso' message and keeps the genre active", () => {
      renderView({ kind: "empty", genre: "mystery" });
      expect(screen.getByText("Muy dudoso")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Misterio" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  });

  describe("error", () => {
    it("shows the 'Respuesta confusa' message and keeps the six genre links", () => {
      renderView({ kind: "error", genre: "mystery" });
      expect(screen.getByText("Respuesta confusa")).toBeInTheDocument();
      expect(screen.getAllByRole("link")).toHaveLength(6);
    });
  });
});

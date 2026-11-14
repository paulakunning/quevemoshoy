import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import type { ShowDetail } from "@/lib/tmdb/shows";
import es from "@/messages/es.json";
import { ShowDetailView } from "./show-detail";

const sherlock: ShowDetail = {
  id: 19885,
  name: "Sherlock",
  year: 2010,
  rating: 8.5,
  posterPath: "/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg",
  overview: "El detective de Conan Doyle, en el Londres de hoy.",
  genres: ["Crimen", "Drama", "Misterio"],
};

function renderView(show: ShowDetail) {
  return render(
    <NextIntlClientProvider locale="es" messages={es}>
      <ShowDetailView show={show} />
    </NextIntlClientProvider>,
  );
}

describe("ShowDetailView", () => {
  it("shows the name as the level 1 heading", () => {
    renderView(sherlock);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Sherlock",
    );
  });

  it("lists the three genres", () => {
    renderView(sherlock);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("links to the show's page on TMDB", () => {
    renderView(sherlock);
    expect(screen.getByRole("link", { name: "Ver en TMDB" })).toHaveAttribute(
      "href",
      "https://www.themoviedb.org/tv/19885",
    );
  });

  it("says there is no synopsis when the show has none", () => {
    renderView({ ...sherlock, overview: "" });
    expect(
      screen.getByText("Todavía no hay sinopsis en español."),
    ).toBeInTheDocument();
  });

  it("leaves out the rating when the show has none", () => {
    renderView({ ...sherlock, rating: null });
    expect(screen.queryByText("Puntaje en TMDB:")).not.toBeInTheDocument();
  });
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchAction } from "@/app/[locale]/actions";
import type { SearchResult } from "@/lib/search";
import es from "@/messages/es.json";
import { HomeView } from "./home-view";
import { SearchProvider } from "./search-provider";

// The Server Action is replaced by a fake: each test decides what it answers
vi.mock("@/app/[locale]/actions", () => ({ searchAction: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

// The provider shows its children (here, the idle home) until there is a result
function renderHome() {
  render(
    <NextIntlClientProvider locale="es" messages={es}>
      <SearchProvider>
        <HomeView state={{ kind: "idle" }} />
      </SearchProvider>
    </NextIntlClientProvider>,
  );
}

const field = () => screen.getByRole("textbox", { name: "Tu pregunta" });
const submitButton = () =>
  screen.getByRole("button", { name: "Revelar series" });

function type(value: string) {
  fireEvent.change(field(), { target: { value } });
}

describe("SearchForm", () => {
  it("has a labelled field of up to 200 characters", () => {
    renderHome();
    expect(field()).toHaveAttribute("maxLength", "200");
  });

  it("counts the characters", () => {
    renderHome();
    expect(screen.getByText("0/200")).toBeInTheDocument();
    type("hola");
    expect(screen.getByText("4/200")).toBeInTheDocument();
  });

  it.each([[""], ["   "]])(
    "disables the button when the field is %j",
    (value) => {
      renderHome();
      type(value);
      expect(submitButton()).toBeDisabled();
    },
  );

  it("sends the text and the language with Enter", async () => {
    vi.mocked(searchAction).mockResolvedValue({ status: "invalid_input" });
    renderHome();
    type("hola");
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(searchAction).toHaveBeenCalledWith("hola", "es");
    await screen.findByText("Escribí un pedido de hasta 200 caracteres.");
  });

  it("doesn't send with Shift+Enter", () => {
    renderHome();
    type("hola");
    fireEvent.keyDown(field(), { key: "Enter", shiftKey: true });
    expect(searchAction).not.toHaveBeenCalled();
  });

  it("disables the form and says the ball is thinking while it waits", async () => {
    // The action answers only when the test calls `answer`
    let answer: (result: SearchResult) => void = () => {};
    vi.mocked(searchAction).mockReturnValue(
      new Promise((resolve) => (answer = resolve)),
    );
    renderHome();
    type("hola");
    fireEvent.click(submitButton());

    expect(await screen.findByRole("status")).toHaveTextContent(
      "La bola está pensando…",
    );
    expect(field()).toBeDisabled();
    expect(submitButton()).toBeDisabled();

    // React 19 ties open async transitions together: one left waiting would hold up the next tests
    await act(async () => answer({ status: "invalid_input" }));
  });

  it("explains an invalid request next to the field", async () => {
    vi.mocked(searchAction).mockResolvedValue({ status: "invalid_input" });
    renderHome();
    type("hola");
    fireEvent.click(submitButton());

    await screen.findByText("Escribí un pedido de hasta 200 caracteres.");
    expect(field()).toHaveAccessibleDescription(
      expect.stringContaining("Escribí un pedido de hasta 200 caracteres."),
    );
  });
});

describe("SearchProvider", () => {
  it("goes back to the page under it when a pill is clicked", async () => {
    vi.mocked(searchAction).mockResolvedValue({
      status: "ok",
      shows: [
        {
          id: 1,
          name: "Dark",
          year: 2017,
          rating: 8.4,
          posterPath: null,
          overview: "",
        },
      ],
      filters: { include: ["mystery"], exclude: [], maxRuntime: null },
    });
    renderHome();
    type("misterio");
    fireEvent.click(submitButton());
    await screen.findByRole("heading", { level: 2, name: "1 Dark" });

    fireEvent.click(screen.getByRole("link", { name: "Misterio" }));

    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});

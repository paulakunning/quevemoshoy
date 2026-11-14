import { useTranslations } from "next-intl";
import type { HomeState } from "@/lib/home-state";
import { posterUrl } from "@/lib/tmdb/shows";
import { Ball } from "./ball";
import { Pills } from "./pills";
import { ResultsList } from "./results-list";

// The whole home page for one state: data comes in, interface comes out.
// It doesn't fetch anything, which is what makes it easy to test
export function HomeView({ state }: { state: HomeState }) {
  const t = useTranslations();
  const shows = state.kind === "results" ? state.shows : [];
  const top = shows[0];

  return (
    // globals.css reads data-home-state (header brand, size of the ball)
    <div data-home-state={state.kind}>
      <section className="pt-2 text-center">
        <Ball
          state={
            top ? "revealed" : state.kind === "loading" ? "loading" : "idle"
          }
          posterUrl={
            top?.posterPath ? posterUrl(top.posterPath, "w342") : undefined
          }
        />
        {state.kind !== "results" && <Intro />}
      </section>

      {/* Screen readers announce changes inside role="status" */}
      <p role="status" className="sr-only">
        {state.kind === "loading" && t("Home.loading")}
        {top && t("Home.ready", { count: shows.length, name: top.name })}
      </p>

      {state.kind === "results" && <ResultsList shows={shows} />}
      {state.kind === "loading" && <ResultsSkeleton />}
      {(state.kind === "empty" || state.kind === "error") && (
        <StateMessage
          title={t(`States.${state.kind}.title`)}
          text={t(`States.${state.kind}.text`)}
        />
      )}

      <Pills active={state.kind === "idle" ? undefined : state.genre} />
    </div>
  );
}

function Intro() {
  const t = useTranslations("Home");

  return (
    <div className="mt-6">
      <h1 className="font-display text-3xl leading-none sm:text-4xl font-extrabold tracking-tight">
        {t("title")}
      </h1>
      <p className="mx-auto mt-4 max-w-xs text-muted-foreground">
        {t("subtitle")}
      </p>
    </div>
  );
}

function StateMessage({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-primary/50 bg-card p-4">
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="mt-1 text-muted-foreground">{text}</p>
    </div>
  );
}

// Grey boxes shaped like the results, shown while they load
function ResultsSkeleton() {
  return (
    <div aria-hidden="true" className="mt-6 animate-pulse space-y-3">
      <div className="mx-auto h-7 w-2/3 rounded-full bg-surface-2" />
      <div className="mx-auto h-4 w-1/3 rounded-full bg-surface-2" />
      {[2, 3, 4, 5].map((rank) => (
        <div
          key={rank}
          className="flex gap-4 rounded-2xl border border-border bg-card p-3"
        >
          <div className="aspect-2/3 w-20 shrink-0 rounded-xl bg-surface-2" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-5 w-1/2 rounded-full bg-surface-2" />
            <div className="h-4 w-1/4 rounded-full bg-surface-2" />
            <div className="h-4 rounded-full bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

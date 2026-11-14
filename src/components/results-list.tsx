import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import type { ShowSummary } from "@/lib/tmdb/shows";
import { ShowCard, ShowMeta } from "./show-card";

// The first show goes big under the ball (its poster is inside it);
// the rest go in a numbered list that starts at 2
export function ResultsList({ shows }: { shows: ShowSummary[] }) {
  const t = useTranslations("Show");
  const [top, ...rest] = shows;
  if (!top) return null;

  return (
    <section className="mt-2">
      <div className="deal text-center">
        <h2 className="font-display text-2xl leading-tight font-extrabold">
          <span className="text-primary">1</span> {top.name}
        </h2>
        <p className="mt-1 flex justify-center gap-3 text-sm text-muted-foreground">
          <ShowMeta show={top} />
        </p>
        <p className="mx-auto mt-3 line-clamp-4 max-w-sm text-lg leading-snug text-muted-foreground">
          {top.overview || t("noOverview")}
        </p>
        <Link
          href={`/shows/${top.id}`}
          className="mt-4 inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-medium transition hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t("details")}
        </Link>
      </div>
      {rest.length > 0 && (
        <ol start={2} className="mt-6 space-y-3">
          {rest.map((show, index) => (
            <li
              key={show.id}
              className="deal"
              // The delay of each card's entrance grows with its position
              style={{ "--i": index + 1 } as CSSProperties}
            >
              <ShowCard show={show} rank={index + 2} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

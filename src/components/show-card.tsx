import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { posterUrl, type ShowSummary } from "@/lib/tmdb/shows";

// Year and rating; each one is left out when TMDB doesn't have it
export function ShowMeta({ show }: { show: ShowSummary }) {
  const t = useTranslations("Show");
  const format = useFormatter();

  return (
    <>
      {show.year !== null && <span>{show.year}</span>}
      {show.rating !== null && (
        <span>
          <span aria-hidden="true">★</span>{" "}
          <span className="sr-only">{t("ratingLabel")}</span>{" "}
          {format.number(show.rating, { maximumFractionDigits: 1 })}
        </span>
      )}
    </>
  );
}

export function ShowCard({ show, rank }: { show: ShowSummary; rank: number }) {
  const t = useTranslations("Show");

  return (
    <Link
      href={`/shows/${show.id}`}
      className="flex gap-4 rounded-2xl border border-border bg-card p-3 transition hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {show.posterPath ? (
        <Image
          src={posterUrl(show.posterPath, "w185")}
          alt=""
          width={80}
          height={120}
          className="aspect-2/3 w-20 shrink-0 self-start rounded-xl bg-surface-2 object-cover"
        />
      ) : (
        <div className="aspect-2/3 w-20 shrink-0 self-start rounded-xl bg-surface-2" />
      )}
      <div className="min-w-0">
        <p className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold text-primary">
            {rank}
          </span>
          <span className="font-display text-lg leading-tight font-bold">
            {show.name}
          </span>
        </p>
        <p className="mt-1 flex gap-3 text-sm text-muted-foreground">
          <ShowMeta show={show} />
        </p>
        <p className="mt-2 line-clamp-3 text-[15px] leading-snug text-muted-foreground">
          {show.overview || t("noOverview")}
        </p>
      </div>
    </Link>
  );
}

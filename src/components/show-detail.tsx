import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { posterUrl, type ShowDetail } from "@/lib/tmdb/shows";
import { ShowMeta } from "./show-card";

const linkClass =
  "inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-medium transition hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

// The page of one show: data comes in, interface comes out
export function ShowDetailView({ show }: { show: ShowDetail }) {
  const t = useTranslations("Show");

  return (
    <article className="pb-10 text-center">
      {show.posterPath ? (
        <Image
          src={posterUrl(show.posterPath, "w500")}
          alt=""
          width={500}
          height={750}
          preload
          className="mx-auto aspect-2/3 w-56 rounded-2xl bg-surface-2 object-cover"
        />
      ) : (
        <div className="mx-auto aspect-2/3 w-56 rounded-2xl bg-surface-2" />
      )}
      <h1 className="mt-6 font-display text-3xl leading-tight font-extrabold">
        {show.name}
      </h1>
      <p className="mt-2 flex justify-center gap-3 text-sm text-muted-foreground">
        <ShowMeta show={show} />
      </p>
      {show.genres.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {show.genres.map((genre) => (
            <li
              key={genre}
              className="rounded-full border border-border bg-card px-3 py-1 text-sm"
            >
              {genre}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-left text-lg leading-snug text-muted-foreground">
        {show.overview || t("noOverview")}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={linkClass}>
          {t("back")}
        </Link>
        {/* TMDB asks for a link back to them */}
        <a
          href={`https://www.themoviedb.org/tv/${show.id}`}
          className={linkClass}
        >
          {t("tmdbLink")}
        </a>
      </div>
    </article>
  );
}

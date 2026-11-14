import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GENRES, type GenreSlug } from "@/lib/tmdb/genres";

// Links, not buttons: each genre is a URL (?genre=mystery) that can be shared
export function Pills({ active }: { active?: GenreSlug }) {
  const t = useTranslations();

  return (
    <nav aria-labelledby="pills-title" className="mt-10">
      <p id="pills-title" className="font-display text-2xl font-extrabold">
        {t("Pills.title")}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {GENRES.map(({ slug }) => (
          <Link
            key={slug}
            href={{ pathname: "/", query: { genre: slug } }}
            aria-current={slug === active ? "page" : undefined}
            className="flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-medium transition hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
          >
            {t(`Genres.${slug}`)}
          </Link>
        ))}
      </div>
    </nav>
  );
}

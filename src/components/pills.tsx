import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PillSlug } from "@/lib/home-state";
import { GENRES } from "@/lib/tmdb/genres";
import { MOODS } from "@/lib/tmdb/moods";

// Links, not buttons: each pill is a URL (?genre=mystery, ?mood=binge) that can be shared
export function Pills({ active }: { active?: PillSlug }) {
  const t = useTranslations();

  return (
    <nav aria-labelledby="pills-title" className="mt-10">
      <p id="pills-title" className="font-display text-2xl font-extrabold">
        {t("Pills.title")}
      </p>
      <PillGroup id="pills-genres" label={t("Pills.genres")}>
        {GENRES.map(({ slug }) => (
          <Pill key={slug} query={{ genre: slug }} current={slug === active}>
            {t(`Genres.${slug}`)}
          </Pill>
        ))}
      </PillGroup>
      <PillGroup id="pills-moods" label={t("Pills.moods")}>
        {MOODS.map(({ slug }) => (
          <Pill key={slug} query={{ mood: slug }} current={slug === active}>
            {t(`Moods.${slug}`)}
          </Pill>
        ))}
      </PillGroup>
    </nav>
  );
}

function PillGroup({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div role="group" aria-labelledby={id}>
      <p id={id} className="mt-4 text-sm text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({
  query,
  current,
  children,
}: {
  query: Record<string, string>;
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={{ pathname: "/", query }}
      aria-current={current ? "page" : undefined}
      className="flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-medium transition hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
    >
      {children}
    </Link>
  );
}

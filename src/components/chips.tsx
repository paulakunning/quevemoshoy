import { useLocale, useTranslations } from "next-intl";
import type { Filters } from "@/lib/ai/schemas";

// What the AI understood, read-only: Misterio · Sin terror · Episodios de hasta 30 min
export function Chips({ filters }: { filters: Filters }) {
  const t = useTranslations();
  const locale = useLocale();
  const chips = [
    ...filters.include.map((slug) => t(`FilterGenres.${slug}`)),
    ...filters.exclude.map((slug) =>
      t("Chips.without", {
        genre: t(`FilterGenres.${slug}`).toLocaleLowerCase(locale),
      }),
    ),
    ...(filters.maxRuntime === null
      ? []
      : [t("Chips.maxRuntime", { minutes: filters.maxRuntime })]),
  ];
  if (chips.length === 0) return null;

  return (
    <section aria-labelledby="chips-title" className="deal mt-6 text-center">
      <p id="chips-title" className="text-sm text-muted-foreground">
        {t("Chips.title")}
      </p>
      <ul className="mt-2 flex flex-wrap justify-center gap-2">
        {chips.map((chip, index) => (
          <li
            key={index}
            className="rounded-full border border-primary/50 px-3 py-1 text-sm"
          >
            {chip}
          </li>
        ))}
      </ul>
    </section>
  );
}

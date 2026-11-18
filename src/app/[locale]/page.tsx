import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import { HomeView } from "@/components/home-view";
import { toHomeState, type PillSlug } from "@/lib/home-state";
import { discoverShows, type DiscoverQuery } from "@/lib/tmdb/client";
import { genreFromSlug } from "@/lib/tmdb/genres";
import { moodFromSlug } from "@/lib/tmdb/moods";

type Props = PageProps<"/[locale]">;

type Pill = { slug: PillSlug; query: DiscoverQuery; minSeasons?: number };

// The URL is the state: /es is the idle home, and /es?genre=mystery
// or /es?mood=binge show results
export default function Home({ searchParams }: Props) {
  return (
    // With Cache Components, reading the URL has to happen inside <Suspense>
    <Suspense fallback={<HomeView state={{ kind: "idle" }} />}>
      <HomeFromUrl searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeFromUrl({ searchParams }: Pick<Props, "searchParams">) {
  const pill = pillFromUrl(await searchParams);
  if (!pill) return <HomeView state={{ kind: "idle" }} />;

  return (
    // The key makes React start over when the pill changes,
    // so the loading state shows again instead of the old results
    <Suspense
      key={pill.slug}
      fallback={<HomeView state={{ kind: "loading", pill: pill.slug }} />}
    >
      <PillResults pill={pill} />
    </Suspense>
  );
}

// With both ?genre= and ?mood= in the URL, the genre wins
function pillFromUrl(
  params: Record<string, string | string[] | undefined>,
): Pill | undefined {
  const genre = genreFromSlug(params.genre);
  if (genre) {
    return { slug: genre.slug, query: { with_genres: `${genre.tmdbId}` } };
  }
  return moodFromSlug(params.mood);
}

async function PillResults({ pill }: { pill: Pill }) {
  const locale = await getLocale();
  const result = await discoverShows(pill.query, locale, pill.minSeasons);
  return <HomeView state={toHomeState(pill.slug, result)} />;
}

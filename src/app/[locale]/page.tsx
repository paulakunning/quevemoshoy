import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import { HomeView } from "@/components/home-view";
import { toHomeState } from "@/lib/home-state";
import { discoverShows } from "@/lib/tmdb/client";
import { genreFromSlug, type Genre } from "@/lib/tmdb/genres";

type Props = PageProps<"/[locale]">;

// The URL is the state: /es is the idle home and /es?genre=mystery shows results
export default function Home({ searchParams }: Props) {
  return (
    // With Cache Components, reading the URL has to happen inside <Suspense>
    <Suspense fallback={<HomeView state={{ kind: "idle" }} />}>
      <HomeFromUrl searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeFromUrl({ searchParams }: Pick<Props, "searchParams">) {
  const { genre: value } = await searchParams;
  const genre = genreFromSlug(value);
  if (!genre) return <HomeView state={{ kind: "idle" }} />;

  return (
    // The key makes React start over when the genre changes,
    // so the loading state shows again instead of the old results
    <Suspense
      key={genre.slug}
      fallback={<HomeView state={{ kind: "loading", genre: genre.slug }} />}
    >
      <GenreResults genre={genre} />
    </Suspense>
  );
}

async function GenreResults({ genre }: { genre: Genre }) {
  const locale = await getLocale();
  const result = await discoverShows(genre.tmdbId, locale);
  return <HomeView state={toHomeState(genre.slug, result)} />;
}

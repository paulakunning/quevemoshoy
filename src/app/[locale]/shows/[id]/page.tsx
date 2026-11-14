import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { StateMessage } from "@/components/home-view";
import { ShowDetailView } from "@/components/show-detail";
import { getShow } from "@/lib/tmdb/client";
import { parseShowId } from "@/lib/tmdb/shows";

export default async function ShowPage({
  params,
}: PageProps<"/[locale]/shows/[id]">) {
  const { id: raw } = await params;
  // Check the id before asking TMDB: no request goes out for /shows/abc
  const id = parseShowId(raw);
  if (id === undefined) notFound();

  const result = await getShow(id, await getLocale());
  if (result.status === "not_found") notFound();
  if (result.status === "error") {
    const t = await getTranslations("States.error");
    return <StateMessage title={t("title")} text={t("text")} />;
  }

  return <ShowDetailView show={result.show} />;
}

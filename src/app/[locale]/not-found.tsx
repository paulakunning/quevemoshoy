import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Shown when a page calls notFound(), like a show id that doesn't exist
export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="py-16 text-center">
      <h1 className="font-display text-2xl font-extrabold">
        {t("NotFound.title")}
      </h1>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-medium transition hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {t("Show.back")}
      </Link>
    </div>
  );
}

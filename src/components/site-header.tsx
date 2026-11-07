import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher, LocaleSwitcherFallback } from "./locale-switcher";

export function SiteHeader() {
  const t = useTranslations("Metadata");

  return (
    <header className="flex items-center justify-between gap-4 py-4">
      <Link
        href="/"
        className="brand rounded font-display text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {t("title")}
      </Link>
      {/* The switcher reads the URL, which Cache Components only allows inside Suspense */}
      <Suspense fallback={<LocaleSwitcherFallback />}>
        <LocaleSwitcher />
      </Suspense>
    </header>
  );
}

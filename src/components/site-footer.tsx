import { useTranslations } from "next-intl";
import Image from "next/image";

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="mt-14 border-t border-border py-6 text-xs text-muted-foreground">
      {/* TMDB's terms: their logo must be less prominent than the app's own branding */}
      <Image src="/tmdb-logo.svg" alt="TMDB" width={47} height={20} />
      <p className="mt-2">{t("attribution")}</p>
    </footer>
  );
}

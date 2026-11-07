"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Href = ComponentProps<typeof Link>["href"];

// Keeps the current page and query (?genre=…) when switching language
export function LocaleSwitcher() {
  const pathname = usePathname();
  const query = Object.fromEntries(useSearchParams());
  return <LocaleLinks href={{ pathname, query }} />;
}

// Rendered while the URL is not known yet (prerender); links to each home page
export function LocaleSwitcherFallback() {
  return <LocaleLinks href="/" />;
}

function LocaleLinks({ href }: { href: Href }) {
  const t = useTranslations("LocaleSwitcher");
  const current = useLocale();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="flex rounded-full border border-border p-1"
    >
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={href}
          locale={locale}
          lang={locale}
          aria-current={locale === current ? "true" : undefined}
          className="flex min-h-9 items-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=true]:bg-primary aria-[current=true]:text-primary-foreground"
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}

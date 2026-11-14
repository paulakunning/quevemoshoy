"use client"; // Error boundaries must be Client Components

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Shown when something unexpected throws while rendering a page
export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const t = useTranslations("Error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-16 text-center">
      <h1 className="font-display text-2xl font-extrabold">{t("title")}</h1>
      <Button className="mt-6" onClick={() => retry()}>
        {t("retry")}
      </Button>
    </div>
  );
}

"use server";

import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { searchByText, type SearchResult } from "@/lib/search";

// A Server Action is a public endpoint: both arguments can be anything.
// The locale comes as an argument because root params don't run in Server Actions
export async function searchAction(
  text: unknown,
  locale: unknown,
): Promise<SearchResult> {
  if (!hasLocale(routing.locales, locale)) return { status: "invalid_input" };
  return searchByText(text, locale);
}

"use client";

import { useTranslations } from "next-intl";
import { useSearch } from "./search-provider";

// searchByText checks the same limit on the server
const MAX_LENGTH = 200;

export function SearchForm() {
  const t = useTranslations("Search");
  const { text, setText, result, pending, submit, fieldRef } = useSearch();
  const invalid = result?.status === "invalid_input";
  const canSubmit = text.trim().length > 0 && !pending;

  return (
    <form
      className="mt-8 rounded-3xl border border-border bg-card p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) submit();
      }}
    >
      <label
        htmlFor="search-text"
        className="text-sm font-medium text-muted-foreground"
      >
        {t("label")}
      </label>
      <textarea
        ref={fieldRef}
        id="search-text"
        rows={3}
        maxLength={MAX_LENGTH}
        value={text}
        disabled={pending}
        placeholder={t("placeholder")}
        aria-invalid={invalid || undefined}
        aria-describedby={
          invalid ? "search-count search-invalid" : "search-count"
        }
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          // Enter sends, Shift+Enter makes a new line. While composing
          // (accents with some keyboards), Enter only confirms the letter
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        className="mt-2 w-full resize-none rounded-2xl border border-border bg-background p-3 text-base placeholder:text-muted-foreground/70 focus:outline-2 focus:outline-ring disabled:opacity-50"
      />
      <p className="mt-2 text-sm text-muted-foreground">
        <span id="search-count">
          {text.length}/{MAX_LENGTH}
        </span>
      </p>
      {invalid && (
        <p id="search-invalid" className="mt-2 text-sm text-destructive">
          {t("invalid")}
        </p>
      )}
      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[.97] disabled:opacity-40"
      >
        {t("submit")}
      </button>
    </form>
  );
}

// At the end of a text result: back to the form, with the focus in the field
export function AskAgainButton() {
  const t = useTranslations("Search");
  const { askAgain } = useSearch();

  return (
    <button
      type="button"
      onClick={askAgain}
      className="mt-6 flex h-12 w-full items-center justify-center rounded-full border border-border font-display font-bold transition hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {t("again")}
    </button>
  );
}

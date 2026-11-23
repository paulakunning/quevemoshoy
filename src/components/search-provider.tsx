"use client";

import { useLocale } from "next-intl";
import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
  type RefObject,
} from "react";
import { searchAction } from "@/app/[locale]/actions";
import { searchToHomeState } from "@/lib/home-state";
import type { SearchResult } from "@/lib/search";
import { HomeView } from "./home-view";

type Search = {
  text: string;
  setText: (value: string) => void;
  result: SearchResult | null;
  pending: boolean;
  submit: () => void;
  reset: () => void;
  askAgain: () => void;
  fieldRef: RefObject<HTMLTextAreaElement | null>;
};

const SearchContext = createContext<Search | null>(null);

export function useSearch(): Search {
  const search = use(SearchContext);
  if (!search) throw new Error("useSearch needs a <SearchProvider> above it");
  return search;
}

// The text search lives here, not in the URL: it costs an AI call, so a reload
// or a shared link must not repeat it. With a result on screen, it replaces
// the page under it (`children`, which the URL decides)
export function SearchProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [text, setText] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [pending, startTransition] = useTransition();
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const focusField = useRef(false);

  // After "Ask something else" the field is back on screen: move the focus to it
  useEffect(() => {
    if (result === null && focusField.current) {
      focusField.current = false;
      fieldRef.current?.focus();
    }
  }, [result]);

  function submit() {
    startTransition(async () => {
      const next = await searchAction(text, locale);
      // A state update after an await needs its own transition (React 19)
      startTransition(() => setResult(next));
    });
  }

  function reset() {
    setResult(null);
  }

  function askAgain() {
    focusField.current = true;
    reset();
  }

  const view = pending ? (
    <HomeView state={{ kind: "thinking" }} />
  ) : result ? (
    <HomeView state={searchToHomeState(result)} />
  ) : (
    children
  );

  return (
    <SearchContext
      value={{
        text,
        setText,
        result,
        pending,
        submit,
        reset,
        askAgain,
        fieldRef,
      }}
    >
      {/* A click on any link (a pill, a show) leaves the text result behind */}
      <div
        className="contents"
        onClickCapture={(event) => {
          if (event.target instanceof Element && event.target.closest("a")) {
            reset();
          }
        }}
      >
        {view}
      </div>
    </SearchContext>
  );
}

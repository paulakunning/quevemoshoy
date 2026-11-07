import { describe, expect, it } from "vitest";
import en from "./en.json";
import es from "./es.json";

type Messages = { [key: string]: string | Messages };

// "Home": { "title": "..." } → "Home.title"
function flatKeys(messages: Messages, prefix = ""): string[] {
  return Object.entries(messages)
    .flatMap(([key, value]) =>
      typeof value === "string"
        ? [prefix + key]
        : flatKeys(value, `${prefix}${key}.`),
    )
    .sort();
}

describe("messages", () => {
  it("has the same keys in en and es", () => {
    expect(flatKeys(en)).toEqual(flatKeys(es));
  });
});

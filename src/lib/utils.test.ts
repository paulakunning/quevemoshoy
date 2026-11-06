import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps the last of two conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    const selected = false as boolean;
    expect(cn("a", selected && "b", undefined)).toBe("a");
  });
});

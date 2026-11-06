import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("is disabled when the disabled prop is set", () => {
    render(<Button disabled>Buscar</Button>);
    expect(screen.getByRole("button", { name: "Buscar" })).toBeDisabled();
  });
});

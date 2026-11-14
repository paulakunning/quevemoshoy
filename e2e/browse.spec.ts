import { expect, test } from "@playwright/test";

// The shows come from TMDB and change over time,
// so these tests check the shape of the page and never a specific title

test("pill → results → detail", async ({ page }) => {
  await page.goto("/es");
  await page.getByRole("link", { name: "Misterio" }).click();

  await expect(page).toHaveURL(/\/es\?genre=mystery$/);
  await expect(page.getByRole("link", { name: "Misterio" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(/1\s*\S/);
  await expect(page.getByRole("listitem")).toHaveCount(4);

  await page.getByRole("link", { name: "Ver detalle" }).click();

  await expect(page).toHaveURL(/\/es\/shows\/\d+$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("language switch keeps the genre", async ({ page }) => {
  await page.goto("/es?genre=comedy");
  await page.getByRole("link", { name: "EN", exact: true }).click();

  await expect(page).toHaveURL(/\/en\?genre=comedy$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("link", { name: "Comedy" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("unknown genre shows the start", async ({ page }) => {
  await page.goto("/es?genre=nope");

  await expect(
    page.getByRole("heading", { level: 1, name: "¿Qué vemos hoy?" }),
  ).toBeVisible();
  await expect(page.locator('a[aria-current="page"]')).toHaveCount(0);
});

test("unknown show is not found", async ({ page }) => {
  await page.goto("/es/shows/abc");

  await expect(
    page.getByRole("heading", { name: "No encontramos esta página" }),
  ).toBeVisible();
});

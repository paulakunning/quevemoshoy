import { expect, test } from "@playwright/test";

// The shows come from TMDB and change over time,
// so these tests check the shape of the page and never a specific title

test("pill → results → detail", async ({ page }) => {
  await page.goto("/es");
  await page.getByRole("link", { name: "Misterio", exact: true }).click();

  await expect(page).toHaveURL(/\/es\?genre=mystery$/);
  await expect(
    page.getByRole("link", { name: "Misterio", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(/1\s*\S/);
  await expect(page.getByRole("listitem")).toHaveCount(4);

  await page.getByRole("link", { name: "Ver detalle" }).click();

  await expect(page).toHaveURL(/\/es\/shows\/\d+$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("mood pill → results", async ({ page }) => {
  await page.goto("/es");
  await page
    .getByRole("link", { name: "Para engancharme", exact: true })
    .click();

  await expect(page).toHaveURL(/\/es\?mood=binge$/);
  await expect(
    page.getByRole("link", { name: "Para engancharme", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(/1\s*\S/);
  await expect(page.getByRole("listitem")).toHaveCount(4);
});

test("language switch keeps the genre", async ({ page }) => {
  await page.goto("/es?genre=comedy");
  const en = page.getByRole("link", { name: "EN", exact: true });
  // The prerendered link goes to /en; wait for the one that keeps the query
  await expect(en).toHaveAttribute("href", "/en?genre=comedy");
  await en.click();

  await expect(page).toHaveURL(/\/en\?genre=comedy$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("link", { name: "Comedy", exact: true }),
  ).toHaveAttribute("aria-current", "page");
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

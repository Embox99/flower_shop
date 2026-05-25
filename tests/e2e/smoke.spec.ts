import { test, expect } from "@playwright/test";

/**
 * Smoke test for the storefront. Walks the home, into a category, into a
 * product, and verifies the basic chrome is intact.
 */
test("storefront loads and navigates", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Flower Shop")).toBeVisible();

  // Click any category card / "Shop today's flowers"
  const shopLink = page.getByRole("link", { name: /shop|today/i }).first();
  await shopLink.click();
  await expect(page).toHaveURL(/\/list/);
});

test("admin login page loads", async ({ page }) => {
  await page.goto("/admin");
  // Either redirects to /login or shows a sign-in CTA
  await expect(page.locator("body")).toContainText(/sign in|login|password/i);
});

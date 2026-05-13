import { test, expect } from "@playwright/test";

test("example.com shows the main heading", async ({ page }) => {
  await page.goto("https://example.com/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Example Domain");
});

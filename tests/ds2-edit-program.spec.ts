import { test, expect, type Page } from "@playwright/test";

const PROGRAM_NAME_SEED = "Web Development 2026";
const PROGRAM_DESC_SEED =
  "Full-stack web development track for 2026 cohort";

async function loginAsAdmin(page: Page) {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set (for example via .env and dotenv in playwright.config).",
    );
  }
  if (!process.env.DIDAXIS_URL) {
    throw new Error(
      "DIDAXIS_URL must be set so Playwright baseURL resolves (for example via .env).",
    );
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("button", { name: "Sign In" })).toBeHidden({
    timeout: 20_000,
  });
}

async function ensureSeedProgramExists(page: Page) {
  const rows = page
    .getByRole("row")
    .filter({ hasText: PROGRAM_NAME_SEED });
  if ((await rows.count()) > 0) {
    return;
  }

  await page.getByRole("button", { name: "New Program" }).click();
  await page.getByLabel("Program Name").fill(PROGRAM_NAME_SEED);
  await page.getByLabel("Description").fill(PROGRAM_DESC_SEED);
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 20_000 });
  await expect(
    page.getByRole("row").filter({ hasText: PROGRAM_NAME_SEED }).first(),
  ).toBeVisible();
}

test.describe("Didaxis Studio — programs", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/programs");
    await expect(page).toHaveURL(/\/programs/);
  });

  test("creates a new program with a unique name and description", async ({
    page,
  }) => {
    const suffix = Date.now();
    const name = `E2E Program ${suffix}`;
    const description = `E2E cohort track ${suffix}`;

    await page.getByRole("button", { name: "New Program" }).click();
    await page.getByLabel("Program Name").fill(name);
    await page.getByLabel("Description").fill(description);
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByRole("dialog")).toBeHidden({ timeout: 20_000 });

    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();
  });

  test("TC-001: edit form opens with existing program data pre-populated", async ({
    page,
  }) => {
    await ensureSeedProgramExists(page);

    const row = page
      .getByRole("row")
      .filter({ hasText: PROGRAM_NAME_SEED })
      .first();
    await expect(row).toBeVisible();

    const editControl = row
      .getByRole("button", { name: /edit/i })
      .or(row.getByLabel(/edit/i))
      .or(row.locator('[aria-label="Edit"]'))
      .first();
    await editControl.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const nameField = dialog
      .getByLabel("Program Name")
      .or(dialog.getByLabel(/^name$/i));
    await expect(nameField).toBeVisible();
    await expect(nameField).toHaveValue(PROGRAM_NAME_SEED);

    const descField = dialog.getByLabel("Description");
    await expect(descField).toHaveValue(PROGRAM_DESC_SEED);
  });
});

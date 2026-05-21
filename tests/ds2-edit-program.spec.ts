import { test, expect, type Locator, type Page } from "@playwright/test";

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

async function createProgram(page: Page, name: string, description: string) {
  await page.getByRole("button", { name: /New Program/i }).click();
  await page.getByLabel("Program Name").fill(name);
  await page.getByLabel("Description").fill(description);
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 20_000 });
  await expect(programRow(page, name)).toBeVisible();
}

function programRow(page: Page, programName: string) {
  return page
    .getByRole("row")
    .filter({ has: page.getByText(programName, { exact: true }) })
    .first();
}

async function ensureSeedProgramExists(page: Page) {
  if ((await programRow(page, PROGRAM_NAME_SEED).count()) > 0) {
    return;
  }
  await createProgram(page, PROGRAM_NAME_SEED, PROGRAM_DESC_SEED);
}

async function openEditModal(page: Page, programName: string) {
  const row = programRow(page, programName);
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "✏️" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

function nameFieldInDialog(dialog: Locator) {
  return dialog
    .getByLabel("Program Name")
    .or(dialog.getByLabel(/^name$/i));
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

    await createProgram(page, name, description);

    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();
  });

  test("TC-001: edit form opens with existing program data pre-populated", async ({
    page,
  }) => {
    await ensureSeedProgramExists(page);

    const dialog = await openEditModal(page, PROGRAM_NAME_SEED);

    const nameField = nameFieldInDialog(dialog);
    await expect(nameField).toBeVisible();
    await expect(nameField).toHaveValue(PROGRAM_NAME_SEED);

    const descField = dialog.getByLabel("Description");
    await expect(descField).toHaveValue(PROGRAM_DESC_SEED);
  });

  test("TC-002: program name update is saved and shown immediately in list", async ({
    page,
  }) => {
    const suffix = Date.now();
    const programName = `Web Development 2026 ${suffix}`;
    const updatedName = `Web Development 2026 - Updated ${suffix}`;
    const description = `Full-stack web development track for 2026 cohort ${suffix}`;

    await createProgram(page, programName, description);

    const dialog = await openEditModal(page, programName);
    const nameField = nameFieldInDialog(dialog);
    await nameField.fill(updatedName);
    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(dialog).toBeHidden({ timeout: 20_000 });
    await expect(page.getByText(updatedName)).toBeVisible();
    await expect(
      page.getByText(programName, { exact: true }),
    ).toHaveCount(0);
  });
});

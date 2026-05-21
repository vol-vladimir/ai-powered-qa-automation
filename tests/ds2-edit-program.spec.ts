import { test, expect, type Locator, type Page } from "@playwright/test";

const PROGRAM_NAME_SEED = "Web Development 2026";
const PROGRAM_DESC_SEED =
  "Full-stack web development track for 2026 cohort";

function programsTable(page: Page) {
  return page.getByRole("table");
}

function programRow(page: Page, programName: string) {
  return programsTable(page)
    .getByRole("row")
    .filter({
      has: page.getByText(programName, { exact: true }),
    })
    .first();
}

function editButtonInRow(row: Locator) {
  return row
    .getByRole("button", { name: "✏️" })
    .or(row.getByRole("button", { name: "Edit" }));
}

function nameFieldInDialog(dialog: Locator) {
  return dialog.getByRole("textbox", { name: "Program Name" });
}

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
  await expect(page.getByRole("button", { name: /Programs/i })).toBeVisible({
    timeout: 20_000,
  });
}

async function createProgram(page: Page, name: string, description: string) {
  await page.getByRole("button", { name: "+ New Program" }).click();
  const dialog = page.getByRole("dialog", { name: "New Program" });
  await expect(dialog).toBeVisible();
  await nameFieldInDialog(dialog).fill(name);
  await dialog.getByRole("textbox", { name: "Description" }).fill(description);
  await dialog.getByRole("button", { name: "Create" }).click();
  await expect(dialog).toBeHidden({ timeout: 20_000 });
  await expect(programRow(page, name)).toBeVisible();
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
  await editButtonInRow(row).click();
  const dialog = page.getByRole("dialog", { name: "Edit Program" });
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe("Didaxis Studio — programs", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/programs");
    await expect(page).toHaveURL(/\/programs/);
    await expect(page.getByRole("heading", { name: "Programs" })).toBeVisible();
  });

  test("creates a new program with a unique name and description", async ({
    page,
  }) => {
    const suffix = Date.now();
    const name = `E2E Program ${suffix}`;
    const description = `E2E cohort track ${suffix}`;

    await createProgram(page, name, description);

    const row = programRow(page, name);
    await expect(row.getByRole("paragraph").nth(0)).toHaveText(name);
    await expect(row.getByRole("paragraph").nth(1)).toHaveText(description);
  });

  test("TC-001: edit form opens with existing program data pre-populated", async ({
    page,
  }) => {
    await ensureSeedProgramExists(page);

    const dialog = await openEditModal(page, PROGRAM_NAME_SEED);

    const nameField = nameFieldInDialog(dialog);
    await expect(nameField).toBeVisible();
    await expect(nameField).toHaveValue(PROGRAM_NAME_SEED);

    const descField = dialog.getByRole("textbox", { name: "Description" });
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
    await expect(programRow(page, updatedName)).toBeVisible();
    await expect(programRow(page, programName)).toHaveCount(0);
  });
});

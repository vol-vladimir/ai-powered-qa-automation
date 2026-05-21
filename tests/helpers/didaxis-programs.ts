import { expect, type Locator, type Page } from "@playwright/test";

export const PROGRAM_NAME_SEED = "Web Development 2026";
export const PROGRAM_DESC_SEED =
  "Full-stack web development track for 2026 cohort";

export function programsTable(page: Page) {
  return page.getByRole("table");
}

export function programRow(page: Page, programName: string) {
  return programsTable(page)
    .getByRole("row")
    .filter({
      has: page.getByText(programName, { exact: true }),
    })
    .first();
}

export function editButtonInRow(row: Locator) {
  return row
    .getByRole("button", { name: "✏️" })
    .or(row.getByRole("button", { name: "Edit" }));
}

export function nameFieldInDialog(dialog: Locator) {
  return dialog.getByRole("textbox", { name: "Program Name" });
}

export function descriptionFieldInDialog(dialog: Locator) {
  return dialog.getByRole("textbox", { name: "Description" });
}

export function sessionHoursFieldInDialog(dialog: Locator) {
  return dialog.locator('input[type="text"]').nth(1);
}

export function examHoursFieldInDialog(dialog: Locator) {
  return dialog.locator('input[type="text"]').nth(2);
}

export function saveButtonInDialog(dialog: Locator) {
  return dialog.getByRole("button", { name: "Save" });
}

export async function loginAsAdmin(page: Page) {
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

export async function gotoProgramsPage(page: Page) {
  await page.goto("/programs");
  await expect(page).toHaveURL(/\/programs/);
  await expect(page.getByRole("heading", { name: "Programs" })).toBeVisible();
}

export async function createProgram(
  page: Page,
  name: string,
  description: string,
) {
  await page.getByRole("button", { name: "+ New Program" }).click();
  const dialog = page.getByRole("dialog", { name: "New Program" });
  await expect(dialog).toBeVisible();
  await nameFieldInDialog(dialog).fill(name);
  await descriptionFieldInDialog(dialog).fill(description);
  await dialog.getByRole("button", { name: "Create" }).click();
  await expect(dialog).toBeHidden({ timeout: 20_000 });
  await expect(programRow(page, name)).toBeVisible();
}

export async function ensureSeedProgramExists(page: Page) {
  if ((await programRow(page, PROGRAM_NAME_SEED).count()) > 0) {
    return;
  }
  await createProgram(page, PROGRAM_NAME_SEED, PROGRAM_DESC_SEED);
}

export async function openEditModal(page: Page, programName: string) {
  const row = programRow(page, programName);
  await expect(row).toBeVisible();
  await editButtonInRow(row).click();
  const dialog = page.getByRole("dialog", { name: "Edit Program" });
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function saveEditDialog(dialog: Locator) {
  await saveButtonInDialog(dialog).click();
  await expect(dialog).toBeHidden({ timeout: 20_000 });
}

export function uniqueSuffix() {
  return Date.now().toString();
}

import { expect, type Locator, type Page } from "@playwright/test";
import {
  createProgramViaApi,
  loginViaApiPage,
} from "../../support/didaxis-api";
import { trackProgram } from "../../support/program-tracker";

export const PROGRAM_NAME_SEED = "Web Development 2026";
export const PROGRAM_DESC_SEED =
  "Full-stack web development track for 2026 cohort";
export const PROGRAM_NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;
export const DEFAULT_SESSION_HOURS = "4";
export const DEFAULT_EXAM_HOURS = "3";

export type EditFormSnapshot = {
  name: string;
  description: string;
  totalHours: string;
  sessionHours: string;
  examHours: string;
  targetAudience: string;
  focusAreas: string;
};

export function programsTable(page: Page) {
  return page.getByRole("table");
}

export function programNameParagraph(page: Page, programName: string) {
  return page
    .getByRole("paragraph")
    .filter({ hasText: new RegExp(`^${escapeRegExp(programName)}$`) });
}

export function programRow(page: Page, programName: string) {
  return programsTable(page)
    .getByRole("row")
    .filter({ has: programNameParagraph(page, programName) })
    .first();
}

export async function countProgramRows(page: Page, programName: string) {
  return programsTable(page)
    .getByRole("row")
    .filter({ has: programNameParagraph(page, programName) })
    .count();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function editButtonInRow(row: Locator) {
  return row
    .getByRole("button", { name: "✏️" })
    .or(row.getByRole("button", { name: "Edit" }));
}

export function deleteButtonInRow(row: Locator, programName: string) {
  return row.getByRole("button", { name: `Delete ${programName}` });
}

/** Confluence delete confirmation (native browser confirm). */
export function expectedDeleteConfirmMessage(programName: string) {
  return `Delete program "${programName}"? All its semesters and courses will be removed. This cannot be undone.`;
}

export type DeleteConfirmCapture = {
  type: string;
  message: string;
  accepted: boolean;
};

/**
 * Native `window.confirm` blocks the delete click until the dialog is handled.
 * Register `page.once('dialog')` before click, capture the message, then accept/dismiss.
 */
export async function triggerDeleteConfirm(
  page: Page,
  programName: string,
  options?: { accept?: boolean },
): Promise<DeleteConfirmCapture> {
  const row = programRow(page, programName);
  await expect(row).toBeVisible();
  const accept = options?.accept ?? true;

  let captured: DeleteConfirmCapture | null = null;
  page.once("dialog", async (dialog) => {
    captured = {
      type: dialog.type(),
      message: dialog.message(),
      accepted: accept,
    };
    if (accept) {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  });

  await deleteButtonInRow(row, programName).click();
  await expect
    .poll(() => captured, { timeout: 10_000 })
    .not.toBeNull();
  return captured!;
}

export async function openDeleteConfirmDialog(
  page: Page,
  programName: string,
) {
  return triggerDeleteConfirm(page, programName, { accept: false });
}

export async function deleteProgramWithConfirm(
  page: Page,
  programName: string,
  options?: { accept?: boolean },
) {
  const result = await triggerDeleteConfirm(page, programName, options);
  expect(result.type).toBe("confirm");
  return result;
}

export async function expectProgramAbsent(page: Page, programName: string) {
  await expect(programRow(page, programName)).toHaveCount(0, {
    timeout: 20_000,
  });
}

export async function expectProgramPresent(page: Page, programName: string) {
  await expect(programRow(page, programName)).toBeVisible();
}

export const EMPTY_PROGRAMS_MESSAGE =
  "No programs yet. Create your first program to get started.";

export function programDescriptionParagraph(page: Page, programName: string) {
  return programRow(page, programName).getByRole("paragraph").nth(1);
}

export function emptyProgramsMessage(page: Page) {
  return page.getByText(EMPTY_PROGRAMS_MESSAGE);
}

export function createProgramFromEmptyState(page: Page) {
  return page
    .getByRole("button", { name: "Create Program" })
    .or(page.getByRole("button", { name: "+ New Program" }));
}

export async function expectProgramListDetails(
  page: Page,
  programName: string,
  description: string,
) {
  const row = programRow(page, programName);
  await expect(row).toBeVisible();
  await expect(row.getByRole("paragraph").first()).toHaveText(programName);
  await expect(programDescriptionParagraph(page, programName)).toHaveText(
    description,
  );
}

export const MAX_NAME_100 =
  "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM";

export function nameFieldInDialog(dialog: Locator) {
  return dialog.getByRole("textbox", { name: "Program Name" });
}

export function descriptionFieldInDialog(dialog: Locator) {
  return dialog.getByRole("textbox", { name: "Description" });
}

export function totalHoursFieldInDialog(dialog: Locator) {
  return dialog.getByPlaceholder("e.g. 900");
}

export function sessionHoursFieldInDialog(dialog: Locator) {
  return dialog
    .locator("div")
    .filter({ hasText: /^Default Session Hours$/ })
    .locator('input[type="text"]');
}

export function examHoursFieldInDialog(dialog: Locator) {
  return dialog
    .locator("div")
    .filter({ hasText: /^Default Exam Hours$/ })
    .locator('input[type="text"]');
}

export function targetAudienceFieldInDialog(dialog: Locator) {
  return dialog.getByPlaceholder("e.g. Career changers, no CS background");
}

export function focusAreasFieldInDialog(dialog: Locator) {
  return dialog.getByPlaceholder(
    "e.g. Python, SQL, Machine Learning, Data Visualization",
  );
}

export function saveButtonInDialog(dialog: Locator) {
  return dialog.getByRole("button", { name: "Save" });
}

export function newProgramDialog(page: Page) {
  return page.getByRole("dialog", { name: "New Program" });
}

export function createButtonInDialog(dialog: Locator) {
  return dialog.getByRole("button", { name: "Create" });
}

export async function openNewProgramModal(page: Page) {
  await page.getByRole("button", { name: "+ New Program" }).click();
  const dialog = newProgramDialog(page);
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function fillNewProgramForm(
  dialog: Locator,
  name: string,
  description: string,
) {
  await nameFieldInDialog(dialog).fill(name);
  await descriptionFieldInDialog(dialog).fill(description);
}

export async function submitNewProgram(dialog: Locator, page: Page) {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes("/api/programs"),
  );
  await createButtonInDialog(dialog).click();
  const response = await responsePromise.catch(() => null);
  if (response?.status() === 201) {
    const body = (await response.json()) as { data?: { id?: string } };
    if (body.data?.id) {
      trackProgram(body.data.id);
    }
  }
}

export async function expectCreateModalClosed(dialog: Locator) {
  await expect(dialog).toBeHidden({ timeout: 20_000 });
}

export async function expectCreateBlocked(dialog: Locator, page: Page) {
  const create = createButtonInDialog(dialog);
  if (await create.isDisabled()) {
    await expect(dialog).toBeVisible();
    return;
  }
  await create.click();
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  await expect(newProgramDialog(page)).toBeVisible();
}

export async function expectDuplicateCreateRejected(
  page: Page,
  dialog: Locator,
  existingProgramName: string,
  attemptedName: string,
) {
  await fillNewProgramForm(
    dialog,
    attemptedName,
    "Duplicate name attempt — should be rejected",
  );
  await submitNewProgram(dialog, page);
  await page.waitForTimeout(1500);

  const dialogStillOpen = await dialog.isVisible().catch(() => false);
  expect(
    dialogStillOpen,
    "DS-3 AC: New Program modal must stay open when duplicate Program Name is submitted",
  ).toBe(true);

  const trimmedAttempt = attemptedName.trim();
  const existingCount = await countProgramRows(page, existingProgramName);
  expect(
    existingCount,
    `Only one program row should exist for "${existingProgramName}"`,
  ).toBe(1);

  if (trimmedAttempt !== existingProgramName) {
    expect(await countProgramRows(page, trimmedAttempt)).toBe(0);
  }

  const hasError = await page
    .getByText(/duplicate|already exists|unique/i)
    .or(dialog.getByText(/duplicate|already exists|unique/i))
    .isVisible()
    .catch(() => false);
  expect(hasError).toBeTruthy();
}

export async function expandAiConfigIfCollapsed(dialog: Locator) {
  const toggle = dialog.getByRole("button", {
    name: /AI Generation Config/i,
  });
  if (!(await toggle.isVisible().catch(() => false))) {
    return;
  }
  const label = (await toggle.textContent()) ?? "";
  if (/Show/i.test(label)) {
    await toggle.click();
  }
}

export async function captureEditFormSnapshot(
  dialog: Locator,
): Promise<EditFormSnapshot> {
  await expandAiConfigIfCollapsed(dialog);
  return {
    name: await nameFieldInDialog(dialog).inputValue(),
    description: await descriptionFieldInDialog(dialog).inputValue(),
    totalHours: await totalHoursFieldInDialog(dialog).inputValue(),
    sessionHours: await sessionHoursFieldInDialog(dialog).inputValue(),
    examHours: await examHoursFieldInDialog(dialog).inputValue(),
    targetAudience: await targetAudienceFieldInDialog(dialog).inputValue(),
    focusAreas: await focusAreasFieldInDialog(dialog).inputValue(),
  };
}

export async function expectEditFormSnapshot(
  dialog: Locator,
  expected: EditFormSnapshot,
) {
  await expect
    .poll(async () => captureEditFormSnapshot(dialog))
    .toEqual(expected);
}

export async function expectModalClosed(dialog: Locator) {
  await expect(dialog).toBeHidden({ timeout: 20_000 });
}

export async function expectSaveBlocked(
  dialog: Locator,
  page: Page,
  originalProgramName: string,
) {
  const save = saveButtonInDialog(dialog);
  await expect(save).toBeDisabled();
  await expect(dialog).toBeVisible();
  await expect(programRow(page, originalProgramName)).toBeVisible();
}

export async function attemptSaveWhenEnabled(dialog: Locator) {
  const save = saveButtonInDialog(dialog);
  if (await save.isEnabled()) {
    await save.click();
  }
}

export async function expectSaveRejected(
  dialog: Locator,
  page: Page,
  originalProgramName: string,
  options?: { validationPattern?: RegExp },
) {
  const save = saveButtonInDialog(dialog);
  if (await save.isDisabled()) {
    await expect(dialog).toBeVisible();
  } else {
    await save.click();
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    if (options?.validationPattern) {
      const hasMessage = await dialog
        .getByText(options.validationPattern)
        .isVisible()
        .catch(() => false);
      if (!hasMessage) {
        await expect(programRow(page, originalProgramName)).toBeVisible();
        return;
      }
      await expect(dialog.getByText(options.validationPattern)).toBeVisible();
    }
  }
  await expect(programRow(page, originalProgramName)).toBeVisible();
}

const DUPLICATE_NAME_PATTERN = /duplicate|already exists|unique/i;

export async function expectDuplicateNameRejected(
  page: Page,
  dialog: Locator,
  originalProgramName: string,
  duplicateProgramName: string,
) {
  await nameFieldInDialog(dialog).fill(duplicateProgramName);
  await attemptSaveWhenEnabled(dialog);

  await expect(dialog).toBeVisible({ timeout: 10_000 });
  await expect(programRow(page, originalProgramName)).toBeVisible();
  await expect(programRow(page, duplicateProgramName)).toBeVisible();
  await expect(nameFieldInDialog(dialog)).toHaveValue(duplicateProgramName);

  const hasError = await page
    .getByText(DUPLICATE_NAME_PATTERN)
    .or(dialog.getByText(DUPLICATE_NAME_PATTERN))
    .isVisible()
    .catch(() => false);
  expect(
    hasError,
    "DS-2: duplicate Program Name on edit must show duplicate/already exists/unique feedback",
  ).toBeTruthy();
}

export async function expectMaxLengthNameRejected(
  page: Page,
  dialog: Locator,
  originalProgramName: string,
  tooLongName: string,
) {
  await nameFieldInDialog(dialog).fill(tooLongName);
  await attemptSaveWhenEnabled(dialog);

  await expect
    .poll(
      async () => (await programRow(page, tooLongName).count()) === 0,
      { timeout: 10_000 },
    )
    .toBe(true);

  await expect(dialog).toBeVisible();
  await expect(programRow(page, originalProgramName)).toBeVisible();
}

export async function expectUnsafeNameRejected(
  page: Page,
  dialog: Locator,
  originalProgramName: string,
  unsafeName: string,
) {
  await nameFieldInDialog(dialog).fill(unsafeName);
  await attemptSaveWhenEnabled(dialog);

  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect
    .poll(
      async () => (await programRow(page, unsafeName).count()) === 0,
      { timeout: 10_000 },
    )
    .toBe(true);
  await expect(programRow(page, originalProgramName)).toBeVisible();

  const dialogOpen = await dialog.isVisible().catch(() => false);
  if (dialogOpen) {
    await expect(dialog).toBeVisible();
    return;
  }

  await expectModalClosed(dialog);
  await expect(programRow(page, originalProgramName)).toBeVisible();
}

export async function loginAsAdmin(page: Page) {
  if (!process.env.DIDAXIS_URL) {
    throw new Error(
      "DIDAXIS_URL must be set so Playwright baseURL resolves (for example via .env).",
    );
  }
  if (!process.env.DIDAXIS_API_TOKEN) {
    throw new Error(
      "DIDAXIS_API_TOKEN must be set for API authentication (for example via .env).",
    );
  }

  await loginViaApiPage(page);
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
  const program = await createProgramViaApi(name, description);
  trackProgram(program.id);

  if (page.url().includes("/programs")) {
    await page.reload();
    await expect(page.getByRole("heading", { name: "Programs" })).toBeVisible();
  } else {
    await gotoProgramsPage(page);
  }

  await expect(programRow(page, name)).toBeVisible();
  return program;
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
  await expandAiConfigIfCollapsed(dialog);
  return dialog;
}

export async function saveEditDialog(dialog: Locator) {
  await saveButtonInDialog(dialog).click();
  await expectModalClosed(dialog);
}

export function uniqueSuffix() {
  return Date.now().toString();
}

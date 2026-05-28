import { test, expect } from "../fixtures/cleanup.fixture";
import {
  PROGRAM_NAME_MAX_LENGTH,
  PROGRAM_NAME_SEED,
  PROGRAM_DESC_SEED,
  countProgramRows,
  createButtonInDialog,
  createProgram,
  descriptionFieldInDialog,
  expectCreateBlocked,
  expectCreateModalClosed,
  expectDuplicateCreateRejected,
  fillNewProgramForm,
  gotoProgramsPage,
  loginAsAdmin,
  nameFieldInDialog,
  newProgramDialog,
  openNewProgramModal,
  programNameParagraph,
  programRow,
  submitNewProgram,
  uniqueSuffix,
} from "./helpers/didaxis-programs";

const MAX_NAME_100 = "M".repeat(PROGRAM_NAME_MAX_LENGTH);

test.describe("Didaxis Studio — create program name validation (DS-3)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await gotoProgramsPage(page);
  });

  test("TC-001: program is created when Program Name is Informatique & IA - Niveau 2", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Informatique & IA - Niveau 2 ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(
      dialog,
      name,
      `Programme bilingue — parcours Informatique et IA ${suffix}`,
    );
    await submitNewProgram(dialog, page);
    await expectCreateModalClosed(dialog);
    await expect(programRow(page, name)).toBeVisible();
  });

  test("TC-002: program is created when leading/trailing spaces are trimmed", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const displayName = `Data Science 2026 ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(
      dialog,
      `   ${displayName}   `,
      `Applied statistics and machine learning cohort ${suffix}`,
    );
    await submitNewProgram(dialog, page);
    await expectCreateModalClosed(dialog);
    await expect(programRow(page, displayName)).toBeVisible();
  });

  test("TC-003: program is created when Program Name contains accented Latin characters", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Économie Internationale 2026 ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(
      dialog,
      name,
      `Programme francophone — relations économiques ${suffix}`,
    );
    await submitNewProgram(dialog, page);
    await expectCreateModalClosed(dialog);
    await expect(programRow(page, name)).toBeVisible();
  });

  test("TC-004: program is created when Program Name uses punctuation and symbols", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `QA/Test_Automation (Level-2) + API ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(
      dialog,
      name,
      `Automation fundamentals with API testing module ${suffix}`,
    );
    await submitNewProgram(dialog, page);
    await expectCreateModalClosed(dialog);
    await expect(programRow(page, name)).toBeVisible();
  });

  test("TC-005: form is not submitted when Program Name is only whitespace", async ({
    page,
  }) => {
    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, "   ", "Whitespace-only name validation test");
    await expectCreateBlocked(dialog, page);
    await expect(programRow(page, "   ")).toHaveCount(0);
  });

  test("TC-006: form is not submitted when Program Name is empty", async ({
    page,
  }) => {
    const dialog = await openNewProgramModal(page);
    await descriptionFieldInDialog(dialog).fill("Empty name validation test");
    await expect(createButtonInDialog(dialog)).toBeDisabled();
    await expect(dialog).toBeVisible();
  });

  test("TC-007: duplicate program creation is rejected for exact name Web Development 2026", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const seedName = `${PROGRAM_NAME_SEED} ${suffix}`;

    await createProgram(page, seedName, PROGRAM_DESC_SEED);

    const dialog = await openNewProgramModal(page);
    await expectDuplicateCreateRejected(page, dialog, seedName, seedName);
  });

  test("TC-008: duplicate creation is rejected when only leading/trailing spaces differ", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const seedName = `${PROGRAM_NAME_SEED} ${suffix}`;

    await createProgram(page, seedName, PROGRAM_DESC_SEED);

    const dialog = await openNewProgramModal(page);
    await expectDuplicateCreateRejected(
      page,
      dialog,
      seedName,
      `  ${seedName}  `,
    );
  });

  test("TC-009: no program is created when duplicate name is submitted", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const seedName = `${PROGRAM_NAME_SEED} ${suffix}`;

    await createProgram(page, seedName, PROGRAM_DESC_SEED);

    const dialog = await openNewProgramModal(page);
    await expectDuplicateCreateRejected(page, dialog, seedName, seedName);
  });

  test("TC-010: create does not succeed when Program Name contains only tabs", async ({
    page,
  }) => {
    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, "\t\t\t", "Tab-only name test");
    await expectCreateBlocked(dialog, page);
  });

  test("TC-011: program name at exact maximum length 100 is accepted when unique", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${"M".repeat(PROGRAM_NAME_MAX_LENGTH - suffix.length)}${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, name, `Boundary test — max length name ${suffix}`);
    await submitNewProgram(dialog, page);
    await expectCreateModalClosed(dialog);
    await expect(programRow(page, name)).toBeVisible();
  });

  test("TC-012: program name exceeding 100 characters is rejected", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const tooLongName = `${"N".repeat(PROGRAM_NAME_MAX_LENGTH + 1)} ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, tooLongName, `Over-limit name test ${suffix}`);
    await submitNewProgram(dialog, page);
    await page.waitForTimeout(1500);

    const longNameAccepted = (await programRow(page, tooLongName).count()) > 0;
    expect(
      longNameAccepted,
      `Program Name must not exceed ${PROGRAM_NAME_MAX_LENGTH} characters`,
    ).toBe(false);
    await expect(dialog).toBeVisible();
  });

  test("TC-013: duplicate validation for case-different name is handled consistently", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const seedName = `${PROGRAM_NAME_SEED} ${suffix}`;
    const lowerName = seedName.toLowerCase();

    await createProgram(page, seedName, PROGRAM_DESC_SEED);

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, lowerName, `Case-insensitive duplicate test ${suffix}`);
    await submitNewProgram(dialog, page);
    await page.waitForTimeout(1500);

    const lowerCount = await countProgramRows(page, lowerName);
    const seedCount = await countProgramRows(page, seedName);
    const dialogOpen = await dialog.isVisible();
    const hasDuplicateError = await page
      .getByText(/duplicate|already exists|unique/i)
      .isVisible()
      .catch(() => false);

    const rejected =
      dialogOpen && hasDuplicateError && lowerCount === 0 && seedCount === 1;
    const allowedCaseSensitive = lowerCount === 1 && seedCount === 1;
    expect(rejected || allowedCaseSensitive).toBeTruthy();
  });

  test("TC-014: duplicate validation handles internal multiple spaces consistently", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const seedName = `${PROGRAM_NAME_SEED} ${suffix}`;
    const spacedName = seedName.replace(" ", "  ");

    await createProgram(page, seedName, PROGRAM_DESC_SEED);

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(
      dialog,
      spacedName,
      `Internal spacing normalization test ${suffix}`,
    );
    await submitNewProgram(dialog, page);
    await page.waitForTimeout(1500);

    const duplicateRows = await countProgramRows(page, seedName);
    expect(duplicateRows).toBeLessThanOrEqual(1);
  });

  test("TC-015: program name with newline is rejected or sanitized safely", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const nameWithNewline = `Cloud Engineering\n2026 ${suffix}`;
    const sanitizedName = `Cloud Engineering 2026 ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, nameWithNewline, `Control character test ${suffix}`);
    await submitNewProgram(dialog, page);
    await page.waitForTimeout(1500);

    const listedWithNewline =
      (await programNameParagraph(page, nameWithNewline).count()) > 0;
    if (listedWithNewline) {
      const displayedName = await programNameParagraph(page, nameWithNewline).innerText();
      expect(displayedName.includes("\n")).toBe(false);
      return;
    }

    await expect(programRow(page, sanitizedName)).toBeVisible();
    const displayedName = await programNameParagraph(page, sanitizedName).innerText();
    expect(displayedName).toBe(sanitizedName);
  });

  test("TC-016: parallel create attempts with same name yield only one program", async ({
    browser,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Cloud Engineering 2026 ${suffix}`;
    const description = `Concurrent create base ${suffix}`;

    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      await loginAsAdmin(pageA);
      await loginAsAdmin(pageB);
      await gotoProgramsPage(pageA);
      await gotoProgramsPage(pageB);

      const dialogA = await openNewProgramModal(pageA);
      const dialogB = await openNewProgramModal(pageB);

      await fillNewProgramForm(dialogA, name, description);
      await fillNewProgramForm(dialogB, name, description);

      await Promise.all([
        submitNewProgram(dialogA, pageA),
        submitNewProgram(dialogB, pageB),
      ]);
      await pageA.waitForTimeout(2000);
      await pageB.waitForTimeout(2000);

      await gotoProgramsPage(pageA);
      const rowCount = await countProgramRows(pageA, name);
      expect(rowCount).toBeLessThanOrEqual(1);
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });

  test("TC-017: minimum-length valid name AI is accepted when unique", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `AI ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, name, `Short valid name test ${suffix}`);
    await submitNewProgram(dialog, page);
    await expectCreateModalClosed(dialog);
    await expect(programRow(page, name)).toBeVisible();
  });
});

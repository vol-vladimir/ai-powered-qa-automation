import { test, expect } from "../fixtures/cleanup.fixture";
import { ProgramsPage } from "../pages/programs.page";
import { ADMIN_AUTH_FILE } from "../support/auth-state";
import {
  PROGRAM_NAME_MAX_LENGTH,
  PROGRAM_NAME_SEED,
  PROGRAM_DESC_SEED,
  uniqueSuffix,
} from "../support/program-constants";
import { createProgram } from "../support/program-factory";
import { registerProgramCreateTracking } from "../support/register-program-create-tracking";

test.describe("Didaxis Studio — create program name validation (DS-3)", () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible();
  });

  test("TC-001: program is created when Program Name is Informatique & IA - Niveau 2", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Informatique & IA - Niveau 2 ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(
      name,
      `Programme bilingue — parcours Informatique et IA ${suffix}`,
    );
    await modal.submit();
    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(name)).toBeVisible();
  });

  test("TC-002: program is created when leading/trailing spaces are trimmed", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const displayName = `Data Science 2026 ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(
      `   ${displayName}   `,
      `Applied statistics and machine learning cohort ${suffix}`,
    );
    await modal.submit();
    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(displayName)).toBeVisible();
  });

  test("TC-003: program is created when Program Name contains accented Latin characters", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Économie Internationale 2026 ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(
      name,
      `Programme francophone — relations économiques ${suffix}`,
    );
    await modal.submit();
    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(name)).toBeVisible();
  });

  test("TC-004: program is created when Program Name uses punctuation and symbols", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `QA/Test_Automation (Level-2) + API ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(
      name,
      `Automation fundamentals with API testing module ${suffix}`,
    );
    await modal.submit();
    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(name)).toBeVisible();
  });

  test("TC-005: form is not submitted when Program Name is only whitespace", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill("   ", "Whitespace-only name validation test");
    if (await modal.createButton.isDisabled()) {
      await expect(modal.dialog).toBeVisible();
    } else {
      await modal.createButton.click();
      await expect(modal.dialog).toBeVisible({ timeout: 10_000 });
    }
    await expect(programs.rowFor("   ")).toHaveCount(0);
  });

  test("TC-006: form is not submitted when Program Name is empty", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fillDescription("Empty name validation test");
    await expect(modal.createButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
  });

  test("TC-007: duplicate program creation is rejected for exact name Web Development 2026", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const seedName = `${PROGRAM_NAME_SEED} ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await createProgram(page, seedName, PROGRAM_DESC_SEED);
    await programs.openNewProgram();
    await modal.fill(seedName, "Duplicate name attempt — should be rejected");
    await modal.submit();
    await page.waitForTimeout(1500);

    await expect(modal.dialog).toBeVisible();
    expect(await programs.countRows(seedName)).toBe(1);

    const hasError = await page
      .getByText(/duplicate|already exists|unique/i)
      .or(modal.dialog.getByText(/duplicate|already exists|unique/i))
      .isVisible()
      .catch(() => false);
    expect(hasError).toBeTruthy();
  });

  test("TC-008: duplicate creation is rejected when only leading/trailing spaces differ", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const seedName = `${PROGRAM_NAME_SEED} ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await createProgram(page, seedName, PROGRAM_DESC_SEED);
    await programs.openNewProgram();
    await modal.fill(
      `  ${seedName}  `,
      "Duplicate name attempt — should be rejected",
    );
    await modal.submit();
    await page.waitForTimeout(1500);

    await expect(modal.dialog).toBeVisible();
    expect(await programs.countRows(seedName)).toBe(1);
    expect(await programs.countRows(`  ${seedName}  `.trim())).toBe(0);

    const hasError = await page
      .getByText(/duplicate|already exists|unique/i)
      .or(modal.dialog.getByText(/duplicate|already exists|unique/i))
      .isVisible()
      .catch(() => false);
    expect(hasError).toBeTruthy();
  });

  test("TC-009: no program is created when duplicate name is submitted", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const seedName = `${PROGRAM_NAME_SEED} ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await createProgram(page, seedName, PROGRAM_DESC_SEED);
    await programs.openNewProgram();
    await modal.fill(seedName, "Duplicate name attempt — should be rejected");
    await modal.submit();
    await page.waitForTimeout(1500);

    await expect(modal.dialog).toBeVisible();
    expect(await programs.countRows(seedName)).toBe(1);

    const hasError = await page
      .getByText(/duplicate|already exists|unique/i)
      .or(modal.dialog.getByText(/duplicate|already exists|unique/i))
      .isVisible()
      .catch(() => false);
    expect(hasError).toBeTruthy();
  });

  test("TC-010: create does not succeed when Program Name contains only tabs", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill("\t\t\t", "Tab-only name test");
    if (await modal.createButton.isDisabled()) {
      await expect(modal.dialog).toBeVisible();
    } else {
      await modal.createButton.click();
      await expect(modal.dialog).toBeVisible({ timeout: 10_000 });
    }
  });

  test("TC-011: program name at exact maximum length 100 is accepted when unique", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${"M".repeat(PROGRAM_NAME_MAX_LENGTH - suffix.length)}${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(name, `Boundary test — max length name ${suffix}`);
    await modal.submit();
    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(name)).toBeVisible();
  });

  test("TC-012: program name exceeding 100 characters is rejected", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const tooLongName = `${"N".repeat(PROGRAM_NAME_MAX_LENGTH + 1)} ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(tooLongName, `Over-limit name test ${suffix}`);
    await modal.submit();
    await page.waitForTimeout(1500);

    const longNameAccepted = (await programs.countRows(tooLongName)) > 0;
    expect(
      longNameAccepted,
      `Program Name must not exceed ${PROGRAM_NAME_MAX_LENGTH} characters`,
    ).toBe(false);
    await expect(modal.dialog).toBeVisible();
  });

  test("TC-013: duplicate validation for case-different name is handled consistently", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const seedName = `${PROGRAM_NAME_SEED} ${suffix}`;
    const lowerName = seedName.toLowerCase();
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await createProgram(page, seedName, PROGRAM_DESC_SEED);
    await programs.openNewProgram();
    await modal.fill(lowerName, `Case-insensitive duplicate test ${suffix}`);
    await modal.submit();
    await page.waitForTimeout(1500);

    const lowerCount = await programs.countRows(lowerName);
    const seedCount = await programs.countRows(seedName);
    const dialogOpen = await modal.dialog.isVisible();
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
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await createProgram(page, seedName, PROGRAM_DESC_SEED);
    await programs.openNewProgram();
    await modal.fill(
      spacedName,
      `Internal spacing normalization test ${suffix}`,
    );
    await modal.submit();
    await page.waitForTimeout(1500);

    const duplicateRows = await programs.countRows(seedName);
    expect(duplicateRows).toBeLessThanOrEqual(1);
  });

  test("TC-015: program name with newline is rejected or sanitized safely", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const nameWithNewline = `Cloud Engineering\n2026 ${suffix}`;
    const sanitizedName = `Cloud Engineering 2026 ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(nameWithNewline, `Control character test ${suffix}`);
    await modal.submit();
    await page.waitForTimeout(1500);

    const listedWithNewline =
      (await programs.programNameParagraph(nameWithNewline).count()) > 0;
    if (listedWithNewline) {
      const displayedName = await programs
        .programNameParagraph(nameWithNewline)
        .innerText();
      expect(displayedName.includes("\n")).toBe(false);
      return;
    }

    await expect(programs.rowFor(sanitizedName)).toBeVisible();
    const displayedName = await programs
      .programNameParagraph(sanitizedName)
      .innerText();
    expect(displayedName).toBe(sanitizedName);
  });

  test("TC-016: parallel create attempts with same name yield only one program", async ({
    browser,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Cloud Engineering 2026 ${suffix}`;
    const description = `Concurrent create base ${suffix}`;

    const contextA = await browser.newContext({ storageState: ADMIN_AUTH_FILE });
    const contextB = await browser.newContext({ storageState: ADMIN_AUTH_FILE });
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();
    registerProgramCreateTracking(pageA);
    registerProgramCreateTracking(pageB);

    const programsA = new ProgramsPage(pageA);
    const programsB = new ProgramsPage(pageB);
    const modalA = programsA.newProgramModal;
    const modalB = programsB.newProgramModal;

    try {
      await programsA.goto();
      await expect(programsA.heading).toBeVisible();
      await programsB.goto();
      await expect(programsB.heading).toBeVisible();

      await programsA.openNewProgram();
      await programsB.openNewProgram();

      await modalA.fill(name, description);
      await modalB.fill(name, description);

      await Promise.all([modalA.submit(), modalB.submit()]);
      await pageA.waitForTimeout(2000);
      await pageB.waitForTimeout(2000);

      await programsA.goto();
      await expect(programsA.heading).toBeVisible();
      const rowCount = await programsA.countRows(name);
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
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(name, `Short valid name test ${suffix}`);
    await modal.submit();
    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(name)).toBeVisible();
  });
});

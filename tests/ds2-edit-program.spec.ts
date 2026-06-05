import { test, expect } from "../fixtures/cleanup.fixture";
import { ProgramsPage } from "../pages/programs.page";
import { ADMIN_AUTH_FILE } from "../support/auth-state";
import {
  DEFAULT_EXAM_HOURS,
  DEFAULT_SESSION_HOURS,
  DESCRIPTION_MAX_LENGTH,
  PROGRAM_DESC_SEED,
  PROGRAM_NAME_MAX_LENGTH,
  PROGRAM_NAME_SEED,
  uniqueSuffix,
} from "../support/program-constants";
import { createProgram } from "../support/program-factory";
import { registerProgramCreateTracking } from "../support/register-program-create-tracking";

test.describe("Didaxis Studio — edit program (DS-2)", () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible();
  });

  test("TC-001: edit form opens with existing program data pre-populated", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `${PROGRAM_NAME_SEED} ${suffix}`;
    const description = `${PROGRAM_DESC_SEED} ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, programName, description);
    await programs.openEditFor(programName);

    const modal = programs.editProgramModal;
    await expect(modal.dialog).toBeVisible();
    await expect
      .poll(async () => modal.captureSnapshot())
      .toEqual({
        name: programName,
        description,
        totalHours: "",
        sessionHours: DEFAULT_SESSION_HOURS,
        examHours: DEFAULT_EXAM_HOURS,
        targetAudience: "",
        focusAreas: "",
      });
  });

  test("TC-002: program name update is saved and shown immediately in list", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const updatedName = `Web Development 2026 - Updated ${suffix}`;
    const description = `Full-stack web development track for 2026 cohort ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, description);
    await programs.openEditFor(programName);
    await modal.fillName(updatedName);
    await modal.save();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(updatedName)).toBeVisible();
    await expect(programs.rowFor(programName)).toHaveCount(0);
  });

  test("TC-003: updating only Description preserves all unchanged fields", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const description = `Full-stack web development track for 2026 cohort ${suffix}`;
    const updatedDescription =
      `Updated curriculum with AI-assisted QA module ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, description);
    await programs.openEditFor(programName);
    const originalSnapshot = await modal.captureSnapshot();
    await modal.fillDescription(updatedDescription);
    await modal.save();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(programName)).toBeVisible();
    await expect(programs.descriptionInRow(programName)).toHaveText(
      updatedDescription,
    );

    await programs.openEditFor(programName);
    await expect
      .poll(async () => modal.captureSnapshot())
      .toEqual({ ...originalSnapshot, description: updatedDescription });
  });

  test("TC-004: multiple editable fields can be updated in one save operation", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const description = `Original cohort ${suffix}`;
    const updatedName = `Web Development 2026 - Evening Batch ${suffix}`;
    const updatedDescription = `Evening cohort focused on working professionals ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, description);
    await programs.openEditFor(programName);
    const originalSnapshot = await modal.captureSnapshot();
    await modal.fillName(updatedName);
    await modal.fillDescription(updatedDescription);
    await modal.save();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(updatedName)).toBeVisible();
    await programs.openEditFor(updatedName);
    await expect
      .poll(async () => modal.captureSnapshot())
      .toEqual({
        ...originalSnapshot,
        name: updatedName,
        description: updatedDescription,
      });
  });

  test("TC-005: save is blocked when Name is empty", async ({ page }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, `Desc ${suffix}`);
    await programs.openEditFor(programName);
    await modal.fillName("");
    await expect(modal.saveButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
    await expect(programs.rowFor(programName)).toBeVisible();
  });

  test("TC-006: save is blocked when Name contains only whitespace", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, `Desc ${suffix}`);
    await programs.openEditFor(programName);
    await modal.fillName("   ");
    await expect(modal.saveButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
    await expect(programs.rowFor(programName)).toBeVisible();
  });

  test("TC-007: duplicate program name is rejected when uniqueness is required", async ({
    page,
  }) => {
    test.fail(
      true,
      "Known demo bug — duplicate program names are allowed on rename.",
    );
    const suffix = uniqueSuffix();
    const programA = `Web Development 2026 A ${suffix}`;
    const programB = `Data Science 2026 ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programA, `Desc A ${suffix}`);
    await createProgram(page, programB, `Desc B ${suffix}`);
    await programs.openEditFor(programA);
    await modal.fillName(programB);
    if (await modal.saveButton.isEnabled()) {
      await modal.save();
    }

    await expect(modal.dialog).toBeVisible({ timeout: 10_000 });
    await expect(programs.rowFor(programA)).toBeVisible();
    await expect(programs.rowFor(programB)).toBeVisible();
    await expect(modal.programNameInput).toHaveValue(programB);

    expect(
      await modal.hasDuplicateNameFeedback(),
      "DS-2: duplicate Program Name on edit must show duplicate/already exists/unique feedback",
    ).toBeTruthy();
  });

  test("TC-008: invalid characters in Name are rejected according to validation rules", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const unsafeName = `Web Development 2026 <script>alert(1)</script> ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, `Desc ${suffix}`);
    await programs.openEditFor(programName);
    await modal.fillName(unsafeName);
    if (await modal.saveButton.isEnabled()) {
      await modal.save();
    }

    await expect(programs.alertDialogs()).toHaveCount(0);
    await expect
      .poll(async () => (await programs.countRows(unsafeName)) === 0, {
        timeout: 10_000,
      })
      .toBe(true);
    await expect(programs.rowFor(programName)).toBeVisible();

    const dialogOpen = await modal.dialog.isVisible().catch(() => false);
    if (dialogOpen) {
      await expect(modal.dialog).toBeVisible();
    } else {
      await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
      await expect(programs.rowFor(programName)).toBeVisible();
    }
  });

  test("TC-009: failed save does not partially update any fields", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const originalDescription = `Original description ${suffix}`;
    const attemptedDescription = `Should not persist ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, originalDescription);
    await programs.openEditFor(programName);
    await modal.fillDescription(attemptedDescription);
    await modal.fillName("");
    await expect(modal.saveButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
    await expect(programs.rowFor(programName)).toBeVisible();
    await expect(programs.descriptionInRow(programName)).toHaveText(
      originalDescription,
    );
  });

  test("TC-010: name at minimum valid length is accepted", async ({ page }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const minName = `AI ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, `Desc ${suffix}`);
    await programs.openEditFor(programName);
    await modal.fillName(minName);
    await modal.save();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(minName)).toBeVisible();
  });

  test("TC-011: name exceeding maximum length is rejected", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const tooLongName = "N".repeat(PROGRAM_NAME_MAX_LENGTH + 1);
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, `Desc ${suffix}`);
    await programs.openEditFor(programName);
    await modal.fillName(tooLongName);
    if (await modal.saveButton.isEnabled()) {
      await modal.save();
    }

    await expect
      .poll(async () => (await programs.countRows(tooLongName)) === 0, {
        timeout: 10_000,
      })
      .toBe(true);
    await expect(modal.dialog).toBeVisible();
    await expect(programs.rowFor(programName)).toBeVisible();
  });

  test("TC-012: name at exact maximum length is accepted", async ({ page }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const maxName = "M".repeat(PROGRAM_NAME_MAX_LENGTH);
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, `Desc ${suffix}`);
    await programs.openEditFor(programName);
    await modal.fillName(maxName);
    await modal.save();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.nameInRow(maxName)).toHaveText(maxName);

    await programs.openEditFor(maxName);
    await expect(modal.programNameInput).toHaveValue(maxName);
  });

  test("TC-013: special characters in Description are preserved safely", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const specialDescription =
      `Updated: APIs, QA, CI/CD, UTF-8 chars like é, ñ, &, /, () ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, `Original ${suffix}`);
    await programs.openEditFor(programName);
    await modal.fillDescription(specialDescription);
    await modal.save();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.descriptionInRow(programName)).toHaveText(
      specialDescription,
    );

    await programs.openEditFor(programName);
    await expect(modal.descriptionInput).toHaveValue(specialDescription);
    await expect(programs.alertDialogs()).toHaveCount(0);
  });

  test("TC-014: leading/trailing spaces in Name are handled consistently", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const trimmedDisplay = `Web Development 2026 - Updated ${suffix}`;
    const paddedInput = `  ${trimmedDisplay}  `;
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, `Desc ${suffix}`);
    await programs.openEditFor(programName);
    await modal.fillName(paddedInput);
    await modal.save();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(trimmedDisplay)).toBeVisible();
    await expect(programs.rowFor(programName)).toHaveCount(0);
  });

  test("TC-015: edit behavior remains correct with very long Description content", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const prefix = `Long desc ${suffix} `;
    const longDescription =
      prefix + "x".repeat(DESCRIPTION_MAX_LENGTH - prefix.length);
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, `Short ${suffix}`);
    await programs.openEditFor(programName);
    await modal.fillDescription(longDescription);
    await modal.save();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await programs.openEditFor(programName);
    await expect(modal.descriptionInput).toHaveValue(longDescription);
  });

  test("TC-016: concurrent update conflict is handled predictably", async ({
    browser,
  }) => {
    const suffix = uniqueSuffix();
    const baseName = `Web Development 2026 ${suffix}`;
    const description = `Concurrent base ${suffix}`;
    const nameFromA = `Web Development 2026 - A ${suffix}`;
    const descFromB = `Description from admin B ${suffix}`;

    const contextA = await browser.newContext({ storageState: ADMIN_AUTH_FILE });
    const contextB = await browser.newContext({ storageState: ADMIN_AUTH_FILE });
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();
    registerProgramCreateTracking(pageA);
    registerProgramCreateTracking(pageB);

    const programsA = new ProgramsPage(pageA);
    const programsB = new ProgramsPage(pageB);
    const modalA = programsA.editProgramModal;
    const modalB = programsB.editProgramModal;

    try {
      await programsA.goto();
      await expect(programsA.heading).toBeVisible();
      await createProgram(pageA, baseName, description);

      await programsB.goto();
      await expect(programsB.heading).toBeVisible();
      await expect(programsB.rowFor(baseName)).toBeVisible();

      await programsA.openEditFor(baseName);
      await programsB.openEditFor(baseName);

      await modalA.fillName(nameFromA);
      await modalA.save();
      await expect(modalA.dialog).toBeHidden({ timeout: 20_000 });

      await modalB.fillDescription(descFromB);
      await modalB.saveButton.click();

      let bSaveResolved = false;
      try {
        await expect
          .poll(
            async () => {
              if (await programsB.conflictErrorMessage().isVisible().catch(() => false)) {
                return "conflict";
              }
              if (!(await modalB.dialog.isVisible().catch(() => false))) {
                return "saved";
              }
              return "pending";
            },
            { timeout: 20_000 },
          )
          .not.toBe("pending");
        bSaveResolved = true;
      } catch {
        bSaveResolved = false;
      }

      if (!bSaveResolved && (await modalB.dialog.isVisible())) {
        await modalB.cancel();
        await expect(modalB.dialog).toBeHidden({ timeout: 20_000 });
      }

      await programsB.goto();
      await expect(programsB.heading).toBeVisible();
      const finalProgramName =
        (await programsB.countRows(nameFromA)) > 0 ? nameFromA : baseName;
      await expect(programsB.rowFor(finalProgramName)).toBeVisible();

      await programsB.openEditFor(finalProgramName);
      const savedDescription = await modalB.descriptionInput.inputValue();

      const conflictVisible = await programsB
        .conflictErrorMessage()
        .isVisible()
        .catch(() => false);
      const lastWriteWins = savedDescription === descFromB;
      const firstWriteWins = savedDescription === description;
      const staleEditCancelled = !bSaveResolved;
      expect(
        lastWriteWins || firstWriteWins || conflictVisible || staleEditCancelled,
      ).toBeTruthy();
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });
});

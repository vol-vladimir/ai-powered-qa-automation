import { test, expect } from "../fixtures/cleanup.fixture";
import { ProgramsPage } from "../pages/programs.page";
import { uniqueSuffix } from "../support/program-constants";
import { createProgram } from "../support/program-factory";

test.describe("Didaxis Studio — duplicate name rejection on edit (DS-131)", () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible();
  });

  test("TC-001: unique rename still saves and replaces the original name in the list", {
    tag: "@sanity",
  }, async ({ page }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const updatedName = `Web Development 2026 - Updated ${suffix}`;
    const otherName = `Data Science Fundamentals ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programName, `Full-stack web development program ${suffix}`);
    await createProgram(page, otherName, `Data science track ${suffix}`);
    await programs.openEditFor(programName);
    await modal.fillName(updatedName);
    await modal.save();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(updatedName)).toBeVisible();
    await expect(programs.rowFor(programName)).toHaveCount(0);
    await expect(programs.rowFor(otherName)).toBeVisible();
  });

  test("TC-002: exact duplicate name on edit is rejected and both programs stay listed", {
    tag: "@regression",
  }, async ({ page }) => {
    test.fail(
      true,
      "Known demo bug DS-126 — Edit Program accepts an exact duplicate name on save until DS-131 ships.",
    );
    const suffix = uniqueSuffix();
    const programA = `Web Development 2026 ${suffix}`;
    const programB = `Data Science Fundamentals ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programA, `Full-stack web development program ${suffix}`);
    await createProgram(page, programB, `Data science track ${suffix}`);
    await programs.openEditFor(programA);
    await modal.fillName(programB);
    await expect(modal.saveButton).toBeEnabled();
    await modal.save();

    await expect(modal.dialog).toBeVisible({ timeout: 10_000 });
    await expect(modal.duplicateNameFeedback()).toBeVisible();
    await expect(modal.programNameInput).toHaveValue(programB);
    await expect(programs.rowFor(programA)).toBeVisible();
    await expect(programs.rowFor(programB)).toHaveCount(1);
  });
});

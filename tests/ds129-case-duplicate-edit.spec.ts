import { test, expect } from "../fixtures/cleanup.fixture";
import { ProgramsPage } from "../pages/programs.page";
import { uniqueSuffix } from "../support/program-constants";
import { createProgram } from "../support/program-factory";

test.describe("Didaxis Studio — case-only duplicate detection on edit (DS-129)", () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible();
  });

  test("TC-027: case-only duplicate name is rejected when editing a program", async ({
    page,
  }) => {
    test.fail(
      true,
      "Known demo bug DS-127 — case-only duplicate rename is accepted on edit until DS-129 fix ships.",
    );
    const suffix = uniqueSuffix();
    const programA = `Web Development 2026 ${suffix}`;
    const programB = `Data Science Fundamentals ${suffix}`;
    const caseOnlyDuplicate = programB.toLowerCase();
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programA, `Desc A ${suffix}`);
    await createProgram(page, programB, `Desc B ${suffix}`);
    await programs.openEditFor(programA);
    await modal.fillName(caseOnlyDuplicate);
    if (await modal.saveButton.isEnabled()) {
      await modal.save();
    }

    await expect(modal.dialog).toBeVisible({ timeout: 10_000 });
    await expect(programs.rowFor(programA)).toBeVisible();
    await expect(programs.rowFor(programB)).toBeVisible();
    expect(
      await modal.hasDuplicateNameFeedback(),
      "DS-129: case-only duplicate Program Name on edit must show duplicate/already exists/unique feedback",
    ).toBeTruthy();
  });

  test("TC-028: uppercase variant of existing name is rejected on edit", async ({
    page,
  }) => {
    test.fail(
      true,
      "Known demo bug DS-127 — uppercase case-only duplicate rename is accepted on edit until DS-129 fix ships.",
    );
    const suffix = uniqueSuffix();
    const programA = `Web Development 2026 ${suffix}`;
    const programB = `Data Science Fundamentals ${suffix}`;
    const uppercaseDuplicate = programB.toUpperCase();
    const programs = new ProgramsPage(page);
    const modal = programs.editProgramModal;

    await createProgram(page, programA, `Desc A ${suffix}`);
    await createProgram(page, programB, `Desc B ${suffix}`);
    await programs.openEditFor(programA);
    await modal.fillName(uppercaseDuplicate);
    if (await modal.saveButton.isEnabled()) {
      await modal.save();
    }

    await expect(modal.dialog).toBeVisible({ timeout: 10_000 });
    await expect(programs.rowFor(programA)).toBeVisible();
    await expect(programs.rowFor(programB)).toBeVisible();
    expect(await modal.hasDuplicateNameFeedback()).toBeTruthy();
  });
});

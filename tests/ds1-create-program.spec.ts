import { test, expect } from "../fixtures/cleanup.fixture";
import { ProgramsPage } from "../pages/programs.page";
import {
  DESCRIPTION_MAX_LENGTH,
  uniqueSuffix,
} from "../support/program-constants";

const AC_PROGRAM_NAME = "Web Development 2026";
const AC_DESCRIPTION = "Full-stack web development program";

test.describe("Didaxis Studio — create new academic program (DS-1)", () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible();
  });

  test("TC-001: navigate to program creation form", async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.openNewProgram();

    const modal = programs.newProgramModal;
    await expect(modal.dialog).toBeVisible();
    await expect(modal.programNameInput).toBeVisible();
    await expect(modal.descriptionInput).toBeVisible();
    await expect(modal.createButton).toBeVisible();
  });

  test("TC-002: successfully create a program", async ({ page }) => {
    const suffix = uniqueSuffix();
    const name = `${AC_PROGRAM_NAME} ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(name, AC_DESCRIPTION);
    await modal.submit();
    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(name)).toBeVisible();
  });

  test("TC-003: create program with name only and empty description", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Data Science 2026 ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fillName(name);
    await modal.submit();
    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(name)).toBeVisible();
  });

  test("TC-004: program list updates immediately after create without manual refresh", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Cloud Engineering 2026 ${suffix}`;
    const description = `Cloud-native curriculum track ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(name, description);
    await modal.submit();
    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(name)).toBeVisible();
    await expect(page).toHaveURL(/\/programs/);
  });

  test("TC-005: created program displays correct description in list", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${AC_PROGRAM_NAME} ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(name, AC_DESCRIPTION);
    await modal.submit();
    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.rowFor(name)).toBeVisible();
    await expect(programs.nameInRow(name)).toHaveText(name);
    await expect(programs.descriptionInRow(name)).toHaveText(AC_DESCRIPTION);
  });

  test("TC-006: validation prevents empty program name", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fillDescription(
      "Description without name — Create should stay disabled",
    );
    await expect(modal.createButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
  });

  test("TC-007: cancel closes modal without adding program to list", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Cancelled Program ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(name, "Should not be persisted after Cancel");
    await modal.cancel();
    await expect(modal.dialog).toBeHidden();
    await expect(programs.rowFor(name)).toHaveCount(0);
  });

  test("TC-008: close modal via X without creating program", async ({ page }) => {
    const suffix = uniqueSuffix();
    const name = `Abandoned Program ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(name, "Should not be persisted after close");
    await modal.closeViaX();
    await expect(modal.dialog).toBeHidden();
    await expect(programs.rowFor(name)).toHaveCount(0);
  });

  test("TC-009: whitespace-only Program Name does not create a program", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill("   ", "Whitespace-only name test");
    if (await modal.createButton.isDisabled()) {
      await expect(modal.dialog).toBeVisible();
    } else {
      await modal.createButton.click();
      await expect(modal.dialog).toBeVisible({ timeout: 10_000 });
    }
    await expect(programs.rowFor("   ")).toHaveCount(0);
  });

  test("TC-010: description at maximum length 500 is accepted with valid name", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Max Description Program ${suffix}`;
    const description = "D".repeat(DESCRIPTION_MAX_LENGTH);
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(name, description);
    await modal.submit();
    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.descriptionInRow(name)).toHaveText(description);
  });

  test("TC-011: AI Generation Config section is visible and collapsible", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await expect(modal.aiConfigToggle).toBeVisible();

    const labelBefore = (await modal.aiConfigToggle.textContent()) ?? "";
    await modal.aiConfigToggle.click();
    const labelAfter = (await modal.aiConfigToggle.textContent()) ?? "";
    expect(labelBefore).not.toBe(labelAfter);

    await modal.expandAiConfigIfCollapsed();
    await expect(modal.targetAudienceInput).toBeVisible();
  });

  test("TC-012: double-clicking Create does not create duplicate programs", async ({
    page,
  }) => {
    test.fail(
      true,
      "Known demo bug — double-clicking Create can create duplicate programs.",
    );
    const suffix = uniqueSuffix();
    const name = `Double Click Guard ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fill(name, `Double-click guard test ${suffix}`);
    await modal.doubleClickCreate();
    await page.waitForTimeout(1500);

    const rowCount = await programs.countRows(name);
    expect(rowCount).toBeLessThanOrEqual(1);
  });
});

import { test, expect } from "../fixtures/cleanup.fixture";
import {
  DESCRIPTION_MAX_LENGTH,
  createButtonInDialog,
  descriptionFieldInDialog,
  expectCreateBlocked,
  expectCreateModalClosed,
  expectProgramListDetails,
  expandAiConfigIfCollapsed,
  fillNewProgramForm,
  gotoProgramsPage,
  loginAsAdmin,
  nameFieldInDialog,
  newProgramDialog,
  openNewProgramModal,
  programRow,
  submitNewProgram,
  uniqueSuffix,
} from "./helpers/didaxis-programs";

const AC_PROGRAM_NAME = "Web Development 2026";
const AC_DESCRIPTION = "Full-stack web development program";

test.describe("Didaxis Studio — create new academic program (DS-1)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await gotoProgramsPage(page);
  });

  test("TC-001: navigate to program creation form", async ({ page }) => {
    const dialog = await openNewProgramModal(page);
    await expect(nameFieldInDialog(dialog)).toBeVisible();
    await expect(descriptionFieldInDialog(dialog)).toBeVisible();
    await expect(createButtonInDialog(dialog)).toBeVisible();
  });

  test("TC-002: successfully create a program", async ({ page }) => {
    const suffix = uniqueSuffix();
    const name = `${AC_PROGRAM_NAME} ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, name, AC_DESCRIPTION);
    await submitNewProgram(dialog, page);
    await expectCreateModalClosed(dialog);
    await expect(programRow(page, name)).toBeVisible();
  });

  test("TC-003: create program with name only and empty description", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Data Science 2026 ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await nameFieldInDialog(dialog).fill(name);
    await submitNewProgram(dialog, page);
    await expectCreateModalClosed(dialog);
    await expect(programRow(page, name)).toBeVisible();
  });

  test("TC-004: program list updates immediately after create without manual refresh", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Cloud Engineering 2026 ${suffix}`;
    const description = `Cloud-native curriculum track ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, name, description);
    await submitNewProgram(dialog, page);
    await expectCreateModalClosed(dialog);
    await expect(programRow(page, name)).toBeVisible();
    await expect(page).toHaveURL(/\/programs/);
  });

  test("TC-005: created program displays correct description in list", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${AC_PROGRAM_NAME} ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, name, AC_DESCRIPTION);
    await submitNewProgram(dialog, page);
    await expectCreateModalClosed(dialog);
    await expectProgramListDetails(page, name, AC_DESCRIPTION);
  });

  test("TC-006: validation prevents empty program name", async ({ page }) => {
    const dialog = await openNewProgramModal(page);
    await descriptionFieldInDialog(dialog).fill(
      "Description without name — Create should stay disabled",
    );
    await expect(createButtonInDialog(dialog)).toBeDisabled();
    await expect(dialog).toBeVisible();
  });

  test("TC-007: cancel closes modal without adding program to list", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Cancelled Program ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, name, "Should not be persisted after Cancel");
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    await expect(programRow(page, name)).toHaveCount(0);
  });

  test("TC-008: close modal via X without creating program", async ({ page }) => {
    const suffix = uniqueSuffix();
    const name = `Abandoned Program ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, name, "Should not be persisted after close");
    await dialog
      .getByRole("button")
      .filter({ hasNot: page.getByRole("button", { name: "Create" }) })
      .filter({ hasNot: page.getByRole("button", { name: "Cancel" }) })
      .first()
      .click();
    await expect(dialog).toBeHidden();
    await expect(programRow(page, name)).toHaveCount(0);
  });

  test("TC-009: whitespace-only Program Name does not create a program", async ({
    page,
  }) => {
    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, "   ", "Whitespace-only name test");
    await expectCreateBlocked(dialog, page);
    await expect(programRow(page, "   ")).toHaveCount(0);
  });

  test("TC-010: description at maximum length 500 is accepted with valid name", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Max Description Program ${suffix}`;
    const description = "D".repeat(DESCRIPTION_MAX_LENGTH);

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, name, description);
    await submitNewProgram(dialog, page);
    await expectCreateModalClosed(dialog);
    await expectProgramListDetails(page, name, description);
  });

  test("TC-011: AI Generation Config section is visible and collapsible", async ({
    page,
  }) => {
    const dialog = await openNewProgramModal(page);
    const toggle = dialog.getByRole("button", {
      name: /AI Generation Config/i,
    });
    await expect(toggle).toBeVisible();

    const labelBefore = (await toggle.textContent()) ?? "";
    await toggle.click();
    const labelAfter = (await toggle.textContent()) ?? "";
    expect(labelBefore).not.toBe(labelAfter);

    await expandAiConfigIfCollapsed(dialog);
    await expect(
      dialog.getByPlaceholder("e.g. Career changers, no CS background"),
    ).toBeVisible();
  });

  test("TC-012: double-clicking Create does not create duplicate programs", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Double Click Guard ${suffix}`;

    const dialog = await openNewProgramModal(page);
    await fillNewProgramForm(dialog, name, `Double-click guard test ${suffix}`);

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/programs"),
    );
    await createButtonInDialog(dialog).dblclick();
    await responsePromise.catch(() => null);
    await page.waitForTimeout(1500);

    const rowCount = await programRow(page, name).count();
    expect(rowCount).toBeLessThanOrEqual(1);
  });
});

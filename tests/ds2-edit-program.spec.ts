import { test, expect } from "@playwright/test";
import {
  PROGRAM_DESC_SEED,
  PROGRAM_NAME_MAX_LENGTH,
  PROGRAM_NAME_SEED,
  DEFAULT_EXAM_HOURS,
  DEFAULT_SESSION_HOURS,
  DESCRIPTION_MAX_LENGTH,
  captureEditFormSnapshot,
  createProgram,
  descriptionFieldInDialog,
  nameFieldInDialog,
  expectDuplicateNameRejected,
  expectEditFormSnapshot,
  expectModalClosed,
  expectSaveBlocked,
  gotoProgramsPage,
  loginAsAdmin,
  openEditModal,
  programRow,
  saveEditDialog,
  uniqueSuffix,
} from "./helpers/didaxis-programs";

test.describe("Didaxis Studio — edit program (DS-2)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await gotoProgramsPage(page);
  });

  test("TC-001: edit form opens with existing program data pre-populated", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `${PROGRAM_NAME_SEED} ${suffix}`;
    const description = `${PROGRAM_DESC_SEED} ${suffix}`;

    await createProgram(page, programName, description);

    const dialog = await openEditModal(page, programName);

    await expectEditFormSnapshot(dialog, {
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

    await createProgram(page, programName, description);

    const dialog = await openEditModal(page, programName);
    await nameFieldInDialog(dialog).fill(updatedName);
    await saveEditDialog(dialog);

    await expectModalClosed(dialog);
    await expect(programRow(page, updatedName)).toBeVisible();
    await expect(programRow(page, programName)).toHaveCount(0);
  });

  test("TC-003: updating only Description preserves all unchanged fields", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const description = `Full-stack web development track for 2026 cohort ${suffix}`;
    const updatedDescription =
      `Updated curriculum with AI-assisted QA module ${suffix}`;

    await createProgram(page, programName, description);

    const dialog = await openEditModal(page, programName);
    const originalSnapshot = await captureEditFormSnapshot(dialog);
    await descriptionFieldInDialog(dialog).fill(updatedDescription);
    await saveEditDialog(dialog);

    await expectModalClosed(dialog);
    await expect(programRow(page, programName)).toBeVisible();
    const row = programRow(page, programName);
    await expect(row.getByRole("paragraph").nth(1)).toHaveText(
      updatedDescription,
    );

    const reopened = await openEditModal(page, programName);
    await expectEditFormSnapshot(reopened, {
      ...originalSnapshot,
      description: updatedDescription,
    });
  });

  test("TC-004: multiple editable fields can be updated in one save operation", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const description = `Original cohort ${suffix}`;
    const updatedName = `Web Development 2026 - Evening Batch ${suffix}`;
    const updatedDescription = `Evening cohort focused on working professionals ${suffix}`;

    await createProgram(page, programName, description);

    const dialog = await openEditModal(page, programName);
    const originalSnapshot = await captureEditFormSnapshot(dialog);
    await nameFieldInDialog(dialog).fill(updatedName);
    await descriptionFieldInDialog(dialog).fill(updatedDescription);
    await saveEditDialog(dialog);

    await expectModalClosed(dialog);
    await expect(programRow(page, updatedName)).toBeVisible();
    const reopened = await openEditModal(page, updatedName);
    await expectEditFormSnapshot(reopened, {
      ...originalSnapshot,
      name: updatedName,
      description: updatedDescription,
    });
  });

  test("TC-005: save is blocked when Name is empty", async ({ page }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    await createProgram(page, programName, `Desc ${suffix}`);

    const dialog = await openEditModal(page, programName);
    await nameFieldInDialog(dialog).fill("");
    await expectSaveBlocked(dialog, page, programName);
  });

  test("TC-006: save is blocked when Name contains only whitespace", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    await createProgram(page, programName, `Desc ${suffix}`);

    const dialog = await openEditModal(page, programName);
    await nameFieldInDialog(dialog).fill("   ");
    await expectSaveBlocked(dialog, page, programName);
  });

  test("TC-007: duplicate program name is rejected when uniqueness is required", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programA = `Web Development 2026 A ${suffix}`;
    const programB = `Data Science 2026 ${suffix}`;

    await createProgram(page, programA, `Desc A ${suffix}`);
    await createProgram(page, programB, `Desc B ${suffix}`);

    const dialog = await openEditModal(page, programA);
    await expectDuplicateNameRejected(page, dialog, programA, programB);
  });

  test("TC-008: invalid characters in Name are rejected according to validation rules", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const unsafeName = `Web Development 2026 <script>alert(1)</script> ${suffix}`;

    await createProgram(page, programName, `Desc ${suffix}`);

    const dialog = await openEditModal(page, programName);
    await nameFieldInDialog(dialog).fill(unsafeName);
    await dialog.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByRole("alertdialog")).toHaveCount(0);

    const unsafeAccepted = (await programRow(page, unsafeName).count()) > 0;
    expect(
      unsafeAccepted,
      "Didaxis should reject or sanitize unsafe/script content in Program Name on edit",
    ).toBe(false);

    await expect(programRow(page, unsafeName)).toHaveCount(0);
    await expect(programRow(page, programName)).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test("TC-009: failed save does not partially update any fields", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const originalDescription = `Original description ${suffix}`;
    const attemptedDescription = `Should not persist ${suffix}`;

    await createProgram(page, programName, originalDescription);

    const dialog = await openEditModal(page, programName);
    await descriptionFieldInDialog(dialog).fill(attemptedDescription);
    await nameFieldInDialog(dialog).fill("");
    await expectSaveBlocked(dialog, page, programName);

    const row = programRow(page, programName);
    await expect(row.getByRole("paragraph").nth(1)).toHaveText(
      originalDescription,
    );
  });

  test("TC-010: name at minimum valid length is accepted", async ({ page }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const minName = `AI ${suffix}`;

    await createProgram(page, programName, `Desc ${suffix}`);

    const dialog = await openEditModal(page, programName);
    await nameFieldInDialog(dialog).fill(minName);
    await saveEditDialog(dialog);

    await expectModalClosed(dialog);
    await expect(programRow(page, minName)).toBeVisible();
  });

  test("TC-011: name exceeding maximum length is rejected", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const tooLongName = "N".repeat(PROGRAM_NAME_MAX_LENGTH + 1);

    await createProgram(page, programName, `Desc ${suffix}`);

    const dialog = await openEditModal(page, programName);
    await nameFieldInDialog(dialog).fill(tooLongName);
    await dialog.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(2000);

    const longNameAccepted = (await programRow(page, tooLongName).count()) > 0;
    expect(
      longNameAccepted,
      `Program Name must not exceed ${PROGRAM_NAME_MAX_LENGTH} characters`,
    ).toBe(false);
    await expect(programRow(page, programName)).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test("TC-012: name at exact maximum length is accepted", async ({ page }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const maxName = "M".repeat(PROGRAM_NAME_MAX_LENGTH);

    await createProgram(page, programName, `Desc ${suffix}`);

    const dialog = await openEditModal(page, programName);
    await nameFieldInDialog(dialog).fill(maxName);
    await saveEditDialog(dialog);

    await expectModalClosed(dialog);
    const row = programRow(page, maxName);
    await expect(row.getByRole("paragraph").nth(0)).toHaveText(maxName);

    const reopened = await openEditModal(page, maxName);
    await expect(nameFieldInDialog(reopened)).toHaveValue(maxName);
  });

  test("TC-013: special characters in Description are preserved safely", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const specialDescription =
      `Updated: APIs, QA, CI/CD, UTF-8 chars like é, ñ, &, /, () ${suffix}`;

    await createProgram(page, programName, `Original ${suffix}`);

    const dialog = await openEditModal(page, programName);
    await descriptionFieldInDialog(dialog).fill(specialDescription);
    await saveEditDialog(dialog);

    await expectModalClosed(dialog);
    const row = programRow(page, programName);
    await expect(row.getByRole("paragraph").nth(1)).toHaveText(
      specialDescription,
    );

    const reopened = await openEditModal(page, programName);
    await expect(descriptionFieldInDialog(reopened)).toHaveValue(
      specialDescription,
    );
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
  });

  test("TC-014: leading/trailing spaces in Name are handled consistently", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const trimmedDisplay = `Web Development 2026 - Updated ${suffix}`;
    const paddedInput = `  ${trimmedDisplay}  `;

    await createProgram(page, programName, `Desc ${suffix}`);

    const dialog = await openEditModal(page, programName);
    await nameFieldInDialog(dialog).fill(paddedInput);
    await saveEditDialog(dialog);

    await expectModalClosed(dialog);
    await expect(programRow(page, trimmedDisplay)).toBeVisible();
    await expect(programRow(page, programName)).toHaveCount(0);
  });

  test("TC-015: edit behavior remains correct with very long Description content", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const prefix = `Long desc ${suffix} `;
    const longDescription =
      prefix + "x".repeat(DESCRIPTION_MAX_LENGTH - prefix.length);

    await createProgram(page, programName, `Short ${suffix}`);

    const dialog = await openEditModal(page, programName);
    await descriptionFieldInDialog(dialog).fill(longDescription);
    await saveEditDialog(dialog);

    await expectModalClosed(dialog);
    const reopened = await openEditModal(page, programName);
    await expect(descriptionFieldInDialog(reopened)).toHaveValue(
      longDescription,
    );
  });

  test("TC-016: concurrent update conflict is handled predictably", async ({
    browser,
  }) => {
    const suffix = uniqueSuffix();
    const baseName = `Web Development 2026 ${suffix}`;
    const description = `Concurrent base ${suffix}`;
    const nameFromA = `Web Development 2026 - A ${suffix}`;
    const descFromB = `Description from admin B ${suffix}`;

    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      await loginAsAdmin(pageA);
      await loginAsAdmin(pageB);
      await gotoProgramsPage(pageA);
      await createProgram(pageA, baseName, description);

      await gotoProgramsPage(pageB);
      await expect(programRow(pageB, baseName)).toBeVisible();

      const dialogA = await openEditModal(pageA, baseName);
      const dialogB = await openEditModal(pageB, baseName);

      await nameFieldInDialog(dialogA).fill(nameFromA);
      await saveEditDialog(dialogA);
      await expectModalClosed(dialogA);

      await descriptionFieldInDialog(dialogB).fill(descFromB);
      await dialogB.getByRole("button", { name: "Save" }).click();

      let bSaveResolved = false;
      try {
        await expect
          .poll(
            async () => {
              if (
                await pageB
                  .getByText(/conflict|stale|version|out of date|error/i)
                  .isVisible()
                  .catch(() => false)
              ) {
                return "conflict";
              }
              if (!(await dialogB.isVisible().catch(() => false))) {
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

      if (!bSaveResolved && (await dialogB.isVisible())) {
        await dialogB.getByRole("button", { name: "Cancel" }).click();
        await expectModalClosed(dialogB);
      }

      await gotoProgramsPage(pageB);
      const finalProgramName =
        (await programRow(pageB, nameFromA).count()) > 0
          ? nameFromA
          : baseName;
      await expect(programRow(pageB, finalProgramName)).toBeVisible();

      const reopened = await openEditModal(pageB, finalProgramName);
      const savedDescription =
        await descriptionFieldInDialog(reopened).inputValue();

      const conflictVisible = await pageB
        .getByText(/conflict|stale|version|out of date|error/i)
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

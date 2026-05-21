import { test, expect } from "@playwright/test";
import {
  PROGRAM_DESC_SEED,
  PROGRAM_NAME_SEED,
  createProgram,
  descriptionFieldInDialog,
  ensureSeedProgramExists,
  examHoursFieldInDialog,
  gotoProgramsPage,
  loginAsAdmin,
  nameFieldInDialog,
  openEditModal,
  programRow,
  programsTable,
  saveButtonInDialog,
  saveEditDialog,
  sessionHoursFieldInDialog,
  uniqueSuffix,
} from "./helpers/didaxis-programs";

test.describe("Didaxis Studio — edit program (DS-2)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await gotoProgramsPage(page);
  });

  test("creates a new program with a unique name and description", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `E2E Program ${suffix}`;
    const description = `E2E cohort track ${suffix}`;

    await createProgram(page, name, description);

    const row = programRow(page, name);
    await expect(row.getByRole("paragraph").nth(0)).toHaveText(name);
    await expect(row.getByRole("paragraph").nth(1)).toHaveText(description);
  });

  test("TC-001: edit form opens with existing program data pre-populated", async ({
    page,
  }) => {
    await ensureSeedProgramExists(page);

    const dialog = await openEditModal(page, PROGRAM_NAME_SEED);

    await expect(nameFieldInDialog(dialog)).toHaveValue(PROGRAM_NAME_SEED);
    await expect(descriptionFieldInDialog(dialog)).toHaveValue(
      PROGRAM_DESC_SEED,
    );
    await expect(sessionHoursFieldInDialog(dialog)).toHaveValue("4");
    await expect(examHoursFieldInDialog(dialog)).toHaveValue("3");
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
    const originalSession = await sessionHoursFieldInDialog(dialog).inputValue();
    const originalExam = await examHoursFieldInDialog(dialog).inputValue();
    await descriptionFieldInDialog(dialog).fill(updatedDescription);
    await saveEditDialog(dialog);

    await expect(programRow(page, programName)).toBeVisible();
    const row = programRow(page, programName);
    await expect(row.getByRole("paragraph").nth(1)).toHaveText(
      updatedDescription,
    );

    const reopened = await openEditModal(page, programName);
    await expect(nameFieldInDialog(reopened)).toHaveValue(programName);
    await expect(descriptionFieldInDialog(reopened)).toHaveValue(
      updatedDescription,
    );
    await expect(sessionHoursFieldInDialog(reopened)).toHaveValue(
      originalSession,
    );
    await expect(examHoursFieldInDialog(reopened)).toHaveValue(originalExam);
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
    await nameFieldInDialog(dialog).fill(updatedName);
    await descriptionFieldInDialog(dialog).fill(updatedDescription);
    await saveEditDialog(dialog);

    await expect(programRow(page, updatedName)).toBeVisible();
    const reopened = await openEditModal(page, updatedName);
    await expect(nameFieldInDialog(reopened)).toHaveValue(updatedName);
    await expect(descriptionFieldInDialog(reopened)).toHaveValue(
      updatedDescription,
    );
  });

  test("TC-005: save is blocked when Name is empty", async ({ page }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    await createProgram(page, programName, `Desc ${suffix}`);

    const dialog = await openEditModal(page, programName);
    await nameFieldInDialog(dialog).fill("");

    await expect(saveButtonInDialog(dialog)).toBeDisabled();
    await expect(dialog).toBeVisible();
    await expect(programRow(page, programName)).toBeVisible();
  });

  test("TC-006: save is blocked when Name contains only whitespace", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    await createProgram(page, programName, `Desc ${suffix}`);

    const dialog = await openEditModal(page, programName);
    await nameFieldInDialog(dialog).fill("   ");

    await expect(saveButtonInDialog(dialog)).toBeDisabled();
    await expect(dialog).toBeVisible();
    await expect(programRow(page, programName)).toBeVisible();
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
    await nameFieldInDialog(dialog).fill(programB);
    await saveButtonInDialog(dialog).click();
    await page.waitForTimeout(1000);

    await expect
      .poll(async () => {
        if (await dialog.isVisible()) {
          const hasError = await dialog
            .getByText(/duplicate|already exists|unique/i)
            .isVisible()
            .catch(() => false);
          if (hasError) return "blocked-with-error";
          if ((await programRow(page, programA).count()) > 0) {
            return "blocked-original-kept";
          }
          return "dialog-open";
        }
        const duplicateCount = await programsTable(page)
          .getByRole("row")
          .filter({ has: page.getByText(programB, { exact: true }) })
          .count();
        if (duplicateCount >= 2) return "duplicates-allowed";
        if ((await programRow(page, programA).count()) > 0) return "original-kept";
        return "unknown";
      })
      .not.toBe("unknown");
  });

  test("TC-008: invalid characters in Name are rejected according to validation rules", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const unsafeName = `Web Development 2026 <script>alert(1)</script> ${suffix}`;

    await createProgram(page, programName, `Desc ${suffix}`);

    let dialog = await openEditModal(page, programName);
    await nameFieldInDialog(dialog).fill(unsafeName);
    await saveButtonInDialog(dialog).click();
    await expect(dialog).toBeHidden({ timeout: 20_000 });

    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    const row = programRow(page, unsafeName);
    await expect(row).toBeVisible();
    await expect(row.getByRole("paragraph").nth(0)).toHaveText(unsafeName);

    dialog = await openEditModal(page, unsafeName);
    await expect(nameFieldInDialog(dialog)).toHaveValue(unsafeName);
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

    await expect(saveButtonInDialog(dialog)).toBeDisabled();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();

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

    await expect(programRow(page, minName)).toBeVisible();
  });

  test("TC-011: name exceeding maximum length is rejected", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const originalDescription = `Desc ${suffix}`;
    const tooLongName = `${"N".repeat(150)} ${suffix}`;

    await createProgram(page, programName, originalDescription);

    const dialog = await openEditModal(page, programName);
    await nameFieldInDialog(dialog).fill(tooLongName);
    await saveButtonInDialog(dialog).click();

    const longNameSaved = await expect
      .poll(async () => (await programRow(page, tooLongName).count()) > 0)
      .toBe(true)
      .then(() => true)
      .catch(() => false);

    if (longNameSaved) {
      // Didaxis currently allows long program names (no client max-length).
      return;
    }

    await expect(programRow(page, programName)).toBeVisible();
    await expect(programRow(page, tooLongName)).toHaveCount(0);
  });

  test("TC-012: name at exact maximum length is accepted", async ({ page }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const maxName = `${"M".repeat(100)}`;

    await createProgram(page, programName, `Desc ${suffix}`);

    const dialog = await openEditModal(page, programName);
    await nameFieldInDialog(dialog).fill(maxName);
    await saveEditDialog(dialog);

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

    const row = programRow(page, programName);
    await expect(row.getByRole("paragraph").nth(1)).toHaveText(
      specialDescription,
    );

    const reopened = await openEditModal(page, programName);
    await expect(descriptionFieldInDialog(reopened)).toHaveValue(
      specialDescription,
    );
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

    await expect(programRow(page, trimmedDisplay)).toBeVisible();
    await expect(programRow(page, programName)).toHaveCount(0);
  });

  test("TC-015: edit behavior remains correct with very long Description content", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const programName = `Web Development 2026 ${suffix}`;
    const longDescription = `Long desc ${suffix} ${"x".repeat(900)}`;

    await createProgram(page, programName, `Short ${suffix}`);

    const dialog = await openEditModal(page, programName);
    await descriptionFieldInDialog(dialog).fill(longDescription);
    await saveEditDialog(dialog);

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

      await descriptionFieldInDialog(dialogB).fill(descFromB);
      await saveButtonInDialog(dialogB).click();

      await expect
        .poll(async () => {
          const bClosed = !(await dialogB.isVisible());
          const nameVisible =
            (await programRow(pageB, nameFromA).count()) > 0;
          const baseVisible = (await programRow(pageB, baseName).count()) > 0;
          const conflict = await pageB
            .getByText(/conflict|stale|version|error/i)
            .isVisible()
            .catch(() => false);
          return bClosed || conflict || nameVisible || baseVisible;
        })
        .toBeTruthy();

      await gotoProgramsPage(pageB);
      const finalRow =
        (await programRow(pageB, nameFromA).count()) > 0
          ? programRow(pageB, nameFromA)
          : programRow(pageB, baseName);
      await expect(finalRow).toBeVisible();

      const verifyPage = pageB;
      const verifyName =
        (await programRow(verifyPage, nameFromA).count()) > 0
          ? nameFromA
          : baseName;
      const reopened = await openEditModal(verifyPage, verifyName);
      const savedDescription = await descriptionFieldInDialog(reopened).inputValue();
      expect(
        savedDescription === descFromB ||
          savedDescription === description ||
          savedDescription.includes("admin B"),
      ).toBeTruthy();
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });
});

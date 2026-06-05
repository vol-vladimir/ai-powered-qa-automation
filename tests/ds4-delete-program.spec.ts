import { test, expect } from "../fixtures/cleanup.fixture";
import {
  PROGRAM_DESC_SEED,
  PROGRAM_NAME_SEED,
  createProgram,
  deleteButtonInRow,
  deleteProgramWithConfirm,
  EMPTY_PROGRAMS_MESSAGE,
  expectedDeleteConfirmMessage,
  gotoProgramsPage,
  loginAsAdmin,
  MAX_NAME_100,
  openEditModal,
  programRow,
  programsTable,
  uniqueSuffix,
  openDeleteConfirmDialog,
  triggerDeleteConfirm,
  expectProgramAbsent,
  expectProgramPresent,
} from "./helpers/didaxis-programs";

test.describe("Didaxis Studio — delete program with confirmation (DS-4)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await gotoProgramsPage(page);
  });

  test("TC-001: native confirmation dialog is shown when delete is triggered", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Test Program ${suffix}`;
    await createProgram(page, name, `QA delete confirmation test ${suffix}`);

    const dialog = await openDeleteConfirmDialog(page, name);
    expect(dialog.message).toBe(expectedDeleteConfirmMessage(name));

    await expectProgramPresent(page, name);
  });

  test("TC-002: program is removed from the list after deletion is confirmed", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Test Program ${suffix}`;
    await createProgram(page, name, `QA delete confirm ${suffix}`);

    const dialog = await deleteProgramWithConfirm(page, name);
    expect(dialog.message).toBe(expectedDeleteConfirmMessage(name));

    await expectProgramAbsent(page, name);
  });

  test("TC-003: program remains in the list when deletion is cancelled", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${PROGRAM_NAME_SEED} ${suffix}`;
    const description = `${PROGRAM_DESC_SEED} ${suffix}`;
    await createProgram(page, name, description);

    await deleteProgramWithConfirm(page, name, { accept: false });
    await expectProgramPresent(page, name);
    await expect(programRow(page, name).getByRole("paragraph").nth(1)).toHaveText(
      description,
    );
  });

  test("TC-004: program list reflects deletion immediately without manual refresh", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const toDelete = `Test Program ${suffix}`;
    const toKeep = `${PROGRAM_NAME_SEED} keep ${suffix}`;
    await createProgram(page, toDelete, `Delete immediate refresh ${suffix}`);
    await createProgram(page, toKeep, `${PROGRAM_DESC_SEED} ${suffix}`);

    const rowsBefore = await programsTable(page).getByRole("row").count();
    await deleteProgramWithConfirm(page, toDelete);
    await expectProgramAbsent(page, toDelete);
    await expectProgramPresent(page, toKeep);

    const rowsAfter = await programsTable(page).getByRole("row").count();
    expect(rowsAfter).toBe(rowsBefore - 1);
    await expect(page).toHaveURL(/\/programs/);
  });

  test("TC-005: program is not deleted until OK is clicked on confirmation", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${PROGRAM_NAME_SEED} ${suffix}`;
    await createProgram(page, name, `${PROGRAM_DESC_SEED} ${suffix}`);

    await deleteProgramWithConfirm(page, name, { accept: false });
    await expectProgramPresent(page, name);

    await openDeleteConfirmDialog(page, name);
    await expectProgramPresent(page, name);
  });

  test("TC-006: unauthorized user cannot delete a program", async ({ page }) => {
    test.skip(
      !process.env.DIDAXIS_NONADMIN_EMAIL || !process.env.DIDAXIS_NONADMIN_PASSWORD,
      "Set DIDAXIS_NONADMIN_EMAIL and DIDAXIS_NONADMIN_PASSWORD to run authorization test",
    );
    const suffix = uniqueSuffix();
    const name = `${PROGRAM_NAME_SEED} ${suffix}`;
    await createProgram(page, name, `${PROGRAM_DESC_SEED} ${suffix}`);

    await page.context().clearCookies();
    await page.goto("/login");
    await page
      .getByLabel("Email")
      .fill(process.env.DIDAXIS_NONADMIN_EMAIL!);
    await page
      .getByLabel("Password")
      .fill(process.env.DIDAXIS_NONADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Sign In" }).click();
    await gotoProgramsPage(page);

    const row = programRow(page, name);
    const deleteBtn = deleteButtonInRow(row, name);
    const visible = await deleteBtn.isVisible().catch(() => false);
    if (visible) {
      const deleteRequests: string[] = [];
      page.on("request", (req) => {
        if (req.method() === "DELETE" && /program/i.test(req.url())) {
          deleteRequests.push(req.url());
        }
      });
      const dialogPromise = page.waitForEvent("dialog").catch(() => null);
      await deleteBtn.click();
      const dialog = await dialogPromise;
      if (dialog) {
        await dialog.accept();
      }
      await page.waitForTimeout(2000);
      expect(deleteRequests.length).toBe(0);
    }
    await expectProgramPresent(page, name);
  });

  test("TC-007: program stays in the list when delete API fails after OK", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Test Program ${suffix}`;
    await createProgram(page, name, `API failure delete test ${suffix}`);

    await page.route("**/programs/**", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({ status: 500, body: "Internal Server Error" });
        return;
      }
      await route.continue();
    });

    await deleteProgramWithConfirm(page, name);
    await expectProgramPresent(page, name);
  });

  // Product bug DS-52: rapid double-click blocks delete flow
  test(
    "TC-008: rapid double-click on delete does not cause duplicate DELETE requests",
    async ({ page }) => {
    const suffix = uniqueSuffix();
    const name = `${PROGRAM_NAME_SEED} ${suffix}`;
    await createProgram(page, name, `${PROGRAM_DESC_SEED} ${suffix}`);

    const deleteUrls: string[] = [];
    page.on("request", (req) => {
      if (req.method() === "DELETE" && /program/i.test(req.url())) {
        deleteUrls.push(req.url());
      }
    });

    const row = programRow(page, name);
    const deleteBtn = deleteButtonInRow(row, name);
    const dialogMessages: string[] = [];
    page.on("dialog", async (d) => {
      dialogMessages.push(d.message());
      await d.accept();
    });
    await deleteBtn.click();
    await deleteBtn.click().catch(() => {});

    await expectProgramAbsent(page, name);
    expect(deleteUrls.length).toBeLessThanOrEqual(1);
    expect(dialogMessages.length).toBeLessThanOrEqual(1);
  });

  test("TC-009: deleting a program that no longer exists is handled safely", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Test Program ${suffix}`;
    await createProgram(page, name, `Stale delete test ${suffix}`);

    let deleteCount = 0;
    await page.route("**/programs/**", async (route) => {
      if (route.request().method() === "DELETE") {
        deleteCount += 1;
        if (deleteCount === 1) {
          await route.fulfill({ status: 404, body: JSON.stringify({ error: "Not found" }) });
          return;
        }
      }
      await route.continue();
    });

    await deleteProgramWithConfirm(page, name);
    await page.waitForTimeout(1500);
    const stillVisible = (await programRow(page, name).count()) > 0;
    const hasError = await page
      .getByText(/not found|error|failed/i)
      .isVisible()
      .catch(() => false);
    expect(stillVisible || hasError).toBeTruthy();
  });

  test("TC-010: program with special characters in name is deleted successfully", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Informatique & IA - Niveau 2 ${suffix}`;
    await createProgram(
      page,
      name,
      `Programme bilingue — parcours Informatique et IA ${suffix}`,
    );

    const dialog = await triggerDeleteConfirm(page, name, { accept: true });
    expect(dialog.message).toContain("Informatique & IA - Niveau 2");
    await expectProgramAbsent(page, name);
  });

  test("TC-011: program with maximum-length name (100 characters) is deleted", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${MAX_NAME_100.slice(0, 88)}${suffix}`.slice(0, 100);
    await createProgram(page, name, `Max length delete test ${suffix}`);

    await deleteProgramWithConfirm(page, name);
    await expectProgramAbsent(page, name);
  });

  test("TC-012: deleting the last program shows the empty state", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Test Program ${suffix}`;
    await createProgram(page, name, `Last program empty state ${suffix}`);

    const dataRows = await programsTable(page)
      .getByRole("row")
      .filter({ has: page.getByRole("paragraph") })
      .count();
    if (dataRows > 1) {
      test.skip(true, "Other programs exist in org; cannot assert sole-program empty state");
    }

    await deleteProgramWithConfirm(page, name);
    await expect(page.getByText(EMPTY_PROGRAMS_MESSAGE)).toBeVisible({
      timeout: 20_000,
    });
  });

  test("TC-013: deleted program does not reappear after browser refresh", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Test Program ${suffix}`;
    await createProgram(page, name, `Refresh persistence ${suffix}`);

    await deleteProgramWithConfirm(page, name);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Programs" })).toBeVisible();
    await expectProgramAbsent(page, name);
  });

  test("TC-014: only the targeted program row is deleted when multiple exist", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const keep = `${PROGRAM_NAME_SEED} ${suffix}`;
    const remove = `Data Science 2026 ${suffix}`;
    await createProgram(page, keep, `${PROGRAM_DESC_SEED} ${suffix}`);
    await createProgram(page, remove, `Data science cohort ${suffix}`);

    await deleteProgramWithConfirm(page, remove);
    await expectProgramAbsent(page, remove);
    await expectProgramPresent(page, keep);
  });

  test("TC-015: confirmation dialog warns about cascade deletion", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${PROGRAM_NAME_SEED} ${suffix}`;
    await createProgram(page, name, `${PROGRAM_DESC_SEED} ${suffix}`);

    const dialog = await openDeleteConfirmDialog(page, name);
    expect(dialog.message).toMatch(/semesters and courses will be removed/i);
    expect(dialog.message).toMatch(/cannot be undone/i);
    await expectProgramPresent(page, name);
  });

  test("TC-016: multiple sequential deletions update the list after each confirm", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const a = `Test Program A ${suffix}`;
    const b = `Test Program B ${suffix}`;
    const c = `Test Program C ${suffix}`;
    await createProgram(page, a, `Seq delete A ${suffix}`);
    await createProgram(page, b, `Seq delete B ${suffix}`);
    await createProgram(page, c, `Seq delete C ${suffix}`);

    await deleteProgramWithConfirm(page, a);
    await expectProgramAbsent(page, a);
    await expectProgramPresent(page, b);
    await expectProgramPresent(page, c);

    await deleteProgramWithConfirm(page, b);
    await expectProgramAbsent(page, b);
    await expectProgramPresent(page, c);

    await deleteProgramWithConfirm(page, c);
    await expectProgramAbsent(page, c);
  });

  test("TC-017: delete control is present on each program row", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const names = [
      `Test Program X ${suffix}`,
      `Test Program Y ${suffix}`,
      `Test Program Z ${suffix}`,
    ];
    for (const n of names) {
      await createProgram(page, n, `Row delete affordance ${suffix}`);
    }

    for (const n of names) {
      await expect(deleteButtonInRow(programRow(page, n), n)).toBeVisible();
    }

    await deleteProgramWithConfirm(page, names[0], { accept: false });
    for (const n of names) {
      await expectProgramPresent(page, n);
    }
  });

  test("TC-018: delete while Edit Program modal is open for another program", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const editing = `${PROGRAM_NAME_SEED} ${suffix}`;
    const target = `Data Science 2026 ${suffix}`;
    await createProgram(page, editing, `${PROGRAM_DESC_SEED} ${suffix}`);
    await createProgram(page, target, `Interaction boundary ${suffix}`);

    const editDialog = await openEditModal(page, editing);
    await expect(editDialog).toBeVisible();

    const deleteBtn = deleteButtonInRow(programRow(page, target), target);
    const canDeleteWhileEditOpen = await deleteBtn
      .isVisible()
      .then(async (v) => {
        if (!v) return false;
        const dialogPromise = page
          .waitForEvent("dialog", { timeout: 3000 })
          .catch(() => null);
        await deleteBtn.click({ force: true });
        const dialog = await dialogPromise;
        if (dialog) {
          await dialog.dismiss();
        }
        return true;
      })
      .catch(() => false);

    if (canDeleteWhileEditOpen) {
      await expect(editDialog).toBeVisible();
      await expectProgramPresent(page, target);
      await expectProgramPresent(page, editing);
    } else {
      await expect(editDialog).toBeVisible();
      await expectProgramPresent(page, target);
    }
  });
});

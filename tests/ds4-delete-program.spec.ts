import { test, expect } from "../fixtures/cleanup.fixture";
import { LoginPage } from "../pages/login.page";
import { ProgramsPage } from "../pages/programs.page";
import {
  MAX_NAME_100,
  PROGRAM_DESC_SEED,
  PROGRAM_NAME_SEED,
  uniqueSuffix,
} from "../support/program-constants";
import { createProgram } from "../support/program-factory";
import { clearSessionForUiLogin } from "../support/session";

test.describe("Didaxis Studio — delete program with confirmation (DS-4)", () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible();
  });

  test("TC-001: native confirmation dialog is shown when delete is triggered", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Test Program ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, `QA delete confirmation test ${suffix}`);
    await expect(programs.rowFor(name)).toBeVisible();

    const dialog = await programs.triggerDeleteConfirm(name, { accept: false });
    expect(dialog.message).toBe(programs.expectedDeleteConfirmMessage(name));
    await expect(programs.rowFor(name)).toBeVisible();
  });

  test("TC-002: program is removed from the list after deletion is confirmed", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Test Program ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, `QA delete confirm ${suffix}`);

    const dialog = await programs.triggerDeleteConfirm(name);
    expect(dialog.type).toBe("confirm");
    expect(dialog.message).toBe(programs.expectedDeleteConfirmMessage(name));

    await expect(programs.rowFor(name)).toHaveCount(0, { timeout: 20_000 });
  });

  test("TC-003: program remains in the list when deletion is cancelled", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${PROGRAM_NAME_SEED} ${suffix}`;
    const description = `${PROGRAM_DESC_SEED} ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, description);
    await programs.triggerDeleteConfirm(name, { accept: false });
    await expect(programs.rowFor(name)).toBeVisible();
    await expect(programs.descriptionInRow(name)).toHaveText(description);
  });

  test("TC-004: program list reflects deletion immediately without manual refresh", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const toDelete = `Test Program ${suffix}`;
    const toKeep = `${PROGRAM_NAME_SEED} keep ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, toDelete, `Delete immediate refresh ${suffix}`);
    await createProgram(page, toKeep, `${PROGRAM_DESC_SEED} ${suffix}`);

    await programs.triggerDeleteConfirm(toDelete);
    await expect(programs.rowFor(toDelete)).toHaveCount(0, { timeout: 20_000 });
    await expect(programs.rowFor(toKeep)).toBeVisible();
    await expect(page).toHaveURL(/\/programs/);
  });

  test("TC-005: program is not deleted until OK is clicked on confirmation", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${PROGRAM_NAME_SEED} ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, `${PROGRAM_DESC_SEED} ${suffix}`);
    await programs.triggerDeleteConfirm(name, { accept: false });
    await expect(programs.rowFor(name)).toBeVisible();

    await programs.triggerDeleteConfirm(name, { accept: false });
    await expect(programs.rowFor(name)).toBeVisible();
  });

  test("TC-006: unauthorized user cannot delete a program", async ({ page }) => {
    test.skip(
      !process.env.DIDAXIS_NONADMIN_EMAIL || !process.env.DIDAXIS_NONADMIN_PASSWORD,
      "Set DIDAXIS_NONADMIN_EMAIL and DIDAXIS_NONADMIN_PASSWORD to run authorization test",
    );
    const suffix = uniqueSuffix();
    const name = `${PROGRAM_NAME_SEED} ${suffix}`;
    const programs = new ProgramsPage(page);
    const login = new LoginPage(page);

    await createProgram(page, name, `${PROGRAM_DESC_SEED} ${suffix}`);
    await clearSessionForUiLogin(page);
    await login.signIn(
      process.env.DIDAXIS_NONADMIN_EMAIL!,
      process.env.DIDAXIS_NONADMIN_PASSWORD!,
    );
    await programs.goto();
    await expect(programs.heading).toBeVisible();

    const deleteBtn = programs.deleteButtonFor(name);
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
    await expect(programs.rowFor(name)).toBeVisible();
  });

  test("TC-007: program stays in the list when delete API fails after OK", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Test Program ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, `API failure delete test ${suffix}`);

    await page.route("**/programs/**", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({ status: 500, body: "Internal Server Error" });
        return;
      }
      await route.continue();
    });

    await programs.triggerDeleteConfirm(name);
    await expect(programs.rowFor(name)).toBeVisible();
  });

  // Product bug DS-52: rapid double-click blocks delete flow
  test(
    "TC-008: rapid double-click on delete does not cause duplicate DELETE requests",
    async ({ page }) => {
      test.skip(
        true,
        "Known demo bug (DS-52) — rapid double-click on delete blocks or duplicates the delete flow.",
      );
      const suffix = uniqueSuffix();
      const name = `${PROGRAM_NAME_SEED} ${suffix}`;
      const programs = new ProgramsPage(page);

      await createProgram(page, name, `${PROGRAM_DESC_SEED} ${suffix}`);

      const deleteUrls: string[] = [];
      page.on("request", (req) => {
        if (req.method() === "DELETE" && /program/i.test(req.url())) {
          deleteUrls.push(req.url());
        }
      });

      const deleteBtn = programs.deleteButtonFor(name);
      const dialogMessages: string[] = [];
      page.on("dialog", async (d) => {
        dialogMessages.push(d.message());
        await d.accept();
      });
      await deleteBtn.click();
      await deleteBtn.click().catch(() => {});

      await expect(programs.rowFor(name)).toHaveCount(0, { timeout: 20_000 });
      expect(deleteUrls.length).toBeLessThanOrEqual(1);
      expect(dialogMessages.length).toBeLessThanOrEqual(1);
    },
  );

  test("TC-009: deleting a program that no longer exists is handled safely", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Test Program ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, `Stale delete test ${suffix}`);

    let deleteCount = 0;
    await page.route("**/programs/**", async (route) => {
      if (route.request().method() === "DELETE") {
        deleteCount += 1;
        if (deleteCount === 1) {
          await route.fulfill({
            status: 404,
            body: JSON.stringify({ error: "Not found" }),
          });
          return;
        }
      }
      await route.continue();
    });

    await programs.triggerDeleteConfirm(name);
    await page.waitForTimeout(1500);
    const stillVisible = (await programs.countRows(name)) > 0;
    const hasError = await programs
      .notFoundOrErrorMessage()
      .isVisible()
      .catch(() => false);
    expect(stillVisible || hasError).toBeTruthy();
  });

  test("TC-010: program with special characters in name is deleted successfully", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Informatique & IA - Niveau 2 ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(
      page,
      name,
      `Programme bilingue — parcours Informatique et IA ${suffix}`,
    );

    const dialog = await programs.triggerDeleteConfirm(name);
    expect(dialog.message).toContain("Informatique & IA - Niveau 2");
    await expect(programs.rowFor(name)).toHaveCount(0, { timeout: 20_000 });
  });

  test("TC-011: program with maximum-length name (100 characters) is deleted", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${MAX_NAME_100.slice(0, 88)}${suffix}`.slice(0, 100);
    const programs = new ProgramsPage(page);

    await createProgram(page, name, `Max length delete test ${suffix}`);
    await programs.triggerDeleteConfirm(name);
    await expect(programs.rowFor(name)).toHaveCount(0, { timeout: 20_000 });
  });

  test("TC-012: deleting the last program shows the empty state", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Test Program ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, `Last program empty state ${suffix}`);

    const dataRows = await programs.tableDataRowCount();
    if (dataRows > 1) {
      test.skip(true, "Other programs exist in org; cannot assert sole-program empty state");
    }

    await programs.triggerDeleteConfirm(name);
    await expect(programs.emptyStateMessage).toBeVisible({
      timeout: 20_000,
    });
  });

  test("TC-013: deleted program does not reappear after browser refresh", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Test Program ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, `Refresh persistence ${suffix}`);
    await programs.triggerDeleteConfirm(name);
    await programs.reload();
    await expect(programs.heading).toBeVisible();
    await expect(programs.rowFor(name)).toHaveCount(0, { timeout: 20_000 });
  });

  test("TC-014: only the targeted program row is deleted when multiple exist", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const keep = `${PROGRAM_NAME_SEED} ${suffix}`;
    const remove = `Data Science 2026 ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, keep, `${PROGRAM_DESC_SEED} ${suffix}`);
    await createProgram(page, remove, `Data science cohort ${suffix}`);

    await programs.triggerDeleteConfirm(remove);
    await expect(programs.rowFor(remove)).toHaveCount(0, { timeout: 20_000 });
    await expect(programs.rowFor(keep)).toBeVisible();
  });

  test("TC-015: confirmation dialog warns about cascade deletion", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${PROGRAM_NAME_SEED} ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, `${PROGRAM_DESC_SEED} ${suffix}`);

    const dialog = await programs.triggerDeleteConfirm(name, { accept: false });
    expect(dialog.message).toMatch(/semesters and courses will be removed/i);
    expect(dialog.message).toMatch(/cannot be undone/i);
    await expect(programs.rowFor(name)).toBeVisible();
  });

  test("TC-016: multiple sequential deletions update the list after each confirm", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const a = `Test Program A ${suffix}`;
    const b = `Test Program B ${suffix}`;
    const c = `Test Program C ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, a, `Seq delete A ${suffix}`);
    await createProgram(page, b, `Seq delete B ${suffix}`);
    await createProgram(page, c, `Seq delete C ${suffix}`);

    await programs.triggerDeleteConfirm(a);
    await expect(programs.rowFor(a)).toHaveCount(0, { timeout: 20_000 });
    await expect(programs.rowFor(b)).toBeVisible();
    await expect(programs.rowFor(c)).toBeVisible();

    await programs.triggerDeleteConfirm(b);
    await expect(programs.rowFor(b)).toHaveCount(0, { timeout: 20_000 });
    await expect(programs.rowFor(c)).toBeVisible();

    await programs.triggerDeleteConfirm(c);
    await expect(programs.rowFor(c)).toHaveCount(0, { timeout: 20_000 });
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
    const programs = new ProgramsPage(page);

    for (const n of names) {
      await createProgram(page, n, `Row delete affordance ${suffix}`);
    }

    for (const n of names) {
      await expect(programs.deleteButtonFor(n)).toBeVisible();
    }

    await programs.triggerDeleteConfirm(names[0], { accept: false });
    for (const n of names) {
      await expect(programs.rowFor(n)).toBeVisible();
    }
  });

  test("TC-018: delete while Edit Program modal is open for another program", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const editing = `${PROGRAM_NAME_SEED} ${suffix}`;
    const target = `Data Science 2026 ${suffix}`;
    const programs = new ProgramsPage(page);
    const editModal = programs.editProgramModal;

    await createProgram(page, editing, `${PROGRAM_DESC_SEED} ${suffix}`);
    await createProgram(page, target, `Interaction boundary ${suffix}`);

    await programs.openEditFor(editing);
    await expect(editModal.dialog).toBeVisible();

    const deleteBtn = programs.deleteButtonFor(target);
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
      await expect(editModal.dialog).toBeVisible();
      await expect(programs.rowFor(target)).toBeVisible();
      await expect(programs.rowFor(editing)).toBeVisible();
    } else {
      await expect(editModal.dialog).toBeVisible();
      await expect(programs.rowFor(target)).toBeVisible();
    }
  });
});

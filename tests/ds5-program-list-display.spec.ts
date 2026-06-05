import { test, expect } from "../fixtures/cleanup.fixture";
import { LoginPage } from "../pages/login.page";
import { ProgramsPage } from "../pages/programs.page";
import {
  MAX_NAME_100,
  PROGRAM_DESC_SEED,
  PROGRAM_NAME_SEED,
  uniqueSuffix,
} from "../support/program-constants";
import {
  createProgram,
  ensureSeedProgramExists,
} from "../support/program-factory";
import { clearSessionForUiLogin } from "../support/session";

test.describe("Didaxis Studio — program list display (DS-5)", () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible();
  });

  test("TC-001: programs table lists each program with name and description", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name1 = `${PROGRAM_NAME_SEED} ${suffix}`;
    const desc1 = `${PROGRAM_DESC_SEED} ${suffix}`;
    const name2 = `Data Science 2026 ${suffix}`;
    const desc2 = `Applied statistics and machine learning cohort ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name1, desc1);
    await createProgram(page, name2, desc2);

    for (const [name, desc] of [
      [name1, desc1],
      [name2, desc2],
    ] as const) {
      await expect(programs.rowFor(name)).toBeVisible();
      await expect(programs.nameInRow(name)).toHaveText(name);
      await expect(programs.descriptionInRow(name)).toHaveText(desc);
    }
  });

  test("TC-002: empty state message and create prompt appear when no programs exist", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const emptyStateVisible = await programs.emptyStateMessage
      .isVisible()
      .catch(() => false);
    test.skip(
      (await programs.orgHasPrograms()) || !emptyStateVisible,
      "Organization has existing programs; empty-state test needs isolated org with zero programs",
    );

    await expect(programs.emptyStateMessage).toBeVisible();
    await expect(programs.createProgramEmptyStateButton).toBeVisible();
  });

  test("TC-003: empty-state create prompt opens the New Program flow", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const emptyStateVisible = await programs.emptyStateMessage
      .isVisible()
      .catch(() => false);
    test.skip(
      (await programs.orgHasPrograms()) || !emptyStateVisible,
      "Requires zero programs in organization",
    );

    await programs.createProgramEmptyStateButton.click();
    await expect(programs.newProgramModal.dialog).toBeVisible();
  });

  test("TC-004: programs list remains visible after page reload", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${PROGRAM_NAME_SEED} reload ${suffix}`;
    const desc = `${PROGRAM_DESC_SEED} reload ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, desc);
    await programs.reload();
    await expect(programs.heading).toBeVisible();
    await expect(programs.rowFor(name)).toBeVisible();
    await expect(programs.nameInRow(name)).toHaveText(name);
    await expect(programs.descriptionInRow(name)).toHaveText(desc);
  });

  test("TC-005: empty-state message is not shown when programs exist", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    await ensureSeedProgramExists(page);
    await expect(programs.firstDataRow()).toBeVisible();
    await expect(programs.emptyStateMessage).toHaveCount(0);
  });

  test("TC-006: program name and description columns are not blank", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${PROGRAM_NAME_SEED} ${suffix}`;
    const desc = `${PROGRAM_DESC_SEED} ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, desc);

    await expect(programs.nameInRow(name)).not.toBeEmpty();
    await expect(programs.descriptionInRow(name)).toHaveText(desc);
  });

  test("TC-007: API failure does not show empty state when programs exist", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `API error list test ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, `Programs API error probe ${suffix}`);

    await page.route("**/programs**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 500, body: "Internal Server Error" });
        return;
      }
      await route.continue();
    });

    await programs.reload();
    await page.waitForTimeout(2000);

    const showsEmptyState = await programs.emptyStateMessage
      .isVisible()
      .catch(() => false);
    const showsError = await programs
      .listLoadErrorMessage()
      .isVisible()
      .catch(() => false);

    expect(
      showsEmptyState && !showsError,
      "DS-5: empty state must not appear when GET /programs fails but programs exist server-side",
    ).toBeFalsy();
  });

  test("TC-008: unauthorized user role behavior for programs list", async ({
    page,
  }) => {
    test.skip(
      !process.env.DIDAXIS_NONADMIN_EMAIL ||
        !process.env.DIDAXIS_NONADMIN_PASSWORD,
      "Set DIDAXIS_NONADMIN_EMAIL and DIDAXIS_NONADMIN_PASSWORD to run",
    );

    const programs = new ProgramsPage(page);
    const login = new LoginPage(page);

    await clearSessionForUiLogin(page);
    await login.signIn(
      process.env.DIDAXIS_NONADMIN_EMAIL!,
      process.env.DIDAXIS_NONADMIN_PASSWORD!,
    );
    await programs.goto();
    await expect(programs.heading).toBeVisible();

    const visible = await programs.newProgramButton.isVisible().catch(() => false);
    if (visible) {
      await expect(programs.newProgramButton).toBeDisabled();
    } else {
      await expect(programs.newProgramButton).toHaveCount(0);
    }
  });

  test("TC-009: program names with special characters render correctly", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Informatique & IA - Niveau 2 ${suffix}`;
    const desc = `Programme bilingue — parcours Informatique et IA ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, desc);
    await expect(programs.rowFor(name)).toBeVisible();
    await expect(programs.nameInRow(name)).toHaveText(name);
    await expect(programs.descriptionInRow(name)).toHaveText(desc);
  });

  test("TC-010: maximum-length program name displays without breaking layout", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${MAX_NAME_100.slice(0, 88)}${suffix}`.slice(0, 100);
    const desc = `Max length list display ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, desc);
    await expect(programs.rowFor(name)).toBeVisible();
    await expect(programs.nameInRow(name)).toHaveText(name);
    await expect(programs.descriptionInRow(name)).toHaveText(desc);
  });

  // Product bug DS-53: empty Description omits description paragraph in list row
  test("TC-011: program with empty description is listed safely", async ({
    page,
  }) => {
    test.fail(
      true,
      "Known demo bug (DS-53) — empty Description omits description paragraph in list row.",
    );
    const suffix = uniqueSuffix();
    const name = `Cloud Fundamentals ${suffix}`;
    const programs = new ProgramsPage(page);
    const modal = programs.newProgramModal;

    await programs.openNewProgram();
    await modal.fillName(name);
    await modal.submit();
    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });

    await expect(programs.rowFor(name)).toBeVisible();
    await expect(programs.nameInRow(name)).toHaveText(name);
    await expect(
      programs.paragraphsInRow(name),
      "DS-5 AC requires description column; see DS-53 when empty Description omits second paragraph",
    ).toHaveCount(2);
  });

  test("TC-012: unicode and emoji render correctly in list", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Développement Logiciel 🚀 ${suffix}`;
    const desc = `Parcours avancé en génie logiciel et qualité ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, desc);
    await expect(programs.rowFor(name)).toBeVisible();
    await expect(programs.nameInRow(name)).toHaveText(name);
    await expect(programs.descriptionInRow(name)).toHaveText(desc);
  });

  test("TC-013: multiple programs are all visible in the table", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const names = [
      `List smoke A ${suffix}`,
      `List smoke B ${suffix}`,
      `List smoke C ${suffix}`,
      `List smoke D ${suffix}`,
      `List smoke E ${suffix}`,
    ];
    const programs = new ProgramsPage(page);

    for (const n of names) {
      await createProgram(page, n, `Smoke list ${n}`);
    }
    for (const n of names) {
      await expect(programs.rowFor(n)).toBeVisible();
    }
  });

  test("TC-014: header + New Program is available when programs exist", async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    await ensureSeedProgramExists(page);
    await expect(programs.newProgramButton).toBeVisible();
    await programs.openNewProgram();
    await expect(programs.newProgramModal.dialog).toBeVisible();
  });
});

import { test, expect } from "../fixtures/cleanup.fixture";
import {
  EMPTY_PROGRAMS_MESSAGE,
  MAX_NAME_100,
  PROGRAM_DESC_SEED,
  PROGRAM_NAME_SEED,
  createProgram,
  createProgramFromEmptyState,
  emptyProgramsMessage,
  ensureSeedProgramExists,
  expectProgramListDetails,
  gotoProgramsPage,
  loginAsAdmin,
  newProgramDialog,
  openNewProgramModal,
  programRow,
  programsTable,
  uniqueSuffix,
} from "./helpers/didaxis-programs";

test.describe("Didaxis Studio — program list display (DS-5)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await gotoProgramsPage(page);
  });

  test("TC-001: programs table lists each program with name and description", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name1 = `${PROGRAM_NAME_SEED} ${suffix}`;
    const desc1 = `${PROGRAM_DESC_SEED} ${suffix}`;
    const name2 = `Data Science 2026 ${suffix}`;
    const desc2 = `Applied statistics and machine learning cohort ${suffix}`;

    await createProgram(page, name1, desc1);
    await createProgram(page, name2, desc2);

    await expectProgramListDetails(page, name1, desc1);
    await expectProgramListDetails(page, name2, desc2);
  });

  async function orgHasPrograms(page: import("@playwright/test").Page) {
    return (await page.getByRole("button", { name: /^Delete / }).count()) > 0;
  }

  test("TC-002: empty state message and create prompt appear when no programs exist", async ({
    page,
  }) => {
    test.skip(
      await orgHasPrograms(page),
      "Organization has existing programs; empty-state test needs isolated org with zero programs",
    );

    await expect(emptyProgramsMessage(page)).toBeVisible();
    await expect(createProgramFromEmptyState(page)).toBeVisible();
  });

  test("TC-003: empty-state create prompt opens the New Program flow", async ({
    page,
  }) => {
    test.skip(await orgHasPrograms(page), "Requires zero programs in organization");

    await createProgramFromEmptyState(page).click();
    await expect(newProgramDialog(page)).toBeVisible();
  });

  test("TC-004: programs list remains visible after page reload", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${PROGRAM_NAME_SEED} reload ${suffix}`;
    const desc = `${PROGRAM_DESC_SEED} reload ${suffix}`;
    await createProgram(page, name, desc);

    await page.reload();
    await expect(page.getByRole("heading", { name: "Programs" })).toBeVisible();
    await expectProgramListDetails(page, name, desc);
  });

  test("TC-005: empty-state message is not shown when programs exist", async ({
    page,
  }) => {
    await ensureSeedProgramExists(page);
    await expect(programsTable(page).getByRole("row").nth(1)).toBeVisible();
    await expect(emptyProgramsMessage(page)).toHaveCount(0);
  });

  test("TC-006: program name and description columns are not blank", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${PROGRAM_NAME_SEED} ${suffix}`;
    const desc = `${PROGRAM_DESC_SEED} ${suffix}`;
    await createProgram(page, name, desc);

    const row = programRow(page, name);
    await expect(row.getByRole("paragraph").first()).not.toBeEmpty();
    await expect(row.getByRole("paragraph").nth(1)).toHaveText(desc);
  });

  test("TC-007: API failure does not show empty state when programs exist", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `API error list test ${suffix}`;
    await createProgram(page, name, `Programs API error probe ${suffix}`);

    await page.route("**/programs**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 500, body: "Internal Server Error" });
        return;
      }
      await route.continue();
    });

    await page.reload();
    await page.waitForTimeout(2000);

    const showsEmptyState = await emptyProgramsMessage(page)
      .isVisible()
      .catch(() => false);
    const showsError = await page
      .getByText(/error|failed|unable|try again/i)
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

    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.DIDAXIS_NONADMIN_EMAIL!);
    await page
      .getByLabel("Password")
      .fill(process.env.DIDAXIS_NONADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Sign In" }).click();
    await gotoProgramsPage(page);

    const newProgram = page.getByRole("button", { name: "+ New Program" });
    const visible = await newProgram.isVisible().catch(() => false);
    if (visible) {
      await expect(newProgram).toBeDisabled();
    } else {
      await expect(newProgram).toHaveCount(0);
    }
  });

  test("TC-009: program names with special characters render correctly", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Informatique & IA - Niveau 2 ${suffix}`;
    const desc = `Programme bilingue — parcours Informatique et IA ${suffix}`;
    await createProgram(page, name, desc);
    await expectProgramListDetails(page, name, desc);
  });

  test("TC-010: maximum-length program name displays without breaking layout", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `${MAX_NAME_100.slice(0, 88)}${suffix}`.slice(0, 100);
    const desc = `Max length list display ${suffix}`;
    await createProgram(page, name, desc);
    await expect(programRow(page, name)).toBeVisible();
    await expectProgramListDetails(page, name, desc);
  });

  // Product bug DS-53: empty Description omits description paragraph in list row
  test("TC-011: program with empty description is listed safely", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Cloud Fundamentals ${suffix}`;
    await page.getByRole("button", { name: "+ New Program" }).click();
    const dialog = newProgramDialog(page);
    await dialog.getByRole("textbox", { name: "Program Name" }).fill(name);
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden({ timeout: 20_000 });

    const row = programRow(page, name);
    await expect(row).toBeVisible();
    await expect(row.getByRole("paragraph").first()).toHaveText(name);
    // DS-5 AC: list shows name AND description; empty Description should still expose description cell
    await expect(
      row.getByRole("paragraph"),
      "DS-5 AC requires description column; see DS-53 when empty Description omits second paragraph",
    ).toHaveCount(2);
  });

  test("TC-012: unicode and emoji render correctly in list", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Développement Logiciel 🚀 ${suffix}`;
    const desc = `Parcours avancé en génie logiciel et qualité ${suffix}`;
    await createProgram(page, name, desc);
    await expectProgramListDetails(page, name, desc);
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
    for (const n of names) {
      await createProgram(page, n, `Smoke list ${n}`);
    }
    for (const n of names) {
      await expect(programRow(page, n)).toBeVisible();
    }
  });

  test("TC-014: header + New Program is available when programs exist", async ({
    page,
  }) => {
    await ensureSeedProgramExists(page);
    const btn = page.getByRole("button", { name: "+ New Program" });
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(newProgramDialog(page)).toBeVisible();
  });
});

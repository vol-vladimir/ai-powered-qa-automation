import { test, expect } from "../fixtures/cleanup.fixture";
import { ProgramsPage } from "../pages/programs.page";
import { uniqueSuffix } from "../support/program-constants";
import { createProgram } from "../support/program-factory";

test.describe("Didaxis Studio — program semester panel (discovered)", () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible();
  });

  test("TC-001: selecting a program reveals the semester panel", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const name = `Semester Panel Alpha ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, name, `Semester panel selection test ${suffix}`);
    await expect(programs.selectProgramHint).toBeVisible();

    await programs.selectProgram(name);

    await expect(programs.selectProgramHint).toHaveCount(0);
    await expect(programs.semestersConfigLabel).toBeVisible();
    await expect(programs.newSemesterButton).toBeVisible();
    await expect(programs.semesterPanelHeading(name)).toBeVisible();
    await expect(programs.noSemestersMessage).toBeVisible();
  });

  test("TC-002: switching selection updates the semester panel", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const alpha = `Semester Panel Alpha ${suffix}`;
    const beta = `Semester Panel Beta ${suffix}`;
    const programs = new ProgramsPage(page);

    await createProgram(page, alpha, `Alpha semester panel ${suffix}`);
    await createProgram(page, beta, `Beta semester panel ${suffix}`);

    await programs.selectProgram(alpha);
    await expect(programs.semesterPanelHeading(alpha)).toBeVisible();

    await programs.selectProgram(beta);

    await expect(programs.semesterPanelHeading(beta)).toBeVisible();
    await expect(programs.semesterPanelHeading(alpha)).toHaveCount(0);
    await expect(programs.semestersConfigLabel).toBeVisible();
    await expect(programs.newSemesterButton).toBeVisible();
  });
});

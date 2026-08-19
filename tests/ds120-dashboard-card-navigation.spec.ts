import { test, expect } from "../fixtures/cleanup.fixture";
import { AiAssistPage } from "../pages/ai-assist.page";
import { CalendarPage } from "../pages/calendar.page";
import { DashboardPage } from "../pages/dashboard.page";
import { ProgramsPage } from "../pages/programs.page";
import { ValidationPage } from "../pages/validation.page";

test.describe("Didaxis Studio — dashboard card navigation regression (DS-120)", () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.heading).toBeVisible();
  });

  test("TC-001: Programs dashboard card navigates to /programs", { tag: "@e2e" }, async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    const programs = new ProgramsPage(page);

    await dashboard.cards.openPrograms();

    await expect(page).toHaveURL(/\/programs$/);
    await expect(programs.heading).toBeVisible();
  });

  test("TC-002: Calendar dashboard card navigates to /calendar", { tag: "@e2e" }, async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    const calendar = new CalendarPage(page);

    await dashboard.cards.openCalendar();

    await expect(page).toHaveURL(/\/calendar$/);
    await expect(calendar.heading).toBeVisible();
  });

  test("TC-003: Validation dashboard card navigates to /validation", { tag: "@e2e" }, async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    const validation = new ValidationPage(page);

    await dashboard.cards.openValidation();

    await expect(page).toHaveURL(/\/validation$/);
    await expect(validation.heading).toBeVisible();
  });

  test("TC-004: AI Assist dashboard card navigates to /cli", { tag: "@e2e" }, async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    const aiAssist = new AiAssistPage(page);

    await dashboard.cards.openAiAssist();

    await expect(page).toHaveURL(/\/cli$/);
    await expect(aiAssist.heading).toBeVisible();
  });
});

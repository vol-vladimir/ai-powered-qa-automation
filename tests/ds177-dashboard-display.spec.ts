import { test, expect } from "../fixtures/cleanup.fixture";
import { AiAssistPage } from "../pages/ai-assist.page";
import { CalendarPage } from "../pages/calendar.page";
import { DashboardPage } from "../pages/dashboard.page";
import { ProgramsPage } from "../pages/programs.page";
import { ValidationPage } from "../pages/validation.page";

test.describe("Didaxis Studio — dashboard display and navigation (DS-177)", () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.heading).toBeVisible();
  });

  test("TC-001: Dashboard shows Programs, Calendar, Validation, and AI Assist blocks", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);

    await expect(dashboard.welcomeMessage).toBeVisible();
    await expect.soft(dashboard.cards.programsCard).toBeVisible();
    await expect.soft(dashboard.cards.calendarCard).toBeVisible();
    await expect.soft(dashboard.cards.validationCard).toBeVisible();
    await expect.soft(dashboard.cards.aiAssistCard).toBeVisible();
  });

  test("TC-002: Programs card navigates to Programs page", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const programs = new ProgramsPage(page);

    await dashboard.cards.openPrograms();

    await expect(page).toHaveURL(/\/programs$/);
    await expect(programs.heading).toBeVisible();
  });

  test("TC-003: Calendar card navigates to Calendar page", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const calendar = new CalendarPage(page);

    await dashboard.cards.openCalendar();

    await expect(page).toHaveURL(/\/calendar$/);
    await expect(calendar.heading).toBeVisible();
  });

  test("TC-004: Validation card navigates to Validation page", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    const validation = new ValidationPage(page);

    await dashboard.cards.openValidation();

    await expect(page).toHaveURL(/\/validation$/);
    await expect(validation.heading).toBeVisible();
  });

  test("TC-005: AI Assist card navigates to AI Assist page", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    const aiAssist = new AiAssistPage(page);

    await dashboard.cards.openAiAssist();

    await expect(page).toHaveURL(/\/cli$/);
    await expect(aiAssist.heading).toBeVisible();
  });
});

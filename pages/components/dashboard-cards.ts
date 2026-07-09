import type { Locator, Page } from "@playwright/test";

/** Dashboard cards are Mantine Paper tiles — not button/link roles. Scope to SimpleGrid. */
export class DashboardCards {
  readonly grid: Locator;
  readonly programsCard: Locator;
  readonly calendarCard: Locator;
  readonly validationCard: Locator;
  readonly aiAssistCard: Locator;

  constructor(page: Page) {
    this.grid = page.locator(".mantine-SimpleGrid-root");
    this.programsCard = this.grid.getByText("Programs", { exact: true });
    this.calendarCard = this.grid.getByText("Calendar", { exact: true });
    this.validationCard = this.grid.getByText("Validation", { exact: true });
    this.aiAssistCard = this.grid.getByText("AI Assist", { exact: true });
  }

  async openPrograms() {
    await this.programsCard.click();
  }

  async openCalendar() {
    await this.calendarCard.click();
  }

  async openValidation() {
    await this.validationCard.click();
  }

  async openAiAssist() {
    await this.aiAssistCard.click();
  }
}

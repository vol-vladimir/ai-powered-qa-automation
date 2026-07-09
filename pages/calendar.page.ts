import type { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class CalendarPage extends BasePage {
  readonly heading;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Calendar" });
  }

  async goto() {
    await this.navigateTo("/calendar");
  }
}

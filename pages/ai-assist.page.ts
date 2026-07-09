import type { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class AiAssistPage extends BasePage {
  readonly heading;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "AI Assist" });
  }

  async goto() {
    await this.navigateTo("/cli");
  }
}

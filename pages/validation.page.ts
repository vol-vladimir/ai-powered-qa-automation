import type { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class ValidationPage extends BasePage {
  readonly heading;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Validation" });
  }

  async goto() {
    await this.navigateTo("/validation");
  }
}

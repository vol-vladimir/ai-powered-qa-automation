import type { Page } from "@playwright/test";
import { AppNavigation } from "./components/app-navigation";

/**
 * Shared base for all Didaxis page objects.
 * Navigation uses Playwright baseURL (DIDAXIS_URL) — never hardcode the host here.
 */
export class BasePage {
  readonly nav: AppNavigation;

  constructor(protected readonly page: Page) {
    this.nav = new AppNavigation(page);
  }

  protected async navigateTo(path: string) {
    await this.page.goto(path);
  }

  async reload() {
    await this.page.reload();
  }
}

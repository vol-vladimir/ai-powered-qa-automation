import type { Page } from "@playwright/test";

export class AppNavigation {
  readonly dashboardButton;
  readonly programsButton;
  readonly calendarButton;
  readonly settingsButton;
  readonly signOutButton;

  constructor(private readonly page: Page) {
    this.dashboardButton = page.getByRole("button", { name: "📊 Dashboard" });
    this.programsButton = page.getByRole("button", { name: "🎓 Programs" });
    this.calendarButton = page.getByRole("button", { name: "📅 Calendar" });
    this.settingsButton = page.getByRole("button", { name: "⚙️ Settings" });
    this.signOutButton = page.getByRole("button", { name: "Sign out" });
  }

  async goToDashboard() {
    await this.dashboardButton.click();
  }

  async goToPrograms() {
    await this.programsButton.click();
  }

  async goToSettings() {
    await this.settingsButton.click();
  }

  async signOut() {
    await this.signOutButton.click();
  }
}

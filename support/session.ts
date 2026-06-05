import type { Page } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

/** Clears reused admin storage state so a test can sign in through the login UI. */
export async function clearSessionForUiLogin(page: Page) {
  const login = new LoginPage(page);
  await page.context().clearCookies();
  await login.goto();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
}

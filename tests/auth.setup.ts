import fs from "fs";
import path from "path";
import { test as setup } from "@playwright/test";
import { ADMIN_AUTH_FILE } from "../support/auth-state";
import { loginViaApiPage } from "../support/didaxis-api";

setup("authenticate as admin", async ({ page }) => {
  await loginViaApiPage(page);

  fs.mkdirSync(path.dirname(ADMIN_AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});

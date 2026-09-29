import { test, expect } from "../fixtures/cleanup.fixture";
import { SettingsPage } from "../pages/settings.page";

const NEW_USER_PASSWORD = "Password1!";

function uniqueTag() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function qaUser(label: string) {
  const tag = uniqueTag();
  return {
    name: `qa-ds213-${label} ${tag}`,
    email: `qa-ds213-${label}-${tag}@college.edu`,
    password: NEW_USER_PASSWORD,
  };
}

test.describe("Didaxis Studio — add user in Settings (DS-213)", () => {
  test.beforeEach(async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();
    await expect(settings.heading).toBeVisible();
    await expect(settings.usersHeading).toBeVisible();
  });

  test("TC-001: Add User dialog shows Name, Email, Password, Role, and Create User", {
    tag: "@smoke",
  }, async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.openAddUser();

    const modal = settings.addUserModal;
    await expect(modal.dialog).toBeVisible();
    await expect(modal.nameInput).toBeVisible();
    await expect(modal.emailInput).toBeVisible();
    await expect(modal.passwordInput).toBeVisible();
    await expect(modal.roleInput).toBeVisible();
    await expect(modal.createUserButton).toBeVisible();
  });

  test("TC-002: create a user with name, email, password, and EDITOR role", {
    tag: "@smoke",
  }, async ({ page }) => {
    const user = qaUser("jordan");
    const settings = new SettingsPage(page);
    const modal = settings.addUserModal;

    await settings.openAddUser();
    await modal.fill({
      name: user.name,
      email: user.email,
      password: user.password,
      role: "EDITOR",
    });
    await modal.submit();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(settings.rowForName(user.name)).toBeVisible();
    await expect(settings.rowForEmail(user.email)).toBeVisible();
    await expect(settings.roleInRow(user.name)).toHaveText("EDITOR");
  });

  test("TC-003: create a user with ADMIN role", {
    tag: "@sanity",
  }, async ({ page }) => {
    const user = qaUser("admin");
    const settings = new SettingsPage(page);
    const modal = settings.addUserModal;

    await settings.openAddUser();
    await modal.fill({
      name: user.name,
      email: user.email,
      password: user.password,
      role: "ADMIN",
    });
    await modal.submit();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(settings.rowForName(user.name)).toBeVisible();
    await expect(settings.roleInRow(user.name)).toHaveText("ADMIN");
  });

  test("TC-004: Create User stays disabled when required fields are empty", {
    tag: "@regression",
  }, async ({ page }) => {
    const settings = new SettingsPage(page);
    const modal = settings.addUserModal;

    await settings.openAddUser();
    await expect(modal.createUserButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
  });

  test("TC-005: closing the dialog without submit does not add the user", {
    tag: "@regression",
  }, async ({ page }) => {
    const user = qaUser("discard");
    const settings = new SettingsPage(page);
    const modal = settings.addUserModal;

    await settings.openAddUser();
    await modal.fill({
      name: user.name,
      email: user.email,
      password: user.password,
    });
    await modal.closeViaX();

    await expect(modal.dialog).toBeHidden();
    await expect(settings.rowForEmail(user.email)).toHaveCount(0);
  });
});

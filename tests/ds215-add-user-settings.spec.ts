import { test, expect } from "../fixtures/cleanup.fixture";
import { SettingsPage } from "../pages/settings.page";

const NEW_USER_PASSWORD = "Password1!";

function uniqueTag() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

test.describe("Didaxis Studio — add user in Settings (DS-215)", () => {
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

  test("TC-002: create a user with name, email, password, and VIEWER role", {
    tag: "@smoke",
  }, async ({ page }) => {
    const tag = uniqueTag();
    const name = `qa-ds215-viewer ${tag}`;
    const email = `qa-ds215-viewer-${tag}@college.edu`;
    const settings = new SettingsPage(page);
    const modal = settings.addUserModal;

    await settings.openAddUser();
    await modal.fill({
      name,
      email,
      password: NEW_USER_PASSWORD,
      role: "VIEWER",
    });
    await modal.submit();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(settings.rowForName(name)).toBeVisible();
    await expect(settings.rowForEmail(email)).toBeVisible();
    await expect(settings.roleInRow(name)).toHaveText("VIEWER");
  });

  test("TC-003: Create User stays disabled when only Name is filled", {
    tag: "@regression",
  }, async ({ page }) => {
    const settings = new SettingsPage(page);
    const modal = settings.addUserModal;

    await settings.openAddUser();
    await modal.fillName("qa-ds215-incomplete");
    await expect(modal.createUserButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
  });

  test("TC-004: closing the dialog without submit does not add the user", {
    tag: "@regression",
  }, async ({ page }) => {
    const tag = uniqueTag();
    const name = `qa-ds215-discard ${tag}`;
    const email = `qa-ds215-discard-${tag}@college.edu`;
    const settings = new SettingsPage(page);
    const modal = settings.addUserModal;

    await settings.openAddUser();
    await modal.fill({
      name,
      email,
      password: NEW_USER_PASSWORD,
    });
    await modal.closeViaX();

    await expect(modal.dialog).toBeHidden();
    await expect(settings.rowForEmail(email)).toHaveCount(0);
  });

  test("TC-005: plus-tag email local part is accepted", {
    tag: "@regression",
  }, async ({ page }) => {
    const tag = uniqueTag();
    const name = `qa-ds215-plus ${tag}`;
    const email = `qa-ds215-plus+${tag}@college.edu`;
    const settings = new SettingsPage(page);
    const modal = settings.addUserModal;

    await settings.openAddUser();
    await modal.fill({
      name,
      email,
      password: NEW_USER_PASSWORD,
      role: "EDITOR",
    });
    await modal.submit();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(settings.rowForEmail(email)).toBeVisible();
  });
});

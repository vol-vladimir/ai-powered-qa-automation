import { test, expect } from "../fixtures/cleanup.fixture";
import { SettingsPage } from "../pages/settings.page";

const DEFAULT_PASSWORD = "Password1!";

function uniqueTag() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function qaUser(label: string) {
  const tag = uniqueTag();
  return {
    name: `qa-ds215-${label} ${tag}`,
    email: `qa-ds215-${label}-${tag}@college.edu`,
    password: DEFAULT_PASSWORD,
  };
}

test.describe("Didaxis Studio — add user in Settings (DS-215)", () => {
  test.beforeEach(async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();
    await expect(settings.heading).toBeVisible();
    await expect(settings.usersHeading).toBeVisible();
  });

  test("TC-001: open Add User dialog and see Name, Email, Password, Role, Create User", { tag: "@smoke" }, async ({
    page,
  }) => {
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

  test("TC-002: successfully create a user with EDITOR role", { tag: "@smoke" }, async ({
    page,
  }) => {
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

  test("TC-003: create user with ADMIN role", { tag: "@sanity" }, async ({ page }) => {
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

  test("TC-004: create user with VIEWER role", { tag: "@sanity" }, async ({ page }) => {
    const user = qaUser("viewer");
    const settings = new SettingsPage(page);
    const modal = settings.addUserModal;

    await settings.openAddUser();
    await modal.fill({
      name: user.name,
      email: user.email,
      password: user.password,
      role: "VIEWER",
    });
    await modal.submit();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(settings.rowForName(user.name)).toBeVisible();
    await expect(settings.roleInRow(user.name)).toHaveText("VIEWER");
  });

  test("TC-005: Create User stays disabled when required fields are empty", { tag: "@regression" }, async ({
    page,
  }) => {
    const settings = new SettingsPage(page);
    const modal = settings.addUserModal;

    await settings.openAddUser();
    await expect(modal.createUserButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
  });

  test("TC-006: Create User stays disabled when only Name is filled", { tag: "@regression" }, async ({
    page,
  }) => {
    const settings = new SettingsPage(page);
    const modal = settings.addUserModal;

    await settings.openAddUser();
    await modal.fillName("qa-ds215-incomplete");
    await expect(modal.createUserButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
  });

  test("TC-007: closing dialog without submit does not add a user", { tag: "@sanity" }, async ({
    page,
  }) => {
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

  test("TC-008: create user with plus-tag style email local part", { tag: "@regression" }, async ({
    page,
  }) => {
    const tag = uniqueTag();
    const name = `qa-ds215-plus ${tag}`;
    const email = `qa-ds215-plus+${tag}@college.edu`;
    const settings = new SettingsPage(page);
    const modal = settings.addUserModal;

    await settings.openAddUser();
    await modal.fill({
      name,
      email,
      password: DEFAULT_PASSWORD,
      role: "EDITOR",
    });
    await modal.submit();

    await expect(modal.dialog).toBeHidden({ timeout: 20_000 });
    await expect(settings.rowForEmail(email)).toBeVisible();
  });

  test("TC-009: Role defaults to EDITOR when dialog opens", { tag: "@sanity" }, async ({ page }) => {
    const settings = new SettingsPage(page);
    const modal = settings.addUserModal;

    await settings.openAddUser();
    await expect(modal.roleInput).toHaveValue("EDITOR");
  });
});

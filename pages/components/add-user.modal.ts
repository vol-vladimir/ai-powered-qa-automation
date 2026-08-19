import type { Page } from "@playwright/test";

export type UserRole = "ADMIN" | "EDITOR" | "VIEWER";

export class AddUserModal {
  readonly dialog;
  readonly nameInput;
  readonly emailInput;
  readonly passwordInput;
  readonly roleInput;
  readonly createUserButton;
  readonly closeButton;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole("dialog", { name: "Add User" });
    this.nameInput = this.dialog.getByRole("textbox", { name: "Name" });
    this.emailInput = this.dialog.getByRole("textbox", { name: "Email" });
    this.passwordInput = this.dialog.getByRole("textbox", { name: "Password" });
    this.roleInput = this.dialog.getByRole("textbox", { name: "Role" });
    this.createUserButton = this.dialog.getByRole("button", {
      name: "Create User",
    });
    this.closeButton = this.dialog
      .getByRole("button", { name: "Close" })
      .or(
        this.dialog
          .getByRole("button")
          .filter({ hasNot: this.createUserButton })
          .first(),
      );
  }

  roleOption(role: UserRole) {
    return this.page.getByRole("option", { name: role, exact: true });
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async selectRole(role: UserRole) {
    await this.roleInput.click();
    await this.roleOption(role).click();
  }

  async fill(fields: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }) {
    await this.fillName(fields.name);
    await this.fillEmail(fields.email);
    await this.fillPassword(fields.password);
    if (fields.role) {
      await this.selectRole(fields.role);
    }
  }

  async submit() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        /\/api\/users\/?$/.test(new URL(response.url()).pathname),
    );
    await this.createUserButton.click();
    await responsePromise.catch(() => null);
  }

  async closeViaX() {
    await this.closeButton.click();
  }
}

import type { Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { AddUserModal } from "./components/add-user.modal";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class SettingsPage extends BasePage {
  readonly heading;
  readonly usersHeading;
  readonly addUserButton;
  readonly usersTable;
  readonly nameColumnHeader;
  readonly emailColumnHeader;
  readonly roleColumnHeader;
  readonly activeColumnHeader;
  readonly addUserModal: AddUserModal;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Settings" });
    this.usersHeading = page.getByRole("heading", { name: "Users" });
    this.addUserButton = page.getByRole("button", { name: "Add User" });
    this.usersTable = page.getByRole("table");
    this.nameColumnHeader = page.getByRole("columnheader", { name: "Name" });
    this.emailColumnHeader = page.getByRole("columnheader", { name: "Email" });
    this.roleColumnHeader = page.getByRole("columnheader", { name: "Role" });
    this.activeColumnHeader = page.getByRole("columnheader", {
      name: "Active",
    });
    this.addUserModal = new AddUserModal(page);
  }

  async goto() {
    await this.navigateTo("/settings");
  }

  async openAddUser() {
    await this.addUserButton.click();
  }

  rowForName(name: string) {
    return this.usersTable
      .getByRole("row")
      .filter({ hasText: new RegExp(escapeRegExp(name)) })
      .first();
  }

  rowForEmail(email: string) {
    return this.usersTable
      .getByRole("row")
      .filter({ hasText: new RegExp(escapeRegExp(email)) })
      .first();
  }

  emailInRow(name: string) {
    return this.rowForName(name).getByText(
      /@/,
    );
  }

  roleInRow(name: string) {
    return this.rowForName(name).getByText(/^(ADMIN|EDITOR|VIEWER)$/);
  }
}

import type { Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { EditProgramModal } from "./components/edit-program.modal";
import { NewProgramModal } from "./components/new-program.modal";
import {
  CONFLICT_ERROR_PATTERN,
  LIST_LOAD_ERROR_PATTERN,
  NOT_FOUND_OR_ERROR_PATTERN,
} from "./feedback.patterns";

export const EMPTY_PROGRAMS_MESSAGE =
  "No programs yet. Create your first program to get started.";

export type DeleteConfirmCapture = {
  type: string;
  message: string;
  accepted: boolean;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class ProgramsPage extends BasePage {
  readonly heading;
  readonly newProgramButton;
  readonly createProgramEmptyStateButton;
  readonly programColumnHeader;
  readonly programsTable;
  readonly emptyStateMessage;
  readonly newProgramModal: NewProgramModal;
  readonly editProgramModal: EditProgramModal;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Programs" });
    this.newProgramButton = page.getByRole("button", { name: "+ New Program" });
    this.createProgramEmptyStateButton = page.getByRole("button", {
      name: "Create Program",
    });
    this.programColumnHeader = page.getByRole("columnheader", {
      name: "Program",
    });
    this.programsTable = page.getByRole("table");
    this.emptyStateMessage = page.getByText(EMPTY_PROGRAMS_MESSAGE);
    this.newProgramModal = new NewProgramModal(page);
    this.editProgramModal = new EditProgramModal(page);
  }

  async goto() {
    await this.navigateTo("/programs");
  }

  async openNewProgram() {
    await this.newProgramButton.click();
  }

  async tabUntilNewProgramFocused(maxTabs = 50) {
    for (let i = 0; i < maxTabs; i++) {
      await this.page.keyboard.press("Tab");
      const focused = await this.newProgramButton.evaluate(
        (el) => el === document.activeElement,
      );
      if (focused) {
        return;
      }
    }
    throw new Error("Could not focus '+ New Program' button via keyboard Tab");
  }

  async activateFocusedButton() {
    await this.page.keyboard.press("Enter");
  }

  programNameParagraph(programName: string) {
    return this.page
      .getByRole("paragraph")
      .filter({ hasText: new RegExp(`^${escapeRegExp(programName)}$`) });
  }

  rowFor(programName: string) {
    return this.programsTable
      .getByRole("row")
      .filter({ has: this.programNameParagraph(programName) })
      .first();
  }

  tableRows() {
    return this.programsTable.getByRole("row");
  }

  tableDataRows() {
    return this.tableRows().filter({ has: this.page.getByRole("paragraph") });
  }

  firstDataRow() {
    return this.tableDataRows().first();
  }

  async tableRowCount() {
    return this.tableRows().count();
  }

  async tableDataRowCount() {
    return this.tableDataRows().count();
  }

  paragraphsInRow(programName: string) {
    return this.rowFor(programName).getByRole("paragraph");
  }

  async countRows(programName: string) {
    return this.programsTable
      .getByRole("row")
      .filter({ has: this.programNameParagraph(programName) })
      .count();
  }

  nameInRow(programName: string) {
    return this.rowFor(programName).getByRole("paragraph").first();
  }

  descriptionInRow(programName: string) {
    return this.rowFor(programName).getByRole("paragraph").nth(1);
  }

  editButtonFor(programName: string) {
    return this.rowFor(programName).getByRole("button", {
      name: `Edit ${programName}`,
    });
  }

  deleteButtonFor(programName: string) {
    return this.rowFor(programName).getByRole("button", {
      name: `Delete ${programName}`,
    });
  }

  alertDialogs() {
    return this.page.getByRole("alertdialog");
  }

  notFoundOrErrorMessage() {
    return this.page.getByText(NOT_FOUND_OR_ERROR_PATTERN);
  }

  listLoadErrorMessage() {
    return this.page.getByText(LIST_LOAD_ERROR_PATTERN);
  }

  conflictErrorMessage() {
    return this.page.getByText(CONFLICT_ERROR_PATTERN);
  }

  async openEditFor(programName: string) {
    await this.editButtonFor(programName).click();
    await this.editProgramModal.expandAiConfigIfCollapsed();
  }

  async orgHasPrograms() {
    return (await this.tableDataRowCount()) > 0;
  }

  expectedDeleteConfirmMessage(programName: string) {
    return `Delete program "${programName}"? All its semesters and courses will be removed. This cannot be undone.`;
  }

  async triggerDeleteConfirm(
    programName: string,
    options?: { accept?: boolean },
  ): Promise<DeleteConfirmCapture> {
    const accept = options?.accept ?? true;

    const dialogCaptured = new Promise<DeleteConfirmCapture>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(
          new Error(`Delete confirm dialog did not appear for "${programName}"`),
        );
      }, 10_000);

      this.page.once("dialog", async (dialog) => {
        clearTimeout(timeoutId);
        const captured: DeleteConfirmCapture = {
          type: dialog.type(),
          message: dialog.message(),
          accepted: accept,
        };
        if (accept) {
          await dialog.accept();
        } else {
          await dialog.dismiss();
        }
        resolve(captured);
      });
    });

    await this.deleteButtonFor(programName).click();
    return dialogCaptured;
  }
}

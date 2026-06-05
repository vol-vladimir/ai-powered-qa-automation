import type { Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { EditProgramModal } from "./components/edit-program.modal";
import { NewProgramModal } from "./components/new-program.modal";

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
    return this.page.getByRole("button", { name: `Edit ${programName}` });
  }

  deleteButtonFor(programName: string) {
    return this.rowFor(programName).getByRole("button", {
      name: `Delete ${programName}`,
    });
  }

  async openEditFor(programName: string) {
    await this.editButtonFor(programName).click();
    await this.editProgramModal.expandAiConfigIfCollapsed();
  }

  async orgHasPrograms() {
    return (await this.page.getByRole("button", { name: /^Delete / }).count()) > 0;
  }

  expectedDeleteConfirmMessage(programName: string) {
    return `Delete program "${programName}"? All its semesters and courses will be removed. This cannot be undone.`;
  }

  async triggerDeleteConfirm(
    programName: string,
    options?: { accept?: boolean },
  ): Promise<DeleteConfirmCapture> {
    const accept = options?.accept ?? true;
    let captured: DeleteConfirmCapture | null = null;

    this.page.once("dialog", async (dialog) => {
      captured = {
        type: dialog.type(),
        message: dialog.message(),
        accepted: accept,
      };
      if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });

    await this.deleteButtonFor(programName).click();

    const deadline = Date.now() + 10_000;
    while (!captured && Date.now() < deadline) {
      await this.page.waitForTimeout(50);
    }
    if (!captured) {
      throw new Error(`Delete confirm dialog did not appear for "${programName}"`);
    }
    return captured;
  }
}

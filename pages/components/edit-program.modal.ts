import type { Locator, Page } from "@playwright/test";
import { DUPLICATE_NAME_PATTERN } from "../feedback.patterns";
import { expandAiConfigIfCollapsed } from "./ai-config-section";

export type EditFormSnapshot = {
  name: string;
  description: string;
  totalHours: string;
  sessionHours: string;
  examHours: string;
  targetAudience: string;
  focusAreas: string;
};

function hoursInputForLabel(dialog: Locator, label: string) {
  return dialog
    .getByLabel(label, { exact: true })
    .or(
      dialog
        .getByText(new RegExp(`^${label}$`))
        .locator("..")
        .getByRole("textbox"),
    );
}

export class EditProgramModal {
  readonly dialog;
  readonly programNameInput;
  readonly descriptionInput;
  readonly totalHoursInput;
  readonly sessionHoursInput;
  readonly examHoursInput;
  readonly targetAudienceInput;
  readonly focusAreasInput;
  readonly saveButton;
  readonly cancelButton;
  readonly aiConfigToggle;
  readonly duplicateNameError;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole("dialog", { name: "Edit Program" });
    this.programNameInput = this.dialog.getByRole("textbox", {
      name: "Program Name",
    });
    this.descriptionInput = this.dialog.getByRole("textbox", {
      name: "Description",
    });
    this.totalHoursInput = this.dialog.getByPlaceholder("e.g. 900");
    this.sessionHoursInput = hoursInputForLabel(
      this.dialog,
      "Default Session Hours",
    );
    this.examHoursInput = hoursInputForLabel(
      this.dialog,
      "Default Exam Hours",
    );
    this.targetAudienceInput = this.dialog.getByPlaceholder(
      "e.g. Career changers, no CS background",
    );
    this.focusAreasInput = this.dialog.getByPlaceholder(
      "e.g. Python, SQL, Machine Learning, Data Visualization",
    );
    this.saveButton = this.dialog.getByRole("button", { name: "Save" });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
    this.aiConfigToggle = this.dialog.getByRole("button", {
      name: /AI Generation Config/i,
    });
    this.duplicateNameError = this.dialog.getByText(DUPLICATE_NAME_PATTERN);
  }

  duplicateNameFeedback() {
    return this.page
      .getByText(DUPLICATE_NAME_PATTERN)
      .or(this.duplicateNameError);
  }

  async hasDuplicateNameFeedback(): Promise<boolean> {
    return this.duplicateNameFeedback().isVisible().catch(() => false);
  }

  async fillName(name: string) {
    await this.programNameInput.fill(name);
  }

  async fillDescription(description: string) {
    await this.descriptionInput.fill(description);
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async expandAiConfigIfCollapsed() {
    await expandAiConfigIfCollapsed(this.aiConfigToggle);
  }

  async captureSnapshot(): Promise<EditFormSnapshot> {
    await this.expandAiConfigIfCollapsed();
    return {
      name: await this.programNameInput.inputValue(),
      description: await this.descriptionInput.inputValue(),
      totalHours: await this.totalHoursInput.inputValue(),
      sessionHours: await this.sessionHoursInput.inputValue(),
      examHours: await this.examHoursInput.inputValue(),
      targetAudience: await this.targetAudienceInput.inputValue(),
      focusAreas: await this.focusAreasInput.inputValue(),
    };
  }
}

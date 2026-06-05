import type { Page } from "@playwright/test";

export type EditFormSnapshot = {
  name: string;
  description: string;
  totalHours: string;
  sessionHours: string;
  examHours: string;
  targetAudience: string;
  focusAreas: string;
};

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

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole("dialog", { name: "Edit Program" });
    this.programNameInput = this.dialog.getByRole("textbox", {
      name: "Program Name",
    });
    this.descriptionInput = this.dialog.getByRole("textbox", {
      name: "Description",
    });
    this.totalHoursInput = this.dialog.getByPlaceholder("e.g. 900");
    this.sessionHoursInput = this.dialog
      .getByText(/^Default Session Hours$/)
      .locator("..")
      .getByRole("textbox");
    this.examHoursInput = this.dialog
      .getByText(/^Default Exam Hours$/)
      .locator("..")
      .getByRole("textbox");
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
    if (!(await this.aiConfigToggle.isVisible().catch(() => false))) {
      return;
    }
    const label = (await this.aiConfigToggle.textContent()) ?? "";
    if (/Show/i.test(label)) {
      await this.aiConfigToggle.click();
    }
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

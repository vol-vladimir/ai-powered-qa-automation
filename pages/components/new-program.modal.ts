import type { Locator, Page } from "@playwright/test";
import { DUPLICATE_NAME_PATTERN } from "../feedback.patterns";
import { expandAiConfigIfCollapsed } from "./ai-config-section";

export class NewProgramModal {
  readonly dialog;
  readonly programNameInput;
  readonly descriptionInput;
  readonly createButton;
  readonly cancelButton;
  readonly aiConfigToggle;
  readonly targetAudienceInput;
  readonly closeButton;
  readonly duplicateNameError;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole("dialog", { name: "New Program" });
    this.programNameInput = this.dialog.getByRole("textbox", {
      name: "Program Name",
    });
    this.descriptionInput = this.dialog.getByRole("textbox", {
      name: "Description",
    });
    this.createButton = this.dialog.getByRole("button", {
      name: "Create",
      exact: true,
    });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
    this.aiConfigToggle = this.dialog.getByRole("button", {
      name: /AI Generation Config/i,
    });
    this.targetAudienceInput = this.dialog.getByPlaceholder(
      "e.g. Career changers, no CS background",
    );
    this.closeButton = this.dialog
      .getByRole("button", { name: "Close" })
      .or(
        this.dialog
          .getByRole("button")
          .filter({ hasNot: this.createButton })
          .filter({ hasNot: this.cancelButton })
          .first(),
      );
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

  async fill(name: string, description: string) {
    await this.programNameInput.fill(name);
    await this.descriptionInput.fill(description);
  }

  async fillName(name: string) {
    await this.programNameInput.fill(name);
  }

  async fillDescription(description: string) {
    await this.descriptionInput.fill(description);
  }

  async submit() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/programs"),
    );
    await this.createButton.click();
    await responsePromise.catch(() => null);
  }

  async doubleClickCreate() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/programs"),
    );
    await this.createButton.dblclick();
    await responsePromise.catch(() => null);
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async closeViaX() {
    await this.closeButton.click();
  }

  async expandAiConfigIfCollapsed() {
    await expandAiConfigIfCollapsed(this.aiConfigToggle);
  }
}

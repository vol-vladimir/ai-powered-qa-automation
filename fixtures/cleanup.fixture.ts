import { test as base, expect } from "@playwright/test";
import { registerProgramCreateTracking } from "../support/register-program-create-tracking";
import { trackProgram as addProgramToTracker } from "../support/program-tracker";

export const test = base.extend<{
  trackProgram: (programId: string) => void;
}>({
  page: async ({ page }, use) => {
    registerProgramCreateTracking(page);
    await use(page);
  },

  trackProgram: async ({}, use) => {
    await use((programId: string) => {
      addProgramToTracker(programId);
    });
  },
});

export { expect };

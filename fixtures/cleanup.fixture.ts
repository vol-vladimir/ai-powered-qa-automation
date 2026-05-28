import { test as base, expect } from "@playwright/test";
import { trackProgram as addProgramToTracker } from "../support/program-tracker";

export const test = base.extend<{
  trackProgram: (programId: string) => void;
}>({
  trackProgram: async ({}, use) => {
    await use((programId: string) => {
      addProgramToTracker(programId);
    });
  },
});

export { expect };

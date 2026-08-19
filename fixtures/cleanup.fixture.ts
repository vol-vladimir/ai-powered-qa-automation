import { test as base, expect } from "@playwright/test";
import { registerProgramCreateTracking } from "../support/register-program-create-tracking";
import { registerUserCreateTracking } from "../support/register-user-create-tracking";
import { trackProgram as addProgramToTracker } from "../support/program-tracker";
import { trackUser as addUserToTracker } from "../support/user-tracker";

export const test = base.extend<{
  trackProgram: (programId: string) => void;
  trackUser: (userId: string) => void;
}>({
  page: async ({ page }, use) => {
    registerProgramCreateTracking(page);
    registerUserCreateTracking(page);
    await use(page);
  },

  trackProgram: async ({}, use) => {
    await use((programId: string) => {
      addProgramToTracker(programId);
    });
  },

  trackUser: async ({}, use) => {
    await use((userId: string) => {
      addUserToTracker(userId);
    });
  },
});

export { expect };

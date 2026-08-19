import "dotenv/config";
import { deactivateUsersByIds } from "./deactivate-user";
import { deleteProgramsByIds } from "./delete-program";
import { clearTracker, getTrackedPrograms } from "./program-tracker";
import { clearUserTracker, getTrackedUsers } from "./user-tracker";

export default async function globalTeardown(): Promise<void> {
  const programIds = getTrackedPrograms();

  if (programIds.length === 0) {
    console.log("Program cleanup: no tracked programs to delete.");
  } else {
    console.log(
      `Program cleanup: deleting ${programIds.length} tracked program(s)...`,
    );
    const results = await deleteProgramsByIds(programIds);
    const deleted = results.filter((result) => result.ok);
    const failed = results.filter((result) => !result.ok);

    console.log(`Program cleanup: deleted ${deleted.length} program(s).`);
    for (const result of deleted) {
      console.log(`- ${result.id} (${result.status})`);
    }

    if (failed.length > 0) {
      console.warn(`Program cleanup: ${failed.length} deletion(s) failed.`);
      for (const result of failed) {
        console.warn(`- ${result.id}: ${result.status} ${result.message}`);
      }
    }

    clearTracker();
  }

  const userIds = getTrackedUsers();

  if (userIds.length === 0) {
    console.log("User cleanup: no tracked users to deactivate.");
    return;
  }

  console.log(
    `User cleanup: deactivating ${userIds.length} tracked user(s)...`,
  );
  const userResults = await deactivateUsersByIds(userIds);
  const deactivated = userResults.filter((result) => result.ok);
  const failedUsers = userResults.filter((result) => !result.ok);

  console.log(`User cleanup: deactivated ${deactivated.length} user(s).`);
  for (const result of deactivated) {
    console.log(`- ${result.id} (${result.status})`);
  }

  if (failedUsers.length > 0) {
    console.warn(
      `User cleanup: ${failedUsers.length} deactivation(s) failed.`,
    );
    for (const result of failedUsers) {
      console.warn(`- ${result.id}: ${result.status} ${result.message}`);
    }
  }

  clearUserTracker();
}

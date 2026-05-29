import "dotenv/config";
import { deleteProgramsByIds } from "./delete-program";
import { clearTracker, getTrackedPrograms } from "./program-tracker";

export default async function globalTeardown(): Promise<void> {
  const programIds = getTrackedPrograms();

  if (programIds.length === 0) {
    console.log("Program cleanup: no tracked programs to delete.");
    return;
  }

  console.log(`Program cleanup: deleting ${programIds.length} tracked program(s)...`);
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

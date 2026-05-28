import "dotenv/config";
import { verifyApiToken } from "./support/didaxis-api";
import { initTracker } from "./support/program-tracker";

export default async function globalSetup(): Promise<void> {
  initTracker();
  await verifyApiToken();
}

import "dotenv/config";
import { verifyApiToken } from "./didaxis-api";
import { initTracker } from "./program-tracker";

export default async function globalSetup(): Promise<void> {
  initTracker();
  await verifyApiToken();
}

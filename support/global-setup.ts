import "dotenv/config";
import { verifyApiToken } from "./didaxis-api";
import { initTracker } from "./program-tracker";
import { initUserTracker } from "./user-tracker";

export default async function globalSetup(): Promise<void> {
  initTracker();
  initUserTracker();
  await verifyApiToken();
}

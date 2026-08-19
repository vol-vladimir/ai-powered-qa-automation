import fs from "node:fs";
import path from "node:path";

const TRACKER_DIR = path.join(process.cwd(), ".playwright");
const TRACKER_FILE = path.join(TRACKER_DIR, "created-users.jsonl");

export function initUserTracker(): void {
  fs.mkdirSync(TRACKER_DIR, { recursive: true });
  fs.writeFileSync(TRACKER_FILE, "");
}

export function trackUser(userId: string): void {
  fs.mkdirSync(TRACKER_DIR, { recursive: true });
  fs.appendFileSync(TRACKER_FILE, `${userId}\n`);
}

export function getTrackedUsers(): string[] {
  if (!fs.existsSync(TRACKER_FILE)) {
    return [];
  }

  const ids = fs
    .readFileSync(TRACKER_FILE, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return [...new Set(ids)];
}

export function clearUserTracker(): void {
  initUserTracker();
}

import fs from "node:fs";
import path from "node:path";

const TRACKER_DIR = path.join(process.cwd(), ".playwright");
const TRACKER_FILE = path.join(TRACKER_DIR, "created-programs.jsonl");

export function initTracker(): void {
  fs.mkdirSync(TRACKER_DIR, { recursive: true });
  fs.writeFileSync(TRACKER_FILE, "");
}

export function trackProgram(programId: string): void {
  fs.mkdirSync(TRACKER_DIR, { recursive: true });
  fs.appendFileSync(TRACKER_FILE, `${programId}\n`);
}

export function getTrackedPrograms(): string[] {
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

export function clearTracker(): void {
  initTracker();
}

import { expect, type Page } from "@playwright/test";
import { ProgramsPage } from "../pages/programs.page";
import { apiFetch, createProgramViaApi } from "./didaxis-api";
import { PROGRAM_DESC_SEED, PROGRAM_NAME_SEED } from "./program-constants";
import { trackProgram } from "./program-tracker";

export async function orgHasProgramsViaApi(): Promise<boolean> {
  const response = await apiFetch("/api/programs");
  const body = (await response.json()) as { data?: unknown[] };

  if (!response.ok) {
    throw new Error(
      `GET /api/programs failed (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  return (body.data ?? []).length > 0;
}

export async function createProgram(
  page: Page,
  name: string,
  description: string,
) {
  const programs = new ProgramsPage(page);
  const program = await createProgramViaApi(name, description);
  trackProgram(program.id);

  if (page.url().includes("/programs")) {
    await programs.reload();
    await expect(programs.heading).toBeVisible();
  } else {
    await programs.goto();
    await expect(programs.heading).toBeVisible();
  }

  await expect(programs.rowFor(name)).toBeVisible();
  return program;
}

export async function ensureSeedProgramExists(page: Page) {
  const programs = new ProgramsPage(page);
  if ((await programs.countRows(PROGRAM_NAME_SEED)) > 0) {
    return;
  }
  await createProgram(page, PROGRAM_NAME_SEED, PROGRAM_DESC_SEED);
}

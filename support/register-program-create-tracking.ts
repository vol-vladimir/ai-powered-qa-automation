import type { Page, Response } from "@playwright/test";
import { trackProgram } from "./program-tracker";

const TRACKED_PAGES = new WeakSet<Page>();

function isProgramCreateResponse(response: Response): boolean {
  return (
    response.request().method() === "POST" &&
    /\/api\/programs\/?$/.test(new URL(response.url()).pathname) &&
    response.status() === 201
  );
}

async function trackProgramFromResponse(response: Response): Promise<void> {
  try {
    const body = (await response.json()) as { data?: { id?: string } };
    if (body.data?.id) {
      trackProgram(body.data.id);
    }
  } catch {
    // Response body already consumed or not JSON.
  }
}

/**
 * Registers a page listener that tracks UUIDs from successful UI/API browser
 * POST /api/programs responses. Safe to call once per Page (idempotent).
 */
export function registerProgramCreateTracking(page: Page): void {
  if (TRACKED_PAGES.has(page)) {
    return;
  }
  TRACKED_PAGES.add(page);

  page.on("response", (response) => {
    if (!isProgramCreateResponse(response)) {
      return;
    }
    void trackProgramFromResponse(response);
  });
}

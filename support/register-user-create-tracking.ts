import type { Page, Response } from "@playwright/test";
import { trackUser } from "./user-tracker";

const TRACKED_PAGES = new WeakSet<Page>();

function isUserCreateResponse(response: Response): boolean {
  return (
    response.request().method() === "POST" &&
    /\/api\/users\/?$/.test(new URL(response.url()).pathname) &&
    response.status() === 201
  );
}

async function trackUserFromResponse(response: Response): Promise<void> {
  try {
    const body = (await response.json()) as { data?: { id?: string } };
    if (body.data?.id) {
      trackUser(body.data.id);
    }
  } catch {
    // Response body already consumed or not JSON.
  }
}

/**
 * Registers a page listener that tracks user IDs from successful browser
 * POST /api/users responses. Safe to call once per Page (idempotent).
 */
export function registerUserCreateTracking(page: Page): void {
  if (TRACKED_PAGES.has(page)) {
    return;
  }
  TRACKED_PAGES.add(page);

  page.on("response", (response) => {
    if (!isUserCreateResponse(response)) {
      return;
    }
    void trackUserFromResponse(response);
  });
}

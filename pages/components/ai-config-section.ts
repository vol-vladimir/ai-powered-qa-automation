import type { Locator } from "@playwright/test";

export async function expandAiConfigIfCollapsed(
  aiConfigToggle: Locator,
): Promise<void> {
  if (!(await aiConfigToggle.isVisible().catch(() => false))) {
    return;
  }
  const label = (await aiConfigToggle.textContent()) ?? "";
  if (/Show/i.test(label)) {
    await aiConfigToggle.click();
  }
}

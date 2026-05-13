import { test, expect, type Page } from "@playwright/test";

/** Matches `todomvc-test-plan.md` — React TodoMVC Playwright demo */
const TODO_MVC = "https://demo.playwright.dev/todomvc/#/";

async function openApp(page: Page) {
  await page.goto(TODO_MVC);
  await expect(page.getByRole("heading", { name: "todos" })).toBeVisible();
}

function newTodoInput(page: Page) {
  return page.getByPlaceholder("What needs to be done?");
}

async function addTodo(page: Page, title: string) {
  const input = newTodoInput(page);
  await input.fill(title);
  await input.press("Enter");
}

function todoRows(page: Page) {
  return page.getByTestId("todo-item");
}

async function deleteTodoByTitle(page: Page, title: string) {
  const row = todoRows(page).filter({ has: page.getByTestId("todo-title").getByText(title, { exact: true }) });
  await row.hover();
  await row.getByRole("button", { name: "Delete" }).click();
}

test.describe("TodoMVC — positive flows @todomvc-test-plan", () => {
  test("TC-001 — empty session exposes a usable todo entry surface", async ({ page }) => {
    await openApp(page);
    const input = newTodoInput(page);
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    await expect(todoRows(page)).toHaveCount(0);
  });

  test("TC-002 — first submitted todo creates a visible list", async ({ page }) => {
    await openApp(page);
    await newTodoInput(page).click();
    await addTodo(page, "Buy milk");
    await expect(todoRows(page)).toHaveCount(1);
    await expect(page.getByTestId("todo-title")).toHaveText("Buy milk");
    await expect(page.getByTestId("todo-count")).toHaveText("1 item left");
    await expect(page.getByRole("link", { name: "All" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Active" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Completed" })).toBeVisible();
  });

  test("TC-003 — user can add four distinct todos", async ({ page }) => {
    await openApp(page);
    await addTodo(page, "Buy milk");
    await addTodo(page, "Walk dog");
    await addTodo(page, "Read book");
    await addTodo(page, "Call mom");
    await expect(todoRows(page)).toHaveCount(4);
    await expect(page.getByTestId("todo-title").nth(0)).toHaveText("Buy milk");
    await expect(page.getByTestId("todo-title").nth(1)).toHaveText("Walk dog");
    await expect(page.getByTestId("todo-title").nth(2)).toHaveText("Read book");
    await expect(page.getByTestId("todo-title").nth(3)).toHaveText("Call mom");
    await expect(page.getByTestId("todo-count")).toHaveText("4 items left");
  });

  test("TC-004 — completing a todo shows it as finished", async ({ page }) => {
    await openApp(page);
    await addTodo(page, "Buy milk");
    await addTodo(page, "Walk dog");
    await addTodo(page, "Read book");
    await addTodo(page, "Call mom");
    const firstRow = todoRows(page).first();
    await firstRow.getByLabel("Toggle Todo").check();
    await expect(firstRow).toHaveClass(/completed/);
    await expect(firstRow.getByLabel("Toggle Todo")).toBeChecked();
    await expect(page.getByTestId("todo-count")).toHaveText("3 items left");
    await expect(page.getByTestId("todo-title").filter({ hasText: "Buy milk" })).toBeVisible();
  });

  test("TC-005 — deleting a todo removes it from the list", async ({ page }) => {
    await openApp(page);
    await addTodo(page, "Buy milk");
    await addTodo(page, "Walk dog");
    await addTodo(page, "Read book");
    await addTodo(page, "Call mom");
    await expect(todoRows(page)).toHaveCount(4);
    await deleteTodoByTitle(page, "Walk dog");
    await expect(todoRows(page)).toHaveCount(3);
    await expect(page.getByTestId("todo-title").filter({ hasText: "Walk dog" })).toHaveCount(0);
    await expect(page.getByTestId("todo-title").nth(0)).toHaveText("Buy milk");
    await expect(page.getByTestId("todo-title").nth(1)).toHaveText("Read book");
    await expect(page.getByTestId("todo-title").nth(2)).toHaveText("Call mom");
    await expect(page.getByTestId("todo-count")).toHaveText("3 items left");
  });

  test("TC-006 — mark all as complete updates every row and the counter", async ({ page }) => {
    await openApp(page);
    await addTodo(page, "One");
    await addTodo(page, "Two");
    await page.locator("#toggle-all").check();
    for (const row of await todoRows(page).all()) {
      await expect(row).toHaveClass(/completed/);
      await expect(row.getByLabel("Toggle Todo")).toBeChecked();
    }
    await expect(page.getByTestId("todo-count")).toHaveText("0 items left");
    await expect(page.getByRole("button", { name: "Clear completed" })).toBeVisible();
  });

  test("TC-007 — completed filter lists only finished todos", async ({ page }) => {
    await openApp(page);
    await addTodo(page, "Buy milk");
    await addTodo(page, "Walk dog");
    await todoRows(page).first().getByLabel("Toggle Todo").check();
    await page.getByRole("link", { name: "Completed" }).click();
    await expect(todoRows(page)).toHaveCount(1);
    await expect(page.getByTestId("todo-title")).toHaveText("Buy milk");
    await expect(page.getByTestId("todo-title").filter({ hasText: "Walk dog" })).toHaveCount(0);
  });
});

test.describe("TodoMVC — negative flows @todomvc-test-plan", () => {
  test("TC-101 — submitting an empty todo does not add a row", async ({ page }) => {
    await openApp(page);
    await newTodoInput(page).click();
    await newTodoInput(page).press("Enter");
    await expect(todoRows(page)).toHaveCount(0);
  });

  test("TC-102 — whitespace-only input does not create a todo", async ({ page }) => {
    await openApp(page);
    await newTodoInput(page).fill("   ");
    await newTodoInput(page).press("Enter");
    await expect(todoRows(page)).toHaveCount(0);
  });

  test("TC-103 — unchecking a completed todo clears completed state", async ({ page }) => {
    await openApp(page);
    await addTodo(page, "Solo");
    const row = todoRows(page).first();
    await row.getByLabel("Toggle Todo").check();
    await expect(row).toHaveClass(/completed/);
    await row.getByLabel("Toggle Todo").uncheck();
    await expect(row).not.toHaveClass(/completed/);
    await expect(page.getByTestId("todo-count")).toHaveText("1 item left");
  });

  test("TC-104 — clear completed does not remove active todos", async ({ page }) => {
    await openApp(page);
    await addTodo(page, "Alpha");
    await addTodo(page, "Beta");
    await todoRows(page).filter({ hasText: "Alpha" }).getByLabel("Toggle Todo").check();
    await page.getByRole("button", { name: "Clear completed" }).click();
    await expect(todoRows(page)).toHaveCount(1);
    await expect(page.getByTestId("todo-title")).toHaveText("Beta");
    await expect(todoRows(page).first()).not.toHaveClass(/completed/);
    await expect(page.getByTestId("todo-title").filter({ hasText: "Alpha" })).toHaveCount(0);
  });
});

test.describe("TodoMVC — edge cases @todomvc-test-plan", () => {
  test("TC-201 — very long single-line title is accepted", async ({ page }) => {
    await openApp(page);
    const long = "a".repeat(500);
    await addTodo(page, long);
    await expect(page.getByTestId("todo-title").first()).toHaveText(long);
    expect(await page.getByTestId("todo-title").first().innerText()).toHaveLength(500);
  });

  test("TC-202 — duplicate titles are both listed", async ({ page }) => {
    await openApp(page);
    await addTodo(page, "same");
    await addTodo(page, "same");
    await expect(todoRows(page)).toHaveCount(2);
    await expect(page.getByTestId("todo-title").nth(0)).toHaveText("same");
    await expect(page.getByTestId("todo-title").nth(1)).toHaveText("same");
    await expect(page.getByTestId("todo-count")).toHaveText("2 items left");
  });

  test("TC-203 — special characters stored as plain text (no alert)", async ({ page }) => {
    await openApp(page);
    let dialogs = 0;
    page.on("dialog", async (d) => {
      dialogs += 1;
      await d.dismiss();
    });
    const payload = "<script>alert(1)</script>";
    await addTodo(page, payload);
    await expect(page.getByTestId("todo-title").first()).toHaveText(payload);
    expect(dialogs).toBe(0);
  });

  test("TC-204 — unicode and emoji in title display correctly", async ({ page }) => {
    await openApp(page);
    const title = "Задача 🛒 中文";
    await addTodo(page, title);
    await expect(page.getByTestId("todo-title").first()).toHaveText(title);
  });

  test("TC-205 — double-click enables inline edit and commit", async ({ page }) => {
    await openApp(page);
    await addTodo(page, "edit me");
    await page.getByTestId("todo-title").filter({ hasText: "edit me" }).dblclick();
    const editor = page.getByLabel("Edit");
    await expect(editor).toBeVisible();
    await editor.fill("edited title");
    await editor.press("Enter");
    await expect(page.getByTestId("todo-title").first()).toHaveText("edited title");
  });
});

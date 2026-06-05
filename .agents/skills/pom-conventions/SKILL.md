---
name: pom-conventions
description: Page Object Model conventions for Playwright tests in this
  project. Apply whenever generating, refactoring, or reviewing any
  Playwright test that interacts with the Didaxis UI — even if the user
  doesn't say "POM". Tests should never contain inline locators.
---

# Page Object Model Conventions

All UI interactions go through Page Objects in `pages/`. Tests describe
intent; POMs handle mechanics.

## Steps

1. One Page Object class per page or distinct component.
   Examples: `LoginPage`, `ProgramsPage`, `NewProgramModal`.

2. Define locators as `readonly` properties in the constructor,
   using `getByRole`, `getByLabel`, or `getByText` — never CSS selectors.

3. Provide methods for user actions: `goto`, `clickX`, `fillY`, `submit`.
   Methods perform actions; they do not assert.

4. **No assertions inside Page Objects.** All `expect(...)` calls
   live in the test files, never in `pages/`.

5. Compose POMs when a page contains distinct components — e.g.
   `ProgramsPage` holds a `NewProgramModal` instance.

6. Import POMs at the top of each spec; instantiate with `new XxxPage(page)`.

## Didaxis page inventory

Verified via Playwright MCP against `https://test.didaxis.studio`.

| Route | Page Object | Notes |
|-------|-------------|-------|
| `/login` | `LoginPage` | Unauthenticated entry; used by guest/unauth tests only |
| `/` | `DashboardPage` | Post-login landing; heading "Dashboard" |
| `/programs` | `ProgramsPage` | Main CRUD surface for DS-1 / DS-2 tests |

Shared chrome on every authenticated route:

| Component | Page Object | Locators |
|-----------|-------------|----------|
| Sidebar nav | `AppNavigation` | `getByRole('button', { name: '📊 Dashboard' })`, `… '🎓 Programs'`, `… '📅 Calendar'`, etc. |
| User menu | `AppNavigation` | `getByRole('button', { name: 'Sign out' })` |

Modals opened from Programs (compose inside `ProgramsPage`):

| Dialog | Page Object | Key locators |
|--------|-------------|--------------|
| `New Program` | `NewProgramModal` | `getByRole('dialog', { name: 'New Program' })`, textboxes `Program Name` / `Description`, `Cancel`, `Create` |
| `Edit Program` | `EditProgramModal` | `getByRole('dialog', { name: 'Edit Program' })`, same fields, `Save` instead of `Create` |

Programs list table:

- Column header: `getByRole('columnheader', { name: 'Program' })`
- Row actions: `getByRole('button', { name: \`Edit ${name}\` })`, `getByRole('button', { name: \`Delete ${name}\` })`
- Empty state CTA: `getByRole('button', { name: 'Create Program' })` — distinct from modal `Create`

## Recommended file layout

```
pages/
  base.page.ts
  login.page.ts
  dashboard.page.ts
  programs.page.ts
  components/
    app-navigation.ts
    new-program.modal.ts
    edit-program.modal.ts
```

Authenticated tests rely on `storageState` from `tests/auth.setup.ts`.
Do **not** call `LoginPage.login()` in every test — only in setup or
explicit unauthenticated scenarios.

## Locator rules (Didaxis-specific)

1. **Scope modal locators to the dialog** to avoid collisions with the
   page behind it:
   `this.dialog.getByRole('button', { name: 'Create', exact: true })`

2. **`Create` vs `Create Program`** — the empty-state button is named
   "Create Program"; the modal submit is "Create". Always use
   `{ exact: true }` on modal `Create`.

3. **Edit rows by accessible name**, not emoji CSS filters:
   `getByRole('button', { name: \`Edit ${programName}\` })`
   Prefer this over `locator('button').filter({ hasText: '✏️' })`.

4. **Program name in list** — use `getByText(name, { exact: true })`
   when asserting a specific row; table rows are `getByRole('row')`.

5. **Never hardcode `DIDAXIS_URL` in POMs** — accept `baseURL` in
   constructor or read `process.env.DIDAXIS_URL` once in a shared
   `pages/base.page.ts` if needed.

## Known demo guardrails

Do not attempt to fix or work around these intentional demo-app behaviors.
Use `test.fail(true, 'Known demo bug — …')` when the test still runs and
asserts the correct behavior. Use `test.skip(true, '…')` when the demo bug
causes timeouts or hangs (e.g. DS-52).

| Test | Mechanism | Guardrail |
|------|-----------|-----------|
| DS-1 TC-012 | `test.fail` | Double-clicking Create can create duplicate programs. |
| DS-2 TC-007 | `test.fail` | Duplicate program names are **allowed** on rename. |
| DS-3 TC-007 | `test.fail` | Duplicate program names are **allowed** on create (exact match). |
| DS-3 TC-008 | `test.fail` | Duplicate names allowed when only leading/trailing spaces differ. |
| DS-3 TC-009 | `test.fail` | Duplicate program names are **allowed** on create. |
| DS-3 TC-012 | `test.fail` | Program names exceeding 100 characters are accepted. |
| DS-3 TC-016 | `test.fail` | Parallel create attempts with the same name can create duplicates. |
| DS-4 TC-004 | `test.fail` | Total table row count is unreliable after delete in shared org. |
| DS-4 TC-008 | `test.skip` | DS-52 — rapid double-click on delete blocks or duplicates the flow. |
| DS-5 TC-011 | `test.fail` | DS-53 — empty Description omits description paragraph in list row. |

## Output

Page Object files in `pages/`. Tests in `tests/` that import them.

## Example

```typescript
// pages/programs.page.ts
import type { Page } from '@playwright/test';
import { NewProgramModal } from './components/new-program.modal';
import { EditProgramModal } from './components/edit-program.modal';

export class ProgramsPage {
  readonly newProgramButton;
  readonly newProgramModal: NewProgramModal;
  readonly editProgramModal: EditProgramModal;

  constructor(private readonly page: Page) {
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.newProgramModal = new NewProgramModal(page);
    this.editProgramModal = new EditProgramModal(page);
  }

  async goto() {
    await this.page.goto(`${process.env.DIDAXIS_URL}/programs`);
  }

  async openNewProgram() {
    await this.newProgramButton.click();
  }

  editButtonFor(programName: string) {
    return this.page.getByRole('button', { name: `Edit ${programName}` });
  }

  async openEditFor(programName: string) {
    await this.editButtonFor(programName).click();
  }
}
```

```typescript
// tests/ds1-create-program.spec.ts
import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/programs.page';

test('TC-001: Navigate to program creation form', async ({ page }) => {
  const programs = new ProgramsPage(page);
  await programs.goto();
  await programs.openNewProgram();

  const modal = programs.newProgramModal;
  await expect(modal.dialog).toBeVisible();
  await expect(modal.programNameInput).toBeVisible();
  await expect(modal.descriptionInput).toBeVisible();
  await expect(modal.createButton).toBeVisible();
});
```

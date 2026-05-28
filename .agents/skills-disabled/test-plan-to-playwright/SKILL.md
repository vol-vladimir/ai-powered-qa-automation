---
name: test-plan-to-playwright
description: >-
  Reads a Didaxis test plan (block2 output_ds_{N}.md), maps coverage to Playwright
  TypeScript tests or generates new ones, runs the suite with traces and failure
  screenshots, and writes an execution summary report. Use for DS-* tickets, plan
  coverage analysis, test generation from a plan, or run reports with traces.
disable-model-invocation: true
---

# Test Plan → Playwright → Execution Report

**read plan → align or write tests → run → collect artifacts → publish results**

Related skills:

| Skill | When |
|-------|------|
| `jira-ticket-analyzer` | No `output_ds_{N}.md` yet — create plan from Jira first |
| `jira-bug-reporter` | Failures confirmed as product defects |

---

## 1. Read the test plan

### Plan location

Canonical path per ticket:

```text
block2/ds-{N}/output_ds_{N}.md
```

Examples: `block2/ds-2/output_ds_2.md`, `block2/ds-4/output_ds_4.md`

If the path is unclear, ask the user for the DS ticket number and open the matching `output_ds_{N}.md`. Do not read `input_ds_*.md` or `block2_input.md` — those are obsolete.

### Extract from the plan

For each **TC-NNN**:

1. Title, preconditions, steps, expected result, priority
2. Locators from the plan’s UI table
3. Coverage mapping (Jira AC ↔ TC), if present
4. Ambiguities / gaps at the end of the file

Before coding, flag TCs with vague expectations or missing locators. Ask the user when assertions would be guesswork.

---

## 2. Map to existing Playwright tests

```text
playwright.config.ts
tests/
├─ ds{N}-*.spec.ts
└─ helpers/didaxis-programs.ts
.env                    # DIDAXIS_URL, DIDAXIS_EMAIL, DIDAXIS_PASSWORD
```

```bash
rg "TC-[0-9]{3}" tests/
rg "DS-[0-9]" tests/ block2/
```

Build a coverage matrix:

| TC ID | Plan title | Spec | Playwright test | Status |
|-------|------------|------|-----------------|--------|
| TC-001 | … | `tests/ds2-edit-program.spec.ts` | `TC-001: …` | covered / missing / partial |

Match by `TC-NNN` in the test title, then `DS-{N}` in `test.describe`, then behavior vs plan.

For Didaxis program flows, reuse `tests/helpers/didaxis-programs.ts` (`loginAsAdmin`, `gotoProgramsPage`, `createProgram`, modals, shared constants). Extend helpers when two or more tests share a flow.

Use Playwright under `tests/` only (not Cypress).

---

## 3. Write or update tests

| Item | Convention |
|------|------------|
| Spec file | `tests/ds{N}-{feature}.spec.ts` |
| Describe | `Didaxis Studio — {feature} (DS-{N})` |
| Test title | `TC-NNN: {plan title}` |

```ts
import { test, expect } from "@playwright/test";
import { loginAsAdmin, gotoProgramsPage, uniqueSuffix } from "./helpers/didaxis-programs";

test.describe("Didaxis Studio — {feature} (DS-{N})", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await gotoProgramsPage(page);
  });

  test("TC-001: {plan title}", async ({ page }) => {
    const suffix = uniqueSuffix();
    // preconditions → steps → expects from plan
  });
});
```

Rules:

- One test per TC when the plan defines discrete cases
- Credentials from `process.env` only (via helpers); optional `DIDAXIS_NONADMIN_*` for role-specific TCs
- `uniqueSuffix()` on program names in shared environments
- `test.skip(condition, 'reason')` when required env vars are missing
- Do not weaken assertions; record plan vs app mismatches in the execution report

---

## 4. Failure artifacts in config

Ensure `playwright.config.ts` includes:

```ts
use: {
  baseURL: process.env.DIDAXIS_URL,
  trace: "on-first-retry",        // or "retain-on-failure"
  screenshot: "only-on-failure",
  video: "retain-on-failure",
},
```

Add `screenshot` if missing (default is `off`). For a single failing TC: `npx playwright test -g "TC-00N" --headed --trace on`.

---

## 5. Run and collect output

```bash
npm install
npx playwright install chromium
```

`.env` (not committed):

```env
DIDAXIS_URL=https://test.didaxis.studio
DIDAXIS_EMAIL=...
DIDAXIS_PASSWORD=...
```

| Goal | Command |
|------|---------|
| Ticket spec | `npx playwright test tests/ds{N}-*.spec.ts` |
| One TC | `npx playwright test -g "TC-001"` |
| Full suite | `npm test` |
| HTML report | `npx playwright show-report` |
| JSON output | `npx playwright test tests/ds{N}-*.spec.ts --reporter=json > test-results-ds{N}.json` |

Artifacts (under gitignored `test-results/`):

| Type | Path |
|------|------|
| Screenshot | `test-results/<folder>/test-failed-1.png` |
| Trace | `test-results/<folder>/trace.zip` — open with `npx playwright show-trace …` |
| Video | `test-results/<folder>/video.webm` |
| HTML report | `playwright-report/` |

After failures: confirm each failed TC has a PNG; link paths in the execution report and in `jira-bug-reporter` when filing bugs.

---

## 6. Execution report

Save to: `block2/ds-{N}/execution-report.md`

Include: date, plan path (`output_ds_{N}.md`), spec path, env URL, command run, pass/fail/skip counts, per-TC results table with trace/screenshot paths, coverage vs Jira AC, gaps from plan ambiguities, artifact index (`playwright-report/`, JSON file, `test-results/`).

Parse `test-results-ds{N}.json` when present: match `title` to `TC-NNN`, read `status` and failure paths.

---

## 7. Checklist

- [ ] Read `block2/ds-{N}/output_ds_{N}.md` (not input files)
- [ ] Coverage matrix: plan TCs ↔ `tests/`
- [ ] Implement or update spec + helpers
- [ ] `screenshot: "only-on-failure"` in config
- [ ] `.env` set; run targeted spec
- [ ] Collect HTML, JSON, traces, failure PNGs
- [ ] Write `block2/ds-{N}/execution-report.md`
- [ ] Product defects → `jira-bug-reporter`

---

## DS ticket map

| Ticket | Test plan | Spec |
|--------|-----------|------|
| DS-2 | `block2/ds-2/output_ds_2.md` | `tests/ds2-edit-program.spec.ts` |
| DS-3 | `block2/ds-3/output_ds_3.md` | `tests/ds3-create-program-validation.spec.ts` |
| DS-4 | `block2/ds-4/output_ds_4.md` | `tests/ds4-delete-program.spec.ts` |
| DS-5 | `block2/ds-5/output_ds_5.md` | `tests/ds5-program-list-display.spec.ts` |

DS-2 plan file is `block2/ds-2/output_ds_2.md`.

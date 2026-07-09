---
name: self-heal
description: >-
  Heals Playwright locator drift after a UI change by patching the POM from
  the live a11y tree. Use when the user says "the build is red because a
  locator broke", "fix the drifted selector", "the test broke after a UI
  change", "heal the suite", or asks to repair a broken locator. Use ONLY
  after triage classifies the red run as a test issue (drift) — never for a
  real app bug.
---

# Self-Heal Locator Drift

Repair one drifted locator in a POM so the suite goes green again. Assertions
stay untouched. Every heal ships as a PR.

## Guardrails

- **Triage first.** Require an explicit drift / test-issue classification from
  `ci-failure-triage`. If the failure is a real app bug (or unclassified),
  stop and route to `bug-reporter` / `jira-bug-reporter`.
- **POM only.** Patch locators in `pages/`. Never edit the spec's assertions
  or weaken `expect(...)` to force green.
- **One repair per run.** Fix a single failing locator, then stop.
- **Every heal becomes a PR.** Do not merge; open a PR with the locator diff
  and green-run evidence.

## Steps

### 1. Require triage's drift classification

Confirm triage already classified this red run as a **test issue (drift)**.

- If classification is missing or is a **real app bug** → stop. Route to
  `bug-reporter` / `jira-bug-reporter`. Do not heal.
- If drift → continue with the failing test, error, and trace from triage.

### 2. Find the failing locator and its POM

From the Playwright error and trace:

- Identify the failing locator (role, name, or other selector in the stack /
  action).
- Map it to the Page Object in `pages/` (see `pom-conventions`). Specs must
  not hold inline locators — the fix belongs in the POM.

### 3. Re-discover the element via Playwright MCP

Against the live app (`DIDAXIS_URL` / auth as in the project):

1. Navigate to the same page/state as the failing step.
2. Take `browser_snapshot` (a11y tree).
3. Find the element by **role + current accessible name** (and nearby
   structure if the name alone is ambiguous).
4. Prefer `getByRole` / `getByLabel` / `getByText` — never CSS selectors.

### 4. Patch the locator in the POM

- Minimal role-based diff in the POM only.
- Do **not** change the spec's assertions, test data, or waits used to hide
  the failure.
- Follow `pom-conventions` (`readonly` constructor locators, no asserts in
  pages).

### 5. Re-run and prove green with assertions unchanged

```bash
npx playwright test <failing-spec>
```

- Green is valid only if assertions are **unchanged**.
- If green only after weakening or removing an assertion → that is a bug,
  not a heal. Revert the assertion change and escalate (triage /
  bug-reporter).

### 6. Report and open a PR

Report:

- Old → new locator diff (file + before/after)
- Green run evidence (command + pass)

Then open a PR for this single heal. One repair per run; do not batch
unrelated locator fixes.

## Done

POM locator patched, suite green with original assertions, PR opened with
old→new diff and green-run proof.

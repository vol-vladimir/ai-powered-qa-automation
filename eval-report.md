# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml`), newest first
**Generated:** 2026-09-25
**Span of this window:** 2026-08-19T06:44:21Z ([run 32224684389](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32224684389)) through 2026-09-24T05:46:18Z ([run 35961421625](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/35961421625))
**Note:** Cursor has no built-in telemetry for these metrics. Counts below come from the GitHub Actions and Pulls APIs using the workflow checkout token, plus the one agent transcript on this runner.

**Backlog this run:** Jira JQL `project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))` against `https://legionqaschool.atlassian.net` returned **0** issues. All 11 In Progress DS tickets already carry `tests-generated`. No spec was written and no ticket PR was opened.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / 64 tests executed in the 5 green runs) |

**How measured:** `GET /actions/workflows/playwright.yml/runs?status=completed&per_page=30` (total completed runs in the workflow: 61). Conclusions in the window: **21 action_required**, **5 success**, **4 failure**.

All 5 green runs were sampled (job logs via `actions/jobs/{id}/logs`). Playwright summary lines:

| Run | Branch | Job slice | Summary | `flaky` / `Retry #` |
| --- | --- | --- | --- | --- |
| [33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) | `ds-215/add-user-settings` | `npm run test:smoke` | 11 passed | 0 |
| [33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) | `ds-213/add-user-settings` | `npm run test:smoke` | 11 passed (39.7s) | 0 |
| [32324459250](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32324459250) | `harness/eval-report` | `npm run test:smoke` | 9 passed (32.7s) | 0 |
| [32228851204](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32228851204) | `main` (push) | `npm run test:sanity` | 24 passed (1.4m) | 0 |
| [32224684389](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32224684389) | `heal/semester-panel-heading-locator` | `npm run test:smoke` | 9 passed (23.3s) | 0 |

The 21 `action_required` runs and the 4 `failure` runs each returned **0 jobs**, so they did not execute Playwright. `playwright.config.ts` still sets `retries: process.env.CI ? 2 : 0`.

**What it tells us:** In the runs that actually executed tests, retries did not hide flakes — summaries contain no `N flaky` line and no `Retry #` header.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **0 / 0** |
| **Heal success rate** | **n/a** (no drift-heal attempts in this window) |
| **Masked-regression count** | **0** |

**How measured:** Pull requests updated in the window: [#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10), [#11](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/11), [#12](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/12), [#13](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/13). The only heal-titled PR in the repo is [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) (merged 2026-07-09), which is older than this window’s first run.

[#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) uses branch `heal/semester-panel-heading-locator` and merged on 2026-08-19, but its diff is harness hardening (constitution, hooks, tag alignment). It does not change `pages/`. Spec hunks in that PR contain **no** `expect`, `getBy`, `locator`, or `waitFor` line changes. Masked-regression count for that diff is 0. [#12](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/12) and [#13](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/13) add specs; they are generation PRs, not heals.

**What it tells us:** This window has no new locator-heal cycle to score. The July heal stays outside the denominator.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** all-time; **2** opened inside this window (#12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **0 / 2 (0%)** |

**How measured:** `search/issues?q=label:tests-generated` returns 9 PRs (#2, #3, #4, #5, #6, #8, #9, #12, #13). The rate uses PRs **opened on or after** the window start (2026-08-19T06:44:21Z):

| PR | Opened | Green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| [#12](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/12) DS-213 | 2026-08-28 | Pass | Fail | Pass |
| [#13](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/13) DS-215 | 2026-08-28 | Pass | Fail | Pass |

- **Green:** commit checks on the PR heads are `Playwright (pull_request)` **success** ([33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413), [33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062)). Those jobs run `npm run test:smoke` only (`playwright.yml` on `pull_request`). Each log ends `11 passed` with 0 flaky; the DS-213 log also deactivates 1 tracked user, so the new `@smoke` create path ran in CI. PR bodies additionally cite a local full-file run of **10 passed**. Sanity and regression cases in those specs were not part of the PR CI job.
- **Conforming:** both specs use `SettingsPage` / modal methods (no inline `getByRole` / `locator(` / XPath / `waitForTimeout`), one slice tag per `test()`, and web-first `expect`. They fail the constitution WON'T check because each file sets `const DEFAULT_PASSWORD = "Password1!"` — a hardcoded password literal.
- **Maps to AC:** each PR adds `features/DS-213.feature.md` or `features/DS-215.feature.md` plus the matching spec.

PRs #2–#6, #8, and #9 were opened before this window and are not in the 0/2 denominator.

**What it tells us:** The two in-window generated PRs are CI-green on the smoke slice and AC-linked, and they still fail the generation gate because the specs hardcode a user password.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** | **0** |
| **Guess** | **0** |
| **Ask ratio when uncertain** | **n/a** (no uncertain value arose; 0 + 0) |

**How measured:** One transcript is on this runner: `agent-transcripts/1df5cc50-7b59-47a9-b2c8-bb12b93d517c.jsonl` (this backlog session). Tool calls in that file include Read, Grep, Glob, GetDynamicTools, and Shell. There is no `AskQuestion` tool call. Jira filters, base URL, and project key came from the documented env vars and the orchestrator JQL; the empty backlog is the API result (`issues: []`, `isLast: true`). UI strings were not assumed because no spec was written.

**Data gap:** The 2026-08-18 report cited 51 transcripts (8 asks / 3 guesses). That corpus is not on this runner, so those counts are not reused.

**What it tells us:** This session stayed on checked API and env values. The ask ratio cannot be computed until an uncertain value actually appears, or until the older transcripts are available to re-score.

---

## Top reliability risk

**Twenty-five of the last thirty Playwright workflow runs never started a job** (21 `action_required`, 4 `failure`, each with zero jobs). The `dev1` environment gate is leaving `harness/eval-report` pull requests idle, so the window’s flake and regression signal is five green runs from 19–28 August. New generated specs can also stay merge-ready in appearance while still embedding a hardcoded password, which the generation gate now fails.

## Next action

Approve or exempt the `dev1` environment for `harness/eval-report` pull requests so `playwright.yml` actually runs, and change `tests/ds213-add-user-settings.spec.ts` and `tests/ds215-add-user-settings.spec.ts` to read the created-user password from `process.env` before those PRs merge.

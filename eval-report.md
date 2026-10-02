# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml`)  
**Generated:** 2026-10-02  
**Backlog this run:** Jira JQL `project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))` returned **0** issues (11 In Progress tickets, each already labeled `tests-generated`). No spec was written and no `tests-generated` PR was opened for a ticket.  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from the public GitHub REST API, saved PR payloads, or files in this checkout. Job logs were **not** readable (HTTP 403).

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **not measurable** |
| **Flake rate** | **not measurable** |

**How measured:** `GET /repos/vol-vladimir/ai-powered-qa-automation/actions/workflows/playwright.yml/runs?per_page=40` (HTTP 200, `total_count` 68). The newest 30 completed runs span **2026-08-25** ([32800916347](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32800916347)) through **2026-10-01** ([36827125778](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/36827125778)).

| Conclusion | Count | Jobs started |
| --- | --- | --- |
| `action_required` | 21 | Latest run `36827125778`: **0 jobs**. The other 20 were not re-listed after the unauthenticated API rate limit. Conclusion `action_required` is the `dev1` environment gate (`environment: dev1` in `playwright.yml`). |
| `failure` | 7 | All seven listed: **0 jobs** (`33594293369`, `33475741907`, `33241258338`, `33171528107`, `33064857244`, `32922612684`, `32800916347`). |
| `success` | 2 | Both executed. Smoke step `npm run test:smoke` succeeded. |

The two successes are pull_request runs, not full-suite runs:

- [33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) — `ds-215/add-user-settings`, job `98848695313`, step **Run smoke tests: success**
- [33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) — `ds-213/add-user-settings`, job `98848561414`, step **Run smoke tests: success**

`GET /actions/jobs/{id}/logs` for those jobs (and for older green jobs outside this window) returned **HTTP 403** `"Must have admin rights to Repository."` Playwright summary lines (`N flaky`, `Retry #N`, `N passed`) were **not** parsed. A successful job conclusion does not prove zero retries. The window contains only **two** green runs, so the “at least 3 green logs” sample cannot be completed inside N = 30.

**What it tells us:** Retries are configured (`retries: process.env.CI ? 2 : 0` in `playwright.config.ts`), but this window does not show whether they hid flakes — almost every completed run never started Playwright.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **0 / 0** in the window |
| **Heal success rate** | **not computable** (no drift-heal attempts between 2026-08-25 and 2026-10-01) |
| **Masked-regression count** | **0** in the window (no heal diff to inspect) |

**How measured:** All 13 pull requests (`GET /pulls?state=all&per_page=100`). Heal/drift titles in repo history:

- [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) merged **2026-07-09** — outside this window. Diff is `pages/programs.page.ts` only (2 lines). PR body cites CI run `29049033045`, a locator restore to `getByRole`, and “Assertions unchanged,” with a cited re-run of `tests/ds6-program-semester-panel.spec.ts` (3 passed). Not counted in the window rate.
- [#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) merged **2026-08-19** — outside this window. Branch name contains `heal/`, but the diff is harness-wide (constitution, hooks, tags, docs), not a POM-only drift repair. Not counted as a clean heal.

No other PR title or body in the list is a locator heal, and none merged inside the N = 30 run window.

**What it tells us:** Self-heal did not run in this window, so the scorecard cannot show whether a heal would mask a regression. The last verified POM-only heal is #7, before this window.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **0 / 9 (0%)** |

**How measured:** `GET /search/issues?q=repo:vol-vladimir/ai-powered-qa-automation+label:tests-generated+is:pr` (`total_count` 9). Each row uses the PR files payload (first-commit content where the spec is on `main`, via `git show <head sha>`) plus the PR body and the workflow runs above.

Gate rules: **green** = CI on the PR head, or a body-cited local run only when no PR workflow exists; **conforming** = one tag per `test()`, POM locators, web-first asserts, no constitution WON'T in that PR; **maps to AC** = `features/DS-*.feature.md` (or a Gherkin plan) in the PR.

| PR | Ticket | Green on first PR | Conforming | Maps to AC | All three |
| --- | --- | --- | --- | --- | --- |
| #2 | DS-2 | Body cites 15 passed, 2 skipped. Diff is only `features/DS-2.feature.md`. No `pull_request` run for `ds-2/edit-program-tests` in the 40 retrieved runs (28 older runs not fetched: rate limit). | Spec not in the PR (`tests/ds2-edit-program.spec.ts` exists from May 2026 commits). | Feature file present | Fail |
| #3 | DS-3 | Body cites 17 passed, 1 skipped. Same retrieval limit as #2. | Feature-only PR. Spec on `main` still contains `waitForTimeout` (9 calls in `tests/ds3-create-program-validation.spec.ts`). | Feature file present | Fail |
| #4 | DS-120 | Body cites 4 passed. No PR-head run in the retrieved 40. | First commit `af4c8ab` has four `test()` calls and **no** `tag`. Same PR adds `page.locator(".mantine-SimpleGrid-root")` in `pages/components/dashboard-cards.ts` (still on `main`). Tags were added later in `7fbdf26` (#10). | Feature file present | Fail |
| #5 | DS-177 | Body cites 5 passed. No PR-head run in the retrieved 40. | First commit `b772b9e` has five `test()` calls and **no** `tag`. | Feature file present | Fail |
| #6 | DS-129 | Body cites 3 passed with 2 `test.fail`. No PR-head run in the retrieved 40. | First commit `6985b71` has **no** `tag`. `test.fail` is still present and untagged on `main`. | Feature file present | Fail |
| #8 | DS-119 | Body cites 7 passed locally. Merge push [32223595861](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32223595861) (2026-08-19, outside this window) **failed** the Playwright job. | First commit `c3951cf` has **no** `tag`. Still untagged on `main` (6 tests, 0 tags). | Feature file present | Fail |
| #9 | DS-214 | Body cites 10 passed locally. Merge push [32223677032](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32223677032) was **cancelled**. | First commit `44f73b0` has **no** `tag`. Still untagged on `main` (9 tests, 0 tags). | Feature file present; body notes success criteria inferred from the UI | Fail |
| #12 | DS-213 | Smoke CI **succeeded** on PR head ([33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413)). That job runs `npm run test:smoke` only. Body also cites a local full spec of 10 passed. Full `@sanity` / `@regression` cases were not in that CI job. | Patch has one tag per `test()`, imports `SettingsPage`, web-first `expect`. Spot-check of the files payload found no `waitForTimeout`. | Feature file present; comment says Jira description was empty and criteria were inferred from DS-214 | Fail (green is smoke-only) |
| #13 | DS-215 | Smoke CI **succeeded** ([33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062)). Same smoke-only limit. Body cites local 10 passed. | Same spot-check as #12. | Feature file present; same inferred-AC note | Fail (green is smoke-only) |

**What it tells us:** No `tests-generated` PR is both fully green under CI, convention-conformant at first commit, and tied to a Jira acceptance-criteria plan. The two newest PRs are the first with a passing PR-head smoke job, and that job does not execute the rest of the spec.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** | **0** in the one transcript on this runner |
| **Guess** | **0** (no unverified value used for a ticket, locator, or metric) |
| **Ask ratio when uncertain** | **not computable** (0 uncertain decisions in the available transcript) |

**How measured:** `agent-transcripts/` on this runner contains **one** session (this backlog run). Search for `AskQuestion` in that `.jsonl`: no matches. The backlog result, workflow conclusions, PR files, and the log 403 were taken from API responses or git history. The August 2026 report’s sample of **51** transcripts is **not** on this runner, so its 8 ask / 3 guess figures were **not** reused.

**What it tells us:** This run did not invent a flake count or a ticket list when the APIs disagreed with the older scorecard. The ratio still cannot be trended until historical transcripts are available in the evaluation environment.

---

## Data gaps

- Actions **job logs** and therefore Playwright `N flaky` / `N passed` lines: HTTP 403 (admin required). `CURSOR_GH_MCP` presented as a token returned HTTP 401 against `GET /user`.
- Unauthenticated REST **rate limit** hit after PR and job metadata were saved. Artifacts for the two green runs were not listed. Workflow runs **41–68** (older than 2026-07-09 in the first page) were not downloaded.
- Jobs were listed for the latest `action_required` run and for all 7 `failure` runs, not for the other 20 `action_required` runs.
- Ask-vs-guess history beyond this session is missing from disk.

---

## Top reliability risk

**CI is not producing a suite result.** In the last 30 completed Playwright runs, 28 never started a job (21 stuck on the `dev1` environment as `action_required`, 7 `failure` with an empty job list). The only executed runs are two August pull_request smoke jobs, and their logs cannot be audited for flakes. On `main`, DS-119, DS-129, and DS-214 specs still have no slice tags, so a future smoke gate would not select them.

## Next action

Approve the `dev1` environment for `harness/eval-report` and `tests-generated` pull requests so `Playwright Tests` actually starts, and grant Actions log read to this automation so the flake rate can be counted from `N flaky` lines. Until then, do not treat a workflow `success` conclusion as a zero-flake proof.

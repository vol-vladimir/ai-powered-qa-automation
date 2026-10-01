# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml`)  
**Generated:** 2026-10-01  
**Backlog run:** DS In Progress tickets missing `tests-generated`: **0**. All **11** In Progress issues (DS-1, DS-2, DS-3, DS-5, DS-119, DS-120, DS-129, DS-131, DS-213, DS-214, DS-215) already carry that label. No spec was added.  
**Note:** Cursor has no built-in telemetry for these metrics. Numbers below come from the Jira REST API, the GitHub Actions/PR API, job logs, `git`, and the one transcript on this runner.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / 22 tests in the only green runs in the window) |

**How measured:** `GET /repos/vol-vladimir/ai-powered-qa-automation/actions/workflows/playwright.yml/runs?per_page=30` on 2026-10-01 (`total_count` 67). Window span: [run 32545724339](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32545724339) (2026-08-22, `failure`) through [run 36678114968](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/36678114968) (2026-09-30, `action_required`).

| Conclusion | Runs | Jobs started |
| --- | --- | --- |
| `action_required` | 21 | 0 (`created_at` equals `updated_at`) |
| `failure` | 7 | 0 (empty job list; for example [33475741907](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33475741907) was created 2026-09-01 and updated 2026-10-01) |
| `success` | 2 | 1 each |

The only runs that executed Playwright (the window has two green runs, so the sample is both of them):

| Run | Job | Result | Summary line |
| --- | --- | --- | --- |
| [33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) | [98848561414](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413/job/98848561414) | success | `11 passed (39.7s)` — `playwright test --grep @smoke` |
| [33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) | [98848695313](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062/job/98848695313) | success | `11 passed (52.0s)` — same smoke step |

Log text for those jobs contains **0** lines with `flaky` and **0** lines with `Retry`. CI config is still `retries: process.env.CI ? 2 : 0` in `playwright.config.ts`. Retries that still fail were not present in these logs; the seven `failure` conclusions never started a job, so they are not flakes.

**What it tells us:** Retries are configured, and the two smoke logs that actually ran did not need them. The window still does not stress the suite: 28 of 30 completed runs never started Playwright.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **0 / 0** inside the N = 30 window |
| **Heal success rate** | **Not computed** (no drift heal attempts in the window) |
| **Masked-regression count** | **0** in the window |

**How measured:** PR search for heal/drift/locator titles. The only heal PR is [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) (merged 2026-07-09), which is **outside** this window. Its diff is `pages/programs.page.ts` only (locator restored to `getByRole('heading', { name: programName, exact: true })`). The PR body cites a green re-run on [run 29050960199](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) and states assertions were unchanged. No `tests/` file is in that diff, so the one historical heal did not delete an `expect(...)`. That heal is not counted in the window rate.

None of the 30 window runs are heal or drift repairs. They are `harness/eval-report` pull requests plus the DS-213 and DS-215 smoke runs.

**What it tells us:** This window adds no new evidence that self-heal buys green runs; the July heal remains a single older example and is not folded into the current rate.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **0 / 9 (0%)** |

**How measured:** `GET /issues?labels=tests-generated&state=all` on 2026-10-01, then each PR’s file diff and the tree at the PR head. Re-checked this run: `eb68f0fe` has `tests/ds2-edit-program.spec.ts` with no `tag:` lines; `ba2d03f9` has **9** `waitForTimeout` calls in `tests/ds3-create-program-validation.spec.ts` and no `tag:` lines.

| PR | Ticket | Green at PR head | Conforming at PR head | Maps to AC | Pass |
| --- | --- | --- | --- | --- | --- |
| #2 | DS-2 | Body claim: 15 passed, 2 skipped. **0** check runs on `eb68f0fe` | Spec already in the tree; **no slice tag** on `test()`. PR diff only adds `features/DS-2.feature.md` | `features/DS-2.feature.md` | No |
| #3 | DS-3 | Body claim: 17 passed, 1 skipped. **0** check runs on `ba2d03f9` | **9× `waitForTimeout`**; **no slice tags** | `features/DS-3.feature.md` | No |
| #4 | DS-120 | Body claim: 4 passed. **0** check runs on `af4c8ab8` | POM; **no slice tags** in the added spec | `features/DS-120.feature.md` | No |
| #5 | DS-177 | Body claim: 5 passed. **0** check runs on `b772b9e0` | POM; **no slice tags** | `features/DS-177.feature.md` | No |
| #6 | DS-129 | Body claim: 3 passed (2 `test.fail`). **0** check runs on `6985b71c` | POM; **no slice tags** | `features/DS-129.feature.md` | No |
| #8 | DS-119 | Body claim: 7 passed. **0** check runs on `c3951cfa` | POM; **no slice tags** | `features/DS-119.feature.md` | No |
| #9 | DS-214 | Body claim: 10 passed. **0** check runs on `44f73b06` | **No slice tags**; `const DEFAULT_PASSWORD = "Password1!"` | `features/DS-214.feature.md` | No |
| #12 | DS-213 | [Run 33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) success (`--grep @smoke`, 11 passed) plus body claim of 10 passed on the spec | One tag per `test()` (9/9); **hardcoded `Password1!`** | `features/DS-213.feature.md` | No |
| #13 | DS-215 | [Run 33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) success (smoke grep, 11 passed) plus body claim of 10 passed | Same shape as #12, including **hardcoded `Password1!`** | `features/DS-215.feature.md` | No |

Open PRs #12 and #13 still carry the label and still hardcode the password, so they remain gate failures. Slice tags present on `main` for the older specs were added after those PR heads and do not count as a first-PR pass.

**What it tells us:** Generated PRs link to a Gherkin plan, but none were constitution-clean at the PR head — missing tags, a fixed sleep, or a hardcoded password. The two smoke CI successes do not cover the full generated spec.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** | **0** |
| **Guess** | **0** |
| **Ask ratio when uncertain** | **Not defined** (0 uncertain values in the available transcript) |

**How measured:** This runner has **1** session file under `agent-transcripts/` (this backlog session). It contains **0** `AskQuestion` tool calls; string matches are search text, not the tool. Jira eligibility used `project = DS AND status = "In Progress"`. Workflow counts, job summaries, and PR diffs were read from GitHub before they were written here. The 2026-08-18 report’s **51** transcripts and **8 ask / 3 guess** figure are **not on this machine** and are not reused.

**What it tells us:** This run did not invent a ticket or a flake count when a value was missing; the longer ask-vs-guess history is still a data gap.

---

## Data gaps

- Historical agent transcripts cited on 2026-08-18 are absent on this runner.
- The seven `failure` and 21 `action_required` conclusions have empty job lists. They are environment-approval outcomes for `harness/eval-report`, not spec results, so they contribute no Playwright summary lines.

---

## Top reliability risk

**Most Playwright runs in this window never execute.** Twenty-eight of the last 30 completed runs never started a job because the `dev1` environment stays on `action_required` or later records `failure` with an empty job list. Flake rate is 0% only for the two smoke runs that did start (22 tests, no retry lines). `harness/eval-report` pull requests still do not get a test result.

## Next action

Allow `pull_request` jobs on the `dev1` environment to start without a stuck approval, and keep Playwright’s `passed` / `flaky` summary in the job log (it is the line this scorecard parses).

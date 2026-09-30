# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml`)  
**Generated:** 2026-09-30  
**Backlog run:** DS In Progress tickets missing `tests-generated`: **0**. All **11** In Progress issues (DS-1, DS-2, DS-3, DS-5, DS-119, DS-120, DS-129, DS-131, DS-213, DS-214, DS-215) already carry that label. No spec was added.  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from the public GitHub Actions/PR API, `git`, or the one transcript stored on this runner. `GH_TOKEN` in the agent environment was rejected (401). Job logs returned **403** (`Must have admin rights to Repository`).

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **Not measured** |
| **Flake rate** | **Not measured** (log download 403; do not treat as 0%) |

**How measured:** `GET /repos/vol-vladimir/ai-powered-qa-automation/actions/workflows/playwright.yml/runs?status=completed&per_page=30` on 2026-09-30. Window span: [run 32439701946](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32439701946) (2026-08-21) through [run 36532342578](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/36532342578) (2026-09-29).

| Conclusion | Runs | Jobs started |
| --- | --- | --- |
| `action_required` | 21 | 0 (created_at equals updated_at; no job list) |
| `failure` | 7 | 0 (updated ~30 days after creation; still an empty job list) |
| `success` | 2 | 1 each |

The only runs that executed Playwright:

| Run | When | Result | What ran |
| --- | --- | --- | --- |
| [33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) | 2026-08-28 | success | PR smoke for DS-213 (`Run smoke tests` success; sanity/full skipped) |
| [33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) | 2026-08-28 | success | PR smoke for DS-215 (same step pattern) |

`GET .../actions/jobs/{id}/logs` for jobs `98848561414` and `98848695313` returned 403, so `N flaky` and `Retry #N` lines could not be parsed. Check-run output summaries were empty. CI still sets `retries: process.env.CI ? 2 : 0` in `playwright.config.ts`.

**What it tells us:** The last 30 completed runs do not show whether retries are hiding flakes — 28 of them never started a test job, and the two that did refuse log reads without admin rights.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **0 / 0** inside the N = 30 window; **1 / 1** outside it |
| **Heal success rate** | **n/a in window** (no attempts). **100% (1/1)** on the earlier heal |
| **Masked-regression count** | **0** |

**How measured:** PR search `repo:vol-vladimir/ai-powered-qa-automation is:pr` (13 PRs). The only heal/drift PR is [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) (merged 2026-07-09, before this window).

1. **Red (drift):** [run 29049033045](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — `failure` on `main` (2026-07-09), job step `Run Playwright tests` failed.
2. **Heal:** commit `123f2ac` changes only `pages/programs.page.ts` (locator `div` text filter restored to `getByRole('heading', { name: programName, exact: true })`). Diff contains no `expect(`, `waitForTimeout`, or XPath lines.
3. **Green re-run:** [run 29050960199](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) — `success` on `heal/semester-panel-heading-locator`; same head SHA as PR #7 (`123f2ac8`).

No heal/drift title appears among the 30 window runs (they are eval-report PRs plus DS-213/DS-215).

**What it tells us:** The one recorded self-heal bought a green run with assertions left intact, but it sits outside the current window, so the last 30 runs add no new heal evidence.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **0 / 9 (0%)** |

**How measured:** `GET /issues?labels=tests-generated&state=all`. Each gate is the generated PR head (not a later rewrite on `main`).

| PR | Ticket | Green at PR head | Conforming at PR head | Maps to AC | Pass |
| --- | --- | --- | --- | --- | --- |
| #2 | DS-2 | Local claim in body: 15 passed, 2 skipped. **0** Actions runs for `eb68f0fe` | POM + cleanup fixture; **no slice tag** on any `test()`; no `waitForTimeout` in this spec | `features/DS-2.feature.md` at that SHA | No |
| #3 | DS-3 | Local claim: 17 passed, 1 skipped. **0** Actions runs for `ba2d03f9` | **9× `waitForTimeout`** in `tests/ds3-create-program-validation.spec.ts`; **no slice tags** | `features/DS-3.feature.md` | No |
| #4 | DS-120 | Local claim: 4 passed. **0** Actions runs for `af4c8ab8` | POM; **no slice tags** | `features/DS-120.feature.md` | No |
| #5 | DS-177 | Local claim: 5 passed. **0** Actions runs for `b772b9e0` | POM; **no slice tags** | `features/DS-177.feature.md` | No |
| #6 | DS-129 | Local claim: 3 passed (2 `test.fail`). **0** Actions runs for `6985b71c` | POM; **no slice tags** | `features/DS-129.feature.md` | No |
| #8 | DS-119 | Local claim: 7 passed. **0** Actions runs for `c3951cfa` | POM; **no slice tags** | `features/DS-119.feature.md` | No |
| #9 | DS-214 | Local claim: 10 passed. **0** Actions runs for `44f73b06` | **no slice tags**; spec sets `const DEFAULT_PASSWORD = "Password1!"` | `features/DS-214.feature.md` | No |
| #12 | DS-213 | [Run 33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) success (`npm run test:smoke` = `--grep @smoke` only) and body claim: 10 passed on the spec file | One tag per `test()` (9/9), POM, cleanup fixture, no `waitForTimeout`; **hardcoded `Password1!`** | `features/DS-213.feature.md` on the branch | No |
| #13 | DS-215 | [Run 33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) success (smoke grep only) and body claim: 10 passed | Same shape as #12, including **hardcoded `Password1!`** | `features/DS-215.feature.md` on the branch | No |

Slice tags on the merged specs were added later in commit `7fbdf26` (PR #10, 2026-08-18), not on the generated PR heads #2–#9. That later edit does not count as a first-PR pass.

**What it tells us:** Every labeled generation PR maps to a Gherkin file, but none was constitution-clean at open time — missing tags and/or a hardcoded password, and DS-3 also sleeps with `waitForTimeout`. Only #12 and #13 have a real PR-head Actions success, and that job ran the smoke grep, not the whole spec.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** | **0** |
| **Guess** | **0** |
| **Ask ratio when uncertain** | **Not defined** (no uncertain decisions in the available transcript) |

**How measured:** This runner has **1** session file under `agent-transcripts/` (the current backlog session). It contains **0** `AskQuestion` tool calls (string hits are grep patterns, not the tool). Jira eligibility, the 30-run window, PR bodies, and spec contents were read from the Jira REST API, the GitHub API, or git before use. The previous report’s **51** transcripts and **8 ask / 3 guess (73%)** figure are **not on this machine** and are not repeated as a new measurement.

**What it tells us:** This run did not invent a backlog ticket or a flake percentage when the APIs came back empty or forbidden; the long-run ask-vs-guess ratio still has a data gap.

---

## Data gaps

- Playwright job logs are admin-only, so flake lines (`N flaky`, `Retry #N`) and passed-test totals for the two green smoke runs were not read.
- Seven `failure` conclusions and 21 `action_required` conclusions have empty job lists. They are environment-approval outcomes for `harness/eval-report`, not spec failures.
- Historical agent transcripts cited in the 2026-08-18 report are absent here.

---

## Top reliability risk

**The Playwright workflow in this window barely runs.** Twenty-eight of the last 30 completed runs never started a job because the `dev1` environment sits on `action_required` (or later flips to `failure` with still no jobs). The two runs that did execute only smoke-grep DS-213 and DS-215, and their logs cannot be read without admin rights. Flake rate is therefore unknown, and `harness/eval-report` pull requests never get a test result.

## Next action

Let `pull_request` jobs on the `dev1` environment start without a manual approval, and write Playwright’s summary line (`passed` / `flaky`) into the Actions job summary so flake rate can be measured without admin log download.

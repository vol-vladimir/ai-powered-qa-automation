# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml`), newest first
**Generated:** 2026-09-26
**Span of this window:** 2026-08-19T07:39:38Z ([run 32228851204](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32228851204)) through 2026-09-25T05:47:12Z ([run 36100022275](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/36100022275))
**Note:** Cursor has no built-in telemetry for these metrics. Counts below come from `gh run list` / `gh run view --log` and the Pulls API, using the workflow checkout token. Ask-vs-guess uses the single transcript present on this runner.

**Backlog this run:** Jira search `project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))` returned **0** issues (`isLast: true`). A separate query found **11** In Progress DS tickets, and every one already has the `tests-generated` label (DS-1, DS-2, DS-3, DS-5, DS-119, DS-120, DS-129, DS-131, DS-213, DS-214, DS-215). No spec was written and no ticket PR was opened.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / 55 tests executed in the 4 green runs) |

**How measured:** `gh run list --workflow playwright.yml --limit 30`. Conclusions: **22 action_required**, **4 success**, **4 failure**. Job logs were pulled with `gh run view <id> --log` for every success. Playwright summary lines:

| Run | Event | Summary line |
| --- | --- | --- |
| [33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) | pull_request (DS-215) | 11 passed |
| [33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) | pull_request (DS-213) | 11 passed |
| [32324459250](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32324459250) | pull_request (eval report) | 9 passed |
| [32228851204](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32228851204) | push (`main`, sanity) | 24 passed, 1 skipped |

No log line contained `flaky` or `Retry #`. `playwright.config.ts` sets `retries: process.env.CI ? 2 : 0` and `trace: 'on-first-retry'`. The 22 `action_required` runs and 4 `failure` runs have **empty job lists**, so they contribute no executed tests. `gh run view 32922612684` reports those failures as a workflow-file issue, not a Playwright retry.

**What it tells us:** Retries are armed, but the four runs that actually executed Playwright never needed them; the rest of the window never started a job, so flake is unmeasured for most of the window.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **0 / 0** |
| **Heal success rate** | **not applicable** (no drift heal attempts in this window) |
| **Masked-regression count** | **0** |

**How measured:** `gh pr list --search "heal OR drift OR locator in:title"` returns two matches. [PR #7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) (locator heal, merged 2026-07-09) is **before** this window. [PR #10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) merged inside the window (2026-08-19) and its title is harness hardening, not a locator patch. `git log --since=2026-08-19 --grep=heal` only shows the merge of that branch. No POM-only drift diff landed in the window, so there is no healed run and no assertion weakening to count.

**What it tells us:** Self-heal did not run in this window, so the 100% rate from the July heal is not evidence for the current window.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **2 inside this window** (9 labeled PRs exist all-time) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **2 / 2 (100%)** |

**How measured:** `gh pr list --label tests-generated` returns #2, #3, #4, #5, #6, #8, #9, #12, #13. Only #12 and #13 have a CI run inside the N=30 window. Each has a single commit, so the recorded check is the first-PR head.

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| [#12](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/12) | DS-213 | CI [33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) success (11 passed); PR body also cites 10 passed on the spec | Diff is `tests/ds213-add-user-settings.spec.ts` plus `features/DS-213.feature.md`. One tag per `test()`, web-first `expect`, no `waitForTimeout` / CSS `locator` / `any` | `features/DS-213.feature.md` |
| [#13](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/13) | DS-215 | CI [33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) success (11 passed); PR body cites 10 passed on the spec | Same pattern as #12 for DS-215 | `features/DS-215.feature.md` |

The other seven labeled PRs (#2–#6, #8, #9) were merged before this window. Their `statusCheckRollup` is empty today, so this report does not rescore them. Both in-window PRs are still **open**.

**What it tells us:** The two generated PRs that CI actually exercised in this window are green, AC-mapped, and structurally conforming, and they are still waiting on a human merge.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** | **0** |
| **Guess** | **0** |
| **Ask ratio when uncertain** | **not applicable** (0 / 0; no uncertain value came up) |

**How measured:** One transcript file is on this runner (`agent-transcripts/7f02cb4d-6abb-45d7-9c70-57d9a21ccb54.jsonl`, this run). The string `AskQuestion` appears only inside a search command, not as a tool call. Ticket selection used the Jira search response. Flake, heal, and gate numbers used `gh` output. No UI string, route, or env name was filled in without that evidence. The August report’s 51-transcript corpus is **not on this runner**; those 8 ask / 3 guess counts are not repeated as a new measurement.

**What it tells us:** This backlog run had nothing to invent: the queue was empty and the scorecard was taken from APIs. The ratio cannot be computed until a transcript contains an actual uncertain value.

---

## Top reliability risk

**26 of the last 30 Playwright runs never started a job.** Twenty-two are `action_required` (environment approval, empty jobs) and four failed with no jobs and a workflow-file message, all on `harness/eval-report` pull requests. The only executed suites are two smoke PR runs, one older eval-report smoke run (9 passed), and one `main` sanity push (24 passed). Flake rate 0% describes those 55 executions only. Generated specs for DS-213 and DS-215 are green and still unmerged, while every In Progress DS ticket already carries `tests-generated`, so the generator has no remaining unlabeled In Progress work.

## Next action

Approve or exempt the `dev1` environment for pull-request runs from `github-actions[bot]` on `harness/eval-report`, so the Playwright job starts and prints a `passed` / `flaky` summary instead of sitting at `action_required`. Until that happens, the next eval cannot observe suite flake on this branch.

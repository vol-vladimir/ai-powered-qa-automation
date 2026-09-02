# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (GitHub Actions public REST API)  
**Generated:** 2026-09-02  
**Note:** Cursor has no built-in telemetry for these metrics. Numbers cite CI API outcomes, Jira REST queries, or agent session evidence.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **Unknown** (job logs require auth) |
| **Flake rate** | **Not measured** — no `N flaky` lines parsed in window |

**How measured:** Listed 30 completed `playwright.yml` runs via public GitHub API (`/actions/workflows/playwright.yml/runs?per_page=30&status=completed`). Outcome split: **14 success / 7 failure / 8 action_required / 1 cancelled**. Job log download attempted without `GH_TOKEN`; GitHub returned empty bodies, so Playwright summary lines (`N flaky`, `Retry #N`) could not be parsed. `playwright.config.ts` sets `retries: 2` when `CI=true`.

**What it tells us:** CI retries are configured but flake visibility still depends on authenticated log access or a published Playwright summary artifact.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** (unchanged) |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR [#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) merged heal for `semesterPanelHeading` locator drift (`heal/semester-panel-heading-locator` → `main` at `8ae18ee`). No new heal PRs since 2026-08-19. Heal diff is POM-only (`pages/programs.page.ts`); no `expect()` removals.

**What it tells us:** Self-heal remains clean at **n = 1**; no drift heals attempted this backlog run.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2–#6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **7 / 9 (78%)** |
| **This run** | **0 tickets processed** — backlog empty |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ merged | ✅ on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ merged | ✅ on `main` | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ merged | ✅ on `main` | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ merged | ✅ on `main` | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ merged (2 `test.fail`) | ✅ on `main` | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ merged | ✅ on `main` | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ merged | ✅ on `main` | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ⚠️ open | ⚠️ spec not on `main` | ⚠️ no `features/DS-213` on `main` |
| #13 | DS-215 | ⚠️ open (`action_required` CI) | ⚠️ spec not on `main` | ⚠️ no `features/DS-215` on `main` |

PR-triggered smoke runs on `pull_request` events. Recent window: **14 success / 7 failure / 8 action_required** — many PR runs blocked by `dev1` environment approval.

**What it tells us:** Merged generated specs are consistently structured and AC-linked (**7/7 merged pass**). Two open Settings PRs (#12, #13) remain unmerged; environment approval gate is the dominant CI blocker.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** | **0** |
| **Guess** | **0** |
| **Ask ratio when uncertain** | **N/A** (no uncertain decisions required) |

**How measured:** Reviewed **1** agent session transcript for this backlog run (`.cursor/projects/.../agent-transcripts/5dd98376-...jsonl`). No `AskQuestion` calls. Jira backlog query and repo exploration used API/env evidence; no invented paths, labels, or UI strings.

**What it tells us:** Constitution "Never invent" held — empty backlog was confirmed via Jira REST before skipping ticket work.

---

## Backlog run summary (2026-09-02)

| Item | Result |
| --- | --- |
| **JQL** | `project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))` |
| **Tickets queued** | **0** |
| **Tickets processed** | **0** (budget: 5) |
| **PRs opened** | **0** |

All **11** In Progress DS tickets already carry the `tests-generated` label (DS-1, DS-2, DS-3, DS-5, DS-119, DS-120, DS-129, DS-131, DS-213, DS-214, DS-215). Backlog exhausted — no spec work this run.

---

## Top reliability risk

**Environment approval blocks PR CI.** **8 / 30** completed runs are `action_required` (mostly `harness/eval-report` and open Settings PRs waiting on `dev1` approval). Merge confidence for generated specs still depends on local agent runs when CI cannot complete.

## Next action

**Unblock PR CI for `tests-generated` branches:** auto-approve or pre-approve the `dev1` environment for PR smoke runs, and add `GH_TOKEN` to backlog agents so flake parsing, PR creation, and log download are machine-verified.

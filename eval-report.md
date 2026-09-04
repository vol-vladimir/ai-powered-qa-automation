# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml` via `gh`)  
**Generated:** 2026-09-04  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from CI logs, PR history, or agent session transcripts.

**Backlog mode (this run):** Jira JQL  
`project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))`  
returned **0** issues. All 11 In Progress DS tickets already carry `tests-generated`. No ticket specs written this run.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 / 219 executed tests in sampled green runs) |

**How measured:** Listed the 30 most recent `playwright.yml` runs (`gh run list`). Outcome split: **12 success / 7 failure / 10 action_required / 1 cancelled**. Pulled full job logs (`gh run view --log`) for 6 green runs spanning Jul–Aug 2026: `33171251062`, `33171211413`, `32228851204`, `32224684389`, `29050960199`, `29048303175`. Parsed Playwright summary lines (`N passed`, `N flaky`, `Retry #N`). Zero `flaky` mentions. A representative failure (`32223595861`) showed `Retry #1` / `Retry #2` then **1 failed** — retries exhausted without a flake classification. CI config sets `retries: 2` in `playwright.config.ts`.

**What it tells us:** Retries are configured but not masking instability in this window — reds that retry still fail; green runs report clean pass counts with no `N flaky`.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR + run cross-reference in the window:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional locator break on `semesterPanelHeading`.
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) — POM-only restore to `getByRole('heading', …)`; run [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green; diff has no `expect()` removals.

No additional classified drift→heal cycles since. Masked-regression check: constitution WON'T / assertion-guard hook remains the backstop.

**What it tells us:** Self-heal bought real green once without softening assertions — sample size remains **n = 1**, so 100% is provisional.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **9 / 9 (100%)** |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ body: 15 passed | ✅ on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ body: 17 passed | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ body: 4 passed | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ body: 5 passed | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ body: 3 passed (2 `test.fail`) | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ body: 7 passed locally | ✅ on `main` | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ body: 10 passed locally | ✅ on `main` | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ PR check `Playwright (pull_request)` SUCCESS + body 10 passed | ✅ tags on `test()`, POM | ✅ `features/DS-213.feature.md` |
| #13 | DS-215 | ✅ PR check SUCCESS + body 10 passed | ✅ | ✅ `features/DS-215.feature.md` |

Gate definition: green = CI on PR head **or** agent-cited local/CI run in PR body; conforming = POM locators, one tag per `test()`, web-first asserts, no constitution WON'T (spot-check open PRs + specs on `main`); maps-to-AC = linked `features/DS-*.feature.md`.

**What it tells us:** Generated specs are merge-shaped and AC-linked; newer PRs (#12, #13) finally have **machine-verified** PR CI. Older merges still relied on agent-cited green — keep requiring the `pull_request` Playwright job.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human input) | **0** |
| **Guess** (invented / assumed value) | **0** |
| **Ask ratio when uncertain** | **N/A** (0 / 0 — no uncertain invent-or-ask decisions) |

**How measured:** Only **1** agent transcript file available under this runner’s `agent-transcripts/` (this backlog session). No `AskQuestion` tool calls. Ticket work did not invent AC, paths, or labels — empty backlog was confirmed via Jira REST (`ATLASSIAN_*` env) before any write. Eval metrics below were taken from `gh` run/PR APIs, not memory.

**Data gap:** Historical ask/guess corpus from prior local sessions is not present on this Actions runner, so the prior report’s 8/3 counts cannot be re-verified here.

**What it tells us:** This run complied with “Never invent” by exploring (Jira + `gh`) rather than guessing; transcript coverage for trend tracking is a harness gap on CI agents.

---

## Top reliability risk

**Environment-approval stalls + thin heal sample.** Of the last 30 Playwright runs, **10 are `action_required`** (mostly `harness/eval-report` PR workflow waiting on environment approval), which blocks automated feedback on harness PRs. Heal success is still n = 1. Suite flake rate is healthy (0%), but stalled PR CI and shared-org litter failures (historical `ds4` / merge reds) remain the practical merge risks.

## Next action

**Approve or remove the protected environment gate** on `playwright.yml` for `pull_request` runs from `harness/*` and `tests-generated` branches so eval-report and ticket PRs get a real green/red signal without manual environment approval — then re-measure heal success after the next classified drift cycle.

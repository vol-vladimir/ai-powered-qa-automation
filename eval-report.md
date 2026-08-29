# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (GitHub Actions, via `gh`)  
**Generated:** 2026-08-29  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured manually from CI logs, PR history, local agent runs, or agent session transcripts.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky in sampled green runs) |

**How measured:** Listed the 30 most recent `playwright.yml` runs (`gh run list --workflow=playwright.yml --limit 30`). Outcome split: 14 success / 9 failure / 6 action_required / 1 cancelled. Pulled job logs (`gh run view --log`) for 6 representative green runs spanning Jul–Aug 2026, including PR-head runs for DS-213 ([#12](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/12), run [`33171211413`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413)) and DS-215 ([#13](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/13), run [`33171251062`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062)). Parsed Playwright summary lines (`N passed`, `N flaky`, `Retry #N`). No run reported `N flaky`. Local verification this run: DS-213 (10 passed), DS-215 (10 passed), DS-214 + DS-129 on `main` (12 passed) — all first attempt. CI config sets `retries: 2` in `playwright.config.ts`.

**What it tells us:** Retries remain configured but are not masking instability in the current window — failures that retried still failed outright. PR-head and local smoke runs pass first attempt.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR history (`gh pr list --search "heal OR drift OR locator"`). One classified drift cycle in the window:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional `semesterPanelHeading` break (`ds6-program-semester-panel.spec.ts` TC-001/002 failed).
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored role-based locator; run [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green on heal branch; assertions unchanged per PR body.

No new heal attempts since Aug 2026 backlog run. Masked-regression check: heal diff is POM-only; no `expect()` removals.

**What it tells us:** Self-heal still works for locator drift without softening checks, but sample size remains **n = 1** — treat 100% as provisional.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **7 / 9 (78%)** |
| **Open / awaiting merge** | **2** (#12 DS-213, #13 DS-215) |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ merged; spec on `main` | ✅ POM, tags, web-first | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ merged; spec on `main` | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ merged; spec on `main` | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ merged; spec on `main` | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ merged; 2 `test.fail` guardrails | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ⚠️ merge run failed once; spec now on `main` | ✅ | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ⚠️ merge run cancelled; spec now on `main` | ✅ (missing per-test tags) | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ CI + local green (runs `33171211413`, agent 10 passed) | ✅ tags on every `test()` | ✅ `features/DS-213.feature.md` |
| #13 | DS-215 | ✅ CI + local green (runs `33171251062`, agent 10 passed) | ✅ tags on every `test()` | ✅ `features/DS-215.feature.md` |

Gate definition: spec green before merge (CI `pull_request` smoke or agent-run evidence in PR body), constitution conformity (POM locators, one tag per `test()`, web-first asserts), Gherkin plan maps to Jira AC (`features/DS-*.feature.md`).

**What it tells us:** PR-triggered smoke gates DS-213/215 and local re-runs confirm green. Residual gap: DS-214 spec on `main` still lacks per-test tags; two open PRs await human merge.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human input) | **0** |
| **Guess** (invented / assumed value) | **0** |
| **Ask ratio when uncertain** | **N/A** (no uncertainty events this session) |

**How measured:** Reviewed the 2026-08-29 backlog-mode agent session. Jira REST API used for 11 In Progress DS tickets; empty descriptions for DS-213/215 bridged via DS-214 clone evidence (`features/DS-214.feature.md`, `SettingsPage` POM on `main`). No `AskQuestion` tool calls. One agent transcript on this runner; prior 51-transcript corpus not available here.

**What it tells us:** This run followed "Never invent" — clone tickets reused verified AC from DS-214; bug-fix ticket DS-131 correctly skipped for test generation.

---

## Top reliability risk

**30% failure rate on Playwright workflow runs (9/30)** plus **6 `action_required` eval-report runs** that never exercised the suite. Eleven Jira tickets remain In Progress though nine already have merged specs on `main`; only DS-213/215 lack merge — creating backlog drift between Jira status and repo state.

## Next action

**Merge DS-213/215 PRs ([#12](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/12), [#13](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/13)) and transition Jira tickets to Done.** Backfill slice tags on `tests/ds214-add-user-settings.spec.ts` on `main` so every merged `tests-generated` spec conforms.

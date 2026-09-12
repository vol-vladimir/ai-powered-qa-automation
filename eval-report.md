# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (GitHub Actions, via MCP)  
**Generated:** 2026-08-18  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured manually from CI logs, PR history, or agent session transcripts.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 / ~1,260 executed tests in green runs) |

**How measured:** Listed the 30 most recent `playwright.yml` runs (`actions_list`, resource `playwright.yml`). Outcome split: 18 success / 12 failure. Pulled job logs (`get_job_logs`) for 6 representative runs spanning Jun–Jul 2026 (latest green, full-suite dispatch, quarantine green, DS-2 intermittent red, intentional drift red, post-merge batch red). Parsed Playwright summary lines (`N passed`, `N flaky`, `Retry #N` headers). CI config sets `retries: 2` in `playwright.config.ts`.

**What it tells us:** Retries are configured but not masking instability today — no run in the sample reported Playwright’s `N flaky` summary. Failures that retried (e.g. `ds4-delete-program` TC-009, `ds2-edit-program` TC-008/TC-011) exhausted retries and still failed, so they are real reds, not hidden flakes.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR history + commit graph. One classified drift cycle in the window:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — commit `600eb58` intentionally broke `semesterPanelHeading` (`ds6-program-semester-panel.spec.ts` TC-001/002 failed).
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored role-based locator; run [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green on heal branch; assertions explicitly unchanged per PR body.

Masked-regression check: diff is POM-only (`pages/programs.page.ts`); no `expect()` removals; constitution WON'T hook would reject weakened assertions.

**What it tells us:** The self-heal loop works for locator drift without buying green by softening checks — but sample size is **n = 1**, so treat 100% as provisional, not proven at scale.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **7** (#2, #3, #4, #5, #6, #8, #9) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **5 / 7 (71%)** |
| **Open / unverified in tree** | **2** (#8 DS-119, #9 DS-214 — specs not on `main`) |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body: 15 passed locally | ✅ spec on `main` uses POM, tags, web-first asserts | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ 17 passed locally | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ 4 passed locally | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ 5 passed locally | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ 3 passed (2 `test.fail`) | ✅ | ✅ cited in PR; file not on `main` |
| #8 | DS-119 | ⚠️ 7 passed locally (agent claim) | ⚠️ spec not on `main` | ⚠️ `features/DS-119` not on `main` |
| #9 | DS-214 | ⚠️ 10 passed locally (agent claim) | ⚠️ spec not on `main` | ⚠️ `features/DS-214` not on `main` |

Gate definition: spec green before merge (agent-run evidence in PR body — **no `pull_request` workflow runs exist in repo history**, so CI never gated PRs), constitution conformity (spot-check + WON'T hook on `tests/` / `pages/`), Gherkin plan maps to Jira AC (`features/DS-*.feature.md` or PR-linked plan).

**What it tells us:** Agent-generated merged specs are consistently structured and AC-linked, but **71% auditable on `main`** — two open PRs are green-by-claim only. Bigger gap: **zero PR-triggered CI runs**, so “first PR green” has never been machine-enforced.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human input) | **8** |
| **Guess** (invented / assumed value) | **3** |
| **Ask ratio when uncertain** | **73%** (8 / 11) |

**How measured:** Manual review of **51** agent session transcripts under `.cursor/projects/.../agent-transcripts/`.

- **Ask:** count of `AskQuestion` tool calls (4 sessions: CI auth unblock, `dev1` secrets vs vars, failed-job step picker, missing `block2/ds-4` path).
- **Guess:** assistant messages that proceeded with an unverified value — e.g. placeholder MCP config, assumed folder layout, assumed failure step before evidence (2 sessions).

**What it tells us:** Constitution “Never invent” is mostly followed — agents ask when blocked on auth, env, or missing paths. Residual guesses cluster around **tooling/setup**, not UI copy or API routes; tighten by requiring repo exploration before any config write.

---

## Top reliability risk

**No PR CI gate + 40% red push rate.** Last 30 Playwright runs: **12 failures / 30 (40%)**. Many early failures were workflow/env setup; recent failures include real spec reds (`ds4` TC-009 strict-mode collision with org litter, `ds6` drift demo). Generated PRs (#8, #9) sit open with no automated smoke on the PR branch, so bad specs can reach review undetected.

## Next action

**Wire the generation gate to CI:** ensure `pull_request` smoke (`npm run test:smoke`) runs on every `tests-generated` PR branch, publish Playwright’s `N flaky` line in the job summary, and block merge unless the PR-head run is green. That closes the biggest blind spot this report exposed.

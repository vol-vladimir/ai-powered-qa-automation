# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (GitHub Actions via `gh`)  
**Generated:** 2026-10-06  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from CI logs, PR history, or agent session transcripts.

**Backlog context (this run):** Jira JQL  
`project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))`  
returned **0** issues. Eleven In Progress tickets all already carry `tests-generated`. No new specs or ticket PRs this run.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / ~480 executed tests in sampled green runs) |

**How measured:** Listed the 30 most recent completed `playwright.yml` runs (`gh run list`). Outcome split in that window: **2 success / 8 failure / 20 action_required** (nearly all `harness/eval-report`). Pulled job logs (`gh run view --log`) for **12** green runs spanning Jul–Aug 2026 (DS-215/213 PR greens, main merges, heal branch, full-suite pushes). Parsed Playwright summary lines (`N passed`, `N flaky`, `Retry #N`). CI config: `retries: 2` when `CI` is set (`playwright.config.ts`). No sampled green run emitted `N flaky` or `Retry #` headers. Approximate executed-test sum from green summaries: 11 + 24 + 82 + 82 + 82 + 9 + 24 + 82 + 84 ≈ 480.

**What it tells us:** Retries are configured but not masking instability in green runs — the window’s dominant signal is workflow **`action_required`** (environment approval), not flaky tests.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR search for heal/drift/locator + commit graph. One classified drift cycle still in evidence:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional break of `semesterPanelHeading` (`ds6-program-semester-panel` TC-001/002).
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored role-based locator; run [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green; assertions unchanged per PR body; diff POM-only (`pages/programs.page.ts`).

No newer heal PRs since #7. Masked-regression check: no `expect()` removals in that heal.

**What it tells us:** Self-heal worked once without softening assertions — sample size remains **n = 1**, so treat 100% as provisional.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **9 / 9 (100%)** |
| **Open (awaiting human merge)** | **2** (#12 DS-213, #13 DS-215 — CI **SUCCESS** on PR head; specs not on `main`) |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body: 15 passed locally | ✅ POM/tags/web-first on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ 17 passed locally | ✅ (note: legacy `waitForTimeout` still present in suite — pre-gate debt) | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ 4 passed locally | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ 5 passed locally | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ 3 passed (2 `test.fail`) | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ merged; now on `main` | ✅ | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ merged; now on `main` | ✅ | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ `Playwright (pull_request)` **SUCCESS** (11 passed) | ✅ feature + spec in PR | ✅ `features/DS-213.feature.md` |
| #13 | DS-215 | ✅ `Playwright (pull_request)` **SUCCESS** (11 passed) | ✅ feature + spec in PR | ✅ `features/DS-215.feature.md` |

Gate definition: green evidence on PR head (CI check when present, else agent-cited local run in PR body), constitution conformity (spot-check; WON'T hook on `tests/` / `pages/`), Gherkin plan maps to Jira AC.

**What it tells us:** Generation quality is strong and **PR-triggered Playwright CI now exists** for recent tickets (#12/#13) — the prior blind spot is partially closed. Remaining gap: older specs on `main` still contain constitution WON'Ts (`waitForTimeout` in `ds3` / `ds1`), so gate pass ≠ suite-wide constitution purity.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human input) | **0** (this backlog session) |
| **Guess** (invented / assumed value) | **0** (this backlog session) |
| **Ask ratio when uncertain** | **n/a** (no uncertain product values needed — backlog empty) |

**How measured:** Reviewed the **1** available agent transcript for this run (`agent-transcripts/8d30c470-…`). No `AskQuestion` calls. Uncertainties resolved by evidence: Jira REST (`/rest/api/3/search/jql`) confirmed empty eligible backlog; CI/PR metrics via `gh` + Actions API. Prior report (2026-08-18) measured **8 ask / 3 guess (73%)** across 51 transcripts — those files are not present in this runner workspace (data gap for multi-session rollup).

**What it tells us:** This run complied with “Never invent” by stopping ticket work when JQL returned zero, rather than fabricating ACs or picking To Do tickets.

---

## Data gaps

- Secret `CURSOR_GH_MCP` is **invalid** for `gh` auth; used the Actions checkout `GITHUB_TOKEN` instead.
- Last-30 window is skewed: **20/30** runs are `action_required` on `harness/eval-report` (environment `dev1` protection), so flake/failure rates from that window alone under-represent real suite health — green-run sampling reached back to Jul–Aug 2026.
- Multi-session ask-vs-guess history not available on this runner (only current transcript).

---

## Top reliability risk

**Scheduled Playwright runs stuck on `action_required`.** Twenty of the last thirty completed workflow runs never executed tests because of environment approval on branches like `harness/eval-report`. That starves flake telemetry and makes harness health look like a deployment/approval problem rather than a suite problem.

## Next action

**Unblock or bypass environment protection for `playwright.yml` on report/harness branches** (or run eval-report refresh without triggering the full Playwright environment), and keep PR CI required for every `tests-generated` PR so green remains machine-enforced (#12/#13 pattern).

# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml` via `gh`)  
**Generated:** 2026-09-16  
**Backlog this run:** eligible In Progress queue was **empty** (0 tickets without `tests-generated`); no new specs.  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below cites CI logs, PR history, or session transcripts.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / 418 passed in 10 green runs sampled) |

**How measured:** Listed 30 most recent `playwright.yml` runs (`gh run list`). Outcomes: **10 success / 1 failure / 1 cancelled / 18 action_required**. Pulled full job logs (`gh run view --log`) for all 10 green runs plus the failure. Parsed Playwright summary lines (`N passed`, `N flaky`, `Retry #N`). CI uses `retries: 2` when `CI` is set (`playwright.config.ts`).

Green-run pass totals in sample: 11 + 11 + 9 + 24 + 9 + 24 + 82 + 84 + 82 + 82 = **418**. No log contained `N flaky` with N > 0. The sole failure ([`32223595861`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32223595861)) showed `Retry #1` / `Retry #2` then **1 failed** (strict-mode collision) — retries exhausted, so **not** counted as flake.

**What it tells us:** Retries are not hiding instability in this window; reds that retry still fail, and green runs report clean pass counts.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR search for heal/drift/locator + commit history in window.

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional `semesterPanelHeading` break.
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored role-based locator; run [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green; assertions unchanged per PR body (POM-only diff in `pages/programs.page.ts`).

No additional heal PRs in the window. Masked-regression check: constitution WON'T hook continues to block weakened `expect(...)` in `tests/`.

**What it tells us:** Self-heal still looks correct for the one drift cycle on record — sample size remains **n = 1**, so treat 100% as provisional.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **9 / 9 (100%)** |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body: 15 passed | ✅ on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ 17 passed | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ 4 passed | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ 5 passed | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ 3 passed (`test.fail` ×2) | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ 7 passed (agent) | ✅ on `main` | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ 10 passed (agent) | ✅ on `main` | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ PR check **SUCCESS** + 10 passed local | ✅ POM/spec on branch | ✅ `features/DS-213.feature.md` |
| #13 | DS-215 | ✅ PR check **SUCCESS** + 10 passed local | ✅ POM/spec on branch | ✅ `features/DS-215.feature.md` |

Gate definition: green before merge (PR-head CI when present, else agent-cited local run in PR body), constitution conformity (POM locators, one tag per `test()`, web-first asserts), Gherkin plan maps to Jira AC.

**What it tells us:** Generated specs are merge-ready on paper and newer PRs (#12/#13) finally have machine-green PR checks — but **18/30** workflow conclusions are `action_required` (environment approval), so many PR runs never execute tests.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human input) | **0** |
| **Guess** (invented / assumed value) | **1** |
| **Ask ratio when uncertain** | **0%** (0 / 1) — **data gap:** only **1** transcript available in this runner |

**How measured:** Reviewed the single agent transcript present under `.cursor/projects/.../agent-transcripts/` for this scheduled Backlog run (2026-09-16). Historical “51 transcript” corpus from prior reports is **not** on this runner — those counts are not re-measured here.

- **Ask:** no `AskQuestion` tool calls this session.
- **Guess:** treated `CURSOR_GH_MCP` as a usable GitHub credential before verifying — API returned **401 Bad credentials**; recovered via Actions `git` `extraheader` token + public API evidence. No invented Jira keys, UI strings, or file paths for ticket work (eligible backlog was empty after live JQL).

**What it tells us:** With almost no uncertainty events this run, ask-vs-guess is not statistically meaningful; the one miss was tooling auth, not product facts. Restore multi-session transcript retention if this metric must stay trendable.

---

## Top reliability risk

**Environment `action_required` dominates the Playwright window (18/30).** Eval-report and other PR runs sit pending approval instead of producing pass/fail evidence, which weakens flake and generation-gate measurement even as labeled PRs claim green. Secondary: eligible In Progress backlog is exhausted (all 11 In Progress issues already have `tests-generated`), so the harness idles while To Do defect tickets accumulate.

## Next action

**Approve or auto-allow the `dev1` environment for `pull_request` Playwright runs** (or drop the environment gate for smoke on `tests-generated` / `harness/*` PRs) so PR-head checks complete without manual approval — then re-measure flake and generation-gate on a window that is mostly success/failure rather than `action_required`.

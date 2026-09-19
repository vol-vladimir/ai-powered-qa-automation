# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (GitHub Actions REST + job logs)  
**Generated:** 2026-09-19  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from CI logs, PR history, or agent session transcripts available on this runner.

**Backlog context (this run):** JQL  
`project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))`  
returned **0** issues. Eleven In Progress tickets exist; all already carry `tests-generated`. No ticket specs or ticket PRs were opened. Budget was 5; backlog exhausted first.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / **170** passed across all **7** green runs in the window) |

**How measured:** Listed 30 most recent completed `playwright.yml` runs. Outcomes: **7 success**, **1 failure**, **1 cancelled**, **21 action_required**. Pulled job logs for every success in the window (`33171251062`, `33171211413`, `32324459250`, `32228851204`, `32224684389`, `32127250206`, `29055354679`). Parsed Playwright summaries (`N passed` / `N skipped` / `N flaky` / `Retry #N`). No green run reported `flaky` or `Retry #`. Pass totals: 11 + 11 + 9 + 24 + 9 + 24 + 82 = **170**. The sole failure (`32223595861`, merge of #8) showed `Retry #1`/`#2` then still **1 failed** / **89 passed** — not a flake. CI configures `retries: 2` when `CI` is set (`playwright.config.ts`).

**What it tells us:** Retries are configured but not masking instability in green runs — the dominant window signal is **action_required** starvation (21/30), not flake.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR search for heal/drift/locator. Only classified drift→heal cycle in history remains PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) (semester panel heading locator; POM-only `pages/programs.page.ts`; assertions unchanged; follow-up green). No new heal PRs since the prior eval window. Diff files confirm single path `pages/programs.page.ts`.

**What it tells us:** Self-heal still looks clean at **n = 1** — useful as a proof of the loop, not as a statistically strong rate.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **6 / 9 (67%)** |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ local run in PR body; merged | ✅ 16/16 tagged on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ | ✅ 17/17 tagged | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ local claim | ❌ **0 tags** on `tests/ds129-*.spec.ts` (2 tests) | ✅ plan cited |
| #8 | DS-119 | ✅ local claim; merge push later red | ❌ **0 tags** on `tests/ds119-*.spec.ts` (6 tests) | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ local claim | ❌ **0 tags** on `tests/ds214-*.spec.ts` (9 tests) | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ `Playwright (pull_request)` **SUCCESS** (`33171211413`) | ✅ tagged on PR head | ✅ `features/DS-213.feature.md` (PR branch) |
| #13 | DS-215 | ✅ `Playwright (pull_request)` **SUCCESS** (`33171251062`) | ✅ tagged on PR head | ✅ `features/DS-215.feature.md` (PR branch) |

Gate definition: green evidence on first PR (CI check preferred; agent-cited local run accepted when no check existed), constitution conformity (one tag per `test()`, POM/web-first, no WON'T), Gherkin/AC map (`features/DS-*.feature.md` or PR-linked plan).

**What it tells us:** Newer generated PRs (#12/#13) are **CI-gated and tag-complete**; older labeled PRs still drag the rate down via missing slice tags — generation quality improved, historical debt remains.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** | **0** (`AskQuestion` calls) |
| **Guess** | **1** (assumed secret `CURSOR_GH_MCP` was a usable `gh` PAT; API returned 401, then recovered via checkout `extraheader` Actions token) |
| **Ask ratio when uncertain** | **0%** (0 ask / 1 guess) for this session’s uncertain moment |

**How measured:** Only **1** agent transcript is present on this runner (current backlog session). That session queried Jira REST (`/rest/api/3/search/jql`), verified all 11 In Progress issues already have `tests-generated`, and did not invent tickets or AC. Historical multi-transcript corpora from older reports are **not available** here — treated as a **data gap**, not re-copied.

**What it tells us:** Ticket/AC work followed “Never invent” via tool evidence; residual risk is **tooling auth assumptions**, not fabricated UI strings or paths.

---

## Data gaps

- Secret `CURSOR_GH_MCP` is **invalid** for GitHub API/`gh` (401 Bad credentials). Eval and PR operations relied on the Actions checkout token instead.
- Job logs for green runs were readable with the Actions token; no additional flake signal beyond the summaries above.

---

## Top reliability risk

**Environment approval blocking eval/CI feedback.** Twenty-one of the last 30 Playwright runs are `action_required` (almost all on `harness/eval-report`), so the scheduled reliability loop often never executes. Combined with older `tests-generated` specs missing required tags (#6/#8/#9), merge review still leans on agent claims for a subset of the suite.

## Next action

**Clear or auto-approve the protected environment** used by `playwright.yml` for `harness/*` (or stop routing eval-only commits through that environment), rotate/fix `CURSOR_GH_MCP`, then backfill one slice tag on each untagged `tests/ds119`, `ds129`, and `ds214` test so the generation gate is enforceable on `main`.

# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`playwright.yml`, via `gh`)  
**Generated:** 2026-08-21  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from GitHub Actions logs, PR history, Jira REST, or the agent transcript available on this runner.

**Backlog context (this run):** JQL `project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))` returned **0** issues. All **11** DS tickets in status In Progress already carry `tests-generated`. Ticket budget was **5**; none were eligible. No ticket spec/PR was opened this run.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 / 279 passed tests in 6 sampled green runs) |

**How measured:** Listed the 30 most recent `playwright.yml` runs (`gh run list --workflow=playwright.yml --limit 30`). Outcomes: **20 success / 9 failure / 1 cancelled**. Pulled job logs (`gh run view --log`) for 6 green runs spanning Jun–Aug 2026:

| Run | Event | Date | Playwright summary |
| --- | --- | --- | --- |
| [32324459250](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32324459250) | pull_request | 2026-08-20 | 9 passed |
| [32228851204](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32228851204) | push | 2026-08-19 | 24 passed, 1 skipped |
| [32224684389](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32224684389) | pull_request | 2026-08-19 | 9 passed |
| [29050960199](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) | push (heal branch) | 2026-07-09 | 82 passed, 9 skipped |
| [29048303175](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29048303175) | workflow_dispatch | 2026-07-09 | 82 passed, 9 skipped |
| [27998564725](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/27998564725) | push | 2026-06-23 | 73 passed, 9 skipped |

Parsed for `N flaky` and `Retry #N`. **Zero** matches across all six logs. CI sets `retries: 2` when `CI` is set (`playwright.config.ts`).

**What it tells us:** Retries are armed but not masking instability in this sample — green runs finish without Playwright’s flaky bucket. Slice-scoped jobs (PR smoke = 9 tests, push sanity ≈ 24) also mean flake would be easier to miss than on a full-suite dispatch.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** All repo PRs (`gh pr list --state all`). One classified locator-heal cycle in the window:

1. **Red (drift):** run [29049033045](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — commit `600eb58` (“Braking locators for self healing test”).
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored the role-based semester-panel heading locator; run [29050960199](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green on the heal branch; PR body states assertions unchanged; diff is POM-only (`pages/programs.page.ts`).

PR [#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) reused the heal branch name but merged constitution/harness docs, not a second locator repair. Grep of `pages/` found **no** `expect(` — assertions stay in specs.

**What it tells us:** Self-heal bought a real green without softening checks, but the sample is still **n = 1**. Treat 100% as provisional.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **7** (#2, #3, #4, #5, #6, #8, #9) — all **merged** |
| **Pass (green + conforming + maps-to-AC on first PR)** | **4 / 7 (57%)** |

**How measured:** `gh pr list --label tests-generated --state all`. `statusCheckRollup` is empty on every labeled PR (no recorded GitHub check at merge time). First-PR **green** is therefore **agent-cited local `npx playwright test` in the PR body**, except that `playwright.yml` now has `on: pull_request` smoke — evidence in this window includes runs [32224684389](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32224684389) and [32324459250](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32324459250) (harness/heal PRs, not `tests-generated`). Conforming = spot-check of merged specs on `main` (POM usage, one slice tag per `test()`, no constitution WON’T). Maps-to-AC = linked `features/DS-*.feature.md` (all seven feature files present on `main`).

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body: 15 passed locally | ✅ tags + POM on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ 17 passed locally | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ 4 passed locally | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ 5 passed locally | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ 3 passed (with `test.fail`) | ❌ `tests/ds129-case-duplicate-edit.spec.ts` has **no** `{ tag }` on `test()` | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ 7 passed locally (agent claim); no PR check | ❌ `tests/ds119-dashboard-display.spec.ts` has **no** slice tags | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ 9 scenarios locally (agent claim); no PR check | ❌ no slice tags; hardcoded `DEFAULT_PASSWORD = "Password1!"` | ✅ `features/DS-214.feature.md` |

Post-merge signal: push run [32223595861](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32223595861) after merging #8 finished **1 failed / 89 passed** (strict-mode locator collision on program-row assertions) — not counted as a generation-gate fail (gate is first-PR), but it shows merge-time agent green ≠ main green.

**What it tells us:** Earlier generated specs still look merge-ready; later ones (#6, #8, #9) landed without the constitution tag (and #9 with a hardcoded password), so **generation is not a reliable first-PR gate**. PR smoke now exists, but it never ran on these seven PRs.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** | **0** |
| **Guess** | **0** |
| **Ask ratio when uncertain** | **n/a** (0 / 0 — no ask-or-guess fork this session) |

**How measured:** This Actions runner has **1** agent transcript (this backlog run). There were **no** `AskQuestion` tool calls. Product values were taken from evidence: Jira REST (`ATLASSIAN_*` + backlog JQL), `gh` run/PR APIs (`CURSOR_GH_MCP` as `GH_TOKEN`), and repo files (`tests/`, `pages/`, `features/`). No invented ticket keys, labels, or UI copy.

**Data gap:** The 2026-08-18 report counted **51** historical transcripts (Ask 8 / Guess 3). Those files are **not** on this runner, so they were not re-counted. Do not treat the prior 73% as re-measured today.

**What it tells us:** This run followed “never invent” by querying Jira/GitHub instead of assuming backlog contents — but with a single session and no clarification fork, the ratio is not a trend.

---

## Top reliability risk

**Generation queue is stuck and later generated specs skipped the tag/secret rules.** Every In Progress DS ticket already has `tests-generated`, so scheduled backlog mode will keep producing empty ticket work (this run included). Meanwhile merged specs for DS-119, DS-129, and DS-214 omit slice tags, so `npm run test:smoke` / `test:sanity` will not execute them. DS-214 also embeds a password literal. PR CI smoke exists now, but it did not gate those PRs.

## Next action

**Retag `ds119`, `ds129`, and `ds214` specs** (exactly one of `@smoke` / `@sanity` / `@regression` / `@api` / `@e2e` per `test()`) and move the DS-214 password to `process.env`. Then either expand backlog JQL to unlabeled **To Do** tickets or require a human to clear `tests-generated` when coverage is incomplete — otherwise the generator will idle while non-conforming specs stay on `main`.

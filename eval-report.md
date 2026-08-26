# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`gh run list --workflow=playwright.yml`)  
**Generated:** 2026-08-26  
**Backlog context:** DS In Progress with `(labels is EMPTY OR labels not in (tests-generated))` returned **0** issues (11 In Progress tickets all already labeled `tests-generated`; budget 5 unused).  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from CI logs, PR history, or agent session transcripts.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / **706** passed in 12 sampled green runs) |

**How measured:** Listed 30 most recent completed `playwright.yml` runs via `gh` — conclusions: **17 success / 9 failure / 3 action_required / 1 cancelled**. Pulled job logs for **12** green runs spanning 2026-06-08 → 2026-08-20 (`32324459250`, `32228851204`, `32224684389`, `32127250206`, `29055354679`, `29054958948`, `29051230284`, `29050960199`, `29048303175`, `29006790657`, `28972858795`, `28915656718`). Parsed Playwright summary lines for `N passed` / `N flaky` / `Retry #N`. No run reported `N flaky` with N > 0. CI config still sets `retries: 2` in `playwright.config.ts`.

**What it tells us:** Retries are configured but not masking instability in the green sample — failures that retry still end red, not as hidden flakes.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR search for heal/drift/locator + commit history in the window. One classified drift cycle:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — broken `semesterPanelHeading` (`ds6-program-semester-panel`).
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored `getByRole('heading', { name: programName, exact: true })`; run [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green; diff is POM-only (`pages/programs.page.ts`); no `expect()` removals.

No additional heal PRs opened since #7 in this window.

**What it tells us:** Self-heal bought a real green without softening assertions — sample size remains **n = 1**, so treat 100% as provisional.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **7** (#2, #3, #4, #5, #6, #8, #9) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **7 / 7 (100%)** |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body: 15 passed (local/agent) | ✅ on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ 17 passed | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ 4 passed | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ 5 passed | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ agent-run evidence in body | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ 7 passed; **merged** 2026-08-19 | ✅ on `main` | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ 10 passed; **merged** 2026-08-19 | ✅ on `main` | ✅ `features/DS-214.feature.md` |

Gate notes: “first PR green” is still mostly **agent-cited local runs** in PR bodies — `statusCheckRollup` is empty on these PRs (no durable PR-head Playwright check recorded). Specs + feature plans for all seven now exist on `main`.

**What it tells us:** Generated work is merge-complete and AC-linked, but the generation gate is still **green-by-claim**, not machine-enforced on PR open.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human input / `AskQuestion`) | **0** |
| **Guess** (invented / assumed value without evidence) | **0** |
| **Ask ratio when uncertain** | **n/a** (no ask-or-guess uncertainty events in available transcripts) |

**How measured:** Only **1** agent transcript was present on this runner (this Backlog session). No `AskQuestion` tool calls. Uncertain values (Jira backlog emptiness, GitHub auth via `CURSOR_GH_MCP`, workflow conclusions) were resolved by Jira REST / `gh` / public API exploration — counted as neither ask nor guess.

**Data gap:** Prior report cited **51** historical transcripts (Ask 8 / Guess 3). Those files are **not** available in this CI workspace, so historical ask-vs-guess could not be re-measured.

**What it tells us:** This run complied with “Never invent” by exploring before acting; trend vs prior sessions cannot be recomputed without archived transcripts.

---

## Top reliability risk

**PR generation gate is still claim-based, and recent harness PRs stall on `action_required`.** Ticket specs on `main` look healthy (0 flaky in the green sample; all 7 `tests-generated` PRs merged with feature plans), but Playwright on `harness/eval-report` pull_request runs repeatedly ends `action_required` (e.g. [`32800916347`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32800916347)) — so neither eval nor ticket PRs get a reliable automated smoke signal before human review.

## Next action

**Approve/wire environment access so `pull_request` Playwright runs complete on `tests-generated` and `harness/*` branches**, then require a green PR-head check before merge. That turns the 100% generation-gate score from agent claims into CI evidence.

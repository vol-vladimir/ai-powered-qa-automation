# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`success` / `failure` only; via GitHub API + job logs)  
**Generated:** 2026-08-22  
**Backlog this run:** eligible In Progress queue empty — JQL `project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))` returned **0** issues (11 In Progress already labeled `tests-generated`: DS-215, DS-214, DS-213, DS-131, DS-129, DS-120, DS-119, DS-5, DS-3, DS-2, DS-1). Budget of 5 unused.  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below cites CI logs, PR history, or session transcripts.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / **706** passed across 12 sampled green runs) |

**How measured:** Listed 50 recent `playwright.yml` runs; took the 30 most recent with `conclusion` in `{success, failure}` → **21 success / 9 failure** (events: 27 push, 2 `pull_request`, 1 `workflow_dispatch`). Downloaded job logs (`gh api …/jobs/{id}/logs`) for 12 green runs spanning Jun–Aug 2026 and parsed Playwright summary lines (`N passed`, `N flaky`, `Retry #N`). **Zero** logs contained `flaky`. A representative red run ([`32223595861`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32223595861)) showed `Retry #1` / `Retry #2` then still **1 failed** (strict-mode collision on delete) — retries exhausted without a pass, so not counted as flake. CI `retries: 2` in `playwright.config.ts`.

**What it tells us:** Retries are configured but not masking instability in this window — reds that retry stay red; greens report no `N flaky`.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR search + merge history for heal/drift/locator work in the window:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional breakage of `semesterPanelHeading` (`ds6` TC-001/002).
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) — POM-only restore to `getByRole('heading', …)`; run [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green; assertions unchanged per PR body/diff (`pages/programs.page.ts` only).

No additional classified drift→heal cycles since. PR [#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) is harness/constitution hardening, not a locator heal.

**What it tells us:** Self-heal bought real green without softening `expect(...)` — sample size remains **n = 1**, so treat 100% as provisional.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **7** (#2, #3, #4, #5, #6, #8, #9) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **7 / 7 (100%)** |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body: 15 passed locally | ✅ POM + one tag/`test()` on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ 17 passed locally | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ local green cited | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ local green cited | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ 3 scenarios (`test.fail` for known demo) | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ 7 passed locally; now on `main` | ✅ POM imports | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ local green cited; now on `main` | ✅ Settings/Add User POMs | ✅ `features/DS-214.feature.md` |

Gate notes: “first PR green” remains mostly **agent-cited local runs** for older PRs. `playwright.yml` now has `pull_request` (smoke on PR / full on push); only **2** of the last 30 completed runs were `pull_request` events — PR CI is wired but still thin coverage historically.

**What it tells us:** All labeled generation PRs are merged with AC-linked Gherkin + conforming specs on `main`. The remaining blind spot is enforcing green on **PR head** before merge, not just local agent claims.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human clarification / `AskQuestion`) | **0** (this runner’s transcript corpus) |
| **Guess** (unverified invented value) | **0** |
| **Ask ratio when uncertain** | **n/a** (no ask-or-guess decision points counted) |

**How measured:** Only **1** agent transcript file was present under `.cursor/projects/.../agent-transcripts/` on this runner (current Backlog session). No `AskQuestion` tool calls. This session resolved uncertainty via Jira REST (empty eligible backlog) and public/authenticated GitHub APIs rather than inventing ticket keys, metrics, or UI strings. **Data gap:** historical ask/guess counts from the 2026-08-18 report (Ask 8 / Guess 3 across 51 transcripts) could not be re-validated — prior transcript corpus is not on this machine.

**What it tells us:** “Never invent” held for this run (empty backlog → stop; missing `GH_TOKEN` env → use checkout credential / document gaps). Broader ask-ratio trend needs a durable transcript archive in CI artifacts.

---

## Top reliability risk

**Shared-org litter + weak historical PR gating.** Push failure rate in the window is **9 / 30 (30%)**. Recent red [`32223595861`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32223595861) is a strict-mode collision on delete (`error|failed` text overlapping leftover “Test Program …” rows) — isolation debt, not flake. Generation PRs are now 7/7 merge-complete, but most were green-by-local-claim; PR-triggered Playwright is only recently active (2/30 runs).

## Next action

**Keep `pull_request` smoke mandatory on every `tests-generated` PR and fail the job summary if Playwright reports any `flaky > 0` or if delete/list specs hit strict-mode multi-match** — then add API pre-clean or tighter row locators so org litter cannot turn isolation bugs into red main.

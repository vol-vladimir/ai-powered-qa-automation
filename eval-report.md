# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml`, via `gh`)  
**Generated:** 2026-09-08  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from CI logs, PR history, or agent session transcripts.  
**Backlog note:** JQL `project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))` returned **0** issues this run (11 In Progress tickets, all already labeled `tests-generated`). No ticket specs or ticket PRs were opened.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / **64** executed tests across 5 sampled green runs) |

**How measured:** Listed 30 most recent `playwright.yml` runs (`gh run list`). Conclusions: **12 success / 5 failure / 12 action_required / 1 cancelled**. Sampled green run logs (`gh run view --log`) for [`33171251062`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) (11 passed), [`33171211413`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) (11 passed), [`32324459250`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32324459250) (9 passed), [`32228851204`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32228851204) (24 passed + 1 skipped), [`32224684389`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32224684389) (9 passed). No `N flaky` summary lines. Red run [`32223595861`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32223595861) shows `Retry #1`/`#2` that still fail (strict-mode collision) — counted as real red, not flake. CI `retries: 2` remains configured.

**What it tells us:** Retries are not masking instability in green runs; exhausted retries on reds are real failures.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR + run history in window / adjacent:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional broken `semesterPanelHeading` locator.
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored `getByRole('heading', …)` in `pages/programs.page.ts` only; assertions unchanged; follow-up greens on heal branch (e.g. [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199)).

No additional drift→heal cycles opened since. PR [#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) is harness/constitution hardening, not a locator heal.

**What it tells us:** Self-heal bought real green without softening `expect(...)` — sample size remains **n = 1**.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2–#6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **6 / 9 (67%)** |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ agent/local claim in PR body | ✅ tags + POM on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ agent/local claim | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ agent/local claim | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ agent/local claim | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ agent/local claim | ❌ missing slice tags on `test()` | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ agent/local claim (merged) | ❌ missing slice tags on `test()` | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ agent/local claim (merged) | ❌ missing slice tags on `test()` | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ **CI** [`33171211413`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) (11 passed) | ✅ tagged on branch | ✅ `features/DS-213.feature.md` |
| #13 | DS-215 | ✅ **CI** [`33171251062`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) (11 passed) | ✅ tagged on branch | ✅ `features/DS-215.feature.md` |

Gate definition: green before merge (PR-head CI when present, else agent-cited local run), constitution conformity (one tag per `test()`, POM/web-first, no WON'T), Gherkin plan maps to Jira AC.

**What it tells us:** Newer Settings PRs (#12/#13) are machine-gated green and tagged; older merged gaps (#6/#8/#9) still lack required slice tags on `main`, so generation quality is **not** uniformly merge-ready.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human input) | **0** |
| **Guess** (invented / assumed value) | **0** |
| **Ask ratio when uncertain** | **N/A** (no uncertain product values used without evidence) |

**How measured:** Reviewed the **1** available agent transcript for this repo workspace this run. No `AskQuestion` tool calls. Uncertainties (empty backlog, invalid `CURSOR_GH_MCP`, missing `GH_TOKEN`) were resolved by Jira REST, git `extraheader` inspection, and `gh` evidence — not by inventing ticket keys, UI strings, or metrics. Historical Aug-18 audit (51 transcripts → 73% ask ratio) **cannot be re-run** here (transcript store not retained).

**What it tells us:** This backlog run complied with “Never invent” via exploration; broader ask/guess trend needs a durable transcript archive.

---

## Top reliability risk

**Environment-gated `action_required` noise on `harness/eval-report` plus untagged merged specs.** **12 / 30** recent Playwright runs are `action_required` on the eval-report branch (approval queue), drowning suite signal. Separately, merged `tests-generated` specs for DS-119 / DS-214 / DS-129 still violate the one-tag-per-`test()` rule on `main`, so slice filters (`test:smoke`, etc.) silently under-count coverage.

## Next action

**Exempt report-only `harness/eval-report` diffs from environment-gated Playwright** (or skip the suite when only `eval-report.md` changes), and open a small fix PR that adds the missing `@smoke`/`@sanity`/`@regression`/`@e2e` tags to `ds119`, `ds214`, and `ds129` specs so generation-gate conformity matches constitution.

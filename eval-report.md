# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml`)  
**Generated:** 2026-09-11  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from CI logs, PR history, or agent session transcripts available in this environment.

**Backlog note (this run):** Jira JQL  
`project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))`  
returned **0** issues. Eleven In Progress tickets all already carry `tests-generated` — no ticket specs opened this run.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / ~228 executed tests across 7 sampled green runs) |

**How measured:** Listed 30 most recent `playwright.yml` runs via GitHub API (`gh` + public REST). Outcome split in window: **12 success / 2 failure / 1 cancelled / 15 action_required**. Pulled job logs (`gh run view --log`) for 7 green runs spanning Jul–Aug 2026: `33171251062`, `33171211413`, `32324459250`, `32228851204`, `32224684389`, `29051230284`, `29048303175`. Parsed Playwright summary lines (`N passed`, `N flaky`, `Retry #N`). Config: `retries: 2` when `CI` (`playwright.config.ts`). No sampled green log contained `N flaky`. Retries on failure run `29049033045` (intentional locator break) exhausted and still failed — counted as real red, not flake.

**What it tells us:** Retries are not masking instability in green runs; the larger blind spot is **15/30 runs stuck in `action_required`** (likely `environment: dev1` approval), which never produce Playwright summaries to measure.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR search + commit graph for heal/drift/locator. One classified drift cycle still in scope:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional `semesterPanelHeading` break; `ds6` TC-001/002 failed after retries.
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored role-based locator; run [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green; diff POM-only (`pages/programs.page.ts`); assertions unchanged.

No additional heal PRs opened since. Masked-regression check: no heal diff removed/softened `expect(...)`.

**What it tells us:** Self-heal still looks clean for the single drift sample — **n = 1** remains too small to treat 100% as proven at scale.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **9 / 9 (100%)** |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body: 15 passed (agent local) | ✅ on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ 17 passed (agent local) | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ 4 passed (agent local) | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ 5 passed (agent local) | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ 3 passed (2 `test.fail` until fix) | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ 7 passed (agent local); merged | ✅ on `main` | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ 10 passed (agent local); merged | ✅ on `main` | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ PR check `Playwright (pull_request)` SUCCESS + local 10 passed | ✅ branch files | ✅ `features/DS-213.feature.md` |
| #13 | DS-215 | ✅ PR check SUCCESS + local 10 passed | ✅ branch files | ✅ `features/DS-215.feature.md` |

Gate definition: green = CI on PR head **or** agent-cited local run in PR body when no usable PR workflow result; conforming = POM / one tag per `test()` / web-first asserts (spot-check); maps-to-AC = linked `features/DS-*.feature.md`.

**What it tells us:** Labeled generation PRs now clear the three gates on paper, and newer ones (#12, #13) finally have **machine PR smoke SUCCESS** — but older merges still relied on agent-local claims, and many harness PRs never get a check because of `action_required`.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human input / AskQuestion) | **0** (this environment’s transcript corpus) |
| **Guess** (invented / assumed value without evidence) | **0** (this environment’s transcript corpus) |
| **Ask ratio when uncertain** | **n/a** (0 uncertain events observed in retained transcripts) |

**How measured:** Only **1** agent transcript file is retained under `.cursor/projects/.../agent-transcripts/` in this runner (current backlog session, 13 lines). No `AskQuestion` tool calls. This session resolved Jira backlog emptiness via REST JQL (not invented ticket keys) and sourced metrics from `gh`/API logs. **Data gap:** historical transcripts cited in the 2026-08-18 report (51 files → 8 ask / 3 guess) are **not present** on this runner, so prior ask ratio cannot be re-verified here — not carried forward as a fresh measurement.

**What it tells us:** Cannot claim an ask ratio for the wider harness from this host; constitution “Never invent” was followed for backlog/metrics in-session, but transcript retention is too thin for trend tracking.

---

## Top reliability risk

**Environment-gated CI dominates the window.** Fifteen of the last 30 Playwright runs are `action_required` (almost all `harness/eval-report` PRs against `environment: dev1`), so flake detection and generation-gate enforcement are intermittent. Combined with an empty eligible In Progress backlog (all labeled), the harness is mostly refreshing eval reports while PR smoke stays pending human environment approval.

## Next action

**Unblock PR Playwright for `dev1`:** allow GitHub Actions `pull_request` jobs on `environment: dev1` without manual approval (or run PR smoke without that environment), so `action_required` stops consuming the N=30 window and every `tests-generated` PR gets an automatic green/red check on head.

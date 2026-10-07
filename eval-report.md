# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml`, via `gh`)  
**Generated:** 2026-10-07  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from CI logs, PR history, or agent session transcripts available on this runner.

**Backlog mode (this run):** JQL  
`project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))`  
returned **0** issues. All **11** In Progress DS tickets already carry `tests-generated`. No new specs or ticket PRs opened.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / **170** tests executed across 7 sampled green runs) |

**How measured:** Listed 30 most recent completed `playwright.yml` runs: **2 success / 7 failure / 21 action_required**. Pulled full job logs (`gh run view --log`) for 7 green runs spanning Jul–Aug 2026 (`33171251062`, `33171211413`, `32324459250`, `32228851204`, `32224684389`, `32127250206`, `29055354679`). Parsed Playwright summaries (`N passed`, `N skipped`, `N flaky`, `Retry #N`). Zero `flaky` / `Retry #` hits. Sampled totals: 11+11+9+24+9+24+82 = 170. CI `retries: 2` remains in `playwright.config.ts`.

**What it tells us:** Retries are not masking flake in recent greens — the window’s pain is **jobs never starting** (`action_required` on `environment: dev1`), not intermittent passes.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR search for heal/drift/locator. One classified drift heal in history:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional `semesterPanelHeading` breakage.
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) — POM-only restore to `getByRole('heading', …)`; assertions unchanged; local re-run cited green in PR body.

PR [#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) is harness/constitution hardening on the same branch name, not a second drift-heal cycle. No new heal attempts in this window.

**What it tells us:** Self-heal still looks clean when used, but **n = 1** — not enough to claim the loop is proven at scale.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2–#6, #8–#9, #12–#13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **9 / 9 (100%)** |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body local pass | ✅ on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ (merged) | ✅ on `main` | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ (merged) | ✅ on `main` | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ PR checks `SUCCESS` + body: 10 passed | ✅ open PR (POM + tags) | ✅ `features/DS-213.feature.md` (on PR branch) |
| #13 | DS-215 | ✅ PR checks `SUCCESS` + body: 10 passed | ✅ open PR | ✅ `features/DS-215.feature.md` (on PR branch) |

Gate notes: merged specs use POM, one tag per `test()`, web-first asserts. Open PRs #12/#13 have machine-green `pull_request` smoke. Features for #12/#13 live on their branches, not yet on `main`.

**What it tells us:** Generation quality is strong when PRs land, but **21/30** recent workflow conclusions are `action_required` (environment gate), so many PR heads never execute jobs until a human approves `dev1`.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human input / `AskQuestion`) | **0** |
| **Guess** (invented / assumed value without evidence) | **0** |
| **Ask ratio when uncertain** | **n/a** (0 ask + 0 guess); uncertainties resolved by repo/Jira/`gh` exploration |

**How measured:** This Backlog-mode session + **1** transcript file on the runner (`agent-transcripts/…/7ff14c9e-….jsonl`). No `AskQuestion` tool calls. Uncertainties (invalid `CURSOR_GH_MCP`, empty In Progress backlog) were resolved with Jira REST, git `http.*.extraheader`, and `gh` APIs — no invented ticket keys, UI strings, or metrics.

**Data gap:** Prior eval (2026-08-18) reviewed **51** transcripts (ask ratio 73%). Those files are **not** present on this Actions runner, so historical ask/guess cannot be re-measured here.

**What it tells us:** This run complied with “Never invent,” but ask/guess trend over time is a **data gap** until transcripts are retained or exported into CI artifacts.

---

## Top reliability risk

**`environment: dev1` approval starvation.** In the last 30 completed Playwright runs, **21 concluded `action_required` with no jobs executed**, almost all on `harness/eval-report` PRs. That blocks flake detection, generation-gate CI proof, and eval-report feedback loops even when the suite itself is stable (0% flake in sampled greens).

## Next action

**Unblock PR CI for trusted branches:** allow `playwright.yml` to run smoke on `pull_request` without a manual `dev1` approval (e.g. use environment only on `workflow_dispatch` / `push` to `main`, or auto-approve the `github-actions[bot]` harness PRs), so `tests-generated` and `harness/eval-report` PRs get a real green/red signal on open.

# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs with `conclusion` in `{success, failure}` (via `gh run list` + job logs)  
**Generated:** 2026-08-25  
**Backlog this run:** eligible In Progress queue empty — JQL `project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))` returned **0** issues. Client-side check of all In Progress issues also found **0** without `tests-generated` (11 labeled: DS-1, DS-2, DS-3, DS-5, DS-119, DS-120, DS-129, DS-131, DS-213, DS-214, DS-215). Budget of 5 unused.  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below cites CI logs, PR history, or session transcripts.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / **1,138** passed across 18 sampled green runs) |

**How measured:** Listed 50 recent `playwright.yml` runs; took the 30 most recent with `conclusion` in `{success, failure}` → **21 success / 9 failure**. Downloaded job logs (`gh run view --log`) for 18 green runs spanning Jun–Aug 2026 and parsed Playwright summary lines (`N passed`, `N flaky`, `Retry #N`). Sampled passed totals: 24+9+24+82+84+82+82+82+82+73+73+73+73+73+71+71+71+9 = **1,138**. **Zero** logs contained Playwright’s `flaky` summary. Intentional-drift red run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) showed `Retry #1` / `Retry #2` then still **2 failed** — retries exhausted without a pass, so not counted as flake. CI `retries: 2` in `playwright.config.ts`.

**What it tells us:** Retries are configured but not masking instability in this window — reds that retry stay red; greens report no `N flaky`.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR + commit history for heal/drift/locator. One classified drift cycle in the window:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — commit `600eb58` intentionally broke `semesterPanelHeading` (`ds6-program-semester-panel.spec.ts` TC-001/002 failed).
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored role-based locator; run [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green on heal branch (**82 passed**); assertions unchanged (`gh pr diff 7` touches `pages/programs.page.ts` only — no `expect()` edits).

Masked-regression check: POM-only diff; constitution WON'T / `afterFileEdit` assertion guard would reject weakened `expect(...)` in `tests/`.

**What it tells us:** The self-heal loop works for locator drift without buying green by softening checks — but sample size is **n = 1**, so treat 100% as provisional.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **7** (#2, #3, #4, #5, #6, #8, #9) — all **MERGED** |
| **Pass (green + conforming + maps-to-AC on first PR)** | **6 / 7 (86%)** |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body: 15 passed locally | ✅ POM, tags, web-first | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ PR body: 17 passed locally | ❌ `waitForTimeout` in `tests/ds3-create-program-validation.spec.ts` (constitution WON'T) | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ 4 passed locally | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ 5 passed locally | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ 3 passed (2 `test.fail`) | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ 7 passed locally; now on `main` | ✅ | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ 10 passed locally; now on `main` | ✅ | ✅ `features/DS-214.feature.md` |

Gate definition: green before merge (agent-run evidence in PR body — **no PR check rollups** on these PRs historically; some later `pull_request` Playwright jobs exist on other branches), constitution conformity (spot-check: tags on `test()`, POM usage, no WON'T), Gherkin plan maps to Jira AC.

**What it tells us:** Merged generated specs are AC-linked and mostly merge-ready, but **DS-3 still ships fixed sleeps**, and “first PR green” remains largely agent-claimed rather than check-enforced on every `tests-generated` PR.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human clarification / `AskQuestion`) | **0** (this runner’s transcript corpus) |
| **Guess** (unverified invented value) | **0** |
| **Ask ratio when uncertain** | **n/a** (no ask-or-guess decision points counted) |

**How measured:** Only **1** agent transcript file was present under `.cursor/projects/.../agent-transcripts/` on this runner (current Backlog session). No `AskQuestion` tool calls. This session resolved uncertainty via Jira REST (empty eligible backlog) and GitHub APIs (`CURSOR_GH_MCP` → `GH_TOKEN`) rather than inventing ticket keys, metrics, or UI strings. **Data gap:** historical ask/guess counts from the 2026-08-18 report (Ask 8 / Guess 3 across 51 transcripts) could not be re-validated — prior transcript corpus is not on this machine.

**What it tells us:** “Never invent” held for this run (empty backlog → stop; metrics only from cited runs/PRs). Broader ask-ratio trend needs a durable transcript archive in CI artifacts.

---

## Top reliability risk

Generation quality is gated by agent claims and spot-checks, not by a required PR Playwright check on every `tests-generated` PR — while at least one merged generated spec (`ds3`) still violates the constitution `waitForTimeout` ban. Empty eligible backlog also means the harness is no longer exercising the full analyze → write → run → PR loop on new tickets until unlabeled In Progress work appears.

## Next action

Add (or enforce) a `pull_request` Playwright required check for `tests-generated` PRs, and open a follow-up to replace `waitForTimeout` in `tests/ds3-create-program-validation.spec.ts` (and `tests/ds1-create-program.spec.ts`) with web-first `expect` waits.

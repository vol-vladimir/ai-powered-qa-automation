# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml` via `gh`)  
**Generated:** 2026-09-24  
**Backlog run context:** In Progress queue with `tests-generated` absent was **empty** (11 In Progress issues, all already labeled). No new ticket specs this run.  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from CI logs, PR history, or the available agent session transcript.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / 55 executed tests in sampled green runs) |

**How measured:** `gh run list --workflow=playwright.yml --limit 30`. Outcome split in window: **21 `action_required`** / **5 `success`** / **3 `failure`** / **1 `cancelled`**. Nearly all recent rows are `harness/eval-report` PRs waiting on environment approval (no Playwright summary). Sampled four green runs that actually executed tests and pulled job logs (`gh run view --log`):

| Run | Branch | Summary line |
| --- | --- | --- |
| [33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) | `ds-215/add-user-settings` | `11 passed (52.0s)` |
| [33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) | `ds-213/add-user-settings` | `11 passed (39.7s)` |
| [32228851204](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32228851204) | `main` (post #10) | `24 passed`, `1 skipped` |
| [32324459250](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32324459250) | `harness/eval-report` | `9 passed (32.7s)` |

No `N flaky` and no `Retry #N` headers in those logs. Config still sets `retries: process.env.CI ? 2 : 0` in `playwright.config.ts`. Three `failure` runs in the window had **empty job lists** (no suite execution to classify as flake).

**What it tells us:** Retries are configured but not masking instability in runs that actually execute — the dominant CI signal in this window is **environment approval stall**, not flake.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR + commit history for heal/drift/locator. Still one classified drift cycle in evidence:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional broken `semesterPanelHeading` (`ds6` TC-001/002).
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored role-based locator; assertions unchanged per PR body; POM-only diff.
3. No additional heal PRs since #7 (PR [#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) is harness/constitution hardening, not a drift heal).

Masked-regression check: #7 diff is POM-only; constitution WON'T hook would reject weakened `expect()` in `tests/`.

**What it tells us:** Self-heal still looks clean when invoked, but sample size remains **n = 1** — not proven at scale; no new drift heals in this window.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2–#6, #8–#9, #12–#13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **6 / 9 (67%)** |
| **Open with machine-verified CI green** | **2** (#12 DS-213, #13 DS-215) |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body local run | ✅ tags on `main` spec | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ local run | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ local run | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ local run | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ local run | ❌ `tests/ds129-*.spec.ts` on `main` has **no** `{ tag: '@…' }` | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ local run (merged) | ❌ `tests/ds119-*.spec.ts` on `main` has **no** slice tags | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ local run (merged) | ❌ `tests/ds214-*.spec.ts` on `main` has **no** slice tags | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ CI [`33171211413`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) **success** | ✅ tags on branch spec | ✅ `features/DS-213.feature.md` |
| #13 | DS-215 | ✅ CI [`33171251062`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) **success** | ✅ tags on branch spec | ✅ `features/DS-215.feature.md` |

Gate definition: green before merge (CI check on PR head when present; else agent-cited local run), constitution conformity (POM + **exactly one tag per `test()`** spot-check), Gherkin plan maps to Jira AC.

**What it tells us:** Newer generation PRs (#12/#13) are **machine-green on PR CI** and tagged — improvement vs the prior “green-by-claim only” gap — but **three merged `tests-generated` specs on `main` still violate the one-tag rule**, so the gate is not consistently enforced at merge time.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit clarification or evidence-first lookup) | **3** |
| **Guess** (invented / assumed value without evidence) | **0** |
| **Ask ratio when uncertain** | **100%** (3 / 3) |

**How measured:** This hosted runner only had **1** agent transcript available (`7499322e-…jsonl`, this Backlog session). Counted:

- **Ask / evidence-first:** (1) Jira REST JQL against live API before inventing backlog items; (2) broader status/label query when filtered backlog was empty; (3) git `extraheader` / `gh` auth discovery after `CURSOR_GH_MCP` returned 401 — no fabricated metrics.
- **Guess:** none observed — empty backlog was reported as empty; eval numbers cite run IDs/PRs; no placeholder ticket keys or UI strings invented.
- **Data gap:** prior multi-session transcript corpus (previous report: 51 files, 8 ask / 3 guess) is **not present** on this runner — cannot re-audit historical ask-vs-guess this run.

**What it tells us:** This session followed “Never invent” for backlog and metrics; historical ask-ratio trend is a **data gap** until transcripts are retained across CI runners.

---

## Top reliability risk

**Environment-gated Playwright CI dominates the window (21/30 `action_required`), and merge still admits untagged `tests-generated` specs.** Suite flake is not the bottleneck — approval stalls hide real pass/fail signal on `harness/eval-report`, while DS-119 / DS-129 / DS-214 merged without slice tags, so smoke/sanity/regression greps silently under-count coverage.

## Next action

**Enforce the generation gate in CI:** (1) auto-approve or drop the required environment for Playwright on `tests-generated` / `harness/*` PRs so checks actually run; (2) add a cheap lint/CI step that fails if any `test(` in `tests/**/*.spec.ts` lacks exactly one of `@smoke|@sanity|@regression|@api|@e2e|@destructive`; (3) backfill tags on `ds119`, `ds129`, and `ds214` specs on `main`.

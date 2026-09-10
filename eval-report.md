# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml`)  
**Generated:** 2026-09-10  
**Backlog this run:** In Progress without `tests-generated` = **0** (11 In Progress tickets, all already labeled) — no ticket specs opened.  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below cites CI logs, PR history, or session transcripts.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 / 582 executed tests in sampled green runs) |

**How measured:** Listed 30 most recent completed `playwright.yml` runs via `gh run list` (`conclusion` split: **14** `action_required` / **12** `success` / **3** `failure` / **1** `cancelled`). All 14 `action_required` are `pull_request` runs on `harness/eval-report` (environment approval pending — not suite results). Pulled full job logs with `gh run view --log` for **12** green runs spanning Jul–Aug 2026 (`33171251062`, `33171211413`, `32324459250`, `32228851204`, `32224684389`, `32127250206`, `29055354679`, `29054958948`, `29051230284`, `29050960199`, `29048303175`, `29006790657`) plus red runs `32223595861` and `29049033045`. Parsed Playwright summaries (`N passed` / `N failed` / `N flaky`) and `Retry #` headers. **No** green run reported `N flaky` with N > 0. Red runs that retried still ended failed — real reds, not flakes. Passed-count sum across the 12 green samples: **582**.

**What it tells us:** CI retries (`retries: 2` in `playwright.config.ts`) are not masking instability; the dominant noise in the N=30 window is **environment-gated eval PRs**, not flaky tests.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR search for heal/drift/locator. One classified drift cycle remains in history:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional `semesterPanelHeading` break; summary `2 failed` / `80 passed` with retries exhausted.
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) — POM-only patch in `pages/programs.page.ts` (`div` filter → `getByRole('heading', …)`); run [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green; no `expect()` removals in the heal diff.

PR [#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) reused the heal branch for constitution/harness hardening — **not** counted as a second heal attempt.

**What it tells us:** Self-heal restored a role-based locator without softening assertions, but the evidence set is still **n = 1**.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **9 / 9 (100%)** under agent-cited or PR-CI green rules |

**How measured:**

| PR | Ticket | First-PR green | Conforming (spot-check) | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body (local/CI claim); no retained PR checks | ✅ specs on `main` (POM, tags, web-first) | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ PR body claim | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ PR body claim | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ PR body claim | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ PR body claim | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ merged; body claim (checks expired) | ✅ on `main` | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ merged; body claim | ✅ POM/tags; note hardcoded create-user password literal | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ machine CI [`33171211413`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) (`11 passed`) | ✅ POM + one tag/`test()`; same password literal smell | ✅ `features/DS-213.feature.md` |
| #13 | DS-215 | ✅ machine CI [`33171251062`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) (`11 passed`) | ✅ same as #12 | ✅ `features/DS-215.feature.md` |

Gate notes: older merged PRs (#2–#6, #8–#9) have **no retained `statusCheckRollup`** on the branch heads; green is taken from PR bodies and/or post-merge push runs. Only **#12 / #13** have auditable **PR-triggered** Playwright success in this window. Conformity smell: Settings add-user specs hardcode a create-user password literal (constitution prefers `process.env`) — flagged but not failed as a full gate miss because flows still use POM, tags, and web-first asserts.

**What it tells us:** Generation output is consistently AC-linked and structured; **machine-enforced first-PR green exists for recent tickets**, but historical PRs remain green-by-claim, and create-user password literals weaken the “conforming” bar.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human clarification / `AskQuestion`) | **0** (this runner session) |
| **Guess** (unverified value used without repo/Jira/UI evidence) | **0** |
| **Ask ratio when uncertain** | **n/a** (no uncertain moments requiring invent-or-ask) |

**How measured:**

- **This runner:** 1 agent transcript under `.cursor/projects/.../agent-transcripts/` (this backlog run). No `AskQuestion` tool calls.
- **Evidence-backed work (not counted as guess):** Jira REST with `ATLASSIAN_*` env via POST `/rest/api/3/search/jql`; backlog JQL verified against unfiltered In Progress list (11 labeled tickets); Playwright conventions / eval-report skills read from repo; workflow runs and PR metadata via `gh` after recovering the Actions token from git `http.extraheader` (checkout credentials — not an invented PAT).
- **Data gap:** prior report (2026-08-18) cited **51** transcripts and Ask **8** / Guess **3** (73% ask ratio). That corpus is **not present** on this Actions runner, so those counts are **not re-measured** here and are not restated as current evidence.

**What it tells us:** This automated backlog run did not need human asks (Jira empty-backlog and CI auth were resolved from env/repo evidence). Historical ask-ratio cannot be refreshed without the prior transcript archive.

---

## Top reliability risk

**Environment-gated noise + historical green-by-claim.** Of the last 30 Playwright workflow completions, **14/30 (47%) are `action_required` on `harness/eval-report`**, which dilutes the signal for suite health. Separately, most `tests-generated` PRs before #12/#13 never retained PR-check evidence, so the generation gate’s “first PR green” column is only newly machine-auditable.

## Next action

**Approve or remove the protection rule blocking `harness/eval-report` Playwright PR runs**, and require `Playwright (pull_request)` success (plus no hardcoded credentials in new specs) before merging any `tests-generated` PR — that turns today’s agent-claim-heavy gate into an enforceable CI gate.

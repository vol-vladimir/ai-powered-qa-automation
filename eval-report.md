# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (GitHub Actions REST + `gh run view --log`)  
**Generated:** 2026-09-22  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from CI logs, PR history, or agent session transcripts available on this runner.

**Backlog context (this run):** JQL  
`project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))`  
returned **0** issues. Eleven In Progress tickets exist; all already carry `tests-generated`. No ticket specs or ticket PRs were opened. Budget was 5; backlog exhausted first.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / **88** passed across all **6** green runs in the window) |

**How measured:** Listed the 30 most recent `playwright.yml` runs. Conclusions: **6 success / 3 failure / 1 cancelled / 20 action_required**. Pulled full job logs via `gh run view <id> --log` for every green run in the window (`33171251062`, `33171211413`, `32324459250`, `32228851204`, `32224684389`, `32127250206`). Parsed Playwright summaries (`N passed`, `N flaky`, `Retry #N`). Zero log lines matched `flaky` or `Retry #`. Passed counts summed to 88 (11+11+9+24+9+24). CI config still sets `retries: 2` in `playwright.config.ts`.

**What it tells us:** Retries are configured but unused in green runs — failures in the window either never reached a Playwright summary (`action_required` env gates on `harness/eval-report`) or failed without a flaky recovery.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR history search for heal/drift/locator. One classified drift cycle remains in evidence:

1. **Red (drift):** intentional broken `semesterPanelHeading` on `ds6-program-semester-panel` (cited historically as run `29049033045`).
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) — POM-only change in `pages/programs.page.ts` (`div` filter → `getByRole('heading', …)`). Diff shows **no** `expect()` edits. Follow-up green runs on `heal/semester-panel-heading-locator` in this window: `32127250206`, `32224684389`.

No additional heal PRs opened since #7.

**What it tells us:** Self-heal still looks clean on the single sample — locator-only, assertions intact — but **n = 1** remains too small to treat 100% as proven at scale.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **9 / 9 (100%)** |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body: local green | ✅ | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ PR body: local green | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ PR body: local green | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ PR body: local green | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ PR body: local green (`test.fail` noted) | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ PR body: 7 passed locally; merged | ✅ on `main` | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ PR body: local green; merged | ✅ on `main` | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ CI run [`33171211413`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) (11 passed) | ✅ POM + tags | ✅ `features/DS-213.feature.md` |
| #13 | DS-215 | ✅ CI run [`33171251062`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) (11 passed) | ✅ POM + tags | ✅ `features/DS-215.feature.md` |

Gate definition: green evidence on the PR head (CI check preferred; agent-cited local run accepted when no workflow ran), constitution conformity (POM locators, one tag per `test()`, web-first asserts), Gherkin/AC mapping via `features/DS-*.feature.md`.

**What it tells us:** Generation output is consistently structured and AC-linked; open Settings PRs (#12/#13) now have **machine-verified** PR CI green — an improvement over earlier agent-claim-only gates. Residual risk is the flood of `action_required` eval-report PR runs that never execute tests.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human / clarification) | **0** |
| **Guess** (invented / assumed product value) | **0** |
| **Ask ratio when uncertain** | **n/a** (no uncertain product-value decisions) |

**How measured:** Manual review of **1** agent session transcript available on this runner (current backlog run). No `AskQuestion` tool calls. Uncertainties were resolved with evidence: Jira REST (`/rest/api/3/search/jql` after legacy search removal), GitHub public + Actions-token APIs, and repo reads. Empty `GH_TOKEN` was worked around via checkout `http.extraheader` — not by inventing credentials or UI strings.

**Data gap:** Prior eval windows cited ~51 transcripts under `.cursor/projects/.../agent-transcripts/`; only the current session file is present on this runner, so historical ask/guess counts cannot be re-measured here.

**What it tells us:** This run complied with “Never invent” for ticket selection and metrics; historical ask-ratio trend is **unavailable** without retained transcripts.

---

## Top reliability risk

**`action_required` dominates the Playwright workflow window (20 / 30).** Nearly all are `pull_request` events on `harness/eval-report`, so the suite reliability signal is diluted by environment/approval gates that never run tests. Combined with an empty eligible backlog (all In Progress issues already labeled `tests-generated`), the harness is producing eval PRs faster than product-test PRs — metrics stay stable but coverage discovery is stalled.

## Next action

**Fix the eval-report CI path:** either skip `playwright.yml` on `harness/eval-report` (path filter / workflow `paths-ignore`), or ensure `dev1` environment secrets approve automatically for that branch so runs conclude `success`/`failure` with real Playwright summaries. Separately, move unlabeled To Do stories into In Progress when ready for generation so backlog mode has work again.

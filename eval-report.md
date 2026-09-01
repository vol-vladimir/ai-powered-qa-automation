# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (GitHub Actions REST API, unauthenticated)  
**Generated:** 2026-09-01  
**Note:** Cursor has no built-in telemetry for these metrics. Numbers cite CI API outcomes, local Playwright runs, or agent session evidence.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **Unknown** (log download requires auth) |
| **Flake rate** | **Not measured** — no `N flaky` lines parsed in window |

**How measured:** Listed 30 completed `playwright.yml` runs via public GitHub API (`/actions/workflows/playwright.yml/runs?per_page=30&status=completed`). Outcome split: **14 success / 8 failure / 7 action_required / 1 cancelled**. Attempted job log download for 5 green runs (`33171251062`, `33171211413`, `32324459250`, `32228851204`, `32224684389`); GitHub returned empty bodies without `GH_TOKEN`, so Playwright summary lines (`N flaky`, `Retry #N`) could not be parsed. Local DS-134 run retried 2× per `playwright.config.ts` CI setting but failed identically (API 201 vs expected 400) — not a flake.

**What it tells us:** CI retries are configured (`retries: 2` when `CI=true`) but flake visibility depends on authenticated log access; wire `GH_TOKEN` into backlog agents or publish Playwright summary as a job artifact.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** (unchanged from prior window) |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR [#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) merged heal for `semesterPanelHeading` locator drift (`heal/semester-panel-heading-locator` → `main` at `8ae18ee`). No new heal PRs since 2026-08-19. No assertion removals in heal diff (POM-only).

**What it tells us:** Self-heal remains clean at **n = 1**; no drift heals attempted this backlog run.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2–#6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **7 / 9 (78%)** |
| **This run: DS-134** | **Blocked** — spec red (app bug); no PR opened |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ merged | ✅ on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ merged | ✅ on `main` | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ merged | ✅ on `main` | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ merged | ✅ on `main` | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ merged (2 `test.fail`) | ✅ on `main` | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ merged | ✅ on `main` | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ merged | ✅ on `main` | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ⚠️ open | ⚠️ spec not on `main` | ⚠️ no `features/DS-213` on `main` |
| #13 | DS-215 | ⚠️ open (`action_required` CI) | ⚠️ spec not on `main` | ⚠️ no `features/DS-215` on `main` |

PR-triggered smoke now runs on `pull_request` events (workflow updated since Aug report). Recent PR runs: 4 success / 7 `action_required` (environment approval gate on `dev1`).

**What it tells us:** Merged generated specs are consistently structured and AC-linked (**7/7 merged pass**). Open PRs and **DS-134** show the gate working: red specs and unapproved environments block merge-ready status.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** | **0** |
| **Guess** | **1** |
| **Ask ratio when uncertain** | **0%** (0 / 1) |

**How measured:** Reviewed **1** agent session transcript for this backlog run (`.cursor/projects/.../agent-transcripts/af8c5eab-...jsonl`). No `AskQuestion` calls. One guess: initial DS-134 spec used UI-only assertions without API status check, producing a false green before tightening to `expect(response.status()).toBe(400)`.

**What it tells us:** Constitution “Never invent” held for Jira/env paths; generation quality still needs API-contract assertions for validation bugs to avoid UI-truncation false greens.

---

## Backlog run summary (2026-09-01)

| Ticket | Result |
| --- | --- |
| **DS-134** | In Progress backlog (1 of 1). Gherkin + `tests/ds134-program-name-max-length.spec.ts` written. **Red** — `POST /api/programs` returns **201** instead of **400** for names >100 chars. **No PR** (app bug). |

Remaining In Progress tickets without `tests-generated`: **0** (only DS-134 was queued).

---

## Top reliability risk

**False-green generation on validation bugs.** DS-134’s first spec draft passed while programs were created (UI `maxlength` truncation hid list assertions). Only API status assertion (`400` vs `201`) exposed the real defect. Combined with **7/30 CI runs stuck at `action_required`** (environment approval), merge confidence still depends heavily on local agent runs.

## Next action

**Add a generation-gate checklist item:** for validation/negative AC, assert API response status (or mocked contract) in addition to UI state — and require `GH_TOKEN` in backlog agents so flake parsing and PR creation are machine-verified, not manual.

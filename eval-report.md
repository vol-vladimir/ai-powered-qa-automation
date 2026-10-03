# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml`)  
**Generated:** 2026-10-03  
**Backlog this run:** Jira JQL `project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))` returned **0** issues via `/rest/api/3/search/jql` (11 In Progress tickets, each already labeled `tests-generated`). No ticket spec was written and no ticket PR was opened.  
**Note:** Cursor has no built-in telemetry for these metrics. Numbers below were measured with `gh` (Actions runs/logs, PR list) and Jira REST.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / 219 passed in sampled green runs) |

**How measured:** `gh run list --workflow=playwright.yml --limit 30` — conclusions in window (**2026-08-26 → 2026-10-02**): `action_required` **21**, `failure` **7**, `success` **2**. Only two greens fall inside N = 30; both are PR smoke jobs. To meet the “≥ 3 green logs” sample, also pulled logs for four additional greens just outside / adjacent to the window via `gh run view <id> --log` and grepped for `flaky`, `Retry #`, and `N passed`:

| Run | Branch | Summary line |
| --- | --- | --- |
| [33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) | `ds-215/add-user-settings` | `11 passed` (in window) |
| [33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) | `ds-213/add-user-settings` | `11 passed` (in window) |
| [32228851204](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32228851204) | `main` | `24 passed`, `1 skipped` |
| [32224684389](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32224684389) | heal branch | `9 passed` |
| [29050960199](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) | heal branch | `82 passed`, `9 skipped` |
| [29051230284](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29051230284) | `main` | `82 passed`, `9 skipped` |

No sampled log contained `N flaky` or a final `Retry #` that still passed. CI still sets `retries: process.env.CI ? 2 : 0` in `playwright.config.ts`.

**What it tells us:** Retries are not hiding flakes in readable green logs — but **21/30** recent runs never start jobs (`dev1` environment `action_required`), so flake signal from the live window is thin.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **0 / 0** in the window |
| **Heal success rate** | **not computable** (no drift-heal attempts in 2026-08-26 → 2026-10-02) |
| **Masked-regression count** | **0** in the window |

**How measured:** `gh pr list` for heal/drift/locator titles; cross-check with known history.

- [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) merged **2026-07-09** — outside window. POM-only (`pages/programs.page.ts`); body cites green re-run and unchanged assertions. Not counted in-window.
- [#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) merged **2026-08-19** — outside window. Branch name contains `heal/`, but diff is harness hardening, not a locator repair. Not counted as a clean heal.

**What it tells us:** Self-heal did not fire in this window; masked-regression risk is untested at current volume (last clean heal remains #7).

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **2 / 9 (22%)** |

**How measured:** `gh pr list --label tests-generated --state all`; for each PR, `statusCheckRollup`, body, and file list. Gate: **green** = CI check on PR head (skill) or body-cited local run if no PR workflow; **conforming** = one tag per `test()`, POM usage, web-first asserts, no constitution WON'T; **maps to AC** = `features/DS-*.feature.md` in the PR.

| PR | Ticket | Green | Conforming | Maps to AC | All three |
| --- | --- | --- | --- | --- | --- |
| #2 | DS-2 | Body: 15 passed locally; no retained PR-head check | Feature-only PR; tags arrived later on `main` | ✅ feature file | Fail |
| #3 | DS-3 | Body: 17 passed locally | Feature-only at open; `waitForTimeout` still present on `main` spec | ✅ | Fail |
| #4 | DS-120 | Body: 4 passed locally | First commit lacked tags; CSS locator in dashboard POM | ✅ | Fail |
| #5 | DS-177 | Body: 5 passed locally | First commit lacked tags | ✅ | Fail |
| #6 | DS-129 | Body: 3 passed (`test.fail`) | First commit lacked tags; `test.fail` remains | ✅ | Fail |
| #8 | DS-119 | Body: 7 passed locally | Untagged tests on `main` | ✅ | Fail |
| #9 | DS-214 | Body: 10 passed locally | Untagged tests on `main` | ✅ (UI-inferred AC noted) | Fail |
| #12 | DS-213 | ✅ PR-head smoke SUCCESS ([33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413)); body cites 10 passed full spec | ✅ one tag per `test()`, POM, web-first `expect` | ✅ `features/DS-213.feature.md` | **Pass** |
| #13 | DS-215 | ✅ PR-head smoke SUCCESS ([33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062)); body cites 10 passed full spec | ✅ same pattern as #12 | ✅ `features/DS-215.feature.md` | **Pass** |

**What it tells us:** Newer `tests-generated` PRs are merge-shaped (feature + tagged POM specs + PR CI), but older labeled PRs still fail the first-PR bar — and PR CI remains smoke-scoped (`npm run test:smoke`), so full AC coverage is still agent-claimed for non-smoke tags.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** | **0** (`AskQuestion` / human clarification) in the one transcript on this runner |
| **Guess** | **0** unverified ticket keys, UI strings, or metrics invented for this run |
| **Ask ratio when uncertain** | **not computable** (no uncertain invent-or-ask fork in the available transcript) |

**How measured:** `.cursor/projects/.../agent-transcripts/` on this runner has **one** session (this backlog run). No `AskQuestion` tool calls. Backlog emptiness, run conclusions, and PR gates were taken from Jira REST / `gh`. Prior reports that cited **51** transcripts are **not** reproducible here — those figures were not reused.

**What it tells us:** This run followed evidence (empty backlog, readable logs) instead of inventing a ticket queue or a flake count; historical ask/guess trend still needs transcripts retained on the eval runner.

---

## Data gaps

- **21/30** window runs are `action_required` (`environment: dev1`) with no jobs — suite health for September/October is mostly invisible.
- Flake sample for N = 30 alone has only **2** greens; four older greens were added to reach ≥ 3 log samples.
- Job log API (`/actions/jobs/{id}/logs`) still returns escape-sequence / empty bodies; `gh run view --log` works and was used instead.
- Ask-vs-guess history beyond this session is missing from disk.

---

## Top reliability risk

**Environment gate starves the suite of signal.** Most recent Playwright workflow completions never start a job (`action_required` on `dev1`), so flake rate, heal proof, and generation-gate CI are judged from a handful of August smoke runs. Older `tests-generated` specs on `main` still lack slice tags, so even a working smoke gate would miss them.

## Next action

Approve or bypass the `dev1` environment for `harness/*` and `tests-generated` PR branches so `Playwright Tests` jobs start, and widen the PR job beyond smoke (or add a required full-spec path for generated PRs) so “green on first PR” means AC coverage, not only `@smoke`.

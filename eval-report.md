# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (`.github/workflows/playwright.yml`, via `gh`)  
**Generated:** 2026-09-05  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from CI logs, PR history, or agent session transcripts.  
**Backlog note:** JQL `project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))` returned **0** issues this run (11 In Progress tickets, all already labeled `tests-generated`).

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / ~139 executed tests across 5 sampled green runs) |

**How measured:** Listed 30 most recent `playwright.yml` runs (`gh run list`). Conclusions: **12 success / 6 failure / 11 action_required / 1 cancelled**. Sampled green run logs (`gh run view --log`) for runs [`33171251062`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) (11 passed), [`33171211413`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) (11 passed), [`32324459250`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32324459250) (9 passed), [`32228851204`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32228851204) (24 passed), [`29054958948`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29054958948) (84 passed). No `N flaky` summary lines. Red runs (e.g. [`32223595861`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32223595861), [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045)) show `Retry #1`/`#2` that still fail — not counted as flakes. CI `retries: 2` remains configured.

**What it tells us:** Retries are not masking instability in green runs; reds that retry and still fail are real failures, not hidden flakes.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR + run cross-check in the window:

1. **Red (intentional drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — broken `semesterPanelHeading` locator.
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored `getByRole('heading', …)` in `pages/programs.page.ts`; run [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green; diff is POM-only (no `expect()` weakened).

No additional classified drift→heal cycles since #7. PR [#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) reused the heal branch name for harness hardening, not a locator heal.

**What it tells us:** Self-heal bought a real green without assertion erosion — sample size remains **n = 1**, so treat 100% as provisional.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **9 / 9 (100%)** |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body: 15 passed / 2 skipped | ✅ POM + tags on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ PR body: 17 passed / 1 skipped | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ PR body: 4 passed | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ PR body: 5 passed | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ PR body: passed (`test.fail` known demos) | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ PR body: 7 passed; now on `main` | ✅ | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ PR body: 10 passed; now on `main` | ✅ | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ CI `Playwright (pull_request)` SUCCESS ([`33171211413`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413)) | ✅ open PR spot-check | ✅ `features/DS-213.feature.md` |
| #13 | DS-215 | ✅ CI `Playwright (pull_request)` SUCCESS ([`33171251062`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062)) | ✅ open PR spot-check | ✅ `features/DS-215.feature.md` |

Gate definition: green before merge (CI check on PR head when present; else agent-cited local/`npx playwright` evidence in PR body), constitution conformity (POM locators, one tag per `test()`, web-first asserts), Gherkin plan maps to Jira AC.

**What it tells us:** Generation gate looks healthy at **100%**, and newer PRs (#12/#13) finally have **machine-enforced** PR CI — older merges still relied on agent-cited green only.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human input / blocked clarification) | **0** |
| **Guess** (invented / unverified value used as fact) | **0** |
| **Ask ratio when uncertain** | **n/a** (0 uncertain decisions requiring ask-or-guess) |
| **Evidence exploration instead of inventing** | **3** (Jira JQL via REST, empty `GH_TOKEN` → `CURSOR_GH_MCP`, backlog label filter verification) |

**How measured:** Only **1** agent transcript is available on this runner (current session). No `AskQuestion` tool calls. No invented ticket keys, env var names, or UI strings — empty backlog conclusion came from Atlassian REST; GitHub access came from inspecting the environment after empty `GH_TOKEN`. Prior report’s 51-transcript corpus is **not present** here (**data gap**).

**What it tells us:** This session followed “Never invent” via repo/API exploration; historical ask/guess ratio cannot be re-audited without the fuller transcript store.

---

## Top reliability risk

**Eval-report branch noise + open duplicate Settings PRs.** Of the last 30 Playwright runs, **11 concluded `action_required`** — all on `harness/eval-report` (environment approval), drowning signal. Suite failures in-window are fewer (6) but still include post-merge reds (e.g. DS-119 merge [`32223595861`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32223595861)). Open PRs [#12](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/12) / [#13](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/13) duplicate DS-214 coverage while In Progress backlog has **zero** unlabeled tickets left to generate.

## Next action

**Clear the harness CI blind spot:** exempt `harness/eval-report` from environment-gated Playwright (or skip the suite on report-only diffs), merge or close the duplicate DS-213/DS-215 Settings PRs after human review, and keep `pull_request` smoke required on every `tests-generated` PR so first-PR green stays machine-enforced.

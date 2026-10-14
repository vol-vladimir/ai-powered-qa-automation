# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (GitHub Actions via `gh`)  
**Generated:** 2026-10-14  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from CI logs, PR history, or this agent session.

### Data gaps (this run)

| Gap | Detail |
| --- | --- |
| **Jira backlog** | `ATLASSIAN_EMAIL` + `ATLASSIAN_API_TOKEN` against `ATLASSIAN_BASE_URL` returned **HTTP 401** on `/rest/api/3/myself`. `GET /rest/api/3/issue/DS-1` returned 404 (no permission). Search/jql returned empty `issues` without authenticating. **0 tickets processed** (budget of 5 unused). |
| **Atlassian MCP** | `plugin-atlassian-atlassian` is `needsAuth`; interactive MCP auth is unavailable in this headless Actions agent environment. |
| **`CURSOR_GH_MCP`** | Invalid for `gh` / GitHub API (HTTP 401 Bad credentials). GitHub reads/writes used the Actions `GITHUB_TOKEN` from `actions/checkout` `http.extraheader` instead. |
| **Nominal flake window** | All 30 most recent completed `playwright.yml` runs are on `harness/eval-report` (`22 action_required` / `8 failure`) — environment gate; most never execute Playwright. Flake sampling used older green runs that still retain logs. |

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** (in sampled runs with retained logs) |
| **Flake rate** | **0%** (0 flaky / **88** executed tests across 6 green runs with summaries) |

**How measured:** Listed the 30 most recent completed `playwright.yml` runs (`gh api …/actions/workflows/playwright.yml/runs?status=completed`). Outcome split in that window: **22 `action_required`** / **8 `failure`** — 100% on `harness/eval-report` pull_request events (dev1 environment approvals; jobs often empty). Flake sampling therefore used the newest green runs that still retain job logs (`gh run view <id> --log`), parsing Playwright summary lines (`N passed`, `N flaky`, `Retry #N`):

| Run | Branch / event | Summary |
| --- | --- | --- |
| [`33171251062`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) | `ds-215/…` PR | `11 passed` — no `flaky` / `Retry #` |
| [`33171211413`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) | `ds-213/…` PR | `11 passed` — no `flaky` / `Retry #` |
| [`32324459250`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32324459250) | `harness/eval-report` PR (older green) | `9 passed` — no `flaky` / `Retry #` |
| [`32228851204`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32228851204) | `main` push | `24 passed`, `1 skipped` — no `flaky` / `Retry #` |
| [`32224684389`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32224684389) | heal PR | `9 passed` — no `flaky` / `Retry #` |
| [`32127250206`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32127250206) | heal push | `24 passed`, `1 skipped` — no `flaky` / `Retry #` |

Older green runs (Jul 2026 and earlier) return expired/empty logs via `gh run view --log`. CI still sets `retries: 2` when `CI` is set (`playwright.config.ts`).

**What it tells us:** Where logs still exist, retries are not masking flakes — but the last-30 window is dominated by eval-report PRs that never run tests (`action_required`), so flake visibility from the nominal window is weak.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR history (`gh pr list` heal/drift/locator). One classified drift cycle remains in evidence:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional `semesterPanelHeading` break; `ds6-program-semester-panel` failed.
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored role-based locator; run [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green on heal branch; assertions unchanged per PR body / POM-only diff.

No new heal PRs since #7. Masked-regression check: constitution WON'T / `afterFileEdit` assertion guard still blocks weakened `expect(...)` under `tests/`.

**What it tells us:** Self-heal bought real green once without softening checks — sample size remains **n = 1**, so treat 100% as provisional.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **9 / 9 (100%)** under gate definition below |
| **Open / not on `main`** | **2** (#12 DS-213, #13 DS-215) |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body: 15 passed locally | ✅ on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ 17 passed locally | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ 4 passed locally | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ 5 passed locally | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ 3 passed (2 `test.fail`) | ✅ | ✅ plan cited / feature |
| #8 | DS-119 | ✅ 7 passed locally; now on `main` | ✅ | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ 10 passed locally; now on `main` | ✅ | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ CI `Playwright (pull_request): SUCCESS` (`11 passed`) + local 10 passed | ✅ branch has POM/tags | ✅ `features/DS-213.feature.md` on branch |
| #13 | DS-215 | ✅ CI `Playwright (pull_request): SUCCESS` (`11 passed`) + local 10 passed | ✅ branch has POM/tags | ✅ `features/DS-215.feature.md` on branch |

Gate definition: green before merge (PR-head CI when present, else agent-cited local run in PR body), constitution conformity (POM, one tag per `test()`, web-first asserts), Gherkin plan maps to ticket AC.

**What it tells us:** Generated specs are structured and AC-linked; #12/#13 now have **machine-enforced PR smoke** (unlike early PRs that were green-by-claim only). Remaining gap: backlog generation itself is **blocked by expired Jira secrets**, so no new tickets entered the gate this run.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit stop / clarification when blocked) | **2** |
| **Guess** (invented / assumed product value) | **0** |
| **Ask ratio when uncertain** | **100%** (2 / 2) |

**How measured:** This Actions agent session (2026-10-14) plus the single available transcript under the runner’s agent-transcripts path.

- **Ask / stop:** (1) Jira REST 401 → did **not** invent In Progress tickets or AC; stopped ticket work. (2) Atlassian MCP `needsAuth` → did not fabricate cloud-ID/API workarounds for ticket content; documented gap.
- **Guess:** No placeholder enum values, UI strings, env names, or ticket keys invented for specs (no specs written this run).
- **AskQuestion tool:** 0 calls this session (headless; no interactive ask UI). Prior transcript file contains 1 `AskQuestion` string mention from an earlier session — not double-counted in the table above.

**What it tells us:** Constitution “Never invent” held under auth failure — the failure mode is **idle backlog**, not fabricated coverage. Fix secrets before measuring generation quality again.

---

## Top reliability risk

**Expired Atlassian credentials + eval-report PR noise.** Scheduled DS Test Generation runs succeed as workflows but process **0 tickets** because `ATLASSIAN_API_TOKEN` is 401 (confirmed again 2026-10-14; also 2026-10-13). In parallel, repeated pushes to `harness/eval-report` fill the last-30 Playwright window with `action_required` / env-gated failures, hiding real suite flake signals.

## Next action

**Rotate `ATLASSIAN_API_TOKEN` (and verify `ATLASSIAN_EMAIL`) in the `dev1` environment secrets**, confirm `/rest/api/3/myself` returns 200 from the workflow, and either exempt `harness/eval-report` from the Playwright `dev1` environment or stop opening eval PRs that re-trigger full env-gated CI — so the flake window reflects product-test branches again.

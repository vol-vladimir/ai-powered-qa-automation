# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 27** completed `Playwright Tests` workflow runs on `main` (all available on that branch; workflow total on `main` is 27)  
**Generated:** 2026-10-10  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below cites CI/PR evidence or an explicit data gap.

### Data gaps this run

| Gap | Impact |
| --- | --- |
| `ATLASSIAN_API_TOKEN` → `GET /rest/api/3/myself` **HTTP 401** | Backlog mode processed **0** tickets; In Progress JQL could not be trusted |
| Secret `CURSOR_GH_MCP` invalid for `gh` | Used Actions `GITHUB_TOKEN` (git `http.extraheader`) for GitHub API/`gh` instead |
| Job logs for July 2026 runs | `gh run view --log` empty / REST **410** (retention) |
| Agent transcripts on this runner | Only **1** current-session `.jsonl` available — no historical ask/guess corpus |

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** (in accessible logs) |
| **Flake rate** | **0%** (0 flaky / 46 executed tests in sampled green runs with parseable summaries) |

**How measured:** Listed completed `playwright.yml` runs on `main` via GitHub API (`13 success / 13 failure / 1 cancelled`). Pulled logs with `gh run view --log` for green runs that still retain logs: [`32228851204`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32228851204) (`24 passed`, `1 skipped`), PR [`33171211413`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) (`11 passed`), PR [`33171251062`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) (`11 passed`). Searched for `N flaky` and `Retry #` — **none**. CI sets `retries: 2` when `CI` is set (`playwright.config.ts`). Older July green/red runs in the window no longer expose logs (410/empty).

**What it tells us:** In the log-retained slice, retries are not hiding flaky passes — but most of the historical window is opaque, so flake rate is **under-sampled**, not proven suite-wide.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR/commit history for heal/drift/locator. One classified drift cycle remains in scope:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional broken `semesterPanelHeading`.
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) (`Heal semester panel heading locator drift`) — check `Run Playwright tests` **success**; POM-only locator restore; assertions unchanged per prior review.

No additional heal/drift PRs since that cycle (`self-heal` search: 0; locator/drift: #7 only).

**What it tells us:** Self-heal still looks clean for the single known drift case — sample size remains **n = 1**.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2, #3, #4, #5, #6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **9 / 9 (100%)** under skill rules; **2 / 9** have machine PR-head CI |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR-body local/CI claim | ✅ on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ PR-body claim | ✅ on `main` | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ PR-body claim | ✅ on `main` | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ PR-body claim | ✅ on `main` | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ PR-body claim | ✅ on `main` | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ PR-body claim (merged) | ✅ on `main` | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ PR-body claim (merged) | ✅ on `main` | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ **PR CI** [`33171211413`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) success (`11 passed`) | ✅ open PR files | ✅ `features/DS-213.feature.md` |
| #13 | DS-215 | ✅ **PR CI** [`33171251062`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) success (`11 passed`) | ✅ open PR files | ✅ `features/DS-215.feature.md` |

`playwright.yml` now runs `npm run test:smoke` on `pull_request` — that gate is live for #12/#13. Older generation PRs predate reliable PR-head checks and rely on agent-cited local runs in the PR body.

**What it tells us:** Generated work maps to AC and stays constitution-shaped; the real upgrade since the last report is **PR CI on open generation PRs** — still only **2/9** are machine-gated green at PR head.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human clarification / `AskQuestion`) | **0** (this runner) |
| **Guess** (invented ticket AC, paths, or UI strings) | **0** (this runner) |
| **Ask ratio when uncertain** | **n/a** (no uncertain values invented; blocked on auth instead) |

**How measured:** Only transcript available: current session under `agent-transcripts/`. No `AskQuestion` tool calls. When Jira returned **401** and the In Progress search was empty/unauthenticated, the orchestrator **did not fabricate** backlog tickets or AC — stopped ticket work and continued to eval-report. Historical 51-transcript corpus from the 2026-08-18 report is **not present** on this runner (data gap).

**What it tells us:** This run complied with “Never invent” by failing closed on auth — but scheduled agents still cannot surface asks to a human mid-run, so secret/auth failures become silent backlog skips unless the report flags them.

---

## Top reliability risk

**Broken Atlassian auth stops backlog generation entirely.** `ATLASSIAN_EMAIL` + `ATLASSIAN_API_TOKEN` against `ATLASSIAN_BASE_URL` return **401** on `/rest/api/3/myself`; search/`issue` access is unusable, so this scheduled run processed **0 / 5** budgeted tickets while open generation PRs (#12, #13) already exist from earlier work. Secondary: `CURSOR_GH_MCP` is invalid, and many recent `playwright.yml` runs on `harness/eval-report` sit in `action_required` (environment `dev1` gate), which pollutes the default “last 30 runs” view if branch filter is omitted.

## Next action

**Rotate and verify secrets in the `dev1` environment:** set a working `ATLASSIAN_API_TOKEN` (confirm `GET /rest/api/3/myself` → 200 with `ATLASSIAN_EMAIL`), replace `CURSOR_GH_MCP` with a valid PAT/`gh` token, then re-run **DS Test Generation** once and confirm the backlog JQL returns In Progress issues without `tests-generated`.

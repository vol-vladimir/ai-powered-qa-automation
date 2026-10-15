# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs with conclusion `success` or `failure` (excluding `action_required` environment gates that dominate chronological recency)  
**Generated:** 2026-10-15  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from GitHub Actions logs, PR history, or agent session transcripts.

**Backlog run note (this session):** Jira REST API returned **HTTP 401** for `ATLASSIAN_EMAIL` + `ATLASSIAN_API_TOKEN` against `ATLASSIAN_BASE_URL` (`/rest/api/3/myself` and cloud gateway). Zero In Progress tickets were processed; ticket budget unused. Atlassian MCP also unavailable (`needsAuth`; interactive auth not supported in this Actions agent).

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / **88** tests executed across 6 sampled green runs) |

**How measured:** Listed completed `playwright.yml` runs via `gh api`. Chronological last-30 is mostly `harness/eval-report` PRs stuck in `action_required` (environment protection) — not useful for flake. Built an evidence window of the **30 most recent success|failure** runs (11 success / 19 failure). Sampled green job logs with `gh run view --log` for runs `32228851204` (24 passed), `33171251062` (11), `33171211413` (11), `32324459250` (9), `32224684389` (9), `32127250206` (24). Parsed for `N flaky` and `Retry #`; none appeared. CI still configures retries in `playwright.config.ts`.

**What it tells us:** Retries are configured but not masking instability in the sampled greens — failures elsewhere are hard reds or env/setup, not quiet flakes.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR search for heal/drift/locator. One classified drift cycle remains in history:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional break of `semesterPanelHeading`.
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) (merged 2026-07-09) restored `getByRole('heading', …)` in `pages/programs.page.ts` only; PR body cites green re-run and unchanged assertions.

No new heal PRs since the prior report. Masked-regression: heal diff is POM-only.

**What it tells us:** Self-heal still looks clean for locator drift, but **n = 1** — treat 100% as provisional.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2–#6, #8, #9, #12, #13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **6 / 9 (67%)** |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body + later CI | ✅ on `main` (POM, tags, web-first) | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ (incl. `test.fail`) | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ agent claim; now merged | ✅ on `main` | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ agent claim; CI later | ⚠️ merged spec **missing slice tags** on each `test()` | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ PR CI run [`33171211413`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) (11 passed) | ⚠️ open; not on `main` (spot-check deferred) | ✅ `features/DS-213.feature.md` on branch |
| #13 | DS-215 | ✅ PR CI run [`33171251062`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) (11 passed) | ⚠️ open; not on `main` | ✅ `features/DS-215.feature.md` on branch |

Gate definition: green before merge (agent local run and/or PR-head Actions), constitution conformity (POM, one tag per `test()`, web-first asserts), Gherkin maps to AC. **#9** fails conforming due to missing tags; **#12/#13** counted as not fully pass until merge + main spot-check (green CI helps but gate requires all three).

**What it tells us:** Generation quality is still strong on AC linkage and POM shape, but **tag discipline slipped** on DS-214 and two Settings siblings remain open — merge gate is uneven.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit stop / clarification when blocked) | **1** (this session: halt on Jira 401; no invented ticket ACs) |
| **Guess** (invented ticket/UI/env values) | **0** (this session) |
| **Ask ratio when uncertain** | **100%** (1 / 1) this session; prior report window was **73%** (8 / 11 across 51 transcripts — those transcripts are not retained in this runner) |

**How measured:** Current agent transcript under `.cursor/projects/.../agent-transcripts/` (1 file). No `AskQuestion` UI prompts available in Actions; counted constitution-aligned **stop without inventing** as Ask. Did not fabricate In Progress ticket keys or acceptance criteria when Jira auth failed.

**What it tells us:** This backlog run correctly refused to guess tickets, but **broken Atlassian credentials** mean the harness cannot do its primary job until secrets are rotated.

---

## Data gaps

- Chronological last-30 `playwright.yml` runs are dominated by `action_required` on `harness/eval-report` (dev environment approval) — flake sampling had to skip those.
- `CURSOR_GH_MCP` secret is invalid (401); used Actions checkout `ghs_` token instead.
- Atlassian MCP unauthenticated; Jira REST basic auth 401 — backlog size unknown this run.
- Historical ask/guess corpus (51 transcripts) not present on this runner; only current session counted freshly.

---

## Top reliability risk

**Jira auth failure + environment-gated Playwright CI.** Scheduled generation cannot read In Progress DS tickets (401), so the backlog loop is a no-op. Meanwhile most recent `playwright.yml` PR runs sit in `action_required`, so reliability signals and PR gates are invisible until a human approves the environment — hiding both flakes and real reds.

## Next action

**Rotate `ATLASSIAN_API_TOKEN` (and verify `ATLASSIAN_EMAIL`) in the `dev1` environment secrets, then confirm `/rest/api/3/myself` returns 200** before the next scheduled generation run. Optionally allow `playwright.yml` on `harness/eval-report` without environment approval so eval PRs do not flood the Actions list with `action_required` noise.

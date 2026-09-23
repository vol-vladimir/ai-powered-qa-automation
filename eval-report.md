# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (GitHub Actions REST + job logs)  
**Generated:** 2026-09-23  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from CI logs, PR history, or agent session transcripts available on this runner.

**Backlog context (this run):** JQL  
`project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))`  
returned **0** issues. Eleven In Progress tickets exist; all already carry `tests-generated`. No ticket specs or ticket PRs were opened. Budget was 5; backlog exhausted first.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 flaky / **64** passed across all **5** green runs in the window) |

**How measured:** Listed the 30 most recent `playwright.yml` runs via public/API + `gh`. Conclusions: **5 success / 3 failure / 1 cancelled / 21 action_required**. Downloaded job logs for every green run in the window (`33171251062`, `33171211413`, `32324459250`, `32228851204`, `32224684389`). Parsed Playwright summaries (`N passed`, `N flaky`, `Retry #N`). Zero log lines matched `flaky` or `Retry #`. Passed counts: 11+11+9+24+9 = **64**. CI config still sets `retries: 2` in `playwright.config.ts`.

**What it tells us:** Retries are configured but unused in green runs — most of the window never reaches Playwright at all (`action_required` environment gates on `harness/eval-report` PRs), so flake signal is thin despite a clean 0% in the runnable sample.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR history search (`heal` / `drift` / `locator` in title). One classified drift cycle still in scope:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional break of `semesterPanelHeading`.
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored role-based locator; check run on heal head green; PR body states assertions unchanged.

Masked-regression check: PR #7 files API shows POM-only diff (`pages/programs.page.ts`); no `expect()` removals.

**What it tells us:** Self-heal works for locator drift without softening assertions — but sample size remains **n = 1**; no new heal attempts in this window.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **9** (#2–#6, #8–#9, #12–#13) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **9 / 9 (100%)** |
| **Open (awaiting human merge)** | **2** (#12 DS-213, #13 DS-215) |

**How measured:**

| PR | Ticket | First-PR green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ merged; body cites local/CI pass | ✅ on `main` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ (incl. intentional `test.fail`) | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ merged | ✅ on `main` | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ merged | ✅ on `main` | ✅ `features/DS-214.feature.md` |
| #12 | DS-213 | ✅ check `Playwright (pull_request)` success (`33171211413`) | ✅ PR cites POM + tags | ✅ `features/DS-213.feature.md` (on PR branch) |
| #13 | DS-215 | ✅ check success (`33171251062`) | ✅ PR cites POM + tags | ✅ `features/DS-215.feature.md` (on PR branch) |

Gate definition: green evidence on PR head (Actions check when present, else agent-cited local run in body), constitution conformity (POM, one tag per `test()`, web-first asserts), Gherkin/AC plan present.

**What it tells us:** Generated specs in this label set are structured and AC-linked, and open PRs now have machine-green PR checks — but **21/30** recent workflow conclusions are `action_required`, so the gate is uneven: ticket branches run; eval-report PRs stall on environment approval.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human input / `AskQuestion`) | **0** |
| **Guess** (invented / assumed value without evidence) | **0** |
| **Ask ratio when uncertain** | **n/a** (no AskQuestion events; uncertainties resolved by repo/API exploration) |

**How measured:** This runner retains **1** agent transcript (current backlog session). Scanned for `AskQuestion` tool uses (**0**). Uncertainties (empty backlog JQL, invalid `CURSOR_GH_MCP`, job-log 403 anonymously) were resolved via Jira REST, git `http.extraheader` token, and authenticated log download — not by inventing ticket keys, UI strings, or flake counts. Historical multi-session corpus from prior reports is **not** present on this runner (data gap vs. prior “51 transcripts” claim).

**What it tells us:** This run followed “Never invent” for metrics and backlog selection; ask-vs-guess trend across sessions cannot be re-validated here without retained transcripts.

---

## Data gaps

- **Job logs** require authenticated Actions access (anonymous 403); measured via `GITHUB_TOKEN` from the checkout `http.extraheader`.
- **Atlassian MCP** unavailable in this environment (interactive auth only); Jira accessed via REST (`ATLASSIAN_EMAIL` + `ATLASSIAN_API_TOKEN`).
- **Agent transcripts:** only the current session is on disk — ask-vs-guess is session-scoped, not a 30-day trend.

---

## Top reliability risk

**Environment approval starvation:** **21 of the last 30** Playwright workflow runs concluded `action_required`, almost all on `harness/eval-report` pull_request runs. That leaves only **5** green executions in the window for flake measurement and blocks automated confidence on the harness PR itself. Combined with an **empty eligible In Progress backlog** (all 11 In Progress issues already labeled `tests-generated`), the generation loop has nothing new to process while CI signal thins out.

## Next action

**Unblock `harness/eval-report` (and scheduled) Playwright runs from `action_required`** — either approve the pending environment deployments or exempt the eval-report branch / report-only PRs from the `dev1` environment gate — then move unlabeled DS To Do stories into In Progress so the next backlog run has eligible tickets.

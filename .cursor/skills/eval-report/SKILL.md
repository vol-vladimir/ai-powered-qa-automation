---
name: eval-report
description: >-
  Produces eval-report.md — a suite reliability scorecard: flake rate, heal
  success, generation-gate pass rate, and ask-vs-guess. Use when the user asks
  for an eval report, reliability report, harness metrics, or after a Backlog
  mode run completes (mandatory). Do NOT use for a single red-run triage
  (ci-failure-triage) or ticket Gherkin (jira-ticket-analyzer).
---

# Eval Report — Suite Reliability

Measure harness health from **evidence**, not memory. Cursor has no built-in
telemetry — every number must cite how it was measured (CI logs, PR history,
session transcripts).

## Output (fixed path)

Write or overwrite **`eval-report.md`** at the repo root. Do not save under
`.ci-artifacts/` — that folder is for CI dumps; the eval is a living harness
artifact humans review in PRs.

## When to run (mandatory)

| Trigger | Who runs it |
| --- | --- |
| **Backlog mode finished** (ticket processed or backlog empty) | QA orchestrator — **before stop** |
| User asks for eval / reliability / harness metrics | Any agent with GitHub + repo access |
| After a heal PR opens | Optional refresh if the window includes that heal |

Backlog mode **must not** end without refreshing `eval-report.md` when GitHub
MCP or `gh` can reach Actions and PRs. If auth blocks CI, still write the
report with an explicit **data gap** section — do not invent metrics.

## Default window

**N = 30** most recent **completed** runs of `.github/workflows/playwright.yml`
(`Playwright Tests`). State N in the report header.

## Procedure

### 1. Flake rate

1. `actions_list / list_workflow_runs` — `owner` + `repo`, `resource_id`:
   `playwright.yml`, `per_page: 30`.
2. For a **sample** of green runs (at least 3, spanning the window), pull job
   logs: `list_workflow_jobs` → `get_job_logs` (`return_content: true`).
3. Parse Playwright summary lines: `N flaky`, `Retry #N`, final `N passed`.
4. Count **tests passed only on retry** = runs where summary includes `N flaky`
   with N > 0. Retries that still fail are **not** flakes.
5. Flake rate = flaky test count / total tests executed in sampled green runs
   (or state "0 flaky in window" if none).

**One-line insight:** what retry config is hiding or exposing.

### 2. Heal success rate

1. PR history: search merged/closed PRs with heal/drift/locator in title or body;
   cross-reference `self-heal` commits and red runs they cite.
2. **Drift runs healed cleanly** = triage classified drift → POM-only patch →
   green re-run with **assertions unchanged**.
3. **Masked-regression count** = heals that weakened, removed, or commented out
   `expect(...)` to go green. **Must be 0.** If > 0, flag as stop-ship.
4. Rate = clean heals / total drift heal attempts in the window.

**One-line insight:** whether self-heal buys real green or masks regressions.

### 3. Generation-gate pass rate

1. List PRs with label **`tests-generated`** (`list_pull_requests` or
   `search_pull_requests`).
2. For each PR, check three gates on **first PR** (branch at open time):
   - **Green** — CI check on PR head, or agent-cited local run in PR body if
     no PR workflow ran (say so explicitly).
   - **Conforming** — POM locators, one tag per `test()`, web-first asserts,
     no constitution WON'T (spot-check diff + hook intent).
   - **Maps to AC** — linked `features/DS-*.feature.md` or Gherkin plan in PR.
3. Pass rate = PRs passing all three / total `tests-generated` PRs in window.

**One-line insight:** whether generated specs are merge-ready or green-by-claim.

### 4. Ask-vs-guess

1. Review agent session transcripts for this repo (`.cursor/projects/.../
   agent-transcripts/**/*.jsonl` when available).
2. **Ask** = `AskQuestion` tool calls or explicit human clarification before
   using a value (env var, path, UI string, enum).
3. **Guess** = assistant proceeded with an unverified value (placeholder,
   assumed path, invented label) without repo/Jira/UI evidence.
4. Report counts and ask ratio = ask / (ask + guess).

**One-line insight:** constitution "Never invent" compliance in practice.

### 5. Close the report

Always end with:

- **Top reliability risk** — single biggest harness or suite gap in the window.
- **Next action** — one concrete step (workflow, gate, or skill change).

## Report template

Use this structure (fill numbers from evidence):

```markdown
# Eval Report — Suite Reliability

**Repo:** [owner/repo link]
**Window:** last N = [30] completed Playwright Tests workflow runs
**Generated:** [ISO date]
**Note:** Cursor has no built-in telemetry for these metrics.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | [n] |
| **Flake rate** | [x%] |

**How measured:** [CI log sources, sample runs]
**What it tells us:** [one line]

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | [a / b] |
| **Heal success rate** | [x%] |
| **Masked-regression count** | [0 required] |

**How measured:** [PRs, runs, diffs]
**What it tells us:** [one line]

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with tests-generated label** | [n] |
| **Pass (green + conforming + maps-to-AC on first PR)** | [p / n] |

**How measured:** [PR table or summary]
**What it tells us:** [one line]

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** | [n] |
| **Guess** | [n] |
| **Ask ratio when uncertain** | [x%] |

**How measured:** [transcript review scope]
**What it tells us:** [one line]

---

## Top reliability risk

[One paragraph]

## Next action

[One concrete step]
```

## Rules

- **Never invent metrics.** Missing CI → document the gap; do not fill with zeros
  without evidence.
- **Do not triage a single failure here.** One red run → `ci-failure-triage`.
- **Do not merge or change specs** as part of eval — read-only except
  `eval-report.md`.
- Backlog mode: commit `eval-report.md` on a **`harness/eval-report`** branch
  and open a PR when the scheduled agent has `contents: write`; otherwise leave
  the file updated locally and note "not committed" in chat.

## Done

`eval-report.md` at repo root reflects the four sections with measured numbers,
method lines, one-line insights, top risk, and next action.

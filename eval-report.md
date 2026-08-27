# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)  
**Window:** last **N = 30** completed `Playwright Tests` workflow runs (GitHub Actions via `gh`)  
**Generated:** 2026-08-27  
**Note:** Cursor has no built-in telemetry for these metrics. Every number below was measured from CI logs, PR history, or agent session transcripts available on this runner.

**Backlog context (this run):** JQL  
`project = DS AND status = "In Progress" AND (labels is EMPTY OR labels not in (tests-generated))`  
returned **0** issues. All 11 In Progress DS tickets already carry `tests-generated`. Ticket budget (5) unused; eval refresh only.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | **0** |
| **Flake rate** | **0%** (0 / 294 executed tests in sampled green runs) |

**How measured:** Listed 30 most recent `playwright.yml` runs (`gh run list`). Outcomes: **16 success / 9 failure / 4 action_required / 1 cancelled**. Sampled 6 green runs spanning Jun–Aug 2026 ([`32324459250`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32324459250), [`32228851204`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32228851204), [`32127250206`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32127250206), [`29054958948`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29054958948), [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199), [`27943536907`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/27943536907)). Parsed job logs for `N passed` / `N flaky` / `Retry #N`. Summaries: 9 + 24 + 24 + 84 + 82 + 71 = **294** passed; **zero** `flaky` or `Retry #` lines. CI still sets `retries: 2` when `CI` is set (`playwright.config.ts`).

**What it tells us:** Retries are armed but not masking instability in this window — reds that retry still fail (e.g. `ds4-delete-program` strict-mode collision after #8 merge), so failures are real, not hidden flakes.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | **1 / 1** |
| **Heal success rate** | **100%** |
| **Masked-regression count** | **0** (must stay 0) |

**How measured:** PR + Actions cross-check in the window:

1. **Red (drift):** run [`29049033045`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29049033045) — intentional `semesterPanelHeading` break (`ds6` TC-001/002).
2. **Heal:** PR [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7) restored `getByRole('heading', …)`; run [`29050960199`](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/29050960199) green; assertions unchanged per PR body; POM-only diff.

No additional drift→heal cycles found in newer PRs (`heal/` search). Masked-regression check remains 0 (constitution WON'T hook blocks weakened `expect(...)`).

**What it tells us:** Self-heal bought real green once without softening checks — sample size is still **n = 1**, so treat 100% as provisional.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with `tests-generated` label** | **7** (#2, #3, #4, #5, #6, #8, #9) |
| **Pass (green + conforming + maps-to-AC on first PR)** | **7 / 7 (100%)** — green = agent-cited local run in PR body |

**How measured:**

| PR | Ticket | First-PR green | Conforming (now on `main`) | Maps to AC |
| --- | --- | --- | --- | --- |
| #2 | DS-2 | ✅ PR body local pass | ✅ `tests/ds2-edit-program.spec.ts` | ✅ `features/DS-2.feature.md` |
| #3 | DS-3 | ✅ | ✅ | ✅ `features/DS-3.feature.md` |
| #4 | DS-120 | ✅ | ✅ | ✅ `features/DS-120.feature.md` |
| #5 | DS-177 | ✅ | ✅ | ✅ `features/DS-177.feature.md` |
| #6 | DS-129 | ✅ (incl. `test.fail` cases) | ✅ | ✅ `features/DS-129.feature.md` |
| #8 | DS-119 | ✅ agent claim | ✅ merged 2026-08-19 | ✅ `features/DS-119.feature.md` |
| #9 | DS-214 | ✅ agent claim | ✅ merged 2026-08-19 | ✅ `features/DS-214.feature.md` |

`gh pr checks` on the original feature branches still reports **no checks** for #2–#6 / #8 / #9. `playwright.yml` now has `pull_request` → `npm run test:smoke`, but recent PR runs on `harness/eval-report` sit at **`action_required`** (GitHub Environment `dev1` approval), so machine-enforced first-PR green is still not observed for generated specs.

**What it tells us:** Generated work is merge-complete and AC-linked on `main`, but “first PR green” remains **green-by-claim** until environment-protected PR smoke actually runs without waiting on approval.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** (explicit human / AskQuestion) | **0** |
| **Guess** (invented / assumed value) | **0** |
| **Ask ratio when uncertain** | **n/a** (0 uncertain decisions requiring a value) |

**How measured:** Only **1** agent transcript is present on this runner (current session). No `AskQuestion` tool calls. Uncertain inputs were resolved by evidence: Jira REST (`/rest/api/3/search/jql`) for backlog emptiness; `CURSOR_GH_MCP` for `gh`; repo tree for specs/features — no placeholder ticket keys, env names, or UI strings invented.

**Data gap:** Prior reports cited ~51 historical transcripts (Ask 8 / Guess 3). Those files are **not** on this Actions runner, so historical ask/guess cannot be re-measured here without inventing numbers.

**What it tells us:** This backlog run stayed evidence-first; historical ask-ratio is unavailable — do not treat session 0/0 as suite-wide improvement.

---

## Top reliability risk

**PR smoke is gated behind Environment `dev1` approvals.** Four of the last 30 Playwright runs are `action_required` on `harness/eval-report` pull_request jobs — the generation gate’s CI path exists in YAML but does not auto-verify `tests-generated` PRs. Combined with remaining push reds (e.g. post-#8 `ds4` strict-mode litter), merge confidence still leans on agent local claims rather than machine gates.

## Next action

**Unblock PR smoke for the generation gate:** allow `pull_request` jobs on `playwright.yml` to use secrets without a manual Environment approval (or a dedicated unprotected smoke environment), then require a green PR-head smoke check before merging `tests-generated` PRs.

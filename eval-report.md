# Eval Report — Suite Reliability

**Repo:** [vol-vladimir/ai-powered-qa-automation](https://github.com/vol-vladimir/ai-powered-qa-automation)
**Window:** last N = 30 completed `Playwright Tests` workflow runs (`playwright.yml`)
**Generated:** 2026-09-29
**Note:** Cursor has no built-in telemetry for these metrics.

Window membership (newest first): runs [36221954976](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/36221954976) (2026-09-26) through [32324459250](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32324459250) (2026-08-20). Outcome split: 20 `action_required`, 7 `failure`, 3 `success`. `gh run view` for every `action_required` and `failure` run in this sample showed **0 jobs**, so those 27 runs never started a Playwright job.

---

## 1. Flake rate

| Metric | Value |
| --- | --- |
| **Tests passed only on retry** | 0 |
| **Flake rate** | 0% (0 flaky / 31 tests in the green sample) |

**How measured:** `gh run list --workflow playwright.yml --limit 30`. The only green runs in the window are [33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062) (11 passed), [33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413) (11 passed), and [32324459250](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/32324459250) (9 passed). Full job logs (`gh run view --log`) contain no `flaky` summary and no `Retry #` lines. `playwright.config.ts` sets `retries: 2` when `CI` is set.

**What it tells us:** In the three runs that actually executed Playwright, retries did not hide any passing-on-retry tests.

---

## 2. Heal success rate

| Metric | Value |
| --- | --- |
| **Drift runs healed cleanly** | 0 / 0 |
| **Heal success rate** | n/a (no drift heal attempts in this window) |
| **Masked-regression count** | 0 |

**How measured:** `gh pr list --search "heal OR drift OR locator in:title"` plus the full PR list. The only locator-heal PR is [#7](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/7), merged 2026-07-09, which is older than the earliest run in this 30-run window (2026-08-20). Its diff is `pages/programs.page.ts` only and the PR body states assertions were unchanged. [#10](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/10) is harness hardening, not a drift patch. No heal PR was opened or merged inside this window.

**What it tells us:** This window does not contain a new self-heal cycle to score.

---

## 3. Generation-gate pass rate

| Metric | Value |
| --- | --- |
| **PRs with tests-generated label** | 9 |
| **Pass (green + conforming + maps-to-AC on first PR)** | 2 / 9 |

**How measured:** `gh pr list --label tests-generated --state all`, then each PR's files, spec text at the head SHA, and body/`passed` lines. Green means a successful `playwright.yml` run on that PR, or a local pass count written in the PR body when no job ran. Conforming means the first-PR spec has one `@tag` per `test()`, uses the cleanup fixture or page objects, and does not contain `waitForTimeout`, XPath, or `page.locator(`. Maps to AC means a `features/DS-*.feature.md` file is in the PR.

| PR | Ticket | Green | Conforming | Maps to AC |
| --- | --- | --- | --- | --- |
| [#2](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/2) | DS-2 | Local claim: 15 passed | First PR contains only `features/DS-2.feature.md` (no spec) | Yes |
| [#3](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/3) | DS-3 | Local claim: 17 passed | First PR contains only the feature file | Yes |
| [#4](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/4) | DS-120 | Local claim: 4 passed | Spec has 4 `test()` and 0 tags | Yes |
| [#5](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/5) | DS-177 | Local claim: 5 passed | Specs have 0 tags | Yes |
| [#6](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/6) | DS-129 | Local claim: 3 passed | Spec has 2 `test()` and 0 tags | Yes |
| [#8](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/8) | DS-119 | Local claim: 7 passed | Spec has 6 `test()` and 0 tags | Yes |
| [#9](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/9) | DS-214 | Local claim: 10 passed | Spec has 9 `test()` and 0 tags | Yes |
| [#12](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/12) | DS-213 | CI [33171211413](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171211413): 11 passed | 9/9 tests tagged; no `waitForTimeout` / XPath / CSS locator in the spec | Yes |
| [#13](https://github.com/vol-vladimir/ai-powered-qa-automation/pull/13) | DS-215 | CI [33171251062](https://github.com/vol-vladimir/ai-powered-qa-automation/actions/runs/33171251062): 11 passed | 9/9 tests tagged; no `waitForTimeout` / XPath / CSS locator in the spec | Yes |

**What it tells us:** Two open PRs clear all three gates on CI evidence. The other seven miss the conforming gate on the first PR (missing spec, or missing the one-tag-per-test rule).

This backlog run (2026-09-29) pushed `test/DS-131-duplicate-name-on-edit`, `test/DS-213-add-user-settings`, and `test/DS-215-add-user-settings` after local green runs. `POST /pulls` returned HTTP 403: "GitHub Actions is not permitted to create or approve pull requests." Those branches are not in the 9 labeled PRs above.

---

## 4. Ask-vs-guess

| Metric | Value |
| --- | --- |
| **Ask** | 0 in this session |
| **Guess** | 0 in this session |
| **Ask ratio when uncertain** | Not computed for history (transcript data gap) |

**How measured:** Searched `/home/runner/.cursor/projects` for `*.jsonl` agent transcripts. Count is 0, so the earlier claim of 51 transcripts cannot be re-counted on this runner. This session used Jira REST (`/rest/api/3/search/jql` and issue bodies), existing page objects, and the DS-214 clone link for empty DS-213 and DS-215 descriptions. No `AskQuestion` call. No placeholder label, path, or env var was introduced without that evidence.

**What it tells us:** This session stayed on repo and Jira evidence. A historical ask ratio needs the transcript files, which are not on this runner.

---

## Top reliability risk

Twenty-seven of the last 30 Playwright workflow runs never started a job (`action_required` or `failure` with an empty job list), and the Actions token cannot open pull requests. Generated specs can be pushed, and a human still has to create the PR by hand, while the scheduled suite is not producing fresh green-or-red evidence.

## Next action

In the GitHub repository settings, allow GitHub Actions to create pull requests, and approve the `dev1` environment (or remove the protection that leaves `playwright.yml` runs at `action_required` with zero jobs) so the next backlog branch gets a labeled PR and a real Playwright job log.

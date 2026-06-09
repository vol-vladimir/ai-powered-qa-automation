---
name: ci-failure-triage
description: When a CI run is red, pull the run's logs and the
  playwright-report artifact via the GitHub MCP, read the Playwright error
  and trace, cross-reference the spec and POM in the repo,
  classify real app bug vs test issue, and post a structured diagnosis
  to the PR. Use whenever a build fails — even if triage isn't asked for.
---

# CI Failure Triage

## Tooling
Use the **GitHub MCP** (`user-github`) for all run access — `gh` CLI is not
authenticated in this environment. Repo: `vol-vladimir/ai-powered-qa-automation`.

Relevant MCP tools (always pass `owner` + `repo`):
- `actions_list` — `list_workflow_runs` (find the run; filter by `branch` /
  `status` / `event`), `list_workflow_jobs` (`resource_id` = run id),
  `list_workflow_run_artifacts` (`resource_id` = run id).
- `actions_get` — `get_workflow_run`, `get_workflow_job`,
  `get_workflow_run_logs_url` (logs), `download_workflow_run_artifact`
  (`resource_id` = artifact id).

## Steps
1. Find the failed run and pull its logs + artifacts via the GitHub MCP.
   - `actions_list / list_workflow_runs` (filter `branch`, look for
     `conclusion: failure`) to get the run id.
   - `actions_list / list_workflow_jobs` (run id) → identify the failed job,
     then `actions_get / get_workflow_run_logs_url` for the log archive.
   - `actions_list / list_workflow_run_artifacts` (run id) to find the
     `playwright-report` (and `test-results`) artifact id, then
     `actions_get / download_workflow_run_artifact` to fetch it.
2. Read the Playwright error: failing test, expected vs received, trace path.
   - Open the HTML report: `npx playwright show-report <extracted-report-dir>`.
   - Inspect a trace zip directly: `npx playwright show-trace <path>/trace.zip`
     (extract with `unzip` first if you only need the screenshots/errors).
3. Cross-reference: the spec/AC and the test code — the spec file and the
   POM (see pom-conventions) in this repo. The Didaxis app source is not
   accessible, so reason about app behavior from the failing assertion,
   trace, screenshots, and the live app via Playwright MCP.
4. Classify: real app bug (route to a Jira bug via jira-bug-reporter) vs
   test issue (propose a patch for human review).
5. Report: post root cause, affected file, expected/actual, suggested fix,
   and evidence (trace/screenshot + run id) as a PR comment.

## Rules
- Never merge a fix automatically — propose, a human approves.
- For a real defect, reuse the jira-bug-reporter skill and link the story.
- The diagnosis must name the source location and cause, not just the symptom.

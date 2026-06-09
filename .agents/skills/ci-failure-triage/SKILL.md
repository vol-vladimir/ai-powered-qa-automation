---
name: ci-failure-triage
description: When a CI run is red, pull the run's logs and the
  playwright-report artifact via GitHub MCP or GH CLI, read the Playwright error
  and trace, cross-reference the spec, POM, and app source in the repo,
  classify real app bug vs test issue, and post a structured diagnosis
  to the PR. Use whenever a build fails — even if triage isn't asked for.
---

# CI Failure Triage

## Steps
1. Pull the failed run's logs + playwright-report artifact (GitHub MCP / gh CLI).
   - `gh run list --branch <branch> --limit 5` to find the run id.
   - `gh run view <run-id> --log-failed` for the failing step's logs.
   - `gh run download <run-id> --name playwright-report --dir ./_ci-report`
     (and `--name <trace-artifact>` if traces are uploaded separately).
2. Read the Playwright error: failing test, expected vs received, trace path.
   - Open the HTML report: `npx playwright show-report ./_ci-report`.
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

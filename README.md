# Playwright tests for Didaxis Studio

End-to-end Playwright tests for [Didaxis Studio](https://test.didaxis.studio), plus Cursor agents and skills for ticket-driven test generation. This is a learning project: specs live in `tests/`, page objects in `pages/`, and credentials always come from the environment — never hardcode them.

## Prerequisites

- Node.js 20+
- npm

## Install

```bash
git clone https://github.com/vol-vladimir/ai-powered-qa-automation.git
cd ai-powered-qa-automation
npm ci
npx playwright install --with-deps chromium
```

## Environment

Copy the example file and fill in your values (never commit `.env` — it is gitignored):

```bash
cp .env.example .env
```

On Windows (cmd): `copy .env.example .env`

See `.env.example` for placeholder values and a comment per variable. For local test runs you only need the **Run tests** section:

| Variable | Purpose |
| --- | --- |
| `DIDAXIS_URL` | Playwright `baseURL` |
| `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD` | Login in `tests/auth.setup.ts` → `storageState` |
| `DIDAXIS_API_TOKEN` | API cleanup and setup/teardown |
| `DIDAXIS_ALT_EMAIL` / `DIDAXIS_ALT_PASSWORD` | Optional — permission probes skip when unset |

Some specs still read `DIDAXIS_NONADMIN_EMAIL` / `DIDAXIS_NONADMIN_PASSWORD`. Set those to the same values as `DIDAXIS_ALT_*` if you need those tests.

The **Agent / CI setup** section (`CURSOR_API_KEY`, `ATLASSIAN_*`) is for the headless agent workflow and Atlassian MCP — not required to run tests locally.

## Run tests

Full suite. The `setup` project authenticates first and writes `storageState`; `chromium` then runs `ds*.spec.ts`:

```bash
npx playwright test
npx playwright test --ui
```

Single file:

```bash
npx playwright test tests/ds3-create-program-validation.spec.ts
```

Open the HTML report after a run:

```bash
npx playwright show-report
```

### Tagged slices

Each `test()` carries exactly one of `@smoke` `@sanity` `@regression` `@api` `@e2e` `@destructive` — never tag `describe()`. `@destructive` is only for tests that mutate shared/global state (locale, roles, flags, settings) and runs serially. A test that cleans up only its own data keeps its importance tag.

```bash
npm run test:smoke        # critical path
npm run test:sanity       # broader happy path
npm run test:regression   # edge cases & depth
npm run test:api          # API / mocked routes
npm run test:e2e          # full UI journeys
npm run test:destructive  # shared-state mutators (serial, --workers=1)
```

## CI

### Playwright suite (`.github/workflows/playwright.yml`)

| Event | Slice | Command |
| --- | --- | --- |
| `pull_request` | `@smoke` | `npm run test:smoke` |
| `push` | `@sanity` | `npm run test:sanity` |
| `workflow_dispatch` | Full suite (all tests) | `npx playwright test` |

Run the full regression suite on demand: **Actions → Playwright Tests → Run workflow**. That is every spec (`npx playwright test`), not `npm run test:regression` (the `@regression` tag slice). The report uploads as the `playwright-report-<event>` artifact.

### Test generation (`.github/workflows/test-generation.yml`)

Headless Cursor agent: weekday schedule plus **Actions → DS Test Generation → Run workflow**. Needs repo secrets for Didaxis, `CURSOR_API_KEY`, and `ATLASSIAN_*`. It does not merge PRs — a human approves.

## Layout

| Path | Role |
| --- | --- |
| `tests/` | Playwright specs (`ds*.spec.ts`) and `auth.setup.ts` |
| `pages/` | Page Object Models — locators live here, not in specs |
| `fixtures/` | Shared fixtures (API cleanup / program tracking) |
| `support/` | Auth, Didaxis API helpers, unique suffixes |
| `test-data/factories/` | Faker builders for happy-path data |
| `test-data/invalid/` | Curated invalid inputs (not Faker) |
| `test-data/enums/` | Repeated routes and UI copy |
| `.cursor/` | Rules, agents, skills, and the constitution WON'T hook |

## Cursor agents & skills

Open this repo in Cursor. Project rules under `.cursor/rules/` load automatically (`constitution.mdc` is always on).

| Path | Role |
| --- | --- |
| `.cursor/rules/constitution.mdc` | Always-on MUST / SHOULD / WON'T |
| `.cursor/rules/playwright-conventions.mdc` | Locators, POM, auth, data, tags, assertions |
| `.cursor/rules/qa-orchestrator.mdc` | Ticket / CI workflow coordinator |
| `.cursor/skills/` | `pom-conventions`, `api-cleanup`, `jira-ticket-analyzer`, `self-heal`, `ci-failure-triage`, `jira-bug-reporter`, `explore-and-generate`, `exploratory-charter`, `eval-report`, `didaxis-program-deleter` |
| `.cursor/agents/` | `test-writer`, `triage`, `bug-reporter` |
| `.cursor/hooks/` | Blocks constitution WON'T violations on `Write` to `tests/` and `pages/` |
| `eval-report.md` | Suite reliability scorecard (flake, heal, generation-gate, ask-vs-guess); refreshed after Backlog mode via `eval-report` skill |

**MCP in Cursor Settings** (not in `.env` for local IDE use): configure Atlassian and GitHub MCP servers with your tokens so agents can read Jira tickets and CI runs. Do not commit `.cursor/mcp.json` (gitignored). CI uses repo secrets — see `.github/workflows/test-generation.yml`.

Typical flow: give the orchestrator a Jira key (`DS-3`) or a failed run id → it analyzes the ticket, delegates to `test-writer`, runs the spec, and routes red builds through `triage` → `self-heal` (locator drift only) or `bug-reporter`. A human approves any merge and any bug before it is filed.

---
name: exploratory-charter
description: >-
  Turns a feature name and a risk into a session charter and a blank findings
  template. Use when the user asks for an exploratory charter, session charter,
  exploratory testing plan, session sheet, or wants to structure a time-boxed
  exploration before or after clicking through the app. The tester supplies the
  thinking; this skill only enforces the format. Do NOT use for Jira-to-Gherkin
  (jira-ticket-analyzer) or for crawling the UI to find untested flows
  (explore-and-generate).
---

# Exploratory Charter

A tiny procedure: **feature + risk → charter + findings template**.

The thinking is human; the skill just keeps the format. Do **not** invent
risks, oracles, or findings — ask the human or use what they already gave you.

## When to use

| Use this skill | Use something else |
|----------------|--------------------|
| Human will explore; needs a charter and a sheet | Ticket → Gherkin: `jira-ticket-analyzer` |
| User named a feature and a risk | Coverage-gap crawl → automation plan: `explore-and-generate` |

## Inputs (required)

| Input | Example |
| --- | --- |
| **Feature** | Program semester selection |
| **Risk** | Wrong program context shown after switching selection |

Optional: time box (minutes), scope in/out, ticket key, page URL.

## Procedure

1. Confirm **feature** and **risk** with the user if either is missing.
2. Fill the **Charter** template below — leave `[brackets]` only where the
   human has not supplied content yet; do not fabricate probes or oracles.
3. Append the **Findings** template (empty rows) on the same file.
4. Save as `charters/<feature-slug>.md` (slug: lowercase, hyphens, no spaces)
   unless the user names another path or asks for chat-only.
5. Stop. Do not explore the app, run Playwright, write specs, or file bugs.

## Charter template

```markdown
# Charter — [Feature]

| Field | Value |
| --- | --- |
| Feature | [feature] |
| Risk | [risk] |
| Time box | [e.g. 45 min] |
| In scope | [pages, roles, flows] |
| Out of scope | [explicit exclusions] |
| Ticket | [DS-NN or —] |

## Mission

Explore **[feature]** with **[risk]** as the primary concern.

## Oracles

What would signal a problem? (human — do not invent)

- [oracle 1]
- [oracle 2]

## Areas to probe

Where might the risk show up? (human — do not invent)

- [area 1]
- [area 2]

## Notes before start

[assumptions, data needed, env, blockers]
```

## Findings template

Append after the charter:

```markdown
---

# Findings — [Feature]

| # | Type | Area | Observation | Severity | Follow-up |
| --- | --- | --- | --- | --- | --- |
| 1 | bug / question / note | | | | |
| 2 | | | | | |

## Coverage

- **Tried:** [flows, states, roles visited]
- **Not tried:** [deferred for next session]
- **Charter done?** yes / no — [reason if no]
```

**Type:** `bug` (defect), `question` (needs PO/dev answer), `note` (risk lowered, no action).

## Rules

- Thinking is human; you fill headings and tables only.
- Empty findings rows are fine at charter time.
- Do not write Playwright specs, file Jira bugs, or run tests in this skill.
- After exploration, the human (or a follow-up task) updates the findings table.

## Example

**Input:** feature = Create Program dialog; risk = duplicate names accepted.

```markdown
# Charter — Create Program dialog

| Field | Value |
| --- | --- |
| Feature | Create Program dialog |
| Risk | duplicate names accepted |
| Time box | [e.g. 45 min] |
| In scope | [pages, roles, flows] |
| Out of scope | [explicit exclusions] |
| Ticket | [DS-NN or —] |

## Mission

Explore **Create Program dialog** with **duplicate names accepted** as the primary concern.

## Oracles

What would signal a problem? (human — do not invent)

- [oracle 1]
- [oracle 2]

## Areas to probe

Where might the risk show up? (human — do not invent)

- [area 1]
- [area 2]

## Notes before start

[assumptions, data needed, env, blockers]

---

# Findings — Create Program dialog

| # | Type | Area | Observation | Severity | Follow-up |
| --- | --- | --- | --- | --- | --- |
| 1 | bug / question / note | | | | |
| 2 | | | | | |

## Coverage

- **Tried:** [flows, states, roles visited]
- **Not tried:** [deferred for next session]
- **Charter done?** yes / no — [reason if no]
```

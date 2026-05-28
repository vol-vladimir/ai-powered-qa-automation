# Disabled skills

Skills here are kept in the repo but **not** loaded by Cursor. Cursor only discovers `SKILL.md` under `.agents/skills/` (and `.cursor/skills/`).

## Re-enable a skill

Move the skill folder back into `.agents/skills/`:

```text
.agents/skills-disabled/test-plan-to-playwright/
  → .agents/skills/test-plan-to-playwright/
```

Restart the agent session (or Cursor) if the skill does not disappear from the Rules → Skills list immediately.

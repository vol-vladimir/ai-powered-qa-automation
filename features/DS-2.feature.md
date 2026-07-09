# DS-2 — Edit existing program details

**Jira:** [DS-2](https://legionqaschool.atlassian.net/browse/DS-2) — Edit existing program details  
**Story:** As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

---

Feature: Edit existing program details (DS-2)

# Happy paths

Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data

Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"

Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged

# Negative

Scenario: Duplicate program name is rejected on edit
  Given programs "Web Development 2026 A" and "Data Science 2026" exist
  When I edit "Web Development 2026 A" and rename it to "Data Science 2026"
  Then I see duplicate-name validation feedback
  And the original program names remain unchanged

Scenario: Whitespace-only name is rejected on edit
  Given I am editing a program
  When I change the Name to "   "
  Then the Save button is disabled
  And the modal remains open

# Edge cases

Scenario: Case-only duplicate name is rejected on edit
  Given programs "Web Development 2026" and "web development 2026" differ only by case
  When I edit one program to match the other's name with different casing
  Then I see duplicate-name validation feedback

---

## Ambiguities / gaps

- Ticket AC does not specify validation rules for special characters or max length on edit (covered by extended scenarios in the spec).
- Duplicate-name rejection is required by product intent but currently allowed in the demo app (known guardrail — TC-007 uses `test.fail`).

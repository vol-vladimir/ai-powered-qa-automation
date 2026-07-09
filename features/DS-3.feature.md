# DS-3 — Program name validation and duplicate prevention

**Jira:** [DS-3](https://legionqaschool.atlassian.net/browse/DS-3) — Program name validation and duplicate prevention  
**Story:** As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.

---

Feature: Program name validation and duplicate prevention (DS-3)

# Happy paths

Scenario: Accept program name with special characters
  Given I am on the program creation form
  When I enter "Informatique & IA - Niveau 2" as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully

# Negative

Scenario: Reject program name with only whitespace
  Given I am on the program creation form
  When I enter "   " as the program name
  And I click Create
  Then the form is not submitted (name is trimmed, treated as empty)

Scenario: Reject duplicate program name
  Given a program "Web Development 2026" already exists
  When I try to create a new program with the same name
  Then I see an error indicating the name already exists

# Edge cases

Scenario: Leading and trailing spaces are trimmed on create
  Given I am on the program creation form
  When I enter "   Data Science 2026   " as the program name
  And I click Create
  Then the program is created with name "Data Science 2026"

Scenario: Case-only duplicate is rejected on create
  Given a program "Web Development 2026" already exists
  When I try to create "web development 2026"
  Then I see an error indicating the name already exists

---

## Ambiguities / gaps

- Ticket AC does not define max name length or allowed character set (extended in spec from DS-1 patterns).
- Duplicate prevention is required by AC but currently not enforced in the demo app (known guardrails — several TCs use `test.fail`).

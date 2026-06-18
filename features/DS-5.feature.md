# DS-5 — Program list filtering and display

**Jira:** [DS-5](https://legionqaschool.atlassian.net/browse/DS-5) — Program list filtering and display  
**Story:** As an admin user, I want to see all programs in a clear list so that I can quickly find and manage them.

---

Feature: Program list filtering and display (DS-5)

# Happy paths

Scenario: Display program list with key details
  Given I am logged in as admin at https://test.didaxis.studio
  And programs "Web Development 2026" and "Data Science 2026" exist in the system
  When I navigate to the Programs page at /programs
  Then I see a table listing each program's name and description
  And the row for "Web Development 2026" shows its full description
  And the row for "Data Science 2026" shows its full description

Scenario: Empty state when no programs exist
  Given I am logged in as admin
  And no programs exist in the organization
  When I navigate to the Programs page
  Then I see the message "No programs yet. Create your first program to get started."
  And I see a "Create Program" button prompting me to create the first program

Scenario: Empty-state create prompt opens the New Program flow
  Given I am logged in as admin
  And no programs exist in the organization
  When I click "Create Program" on the empty state
  Then the "New Program" modal is visible

Scenario: Programs list remains visible after page reload
  Given I am logged in as admin
  And a program "Web Development 2026" with description "Full-stack web development program" exists
  When I reload the Programs page
  Then I still see "Web Development 2026" with its description

Scenario: Empty-state message is not shown when programs exist
  Given I am logged in as admin
  And at least one program exists
  When I navigate to the Programs page
  Then the programs table shows data rows
  And the empty-state message is not visible

Scenario: Programs page header and New Program action are available when programs exist
  Given I am logged in as admin
  And at least one program exists
  When I navigate to the Programs page
  Then I see the "Programs" heading
  And the "+ New Program" button is visible
  And clicking "+ New Program" opens the "New Program" modal

Scenario: Multiple programs are all visible in the table
  Given I am logged in as admin
  And five distinct programs exist
  When I navigate to the Programs page
  Then each program name appears in its own table row

# Negative

Scenario: API failure does not show empty state when programs exist server-side
  Given I am logged in as admin
  And a program exists in the system
  When GET /programs returns 500 Internal Server Error
  And I navigate to or reload the Programs page
  Then the empty-state message must not appear as if no programs exist
  And an error indication or retained list is shown instead

Scenario: Unauthorized user cannot create programs from the list page
  Given a non-admin user is logged in
  When I navigate to the Programs page
  Then the "+ New Program" button is hidden or disabled

# Edge cases

Scenario: Program names with special characters render correctly in the list
  Given I am logged in as admin
  And a program "Informatique & IA - Niveau 2" with description "Programme bilingue — parcours Informatique et IA" exists
  When I navigate to the Programs page
  Then the row shows the exact name and description without HTML encoding issues

Scenario: Maximum-length program name (100 characters) displays without breaking layout
  Given I am logged in as admin
  And a program with a 100-character name exists
  When I navigate to the Programs page
  Then the full name and description are visible in the table row

Scenario: Unicode and emoji render correctly in list
  Given I am logged in as admin
  And a program "Développement Logiciel 🚀" exists
  When I navigate to the Programs page
  Then the name and description display correctly in the row

Scenario: Program with empty description is listed safely
  Given I am logged in as admin
  And a program "Cloud Fundamentals" was created with an empty Description
  When I navigate to the Programs page
  Then "Cloud Fundamentals" appears in the list
  And the description column is handled without breaking the row layout

Scenario: Program name and description columns are not blank when values were provided
  Given I am logged in as admin
  And a program with both name and description exists
  When I navigate to the Programs page
  Then the name cell is not empty
  And the description cell matches the saved description

Scenario: Programs page has no accessibility violations
  Given I am logged in as admin
  When I navigate to the Programs page
  Then an axe scan with wcag2a and wcag2aa tags reports zero violations

Scenario: Programs list page is keyboard operable
  Given I am logged in as admin
  When I navigate to the Programs page
  And I press Tab to reach "+ New Program"
  And I press Enter
  Then the "New Program" modal is visible

---

## Ambiguities / gaps

1. Jira AC only covers populated list and empty state — no reload, API error, or role-based behavior; those are inferred from product quality and prior DS-5 test runs.
2. Empty-state tests require an organization with zero programs; shared demo org may force `test.skip`.
3. Exact copy for API load failure is unspecified — only that empty state must not masquerade as zero programs (see DS-72).
4. Empty description row layout is ambiguous — DS-53 tracks missing description paragraph when Description is blank.
5. "Filtering" in the ticket title is not reflected in Jira AC; no search/filter criteria are defined.
6. Prior run (2026-05-24) reported failures for second program creation (DS-74), missing action icons (DS-73), duplicate names (DS-75), and refresh consistency (DS-76) — out of strict DS-5 AC but may affect list scenarios.

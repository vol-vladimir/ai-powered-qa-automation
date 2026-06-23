## Coverage snapshot
- Page: `/programs`
- Already covered: create (DS-1), edit (DS-2), validation (DS-3), delete (DS-4), list display (DS-5), sidebar nav, empty state, keyboard to New Program modal
- Explored via a11y tree: this session

## Selected gap (one flow)
**Flow:** Selecting a program row opens the semester management panel
**Why this one:** Exercises a distinct UI region (right-hand semester panel) that no existing spec asserts; row selection is a primary navigation path on the Programs page.

## Gherkin test plan

Feature: Programs — semester panel selection (discovered)

  # Positive path
  Scenario: Selecting a program reveals the semester panel
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Semester Panel Alpha" exists in the list
    When I click the program row "Semester Panel Alpha"
    Then I do not see "Select a program to manage semesters"
    And I see "Semesters & scheduling config"
    And I see the button "+ Semester"
    And I see a heading "Semester Panel Alpha"

  # Edge case
  Scenario: Switching selection updates the semester panel
    Given I am logged in as admin
    And programs "Semester Panel Alpha" and "Semester Panel Beta" exist in the list
    And I have selected program "Semester Panel Alpha"
    When I click the program row "Semester Panel Beta"
    Then the semester panel shows heading "Semester Panel Beta"
    And the semester panel does not show heading "Semester Panel Alpha"

## Locator hints (from a11y tree)
- Programs heading: `getByRole('heading', { name: 'Programs' })`
- Select hint: `getByText('Select a program to manage semesters')`
- Program row: `getByRole('row').filter({ has: paragraph with exact program name })`
- Semester config label: `getByText('Semesters & scheduling config')`
- New semester: `getByRole('button', { name: '+ Semester' })`
- Selected program panel heading: `getByRole('heading', { name: programName, exact: true })`
- Empty semesters: `getByText('No semesters yet')`

## For test-writer
- Suggested file: `tests/ds6-program-semester-panel.spec.ts`
- POM updates: `ProgramsPage` — `selectProgram`, semester panel locators, `semesterPanelHeading`

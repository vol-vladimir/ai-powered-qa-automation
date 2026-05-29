# DS-1 — Create new academic program

**Jira:** [DS-1](https://legionqaschool.atlassian.net/browse/DS-1) — Create new academic program  
**Story:** As an admin user, I want to create a new academic program so that I can begin designing its curriculum structure.

---

Feature: Create new academic program (DS-1)

# Happy paths

Scenario: Navigate to program creation form
  Given I am logged in as admin at https://test.didaxis.studio
  When I navigate to the Programs page at /programs
  And I click "+ New Program"
  Then the "New Program" modal is visible
  And I see the Program Name field
  And I see the Description field

Scenario: Successfully create a program
  Given I am logged in as admin
  And I am on the Programs page
  And I opened the "New Program" modal
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows a row for "Web Development 2026"

Scenario: Create program with name only and empty description
  Given I am logged in as admin
  And I opened the "New Program" modal
  When I fill in Program Name with "Data Science 2026"
  And I leave Description empty
  And I click Create
  Then the modal closes
  And the program list shows "Data Science 2026"

Scenario: Program list updates immediately after successful create without manual refresh
  Given I am logged in as admin
  And I am on the Programs page
  When I create a program named "Cloud Engineering 2026" with description "Cloud-native curriculum track"
  Then the new program appears in the list without reloading the page

Scenario: Created program displays correct description in list
  Given I am logged in as admin
  And I created program "Web Development 2026" with description "Full-stack web development program"
  Then the program row shows name "Web Development 2026"
  And the program row shows description "Full-stack web development program"

# Negative

Scenario: Validation prevents empty program name
  Given I am logged in as admin
  And I opened the "New Program" modal
  When I leave the Program Name field empty
  Then the Create button is disabled
  And no program is created

Scenario: Cancel closes modal without adding program to list
  Given I am logged in as admin
  And I opened the "New Program" modal
  When I fill in Program Name with "Cancelled Program"
  And I click Cancel
  Then the modal closes
  And the program list does not show "Cancelled Program"

Scenario: Close modal via X without creating program
  Given I am logged in as admin
  And I opened the "New Program" modal
  When I fill in Program Name with "Abandoned Program"
  And I close the modal using the X control
  Then the modal closes
  And the program list does not show "Abandoned Program"

Scenario: Whitespace-only Program Name does not create a program
  Given I am logged in as admin
  And I opened the "New Program" modal
  When I fill in Program Name with "   "
  And I fill in Description with "Whitespace-only name test"
  And I attempt to click Create
  Then the modal stays open or Create remains disabled
  And no program row appears for whitespace-only name

# Edge cases

Scenario: Description at maximum length 500 characters is accepted with valid name
  Given I am logged in as admin
  And I opened the "New Program" modal
  When I fill in Program Name with a unique valid name
  And I fill in Description with exactly 500 characters
  And I click Create
  Then the modal closes
  And the program appears in the list with the full description visible

Scenario: AI Generation Config section is visible and collapsible in New Program modal
  Given I am logged in as admin
  And I opened the "New Program" modal
  When I interact with the "AI Generation Config" section toggle
  Then the AI configuration fields can be shown or hidden without closing the modal

Scenario: Double-clicking Create does not create duplicate programs
  Given I am logged in as admin
  And I opened the "New Program" modal
  When I fill in Program Name with a unique name
  And I fill in Description with "Double-click guard test"
  And I double-click Create rapidly
  Then at most one program row exists for that name

---

<!--
Ambiguities / gaps (resolve with product owner):

1. AC uses exact name "Web Development 2026" — automated tests should use a Date.now() suffix
   to avoid collisions with seed data and parallel runs; confirm whether AC expects literal name only.

2. Description in AC ("Full-stack web development program") differs from seed constant in helpers
   ("Full-stack web development track for 2026 cohort") used by DS-2/DS-5 — tests follow AC text.

3. Ticket AC does not specify Cancel/X/outside-click behavior; covered from Confluence
   "Program Setup — UI Behavior" (modal close without save).

4. Whitespace-only name rejection is implied by Confluence validation but not in DS-1 AC;
   overlaps DS-3 — kept here as create-flow negative coverage.

5. Duplicate name, max-length name, and special-character validation are out of DS-1 scope (DS-3).

6. Empty-state "Create Program" entry point is DS-5 scope; DS-1 AC uses "+ New Program" only.

7. ADMIN vs EDITOR role matrix for "+ New Program" visibility is not in DS-1 AC (Confluence only).
-->

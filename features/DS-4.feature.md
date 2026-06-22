# DS-4 — Delete program with confirmation

**Jira:** [DS-4](https://legionqaschool.atlassian.net/browse/DS-4) — Delete program with confirmation  
**Story:** As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.

---

Feature: Delete program with confirmation (DS-4)

# Happy paths

Scenario: Native confirmation dialog is shown when delete is triggered
  Given I am logged in as admin at https://test.didaxis.studio
  And a program "Test Program" exists on the Programs page
  When I click the delete icon for "Test Program"
  Then I see a native browser confirmation dialog
  And the dialog message includes Delete program "Test Program"
  And the dialog warns that semesters and courses will be removed and the action cannot be undone
  And "Test Program" remains visible in the list until I confirm

Scenario: Program is removed from the list after deletion is confirmed
  Given I am logged in as admin
  And a program "Test Program" exists on the Programs page
  When I click the delete icon for "Test Program"
  And I confirm deletion with OK
  Then "Test Program" is removed from the program list immediately
  And no error banner indicates failure

Scenario: Program remains in the list when deletion is cancelled
  Given I am logged in as admin
  And a program "Web Development 2026" exists on the Programs page
  When I click the delete icon for "Web Development 2026"
  And I click Cancel on the confirmation dialog
  Then "Web Development 2026" is still visible in the list with unchanged name and description

Scenario: Program list reflects deletion immediately without manual refresh
  Given I am logged in as admin
  And programs "Test Program" and "Web Development 2026" exist on the Programs page
  When I delete "Test Program" and confirm with OK
  Then "Test Program" disappears from the table without reloading the page
  And "Web Development 2026" remains visible

Scenario: Only the targeted program row is deleted when multiple exist
  Given I am logged in as admin
  And programs "Web Development 2026" and "Data Science 2026" exist
  When I delete "Data Science 2026" and confirm with OK
  Then "Data Science 2026" is removed
  And "Web Development 2026" remains unchanged

Scenario: Deleted program does not reappear after browser refresh
  Given I am logged in as admin
  And a program "Test Program" exists
  When I delete "Test Program" and confirm with OK
  And I reload the Programs page
  Then "Test Program" is still absent

# Negative

Scenario: Program is not deleted until OK is clicked on confirmation
  Given I am logged in as admin
  And a program "Web Development 2026" exists
  When I click the delete icon and dismiss the confirmation dialog without OK
  Then "Web Development 2026" is never removed from the list

Scenario: Unauthorized user cannot delete a program
  Given a non-admin user is logged in
  And a program "Web Development 2026" exists
  When I open the Programs page
  Then the delete control is hidden or disabled
  Or the server returns 403 and the program remains in the list

Scenario: Program stays in the list when delete API fails after OK
  Given I am logged in as admin
  And a program "Test Program" exists
  When the DELETE endpoint returns 500 Internal Server Error
  And I delete "Test Program" and confirm with OK
  Then "Test Program" remains in the programs table
  And I see an error message

Scenario: Deleting a program that no longer exists is handled safely
  Given I am logged in as admin
  And a stale "Test Program" row is shown or DELETE returns 404
  When I delete "Test Program" and confirm with OK
  Then I receive a clear error or the list re-fetches without a ghost row

# Edge cases

Scenario: Program with special characters in name is deleted successfully
  Given I am logged in as admin
  And a program "Informatique & IA - Niveau 2" exists
  When I delete it and confirm with OK
  Then the confirmation dialog shows the full name correctly
  And the program row is removed from the list

Scenario: Program with maximum-length name (100 characters) is deleted
  Given I am logged in as admin
  And a program with a 100-character name exists
  When I delete it and confirm with OK
  Then the correct program is deleted without UI breakage

Scenario: Deleting the last program shows the empty state
  Given I am logged in as admin
  And exactly one program "Test Program" exists
  When I delete "Test Program" and confirm with OK
  Then the empty state shows "No programs yet. Create your first program to get started."

Scenario: Confirmation dialog warns about cascade deletion
  Given I am logged in as admin
  And a program "Web Development 2026" exists
  When I click the delete icon without confirming
  Then the dialog states all semesters and courses will be removed
  And the dialog states the action cannot be undone

Scenario: Multiple sequential deletions update the list after each confirm
  Given I am logged in as admin
  And programs "Test Program A", "Test Program B", and "Test Program C" exist
  When I delete each program one at a time and confirm each with OK
  Then only the targeted program disappears after each step

Scenario: Delete control is present on each program row
  Given I am logged in as admin
  And at least three programs exist in the table
  Then every row exposes a delete affordance
  And cancelling delete leaves all rows intact

Scenario: Rapid double-click on delete does not cause duplicate DELETE requests
  Given I am logged in as admin
  And a program "Web Development 2026" exists
  When I rapidly click delete twice and accept confirmation once
  Then at most one effective DELETE request is sent
  And the program is removed once without duplicate dialogs or broken UI

---

## Ambiguities / gaps

1. Jira AC does not specify native browser `confirm` vs in-app modal — Confluence specifies native `confirm` with OK/Cancel.
2. Exact dialog copy (cascade warning) is not in Jira AC but is in Confluence.
3. Delete permission by role (EDITOR vs ADMIN) is not stated in DS-4.
4. Success/error feedback on delete is unspecified beyond failure handling.
5. List refresh timing ("immediate without refresh") is Confluence-only, not in Jira AC.
6. TC-008 (rapid double-click) is a known product defect — tracked as DS-109 / DS-52; spec quarantined with `test.skip`.

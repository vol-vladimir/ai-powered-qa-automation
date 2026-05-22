# Test Plan: Delete Program With Confirmation (DS-4)

**Jira:** [DS-4 — Delete program with confirmation](https://legionqaschool.atlassian.net/browse/DS-4)  
**App:** Didaxis Studio — `https://test.didaxis.studio/programs`  
**Feature scope:** Delete program from the **Programs** list with a confirmation step (not Create/Edit — covered by DS-1/DS-2/DS-3)

## Scope

Validate that an **admin** can delete a program safely:

- A confirmation step appears before deletion
- Confirming removes the program from the list immediately
- Cancelling leaves the program unchanged

## UI context (Didaxis Studio)

| Element | Locator / label |
|---------|-----------------|
| Programs page | URL `/programs`, heading `Programs` |
| Program list | `getByRole('table')` with rows containing program name in first `paragraph` |
| Delete control | `🗑` button on the program row (per Confluence *Program Setup — UI Behavior*) |
| Edit control (reference) | `✏️` or `Edit` on the same row |
| Confirmation | **Native browser** `confirm` dialog (not an in-app modal) |
| Dialog copy (Confluence) | `Delete program "[name]"? All its semesters and courses will be removed. This cannot be undone.` |
| Confirm action | Browser **OK** |
| Cancel action | Browser **Cancel** |
| Empty state (no programs) | Text: `No programs yet. Create your first program to get started.` |

## Assumptions (from Confluence — Program Setup)

- **Program Name** max **100 characters**, unique per organization (DS-3).
- After a successful delete, the program list **re-fetches immediately** — no manual page refresh required.
- Deleting a program removes associated **semesters and courses** (cascade warning in dialog).
- Jira AC uses the example name `Test Program`; tests may create it via `+ New Program` or use seeded names such as `Web Development 2026` where noted.

## Sample program data (for setup steps)

| Field | Example value |
|-------|----------------|
| Program Name (AC) | `Test Program` |
| Program Name (seed) | `Web Development 2026` |
| Description | `Full-stack web development track for 2026 cohort` |
| Program Name (special chars) | `Informatique & IA - Niveau 2` |
| Program Name (100 chars) | `MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM` |

---

## Positive Flows

### TC-001
- **Title:** Native confirmation dialog is shown when delete is triggered for `Test Program` (AC: delete with confirmation — dialog)
- **Preconditions:**
  1. Admin is logged in (`DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD` from `.env`).
  2. User is on `/programs`.
  3. Program `Test Program` exists (create via `+ New Program` with Description `QA delete confirmation test` if missing).
- **Steps:**
  1. Locate the table row for `Test Program`.
  2. Click the row `🗑` delete button.
  3. Observe the browser confirmation dialog (do not click OK yet).
- **Expected result:**
  - A native `confirm` dialog appears.
  - Message includes `Delete program "Test Program"?` and warns that semesters and courses will be removed and the action cannot be undone.
  - `Test Program` remains visible in the programs table until OK is clicked.
- **Priority:** High

### TC-002
- **Title:** `Test Program` is removed from the list after deletion is confirmed (AC: delete with confirmation — remove)
- **Preconditions:**
  1. Admin is logged in.
  2. User is on `/programs`.
  3. Program `Test Program` exists.
  4. Browser dialog handler is registered to **accept** the next `confirm` dialog.
- **Steps:**
  1. Click `🗑` on the `Test Program` row.
  2. In the confirmation dialog, click **OK**.
  3. Wait for the list to update (no manual refresh).
- **Expected result:**
  - `Test Program` row disappears from the programs table immediately.
  - No error banner or toast indicates failure.
  - Row count decreases by 1.
- **Priority:** High

### TC-003
- **Title:** Program remains in the list when deletion is cancelled (AC: cancel program deletion)
- **Preconditions:**
  1. Admin is logged in.
  2. User is on `/programs`.
  3. Program `Web Development 2026` exists.
  4. Browser dialog handler is registered to **dismiss** the next `confirm` dialog.
- **Steps:**
  1. Click `🗑` on the `Web Development 2026` row.
  2. When the confirmation dialog appears, click **Cancel**.
  3. Observe the programs table.
- **Expected result:**
  - Dialog closes without deleting.
  - `Web Development 2026` is still visible in the list with unchanged name and description.
  - No success message implying deletion occurred.
- **Priority:** High

### TC-004
- **Title:** Program list reflects deletion immediately without manual refresh (Confluence: list refresh)
- **Preconditions:**
  1. Admin is logged in.
  2. At least two programs exist, e.g. `Test Program` and `Web Development 2026`.
- **Steps:**
  1. Note current row count on `/programs`.
  2. Delete `Test Program` and confirm with **OK**.
  3. Do **not** reload the browser tab.
- **Expected result:**
  - `Test Program` disappears from the table within the same view session.
  - Remaining programs (e.g. `Web Development 2026`) stay visible.
  - Total row count is reduced by 1 without F5 or navigation away.
- **Priority:** High

---

## Negative Flows

### TC-005
- **Title:** Program is not deleted until the user clicks OK on the confirmation dialog
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Web Development 2026` exists on `/programs`.
- **Steps:**
  1. Click `🗑` for `Web Development 2026`.
  2. When the dialog opens, click **Cancel** (or dismiss without OK).
  3. Optionally repeat: open dialog again and close without OK.
- **Expected result:**
  - `Web Development 2026` is never removed from the list.
  - No DELETE API call completes successfully (verify via network tab if automating).
- **Priority:** High

### TC-006
- **Title:** Unauthorized user cannot delete a program
- **Preconditions:**
  1. User is logged in with a non-admin role (e.g. read-only / instructor — per org setup).
  2. Program `Web Development 2026` exists.
- **Steps:**
  1. Open `/programs`.
  2. Inspect actions on the `Web Development 2026` row.
  3. If delete is hidden, attempt delete via direct API with that user's session (if test harness allows).
- **Expected result:**
  - `🗑` delete control is hidden or disabled for unauthorized users, **or**
  - Server returns `403 Forbidden` and the program remains in the list.
- **Priority:** High

### TC-007
- **Title:** Program stays in the list when the delete API fails after OK
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Test Program` exists.
  3. DELETE endpoint is forced to fail (e.g. `500 Internal Server Error` via mock/proxy).
- **Steps:**
  1. Click `🗑` for `Test Program`.
  2. Click **OK** on the confirmation dialog.
- **Expected result:**
  - User sees an error message (toast/banner per app pattern).
  - `Test Program` remains in the programs table.
  - No misleading “deleted” state.
- **Priority:** High

### TC-008
- **Title:** Rapid double-activation on delete does not cause duplicate DELETE requests or inconsistent UI
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Web Development 2026` exists.
  3. Dialog handler accepts the first `confirm` only.
- **Steps:**
  1. Rapidly click `🗑` twice on the same row before the dialog is handled.
  2. Accept confirmation once.
  3. Inspect network tab for DELETE calls and final list state.
- **Expected result:**
  - At most one effective DELETE request is sent.
  - Program is removed once; UI does not show duplicate dialogs, errors, or a broken table.
- **Priority:** Medium

### TC-009
- **Title:** Deleting a program that does not exist (stale UI) is handled safely
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Test Program` was deleted in another session/tab, but a stale row still appears (or simulate `404` on DELETE).
- **Steps:**
  1. Trigger delete on the stale `Test Program` row and click **OK**.
- **Expected result:**
  - User receives a clear error (e.g. not found).
  - Programs list re-fetches and no ghost row remains after refresh behavior runs.
- **Priority:** Medium

---

## Edge Cases

### TC-010
- **Title:** Program with special characters in the name is deleted successfully
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Informatique & IA - Niveau 2` exists (create with Description `Programme bilingue — parcours Informatique et IA` if needed).
- **Steps:**
  1. Click `🗑` on `Informatique & IA - Niveau 2`.
  2. Verify confirmation message shows the name correctly (quotes/ampersand not corrupted).
  3. Click **OK**.
- **Expected result:**
  - Dialog displays the full name safely.
  - Program row is removed from the list.
- **Priority:** Medium

### TC-011
- **Title:** Program with maximum-length name (100 characters) is deleted without UI breakage
- **Preconditions:**
  1. Admin is logged in.
  2. Program exists with exactly 100-character name:
     `MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM`
- **Steps:**
  1. Locate the 100-character program row.
  2. Click `🗑` and confirm with **OK**.
- **Expected result:**
  - Confirmation dialog shows the full name (or a readable truncation policy documented in UI).
  - Correct program is deleted; table layout does not break.
- **Priority:** Medium

### TC-012
- **Title:** Deleting the last program shows the empty state
- **Preconditions:**
  1. Admin is logged in.
  2. Exactly one program exists: `Test Program`.
- **Steps:**
  1. Delete `Test Program` and confirm with **OK**.
- **Expected result:**
  - Programs table has no data rows.
  - Empty state shows `No programs yet. Create your first program to get started.` (and `Create Program` affordance if implemented).
- **Priority:** Medium

### TC-013
- **Title:** Deleted program does not reappear after browser refresh
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Test Program` exists.
- **Steps:**
  1. Delete `Test Program` and confirm with **OK**.
  2. Reload `/programs` (F5 or `page.reload()`).
- **Expected result:**
  - `Test Program` is still absent.
  - Backend state matches UI (no resurrection of deleted program).
- **Priority:** Medium

### TC-014
- **Title:** Only the targeted program row is deleted when multiple programs are listed
- **Preconditions:**
  1. Admin is logged in.
  2. Programs `Web Development 2026` and `Data Science 2026` both exist.
- **Steps:**
  1. Click `🗑` on the `Data Science 2026` row only.
  2. Confirm with **OK**.
- **Expected result:**
  - `Data Science 2026` is removed.
  - `Web Development 2026` remains unchanged.
- **Priority:** High

### TC-015
- **Title:** Confirmation dialog warns about cascade deletion of semesters and courses
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Web Development 2026` exists and has at least one semester or course linked (if test data allows).
- **Steps:**
  1. Click `🗑` for `Web Development 2026`.
  2. Read the confirmation message without clicking OK.
- **Expected result:**
  - Message states that **all semesters and courses** will be removed and the action **cannot be undone**.
- **Priority:** Medium

### TC-016
- **Title:** Multiple sequential deletions update the list after each confirm
- **Preconditions:**
  1. Admin is logged in.
  2. Programs `Test Program A`, `Test Program B`, and `Test Program C` exist (create via UI with distinct names).
- **Steps:**
  1. Delete `Test Program A` → **OK**.
  2. Delete `Test Program B` → **OK**.
  3. Delete `Test Program C` → **OK**.
- **Expected result:**
  - After each step, only the targeted program disappears; others remain until their turn.
  - After step 3, empty state or remaining programs reflect final state without refresh.
- **Priority:** Medium

### TC-017
- **Title:** Delete control is present and functional on each program row
- **Preconditions:**
  1. Admin is logged in.
  2. At least three programs exist in the table.
- **Steps:**
  1. For each visible program row, verify a `🗑` button is present.
  2. Click `🗑` on one row and **Cancel**.
- **Expected result:**
  - Every row exposes delete affordance consistently.
  - Cancel leaves all rows intact.
- **Priority:** Low

### TC-018
- **Title:** Delete is not blocked when the Edit Program modal is open for a different program (interaction boundary)
- **Preconditions:**
  1. Admin is logged in.
  2. Programs `Web Development 2026` and `Data Science 2026` exist.
- **Steps:**
  1. Open **Edit Program** for `Web Development 2026` (✏️) but do not save.
  2. Without closing edit modal, attempt to delete `Data Science 2026` (if UI allows) or close edit first per UX rules.
- **Expected result:**
  - Behavior is deterministic: either delete is prevented until edit closes, or delete works without corrupting the open modal — document actual product rule; no data loss for unrelated program.
- **Priority:** Low

---

## AC Coverage Matrix

| DS-4 Acceptance Criteria | Test case(s) |
|--------------------------|--------------|
| Delete program with confirmation — dialog appears | TC-001 (+ TC-015) |
| Delete program with confirmation — program removed after confirm | TC-002 (+ TC-004, TC-013, TC-014) |
| Cancel program deletion — program still exists | TC-003 (+ TC-005) |

---

## Ambiguities / Gaps in Acceptance Criteria

1. **Dialog type unspecified in Jira AC** — Jira says “confirmation dialog” only; Confluence specifies a **native browser** `confirm` with **OK** / **Cancel** (not an in-app modal with `Confirm`/`Cancel` buttons). Tests should follow Confluence unless product changes.
2. **Exact dialog copy not in Jira AC** — Confluence requires the cascade warning about semesters/courses and “cannot be undone”; Jira AC does not mention this text (TC-015).
3. **EDITOR vs ADMIN for delete** — Confluence grants `+ New Program` to ADMIN and EDITOR; delete permission by role is not stated in DS-4 (TC-006 assumes non-admin blocked).
4. **Success/error feedback unspecified** — No required toast, banner, or silent delete on success; TC-007 assumes visible error on failure only.
5. **Dependencies / cascade scope** — AC does not define behavior if delete is blocked by foreign keys vs cascade; Confluence implies full removal of semesters/courses.
6. **API failure, 404, and idempotency** — Not in Jira AC (TC-007, TC-008, TC-009).
7. **List refresh timing** — AC does not state “immediate without refresh”; Confluence makes this explicit (TC-004).
8. **Max name length and special characters** — Not in DS-4 AC; covered via Confluence/DS-3 alignment (TC-010, TC-011).
9. **Duplicate display names** — Organization uniqueness should prevent duplicates; if [SS-25](https://legionqaschool.atlassian.net/browse/SS-25) allows duplicates, row-targeting behavior needs a product decision.
10. **Empty state copy** — Not in Jira AC; Confluence provides exact empty-state message (TC-012).
11. **Known automation notes** — Native `confirm` dialogs require Playwright `page.on('dialog')` handlers; custom modal assumptions in early drafts were incorrect.

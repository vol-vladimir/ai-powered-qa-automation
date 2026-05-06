# Delete Program With Confirmation — Test Plan

## Positive Flows

### TC-001
- **ID:** TC-001
- **Title:** Confirmation dialog is displayed when deleting an existing program
- **Preconditions:**
  - User is logged in with `Admin` role.
  - Program list page is loaded.
  - Program `Test Program` exists and is visible in the list.
- **Steps:**
  1. Locate row with `Program Name = Test Program`.
  2. Click the row's `Delete` icon.
- **Expected result:**
  - A confirmation dialog appears.
  - Dialog contains a clear delete warning and action buttons `Confirm` and `Cancel`.
  - `Test Program` is still visible until confirmation.
- **Priority:** High

### TC-002
- **ID:** TC-002
- **Title:** Program is removed from list after deletion is confirmed
- **Preconditions:**
  - User is logged in with `Admin` role.
  - Program `Test Program` exists.
  - Delete confirmation dialog for `Test Program` is open.
- **Steps:**
  1. Click `Confirm` in the delete dialog.
  2. Wait for deletion request to complete.
  3. Refresh the program list view if auto-refresh is not immediate.
- **Expected result:**
  - Deletion succeeds without UI error.
  - `Test Program` no longer appears in the program list.
  - Total list count decreases by 1.
- **Priority:** High

### TC-003
- **ID:** TC-003
- **Title:** Program remains unchanged when deletion is cancelled
- **Preconditions:**
  - User is logged in with `Admin` role.
  - Program `Test Program` exists.
  - Delete confirmation dialog for `Test Program` is open.
- **Steps:**
  1. Click `Cancel`.
  2. Observe list state.
- **Expected result:**
  - Dialog closes.
  - `Test Program` remains visible in the list.
  - No deletion API call is triggered.
- **Priority:** High

## Negative Flows

### TC-004
- **ID:** TC-004
- **Title:** Deletion is not executed before explicit confirmation
- **Preconditions:**
  - User is logged in with `Admin` role.
  - Program `Test Program` exists.
- **Steps:**
  1. Click `Delete` icon for `Test Program`.
  2. Do not click `Confirm` (close dialog via `X` if available, or click outside modal if allowed).
- **Expected result:**
  - `Test Program` is not deleted.
  - No success toast/message for deletion is shown.
- **Priority:** High

### TC-005
- **ID:** TC-005
- **Title:** Unauthorized user cannot delete program
- **Preconditions:**
  - User is logged in with non-admin role (for example `Instructor`).
  - Program `Test Program` exists.
- **Steps:**
  1. Open program list page.
  2. Check actions for `Test Program` row.
  3. Attempt delete via UI/API interception if UI action is hidden.
- **Expected result:**
  - Delete action is unavailable or blocked.
  - Server rejects delete attempt with authorization error (for example `403 Forbidden`).
  - Program remains in list.
- **Priority:** High

### TC-006
- **ID:** TC-006
- **Title:** UI preserves data when delete request fails
- **Preconditions:**
  - User is logged in with `Admin` role.
  - Program `Test Program` exists.
  - Backend delete endpoint is forced to return error (for example `500 Internal Server Error`).
- **Steps:**
  1. Click `Delete` for `Test Program`.
  2. Click `Confirm`.
- **Expected result:**
  - Error feedback is shown to user.
  - `Test Program` remains in the list.
  - No misleading success message appears.
- **Priority:** High

### TC-007
- **ID:** TC-007
- **Title:** Multiple confirm clicks do not cause duplicate or unstable deletion behavior
- **Preconditions:**
  - User is logged in with `Admin` role.
  - Program `Test Program` exists.
  - Confirmation dialog is open.
- **Steps:**
  1. Rapidly click `Confirm` multiple times.
  2. Observe UI state and network behavior.
- **Expected result:**
  - System processes delete idempotently.
  - Only one effective deletion occurs.
  - UI does not crash and no inconsistent state is shown.
- **Priority:** Medium

## Edge Cases

### TC-008
- **ID:** TC-008
- **Title:** Correct program is deleted when duplicate names exist
- **Preconditions:**
  - User is logged in with `Admin` role.
  - Two programs exist with same display name `Test Program` but different internal IDs.
- **Steps:**
  1. Identify first `Test Program` row using secondary identifier (for example creation date or ID column if available).
  2. Click `Delete` on that specific row.
  3. Confirm deletion.
- **Expected result:**
  - Only targeted row is deleted.
  - Other `Test Program` row remains.
- **Priority:** High

### TC-009
- **ID:** TC-009
- **Title:** Program with special characters in name is deleted successfully
- **Preconditions:**
  - User is logged in with `Admin` role.
  - Program exists with `Program Name = Informatique & IA - Niveau 2`.
- **Steps:**
  1. Click `Delete` for `Informatique & IA - Niveau 2`.
  2. Confirm deletion.
- **Expected result:**
  - Confirmation dialog renders the name safely.
  - Program is deleted and removed from list.
- **Priority:** Medium

### TC-010
- **ID:** TC-010
- **Title:** Program with maximum-length name is deletable without UI truncation errors
- **Preconditions:**
  - User is logged in with `Admin` role.
  - Program exists with max allowed length name (for example 255 characters if system limit is 255).
- **Steps:**
  1. Locate the max-length program in list.
  2. Trigger delete and confirm.
- **Expected result:**
  - Dialog and list handle long text without layout break.
  - Correct program is deleted.
- **Priority:** Medium

### TC-011
- **ID:** TC-011
- **Title:** Deleting the last remaining program updates empty-state correctly
- **Preconditions:**
  - User is logged in with `Admin` role.
  - Exactly one program exists: `Test Program`.
- **Steps:**
  1. Delete `Test Program` and confirm.
- **Expected result:**
  - Program list shows empty state (for example `No programs found`).
  - No stale row remains.
- **Priority:** Medium

### TC-012
- **ID:** TC-012
- **Title:** Deletion result remains consistent across refresh/navigation boundary
- **Preconditions:**
  - User is logged in with `Admin` role.
  - Program `Test Program` exists.
- **Steps:**
  1. Delete `Test Program` and confirm.
  2. Refresh browser or navigate away and back to Programs page.
- **Expected result:**
  - `Test Program` does not reappear.
  - Persisted backend state matches UI state.
- **Priority:** Medium

## Coverage Mapping To AC
- AC: *Delete program with confirmation* -> TC-001, TC-002
- AC: *Cancel program deletion* -> TC-003

## Ambiguities / Gaps In ACs
- Confirmation dialog content is unspecified (exact text, program name visibility, destructive warning).
- Dialog behavior is unspecified for `X` close, `Esc` key, and click-outside.
- Expected success/error feedback mechanism is unspecified (toast, banner, inline message).
- Authorization rules are implicit; ACs mention admin user but do not define non-admin behavior.
- Duplicate program-name behavior for deletion context is unspecified (how to uniquely target row).
- Max program name length and permitted character set are not stated.
- Deletion dependency handling is unspecified (for example if program is linked to active courses/users).
- No AC for backend/API failure, retry, or idempotency behavior.

## Test Plan: Edit Existing Program Details

### Scope
Validate that an admin can open, edit, and save updates to an existing program from the Programs page, with correct field behavior, validation, and list refresh.

### Assumptions
- Program fields in scope: `Name`, `Description`, and other persisted fields shown in edit form (e.g., `Duration`, `Status`).
- Edit action opens a modal dialog.
- `Save` persists changes immediately.
- Program list updates without manual page refresh.

---

## Positive Flows

### TC-001
- **Title:** Edit form opens with existing program data pre-populated  
- **Preconditions:**  
  - Admin user is logged in  
  - On `Programs` page  
  - Program exists: `Web Development 2026` with:
    - Name: `Web Development 2026`
    - Description: `Full-stack web development track for 2026 cohort`
- **Steps:**  
  1. Locate `Web Development 2026` in the program list.  
  2. Click the edit icon for that row.  
- **Expected Result:**  
  - Edit modal opens.  
  - `Name` field shows `Web Development 2026`.  
  - `Description` field shows `Full-stack web development track for 2026 cohort`.  
  - All other editable fields display current saved values.  
- **Priority:** High

### TC-002
- **Title:** Program name update is saved and shown immediately in list  
- **Preconditions:**  
  - Admin is editing `Web Development 2026` in the edit modal  
- **Steps:**  
  1. In `Name`, replace `Web Development 2026` with `Web Development 2026 - Updated`.  
  2. Click `Save`.  
- **Expected Result:**  
  - Modal closes.  
  - `Programs` list displays `Web Development 2026 - Updated` immediately.  
  - No stale old name remains in visible row.  
- **Priority:** High

### TC-003
- **Title:** Updating only Description preserves all unchanged fields  
- **Preconditions:**  
  - Program exists with known values:
    - Name: `Web Development 2026`
    - Description: `Full-stack web development track for 2026 cohort`
    - Status: `Active`
- **Steps:**  
  1. Open edit modal for `Web Development 2026`.  
  2. Update `Description` to `Updated curriculum with AI-assisted QA module`.  
  3. Do not change any other fields.  
  4. Click `Save`.  
- **Expected Result:**  
  - Modal closes successfully.  
  - List still shows Name as `Web Development 2026`.  
  - Reopening edit modal shows:
    - Description updated  
    - `Status` and all other untouched fields unchanged from original values  
- **Priority:** High

### TC-004
- **Title:** Multiple editable fields can be updated in one save operation  
- **Preconditions:**  
  - Program `Web Development 2026` exists  
- **Steps:**  
  1. Open edit modal for `Web Development 2026`.  
  2. Update:
     - `Name` to `Web Development 2026 - Evening Batch`
     - `Description` to `Evening cohort focused on working professionals`  
  3. Click `Save`.  
- **Expected Result:**  
  - Modal closes.  
  - Program list reflects updated name.  
  - Reopening edit modal shows both updated values persisted.  
- **Priority:** Medium

---

## Negative Flows

### TC-005
- **Title:** Save is blocked when Name is empty  
- **Preconditions:**  
  - Editing existing program `Web Development 2026`  
- **Steps:**  
  1. Clear the `Name` field completely.  
  2. Click `Save`.  
- **Expected Result:**  
  - Modal remains open.  
  - Validation message appears for `Name` (e.g., `Name is required`).  
  - No changes are persisted to list or backend.  
- **Priority:** High

### TC-006
- **Title:** Save is blocked when Name contains only whitespace  
- **Preconditions:**  
  - Editing existing program `Web Development 2026`  
- **Steps:**  
  1. Set `Name` to `   ` (three spaces).  
  2. Click `Save`.  
- **Expected Result:**  
  - Validation error is displayed for invalid/required `Name`.  
  - Modal does not close.  
  - Original name remains unchanged in list.  
- **Priority:** High

### TC-007
- **Title:** Duplicate program name is rejected when uniqueness is required  
- **Preconditions:**  
  - Existing programs:
    - `Web Development 2026`
    - `Data Science 2026`  
  - Editing `Web Development 2026`  
- **Steps:**  
  1. Change `Name` to `Data Science 2026`.  
  2. Click `Save`.  
- **Expected Result:**  
  - Save fails with duplicate-name validation/error message.  
  - Modal stays open for correction.  
  - No unintended overwrite or merge of records occurs.  
- **Priority:** High

### TC-008
- **Title:** Invalid characters in Name are rejected according to validation rules  
- **Preconditions:**  
  - Editing existing program  
- **Steps:**  
  1. Enter `Web Development 2026 <script>alert(1)</script>` in `Name`.  
  2. Click `Save`.  
- **Expected Result:**  
  - System rejects disallowed input or safely sanitizes based on defined rules.  
  - No script execution occurs in modal, list, or notifications.  
  - Data is not persisted in unsafe form.  
- **Priority:** High

### TC-009
- **Title:** Failed save does not partially update any fields  
- **Preconditions:**  
  - Editing program with valid existing values  
- **Steps:**  
  1. Change `Description` to valid text.  
  2. Set `Name` to empty value.  
  3. Click `Save`.  
- **Expected Result:**  
  - Save is rejected due to `Name` validation.  
  - Neither `Description` nor any field is persisted (atomic behavior).  
- **Priority:** Medium

---

## Edge Cases

### TC-010
- **Title:** Name at minimum valid length is accepted  
- **Preconditions:**  
  - Editing existing program  
  - Minimum allowed length is defined (e.g., 1 or 2 chars)  
- **Steps:**  
  1. Set `Name` to minimum-length valid value (example: `AI` if min=2).  
  2. Click `Save`.  
- **Expected Result:**  
  - Save succeeds when value meets exact minimum rule.  
  - List shows updated minimum-length name correctly.  
- **Priority:** Medium

### TC-011
- **Title:** Name exceeding maximum length is rejected  
- **Preconditions:**  
  - Editing existing program  
  - Maximum length exists for `Name` (e.g., 100 chars)  
- **Steps:**  
  1. Enter a `Name` longer than max (e.g., 101+ characters).  
  2. Click `Save`.  
- **Expected Result:**  
  - Save is blocked with max-length validation message.  
  - Modal remains open.  
  - No truncation without user awareness unless explicitly specified.  
- **Priority:** High

### TC-012
- **Title:** Name at exact maximum length is accepted  
- **Preconditions:**  
  - Editing existing program  
  - Known max length for `Name`  
- **Steps:**  
  1. Enter a `Name` with exactly max allowed characters.  
  2. Click `Save`.  
- **Expected Result:**  
  - Save succeeds.  
  - Stored/displayed value exactly matches entered text.  
- **Priority:** Medium

### TC-013
- **Title:** Special characters in Description are preserved safely  
- **Preconditions:**  
  - Editing existing program  
- **Steps:**  
  1. Set `Description` to:  
     `Updated: APIs, QA, CI/CD, UTF-8 chars like é, ñ, &, /, ()`  
  2. Click `Save`.  
- **Expected Result:**  
  - Save succeeds (if characters are allowed).  
  - Reopened form shows same content preserved and correctly rendered.  
  - No encoding corruption (mojibake) or escaped artifacts unless expected.  
- **Priority:** Medium

### TC-014
- **Title:** Leading/trailing spaces in Name are handled consistently  
- **Preconditions:**  
  - Editing existing program  
- **Steps:**  
  1. Enter `  Web Development 2026 - Updated  ` in `Name`.  
  2. Click `Save`.  
- **Expected Result:**  
  - System trims or preserves spaces according to spec, consistently in storage and display.  
  - No duplicate issues caused solely by whitespace differences.  
- **Priority:** Medium

### TC-015
- **Title:** Edit behavior remains correct with very long Description content  
- **Preconditions:**  
  - Editing existing program  
  - Description max limit defined (or large text supported)  
- **Steps:**  
  1. Paste Description near max boundary (e.g., 999/1000 chars if max=1000).  
  2. Click `Save`.  
- **Expected Result:**  
  - Save succeeds at boundary-allowed length.  
  - Text remains intact after reopen.  
- **Priority:** Low

### TC-016
- **Title:** Concurrent update conflict is handled predictably  
- **Preconditions:**  
  - Admin A and Admin B both open edit modal for `Web Development 2026`  
- **Steps:**  
  1. Admin A changes `Name` to `Web Development 2026 - A` and saves.  
  2. Admin B (with stale modal data) changes `Description` and saves.  
- **Expected Result:**  
  - System handles conflict via last-write-wins, version error, or merge policy (as designed).  
  - No silent data corruption; user receives clear outcome.  
- **Priority:** Medium

---

## Coverage Mapping to Acceptance Criteria

- **AC: Open program for editing** → `TC-001`  
- **AC: Successfully edit a program name** → `TC-002`  
- **AC: Edit preserves unchanged fields** → `TC-003`  

---

## Ambiguities / Gaps in Current ACs

- Validation rules are unspecified for `Name` and `Description` (required, min/max length, allowed characters).
- Uniqueness behavior for `Name` is not defined (case sensitivity, whitespace normalization).
- Whitespace handling is not defined (trim on save vs preserve).
- Error handling UX is unspecified (inline errors, toast, modal behavior on failure).
- No explicit non-functional expectations (save latency, immediate UI update timeout).
- Concurrency/conflict behavior is not defined for simultaneous edits by multiple admins.
- Scope of “other fields” is not listed; exact fields requiring preservation are unclear.
- Security expectations are not explicit (XSS sanitization/encoding for rendered values).

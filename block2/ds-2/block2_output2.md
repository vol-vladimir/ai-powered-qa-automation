# Test Plan: Edit Existing Program Details (DS-2)

**Jira:** [DS-2 — Edit existing program details](https://legionqaschool.atlassian.net/browse/DS-2)  
**App:** Didaxis Studio — `https://test.didaxis.studio/programs`  
**Feature scope:** **Edit Program** modal only (not New Program creation — covered by DS-3)

## Scope

Validate that an admin can open, edit, and save updates to an existing program from the Programs page, with correct field behavior, validation, and list refresh.

## UI context (Didaxis Studio)

| Element | Locator / label |
|---------|-----------------|
| Programs page | URL `/programs`, heading `Programs` |
| Open edit form | Row button `✏️` or `Edit` on program row |
| Modal title | `Edit Program` |
| Program Name field | `getByRole('textbox', { name: 'Program Name' })` |
| Description field | `getByRole('textbox', { name: 'Description' })` |
| Other persisted fields | Total hours (`placeholder` `e.g. 900`), Default Session Hours, Default Exam Hours, Target Audience, Focus Areas (under AI Generation Config if collapsed) |
| Submit | Button `Save` |
| Program list | Table row; name in first `paragraph`, description in second |

## Assumptions (from Confluence — Program Setup)

- **Program Name** is required, max **100 characters**, unique per organization.
- **Description** is optional, max **500 characters**.
- **Save** is **disabled** when Program Name is empty or whitespace-only (after trim).
- On successful save, Program Name is **trimmed** for display in the list.
- Edit opens a modal; list updates without manual page refresh after save.
- Duplicate enforcement may be client-side and/or server-side (verify error feedback where shown).

## Sample program (from Jira AC)

| Field | Value |
|-------|--------|
| Program Name | `Web Development 2026` |
| Description | `Full-stack web development track for 2026 cohort` |

---

## Positive Flows

### TC-001
- **Title:** Edit form opens with existing program data pre-populated (AC: open for editing)
- **Preconditions:**
  1. Admin is logged in.
  2. User is on `/programs`.
  3. Program exists: `Web Development 2026` with Description `Full-stack web development track for 2026 cohort`.
- **Steps:**
  1. Locate `Web Development 2026` in the program list.
  2. Click the edit icon (✏️) for that row.
- **Expected result:**
  - `Edit Program` modal opens.
  - **Program Name** shows `Web Development 2026`.
  - **Description** shows `Full-stack web development track for 2026 cohort`.
  - All other editable fields (session hours, exam hours, etc.) show current saved values.
- **Priority:** High

### TC-002
- **Title:** Program name update is saved and shown immediately in list (AC: edit program name)
- **Preconditions:**
  1. Admin is editing `Web Development 2026` in the edit modal.
- **Steps:**
  1. In **Program Name**, replace `Web Development 2026` with `Web Development 2026 - Updated`.
  2. Click `Save`.
- **Expected result:**
  - Modal closes.
  - Programs table displays `Web Development 2026 - Updated` immediately.
  - Previous name row is not visible.
- **Priority:** High

### TC-003
- **Title:** Updating only Description preserves all unchanged fields (AC: preserve unchanged fields)
- **Preconditions:**
  1. Program exists with known values:
     - Name: `Web Development 2026`
     - Description: `Full-stack web development track for 2026 cohort`
     - Default Session Hours: `4`, Default Exam Hours: `3` (or other known defaults)
- **Steps:**
  1. Open edit modal for `Web Development 2026`.
  2. Update **Description** to `Updated curriculum with AI-assisted QA module`.
  3. Do not change any other fields.
  4. Click `Save`.
- **Expected result:**
  - Modal closes successfully.
  - List still shows Name as `Web Development 2026` and updated description text.
  - Reopening edit modal shows updated Description; **Program Name**, session/exam hours, and all other untouched fields match pre-edit values.
- **Priority:** High

### TC-004
- **Title:** Multiple editable fields can be updated in one save operation (derived)
- **Preconditions:**
  1. Program `Web Development 2026` exists.
- **Steps:**
  1. Open edit modal for `Web Development 2026`.
  2. Update **Program Name** to `Web Development 2026 - Evening Batch` and **Description** to `Evening cohort focused on working professionals`.
  3. Click `Save`.
- **Expected result:**
  - Modal closes.
  - Program list reflects updated name and description.
  - Reopening edit modal shows both values persisted.
- **Priority:** Medium

---

## Negative Flows

### TC-005
- **Title:** Save is blocked when Name is empty (derived — Confluence required name)
- **Preconditions:**
  1. Editing existing program `Web Development 2026`.
- **Steps:**
  1. Clear **Program Name** completely.
  2. Attempt to click `Save` (button should be disabled).
- **Expected result:**
  - `Edit Program` modal remains open.
  - **Save** is disabled (no submit).
  - Original program row unchanged in list.
- **Priority:** High

### TC-006
- **Title:** Save is blocked when Name contains only whitespace (derived)
- **Preconditions:**
  1. Editing existing program `Web Development 2026`.
- **Steps:**
  1. Set **Program Name** to `   ` (three spaces).
  2. Attempt `Save`.
- **Expected result:**
  - **Save** remains disabled or save does not complete.
  - Modal stays open.
  - Original name unchanged in list.
- **Priority:** High

### TC-007
- **Title:** Duplicate program name is rejected when uniqueness is required (derived)
- **Preconditions:**
  1. Programs exist: `Web Development 2026` and `Data Science 2026`.
  2. Editing `Web Development 2026`.
- **Steps:**
  1. Change **Program Name** to `Data Science 2026`.
  2. Click `Save` (if enabled).
- **Expected result:**
  - Save does not succeed; duplicate error visible (e.g. duplicate / already exists / unique).
  - Modal stays open for correction.
  - Both programs remain as separate rows; no overwrite.
- **Priority:** High

### TC-008
- **Title:** Invalid characters in Name are rejected according to validation rules (derived — security)
- **Preconditions:**
  1. Editing existing program.
- **Steps:**
  1. Enter `Web Development 2026 <script>alert(1)</script>` in **Program Name**.
  2. Click `Save` if enabled.
- **Expected result:**
  - Unsafe name is not persisted in the list.
  - Original program row remains.
  - No script alert dialog; modal may stay open or close without persisting unsafe name.
- **Priority:** High

### TC-009
- **Title:** Failed save does not partially update any fields (derived — atomic save)
- **Preconditions:**
  1. Editing program with valid existing values.
- **Steps:**
  1. Change **Description** to valid text.
  2. Clear **Program Name**.
  3. Attempt save.
- **Expected result:**
  - Save blocked (disabled **Save**).
  - Description in list unchanged from original.
- **Priority:** Medium

---

## Edge Cases

### TC-010
- **Title:** Name at minimum valid length is accepted (derived — boundary)
- **Preconditions:**
  1. Editing existing program.
  2. Minimum length allows short names (e.g. `AI` with 2+ chars).
- **Steps:**
  1. Set **Program Name** to `AI` (unique in test run).
  2. Click `Save`.
- **Expected result:**
  - Save succeeds; list shows updated name.
- **Priority:** Medium

### TC-011
- **Title:** Name exceeding maximum length is rejected (derived — max 100 chars)
- **Preconditions:**
  1. Editing existing program.
- **Steps:**
  1. Enter **Program Name** with 101+ characters.
  2. Click `Save` if enabled.
- **Expected result:**
  - Name is not persisted at full length.
  - Modal remains open; original program row unchanged.
- **Priority:** High

### TC-012
- **Title:** Name at exact maximum length is accepted (derived — boundary 100)
- **Preconditions:**
  1. Editing existing program.
- **Steps:**
  1. Enter **Program Name** with exactly 100 characters.
  2. Click `Save`.
- **Expected result:**
  - Save succeeds; list and reopened form show exact 100-character name.
- **Priority:** Medium

### TC-013
- **Title:** Special characters in Description are preserved safely (derived)
- **Preconditions:**
  1. Editing existing program.
- **Steps:**
  1. Set **Description** to `Updated: APIs, QA, CI/CD, UTF-8 chars like é, ñ, &, /, ()`.
  2. Click `Save`.
- **Expected result:**
  - Save succeeds; list and reopened form show same text; no mojibake or script dialogs.
- **Priority:** Medium

### TC-014
- **Title:** Leading/trailing spaces in Name are handled consistently (derived — trim on save)
- **Preconditions:**
  1. Editing existing program.
- **Steps:**
  1. Enter `  Web Development 2026 - Updated  ` in **Program Name**.
  2. Click `Save`.
- **Expected result:**
  - List displays trimmed name `Web Development 2026 - Updated` (no leading/trailing spaces).
- **Priority:** Medium

### TC-015
- **Title:** Edit behavior remains correct with very long Description content (derived — max 500 chars)
- **Preconditions:**
  1. Editing existing program.
- **Steps:**
  1. Set **Description** to exactly 500 characters (boundary).
  2. Click `Save`.
- **Expected result:**
  - Save succeeds; reopened form shows full text intact.
- **Priority:** Low

### TC-016
- **Title:** Concurrent update conflict is handled predictably (derived — risk-based)
- **Preconditions:**
  1. Two admin sessions; both can open edit for same program.
- **Steps:**
  1. Admin A changes **Program Name** to `Web Development 2026 - A` and saves.
  2. Admin B (stale modal) changes **Description** and saves.
- **Expected result:**
  - Observable outcome: last-write-wins, conflict message, or stale edit cancelled — no silent corruption.
- **Priority:** Medium

---

## Coverage mapping

### Jira acceptance criteria

| AC | Test cases |
|----|------------|
| Open program for editing | TC-001 |
| Successfully edit a program name | TC-002 |
| Edit preserves unchanged fields | TC-003 |

### Derived / risk-based (beyond Jira AC)

| Theme | Test cases |
|-------|------------|
| Multi-field edit | TC-004 |
| Empty / whitespace name | TC-005, TC-006 |
| Duplicate name | TC-007 |
| Unsafe / XSS name | TC-008 |
| Atomic failed save | TC-009 |
| Name length boundaries | TC-010, TC-011, TC-012 |
| Description encoding / length | TC-013, TC-015 |
| Name trim | TC-014 |
| Concurrent edit | TC-016 |

---

## Ambiguities / gaps in current ACs

- Jira does not specify min length for **Program Name** (exploratory tests use short names such as `AI`).
- Uniqueness rules are unspecified (case sensitivity, whitespace normalization).
- Max-length rejection UX on edit is unspecified (inline error vs silent non-persist).
- Concurrency/conflict policy is not defined for simultaneous edits.
- Security expectations for script-like input are not explicit in the story (covered as derived risk).

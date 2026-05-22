# Test Plan: Program List Filtering and Display (DS-5)

**Jira:** [DS-5 — Program list filtering and display](https://legionqaschool.atlassian.net/browse/DS-5)  
**App:** Didaxis Studio — `https://test.didaxis.studio/programs`  
**Feature scope:** **Programs** list page — display existing programs with name and description, and empty state when none exist (Create/Edit/Delete covered by DS-1–DS-4)

## Scope

Validate that an **admin** can view and manage programs from a clear list:

- Each program row shows **Program Name** and **Description**
- When no programs exist, an empty state message and create prompt appear

> **Note:** Jira summary mentions *filtering*, but DS-5 acceptance criteria define **display** and **empty state** only. Filtering/search is out of scope unless added to AC.

## UI context (Didaxis Studio)

| Element | Locator / label |
|---------|-----------------|
| Login | `getByLabel('Email')`, `getByLabel('Password')`, `Sign In` |
| Credentials | `DIDAXIS_EMAIL`, `DIDAXIS_PASSWORD`, `DIDAXIS_URL` (`.env`) |
| Programs nav | `getByRole('button', { name: /Programs/i })` |
| Programs page | URL `/programs`, heading `Programs` |
| Program list | `getByRole('table')` — row `paragraph` [0] = name, [1] = description |
| Create (header) | `+ New Program` |
| Empty state message | `No programs yet. Create your first program to get started.` |
| Empty state CTA | `Create Program` (Confluence *Program Setup — UI Behavior*) |

## Assumptions (from Confluence — Program Setup)

- **Program Name** required, max **100 characters**, unique per organization (DS-3).
- **Description** optional, max **500 characters**.
- List **re-fetches after mutations** so new/edited/deleted programs appear without manual refresh.
- **Viewer** role has read-only list access (not covered in DS-5 AC; optional TC-013).

## Sample program data

| Field | Example value |
|-------|----------------|
| Program Name | `Web Development 2026` |
| Description | `Full-stack web development track for 2026 cohort` |
| Program Name (2) | `Data Science 2026` |
| Description (2) | `Applied statistics and machine learning cohort` |
| Special chars name | `Informatique & IA - Niveau 2` |
| Special chars description | `Programme bilingue — parcours Informatique et IA` |
| Max-length name (100) | `MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM` |
| Empty description program | `Cloud Fundamentals` with Description left blank on create |
| Unicode / emoji | `Développement Logiciel 🚀` / `Parcours avancé en génie logiciel et qualité` |

---

## Positive Flows

### TC-001
- **Title:** Programs table lists each existing program with name and description (AC: display program list)
- **Preconditions:**
  1. Admin is logged in (`DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD` from `.env`).
  2. Programs exist, e.g. `Web Development 2026` and `Data Science 2026` (create via `+ New Program` if missing).
- **Steps:**
  1. Navigate to `/programs`.
  2. Locate the table row for `Web Development 2026`.
  3. Locate the table row for `Data Science 2026`.
- **Expected result:**
  - `Programs` heading is visible.
  - Each program has a table row with name in the first `paragraph` and description in the second `paragraph`.
  - Displayed text matches stored values (e.g. `Full-stack web development track for 2026 cohort`).
- **Priority:** High

### TC-002
- **Title:** Empty state message and create prompt appear when no programs exist (AC: empty state)
- **Preconditions:**
  1. Admin is logged in.
  2. Organization has **zero** programs (dedicated test org or all programs removed).
- **Steps:**
  1. Navigate to `/programs`.
  2. Observe page body.
- **Expected result:**
  - No program data rows in the table.
  - Message: `No programs yet. Create your first program to get started.`
  - `Create Program` button (or equivalent) is visible.
- **Priority:** High

### TC-003
- **Title:** Empty-state create prompt opens the New Program flow
- **Preconditions:**
  1. Admin is logged in.
  2. Zero programs exist.
- **Steps:**
  1. On `/programs`, click `Create Program`.
- **Expected result:**
  - `New Program` modal opens **or** user reaches program creation UI with **Program Name** field.
  - Admin can start creating the first program.
- **Priority:** Medium

### TC-004
- **Title:** Programs list remains visible after page reload when programs exist
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Web Development 2026` exists.
- **Steps:**
  1. Open `/programs` and confirm the row is visible.
  2. Reload the page.
- **Expected result:**
  - `Web Development 2026` row still appears with correct name and description.
- **Priority:** Medium

---

## Negative Flows

### TC-005
- **Title:** Empty-state message is not shown when at least one program exists (AC guard)
- **Preconditions:**
  1. Admin is logged in.
  2. At least one program exists (e.g. `Web Development 2026`).
- **Steps:**
  1. Navigate to `/programs`.
- **Expected result:**
  - Program table shows at least one data row.
  - Text `No programs yet. Create your first program to get started.` is **not** visible.
- **Priority:** High

### TC-006
- **Title:** Program name column is not blank for an existing program
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Web Development 2026` exists with a non-empty description.
- **Steps:**
  1. Open `/programs`.
  2. Inspect the row for `Web Development 2026`.
- **Expected result:**
  - Name `paragraph` shows `Web Development 2026` (not empty, not `undefined`/`null`).
  - Description `paragraph` shows the saved description text.
- **Priority:** High

### TC-007
- **Title:** API failure does not show empty state as if zero programs exist
- **Preconditions:**
  1. Admin is logged in.
  2. Programs exist in the backend.
  3. Programs list API is forced to return `500 Internal Server Error`.
- **Steps:**
  1. Stub/mocks `GET` programs API to 500.
  2. Navigate to `/programs`.
- **Expected result:**
  - Page does not show “no programs” empty state when programs exist server-side.
  - User sees an error message (toast/banner) and can retry.
- **Priority:** High

### TC-008
- **Title:** Unauthorized user does not see admin-only create affordances (if role differs)
- **Preconditions:**
  1. Non-admin user logged in (`DIDAXIS_NONADMIN_EMAIL` / `DIDAXIS_NONADMIN_PASSWORD` if available).
  2. At least one program exists.
- **Steps:**
  1. Open `/programs`.
  2. Check for `+ New Program` / row edit-delete actions per role matrix.
- **Expected result:**
  - Viewer/read-only users see the list (if permitted) without unauthorized create/edit/delete controls.
- **Priority:** Medium

---

## Edge Cases

### TC-009
- **Title:** Program names with special characters render correctly in the list
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Informatique & IA - Niveau 2` exists with description `Programme bilingue — parcours Informatique et IA`.
- **Steps:**
  1. Open `/programs`.
  2. Find row `Informatique & IA - Niveau 2`.
- **Expected result:**
  - `&`, `-`, and accented characters display correctly in name and description cells.
- **Priority:** Medium

### TC-010
- **Title:** Maximum-length program name (100 characters) displays without breaking the table layout
- **Preconditions:**
  1. Admin is logged in.
  2. Program exists with 100-character name (see sample data above).
- **Steps:**
  1. Open `/programs`.
  2. Locate the max-length name row.
- **Expected result:**
  - Full name is visible per UI policy (wrap/truncate/tooltip) without overlapping columns.
  - Description cell remains readable.
- **Priority:** Medium

### TC-011
- **Title:** Program with empty description is listed with a safe description display
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Cloud Fundamentals` exists with blank **Description** on create.
- **Steps:**
  1. Open `/programs`.
  2. Locate `Cloud Fundamentals`.
- **Expected result:**
  - Row loads; name is visible.
  - Description cell shows empty, `-`, or `No description` per design — layout is not broken.
- **Priority:** Low

### TC-012
- **Title:** Unicode and emoji in program name and description render correctly
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Développement Logiciel 🚀` exists with French description.
- **Steps:**
  1. Open `/programs`.
  2. Locate the unicode/emoji row.
- **Expected result:**
  - Accented characters and 🚀 render without `` replacement glyphs.
- **Priority:** Low

### TC-013
- **Title:** Multiple programs are all visible in the table (smoke for large list)
- **Preconditions:**
  1. Admin is logged in.
  2. At least five distinct programs exist (create via UI with unique suffixes if needed).
- **Steps:**
  1. Open `/programs`.
  2. Verify each created program name appears in the table.
- **Expected result:**
  - All created programs appear as separate rows with matching descriptions.
  - Table remains scrollable/usable.
- **Priority:** Low

### TC-014
- **Title:** Header `+ New Program` is available when programs already exist
- **Preconditions:**
  1. Admin is logged in.
  2. At least one program exists.
- **Steps:**
  1. Open `/programs`.
  2. Observe header actions.
- **Expected result:**
  - `+ New Program` button is visible and opens `New Program` modal on click.
- **Priority:** Medium

---

## AC Coverage Matrix

| DS-5 Acceptance Criteria | Test case(s) |
|--------------------------|--------------|
| Display program list with name and description | TC-001 (+ TC-004, TC-006, TC-009–TC-011, TC-013) |
| Empty state when no programs exist | TC-002 (+ TC-003) |
| Empty state not shown when programs exist | TC-005 |
| Create prompt in empty state | TC-003 |

---

## Ambiguities / Gaps in Acceptance Criteria

1. **“Filtering” in title but not in AC** — No search/filter fields, match rules, or reset behavior defined (out of scope until specified).
2. **Sort order unspecified** — Default list order (created date, name A–Z) not stated.
3. **Exact empty-state copy in Jira AC** — Jira says “message indicating no programs have been created”; Confluence specifies exact string and `Create Program` CTA (TC-002/TC-003).
4. **Empty description display** — AC requires description column but not behavior when Description is blank (TC-011).
5. **Max name length** — Not in DS-5 AC; Confluence/DS-3 specify 100 characters, not 255 (TC-010).
6. **API error handling** — Not in AC; Confluence implies error feedback, not empty state (TC-007; see [DS-35](https://legionqaschool.atlassian.net/browse/DS-35)).
7. **Pagination / virtualization** — Large lists (500+) not specified (TC-013 is smoke only).
8. **Duplicate names** — Uniqueness per org expected (DS-3); duplicate rows only if product allows ([SS-25](https://legionqaschool.atlassian.net/browse/SS-25)).
9. **Role matrix** — AC says admin; Viewer read-only access in Confluence but not in AC (TC-008).
10. **Row click / semester panel** — Confluence mentions selecting a row for semesters; not in DS-5 AC.
11. **Known product bug (automation)** — Empty **Description** on create yields a list row with name only (no description `paragraph`); filed as [DS-53](https://legionqaschool.atlassian.net/browse/DS-53) (TC-011).

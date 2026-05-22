# Test Plan: Program Name Validation and Duplicate Prevention (DS-3)

**Jira:** [DS-3 — Program name validation and duplicate prevention](https://legionqaschool.atlassian.net/browse/DS-3)  
**App:** Didaxis Studio — `https://test.didaxis.studio/programs`  
**Feature scope:** **New Program** creation modal only (not Edit Program — covered by DS-2)

## Scope

Validate that an admin can create programs only when **Program Name** is valid and unique. Focus on:

- Whitespace-only and empty name rejection
- Acceptance of special characters in valid names
- Duplicate name prevention
- Boundary lengths and normalization behavior

## UI context (Didaxis Studio)

| Element | Locator / label |
|---------|-----------------|
| Programs page | URL `/programs`, heading `Programs` |
| Open create form | Button `+ New Program` |
| Modal title | `New Program` |
| Program Name field | `getByRole('textbox', { name: 'Program Name' })` |
| Description field | `getByRole('textbox', { name: 'Description' })` (optional) |
| Submit | Button `Create` |
| Program list | Table row with program name in first `paragraph` |

## Assumptions (from Confluence — Program Setup)

- **Program Name** is required, max **100 characters**, unique per organization.
- **Description** is optional, max **500 characters**.
- **Create** button is **disabled** when Program Name is empty (before trim).
- On submit, Program Name is **trimmed**; whitespace-only values are treated as empty.
- Duplicate enforcement may be client-side and/or server-side (verify both layers where possible).

## Sample valid Description (for required-field filler in steps)

`Full-stack web development track for 2026 cohort`

---

## Positive Flows

### TC-001
- **Title:** Program is created when Program Name is `Informatique & IA - Niveau 2` (AC: special characters)
- **Preconditions:**
  1. Admin is logged in (`admin@didaxis.studio` or env `DIDAXIS_EMAIL`).
  2. User is on `/programs`.
  3. No existing program named exactly `Informatique & IA - Niveau 2`.
- **Steps:**
  1. Click `+ New Program`.
  2. In **Program Name**, enter `Informatique & IA - Niveau 2`.
  3. In **Description**, enter `Programme bilingue — parcours Informatique et IA`.
  4. Click `Create`.
- **Expected result:**
  - `New Program` modal closes.
  - Programs table shows a new row with `Informatique & IA - Niveau 2` in the name column.
  - No validation error is shown.
- **Priority:** High

### TC-002
- **Title:** Program is created when Program Name is unique after leading/trailing spaces are trimmed
- **Preconditions:**
  1. Admin is logged in.
  2. User is on `/programs`.
  3. No existing program named `Data Science 2026`.
- **Steps:**
  1. Click `+ New Program`.
  2. In **Program Name**, enter `   Data Science 2026   `.
  3. In **Description**, enter `Applied statistics and machine learning cohort`.
  4. Click `Create`.
- **Expected result:**
  - Program is created successfully.
  - List displays `Data Science 2026` (trimmed; no leading/trailing spaces).
- **Priority:** High

### TC-003
- **Title:** Program is created when Program Name contains accented Latin characters
- **Preconditions:**
  1. Admin is logged in.
  2. User is on `/programs`.
  3. No existing program named `Économie Internationale 2026`.
- **Steps:**
  1. Click `+ New Program`.
  2. In **Program Name**, enter `Économie Internationale 2026`.
  3. In **Description**, enter `Programme francophone — relations économiques internationales`.
  4. Click `Create`.
- **Expected result:**
  - Program is created; name renders correctly in list (no mojibake).
- **Priority:** Medium

### TC-004
- **Title:** Program is created when Program Name uses common punctuation and symbols (not duplicate)
- **Preconditions:**
  1. Admin is logged in.
  2. User is on `/programs`.
  3. No existing program named `QA/Test_Automation (Level-2) + API`.
- **Steps:**
  1. Click `+ New Program`.
  2. In **Program Name**, enter `QA/Test_Automation (Level-2) + API`.
  3. In **Description**, enter `Automation fundamentals with API testing module`.
  4. Click `Create`.
- **Expected result:**
  - Program is created; stored name matches input exactly.
- **Priority:** Medium

---

## Negative Flows

### TC-005
- **Title:** Form is not submitted when Program Name is only whitespace (AC)
- **Preconditions:**
  1. Admin is logged in.
  2. User is on `/programs`.
  3. `New Program` modal is open.
- **Steps:**
  1. In **Program Name**, enter `   ` (three spaces).
  2. In **Description**, enter `Whitespace-only name validation test`.
  3. Click `Create` (or observe button state if disabled after trim).
- **Expected result:**
  - Form is **not** submitted (per AC: trimmed name treated as empty).
  - `New Program` modal stays open **or** `Create` remains disabled.
  - No new row appears in the programs table.
  - No success toast or modal close indicating creation.
- **Priority:** High

### TC-006
- **Title:** Form is not submitted when Program Name is empty
- **Preconditions:**
  1. Admin is logged in.
  2. `New Program` modal is open.
- **Steps:**
  1. Leave **Program Name** blank.
  2. In **Description**, enter `Empty name validation test`.
  3. Attempt to click `Create`.
- **Expected result:**
  - `Create` button is **disabled** (Confluence client rule).
  - No program is created.
- **Priority:** High

### TC-007
- **Title:** Duplicate program creation is rejected for exact name `Web Development 2026` (AC)
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Web Development 2026` already exists in the list (create via UI or seed if missing).
  3. User is on `/programs`.
- **Steps:**
  1. Click `+ New Program`.
  2. In **Program Name**, enter `Web Development 2026`.
  3. In **Description**, enter `Duplicate name attempt — should be rejected`.
  4. Click `Create`.
- **Expected result:**
  - User sees an error indicating the name **already exists** (AC).
  - `New Program` modal remains open for correction.
  - Programs table still has **exactly one** row for `Web Development 2026`.
  - No second program with the same name is created.
- **Priority:** High

### TC-008
- **Title:** Duplicate creation is rejected when only leading/trailing spaces differ from existing name
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Web Development 2026` already exists.
  3. `New Program` modal is open.
- **Steps:**
  1. In **Program Name**, enter `  Web Development 2026  `.
  2. In **Description**, enter `Padded duplicate name test`.
  3. Click `Create`.
- **Expected result:**
  - Submission is rejected as duplicate after trim/normalization.
  - Duplicate-name error is displayed.
  - No additional program row is created.
- **Priority:** High

### TC-009
- **Title:** No program is created when duplicate error is returned (server-side guard)
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Web Development 2026` already exists.
  3. Browser DevTools Network tab available (optional).
- **Steps:**
  1. Open `New Program`, enter `Web Development 2026`, valid **Description**, click `Create`.
  2. Observe network response and UI state.
- **Expected result:**
  - API returns duplicate/conflict response (if server enforces uniqueness).
  - UI does **not** show success; error is visible to the user.
  - Form data is preserved for correction.
- **Priority:** Medium

### TC-010
- **Title:** Create action does not succeed when Program Name contains only tabs
- **Preconditions:**
  1. Admin is logged in.
  2. `New Program` modal is open.
- **Steps:**
  1. In **Program Name**, enter `\t\t\t` (tab characters).
  2. Fill **Description** with `Tab-only name test`.
  3. Click `Create`.
- **Expected result:**
  - Treated as empty/invalid after trim (same as whitespace-only).
  - No program created.
- **Priority:** Medium

---

## Edge Cases

### TC-011
- **Title:** Program Name at exact maximum length (100 characters) is accepted when unique
- **Preconditions:**
  1. Admin is logged in.
  2. `New Program` modal is open.
  3. Name below is exactly 100 characters and not already in the list:  
     `MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM`
- **Steps:**
  1. Paste the 100-character name into **Program Name**.
  2. In **Description**, enter `Boundary test — max length name`.
  3. Click `Create`.
- **Expected result:**
  - Program is created successfully.
  - Full 100-character name appears in the list without truncation.
- **Priority:** High

### TC-012
- **Title:** Program Name exceeding 100 characters is rejected
- **Preconditions:**
  1. Admin is logged in.
  2. `New Program` modal is open.
  3. Prepare a 101-character name (100 × `N` + one extra `N`).
- **Steps:**
  1. Enter the 101-character name in **Program Name**.
  2. In **Description**, enter `Over-limit name test`.
  3. Click `Create`.
- **Expected result:**
  - Submission is blocked or prevented before persist (per Confluence max 100).
  - Modal stays open; no over-limit name in the programs table.
  - User receives clear max-length feedback (if implemented).
- **Priority:** High

### TC-013
- **Title:** Duplicate validation behavior for case-different name is consistent
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Web Development 2026` already exists.
  3. `New Program` modal is open.
- **Steps:**
  1. In **Program Name**, enter `web development 2026`.
  2. In **Description**, enter `Case-insensitive duplicate test`.
  3. Click `Create`.
- **Expected result:**
  - Behavior matches product rule (document outcome):
    - If case-insensitive: reject with duplicate error.
    - If case-sensitive: allow creation (only if explicitly specified).
- **Priority:** High

### TC-014
- **Title:** Duplicate validation handles internal multiple spaces consistently
- **Preconditions:**
  1. Admin is logged in.
  2. Program `Web Development 2026` already exists.
  3. `New Program` modal is open.
- **Steps:**
  1. In **Program Name**, enter `Web  Development   2026`.
  2. In **Description**, enter `Internal spacing normalization test`.
  3. Click `Create`.
- **Expected result:**
  - Outcome follows documented normalization (reject as duplicate or allow intentionally).
  - No silent duplicate bypass via spacing variants.
- **Priority:** Medium

### TC-015
- **Title:** Program Name with newline character is rejected or sanitized safely
- **Preconditions:**
  1. Admin is logged in.
  2. `New Program` modal is open.
- **Steps:**
  1. Paste `Cloud Engineering\n2026` into **Program Name**.
  2. In **Description**, enter `Control character test`.
  3. Click `Create`.
- **Expected result:**
  - Invalid input is blocked or sanitized per spec.
  - List does not show broken multi-line program names unless explicitly allowed.
- **Priority:** Medium

### TC-016
- **Title:** Parallel create attempts with same name yield only one successful program
- **Preconditions:**
  1. Two admin browser sessions (A and B) logged in.
  2. Program `Cloud Engineering 2026` does **not** exist yet.
- **Steps:**
  1. In both sessions, open `+ New Program`.
  2. Both enter `Cloud Engineering 2026` and a valid **Description**.
  3. Click `Create` in both sessions as close together as possible.
- **Expected result:**
  - Exactly **one** program `Cloud Engineering 2026` exists after both attempts settle.
  - The other session shows duplicate error or failed create.
  - No duplicate rows in the table.
- **Priority:** High

### TC-017
- **Title:** Minimum-length valid name is accepted when unique
- **Preconditions:**
  1. Admin is logged in.
  2. No program named `AI` exists.
- **Steps:**
  1. Click `+ New Program`.
  2. In **Program Name**, enter `AI`.
  3. In **Description**, enter `Short valid name test`.
  4. Click `Create`.
- **Expected result:**
  - If minimum length allows 2 characters, program is created and listed as `AI`.
- **Priority:** Low

---

## AC Coverage Matrix

| DS-3 Acceptance Criteria | Test case(s) |
|--------------------------|--------------|
| Reject program name with only whitespace | TC-005 (+ TC-006, TC-010) |
| Accept program name with special characters (`Informatique & IA - Niveau 2`) | TC-001 (+ TC-003, TC-004) |
| Reject duplicate program name (`Web Development 2026`) | TC-007 (+ TC-008, TC-009, TC-016) |

---

## Ambiguities / Gaps in Acceptance Criteria

1. **Max length not in Jira AC** — Confluence specifies 100 characters; DS-3 AC does not mention it (TC-011/TC-012 rely on Confluence).
2. **Case sensitivity undefined** — `Web Development 2026` vs `web development 2026` not specified (TC-013).
3. **Internal space normalization** — AC covers end trim only, not `Web  Development   2026` (TC-014).
4. **Exact duplicate error copy not specified** — No required message text, placement (inline vs toast), or i18n.
5. **Client vs server enforcement unclear** — AC does not state whether duplicate check is UI-only, API-only, or both (TC-009).
6. **Control characters** — Tabs, newlines, non-breaking spaces not mentioned in AC (TC-010, TC-015).
7. **Allowed character deny-list incomplete** — One positive example (`&`, `-`) given; XSS/HTML (`<script>`) not addressed.
8. **Concurrency** — Simultaneous creates with the same name not in AC (TC-016).
9. **Edit flow out of scope** — Renaming an existing program to a duplicate is covered by DS-2, not DS-3.
10. **Description validation** — DS-3 focuses on name only; Description max 500 and optional status are unspecified in AC.
11. **Known product risk** — Field testing on `test.didaxis.studio` may show duplicate names allowed on create/edit ([SS-25](https://legionqaschool.atlassian.net/browse/SS-25)); tests should fail until fixed.

# Test Plan: Program Name Validation and Duplicate Prevention

## Scope
This test plan validates program name handling on the **Program Creation** form, focusing on:
- Empty/whitespace rejection
- Special character acceptance
- Duplicate name prevention
- Input boundaries and normalization behavior

Assumed field label: **Program Name**  
Assumed action button: **Create**

---

## Positive Flows

### TC-001
- **Title:** Program is created when Program Name contains valid letters, spaces, symbols, and numbers
- **Preconditions:**
  1. Admin user is authenticated.
  2. User is on the Program Creation form.
  3. No existing program with exact name `Informatique & IA - Niveau 2`.
- **Steps:**
  1. Enter `Informatique & IA - Niveau 2` in **Program Name**.
  2. Fill all other required fields with valid values.
  3. Click **Create**.
- **Expected result:**
  - Program is created successfully.
  - Success confirmation is displayed.
  - New record appears in program list/details with exact entered name.
- **Priority:** High

### TC-002
- **Title:** Program is created when Program Name is unique and trimmed value is valid
- **Preconditions:**
  1. Admin user is authenticated.
  2. User is on Program Creation form.
  3. No existing program with name `Data Science 2026`.
- **Steps:**
  1. Enter `   Data Science 2026   ` in **Program Name**.
  2. Fill all other required fields with valid values.
  3. Click **Create**.
- **Expected result:**
  - Program is created successfully.
  - Persisted name is trimmed to `Data Science 2026`.
  - No leading/trailing spaces are stored.
- **Priority:** High

### TC-003
- **Title:** Program is created when Program Name contains multilingual Latin characters
- **Preconditions:**
  1. Admin user is authenticated.
  2. User is on Program Creation form.
  3. No existing program named `Économie Internationale 2026`.
- **Steps:**
  1. Enter `Économie Internationale 2026` in **Program Name**.
  2. Fill all other required fields with valid values.
  3. Click **Create**.
- **Expected result:**
  - Program is created successfully.
  - Name is stored and rendered correctly with accents.
- **Priority:** Medium

---

## Negative Flows

### TC-004
- **Title:** Form submission is blocked when Program Name is only whitespace
- **Preconditions:**
  1. Admin user is authenticated.
  2. User is on Program Creation form.
- **Steps:**
  1. Enter `   ` in **Program Name**.
  2. Fill other required fields with valid values.
  3. Click **Create**.
- **Expected result:**
  - Submission is blocked.
  - Program Name is treated as empty after trimming.
  - Validation message indicates Program Name is required/invalid.
  - No program record is created.
- **Priority:** High

### TC-005
- **Title:** Form submission is blocked when Program Name is empty
- **Preconditions:**
  1. Admin user is authenticated.
  2. User is on Program Creation form.
- **Steps:**
  1. Leave **Program Name** blank.
  2. Fill other required fields with valid values.
  3. Click **Create**.
- **Expected result:**
  - Submission is blocked.
  - Required-field validation is shown.
  - No program record is created.
- **Priority:** High

### TC-006
- **Title:** Duplicate program creation is rejected for exact existing name
- **Preconditions:**
  1. Admin user is authenticated.
  2. A program `Web Development 2026` already exists.
  3. User is on Program Creation form.
- **Steps:**
  1. Enter `Web Development 2026` in **Program Name**.
  2. Fill other required fields with valid values.
  3. Click **Create**.
- **Expected result:**
  - Submission is rejected.
  - Error message indicates the name already exists.
  - No second program with same name is created.
- **Priority:** High

### TC-007
- **Title:** Duplicate program creation is rejected when only leading/trailing spaces differ
- **Preconditions:**
  1. Admin user is authenticated.
  2. A program `Web Development 2026` already exists.
  3. User is on Program Creation form.
- **Steps:**
  1. Enter `  Web Development 2026  ` in **Program Name**.
  2. Fill other required fields with valid values.
  3. Click **Create**.
- **Expected result:**
  - Submission is rejected as duplicate after normalization.
  - Duplicate-name error is shown.
  - No new record is created.
- **Priority:** High

### TC-008
- **Title:** Program is not created when duplicate error is returned by backend API
- **Preconditions:**
  1. Admin user is authenticated.
  2. A program `Web Development 2026` already exists.
  3. UI is connected to backend/API.
- **Steps:**
  1. Enter `Web Development 2026` in **Program Name**.
  2. Fill other required fields with valid values.
  3. Click **Create**.
  4. Observe API response and UI state.
- **Expected result:**
  - UI displays backend duplicate error clearly.
  - Create action is not treated as success.
  - User remains on form with entered data preserved for correction.
- **Priority:** Medium

---

## Edge Cases

### TC-009
- **Title:** Program Name at maximum allowed length is accepted when unique
- **Preconditions:**
  1. Admin user is authenticated.
  2. User is on Program Creation form.
  3. Maximum length is known from spec/config (e.g., 100 chars).
- **Steps:**
  1. Enter a unique Program Name exactly at max length (e.g., 100 chars).
  2. Fill all other required fields with valid values.
  3. Click **Create**.
- **Expected result:**
  - Program is created successfully.
  - Full name is stored without truncation.
- **Priority:** High

### TC-010
- **Title:** Program Name exceeding maximum length is rejected
- **Preconditions:**
  1. Admin user is authenticated.
  2. User is on Program Creation form.
  3. Maximum length is known from spec/config.
- **Steps:**
  1. Enter a Program Name 1 character above max length.
  2. Fill all other required fields with valid values.
  3. Click **Create**.
- **Expected result:**
  - Submission is blocked or extra input is prevented (per implementation).
  - Clear max-length validation message is shown.
  - No program record is created with over-limit value.
- **Priority:** High

### TC-011
- **Title:** Duplicate validation handles case-insensitive matches consistently
- **Preconditions:**
  1. Admin user is authenticated.
  2. A program `Web Development 2026` already exists.
  3. User is on Program Creation form.
- **Steps:**
  1. Enter `web development 2026` in **Program Name**.
  2. Fill all other required fields with valid values.
  3. Click **Create**.
- **Expected result:**
  - Behavior is consistent with product rule:
    - If comparison is case-insensitive: reject as duplicate.
    - If comparison is case-sensitive: allow creation.
  - Outcome must match documented requirement.
- **Priority:** High

### TC-012
- **Title:** Duplicate validation handles internal multi-space normalization consistently
- **Preconditions:**
  1. Admin user is authenticated.
  2. Existing program: `Web Development 2026`.
  3. User is on Program Creation form.
- **Steps:**
  1. Enter `Web  Development   2026` in **Program Name**.
  2. Fill other required fields with valid values.
  3. Click **Create**.
- **Expected result:**
  - Behavior follows documented normalization rule for internal spaces.
  - No silent data corruption occurs.
  - If considered same, duplicate error is shown; otherwise creation succeeds intentionally.
- **Priority:** Medium

### TC-013
- **Title:** Program Name with punctuation and symbols remains valid when not duplicate
- **Preconditions:**
  1. Admin user is authenticated.
  2. User is on Program Creation form.
  3. Name is unique.
- **Steps:**
  1. Enter `QA/Test_Automation (Level-2) + API` in **Program Name**.
  2. Fill all other required fields.
  3. Click **Create**.
- **Expected result:**
  - Program is created successfully.
  - Stored/rendered name preserves allowed symbols.
- **Priority:** Medium

### TC-014
- **Title:** Program Name containing newline or tab characters is rejected or sanitized per rule
- **Preconditions:**
  1. Admin user is authenticated.
  2. User is on Program Creation form.
- **Steps:**
  1. Paste `Program	Name` or `Program\nName` into **Program Name**.
  2. Fill all other required fields with valid values.
  3. Click **Create**.
- **Expected result:**
  - Behavior follows documented input sanitation rule.
  - No broken UI rendering or hidden duplicate is introduced.
  - If invalid characters are disallowed, submission is blocked with clear validation.
- **Priority:** Medium

### TC-015
- **Title:** System prevents race-condition duplicates from parallel create attempts
- **Preconditions:**
  1. Admin user is authenticated in two browser sessions.
  2. Program `Cloud Engineering 2026` does not yet exist.
- **Steps:**
  1. In both sessions, enter `Cloud Engineering 2026` and valid required data.
  2. Submit both forms nearly simultaneously.
- **Expected result:**
  - Only one creation succeeds.
  - Other attempt receives duplicate-name error.
  - Data store remains with a single unique program.
- **Priority:** High

---

## AC Coverage Matrix
- **AC: Reject whitespace-only name** -> TC-004 (plus TC-005)
- **AC: Accept special characters** -> TC-001, TC-013
- **AC: Reject duplicate name** -> TC-006 (plus TC-007, TC-008, TC-015)

---

## Ambiguities / Gaps in Acceptance Criteria
1. **Max length not specified:** No explicit character limit for `Program Name`.
2. **Case-sensitivity undefined for duplicates:** `Web Development 2026` vs `web development 2026` behavior is unclear.
3. **Normalization scope unclear:** AC confirms trimming at ends, but does not define handling of repeated internal spaces.
4. **Allowed character set not fully defined:** AC confirms one special-character example only; full allow/deny list is missing.
5. **Control characters not addressed:** Tabs/newlines/non-printable characters handling is unspecified.
6. **Duplicate check layer unclear:** Whether enforced on UI only, API only, or both is not explicit.
7. **Error message requirements unclear:** No exact copy, localization, or field-level vs toast requirement provided.
8. **Concurrency behavior unspecified:** No AC for simultaneous submissions creating same name.
9. **Whitespace/Unicode normalization unclear:** Behavior for non-breaking spaces and Unicode normalization forms is not defined.
10. **Update/edit behavior out of scope:** AC covers creation only; renaming an existing program to a duplicate is not specified.

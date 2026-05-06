# Test Plan: Program List Filtering and Display

## Scope
Validate that the Programs page correctly displays existing programs with key details and shows the expected empty state when no programs exist.

## Assumptions
- Admin users access the page via left navigation item `Programs`.
- Program list rows display fields `Program Name` and `Description`.
- Empty-state call-to-action is a button labeled `Create Program`.

## Positive Flows

### TC-001
- **Title:** Programs page shows all existing programs with name and description
- **Preconditions:**  
  - Admin account `admin.qa@acme.edu` is active  
  - Programs exist:
    - Program Name: `Web Development 2026`, Description: `Full-stack curriculum with React and Node.js`
    - Program Name: `Data Science Bootcamp`, Description: `Python, statistics, and machine learning fundamentals`
- **Steps:**
  1. Sign in as `admin.qa@acme.edu`.
  2. Click `Programs` in the main navigation.
  3. Observe the list content.
- **Expected result:**  
  - A list is displayed with one row per existing program.  
  - Each row shows `Program Name` and `Description` values matching stored data.  
  - Both listed programs are visible.
- **Priority:** High

### TC-002
- **Title:** Empty state appears when there are no programs
- **Preconditions:**  
  - Admin account `admin.qa@acme.edu` is active  
  - Program table is empty (0 records)
- **Steps:**
  1. Sign in as `admin.qa@acme.edu`.
  2. Click `Programs` in the main navigation.
  3. Observe the page body.
- **Expected result:**  
  - No program rows are displayed.  
  - Message indicates no programs exist (for example: `No programs have been created yet.`).  
  - A visible prompt/action to create the first program is present (`Create Program` button or equivalent).
- **Priority:** High

### TC-003
- **Title:** Create-first-program prompt navigates admin to program creation flow
- **Preconditions:**  
  - Admin account `admin.qa@acme.edu` is active  
  - Program table is empty (0 records)
- **Steps:**
  1. Sign in as `admin.qa@acme.edu`.
  2. Open `Programs`.
  3. Click `Create Program` from empty state.
- **Expected result:**  
  - Admin is redirected to the creation form page (`/programs/new` or configured route).  
  - Form includes required field `Program Name`.
- **Priority:** Medium

## Negative Flows

### TC-004
- **Title:** Programs page must not show empty-state message when programs exist
- **Preconditions:**  
  - Admin account `admin.qa@acme.edu` is active  
  - At least one program exists: `Cybersecurity Essentials`
- **Steps:**
  1. Sign in as `admin.qa@acme.edu`.
  2. Open `Programs`.
- **Expected result:**  
  - Program list is shown.  
  - Text indicating no programs exist is not shown.  
  - `Create Program` empty-state prompt is not shown in place of list content.
- **Priority:** High

### TC-005
- **Title:** Programs page must not render blank values for required list columns
- **Preconditions:**  
  - Admin account `admin.qa@acme.edu` is active  
  - Program record exists with:
    - Program Name: `AI Product Management`
    - Description: `Roadmap and delivery for AI products`
- **Steps:**
  1. Sign in as `admin.qa@acme.edu`.
  2. Navigate to `Programs`.
  3. Locate row for `AI Product Management`.
- **Expected result:**  
  - `Program Name` and `Description` cells are not blank/null placeholders (e.g., not empty, not `undefined`, not `null`).  
  - Rendered values match stored values.
- **Priority:** High

### TC-006
- **Title:** Programs page should not crash on data retrieval failure
- **Preconditions:**  
  - Admin account `admin.qa@acme.edu` is active  
  - API call `GET /api/programs` is forced to return HTTP 500
- **Steps:**
  1. Sign in as `admin.qa@acme.edu`.
  2. Open browser dev tools/network stubbing and force `GET /api/programs` to 500.
  3. Navigate to `Programs`.
- **Expected result:**  
  - Page remains usable (no white screen/crash).  
  - User sees a generic load error message (for example: `Unable to load programs. Please try again.`).  
  - Empty-state message is not incorrectly shown as if there are 0 programs.
- **Priority:** Medium

## Edge Cases

### TC-007
- **Title:** Program names with special characters display correctly in list
- **Preconditions:**  
  - Admin account `admin.qa@acme.edu` is active  
  - Program exists:
    - Program Name: `Informatique & IA - Niveau 2 (2026/2027)`
    - Description: `Bilingue FR/EN; includes NLP, CV, and MLOps`
- **Steps:**
  1. Sign in as `admin.qa@acme.edu`.
  2. Navigate to `Programs`.
  3. Find the row for `Informatique & IA - Niveau 2 (2026/2027)`.
- **Expected result:**  
  - Special characters (`&`, `-`, `/`, parentheses) render correctly.  
  - Text is not escaped incorrectly or replaced with garbled symbols.
- **Priority:** Medium

### TC-008
- **Title:** Duplicate program names are shown as separate records when distinct entries exist
- **Preconditions:**  
  - Admin account `admin.qa@acme.edu` is active  
  - Two records exist with same Program Name `Business Analytics` and different descriptions:
    - `Cohort A - weekday schedule`
    - `Cohort B - weekend schedule`
- **Steps:**
  1. Sign in as `admin.qa@acme.edu`.
  2. Open `Programs`.
  3. Search visually for rows named `Business Analytics`.
- **Expected result:**  
  - Both records appear as two distinct rows.  
  - Each row keeps its own corresponding description.
- **Priority:** Medium

### TC-009
- **Title:** Maximum-length program name displays without UI breakage
- **Preconditions:**  
  - Admin account `admin.qa@acme.edu` is active  
  - Program exists with 255-character name:  
    `Advanced Enterprise Architecture and Cloud Transformation Strategy Program for Global Multi-Region Operations and Secure Scalable Platform Engineering Excellence Track 2026 Cohort Alpha Extended Format Certification Pathway`
  - Description: `Long-name rendering verification`
- **Steps:**
  1. Sign in as `admin.qa@acme.edu`.
  2. Navigate to `Programs`.
  3. Locate the long-name record.
- **Expected result:**  
  - Long name is visible according to design (wrapped, truncated with ellipsis, or horizontal scroll), without overlapping other columns/components.  
  - Row remains selectable/readable and description is still visible.
- **Priority:** Medium

### TC-010
- **Title:** Empty description value is handled gracefully in list display
- **Preconditions:**  
  - Admin account `admin.qa@acme.edu` is active  
  - Program exists:
    - Program Name: `Cloud Fundamentals`
    - Description: empty string `""`
- **Steps:**
  1. Sign in as `admin.qa@acme.edu`.
  2. Navigate to `Programs`.
  3. Locate `Cloud Fundamentals`.
- **Expected result:**  
  - Page loads successfully.  
  - Description column displays a safe fallback (`-` or `No description`) or blank per design, without breaking row layout.
- **Priority:** Low

### TC-011
- **Title:** Very large program list remains readable and complete
- **Preconditions:**  
  - Admin account `admin.qa@acme.edu` is active  
  - 500 programs exist with unique names and mixed description lengths
- **Steps:**
  1. Sign in as `admin.qa@acme.edu`.
  2. Open `Programs`.
  3. Scroll through the list from top to bottom (or paginate through all pages if pagination exists).
- **Expected result:**  
  - No missing or duplicated rows introduced by rendering issues.  
  - UI remains responsive and usable while navigating the list.
- **Priority:** Low

### TC-012
- **Title:** Unicode and emoji characters in program details render correctly
- **Preconditions:**  
  - Admin account `admin.qa@acme.edu` is active  
  - Program exists:
    - Program Name: `Développement Logiciel 🚀`
    - Description: `Parcours avancé en génie logiciel et qualité`
- **Steps:**
  1. Sign in as `admin.qa@acme.edu`.
  2. Open `Programs`.
  3. Locate `Développement Logiciel 🚀`.
- **Expected result:**  
  - Accented characters and emoji render correctly.  
  - No replacement characters (`?` or `�`) appear.
- **Priority:** Low

## Traceability to Acceptance Criteria
- **AC1: Display program list with key details** → Covered by TC-001, TC-004, TC-005, TC-007, TC-009, TC-010, TC-011, TC-012
- **AC2: Empty state when no programs exist** → Covered by TC-002, TC-003

## Ambiguities and Gaps in ACs
- AC title mentions **filtering**, but no filtering behavior is defined (filter fields, matching rules, case sensitivity, reset behavior).
- Sort order is unspecified (default order, user-controlled sorting, persistence).
- No explicit requirement for pagination/virtualization thresholds for large datasets.
- Empty-state content is not fully defined (exact message text, exact CTA label, and target route).
- Behavior for null/empty `Description` is not specified.
- Error handling is unspecified (API failures, timeout, retry, unauthorized responses).
- No explicit UI expectations for long text handling (wrap vs truncate, tooltip behavior).
- Access control is implied by role but not specified (what non-admin users should see).

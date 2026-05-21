Write Playwright tests for creating a new program on Didaxis Studio.

## App context (from manual inspection)

- Login page: [https://test.didaxis.studio/login](https://test.didaxis.studio/login)
  - Email field: getByLabel('Email')
  - Password field: getByLabel('Password')
  - Sign In button: getByRole('button', { name: 'Sign In' })
- Programs page: /programs
  - "New Program" button: getByRole('button', { name: 'New Program' })
  - Modal form:
    - Program Name: getByLabel('Program Name')
    - Description: getByLabel('Description')
    - Create button: getByRole('button', { name: 'Create' })

## Credentials

Use dotenv. Read email and password from process.env:

- process.env.DIDAXIS_EMAIL
- process.env.DIDAXIS_PASSWORD
Do NOT hardcode credentials in the test file.

## Test plan

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

## Requirements

- TypeScript
- Use Playwright locators (getByRole, getByLabel, getByText)
- Login as the first step in each test (or use beforeEach)
- Each test is independent
- Use unique test data with Date.now() suffix
- Save as tests/ds1-create-program.spec.ts

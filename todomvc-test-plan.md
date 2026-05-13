# Test Plan: React TodoMVC (Playwright demo)

**Application under test:** [https://demo.playwright.dev/todomvc/#/](https://demo.playwright.dev/todomvc/#/)  
**Disclaimer shown in-app:** “This is just a demo of TodoMVC for testing, not the real TodoMVC app.”

**Real UI identifiers used in this plan**

| Element | How to locate |
|--------|----------------|
| New todo field | `input.new-todo`, placeholder **What needs to be done?** |
| App title | `h1` text **todos** |
| Todo row | `li[data-testid="todo-item"]` |
| Todo title (visible) | `label[data-testid="todo-title"]` |
| Complete toggle | `input.toggle` with **aria-label** `Toggle Todo` |
| Delete | `button.destroy` with **aria-label** `Delete` |
| Mark all | `input#toggle-all` (class `toggle-all`), label **Mark all as complete** |
| Items left | `span[data-testid="todo-count"]` (e.g. **4 items left**) |
| Filters | Links **All** `#/`, **Active** `#/active`, **Completed** `#/completed` |
| Clear completed | `button.clear-completed` text **Clear completed** |
| Inline edit | `input.edit` with **aria-label** `Edit` (after double-click per footer hint) |

---

## Positive flows

### TC-001 — Empty session exposes a usable todo entry surface

**Preconditions:** Browser navigates to `https://demo.playwright.dev/todomvc/#/` with no todos in `localStorage` for this origin (fresh load / cleared storage).

**Steps:**

1. Open `https://demo.playwright.dev/todomvc/#/`.
2. Observe the header area.

**Expected result:** Heading **todos** is visible and the field with placeholder **What needs to be done?** is visible and focusable. No `li[data-testid="todo-item"]` rows yet (count 0).

**Priority:** High

---

### TC-002 — First submitted todo creates a visible list (create a todo list)

**Preconditions:** Same as TC-001 (empty list).

**Steps:**

1. Click `input.new-todo`.
2. Type `Buy milk`.
3. Press Enter.

**Expected result:** Exactly one `li[data-testid="todo-item"]` appears. `label[data-testid="todo-title"]` shows **Buy milk**. Footer shows **1 items left** in `span[data-testid="todo-count"]`. Filter links **All**, **Active**, **Completed** are present.

**Priority:** High

---

### TC-003 — User can add four distinct todos (add items (4))

**Preconditions:** Empty list (fresh `#/`).

**Steps:**

1. In `input.new-todo`, type `Buy milk`, press Enter.
2. Type `Walk dog`, press Enter.
3. Type `Read book`, press Enter.
4. Type `Call mom`, press Enter.

**Expected result:** Four `li[data-testid="todo-item"]` rows exist, titles **Buy milk**, **Walk dog**, **Read book**, **Call mom** in order. `span[data-testid="todo-count"]` reads **4 items left**.

**Priority:** High

---

### TC-004 — Completing a todo shows it as finished (finish item)

**Preconditions:** List from TC-003 (four active todos).

**Steps:**

1. On the first row (**Buy milk**), check `input.toggle` (**Toggle Todo**).

**Expected result:** That `li[data-testid="todo-item"]` has class `completed`. Its checkbox stays checked. **3 items left** in `span[data-testid="todo-count"]`. Title **Buy milk** still visible on **All** filter.

**Priority:** High

---

### TC-005 — Deleting a todo removes it from the list (remove item)

**Preconditions:** List from TC-003 (four active todos).

**Steps:**

1. Note current row count (4).
2. On the second todo (**Walk dog**), click `button.destroy` (**Delete**).

**Expected result:** Exactly three rows remain. No row with title **Walk dog**. Remaining titles are **Buy milk**, **Read book**, **Call mom**. Counter shows **3 items left**.

**Priority:** High

---

### TC-006 — Mark all as complete updates every row and the counter

**Preconditions:** At least two active todos exist.

**Steps:**

1. Check `input#toggle-all` (**Mark all as complete**).

**Expected result:** Every `li[data-testid="todo-item"]` has class `completed`. All `input.toggle` checkboxes checked. `span[data-testid="todo-count"]` shows **0 items left**. **Clear completed** button appears in the footer.

**Priority:** Medium

---

### TC-007 — Completed filter lists only finished todos

**Preconditions:** One completed and one active todo (e.g. complete **Buy milk** only).

**Steps:**

1. Click link **Completed** (`#/completed`).

**Expected result:** Only completed row(s) visible; **Buy milk** appears if it was completed. Active-only todos are hidden in this view.

**Priority:** Medium

---

## Negative flows

### TC-101 — Submitting an empty todo does not add a row

**Preconditions:** Empty list.

**Steps:**

1. Focus `input.new-todo`.
2. Press Enter without typing.

**Expected result:** `li[data-testid="todo-item"]` count stays 0. No footer filter bar for todos (main list area unchanged).

**Priority:** High

---

### TC-102 — Whitespace-only input does not create a todo

**Preconditions:** Empty list.

**Steps:**

1. In `input.new-todo`, type three spaces `   `.
2. Press Enter.

**Expected result:** No new `li[data-testid="todo-item"]`. List remains empty.

**Priority:** Medium

---

### TC-103 — Unchecking a completed todo must not leave it marked completed

**Preconditions:** One todo completed via `input.toggle`.

**Steps:**

1. Uncheck the same `input.toggle`.

**Expected result:** Parent `li[data-testid="todo-item"]` no longer has class `completed`. Item counts as active again (counter increases accordingly).

**Priority:** Medium

---

### TC-104 — “Clear completed” must not remove active todos

**Preconditions:** Mix of completed and active todos; **Clear completed** visible.

**Steps:**

1. Click **Clear completed**.

**Expected result:** All `li[data-testid="todo-item"].completed` removed. Every remaining row is active (not `completed`). Active titles unchanged.

**Priority:** Medium

---

## Edge cases

### TC-201 — Very long single-line title is accepted (boundary)

**Preconditions:** Empty list.

**Steps:**

1. Paste a string of **500** ASCII characters `a` repeated 500 times into `input.new-todo`.
2. Press Enter.

**Expected result:** One todo appears; `label[data-testid="todo-title"]` text length is 500 (no silent truncation in demo).

**Priority:** Low

---

### TC-202 — Duplicate titles are both listed

**Preconditions:** Empty list.

**Steps:**

1. Add todo `same`.
2. Add todo `same` again.

**Expected result:** Two rows, both title **same**. Counter **2 items left**.

**Priority:** Low

---

### TC-203 — Special characters are stored as plain text (no script execution)

**Preconditions:** Empty list.

**Steps:**

1. Add todo `<script>alert(1)</script>`.

**Expected result:** Label shows literal `<script>alert(1)</script>`. No dialog; treated as text content.

**Priority:** Medium

---

### TC-204 — Unicode and emoji in title display correctly

**Preconditions:** Empty list.

**Steps:**

1. Add todo `Задача 🛒 中文`.

**Expected result:** Single row shows exactly **Задача 🛒 中文** on `label[data-testid="todo-title"]`.

**Priority:** Low

---

### TC-205 — Double-click enables inline edit per product hint

**Preconditions:** At least one todo.

**Steps:**

1. Double-click `label[data-testid="todo-title"]` for that todo.

**Expected result:** `input.edit` (**Edit**) is used for changing text; saving behavior matches demo (blur / Enter per typical TodoMVC; assert title updates if user commits a new string).

**Priority:** Low

---

## Acceptance criteria traceability

| AC | Covered by |
|----|----------------|
| 1. Create a todo list | TC-001, TC-002 |
| 2. Add items (4) | TC-003 |
| 3. Finish item. Expect to be finished | TC-004 |
| 4. Remove item from the list. Expect to be removed | TC-005 |

Additional positive coverage: TC-006, TC-007. Negative: TC-101–TC-104. Edge: TC-201–TC-205.

---

## Ambiguities and gaps in the acceptance criteria

1. **“Create a todo list”** — Unclear whether this means only the first item (minimal list) or the full four-item list; plan treats first item as list creation (TC-002) and four items as separate AC (TC-003).
2. **“Finish item”** — Does not specify *which* of the four items or whether “finish” means toggle, **Mark all as complete**, or **Clear completed**; TC-004 uses per-item toggle as the primary interpretation.
3. **“Remove item”** — Does not specify per-row **Delete** vs **Clear completed** vs removing via edit-to-empty (if supported); TC-005 uses **Delete** on a concrete row.
4. **Persistence / refresh** — ACs do not state whether todos survive reload; not required for demo scope but would be a gap for production.
5. **Accessibility / routing** — ACs do not cover hash routes or filter behavior; covered optionally in TC-007.

---

## Revalidation against AC

- **AC1 (Create a todo list):** TC-001 and TC-002 demonstrate an empty entry state and creation of the first visible list row. **Satisfied.**
- **AC2 (Add items (4)):** TC-003 adds exactly four named items with observable titles and counter **4 items left**. **Satisfied.**
- **AC3 (Finish item; expect finished):** TC-004 asserts `completed` class and counter decrease after toggle. **Satisfied.**
- **AC4 (Remove item; expect removed):** TC-005 asserts row and title **Walk dog** gone, others remain. **Satisfied.**

Every AC has at least one dedicated test case; edge and negative cases extend beyond the ACs as required.

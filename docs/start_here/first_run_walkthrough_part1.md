# First Run Walkthrough — Your First Audit-Plan-Work Cycle

> This tutorial guides you through your very first wb-flow cycle: auditing a project, creating a plan, and executing a task. By the end, you'll have a completed task with a report.

---

## Prerequisites

- [Bootstrapping](./bootstrapping_part1.md) is complete
- You have a project with `.wb/workflows/context.md`
- An AI model is available

---

## Step 1: Audit Your Project

```bash
/wbAudit packages/my-project
```

**Expected output:**

```text
[AI] Reading .wb/workflows/context.md...
[AI] Scanning source code...
[AI]
[AI] === Audit Report: my-project ===
[AI]
[AI] Findings:
[AI]   1. [HIGH] No unit tests found (0% coverage)
[AI]   2. [MEDIUM] 3 unused exports in src/utils.js
[AI]   3. [MEDIUM] Missing JSDoc on 12 public functions
[AI]   4. [LOW] package.json missing "description" field
[AI]
[AI] Score: 6/10
[AI] Writing: reports/2026/05/11/audits/audit_my-project_20260511.md
```

**What to look for:**
- **HIGH findings** are issues that should be fixed first
- The **score** tells you overall project health (10 = perfect)
- The **report file** is saved automatically for later use

---

## Step 2: Create a Plan

```bash
/wbPlan packages/my-project
```

**Expected output:**

```text
[AI] Reading audit report: audit_my-project_20260511.md
[AI] Reading context.md for project goals...
[AI]
[AI] === Plan: my-project ===
[AI]
[AI] | # | Task | P | Est. Time |
[AI] |---|---|---|---|
[AI] | 1 | Add unit tests for src/utils.js | P1 | 30 min |
[AI] | 2 | Remove 3 unused exports | P1 | 10 min |
[AI] | 3 | Add JSDoc to 12 public functions | P2 | 45 min |
[AI] | 4 | Add description to package.json | P2 | 5 min |
[AI]
[AI] Writing: reports/2026/05/11/plans/plan_my-project_20260511.md
```

**What to look for:**
- Tasks are ordered by **priority** (P1 before P2)
- Each task has a **time estimate**
- The plan is saved as a file — you can review and edit it

---

## Step 3: Execute Your First Task

```bash
/wbWork plan_my-project_20260511.md --task=1
```

**Expected output:**

```text
[AI] Task #1: "Add unit tests for src/utils.js"
[AI] Setting status: ⬜ → 🔨
[AI]
[AI] Reading src/utils.js...
[AI]   Found: 4 exported functions (add, subtract, multiply, divide)
[AI]
[AI] Creating tests/utils.test.js:
[AI]   - test: add(2, 3) = 5
[AI]   - test: subtract(5, 3) = 2
[AI]   - test: multiply(3, 4) = 12
[AI]   - test: divide(10, 2) = 5
[AI]   - test: divide(10, 0) throws Error
[AI]
[AI] Writing task report.
[AI] Setting status: 🔨 → ✅
[AI] Task #1 complete.
```

**What happened:**
- The AI read your source code
- Created a test file with appropriate test cases
- Wrote a task report documenting what it did
- Updated the plan table

---

## Step 4: Validate the Work

```bash
/wbValid plan_my-project_20260511.md --task=1
```

**Expected output:**

```text
[AI] Validating Task #1: "Add unit tests for src/utils.js"
[AI]
[AI] Checking:
[AI]   ✓ Test file exists (tests/utils.test.js)
[AI]   ✓ All 4 exports have tests
[AI]   ✓ Edge case tested (divide by zero)
[AI]
[AI] Verdict: ✅ 9/10
[AI] Rationale: Good coverage. Consider adding tests for
[AI]   non-numeric inputs.
```

🎉 **Congratulations!** You've completed your first audit → plan → work → validate cycle.

---

← [Start Here Hub](README.md) · [Home](../README.md)

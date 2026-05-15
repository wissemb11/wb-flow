# /wbValid — Examples: Single Task Validation

> These annotated transcripts demonstrate `/wbValid` in its most common use case: validating a single completed task from a plan.

---

## Example 1: Passing Validation

```text
$ /wbValid plan_wb-core_20260511.md --task=5

[AI] Loading plan: plan_wb-core_20260511.md
[AI] Task #5: "Refactor auth module to strategy pattern"
[AI] Status: ☐ Done = ✅ (AI)
[AI] Loading task report: tasks/task_5/task_5_report_wb-core_20260511.md
[AI]
[AI] Checking acceptance criteria:
[AI]   ✓ Strategy pattern implemented (AuthStrategy.js exists)
[AI]   ✓ Old auth module removed (legacyAuth.js deleted)
[AI]   ✓ Tests pass (14/14 in auth.test.js)
[AI]   ✓ No new lint warnings introduced
[AI]
[AI] Verdict: ✅ 9/10
[AI] Rationale: Clean implementation of the strategy pattern with
[AI]   proper interface segregation. Minor suggestion: add JSDoc
[AI]   annotations to the strategy interface for better DX.
[AI]
[AI] Appending validation to task report.
```

**Annotations:**
- The validator reads the task description from the plan AND the task report.
- Each acceptance criterion from the `Verify` column is checked independently.
- The rationale explains both what passed and what could improve.
- Score 9/10 = strong pass, no re-execution needed.

---

## Example 2: Failing Validation

```text
$ /wbValid plan_wb-core_20260511.md --task=6

[AI] Loading plan: plan_wb-core_20260511.md
[AI] Task #6: "Add unit tests for strategy interface"
[AI] Status: ☐ Done = ✅ (Sonnet 4.6)
[AI] Loading task report: tasks/task_6/task_6_report_wb-core_20260511.md
[AI]
[AI] Checking acceptance criteria:
[AI]   ✓ Test file exists (auth.strategy.test.js)
[AI]   ✗ Coverage: 45% (expected ≥80%)
[AI]   ✗ Edge case: null strategy not tested
[AI]   ✗ Edge case: duplicate registration not tested
[AI]
[AI] Verdict: ✅ 4/10
[AI] Rationale: Tests exist but coverage is insufficient.
[AI]   Missing edge cases for null strategy injection and
[AI]   duplicate strategy registration. Recommend re-execution.
[AI]
[AI] Appending validation to task report.
```

**Annotations:**
- Score 4/10 = below the re-execution threshold (7).
- The validator identifies specific missing test cases.
- The task is still marked ✅ Done — validation doesn't change the Done column.
- The user should re-execute: `/wbWork plan_*.md --task=6` to address the gaps.

---

## Example 3: Validation by a Different Model

```text
$ /wbValid plan_wb-core_20260511.md --task=5
# (run by AI, after Claude already validated at 9/10)

[AI] Loading plan: plan_wb-core_20260511.md
[AI] Task #5: "Refactor auth module to strategy pattern"
[AI] Previous validation: ✅ 9/10 (AI)
[AI]
[AI] Independent review:
[AI]   ✓ Strategy pattern correctly applied
[AI]   ✓ All tests passing
[AI]   ⚠️ Minor: Error messages could be more descriptive
[AI]
[AI] Verdict: ✅ 8/10
[AI] Rationale: Solid implementation. The error handling in
[AI]   AuthStrategy.register() uses generic messages. Consider
[AI]   including the strategy name in error output.
[AI]
[AI] Appending second validation to task report.
```

**Updated plan table:**

```markdown
☐ Valid:
✅ 9/10
AI

✅ 8/10
AI
```

**Annotations:**
- Multiple validators are cumulative — both scores appear.
- The second validator found a different issue than the first.
- This demonstrates the value of cross-model validation.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

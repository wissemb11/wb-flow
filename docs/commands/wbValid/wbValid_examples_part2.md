# /wbValid — Examples: Batch Validation & Edge Cases

> Part 2 covers batch validation (`--task=*`), mixed pass/fail results, and edge cases.

---

## Example 4: Batch Validation

```text
$ /wbValid plan_wb-core_20260511.md --task=*

[AI] Loading plan: plan_wb-core_20260511.md
[AI] Finding all ✅ Done tasks...
[AI]   Task #1: ✅ Done — validating...
[AI]   Task #2: ⬜ Open — skipping (not done)
[AI]   Task #3: ✅ Done — validating...
[AI]   Task #4: ⏸️ Deferred — skipping
[AI]   Task #5: ✅ Done — validating...
[AI]   Task #6: ✅ Done — validating...
[AI]   Task #7: 🚫 Cancelled — skipping
[AI]
[AI] Batch results:
```

**Summary Table:**

```markdown
| Task | Score | Verdict | Key Finding |
|---|---|---|---|
| #1 | 10/10 | ✅ Pass | Perfect implementation |
| #3 | 8/10 | ✅ Pass | Minor formatting issue |
| #5 | 9/10 | ✅ Pass | Clean, add JSDoc |
| #6 | 4/10 | ⚠️ Needs rework | Coverage too low |
```

**Annotations:**
- `--task=*` validates ALL ✅ Done tasks, skipping ⬜, ⏸️, and 🚫.
- The batch summary table gives a quick overview of quality across the plan.
- Task #6 is flagged for re-execution (score < 7).

---

## Example 5: Validating a Documentation Task

```text
$ /wbValid plan_wb-flow-docs_20260511.md --task=7.3

[AI] Loading task report for 7.3: wbHelp layers (6 files)
[AI]
[AI] Checking acceptance criteria:
[AI]   Verify: grep -rl "TO""DO" src/commands/wbHelp/ | wc -l = 0
[AI]   Running verification command...
[AI]   Result: 0 ✅
[AI]
[AI] Content review:
[AI]   ✓ Examples layer: 5 annotated scenarios
[AI]   ✓ Expert layer: router architecture documented
[AI]   ✓ Practical layer: 3 help modes explained
[AI]   ✓ All files follow H1 + blockquote + sections format
[AI]   ✓ No VuePress syntax detected
[AI]
[AI] Verdict: ✅ 9/10
[AI] Rationale: Comprehensive coverage. All 6 files are structurally
[AI]   consistent and content-complete. Minor: the expert layer could
[AI]   include a sequence diagram for the help routing flow.
```

**Annotations:**
- For documentation tasks, the validator runs the `Verify` command from the plan table.
- Content review checks structural consistency, not just existence.

---

## Example 6: Validation of an Unfinished Task

```text
$ /wbValid plan_wb-core_20260511.md --task=2

[AI] Loading plan: plan_wb-core_20260511.md
[AI] Task #2: "Implement caching layer"
[AI] Status: ☐ Done = ⬜
[AI]
[AI] ❌ Cannot validate: Task #2 is not yet complete.
[AI] Run /wbWork plan_wb-core_20260511.md --task=2 first.
```

**Annotations:**
- Validation is blocked for tasks that are ⬜ Open or 🔨 In Progress.
- This is an invalid state transition: ⬜ → ✅ Valid is not allowed.

---

## Example 7: Self-Validation Warning

```text
$ /wbValid plan_wb-core_20260511.md --task=5
# (run by AI, same model that executed the task)

[AI] ⚠️ Note: You are the same model that executed this task.
[AI] Self-validation is permitted but provides weaker assurance
[AI] than cross-model validation.
[AI]
[AI] Proceeding with validation...
[AI] Verdict: ✅ 9/10
```

**Annotations:**
- The system detects when the validator is the same model as the worker.
- It warns but does not block — self-validation is sometimes necessary.

---

## Validation Score Guide

| Score | Label | Action |
|---|---|---|
| 10 | Perfect | No changes needed |
| 8–9 | Strong pass | Minor suggestions, no re-execution |
| 7 | Marginal pass | Consider addressing feedback |
| 5–6 | Weak | Re-execution recommended |
| 1–4 | Fail | Re-execution required |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

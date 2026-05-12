# /wbWork — Examples: Re-Execution & Edge Cases

> Part 2 covers re-executing previously completed tasks, idea exploration, and edge case behaviors.

---

## Example 4: Re-Executing a Completed Task

```text
$ /wbWork plan_wb-core_20260511.md --task=6

[AI] Loading plan: plan_wb-core_20260511.md
[AI] Task #6: "Add unit tests for strategy interface"
[AI] Status: ☐ Done = ✅ (Sonnet 4.6)
[AI]
[AI] ⚠️ Task #6 is already complete. Re-executing will:
[AI]   1. Reset ☐ Done to 🔨
[AI]   2. Clear all validations from ☐ Valid
[AI]   3. Replace the previous task report
[AI]
[AI] Proceeding with re-execution...
[AI] Reading previous report for context:
[AI]   Validation feedback: "Coverage too low (45%), missing edge cases"
[AI]
[AI] Executing with improvements:
[AI]   1. Expanding test coverage to 92% (was 45%)
[AI]   2. Adding null strategy test case
[AI]   3. Adding duplicate registration test case
[AI]   4. Adding concurrent access test case
[AI]
[AI] Writing updated task report.
[AI] Updating plan table: ☐ Done = ✅ AI
```

**Annotations:**
- Re-execution reads the previous task report AND any validation feedback.
- This creates a feedback loop: Worker → Validator → Worker (improved).
- The new worker name replaces the old one (overwrite rule).
- All previous validations are cleared — the new work needs fresh validation.

---

## Example 5: Executing an Idea Exploration

```text
$ /wbWork idea_auth-service_20260511.md --idea=1

[AI] Loading idea file: idea_auth-service_20260511.md
[AI] Idea #1: "Implement distributed rate limiting" (Score: 9)
[AI]
[AI] Running feasibility study:
[AI]   - Analyzing codebase for rate limiting touchpoints...
[AI]   - Checking package.json for Redis dependencies...
[AI]   - Reviewing context.md for infrastructure constraints...
[AI]
[AI] Writing exploration report:
[AI]   ideas_reports/idea_1/idea_1_report_auth-service_20260511.md
[AI]
[AI] Updating idea table: ☐ Done = ✅ AI
```

**Annotations:**
- `/wbWork` with `--idea=N` triggers exploration mode, not execution mode.
- The output is a feasibility study, not code changes.
- The idea's Done column is updated, but no source code is modified.

---

## Example 6: Task Without a Plan (Error)

```text
$ /wbWork packages/wb-core --task=5

[AI] ❌ Error: No plan file specified.
[AI] /wbWork requires a plan file path, not a folder path.
[AI]
[AI] Usage:
[AI]   /wbWork <plan_file.md> --task=N
[AI]
[AI] To find your plan:
[AI]   ls packages/wb-core/.wb/workflows/reports/2026/05/11/plans/
```

---

## Example 7: Task That's Too Large

```text
$ /wbWork plan_wb-flow-docs_20260511.md --task=7

[AI] Loading plan: plan_wb-flow-docs_20260511.md
[AI] Task #7: "⬜ Expanded → 7.1–7.7"
[AI]
[AI] ⚠️ Task #7 is a parent task with sub-tasks.
[AI] Execute sub-tasks individually:
[AI]   /wbWork plan_*.md --task=7.1
[AI]   /wbWork plan_*.md --task=7.2
[AI]   ...
[AI]   /wbWork plan_*.md --task=7.7
```

---

## The Task Report Format

Every `/wbWork` execution produces a report:

```markdown
---
type: 🔨 Worker
emits: report
---

# Task N Report: <task description>

> **Plan:** [link to plan file]
> **Worker:** <model name>
> **Completed:** <YYYY-MM-DD HH:MM>

## What was done
(detailed description of changes)

## Files modified
| File | Change |
|---|---|
| src/auth/AuthStrategy.js | Created (new file) |
| src/auth/index.js | Modified (updated exports) |

## Verification
(output of verify command from plan)

✅ **Pass** / ❌ **Fail**
```

This format is consumed by `/wbValid` during validation.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

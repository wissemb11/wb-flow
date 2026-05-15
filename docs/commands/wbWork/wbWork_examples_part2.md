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

---

## Example 6: Error Cases

**No plan file specified:**
```text
$ /wbWork packages/wb-core --task=5
[AI] ❌ Error: No plan file specified. /wbWork requires a plan file path.
```

**Parent task (expanded):**
```text
$ /wbWork plan_*.md --task=7
[AI] ⚠️ Task #7 is expanded into sub-tasks. Execute individually:
[AI]   /wbWork plan_*.md --task=7.1
```

**Task doesn't exist:**
```text
$ /wbWork plan_*.md --task=99
[AI] ❌ Error: Task #99 not found in plan table.
```

---

## The Task Report Format

```markdown
---
type: 🔨 Worker
emits: report
---
# Task N Report: <description>
> **Plan:** [link] | **Worker:** <model> | **Completed:** <date>

## What was done
## Files modified
## Verification
✅ Pass / ❌ Fail
```

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# Practical Guide: /wbValid

## What is `/wbValid`?
`/wbValid` is the Quality Assurance (QA) counterpart to `/wbWork`. While `/wbWork` executes tasks, `/wbValid` audits that execution to ensure it matches the original plan perfectly. It casts the AI in the role of the Validator.

## How to Use It

### 1. State & Sanity Check
```bash
/wbValid plan_core2_20260503.md
```
With no execution flags (like `--id`), it acts as a status check. It reads the specific plan you linked and lists tasks that are marked `✅ Done` but are not yet `✅ Validated`. It **will not** perform validation in this mode.

### 2. Validate Specific Tasks
Use the `--id` (or `-i`) flag to target specific tasks from the plan's table.
```bash
/wbValid plan_core2_20260503.md --id=2           # Validate Task 2
/wbValid plan_core2_20260503.md --id=1,2,3       # Validate Tasks 1, 2, and 3
/wbValid plan_core2_20260503.md --id>2&&--id<=5  # Validate Tasks 3, 4, and 5 (AND logic)
/wbValid plan_core2_20260503.md --id<2||--id>5   # Validate Tasks 1, 6, 7... (OR logic)
```

### 3. Validate Everything Pending
```bash
/wbValid plan_core2_20260503.md *
```
Validates all tasks that are currently marked `✅ Done` but `⬜ Valid`.

## What Happens During Validation?
1. The AI reads the worker's execution report in `tasks/task_<ID>/`.
2. The AI inspects the codebase to see if the work actually matches what the worker *claimed* they did.
3. The AI appends its findings (PASS/FAIL) to the **bottom** of the worker's existing report.
4. If it PASSES, the AI updates the main plan file, turning `☐ Valid` into `✅<br>ModelName`.
5. If it FAILS, the AI resets the plan's `☐ Done` column to `⬜` and instructs you to run `/wbWork` again.

## Recommended Flow
`/wbValid` should be run using a high-reasoning "thinker" model (like Claude 3 Opus or Gemini 1.5 Pro). This prevents the "echo chamber" effect where a fast coding model rubber-stamps its own sloppy work.



## Scenario: Verifying Setup

After running `wbSetup`, always run `wbValid --quick` to verify everything is configured correctly. Then run `wbValid --fix` to auto-correct any common issues.

## Tips

- Run `wbValid` before filing bug reports to confirm your setup is correct
- Use `--quick` for a fast pre-flight check (skips deep validation)
- Use `--fix` for auto-correction of common issues like missing directories

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# Practical Guide: /wbWork (the agent)

## What is `/wbWork`?
`/wbWork` is the execution arm of your planning process. While `/wbPlan` maps out *what* needs to be done, `/wbWork` actually *does* it. It transforms your AI from a Strategist into a Worker.

## How to Use It

### 1. State & Sanity Check
```bash
/wbWork plan_core2_20260503.md
```
If you pass no execution flags (like `--id`), the command acts as a status check. It reads the specific plan you linked, tells you which tasks are pending (`⬜`), and ensures the plan file formatting isn't corrupted. It **will not** execute tasks in this mode.

### 2. Execute Specific Tasks
Use the `--id` (or `-i`) flag to target specific tasks from the plan's table.
```bash
/wbWork plan_core2_20260503.md --id=2 # Execute Task 2
/wbWork plan_core2_20260503.md --id=1,2,3 # Execute Tasks 1, 2, and 3
/wbWork plan_core2_20260503.md --id>2&&--id<=5 # Execute Tasks 3, 4, and 5 (AND logic)
/wbWork plan_core2_20260503.md --id<2||--id>5 # Execute Tasks 1, 6, 7... (OR logic)
/wbWork plan_core2_20260503.md --id!=2 # Execute all pending tasks EXCEPT 2
```

### 3. Execute Everything
```bash
/wbWork plan_core2_20260503.md *
```
Executes all tasks currently marked as pending (`⬜ Done`).

### 4. Inline Tasks (Auto-Triage)
Instead of planning first, you can pass an issue directly to `/wbWork`. The AI will assess its complexity, add it to today's plan, and either execute it immediately (if simple) or break it into sub-tasks first (if complex).
```bash
/wbWork packages/wb-core "Fix TypeError on submit" # Assessed as P3 -> One-shot execution
/wbWork packages/wb-core "Build new Auth System" # Assessed as P0 -> Breaks into sub-tasks, then executes
```

## What Happens During Execution?
1. The AI reads the task description from the plan.
2. The AI writes code, creates files, or runs commands to complete the task.
3. The AI generates a formal report in `tasks/task_<ID>/task_<ID>_report_<TARGET>.md`.
4. The AI updates the main plan file, turning `☐ Done` into `✅<br>ModelName`.

## Recommended Flow
Always pair `/wbWork` with a highly capable coding model (like the agent the AI agent or the AI agent). Once `/wbWork` is finished, switch to a "thinker" model (like the AI agent or the AI agent) and run `/wbValid` to verify the work.

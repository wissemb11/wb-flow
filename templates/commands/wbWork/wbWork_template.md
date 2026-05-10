# /wbWork: Execution Template

<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.

### HELP BLOCK — `/wbWork`

## The Command Forms

```
/wbWork <path_to_plan.md>               # State what work is needed
/wbWork <path_to_plan.md> *             # Execute all tasks that need work
/wbWork <path_to_plan.md> --id=1,2,3    # Execute specifically tasks 1, 2, and 3
/wbWork <path_to_plan.md> --p=P1          # Execute all tasks with P1 priority
/wbWork <path_to_plan.md> --est<=30       # Execute tasks with est. time <= 30 mins
/wbWork <path_to_plan.md> --valid=true    # Execute tasks that are already validated (re-work)
/wbWork <path_to_plan.md> --done=false    # Execute all open tasks
/wbWork <path_to_plan.md> --id=5 --open   # Set task 5 Done column to ⬜
/wbWork <path_to_plan.md> --worker=Gemini # Execute tasks assigned to Gemini
/wbWork <scope_folder> "<issue desc>"     # Inline Task: Auto-triage, add to today's plan, and execute
```

**Shorthand Pathing:** You can pass just the filename (e.g., `plan_core2_20260503.md`). The AI will infer the package (`core2`) and the date (`2026/05/03`) to construct the full path: `<pkg>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/<filename>`.

## When to run
- When you have an active `/wbPlan` and you are acting as the **Worker** model.
- Use it to mechanically execute steps directly from the plan table.

## The Output
`/wbWork` doesn't just execute code—it generates a formal task report (`tasks/task_<N>/task_<N>_report_<scope>_<YYYYMMDD>.md`) detailing what was done, and updates the `☐ Done` column to `✅` in the parent plan file.

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

| `--id`, `--p`, `--est`, etc. | `-i`, etc. | Universal Column Filtering. Targets tasks based on any column in the plan table (supports `=, >, <, !=, *, &&, ||`). |
| `--open` | `-o` | Sets `☐ Done` state to `⬜` (Open). Overrides execution. |
| `--def` | `-d` | Sets `☐ Done` state to `⏸️ Deferred`. Overrides execution. |
| `--can` | `-c` | Sets `☐ Done` state to `🚫 Cancelled`. Overrides execution. |
| `--help` | `-h` | Prints this help block. |
## Self-correct mode (dual-mode invocation)

```
/wbWork <scope_folder>           # normal mode — produce a fresh output file
/wbWork <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbWork` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)
- `-i` → `--id`
- `-o` → `--open`
- `-d` → `--def`
- `-c` → `--can`
<!-- FLAG_NORMALIZE_END -->

**ROLE:** The Worker / Executor
**TARGET:** The provided plan file (absolute path, relative path, or just the filename).
**Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md)

## ━━━ OBJECTIVE ━━━
Your job is to locate the specified plan or idea file, parse its table, determine the operating workspace, and physically execute the tasks/ideas requested by the user's flags.

## ━━━ MODE DETECTION ━━━

Read the target file's first H1 header to determine the operating mode:

- **`# Plan Backlog: <scope> — <date>`** → **PLAN MODE** (standard behavior, documented below).
- **`# Idea Backlog: <scope> — <date>`** → **IDEAS MODE** (see §IDEAS below).
- **Inline task with `idea:` prefix** (e.g., `/wbWork <scope> "idea: add CSV export"`) → **IDEA REGISTRATION MODE** (routes to idea file instead of plan file).

## ━━━ INSTRUCTIONS (PLAN MODE) ━━━

1. **Locate the Plan:** Read the target file. If only a filename is provided (e.g. `plan_core2_20260503.md`), infer the workspace and locate it at `<pkg>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/<filename>`. If an inline task is provided (`/wbWork <scope_folder> "<issue>"`), find or create today's plan file for that scope.
2. **Pre-Flight Triage (Inline Tasks):** If an issue description is provided instead of an ID:
   - **`idea:` prefix detection:** If the description starts with `idea:` or `💡`, route to **IDEA REGISTRATION MODE** (see below) instead of the plan file.
   - **Assess Complexity:** Assign a priority (P0-P3).
   - **Simple (P2/P3):** Append a row to the plan's task table (Origin: "Manual", Task: "<desc>"). Proceed to Execution Mode.
   - **Complex (P0/P1):** Append a parent row. Spawn a `/wbPlan` sub-process logically to break it into sub-tasks (e.g., `#N.1`, `#N.2`). Append the sub-plan table. Proceed to sequentially execute the sub-tasks.
3. **Parse Intent:**
   - If no flag is given (e.g., `/wbWork plan_file.md`): This is **Self-Correction / Re-check Mode**. Do NOT just output state. Actively scan the plan file and the related task reports for missing data or formatting errors. Fix them immediately.
   - If a target filter is provided WITH a state flag (`--open`, `--def`, `--can`): Do NOT execute the task. Instead, directly edit the plan file and update the `☐ Done` column of the matching tasks to the requested state.
   - If a target filter is provided WITHOUT state flags (e.g., `--id=2` or `--p=P1`): Proceed to execute those specific tasks matching the criteria.
3. **Execution Mode:**
   - Universal Column Filtering: You must apply the filter logic to any column of the table (e.g., `#`, `P`, `Est. Time (mins)`, `Worker`, `☐ Done`, `☐ Valid`).
   - Recursive Task Logic: If the filter matches a parent recursive task (e.g., `--id=5`), this implies executing ALL of its child tasks (e.g., 5.1, 5.2, 5.3, 5.4) sequentially with your current model.
   - Follow the `Task` description in the plan exactly.
   - Perform the file edits, script executions, or tool calls needed.
4. **Report Generation:**
   - For EACH task executed, create a report at: `.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/tasks/task_<ID>/task_<ID>_report_<TARGET>_<YYYYMMDD>.md`
   - Create the `task_<ID>/` folder if it does not exist.
   - Use the standard `# Task <ID>: <Title>` header format.
5. **Plan Update:**
   - Edit the original plan file. Change the `#` column to a markdown link pointing to your new task report (e.g., `[<ID>](tasks/task_<ID>/task_<ID>_report_<TARGET>_<YYYYMMDD>.md)`).
   - Change `☐ Done` to `✅<br>__YOUR_MODEL_NAME__`. **OVERWRITE rule:** The Done column is NOT cumulative. If another model's name is already there, completely overwrite it with yours. Only the final executor is tracked.

## ━━━ §IDEAS: INSTRUCTIONS (IDEAS MODE) ━━━

When the target file is an `idea_*.md` file (H1 = `# Idea Backlog:`):

1. **Locate the Idea File:** Same pathing logic as plan files, but routed to `ideas/idea_<scope>_<YYYYMMDD>.md`.
2. **Parse Intent:**
   - If no flag is given → **Self-Correction / Re-check Mode** on the idea file.
   - If a target filter is provided WITH a state flag (`--open`, `--def`, `--can`) → Update the `☐ Done` column of matching ideas.
   - If a target filter is provided WITHOUT state flags → Proceed to **Idea Exploration Mode**.
3. **Idea Exploration Mode:**
   - Read the idea description from the `Idea` column.
   - **Explore the idea in depth**: feasibility analysis, impact assessment, implementation sketch, risks, estimated cost if promoted.
   - Do NOT implement the idea. Only analyze and document.
4. **Report Generation (Ideas):**
   - For EACH idea explored, create a report at: `.wb/workflows/reports/<YYYY>/<MM>/<DD>/ideas/ideas_reports/idea_<ID>/idea_<ID>_report_<TARGET>_<YYYYMMDD>.md`
   - Create the `idea_<ID>/` folder if it does not exist.
   - Use the header format: `# Idea <ID>: <Title> — Exploration Report`
   - Include: High-Level Summary, Feasibility Analysis, Impact Assessment, Implementation Sketch, Risks & Mitigations, Estimated Cost if Promoted, Recommendation (promote / defer / reject with reasoning).
5. **Idea File Update:**
   - Change the `#` column to a link: `[<ID>](ideas_reports/idea_<ID>/idea_<ID>_report_<TARGET>_<YYYYMMDD>.md)`.
   - Change `☐ Done` to `✅<br>__YOUR_MODEL_NAME__`.

## ━━━ §IDEA_REG: IDEA REGISTRATION MODE ━━━

When an inline description starts with `idea:` or `💡` (e.g., `/wbWork <scope> "idea: add CSV export"`):

1. Strip the `idea:` or `💡` prefix to get the idea description.
2. Locate (or create) today's idea file: `<scope>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/ideas/idea_<scope>_<YYYYMMDD>.md`.
3. Compute a Score (1–10) using the scoring heuristic from `wbIdea_template.md`.
4. Append a new row to the idea table with: Score, Idea description, Priority, Est. Time, `Suggested By: Manual`, `☐ Done: ⬜`, `☐ Valid: ⬜`, `→ Task: —`.
5. Do NOT execute the idea. Output: "Idea registered as #N in idea_<scope>_<YYYYMMDD>.md."

## 🧭 What's Next?
- **Plan Mode:** End your response by telling the user to run `/wbValid <target> --id=<ID>` to formally validate the work you just completed.
- **Ideas Mode:** End your response by telling the user to run `/wbValid idea_<scope>_<YYYYMMDD>.md --id=<ID>` to validate the exploration and potentially promote the idea to a plan.
- **Idea Registration Mode:** End your response by suggesting `/wbWork idea_<scope>_<YYYYMMDD>.md --id=<N>` to explore the newly registered idea.

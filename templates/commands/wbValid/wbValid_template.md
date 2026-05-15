# /wbValid: Execution Template

<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.

### HELP BLOCK — `/wbValid`

## The Command Forms

```
/wbValid <path_to_plan.md>               # State what validation is needed
/wbValid <path_to_plan.md> *             # Validate all tasks that are Done but not Valid
/wbValid <path_to_plan.md> --id=1,2,3    # Validate specifically tasks 1, 2, and 3
/wbValid <path_to_plan.md> --p=P1          # Validate all tasks with P1 priority
/wbValid <path_to_plan.md> --done=true     # Validate tasks that are already done
/wbValid <path_to_plan.md> --worker=Gemini # Validate tasks worked on by Gemini
/wbValid <path_to_plan.md> --id=5 --open   # Set task 5 Valid column to ⬜
/wbValid <path_to_plan.md> --id=* --can    # Set all tasks Valid column to 🚫 Cancelled
```

**Shorthand Pathing:** You can pass just the filename (e.g., `plan_core2_20260503.md`). The AI will infer the package (`core2`) and the date (`2026/05/03`) to construct the full path: `<pkg>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/<filename>`.

## When to run
- After a Worker model has executed `/wbWork` and marked tasks as `✅` Done.
- Use it to act as the **Validator** model.

## The Output
`/wbValid` reads the Worker's task report, checks the codebase to ensure the work actually meets the acceptance criteria, and appends its validation findings to the bottom of the Worker's task report. It then updates the `☐ Valid` column to `✅` in the parent plan file.

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

| `--id`, `--p`, `--done`, etc. | `-i`, etc. | Universal Column Filtering. Targets tasks based on any column in the plan table (supports `=, >, <, !=, *, &&, ||`). |
| `--open` | `-o` | Sets `☐ Valid` state to `⬜` (Open). Overrides validation execution. |
| `--def` | `-d` | Sets `☐ Valid` state to `⏸️ Deferred`. Overrides validation execution. |
| `--can` | `-c` | Sets `☐ Valid` state to `🚫 Cancelled`. Overrides validation execution. |
| `--help` | `-h` | Prints this help block. |
## Self-correct mode (dual-mode invocation)

```
/wbValid <scope_folder>           # normal mode — produce a fresh output file
/wbValid <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbValid` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)
- `-i` → `--id`
- `-o` → `--open`
- `-d` → `--def`
- `-c` → `--can`
<!-- FLAG_NORMALIZE_END -->

**ROLE:** The Validator / QA
**TARGET:** The provided plan file (absolute path, relative path, or just the filename).
**Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md)

## ━━━ OBJECTIVE ━━━
Your job is to locate the specified plan or idea file, parse its table, determine the operating workspace, and physically validate the tasks/ideas requested by the user's flags.

## ━━━ MODE DETECTION ━━━

Read the target file's first H1 header to determine the operating mode:

- **`# Plan Backlog: <scope> — <date>`** → **PLAN MODE** (standard behavior, documented below).
- **`# Idea Backlog: <scope> — <date>`** → **IDEAS MODE** (see §IDEAS below).

## ━━━ INSTRUCTIONS (PLAN MODE) ━━━

1. **Locate the Plan:** Read the target file. If only a filename is provided (e.g. `plan_core2_20260503.md`), infer the workspace and locate it at `<pkg>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/<filename>`.
2. **Parse Intent:**
   - If no flag is given (e.g., `/wbValid plan_file.md`): This is **Self-Correction / Re-check Mode**. Do NOT just output state. Actively scan the plan file and the related task reports for missing data or formatting errors (e.g., missing scores out of 10, broken links, missing fields). Fix them immediately. Task reports are located at `tasks/task_<N>/task_<N>_report_<scope>_<YYYYMMDD>.md`.
   - If a target filter is provided WITH a state flag (`--open`, `--def`, `--can`): Do NOT execute validation. Instead, directly edit the plan file and update the `☐ Valid` column of the matching tasks to the requested state.
   - If a target filter is provided WITHOUT state flags (e.g., `--id=2` or `--done=true`): Proceed to validate those specific tasks matching the criteria.
3. **Validation Logic (if executing):**
   - Universal Column Filtering: You must apply the filter logic to any column of the table (e.g., `#`, `P`, `Est. Time (mins)`, `Worker`, `☐ Done`, `☐ Valid`).
   - Recursive Task Logic: If the filter matches a parent recursive task (e.g., `--id=5`), this implies validating ALL of its child tasks (e.g., 5.1, 5.2, 5.3, 5.4) sequentially with your current model.
   - Read the corresponding `tasks/task_<ID>/task_<ID>_report_*.md` report.
   - Inspect the workspace to confirm the work was done to high standards.
   - Append a `## 🔍 Validation (QA)` section to the bottom of the Worker's task report.
   - You MUST include a **Score / 10** evaluating the Worker's quality, efficiency, and adherence to constraints.
   - State clearly if it is a PASS ✅ or FAIL ❌.
4. **Update Plan:** 
   - **Cumulative Validation Rule:** The `☐ Valid` column accumulates validations (unlike the `☐ Done` column). 
   - If PASS and the column is `⬜` (empty), update it to `✅ 10/10<br><ModelName>`.
   - If PASS and the column already has a validation (e.g., `✅ 10/10<br>DeepSeek`), **APPEND** your validation below it: `...<hr>✅ <Score>/10<br><ModelName>`.
   - If FAIL, revert the `☐ Done` column back to `⬜` so the worker can try again.

## ━━━ §IDEAS: INSTRUCTIONS (IDEAS MODE) ━━━

When the target file is an `idea_*.md` file (H1 = `# Idea Backlog:`):

1. **Locate the Idea File:** Same pathing logic as plan files, but routed to `ideas/idea_<scope>_<YYYYMMDD>.md`.
2. **Parse Intent:**
   - If no flag is given → **Self-Correction / Re-check Mode** on the idea file.
   - If a target filter WITH a state flag (`--open`, `--defer`, `--reject`, `--promote`) → Update the `☐ Valid` column directly.
   - If a target filter WITHOUT state flags → Proceed to **Idea Validation Mode**.
3. **Idea Validation Mode:**
   - Read the idea exploration report (if it exists) at `ideas_reports/idea_<ID>/idea_<ID>_report_*.md`.
   - Read the idea description from the `Idea` column.
   - Analyze the idea against the codebase context, existing plans, and current priorities.
   - Append a `## 🔍 Idea Validation (QA)` section to the bottom of the idea exploration report (if it exists; otherwise append to the idea file itself as a note).
   - You MUST include a **Score / 10** and a **Verdict** from the verdict scale below.

4. **Idea Verdict Scale:**

   | Verdict | Score Range | ☐ Valid State | Meaning | Auto-Action |
   |---|---|---|---|---|
   | `🎯 Promote` | 8–10 | `🎯 Promoted <Score>/10<br>ModelName` | "This deserves to become a task" | **Triggers Promotion Protocol** (see wbIdea_template.md) |
   | `✅ Recommend` | 5–7 | `✅ <Score>/10<br>ModelName` | "Good idea, worth doing when capacity allows" | No auto-promotion |
   | `⏸️ Defer` | 3–4 | `⏸️ Deferred <Score>/10<br>ModelName` | "Interesting but not the right time" | No action |
   | `🚫 Reject` | 1–2 | `🚫 Rejected <Score>/10<br>ModelName` | "Not worth pursuing" | No action |

   The validation report MUST explain the verdict with concrete reasoning:
   - For `🎯 Promote`: "It deserves to be moved to a plan with score X because..."
   - For `✅ Recommend`: "I recommend it with score X because..."
   - For `⏸️ Defer`: "Defer because..."
   - For `🚫 Reject`: "Don't do it since..."

5. **Update Idea File:**
   - **Cumulative:** Same as plan validation. Append new validations below existing ones.
   - If verdict is `🎯 Promote`, **also execute the Promotion Protocol**:
     a. Locate (or create) today's plan file.
     b. Append the idea as a new task row (see wbIdea_template.md §PROMOTION PROTOCOL for column mapping).
     c. Update the idea file's `→ Task` column with the plan link.
   - Validation report is appended to the idea report (same pattern as task validation appended to task reports).

## 🧭 What's Next?
- **Plan Mode:** If the plan is fully validated, tell the user to run `/wbReview <target>` for a final overarching audit, or `/wbStandup <target>` to close out the session.
- **Ideas Mode:** If ideas are validated:
  - Promoted ideas → tell the user to run `/wbWork plan_<scope>_<YYYYMMDD>.md --id=<N>` to execute the promoted task.
  - Recommended ideas → suggest revisiting with `/wbIdea <target> --resume` when capacity allows.
  - Tell the user to run `/wbPlan <target> --resume` to see promoted ideas integrated into the plan.

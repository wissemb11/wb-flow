# /wbWork — Expert Guide ()

Welcome to the advanced execution layer! As a monorepo architect, `/wbWork` is the engine that drives your CI/CD and automated development loops. Understanding its internal parsers and edge cases ensures a flawless automation pipeline.

## 🧠 The Deterministic Target Parser

Unlike fuzzy conversational AI, `/wbWork` relies on a strict, deterministic parser for its target resolution. 
- **The `--id` Flag is Immutable:** The system does not guess what task you want to do based on conversational context. If you pass `--id>5`, it will mechanically query the plan table, isolate rows 6, 7, 8, etc., and iterate through them.
- **Dependency Awareness:** `/wbWork` (when coupled with advanced templates) respects the `Dep` (Dependency) column in the plan table. If you instruct it to execute `--id=3`, but Task 3 relies on Task 1, a properly configured agent will halt and request completion of the prerequisite.

## 📝 The Report Generation Protocol

Execution isn't just about code manipulation; it's about traceability. 
When `/wbWork` executes a task, it doesn't just silently update the source files. It is mandated by `.wb/commands/_shared/output_conventions.md` to generate a dedicated task report:
`tasks/task_<ID>/task_<ID>_report_<DATE>.md`

This report is vital for the `/wbValid` command to perform its checks. The plan table's `#` column is rewritten into a physical hyperlink pointing to this report. If the worker model fails to generate this file, the validator model will instantly reject the task.

## 🛑 Failure Modes & Self-Correction

Be aware of the "Silent Overwrite" failure mode. If multiple models are running `/wbWork` simultaneously on the same plan file (without proper locking mechanisms), race conditions can occur during the table update phase. 

The of the `/wbWork` template strongly advocates for a single-threaded execution queue per plan file. If a task fails or drifts out of scope, use the `--open` flag to mechanically reset the state rather than relying on natural language prompts to "undo" the work. Mechanical flags are deterministic; natural language is probabilistic.

## 🎛️ Universal Column Filtering & Recursive Parent Logic

As of the v5.1 protocol update, the `--id` flag has been expanded into **Universal Column Filtering**. You can now target tasks using ANY column in the plan table (e.g., `--est<=30`, `--p=P1`, `--worker=the agent`, `--done=false`). This allows for dynamic, highly specific execution queues based on metadata rather than static task numbers.

Additionally, **Recursive Parent Logic** fundamentally changes how nested tasks are handled. When `/wbWork` targets a parent task ID (e.g., `--id=5`) that has been expanded into children (`5.1`, `5.2`, `5.3`), the system will sequentially execute ALL child tasks under that parent in a single workflow. The parent task's `☐ Done` column remains unchecked but retains the expansion hint (e.g., `⬜ Expanded → 5.1, 5.2, 5.3`) until every last child task is fully executed.

## ⚖️ Auto-Triage & Dynamic Decomposition (Inline Tasks)

While `/wbWork` is traditionally a strict executor, passing a manual string (e.g., `/wbWork core2/ "Implement OAuth"`) activates its **Pre-Flight Triage** engine. It assesses the complexity (P0-P3).
- **Simple (P2/P3):** It dynamically injects a single row into today's `plan_*.md` file and executes it.
- **Complex (P0/P1):** It recognizes the context-window risk, injects a parent row, and dynamically invokes `/wbPlan` logic to recursively decompose the issue into sub-tasks (`#N.1, #N.2`) *before* executing them sequentially. This ensures complex tasks are broken down automatically without user intervention.

What `wb-flow-docs`'s playbook gets wrong about `/wbWork`: framing it as task execution only, when the Claude edition's Pre-Flight Triage mode (inline text to auto-plan to execute) collapses the plan-then-execute two-step into one invocation. Under-documented in both editions but the command's most powerful mode.

## One-paragraph verdict

The execution backbone of the `/wb*` system — this is the command that actually changes files. The Pre-Flight Triage inline-task mode is under-documented and under-used, but it's where the command's real power lies: it collapses the plan-then-execute two-step into a single invocation. The main risk is the `--id=*` wildcard, which can queue up 17+ tasks in one shot and exhaust the context window before reaching the last one. Weakest in parallel execution — tasks are run sequentially even when they're architecturally independent. Use `--id=*` with caution; prefer targeted `--id=` ranges for complex plans.

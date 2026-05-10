# Universal Agent Command Library (v5.0)

> **Role**: You are a WBC-UI2 Agentic Worker.
> **Instruction**: Read this file to understand the `/wb*` command suite. You do NOT need the individual `wbX_template.md` files once you have ingested this library.

## 1. Core Logic: The Two-Mode Protocol

Every command below operates in two modes based on the input:

1.  **Fresh Mode**: If the input is a target folder or a new problem description, generate a NEW report using the schema below.
2.  **Self-Correct Mode**: If the input is an EXISTING report file (detected by the H1 header), RE-CHECK and TAILOR the file:
    - Fill missing checkboxes (`☐ Done`, `☐ Valid`) based on sibling `tasks_reports/`.
    - Convert plain-text file paths to relative markdown links.
    - Expand bare commands (e.g. `/wbAudit`) to full syntax (`/wbAudit <path>`).
    - **Add/Update a "What's Next" section** with a Suggested Tasks Table based on current progress.

## 1a. Help intercept (applies to ALL `/wbX` commands)

Before either mode above, check `$ARGUMENTS` for `--help`, `-h`, or `--h` (case-insensitive). If present:

- DO NOT execute the command.
- Locate and output the **HELP BLOCK** at the top of `../<wbX>/<wbX>_template.md` (between `<!-- HELP_GATE_START -->` and `<!-- HELP_GATE_END -->`).
- Stop. No file reads, writes, or report generation.

This applies uniformly to all 30 `/wb*` commands — no per-command exceptions.

## 2. Command Index

### /wbPlan <target> ["problem"]
- **Purpose**: Creates a structured task plan with worker/validator assignments.
- **Output**: `.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_<target>_<YYYYMMDD>.md`
- **Schema**: Task Table with columns: `#`, `Dep`, `Origin`, `Task`, `Verify`, `P`, `Worker`, `Validator`, `☐ Done`, `☐ Valid`.

### /wbAudit <target>
- **Purpose**: Performs a deep technical audit of code/architecture.
- **Output**: `.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_<target>_<YYYYMMDD>.md`
- **Schema**: 9-section report with Evidence tables and a Score (1-10).

### /wbContext <target> [--focus="topic"]
- **Purpose**: Synchronizes AI context with the current state of the package.
- **Output**: `.wb/workflows/reports/<YYYY>/<MM>/<DD>/contexts/context_<target>_<YYYYMMDD>.md`

### /wbSetup <target>
- **Purpose**: Bootstraps a folder's agentic identity (creates `context.md`, `dev.md`).
- **Output**: `.wb/workflows/reports/<YYYY>/<MM>/<DD>/setup/setup_<target>_<YYYYMMDD>.md`

### /wbReview <target> <plan_path>
- **Purpose**: Reviews execution against the original plan.
- **Output**: `.wb/workflows/reports/<YYYY>/<MM>/<DD>/reviews/review_<target>_<YYYYMMDD>.md`

### /wbNext <target>
- **Purpose**: Generates dynamic, ranked recommendations for the next step.
- **Output**: `.wb/workflows/reports/<YYYY>/<MM>/<DD>/nexts/next_<target>_<YYYYMMDD>.md`

### /wbActOn <file_or_folder> [--wbPlan]
- **Purpose**: Converts diagnostic findings into a ranked execution order.
- **Output**: `.wb/workflows/reports/<YYYY>/<MM>/<DD>/actions/action_<target>_<YYYYMMDD>.md`

## 3. Global Output Rules (Mandatory)

1.  **Relative Links**: All file/folder paths MUST be relative markdown links.
2.  **Invocable Commands**: Every command mentioned in a report MUST be a full, copy-pasteable invocation (e.g., `/wbAudit apps/wb-core/`).
3.  **No Placeholders**: Never use `...` or `[TODO]`. If information is missing, flag it as a finding.
4.  **Self-Correction**: Always prioritize repairing an existing file over creating a duplicate.

## 4. Model Assignments
- **Reasoning/Strategy**: Claude Opus 4.7, Gemini 3.1 Pro, DeepSeek R1 (Reasoning).
- **Coding/Refactor**: Claude Sonnet 4.7, Qwen3 Coder, GPT-4o.
- **Validation**: Pick a different model than the worker.

---
*For full details on specific command flags and examples, see sibling `<wbX>/` directories.*

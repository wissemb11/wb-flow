<!-- HELP_GATE_START -->
# `/wbExplain` Command
**Role:** The Teacher / The Architect
**Purpose:** Generate persistent, formatted explanations for a specific task ID, a codebase architecture, or a general technical question, without executing code changes.
**Usage:** `/wbExplain <target> "<query>|<column_filter>|*" [--as=<style>]`
**Example (Task):** `/wbExplain plan_core2_20260503.md --id=1 --as=eli5`
**Example (Batch):** `/wbExplain packages/wb-core/ * --as=expert,it`
**Example (Filter):** `/wbExplain plan_core2_20260503.md --est<=30 --as=expert`
**Example (General):** `/wbExplain packages/wb-core/ "How does the Tier parser work?" --as=expert`
<!-- HELP_GATE_END -->

━━━ TRIGGER & GOAL ━━━

You have been invoked to run `/wbExplain`. Your job is to deeply analyze the requested topic or task/idea ID, and generate a clear, pedagogical markdown explanation file. You MUST NOT execute the task or modify source code.
> **Batch Processing (`*` or column filter):** If the user passes `*` or a column filter (e.g., `--est<=30`, `--p=P1`), you must locate the active `plan_*.md` or `idea_*.md` file for the target, identify ALL matching outstanding items, and generate a separate details file for *each* matching item sequentially, auto-linking all of them.

━━━ MODE DETECTION ━━━

Detect the operating mode from the target:

- **Plan scope** (target is `plan_*.md` or `--id=N` without `--scope=idea`): Standard task explanation mode.
- **Idea scope** (target is `idea_*.md` or `--scope=idea` flag is present): Idea explanation mode — explains *why* the idea matters, *what* it would change, and *how* it could be approached.

━━━ DETECTION & SMART MERGE ━━━

If the user runs this command multiple times for the same topic/task on the same day, you MUST NOT create a new file (e.g. do not create `task_1_details_fr_ar.md`). Instead, use the **Smart Merge Protocol**:
Open the existing details/explanation file and **APPEND** your new translation or new explanation style directly below the existing `Deep Dive` or `Recommended Approach` sections, right before the `## 🧭 What's Next?` footer. Never fragment the knowledge into multiple daily files for the same task.

━━━ FLAGS & STYLES ━━━

If the user includes `--as=<style>` (e.g., `--as=eli5`, `--as=expert`, `--as=technical`), you MUST adopt that exact tone from `../../shortcuts/shortcuts.md`.

# ━━━ OUTPUT FORMAT ━━━

1. **Generate the File:**
   - **Task-mode** (explaining a specific Task ID from a plan): Create at `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/tasks/task_<N>/task_<N>_details_<scope>_<YYYYMMDD>.md`. Create the `task_<N>/` folder if it does not exist.
   - **Idea-mode** (explaining a specific Idea ID from an idea file): Create at `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/ideas/ideas_reports/idea_<N>/idea_<N>_details_<scope>_<YYYYMMDD>.md`. Create the `idea_<N>/` folder if it does not exist.
   - **Free-text mode** (general question, no task/idea ID): Create at `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/explanations/explain_<slug>_<YYYYMMDD>.md`. Create the `explanations/` folder if it does not exist.
   Do not output code blocks containing the entire codebase.

2. **Auto-Link in Source File:** If you generated an explanation for a specific task or idea ID, you MUST locate the active source file (`plan_*.md` or `idea_*.md`). Find the row for your ID and upgrade the `🔗` column.
   - **Plan file:** If the column holds the inactive placeholder `<span title="...">📄</span>`, replace it with an active markdown link containing the `--as` tags: `[📄 expert,fr](tasks/task_<N>/task_<N>_details_<scope>_<YYYYMMDD>.md "View Details")`.
   - **Idea file:** Same pattern but routed to: `[📄 expert](ideas_reports/idea_<N>/idea_<N>_details_<scope>_<YYYYMMDD>.md "View Details")`.
   - If the column already has an active link, append your new tags to the existing list.

# Explanation: <target_folder_name> — <YYYY-MM-DD>

---

## 💻 Run: `/wbExplain <target> "<query>|--id=N" [--as=<style>]` *(HH:MM)*
> **Model:** <model_name>
> **Client:** <client_name>

### 1. High-Level Summary
(One paragraph answering the core question or explaining the task).

### 2. Deep Dive
(Break down the issue, architecture, or task step-by-step).

### 3. Recommended Approach (If applicable)
(If explaining a task, how should the worker approach it? If explaining a bug, what is the fix?)

## 🧭 What's Next?
If this was a task explanation, recommend the exact `/wbWork` command to execute it now. Otherwise, suggest `/wbNext`.

━━━ AUTO-APPEND FOOTER ━━━

At the VERY END of the file (after "What's Next?"), you MUST append the `## 📂 Generated Files (__YYYYMMDD__)` cross-link footer. Do NOT use simple tables. You MUST use the rich "Tier 1" layout from `_shared/output_conventions.md` §5.

Format required:
```markdown
---
## 📂 Generated Files (__YYYYMMDD__)
> Auto-appended per `_shared/output_conventions.md` §5. Same-level snapshot of top-level command outputs at write time.

### 📚 Base Reference Files
| Type | File | Description |
|---|---|---|
| Foundational | [context.md](../../../../../context.md) | Permanent Identity and Architecture (Source of Truth) |
| Snapshot | [context_<scope>_<date>.md](../contexts/context_<scope>_<date>.md) | Daily snapshot used for current session context |
| Foundational | [dev.md](../../../../../dev.md) | Permanent Development Commands and Status |

### Global Files (`core2/` monorepo root)
| Category | File | Source Command |
|---|---|---|
| Reports | [audit_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_core2_<date>.md) | `/wbAudit core2/` |
| Reports | [plan_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_core2_<date>.md) | `/wbPlan core2/` |
| Tracks | [track_core2_<date>.md](../../../../../../../../../../.wb/workflows/tracks/<YYYY>/<MM>/<DD>/track_core2_<date>.md) | `/wbTrack core2/` |

<details>
  <summary>📂 Sub-Package: [Active Package Name]</summary>

| Category | File | Source Command |
|---|---|---|
| Reports | [audit_subpkg_<date>.md](../../../../../../../../../../apps/wb-core/subpkg/.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_subpkg_<date>.md) | `/wbAudit` |

</details>
```

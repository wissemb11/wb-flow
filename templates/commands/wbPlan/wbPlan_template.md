# wbPlan Template v5.2 — Unified Backlog (Cost-Aware)


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbPlan`

## When to reach for /wbPlan

| Situation | Use /wbPlan? |
|---|---|
| "Fix the padding on this button" | No — one sentence |
| "Add a CSV export button" | Maybe — borderline, 3-4 tasks |
| "Migrate wb-core to structural array handling" | Yes — multi-step, architectural |
| "Debug this crash in WBDataViewer" | Yes, but plan starts with `reproduce` task |
| "Clean up this package" | No — that's `/wbClean` |
| "Refactor this file" | Maybe — if > 1 file affected |

Rule of thumb: if the work will span multiple sessions, you want a plan. If it fits in one session, just describe the work.

## The three forms

```
/wbPlan <pkg>                              # AI infers the task from context
/wbPlan <pkg> --task="<description>"       # explicit task framing (recommended)
/wbPlan <pkg> --resume                     # read existing open plan, continue
/wbPlan <pkg> --id=1 --open                # Set task 1 Done AND Valid columns to ⬜
/wbPlan <pkg> --id=1,2 --def               # Set tasks 1,2 Done AND Valid columns to ⏸️ Deferred
/wbPlan <pkg> --worker=Gemini --can        # Set all tasks assigned to Gemini to 🚫 Cancelled
```

## Reading a plan file

Every plan has a table. Three columns matter most:

- **Details** — must be specific enough that another session could execute without asking questions.
- **Validator** — who verifies the task is done. If empty, the plan is weak.
- **Done / Valid** — checkboxes. The state machine.

Skim these before executing. If the details are vague, the plan is bad; fix it before running anything.

## Resuming a plan

```
/wbPlan <pkg> --resume
```

The AI reads the existing plan file, sees which rows are ✅ / ⬜ / 🔨, and tells you which task is next. If a row is 🔨 (in progress) and stale (> 12h old), the AI will ask: "verify this task's actual state before proceeding." Don't skip that check — state rot happens.

## When /wbPlan refuses to write a plan

This is correct behavior, not a bug. `/wbPlan` refuses when:

- Your `dev.md` contains a rule like "confirm decision X before extending" and the task would require extending.
- The task contradicts an existing open decision in `context.md`.
- The task is too vague to decompose ("make it better", "improve performance").

When refused, answer the question the AI asks. Don't work around it.

## The one mistake to avoid

**Generating a plan and then ignoring the validator column.** Without independent validation, the plan degrades to a TODO list. The whole point of the worker/validator split is that a second pass catches what the first misses. Use a different model for validation when possible; use the same model with an adversarial prompt when not.

## When /wbPlan is the wrong command

- You want to *do* the work → describe the task, skip the plan.
- You want to *know* if the code is good → `/wbAudit`.
- You want to *find* why something's broken → `/wbDebug`.
- You want to *brainstorm* features → `/wbVision`.

`/wbPlan` answers one question: *"Given this goal, what are the steps?"* Not "is this goal worth it?" (that's `/wbVision`) and not "is this work done correctly?" (that's `/wbAudit`).

> For deeper reading: [`docs_claude/commands/wbPlan/wbPlan_practical_claude.md`](../../docs/docs_claude/commands/wbPlan/wbPlan_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--resume` | `-r` |
| `--scope` | `-s` |
| `--task` | `-t` |
| `--id` | `-i` | Specifies task indices to target for state manipulation. |
| `--open` | `-o` | Sets BOTH `☐ Done` and `☐ Valid` states to `⬜` (Open). |
| `--def` | `-d` | Sets BOTH `☐ Done` and `☐ Valid` states to `⏸️ Deferred`. |
| `--can` | `-c` | Sets BOTH `☐ Done` and `☐ Valid` states to `🚫 Cancelled`. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbPlan <scope_folder>           # normal mode — produce a fresh output file
/wbPlan <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbPlan` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-r` → `--resume`
- `-s` → `--scope`
- `-t` → `--task`
- `-i` → `--id`
- `-o` → `--open`
- `-d` → `--def`
- `-c` → `--can`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



> **How to use**: Copy the prompt below, replace `__PLACEHOLDERS__`, paste to any AI agent.
> Everyone gets the SAME prompt. Each agent finds their alias and does only their tasks.
> **Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to every cell of the output, including **§9 Action Type Tagging**: declare `type:` + `emits:` in YAML front-matter (`emits: mixed` is normal for plans), add a plain-text `Requires` column to the Suggested Tasks table — each task row carries a 🧠/✅/🔨/📋 tag right after its ID — and include a `## 🔗 Action Types` legend before the Generated Files footer.

---

## Filename & Folder Convention (v3)

**Path:** `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_<target>_<YYYYMMDD>.md`

**STRICT NAMING RULE:** The plan filename MUST be exactly `plan_<folder_scope>_<YYYYMMDD>.md`. Do NOT append issue names, source types, or any other suffixes (e.g., `plan_ai_reference_links_20260506.md` is WRONG — the correct name is `plan_ai_reference_20260506.md`).

**ONE FILE PER DAY rule:** There must be exactly ONE plan file per day per folder scope. All tasks — regardless of origin (audit, manual, vision, etc.) — go into the same file as separate Entry #N sections or rows in the same task table.

**MERGE-OR-CREATE protocol:**
1. If `plan_<folder>_<YYYYMMDD>.md` already exists → APPEND your tasks as a new Entry #N section (tagged `*(ModelName — HH:MM)*`).
2. If it does not exist → CREATE it.
3. If multiple `plan_*<YYYYMMDD>*.md` files exist for the same day (e.g., from a prior bug that created suffixed files) → MERGE them into one `plan_<folder>_<YYYYMMDD>.md`, combining all task tables.

---

## Detection (Self-Correct Mode)

Trigger self-correct when the input file's first H1 matches:
`# Plan Backlog: <scope> — <YYYY-MM-DD>`

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.
Plan-specific gap-fills:
- Blank `☐ Done` for a task whose `tasks/task_<N>/task_<N>_report_*.md` exists → check it (`✅<br><worker>`).
- Blank `☐ Valid` for a task whose worker report has a validator score appended → fill `✅ <Score>/10<br><validator>`.
- Bare `Origin: /wbAudit` → expand to `/wbAudit <target>` per output_conventions.md §2.
- Plain-text mentions (`tasks/`, audit filenames, target folders) → convert to relative markdown links per §1.
- Missing `Worker (Suggested)` / `Validator (Suggested)` cells → fill from [`../model_recommendations.md`](../model_recommendations.md).
- **Column completeness — verify ALL required columns are present** (see Column Rules above): `#`, `Requires`, `Dep`, `🔗`, `Task`, `Verify`, `P`, `Est. Time (mins)`, `Worker (Suggested)`, `Validator (Suggested)`, `☐ Done`, `☐ Valid`. If any column is missing — most commonly **`Requires`** in plans written before v5.2 — insert it in the canonical position and back-fill every row by inferring the tag (🧠 Planner / ✅ Validator / 🔨 Worker / 📋 Mechanical) from the task's wording (e.g. `/wbPlan …` body → 🧠 Planner; refactor / fix / convert → 🔨 Worker; audit / verify / score → ✅ Validator; "run command and capture …" → 📋 Mechanical).
- **Legend section check:** if `## 🔗 Action Types` legend is absent, append it just before the Generated Files footer (template in `_shared/output_conventions.md` §9.3).
- **Link beautification (per `_shared/output_conventions.md` §1.1):** walk EVERY markdown link in the file — front-matter, `> **Source:**` / `> **Target:**` / `> **Mode:**` callouts, prose, table cells, footer rows, "What's Next?" bullets, the lot. Apply the **four-rule detection**:
  1. `[label](href)` where **label == href** → rewrite. (e.g. `[../../05/09/plans/plan_X.md](../../05/09/plans/plan_X.md)`).
  2. Label **contains a `/`** other than a single trailing slash → rewrite. (e.g. `[../audits/audit_X.md](...)`, `[plans/plan_X.md](...)`).
  3. Label contains `..`, `…`, or starts with `./` → rewrite.
  4. Label is absolute (starts with `/` or a drive letter) → rewrite.

  **The rewrite:** keep the href intact, replace the label with the **basename of the href** (last `/`-separated segment for files; second-to-last + `/` for folders). Examples:
  - `[../../05/09/plans/plan_wb-flow_20260509.md](../../05/09/plans/plan_wb-flow_20260509.md)` → `[plan_wb-flow_20260509.md](../../05/09/plans/plan_wb-flow_20260509.md)`
  - `[…/…/05/09/plans/plan_wb-flow_20260509.md](../../../../05/09/plans/plan_wb-flow_20260509.md)` → `[plan_wb-flow_20260509.md](../../../../05/09/plans/plan_wb-flow_20260509.md)`
  - `[apps/wb-core/md.wbc-ui.com/](../../../../../)` → `[md.wbc-ui.com/](../../../../../)`

  This is non-optional and must be done on every self-correct pass — even if the file otherwise looks clean. Plans written before v5.2 frequently have label==href links in the `Source:` callout; those are the most common offenders.
- **Path correctness (per `_shared/output_conventions.md` §1.2):** every cross-day or cross-category link in a plan file maps to a fixed pattern (the report tree has a fixed depth). For each such link, look up the **canonical href** in §1.2's table and verify the file's href matches. The most-frequent break is **prev-day plan/audit links across a month boundary**: `../../<DD>/plans/...` is wrong when the previous day was in a different month — the correct form is `../../../<MM-prev>/<DD>/plans/...`. Other recurring shapes:
  - Same-day audit from this plan: `../audits/audit_<scope>_<YYYYMMDD>.md`.
  - Yesterday's plan (same month): `../../<DD-prev>/plans/plan_<scope>_<YYYYMMDD-prev>.md`.
  - Yesterday's plan (across month): `../../../<MM-prev>/<DD-prev>/plans/plan_<scope>_<YYYYMMDD-prev>.md`.
  - Scope root (`package.json`, `context.md`, `dev.md`): `../../../../../<file>`.

  **Do not count `../` segments by hand.** If the link's target is a report file or a scope-root file, derive the href from the §1.2 table. If the existing href doesn't match the canonical form, rewrite it.

---

## 🚀 The Planning Prompt (copy from here ↓)

```
━━━━━━━━━━━━━ /wbPlan v5.2 ━━━━━━━━━━━━━

📁 PROJECT: __PROJECT_NAME__
📅 DATE: __TODAY__
🤖 MODEL: __YOUR_MODEL_NAME__
🖥️ CLIENT: __YOUR_CLIENT__
📂 PLAN FILE: __TARGET_FOLDER__/.wb/workflows/reports/__YYYY__/__MM__/__DD__/plans/plan___TARGET_NAME_____YYYYMMDD__.md

━━━ CONTEXT ━━━

Read the `.wb/workflows/context.md` file in the target folder(s) FIRST.
Check `../model_recommendations.md` for role assignments.
Read `../_shared/output_conventions.md` — your output MUST follow it.

━━━ INPUT MODE DETECTION ━━━

If the input is a file matching the plan-output schema (first H1 = "# Plan Backlog: <scope> — <date>"):
  - If target IDs and state flags (`--open`, `--def`, `--can`) are provided:
    → **STATE OVERRIDE MODE**: Directly edit the plan file. For the matching tasks, set BOTH `☐ Done` and `☐ Valid` columns to the requested state (`⬜` for `--open`, `⏸️ Deferred` for `--def`, `🚫 Cancelled` for `--can`). Do NOT generate a new plan. Evaluate multiple flags left-to-right (the last one wins).
  - Else:
    → **SELF-CORRECT MODE** (see _shared/output_conventions.md §3).
Else:
  → **FRESH-PLAN MODE** (proceed with the prompt below).

━━━ THE PROBLEM ━━━

"""
__YOUR_MESSY_DESCRIPTION_HERE__
"""

━━━ TASK LIST (v5.2 — Multi-Model, Recursive, Cost-Aware, Action-Tagged) ━━━

| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [1](tasks/task_1/task_1_report_...) | 🔨 Worker | — | <span title="Run: /wbExplain --id=1 --as=expert">📄</span> | Fix prop types | `/wbTest packages/wb-press2 --scope=task-1` | P1 | 15 | Sonnet 4.7 · ~$0.03 / DS V4 Pro · ~$0.02 / Model1 | Opus 4.7 / Gemini 3.1 Pro / Validator1 | ✅<br>Model1 | ⬜ |
| 2 | 🧠 Planner | 1 | <span title="Run: /wbExplain --id=2 --as=expert">📄</span> | `/wbPlan packages/wb-core "extract WBC.js helpers"` | `/wbAudit packages/wb-core` | P1 | 30 | 🔄 Recursive · ~20kt | — | ⬜ | ⬜ |

**Column Rules:**
1. **# (Task Index)**: When a task is completed (Done = ✅), this index MUST become a markdown link to the worker's task report in its nested folder (e.g. `[1](tasks/task_1/task_1_report_<scope>_<YYYYMMDD>.md)`). A checked "Done" checkbox means the worker has written their action report.
2. **Requires (Action Type)**: Plain-text tag indicating which canonical role would carry the task out — one of `🧠 Planner` / `✅ Validator` / `🔨 Worker` / `📋 Mechanical`. Per `_shared/output_conventions.md` §9.3 this column is mandatory for every plan; the file MUST also include a `## 🔗 Action Types` legend section just before the Generated Files footer. Tag selection rule: pick the role *the task itself requires* — not the worker's flexibility. A task whose body is `/wbPlan <target> "..."` (recursive sub-plan) is `🧠 Planner`; a code edit / refactor is `🔨 Worker`; a verification / scoring task is `✅ Validator`; a "run command and capture output" task is `📋 Mechanical`. Hybrid tasks ("investigate, then fix") MUST be split into two rows.
3. **🔗 (Details / Blueprint)**: This column holds the Contextual Lazy Loading trigger for task explanations. By default, it is an inactive placeholder: `<span title="Run: /wbExplain --id=<N> --as=expert">📄</span>`. If an explanation file has been generated (`tasks/task_<N>/task_<N>_details_<scope>_<YYYYMMDD>.md`), upgrade it to an active link: `[📄](tasks/task_<N>/task_<N>_details_<scope>_<YYYYMMDD>.md "View Details")`.
4. **Task**: Describe the task clearly. Do NOT include the explanation span here. For recursive sub-plans, the Task cell holds the full `/wbPlan <target> "goal"` invocation.
5. **Verify**: MUST contain a full invocable command per _shared/output_conventions.md §2. Bare commands like `/wbAudit` are forbidden.
6. **Worker (Suggested)**: List of 3-4 recommended models + a generic alias `Model<N>`. Each model MUST include a per-task cost annotation: `ModelName · ~$X.XX`. See Rule #11 for how to compute the cost.
7. **Validator (Suggested)**: List of 2-3 recommended "Big Thinker" models + a generic alias `Validator<N>`.
8. **☐ Done**: When completed, mark as `✅<br>ModelName`. This adds the name of the worker below the checkbox. **OVERWRITE rule:** The Done column is NOT cumulative. If it was already completed by another model, overwrite it completely with your name. Only one worker can be the ultimate executor.
9. **☐ Valid**: When validated, mark as `✅ <Score>/10<br>ValidatorName`. A task can have MULTIPLE validators. If it is already validated by someone else, append your score: `<br><br>✅ <Score>/10<br>YourName`. **Skip validation** if your name is already listed (the task hasn't changed).
10. **Recursive Tasks**: If a task is complex, use `/wbPlan <target> "goal"` as the Task. The output will be appended to this file as a sub-plan.
11. **Cost Annotation (Worker column)**: Each suggested worker MUST show an estimated execution cost. To compute:
    1. Estimate the task's token consumption (combined input+output, in thousands = `kt`) using the heuristic:

        | Complexity | Time (min) | Tokens (kt) | Examples |
        |---|---|---|---|
        | Trivial | 5–10 | 2–5 | Config tweak, 1-line fix, rename |
        | Small | 10–20 | 5–15 | Single-file edit, add export, update docs |
        | Medium | 20–45 | 15–40 | Multi-file feature, bug fix with tests |
        | Large | 45–90 | 40–80 | Architectural change, cross-package refactor |
        | Recursive | 90+ | 80–200+ | Sub-plan with its own task decomposition |

    2. Multiply `kt` by each model's blended rate (per 1kt, approximate 2026): fast models (Sonnet, Flash, DS) ~$0.004/kt · big thinkers (Opus, Gemini Pro) ~$0.015/kt.
    3. Format: `ModelName · ~$<cost>`. Example for a Medium task (~20kt): `Sonnet 4.7 · ~$0.08 / Opus 4.7 · ~$0.30 / Model1`.

━━━ SOURCE LINKING ━━━

When this plan was created from another command's output (e.g. an audit), the header MUST include a relative markdown link to that source file. Example:

> ## 🔍 Audit Findings — /wbAudit *(Gemini 3.1 Pro — 06:37)*
> - **Source:** [audit_md.wbc-ui.com_20260501.md](../audits/audit_md.wbc-ui.com_20260501.md) Entry #1
> - **Origin Command:** `/wbAudit md.wbc-ui.com/`
> - **Findings sent:** 4 (4 atomic, 0 recursive)

Compute the relative path FROM the plan file's directory. See _shared/output_conventions.md §1.

━━━ TARGET LINKING ━━━

The `> **Target:**` header line MUST be a relative markdown link to the target folder. Example:

> # Plan Backlog: md.wbc-ui.com — 2026-05-01
> > **Target:** [apps/wb-core/md.wbc-ui.com/](../../../../)

━━━ NOTE BLOCKS ━━━

Plain-text references in callouts MUST be relative links. Example:

> [!NOTE]
> All task reports must be externalized to [tasks/](tasks/).

━━━ DEPENDENCY RULES (DAG) ━━━

1. **Explicit Blocking**: A task is ONLY blocked by the specific IDs listed in its **Dep** column.
2. **Multiple Dependencies**: If a task lists `2, 5`, it MUST wait until BOTH 2 and 5 are `✅ Done`.
3. **Siblings**: Tasks sharing a parent are parallel unless explicitly linked.

━━━ RECURSIVE SUB-PLANS ━━━

If a task is a `/wbPlan` command (e.g. Task #2):
1. Execute the command.
2. APPEND the output to THIS file as a new section: `## 🔄 Sub-plan for Task #N`.
3. Use hierarchical task numbers: `N.1`, `N.2`, `N.3`.
4. The parent task's `☐ Done` column MUST REMAIN unchecked, but add the expansion hint: `⬜ Expanded → N.1, N.2, ...`.
5. A recursive parent task is ONLY marked as `✅ Done` when ALL of its sub-tasks (N.1, N.2, etc.) are completed.
6. Executing (or validating) a parent task ID with a specific model is equivalent to executing (or validating) all of its children in one command by the same model.

━━━ BUDGET SUMMARY (append after task table) ━━━

After the task table, append a budget summary block:

> ### 💰 Plan Budget Estimate
> | Metric | Value |
> |---|---|
> | **Total tasks** | N |
> | **Total estimated time** | X min (~Y h) |
> | **Total estimated tokens** | Zk tokens |
> | **Est. cost (fast model worker)** | ~$A |
> | **Est. cost (big thinker worker)** | ~$B |
>
> *Token estimates are approximate. Actual usage varies with context window size, code complexity, and iteration count. Validation passes add ~30% to the worker token count.*

Compute `A` and `B` by summing each task's `kt` × the model-tier rate from the heuristic table in Column Rule #10.

━━━ ASSIGNMENT MATRIX ━━━

Identify yourself and claim an alias:
- "I am Model<N>" (e.g. Model1, Model2...)
- "I am Validator<N>" (e.g. Validator1, Validator2...)

━━━ REPORTING RULES ━━━

1. DO NOT append your work/validation report to THIS plan file.
2. **Workers**: Save your execution report as a NEW file at: `tasks/task_<N>/task_<N>_report_<scope>_<YYYYMMDD>.md`. Create the `task_<N>/` folder if it does not exist.
3. **Validators**: DO NOT create a new validation file. You must APPEND your validation findings and score to the bottom of the EXISTING task report file created by the worker.
4. Update the Plan Table to check off the Done/Valid boxes.

━━━ TASK RE-EXECUTION (RESET) ━━━

If you are instructed to execute a task that was ALREADY marked as Done or Validated, this means the task is being RE-RUN. You must reset its state to `0` in the plan table:
1. Revert the `#` index column back to a plain number (remove the markdown link to the old report).
2. Reset `☐ Done` to `⬜`.
3. Reset `☐ Valid` to `⬜` (clearing all previous validators).
4. The old `report_<i>` file is considered removed. Create a fresh report file when you finish your new execution.

━━━ IDEAS → PLAN PROMOTION INGESTION ━━━

On EVERY `/wbPlan` execution (both Fresh-Plan and Self-Correct modes), you MUST perform the following ingestion protocol:

1. **Scan for idea files:** Look for `ideas/idea_<scope>_*.md` files in the same scope's `.wb/workflows/reports/` tree (current day and any recent days within 7d).
2. **For each idea row where `☐ Valid` contains `🎯 Promoted`:**
   a. Check the `→ Task` column in the idea file.
   b. If `→ Task` is `—` (not yet ingested into a plan):
      - Append the idea as a new task row in the plan table:
        - `#` = next available index
        - `Origin` = `💡 [/wbIdea #<N>](../ideas/idea_<scope>_<YYYYMMDD>.md)` (relative link to the idea file)
        - `Task` = copy from the `Idea` column
        - `P` = copy from the idea's `P` column
        - `Est. Time` = copy from the idea's `Est. Time` column
        - `Worker (Suggested)` / `Validator (Suggested)` = fill from `model_recommendations.md`
        - `☐ Done` = `⬜`
        - `☐ Valid` = `⬜`
      - Update the idea file: set `→ Task` = `[→ Plan #M](../plans/plan_<scope>_<YYYYMMDD>.md)`
      - Update the idea file: ensure `☐ Valid` shows `🎯 Promoted`
   c. If `→ Task` already has a link → skip (already ingested).
3. **Structural conformity check:** Also verify broken links in the plan file (task report links, explanation links, source links) and fix them.

━━━ "WHAT NEXT" (Self-Correct & Fresh) ━━━

In **Fresh-Plan Mode**, end the plan file with a link to `/wbNext`:

> ## 🧭 What's Next?
> Run [`/wbNext <target_folder>`](../../../../../docs/ai_reference/commands/wbNext/wbNext_template.md)
> to get current, ranked suggestions for what to do after this plan.

In **Self-Correct Mode**, if you are re-checking an existing plan:
1.  **Analyze current progress**: Check which tasks are `✅ Done` and `✅ Valid`.
2.  **Suggest immediate next actions**: If the plan is partially executed, list the next 2-3 specific tasks to run.
3.  **Add a "Suggested Tasks Table"** if you find new issues during the re-check (e.g. a task failed validation and needs a fix-up task).
4.  **Append/Update** the `## 🧭 What's Next?` section with these dynamic findings.

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

### Local Files

| Category | File (day N) | File (day N-1) | Source Command |
|---|---|---|---|
| Identity | [context.md](../../../../../context.md) | — | Foundational Identity & Architecture |
| Identity | [dev.md](../../../../../dev.md) | — | Foundational Dev Commands & Status |
| Reports | [audit_<scope>_<date>.md](../audits/audit_<scope>_<date>.md) | [audit_<scope>_<prev-date>.md](../../<prev-DD>/audits/audit_<scope>_<prev-date>.md) | `/wbAudit` |
| Reports | [context_<scope>_<date>.md](../contexts/context_<scope>_<date>.md) | [context_<scope>_<prev-date>.md](../../<prev-DD>/contexts/context_<scope>_<prev-date>.md) | `/wbContext` (Snapshot) |
| Reports | **plan_<scope>_<date>.md** *(this file)* | [plan_<scope>_<prev-date>.md](../../<prev-DD>/plans/plan_<scope>_<prev-date>.md) | `/wbPlan` |
| Reports | [next_<scope>_<date>.md](../nexts/next_<scope>_<date>.md) | [next_<scope>_<prev-date>.md](../../<prev-DD>/nexts/next_<scope>_<prev-date>.md) | `/wbNext` |
| Tracks | [track_<scope>_<date>.md](../../../../../tracks/<YYYY>/<MM>/<DD>/track_<scope>_<date>.md) | [track_<scope>_<prev-date>.md](../../../../../tracks/<YYYY>/<MM>/<prev-DD>/track_<scope>_<prev-date>.md) | `/wbTrack` |

### Global Files (`core2/` monorepo root)

| Category | File (day N) | File (day N-1) | Source Command |
|---|---|---|---|
| Reports | [audit_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_core2_<date>.md) | [audit_core2_<prev-date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<prev-DD>/audits/audit_core2_<prev-date>.md) | `/wbAudit core2/` |
| Reports | [plan_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_core2_<date>.md) | [plan_core2_<prev-date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<prev-DD>/plans/plan_core2_<prev-date>.md) | `/wbPlan core2/` |
| Tracks | [track_core2_<date>.md](../../../../../../../../../../.wb/workflows/tracks/<YYYY>/<MM>/<DD>/track_core2_<date>.md) | [track_core2_<prev-date>.md](../../../../../../../../../../.wb/workflows/tracks/<YYYY>/<MM>/<prev-DD>/track_core2_<prev-date>.md) | `/wbTrack core2/` |

<details>
  <summary>📂 Sub-Package: [Active Package Name]</summary>

| Category | File (day N) | File (day N-1) | Source Command |
|---|---|---|---|
| Reports | [audit_subpkg_<date>.md](../../../../../../../../../../apps/wb-core/subpkg/.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_subpkg_<date>.md) | [audit_subpkg_<prev-date>.md](../../../../../../../../../../apps/wb-core/subpkg/.wb/workflows/reports/<YYYY>/<MM>/<prev-DD>/audits/audit_subpkg_<prev-date>.md) | `/wbAudit` |

</details>
```
```

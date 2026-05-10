# wbIdea Template v1.1 — The Ideas Pipeline


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbIdea`

## Where `/wbIdea` fits in the pipeline

```
wbVision ──► wbIdea ──► wbPlan ──► wbWork ──► wbValid
 (dream)    (capture)  (commit)   (execute)  (verify)
```

**`/wbVision`** = dream features (free-form, use rarely).
**`/wbIdea`** = capture and score a concrete idea (tabular, trackable — but NOT committed to execution).
**`/wbPlan`** = commit to execution (worker/validator assignments, DAG dependencies).

The key distinction: ideas have a **Score** and a **☐ Valid** column, but no worker/validator assignments. An idea becomes a task only when explicitly promoted via validation.

## The four forms

```
/wbIdea <pkg>                               # AI scans context and proposes ideas
/wbIdea <pkg> --task="<description>"         # Register a specific idea manually
/wbIdea <pkg> --resume                       # Re-read existing idea file, re-score
/wbIdea <pkg> --id=1 --promote               # Promote idea #1 to today's plan file
/wbIdea <pkg> --id=1,2 --reject              # Mark ideas 1,2 as 🚫 Rejected
/wbIdea <pkg> --id=1 --defer                 # Mark idea 1 as ⏸️ Deferred
```

## Reading an idea file

Every idea file has a table. Four columns matter most:

- **Score** — 1–10 advisory score. How strongly this idea should become a task. 10 = "implement immediately". 1 = "nice-to-have, maybe never".
- **Idea** — must be specific enough that another session could evaluate it without re-reading the source.
- **☐ Valid** — validation state. Determines whether the idea should be promoted, deferred, or rejected.
- **→ Task** — the bridge to `/wbPlan`. When an idea is promoted, this column becomes a link to the plan row.

Skim these before deciding. If the ideas are vague, the file is weak; re-run with a more specific scope.

## When to run

- Anytime you have a speculative improvement that isn't worth committing to immediately.
- After `/wbVision` to formalize its best ideas into trackable rows.
- After `/wbAudit` with low-severity findings that are improvements rather than bugs.
- When you want to build a backlog of possibilities without creating plan overhead.

## When NOT to run

- The idea fits in one sentence and you're ready to execute → just describe the task.
- You have an existing plan with open tasks → finish those first.
- You want to brainstorm broadly → use `/wbVision`.

## When /wbIdea is the wrong command

- You want to *do* the work → describe the task directly, or `/wbWork`.
- You want to *commit* to execution → `/wbPlan`.
- You want to *brainstorm* with no structure → `/wbVision`.
- You want to *audit* code quality → `/wbAudit`.

`/wbIdea` answers one question: *"Is this worth doing eventually?"* Not "what are the steps?" (that's `/wbPlan`) and not "what could we build?" (that's `/wbVision`).

> For deeper reading: [`docs_claude/commands/wbIdea/wbIdea_practical_claude.md`](../../docs/docs_claude/commands/wbIdea/wbIdea_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut | Description |
|---|---|---|
| `--resume` | `-r` | Re-read existing idea file, re-score |
| `--scope` | `-s` | Scope override |
| `--task` | `-t` | Explicit idea description |
| `--id` | `-i` | Specifies idea indices to target |
| `--promote` | `-p` | Promote idea(s) to today's plan file |
| `--reject` | `-x` | Mark idea(s) as 🚫 Rejected |
| `--defer` | `-d` | Mark idea(s) as ⏸️ Deferred |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbIdea <scope_folder>           # normal mode — produce a fresh output file
/wbIdea <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbIdea` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-r` → `--resume`
- `-s` → `--scope`
- `-t` → `--task`
- `-i` → `--id`
- `-p` → `--promote`
- `-x` → `--reject`
- `-d` → `--defer`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



> **How to use**: Copy the prompt below, replace `__PLACEHOLDERS__`, paste to any AI agent.
> Everyone gets the SAME prompt. Each agent finds their alias and does only their tasks.
> **Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to every cell of the output, including **§9 Action Type Tagging**: declare `type:` + `emits:` in YAML front-matter, add a plain-text `Requires` column to every ideas/candidates table (each idea gets a 🧠/✅/🔨/📋 tag indicating what role would carry it out), include a `## 🔗 Action Types` legend.

---

## Filename & Folder Convention

**Path:** `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/ideas/idea_<target>_<YYYYMMDD>.md`

**STRICT NAMING RULE:** The idea filename MUST be exactly `idea_<folder_scope>_<YYYYMMDD>.md`. Do NOT append source types, issue names, or any other suffixes.

**ONE FILE PER DAY rule:** There must be exactly ONE idea file per day per folder scope. All ideas — regardless of origin (audit, vision, manual, etc.) — go into the same file as separate Entry #N sections or rows in the same idea table.

**MERGE-OR-CREATE protocol:**
1. If `idea_<folder>_<YYYYMMDD>.md` already exists → APPEND your ideas as a new Entry #N section (tagged `*(ModelName — HH:MM)*`).
2. If it does not exist → CREATE it.
3. If multiple `idea_*<YYYYMMDD>*.md` files exist for the same day (e.g., from a prior bug) → MERGE them into one `idea_<folder>_<YYYYMMDD>.md`, combining all idea tables.

---

## Detection (Self-Correct Mode)

Trigger self-correct when the input file's first H1 matches:
`# Idea Backlog: <scope> — <YYYY-MM-DD>`

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.
Idea-specific gap-fills:
- Blank `☐ Done` for an idea whose `ideas_reports/idea_<N>/idea_<N>_report_*.md` exists → check it (`✅<br><worker>`).
- Blank `☐ Valid` for an idea whose exploration report has a validator score appended → fill `✅ <Score>/10<br><validator>`.
- Plain-text file references → convert to relative markdown links per §1.
- Missing `Suggested By` for ideas with known origin commands → fill from context.
- **Column completeness — verify ALL required columns are present** (see Column Rules above): `#`, `Requires`, `Score`, `🔗`, `Idea`, `P`, `Est. Time (mins)`, `Suggested By`, `☐ Done`, `☐ Valid`, `→ Task`. If any column is missing — most commonly **`Requires`** in idea files written before v1.1 — insert it after `#` and back-fill every row by inferring the tag from the idea's wording.
- **Legend section check:** if `## 🔗 Action Types` legend is absent, append it just before the Generated Files footer (template in `_shared/output_conventions.md` §9.3).
- **Link beautification (per `_shared/output_conventions.md` §1.1):** walk EVERY markdown link in the file (front-matter, callouts, prose, table cells, footer). Apply the four-rule detection: rewrite any link where (1) label == href, (2) label contains a `/` other than a single trailing slash, (3) label has `..`/`…`/`./`, or (4) label is absolute. Keep the href intact; replace the label with the basename of the href. Example: `[../../plans/plan_X.md](../../plans/plan_X.md)` → `[plan_X.md](../../plans/plan_X.md)`.
- **Path correctness (per `_shared/output_conventions.md` §1.2):** for every link to a report file or scope-root file, derive the href from §1.2's canonical-path table — do NOT count `../` segments by hand. The most common break is prev-day links across a month boundary (need `../../../<MM-prev>/<DD-prev>/...`, not `../../<DD-prev>/...`). Rewrite mismatches.

---

## 🚀 The Ideation Prompt (copy from here ↓)

```
━━━━━━━━━━━━━ /wbIdea v1.1 ━━━━━━━━━━━━━

📁 PROJECT: __PROJECT_NAME__
📅 DATE: __TODAY__
🤖 MODEL: __YOUR_MODEL_NAME__
🖥️ CLIENT: __YOUR_CLIENT__
📂 IDEA FILE: __TARGET_FOLDER__/.wb/workflows/reports/__YYYY__/__MM__/__DD__/ideas/idea___TARGET_NAME_____YYYYMMDD__.md

━━━ CONTEXT ━━━

Read the `.wb/workflows/context.md` file in the target folder(s) FIRST.
Check `../model_recommendations.md` for role assignments.
Read `../_shared/output_conventions.md` — your output MUST follow it.

━━━ INPUT MODE DETECTION ━━━

If the input is a file matching the idea-output schema (first H1 = "# Idea Backlog: <scope> — <date>"):
  - If target IDs and state flags (`--promote`, `--reject`, `--defer`) are provided:
    → **STATE OVERRIDE MODE**: Directly edit the idea file.
      - `--promote`: Set `☐ Valid` to `🎯 Promoted` and trigger the Promotion Protocol (see below).
      - `--reject`: Set `☐ Valid` to `🚫 Rejected`.
      - `--defer`: Set `☐ Valid` to `⏸️ Deferred`.
    Do NOT generate new ideas.
  - Else:
    → **SELF-CORRECT MODE** (see _shared/output_conventions.md §3).
Else:
  → **FRESH-IDEA MODE** (proceed with the prompt below).

━━━ THE CONTEXT ━━━

"""
__YOUR_MESSY_DESCRIPTION_OR_EMPTY__
"""

━━━ IDEA TABLE (v1.1 — Scored Ideas Pipeline, Action-Tagged) ━━━

| # | Requires | Score | 🔗 | Idea | P | Est. Time (mins) | Suggested By | ☐ Done | ☐ Valid | → Task |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 🔨 Worker | 8 | <span title="Run: /wbExplain idea_<scope>_<date>.md --id=1 --scope=idea">📄</span> | [idea description] | P1 | 30 | <ModelName> via /wbIdea | ⬜ | ⬜ | — |
| 2 | 🧠 Planner | 5 | <span title="Run: /wbExplain idea_<scope>_<date>.md --id=2 --scope=idea">📄</span> | [idea description] | P2 | 15 | <ModelName> via /wbIdea | ⬜ | ⬜ | — |

**Column Rules:**
1. **# (Idea Index)**: When an idea is explored (Done = ✅), this index MUST become a markdown link to the exploration report (e.g. `[1](ideas_reports/idea_1/idea_1_report_<scope>_<YYYYMMDD>.md)`).
2. **Requires (Action Type)**: Plain-text tag indicating which canonical role would carry the idea out *if it were promoted to a task* — one of `🧠 Planner` / `✅ Validator` / `🔨 Worker` / `📋 Mechanical`. Per `_shared/output_conventions.md` §9.3 this column is mandatory for every idea file; the file MUST also include a `## 🔗 Action Types` legend section just before the Generated Files footer. Tag selection rule: pick the role the *promoted task* would require — a code edit / refactor → 🔨 Worker; a "should we?" / multi-step decomposition → 🧠 Planner; a quality / safety review → ✅ Validator; a "run command and capture …" → 📋 Mechanical. Hybrid ideas MUST be split into two rows.
3. **Score (Advisory Score)**: Integer 1–10. Computed by the suggesting model based on: **impact × feasibility × urgency**. 10 = "implement immediately". 1 = "nice-to-have, maybe never". The score informs validation but does not auto-promote.
4. **🔗 (Details)**: Contextual Lazy Loading trigger. Inactive: `<span title="Run: /wbExplain idea_<scope>_<date>.md --id=<N> --scope=idea">📄</span>`. If an explanation file has been generated, upgrade to an active link: `[📄](ideas_reports/idea_<N>/idea_<N>_details_<scope>_<YYYYMMDD>.md "View Details")`.
5. **Idea**: Short imperative description. Clear enough to be promoted to a plan task without re-reading the source.
6. **P (Priority)**: P0–P3. Indicates the *urgency of evaluating* the idea, not of executing it.
7. **Est. Time (mins)**: How long the *task* would take if this idea were promoted. Not the time to evaluate the idea.
8. **Suggested By**: Who/what proposed this idea. Format: `<ModelName> via <command>` (e.g., `Opus 4.7 via /wbAudit`, `Manual`, `Gemini 3.1 Pro via /wbVision`).
9. **☐ Done (Exploration Status)**: `⬜` = not explored. `✅<br>ModelName` = idea has been explored and documented via `/wbWork idea_*.md --id=N`. Unlike plan Done, this means "explored", not "implemented".
10. **☐ Valid (Validation Status)**: The verdict scale:
   - `⬜` = not reviewed
   - `🎯 Promoted <Score>/10<br>ModelName` = "This deserves to be a task" (Score 8–10). Triggers promotion protocol.
   - `✅ <Score>/10<br>ModelName` = "Good idea, worth doing when capacity allows" (Score 5–7). No auto-promotion.
   - `⏸️ Deferred <Score>/10<br>ModelName` = "Interesting but not the right time" (Score 3–4).
   - `🚫 Rejected <Score>/10<br>ModelName` = "Not worth pursuing" (Score 1–2).
   Validation is cumulative (same as plan Valid): append new validations below existing ones.
11. **→ Task (Promotion Link)**: `—` when not promoted. When promoted, becomes a relative markdown link: `[→ Plan #M](../plans/plan_<scope>_<YYYYMMDD>.md)`.

━━━ ENTRY HEADER FORMAT ━━━

Each idea batch added to the file MUST have a section header:

## 💡 Ideas — <origin_description> *(<ModelName> via <Client> — <HH:MM>)*
> **Source:** <relative link to source file if applicable>
> **Model:** <model_name>
> **Date:** <YYYY-MM-DD>

Example origins:
- "AI-generated ideas for wb-dataviewer"
- "Low-severity audit findings from /wbAudit"
- "Feature proposals from /wbVision"
- "Manual idea registration"

━━━ SCORING HEURISTIC ━━━

When computing the Score (1–10), use this matrix:

| Factor | Weight | Anchors |
|---|---|---|
| **Impact** | 40% | 10 = fundamentally changes UX/DX. 5 = noticeable improvement. 1 = cosmetic. |
| **Feasibility** | 30% | 10 = straightforward, low risk. 5 = moderate complexity. 1 = requires architectural change. |
| **Urgency** | 30% | 10 = blocking other work. 5 = would be nice this sprint. 1 = no timeline pressure. |

`Score = round(impact × 0.4 + feasibility × 0.3 + urgency × 0.3)`

━━━ PROMOTION PROTOCOL ━━━

When an idea is promoted (via `--promote` flag or via `/wbValid idea_*.md --id=N` with `🎯 Promoted` verdict):

1. Locate (or create) today's plan file: `<target>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_<scope>_<YYYYMMDD>.md`.
2. Append the idea as a new task row:
   - `Origin` = `💡 [/wbIdea #<N>](../ideas/idea_<scope>_<YYYYMMDD>.md)` (relative link).
   - `Task` = copy from the `Idea` column.
   - `P` = copy from the idea's `P` column.
   - `Est. Time` = copy from the idea's `Est. Time` column.
   - `Worker` / `Validator` = fill from `model_recommendations.md`.
   - `☐ Done` = `⬜`.
   - `☐ Valid` = `⬜`.
3. Update the idea file:
   - `→ Task` column = `[→ Plan #M](../plans/plan_<scope>_<YYYYMMDD>.md)`.
   - `☐ Valid` = `🎯 Promoted <Score>/10<br>ModelName` (if not already set).

━━━ SOURCE LINKING ━━━

When ideas originate from another command's output (e.g. an audit, a vision), the entry header MUST include a relative markdown link to that source file. Example:

> ## 💡 Ideas — /wbVision findings *(Gemini 3.1 Pro — 14:30)*
> - **Source:** [vision_wb-core_20260508.md](../visions/vision_wb-core_20260508.md) Entry #1
> - **Origin Command:** `/wbVision packages/wb-core/`
> - **Ideas registered:** 3

━━━ "WHAT NEXT" ━━━

In **Fresh-Idea Mode**, end the idea file with:

> ## 🧭 What's Next?
> - Run [`/wbWork idea_<scope>_<YYYYMMDD>.md --id=<N>`] to explore idea #N in depth.
> - Run [`/wbExplain idea_<scope>_<YYYYMMDD>.md --id=<N> --scope=idea`] for a deep-dive explanation.
> - Run [`/wbValid idea_<scope>_<YYYYMMDD>.md --id=<N>`] to validate and potentially promote.
> - Run [`/wbIdea <target> --id=<N> --promote`] to directly promote a high-scoring idea.

In **Self-Correct Mode**, if you are re-checking an existing idea file:
1.  **Analyze current progress**: Check which ideas are explored, validated, promoted.
2.  **Re-score ideas** if context has changed.
3.  **Suggest immediate next actions** based on the current state.

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
| Reports | [plan_<scope>_<date>.md](../plans/plan_<scope>_<date>.md) | [plan_<scope>_<prev-date>.md](../../<prev-DD>/plans/plan_<scope>_<prev-date>.md) | `/wbPlan` |
| Reports | **idea_<scope>_<date>.md** *(this file)* | [idea_<scope>_<prev-date>.md](../../<prev-DD>/ideas/idea_<scope>_<prev-date>.md) | `/wbIdea` |
| Reports | [next_<scope>_<date>.md](../nexts/next_<scope>_<date>.md) | [next_<scope>_<prev-date>.md](../../<prev-DD>/nexts/next_<scope>_<prev-date>.md) | `/wbNext` |

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

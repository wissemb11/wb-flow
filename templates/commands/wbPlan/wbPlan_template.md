# wbPlan Template v5.4 — Unified Backlog (Cost-Aware, Wave-Scheduled)

> Conforms to output_conventions v1.12 · template v5.4


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
/wbPlan <pkg> --planner="modelA,modelB" --worker="modelC,modelD" # Override wave models for all waves
/wbPlan <pkg> --resume                     # read existing open plan, continue
/wbPlan <pkg> --id=1 --open                # Set task 1 Done AND Valid columns to ⬜
/wbPlan <pkg> --id=1,2 --def               # Set tasks 1,2 Done AND Valid columns to ⏸️ Deferred
/wbPlan <pkg> --worker=Gemini --can        # Set all tasks assigned to Gemini to 🚫 Cancelled
/wbPlan <plan_file.md>                     # consolidate: repair it, absorb every older open task
/wbPlan <plan_file.md> --archive           # …then retire the emptied plan folders
```

## Reading a plan file

Every plan has a table. Three columns matter most:

- **Details** — must be specific enough that another session could execute without asking questions.
- **Validator** — who verifies the task is done. If empty, the plan is weak.
- **Done / Valid** — checkboxes. The state machine.

Skim these before executing. If the details are vague, the plan is bad; fix it before running anything.



## 🌊 Next Executable Sequence & Model Roster Persistence

1. **Auto-Correction Rule**:
   - If the `## 🌊 Next Executable Sequence` matrix section is **missing** from a target plan file, `/wbPlan` automatically repairs/generates the section!
   - If model flags (`--planner`, `--validator`, `--worker`, `--mechanical`) are passed in the command, use those models to construct the matrix.
   - If no model flags are passed, use the baseline active choices from `commands/model_recommendations.md`.

2. **Plan Model Roster Header**:
   - When generating or updating the matrix, write the model roster header directly under `## 🌊 Next Executable Sequence`:
     ```markdown
     ## 🌊 Next Executable Sequence

     > **Active Model Roster for this Plan:**
     > 🧠 **Planner:** `modelA || modelB`
     > ✅ **Validator:** `modelE`
     > 🔨 **Worker:** `modelC || modelD`
     > 📋 **Mechanical:** `modelF`
     ```
   - Future dispatches of `/wbWork` or `/wbValid` on this plan automatically read and honor these persisted model choices.

- **Duration Estimation Requirement**: Each task cell entry in the `## 🌊 Next Executable Sequence` matrix table **MUST append the estimated task duration** extracted from the task table's `Est. Time (mins)` column, formatted as `*(⏱️ <min> min)*` (e.g., `→ *DeepSeek V4 Pro* *(⏱️ 15 min)*`).
  - This is a **`/wbPlan`-only extension** to `_shared/output_conventions.md` §10.2 rule 5, sanctioned there because a plan's task table owns the `Est. Time (mins)` column the value is read from. The other matrix-emitting commands (`/wbAudit`, `/wbReview`, `/wbSecure`, `/wbStandup`, `/wbNext`, `/wbIdea`, `/wbActOn`) have no such column and MUST NOT add ⏱️ — a synthesized minute-count reads as measured data.
  - Read the value; never estimate it at matrix-render time. If a row's `Est. Time (mins)` cell is empty, fill the column first.


- **`--as` Explanation Gate Rule**:
  - **Standard Mode (default, without `--as`)**: Matrix cells contain ONLY the execution command:
    `/wbWork plan.md --id=B23`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)*
  - **Explanation Mode (with `--as="<style>"`)**: Matrix cells prepend the `/wbExplain` blueprint generation command:
    `/wbExplain plan.md --id=B23 --as="expert,steps"`<br>`/wbWork plan.md --id=B23`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)*
  - In Explanation Mode the two commands run **sequentially in one lane** — the blueprint must finish before the work starts — while cells still run in parallel with each other. The mode applies to every 🧠 / 🔨 / 📋 cell, never to a ✅ validate cell.
  - The gate governs the **matrix only**. The `🔗` column's `<span title="Run: /wbExplain …">📄</span>` placeholder is Column Rule #3's lazy-load trigger and is written in both modes.


- **Multi-ID Merged Dispatch Requirement**: When generating or recomputing matrix table cells, copy/paste blocks, or how-to-run sections, tasks within the same wave sharing the same scope folder, action role, and routed model **MUST be grouped into Multi-ID Merged Dispatches (`--id=X,Y,...`)** (e.g. `/wbWork <plan> --id=5,6 -M="..."` or `/wbValid <plan> --id=4,5,6 -M="..."`). This reuses startup context once per model per wave, optimizing context overhead, execution time, and token costs while maintaining independent per-ID report checking and gate verification.

- **Validator Pairing Merge Rule**: A validation dispatch is eligible for merging based on the validation cell's own attributes, not on how its paired work cells were grouped. Therefore, all `/wbValid` commands in the same validation wave that target the same plan, use the same routed validator model, and have the same scope **MUST be merged**, even when they validate tasks with different `Requires` tags, different workers, or different work-wave batches. For example, `/wbValid plan.md --id=5` and `/wbValid plan.md --id=6,7`, both routed to `Claude Opus 5`, **MUST** render as `/wbValid plan.md --id=5,6,7 -M="Claude Opus 5"`. Keep individual pairing annotations in the matrix prose or a sub-list if needed, but never emit duplicate same-model validator commands.

- **Merged Duration/Cost Rule**: For a merged dispatch, the command appears once and its matrix annotation aggregates the member tasks' estimates: duration is the sum of the member `Est. Time (mins)` values, and cost is the sum of the member routed-model costs. The cell must list every paired task ID (for example, `pairs A · 5, 6, 7`).


- **Next Wave Command Suggestions Requirement**:
  - Below the `## 🌊 Next Executable Sequence` matrix and Wave notes, `/wbPlan` and `/wbWork` **MUST render a "🚀 Recommended Next Execution Command(s)" section**.
  - This section calculates total estimated duration (`Est. Time`) and suggests ready-to-run CLI commands tailored for different execution strategies:

  ```markdown
  ### 🚀 Recommended Next Execution Command(s)

  *Calculated from active wave matrix (Total Wave A Est. Time: ~25 min · Model Roster: Worker: DeepSeek V4 Pro, Validator: Claude)*

  - **Option 1: Standard Parallel Wave Execution (Wave A)** — *Est. Duration: ~25 min · Cost: Low (Flat-Rate Sub-Agents)*
    ```bash
    .wb/bin/wbRun claude -p --permission-mode auto "/wbWork plan.md --wave=A -y"
    ```

  - **Option 2: Pre-Flight Explanation Blueprint Gate (`--as`)** — *Est. Duration: ~35 min · Artifact: task_details_*.md*
    ```bash
    .wb/bin/wbRun claude -p --permission-mode auto "/wbWork plan.md --wave=A --as=\"expert,steps\" -y"
    ```

  - **Option 3: Full Unattended Auto-Pilot (All Waves)** — *Est. Duration: ~65 min total · Complete Unattended Loop*
    ```bash
    .wb/bin/wbRun claude -p --permission-mode auto "/wbWork plan.md --wave=all -y"
    ```
  ```

## The next-sequence matrix

Every plan ends with a **🌊 Next Executable Sequence** — the task table turned into a schedule you copy from:

| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |
|---|---|---|---|---|
| **A · 🔨 work** | — | — | `/wbWork plan.md --id=B23`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)* | — |
| **A · ✅ validate** | — | `/wbValid plan.md --id=B23`<br>→ *Claude (auto)* *(⏱️ 10 min)*<br><sub>pairs A · B23</sub> | — | — |
| **B · 🔨 work** | — | — | `/wbWork plan.md --id=B26`<br>→ *DeepSeek V4 Pro* *(⏱️ 15 min)* | `/wbTest pkg/wb-code --scope=task-B26`<br>→ *Qwen 3.7 Plus* *(⏱️ 5 min)* |
| **B · ✅ validate** | — | `/wbValid plan.md --id=B26`<br>→ *Gemini 3.1 Pro* *(⏱️ 10 min)*<br><sub>pairs B · B26</sub> | — | — |

- **Rows are waves** — same row ⇒ collision-free ⇒ launch in parallel.
- **Columns are roles** — a task's column is its `Requires` tag, so you can hand one whole column to one agent.
- **Each wave is two rows** — `· 🔨 work` then `· ✅ validate`. The pairing sits directly under the work it checks, so a wave is a complete unit rather than a promise redeemed later.
- **Every dispatch is a pair:** `/wbWork` executes, `/wbValid` checks — the second always by a *different* model than the executor. A model validating its own work is how hollow passes get in.
- **With `--as`, the pair becomes a triplet:** `/wbExplain` writes the blueprint first (and lights up the `🔗` column), then `/wbWork`, then `/wbValid`. Explain and work run **sequentially in one lane**; cells still run in parallel with each other. Without `--as` the matrix holds the work command alone — see the `--as` Explanation Gate Rule above.
- Waves come from the `Dep` DAG, not from priority: a P1 task with an unmet dependency does **not** appear in Wave A.
- A short **Wave notes** list under the matrix carries the blocking priority, known-red suites, and the collision reasoning for each parallel row.
- The matrix is **derived, live state**: `/wbWork`, `/wbValid` and `/wbPlan --id=… --open` all recompute it in the same pass they touch a Done/Valid box. A matrix older than the last `/wbWork` run is lying to you.

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

> For deeper reading: [`wbPlan_practical.md`](https://flow.wbc-ui.com/commands/wbPlan/wbPlan_practical) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--planner="<models>"` | `-p` — **universal**, persists the 🧠 Planner chain via `/wbModel` |
| `--validator="<models>"` | `-v` — **universal**, ✅ Validator chain |
| `--worker="<models>"` | `-w` — **universal**, 🔨 Worker chain. ⚠️ `-w` is **not** `--wave` |
| `--mechanical="<models>"` | `-m` — **universal**, 📋 Mechanical chain |
| `--model="<model>"` | `-M` — **universal, highest priority**: delegate THIS run; outranks role routing, the roster and the executor≠validator rule |
| `--wave="<L>:<R>"` | `-W` — narrow a wave to ONE cell (`P`/`V`/`W`/`M`); unknown letters exit non-zero |
| `--resume` | `-r` |
| `--scope` | `-s` |
| `--task` | `-t` |
| `--id` | `-i` | Specifies task indices to target for state manipulation. |
| `--open` | `-o` | Sets BOTH `☐ Done` and `☐ Valid` states to `⬜` (Open). |
| `--def` | `-d` | Sets BOTH `☐ Done` and `☐ Valid` states to `⏸️ Deferred`. |
| `--can` | `-c` | Sets BOTH `☐ Done` and `☐ Valid` states to `🚫 Cancelled`. |
| `--archive` | `-A` | **Universal** (`_shared/output_conventions.md` §13). After consolidating, retire every superseded `<DD>/plans/` folder into `.wb/workflows/archives/`. `--archive=all` sweeps every category. Pair with `--dry-run` first. Never implied by any other flag. |
| `--dry-run` | `-n` | With `--archive`: print the move list, move nothing. |
| `--keep=<N>` | — | With `--archive`: keep the N newest plan folders instead of 1 (default `1`). |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
<!-- UNIVERSAL_MODEL_FLAGS_START -->
## 🎛️ Universal model flags — `-p` `-v` `-w` `-m` `-M`

These are **not** local to one command. Every `/wb*` command that dispatches work accepts them, and they mean the same thing everywhere.

### Role flags — set the roster, then run

| Flag | Alias | Sets |
|---|---|---|
| `--planner="<models>"` | `-p` | 🧠 Planner chain |
| `--validator="<models>"` | `-v` | ✅ Validator chain |
| `--worker="<models>"` | `-w` | 🔨 Worker chain |
| `--mechanical="<models>"` | `-m` | 📋 Mechanical chain |

Passing any of them is **exactly equivalent to running `/wbModel` first, then the command**. They persist to `templates/commands/model_recommendations.md`, so the choice survives into every later dispatch:

```
/wbValid <folder>/ --id="<i>" -v="go:ds4pro" -p="gemini 3.6:"
```
is shorthand for
```
/wbModel -v="go:ds4pro" -p="gemini 3.6:"      # a. persist the roster
/wbValid <folder>/ --id="<i>"                  # b. then run
```

> ⚠️ **`-w` is `--worker`, not `--wave`.** The four role flags must be symmetrical — a set where three mean *model* and one means *wave* is a trap. **`--wave` takes `-W`.** This supersedes the older `-w → --wave` normalization.

### `--model` / `-M` — delegate this one run

`-M="<model>"` **outranks everything**: role routing, the roster, and the executor≠validator rule. It says *"I am choosing the agent for this invocation myself."*

```
/wbWork <folder>/ --id="<i>" -M="go:DSV4pro"
```

Run from the Claude CLI, this means Claude **delegates** the action rather than performing it, dispatching through the CLI that `model_recommendations.md` maps the name to — here `opencode run -m opencode-go/deepseek-v4-pro …`.

Because `-M` overrides the executor≠validator rule, it is the one flag that can silently produce a self-validation. **The override is reported in the routing line** (`[--model=… — explicitly delegated by the operator]`) precisely so it is never invisible.

**Precedence, highest first:** `-M` → explicit role flag (`-p/-v/-w/-m`) → plan-header roster → `model_recommendations.md` → built-in defaults.

<!-- UNIVERSAL_MODEL_FLAGS_END -->

<!-- WAVE_CELL_TARGETING_START -->
## 🎯 Targeting one cell — `--wave="<label>:<role>"`

`--wave=A` runs every cell in row A. Append `:<role>` to run **one cell**:

| Suffix | Column |
|---|---|
| `:P` | 🧠 Planner |
| `:V` | ✅ Validator |
| `:W` | 🔨 Worker |
| `:M` | 📋 Mechanical |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

```
/wbWork <folder>/ --wave="A:W"                      # only A's Worker cell
/wbWork <folder>/ --wave="A:W" -M="claude:opus 5"   # …delegated to a named model
/wbWork <folder>/ --wave="A:V" -v="go:ds4pro"       # …and persist the validator roster
```

The label is the matrix row, the suffix is the matrix column — the pair addresses exactly one cell. **An unrecognised role letter is rejected with a non-zero exit, never silently ignored**, because a typo that quietly runs the whole row is worse than an error.

<!-- WAVE_CELL_TARGETING_END -->

<!-- COPY_PASTE_BLOCK_START -->
## 📋 Copy/paste block — required after the 🌊 matrix

Every `/wbWork` and `/wbPlan` response **must** print, immediately below the `## 🌊 Next Executable Sequence` table, a fenced block of the same commands formatted into **4 explicit, non-overlapping execution scenarios**:

```markdown
### 📋 Copy/Paste Execution Scenarios

#### 1. Next wave execution (with --wave flag — work + valid)
```bash
/wbWork <plan> --wave=A -y
```

#### 2. Next wave dispatches (without --wave flag — grouped by model)
```bash
/wbWork <plan> --id=2,3 -M="opencode-go/deepseek-v4-pro"
/wbValid <plan> --id=1,5 -M="opencode-go/kimi-k2.7-code"
```

#### 3. All remaining waves execution (with --wave flag)
```bash
/wbWork <plan> --wave=all -y
```

#### 4. All remaining waves dispatches (without --wave flag)
```bash
# Wave A:
/wbWork <plan> --id=2,3 -M="opencode-go/deepseek-v4-pro"
/wbValid <plan> --id=1,5 -M="opencode-go/kimi-k2.7-code"
# Wave B:
/wbWork <plan> --id=8 -M="opencode-go/deepseek-v4-pro"
/wbValid <plan> --id=8 -M="Claude Opus 5"
```
```

**Wave Priority & Task Grouping Rules:**
1. **Prioritize Wave Commands (`--wave=<label>`)**: Scenario 1 and 3 present wave-level dispatches (`--wave=A`, `--wave=all`). `--wave=A` automatically executes `A.work` followed by `A.valid`.
2. **Grouped Task Commands (`--id=X,Y`)**: Scenario 2 and 4 group tasks sharing the same scope, role, and model into Multi-ID dispatches.
3. **Model Flag Requirement (`-M="..."` / `--model="..."`)**: Every individual or grouped task command MUST explicitly state its routed executor model.

<!-- COPY_PASTE_BLOCK_END -->

### 📡 Background-Work Status Protocol — mandatory whenever work is left running

**If `/wbWork` (or `/wbPlan`) returns while any dispatched cell is still running, the reply MUST end with all four of the following.** Silence during background work is the defect this closes: a user who sees no output cannot distinguish *working* from *crashed*, and will reasonably assume the latter.

**1 · A self-describing status snapshot.** Emit the current `waves/watch.sh -1` output verbatim. **The snapshot MUST name what produced it** — a bare list of cell ids is unreadable once more than one wave has run in a session:

```
🌊 Wave C · 🔨 work
   triggered by: /wbWork deployement/packages/wb-flow/next/core/ --wave
   executor:     DeepSeek V4 Pro (opencode-go/deepseek-v4-pro)   logs_C_20260801_085816
   ✅ 0 done · 🔄 2 running · ⚠️  1 ended · ETA ≲ 8m (slowest running cell)

  G11    🔄 ████████··  75% of 30m   idle 1169s   12KB
         🔨 Worker · task [#G11]: Implement user authentication middleware... · model: opencode-go/deepseek-v4-pro · chain: opencode-go/deepseek-v4-pro || gemini-3.1-pro-high
  G13    🔄 ██████████ OVER est 20m by 2m   idle 1192s   15KB
         🔨 Worker · task [#G13]: Update database schemas and migration... · model: opencode-go/deepseek-v4-pro
  G12    ⚠️  ENDED without exit code (killed/crashed) — last write 1188s ago
```

**Every dispatch MUST write a `_meta` file into its log directory** so the snapshot can be self-describing without guessing:

```
COMMAND=/wbWork <scope> --wave=<label>     # the exact wb-command the user typed
WAVE=C                                     # wave label
KIND=🔨 work                               # 🔨 work | ✅ validate | 📋 mechanical
ROLE=🔨 Worker
TASK=Implement user authentication middleware... # task description from the plan
EXECUTOR=DeepSeek V4 Pro (opencode-go/deepseek-v4-pro)
DISPATCH=parallel                          # parallel | sequential lane | mixed
```

**Three cell states, never two.** A cell is `✅ done` (wrote an `__EXIT__` marker), `🔄 running` (no marker **and** a live process holds it), or **`⚠️ ENDED`** (no marker and **no** live process — killed, crashed, or OOM-ed). Reporting ENDED cells as `🔄 running` is a real defect: a killed cell never writes an exit marker and would otherwise appear to run forever. Detect it with `pgrep -f -- "--id=<id> "`, not by elapsed time.

**2 · A return estimate.** State when you will be back — *"Back in ~N min"* — with **N derived from the remaining cells' `Est. Time (mins)`**, never guessed. If no estimate exists for a row, say so rather than inventing one.

**3 · A "While you wait" list.** Two to four concrete commands the user can run *now*, each with a one-line reason it is safe.

> ⚠️ **The command `wb-flow watch` (or `node <core>/bin/watch.js -1`) MUST ALWAYS BE PRESENT in the "While you wait" list** to give the user immediate, zero-side-effect visibility into running cells, task descriptions, active models, and real-time ETAs.
> ⚠️ **Every other suggestion MUST be read-only, or touch files disjoint from every running cell — and you must say which.** Suggesting `npm test` while a worker rewrites `bin/wave.js` invites a failure that is not real; suggesting a `/wbWork` on the same lane invites file corruption. A suggestion that races the wave is worse than no suggestion.

**4 · A continuation signoff message.** At the very end of the reply, emit an explicit continuation indicator line (e.g. `(To be continued...)`, `(We will be right back...)`, or `(Please stand by while background tasks execute...)`). This ensures that on the main orchestrator screen, there is an immediate visual cue that tasks are actively running behind the scenes.

**Liveness, not idleness.** When judging whether a cell is stuck, `idle` (time since its log last grew) is **not** sufficient — agents buffer while composing long output, so a thinking cell looks identical to a dead one. Use a composite: the process is alive (`kill -0`) **and** its CPU time is advancing between samples (`ps -o times=`). Treat a stale log as informational only. *(Measured: ten concurrently-running validators all showed `idle ≈ 230s` simultaneously while every one was healthy — one had burned 56s of CPU.)*


## Self-correct mode (dual-mode invocation)

```
/wbPlan <scope_folder>              # fresh plan mode — produce a new plan output file
/wbPlan <plan_file.md>              # consolidate & repair — verify, absorb every older open task, align structure, batch cells, externalize waves.md, repair in place (no flags/args required)
/wbPlan <plan_file.md> --archive    # …and then retire the plan folders it just emptied
```

When the first argument is an existing plan file path (`plan_*.md` or matching `# Plan Backlog: <scope> — <date>`), `/wbPlan` automatically executes **Consolidate & Structure Repair Mode** on that file:

0. **OPEN-TASK ABSORPTION (run FIRST — everything below operates on the merged set).** Per `_shared/output_conventions.md` §13.2: walk the **entire** `<scope>/.wb/workflows/reports/` tree for other `plan_<scope>_*.md` files, and pull every row whose `☐ Done` or `☐ Valid` is `⬜` or `🔨` into this file's task table.
   - `⏸️ Deferred` and `🚫 Cancelled` rows are **decided**, not open — leave them where they are.
   - **De-duplicate on the task's text, not its ID.** IDs restart per file, so a task carried forward for four days collides with three unrelated rows. Merge to a single row bearing the **oldest** origin.
   - Every absorbed row keeps its wording, `Requires`, `Dep`, `P` and `Est. Time (mins)`, and gains an origin link in its `Task` cell: `*(from [plan_wb-core_20260805.md](../../05/plans/plan_wb-core_20260805.md))*` — href per §1.2, label per §1.1.
   - Renumber the merged table contiguously, then **rewrite `Dep` cells to the new IDs**. A `Dep` pointing at a pre-merge ID is the one way this step corrupts a plan.
   - The source files are **left intact and unmodified**. Absorption copies; only `--archive` moves.
1. **Link & Href Repair (§1, §1.1, §1.2)**: Correct all broken or absolute links to canonical relative paths, and beautify link text to basename-only (e.g. `[plan_X.md](href)`).
2. **Structural Alignment**: Ensure all mandatory sections from `wbPlan_template.md` are present and ordered canonically (YAML front-matter, metadata callout, Executive Summary, Proposed Changes, Budget Estimate, Task Breakdown Table, Next Executable Sequence matrix, Wave Notes callout link, How-To-Run block with 4 Copy/Paste scenarios, Action Types Legend, What's Next, Generated Files Footer).
3. **Missing Section Insertion & Wave Externalization**: Automatically construct and insert any missing mandatory sections. Extract inline `### Wave notes` into `<plan_dir>/tasks/waves.md` and replace with `> 📝 **Wave Notes & Collision Analysis:** See [tasks/waves.md](tasks/waves.md)`.
4. **Cell Batching & 4-Scenario Recomputation (§10.4)**: Automatically batch parallel tasks in the same wave sharing scope, role, and model into grouped `--id=X,Y` dispatches. Recompute matrix, embed the `## ▶️ How to run this plan` block directly below `## 🌊 Next Executable Sequence` via `next.js --embed` (with 4 Copy/Paste scenarios), and tick `☐ Done`/`☐ Valid` checkboxes for completed reports.
   - ⚠️ **Batching yields to executor≠validator, never the other way round.** Two `/wbValid` cells that share a model may still NOT merge if their ids have different executors: `route()` classifies a merged validate cell from **one** id and applies that verdict to the whole batch, which silently produces a self-validation. When the two rules conflict, split the cell and pin the model with an explicit `-M`.
5. **Derived-block sync + oracle (§10.4)** — the step that makes all of the above stick. Re-sync **(0)** status callout → **(1)** matrix → **(2)** how-to-run → **(3)** What's Next, in that order, then **run the §10.4 sync oracle and act on its output**. After the three derived blocks re-sync, run `wb-flow lint <plan.md>` and **act on a non-zero exit rather than reporting success**.
   > 🔴 **This step is why the other four are worth writing down.** For weeks this checklist existed with no executable check, and plans still shipped literal `<placeholder>` matrix cells, broken relative links, and a What's Next progress line contradicting its own task table — every one of which the oracle catches in under a second. A checklist nothing runs is decoration.
6. **Archive sweep — ONLY when `--archive` was passed** (`_shared/output_conventions.md` §13.3–13.4). Steps 0–5 must have completed first; if any of them failed or was skipped, **do not sweep** and say so.

   ```bash
   wb-flow archive <plan_file.md> --dry-run     # the file pins itself as the keeper
   wb-flow archive <plan_file.md>               # apply
   ```

   - Passing the plan **file** (not the scope) pins it as the keeper for `plans/`, so nothing newer than it is touched — the safe default when the user named a specific file.
   - **Read the dry-run output before applying**, and paste it into the chat. A row reading `⚠️ no current file in this category` means step 0 did not land; abort.
   - Never hand-roll the move with `mv`. The CLI is what refuses to clobber, prunes empty date shells, writes the `🗄️ ARCHIVED` banner and the reversible log line.
   - Report the sweep in `## 🧭 What's Next?`: folders moved, keeper, and the one-line undo (`wb-flow archive --restore=<path>`).

   **Without `--archive`,** end step 5 by *offering* it: `📋 Mechanical — N superseded plan folders now hold no open tasks. → /wbPlan <this file> --archive`. Suggest; never sweep unasked.

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
- `-A` → `--archive`   *(universal — consolidate-then-sweep, §13)*
- `-n` → `--dry-run`   *(universal — preview a sweep)*
- `-p` → `--planner`   *(universal — model roster)*
- `-v` → `--validator` *(universal — model roster)*
- `-w` → `--worker`    *(universal — model roster)*
- `-m` → `--mechanical`*(universal — model roster)*
- `-M` → `--model`     *(universal — delegate THIS run; highest priority)*
- `-W` → `--wave`      *(⚠️ `-w` is `--worker`, NOT `--wave` — superseded 2026-08-01)*

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

**MERGE-OR-CREATE & UNIFICATION protocol:**
1. Search for existing `plan_<folder>_<YYYYMMDD>.md` in `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/`.
2. If it does not exist → CREATE it.
3. If multiple `plan_*<YYYYMMDD>*.md` files exist for the same day (e.g., from a prior bug that created suffixed files) → MERGE them into one `plan_<folder>_<YYYYMMDD>.md`, combining all task tables.
4. **OPEN TASK UNIFICATION**: Scan `<target_folder>/.wb/workflows/reports/` for any prior plan files (`plan_<scope>_*.md`) containing open tasks (`☐ Done` or `☐ Valid` is `⬜` or `🔨`). Unify and ship all open tasks into the main primary plan file `plan_<folder>_<YYYYMMDD>.md` as active task rows (preserving task context, dependencies, and relative origin links), while keeping original historic plan files intact. **De-duplicate on task text, not ID** — IDs restart per file — and rewrite every `Dep` cell to the merged numbering. Full contract: `_shared/output_conventions.md` §13.2.
5. **MANDATORY WAVE MATRIX UPDATE**: Ensure the `## 🌊 Next Executable Sequence` matrix section exists in `plan_<folder>_<YYYYMMDD>.md` and is recomputed across ALL unified open tasks.
6. **ARCHIVE (opt-in, `--archive` only)**: Once step 4 has carried every open task forward, the older `<DD>/plans/` folders hold nothing live. `--archive` retires them to `<target_folder>/.wb/workflows/archives/<YYYY>/<MM>/<DD>/plans/` — same depth, original date, whole folder including `tasks/`, `waves/` and `explanations/` — via `wb-flow archive`. See §13.3–13.4.
   > 🔴 **Order is not negotiable: 4 → 5 → 6.** Archiving before unification does not delete a task, it makes it invisible — nothing live references it and the next `/wbStandup` no longer scans the tree it sits in. If step 4 did not complete, step 6 does not run.

---

## Detection (Self-Correct Mode)

Trigger self-correct when the input file's first H1 matches:
`# Plan Backlog: <scope> — <YYYY-MM-DD>` (or when invoked as `/wbPlan <plan_file.md>` on an existing plan file).

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.
Plan-specific repair & self-correct tasks:
- **Open-task absorption (§13.2) — run before everything else**: pull every still-open row from every prior `plan_<scope>_*.md` in this scope's `reports/` tree into this file, de-duplicated on task text, each carrying an `Origin` link to the oldest file it came from, with `Dep` cells rewritten to the merged numbering. Sources are copied from, never modified. All the repair steps below then operate on the merged table.
- **Structural Alignment & Section Ordering**: Ensure the plan contains all mandatory sections matching `wbPlan_template.md` (Front-matter, Title, Metadata callout, Executive Summary, Proposed Changes, Budget Estimate, Task Table, Next Executable Sequence, What's Next, Action Types Legend, Generated Files, How-To-Run block).
- **Missing Section Insertion**: If any mandatory section is missing (e.g. `## 🌊 Next Executable Sequence`, `## 🔗 Action Types`, `## 📂 Generated Files`, or `## ▶️ How to run this plan`), construct and insert it in its canonical position.
- Blank `☐ Done` for a task whose `tasks/task_<N>/task_<N>_report_*.md` exists → check it (`✅<br><worker>`).
- Blank `☐ Valid` for a task whose worker report has a validator score appended → fill `✅ <Score>/10<br><validator>`.
- Bare `Origin: /wbAudit` → expand to `/wbAudit <target>` per output_conventions.md §2.
- Plain-text mentions (`tasks/`, audit filenames, target folders) → convert to relative markdown links per §1.
- Missing `Worker (Suggested)` / `Validator (Suggested)` cells → fill from [`../model_recommendations.md`](../model_recommendations.md).
- **Column completeness — verify ALL required columns are present** (see Column Rules above): `#`, `Requires`, `Dep`, `🔗`, `Task`, `Verify`, `P`, `Est. Time (mins)`, `Worker (Suggested)`, `Validator (Suggested)`, `☐ Done`, `☐ Valid`. If any column is missing — most commonly **`Requires`** in plans written before v5.2 — insert it in the canonical position and back-fill every row by inferring the tag (🧠 Planner / ✅ Validator / 🔨 Worker / 📋 Mechanical) from the task's wording (e.g. `/wbPlan …` body → 🧠 Planner; refactor / fix / convert → 🔨 Worker; audit / verify / score → ✅ Validator; "run command and capture …" → 📋 Mechanical).
- **Legend section check:** if `## 🔗 Action Types` legend is absent, append it just before the Generated Files footer (template in `_shared/output_conventions.md` §9.3).
- **Next-sequence check (v5.3):** if `## 🌊 Next Executable Sequence` is absent — every plan written before v5.3 — build it now from the current table state and insert it in canonical §10.4 order — matrix, then `▶️ How to run this plan`, then `## 🧭 What's Next?` (spec: "NEXT EXECUTABLE SEQUENCE" below). If it IS present, **recompute and replace it in place**: drop rows for tasks that have since become `✅ Done` + `✅ Valid`, promote tasks whose blockers cleared, and re-run the collision check on every parallel row. Never leave two matrices in one file, and never carry a wave forward without re-verifying its `Dep` state — a stale sequence sends an agent at already-finished work.
- **How-to-run block check:** ensure `<!-- HOW_TO_RUN_START -->` / `## ▶️ How to run this plan` / `<!-- HOW_TO_RUN_END -->` is present; re-embed via `node <core>/bin/next.js <plan.md> --embed`.
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
━━━━━━━━━━━━━ /wbPlan v5.4 ━━━━━━━━━━━━━

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

If the input is an existing plan file (path ending in plan_*.md, matching first H1 = "# Plan Backlog: <scope> — <date>", or passed as /wbPlan <plan_file.md>):
  - If target IDs and state flags (`--open`, `--def`, `--can`) are provided:
    → **STATE OVERRIDE MODE**: Directly edit the plan file. For the matching tasks, set BOTH `☐ Done` and `☐ Valid` columns to the requested state (`⬜` for `--open`, `⏸️ Deferred` for `--def`, `🚫 Cancelled` for `--can`). Do NOT generate a new plan. Evaluate multiple flags left-to-right (the last one wins).
  - Else (no state flags provided):
    → **CONSOLIDATE & STRUCTURE REPAIR MODE**: Perform complete in-place verification & repair:
       0. ABSORB every still-open task (`⬜` / `🔨`) from every other plan_<scope>_*.md under this
          scope's reports/ tree into this file (§13.2). De-duplicate on task TEXT, not ID. Give each
          absorbed row an Origin link to the oldest file it came from. Renumber contiguously and
          rewrite every Dep cell to the new IDs. Leave the source files untouched.
       1. Repair broken/absolute relative links and beautify link text (§1, §1.1, §1.2).
       2. Normalize section hierarchy to conform strictly to wbPlan_template.md.
       3. Insert any missing sections (## 🌊 Next Executable Sequence, ## 🔗 Action Types, ## 📂 Generated Files, ## ▶️ How to run this plan).
       4. Gap-fill ☐ Done and ☐ Valid checkboxes for completed task reports (§10.4).
       5. Recompute the 🌊 wave matrix over the MERGED table and re-embed the How-To-Run block via next.js --embed.
       6. ONLY IF --archive was passed, and ONLY after 0-5 all completed: retire the emptied plan
          folders with `wb-flow archive <this file> --dry-run` then, having shown the move list,
          `wb-flow archive <this file>` (§13.4). Otherwise just OFFER it in What's Next.
Else:
   → **FRESH-PLAN MODE** (proceed with the prompt below).

━━━ PRE-FLIGHT: TRANSLATION-DRIFT CHECK ━━━

**Trigger:** If the problem description involves *re-translating language variants* of a Markdown source file because the English file's mtime changed (the typical md2 multi-language documentation pattern where `<topic>/<topic>.md` is the English source and `<topic><Lang>.md` × 12 are the variants).

**Procedure — run BEFORE generating the plan:**

1. Locate the English source file and 1 representative variant (e.g., the French variant `<topic>Fr.md` — any language suffices).
2. Extract all `## ` section headings from both files by grepping `^## `.
3. For each `##` section in the English file (by heading index, e.g. section 1..N), count the lines between that heading and the next `##` heading (or EOF for the last section).
4. Do the same for the variant file by heading index.
5. Compare: if **every section's line count is identical** between the English file and the variant →
   **Abort plan generation.** Output:

   > **No content change detected — variants are current. No plan needed.**
   > The source file's mtime change is non-substantive (whitespace / tooling touch). All N `##` sections have identical line counts to the variant from `<variant_mtime_date>`. The variants already contain complete translations.
   >
   > | Section | EN lines | Variant lines | Match |
   > |---|---|---|---|
   > | (per-section comparison table) |

6. If any section's line count differs → continue with plan generation. Note the changed sections in the plan's Context § so the Worker knows exactly what to translate.

**Example — identical (abort):**

```
EN: 10 sections, Fr: 10 sections
Section 7 ("Markdown and Components"): EN=101 lines, Fr=101 lines … all identical
→ Abort: "No content change detected — variants are current. No plan needed."
```

**Example — drift detected (proceed):**

```
Section 7: EN=130 lines, Fr=101 lines → 29 new lines
→ Proceed with plan, Context: "Section 'Markdown and Components' grew by 29 lines."
```

**Cost:** This check consumes ~2-3k tokens and should run every time a `/wbPlan` invocation involves translation-drift detection. It prevents unnecessary plan generation (~50k tokens saved per false-positive invocation).

━━━ THE PROBLEM ━━━

"""
__YOUR_MESSY_DESCRIPTION_HERE__
"""

━━━ TASK LIST (v5.4 — Multi-Model, Recursive, Cost-Aware, Action-Tagged) ━━━

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

    **It must also be a machine oracle.** `/wbWork --wave` executes this cell as **Gate 3** of its success contract (see `wbWork_template.md`), so the cell MUST be a single shell command whose **exit code is the verdict** — 0 = pass, non-zero = fail. Prose is not runnable and silently degrades the gate:

    | ❌ Prose (unrunnable) | ✅ Oracle (exit code is the answer) |
    |---|---|
    | `npm test` output no longer contains "Skipping wrapper verification" | `! npm test 2>&1 \| grep -q "Skipping wrapper verification"` |
    | `ls docs/commands \| wc -l` matches the wired count | `[ "$(ls docs/commands \| wc -l)" -eq 33 ]` |
    | install the tarball in a temp dir and check the file | `d=$(mktemp -d) && npm pack --pack-destination $d && … && test -x $d/proj/.wb/bin/wbRun` |

    **Important — pipe characters in markdown tables:** The examples above use `\|` for each pipe inside a backtick code span. This is the correct pattern. The wave script (`bin/wave.js` `extractVerifyCommand()`) unescapes `\|` → `|` before executing the oracle, so the runtime pipeline matches the author's intent. **Do not remove the backslash** — without it the markdown table would break. The escape is not an error; it is handled. This was verified and documented after G1 (2026-08-01).

    If a row genuinely cannot be machine-verified, write `human: <what to check>` explicitly. That keeps the gap **visible** — an unverifiable row is a legitimate thing to have, a row that merely *looks* verifiable is not.
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
> > **Status:** 🟢 OPEN (4 open tasks)

━━━ TOP-LEVEL PLAN STATUS CALLOUT ━━━

At the top of every plan file (immediately under the target link callout), you MUST output and update the plan status line:
- If ANY task has an uncompleted checkbox (`☐ Done` or `☐ Valid` is `⬜`):
  `> **Status:** 🟢 OPEN (<N> open tasks)`
- If ALL tasks in the table have both `☐ Done` = `✅` and `☐ Valid` = `✅`:
  `> **Status:** ✅ CLOSED (All tasks completed & validated)`

Whenever `/wbPlan`, `/wbWork`, `/wbValid`, `/wbReview`, or state overrides (`--open`, `--def`, `--can`) run, this status line MUST be re-evaluated and updated.

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
━━━ OPEN TASKS UNIFICATION & SHIP PROTOCOL ━━━

On EVERY `/wbPlan <path_folder>` execution (both Fresh-Plan and Self-Correct modes), you MUST perform open task consolidation:

1. **Scan Prior Plans for Open Tasks:** Search `<target_folder>/.wb/workflows/reports/` for all prior plan files (`plan_<scope>_*.md`) containing tasks with uncompleted checkboxes (`☐ Done` = `⬜` or `☐ Valid` = `⬜`).
2. **Ship & Unify into Main Daily Plan:** Consolidate all non-duplicate open tasks into today's primary plan file:
   `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_<scope>_<YYYYMMDD>.md`.
   - Copy open task rows into the main plan table, maintaining task context, origin links to their source plans, priority (`P`), requirement role (`Requires`), and dependencies (`Dep`).
   - Original historic plan files remain intact in the filesystem for tracking history.
3. **Ensure & Recompute Wave Matrix across Whole Task Set:** Guarantee that the `## 🌊 Next Executable Sequence` matrix section exists in the primary daily plan file and immediately recompute it to schedule the **WHOLE set of unified open tasks** (both newly created tasks and all open tasks migrated from prior plans). Every uncompleted task in the consolidated plan table MUST be assigned to an execution wave (Wave A, Wave B, Wave C...) based on DAG dependencies (`Dep`), ensuring full wave coverage for the entire backlog.

━━━ NEXT EXECUTABLE SEQUENCE ━━━

The task table says *what* must happen. This matrix says *what to run next, right now, and in what order* — it is the part a reader actually copies.

**Position in the plan file:** after the 💰 Budget Estimate block, as the **first of the three derived blocks** in their canonical order (`_shared/output_conventions.md` §10.4):

```
💰 Budget Estimate
🌊 Next Executable Sequence      ← this section
▶️ How to run this plan           ← derived FROM it (wb-flow next --embed)
🔗 Action Types
🧭 What's Next?                   ← summarises both
📂 Generated Files
```

**Also print the matrix in the chat response** — its whole purpose is copy/paste, and a reader shouldn't have to open the file to get it.

⚠️ **All three derived blocks re-sync together, in that order, on every edit — and the §10.4 sync oracle is the check.** Regenerating What's Next before the matrix publishes a summary of a schedule that has already moved.

Format — a **wave × role matrix**:

> ## 🌊 Next Executable Sequence
>
> > **Rows are waves.** Every command in the same row is collision-free and may be launched **in parallel**.
> > **Columns are roles** — a task sits in the column named by its `Requires` tag.
> > Each cell is copy/paste-ready, with a recommended agent.
>
> | Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |
> |---|---|---|---|---|
> | **A · 🔨 work** | — | — | `/wbWork plan.md --id=B23`<br>→ *Sonnet 4.7 · ~$0.30* *(⏱️ 15 min)*<br><br>`/wbWork plan.md --id=B26`<br>→ *DS V4 Pro · ~$0.12* *(⏱️ 15 min)* | — |
> | **A · ✅ validate** | — | `/wbValid plan.md --id=B23`<br>→ *Opus 4.7 · ~$0.20* *(⏱️ 10 min)*<br><sub>pairs A · B23</sub><br><br>`/wbValid plan.md --id=B26`<br>→ *Gemini 3.1 Pro · ~$0.18* *(⏱️ 10 min)*<br><sub>pairs A · B26</sub> | — | — |
> | **B · 🔨 work** | `/wbPlan <target>/wb-latex "port the renderer"`<br>→ *Opus 4.7 · ~$0.45* *(⏱️ 45 min)* | — | — | `/wbTest <target> --scope=task-B26`<br>→ *Haiku 4.5 · ~$0.01* *(⏱️ 5 min)* |
> | **B · ✅ validate** | — | `/wbValid plan.md --id=C1`<br>→ *Gemini 3.1 Pro · ~$0.25* *(⏱️ 15 min)*<br><sub>pairs B · C1</sub> | — | — |
>
> ### Wave notes
> - ⚠️ **B23 is the priority** — `npm test` is still broken in wb-code, wb-latex and wb-press. Everything downstream inherits that red suite.
> - B25's own tests pass, but its `packaging.imports` suite stays red until B23 lands — score it on its own merits, not the suite colour.
> - For B25 the highest-value re-derivation is **mutant A**: delete the gate from `render()` and confirm the suite turns red.
> - **No collision in Wave A:** B23 edits the 7 `tests/packaging.imports.test.js` files; B26 edits wb-code's `README.md` + `ADR-011`. Disjoint.

**The example above is Standard Mode** — no `--as` was passed, so each cell holds its execution command alone. Under **Explanation Mode** (`--as="<style>"` on the invocation) every 🧠 / 🔨 / 📋 cell gains a blueprint line above its work command, run sequentially in the same lane:

```
`/wbExplain plan.md --id=B23 --as="expert,steps,graphs"`<br>`/wbWork plan.md --id=B23`<br>→ *Sonnet 4.7 · ~$0.30* *(⏱️ 15 min)*
```

✅ validate cells never take a blueprint line, in either mode. See the **`--as` Explanation Gate Rule** near the top of this template for the authoritative statement.

**Rules: `_shared/output_conventions.md` §10 is canonical** — all nine rules (waves, role columns, full-syntax cells, agent+cost annotation, mandatory collision check, required Wave notes, unfinished-only, chat echo) apply verbatim. Plan-specific bindings:

1. **The `Requires` column IS the matrix column.** Read each task's existing tag; never re-derive it. A plan whose `Requires` column is missing must be back-filled first (see Self-Correct gap-fills above) — the matrix cannot be built without it.
2. **Wave assignment comes from the `Dep` column** (the DAG defined in DEPENDENCY RULES above), not from `P`:
   - **Wave A** = every not-Done task whose dependencies are all `✅ Done` (or `—`).
   - **Wave B** = tasks whose only remaining blockers are in Wave A. And so on.
   - A `P1` task with an unmet dependency is **not** in Wave A. Priority orders work *within* a wave; it never jumps the DAG.
3. **Agent + cost come from the row's own `Worker (Suggested)` / `Validator (Suggested)` column** — take the first entry, cost annotation included (already computed per Column Rule #11). 🧠 Planner cells (recursive `/wbPlan` sub-plans) get a big thinker; 📋 Mechanical cells get the cheapest fast model.
4. **Recursive parent tasks are never scheduled directly.** A task marked `⬜ Expanded → N.1, N.2` is a container: schedule its children, not the parent.
5. **Paired validation (§10.2 rule 10) — the pairing is not optional.** Every task you schedule in wave N gets `✅ /wbValid <plan file> --id=<same id>` in wave N+1, with the model taken from that row's **`Validator (Suggested)`** column, minus whoever is named in `☐ Done` / suggested as its worker. Concretely: if the 🔨 cell says `--id=3 → Sonnet 4.7`, the next wave's ✅ cell says `/wbValid … --id=3 → Opus 4.7`, never `→ Sonnet 4.7`. Mark it `<br><sub>pairs Wave A · 3</sub>` so it reads as a pairing rather than a `✅ Validator`-tagged task of its own.
6. **A `✅ Validator`-tagged task still gets paired too.** Tasks like "classify all 83 files" or "feature-parity audit" are validation *work*; their `☐ Valid` column proves a second model checked them. Schedule the task in its own wave by `Dep`, then its `/wbValid` pairing in the next.
7. **Validator cells are merged after pairing**: first derive every required `/wbValid` pair, then group those pairs by `(validation wave, plan path, scope, routed validator model)`. Thus `/wbValid … --id=5` plus `/wbValid … --id=6,7`, both routed to the same validator, becomes one `/wbValid … --id=5,6,7` cell. Do not preserve separate commands merely because the corresponding worker cells were separate.
8. **Self-Correct Mode recomputes the matrix in place** against the current Done/Valid state (§10.5). Never append a second matrix, and never carry a wave forward without re-verifying its `Dep` state.
9. **The matrix is derived state, kept live by whoever changes the table.** `/wbWork` (checks `☐ Done`), `/wbValid` (fills `☐ Valid`) and `/wbPlan --id=… --open/--def/--can` all MUST recompute it in the same pass — see §10.4 for the full contract. A matrix whose grouping predates its last state change is lying about what to do next.

━━━ DYNAMIC "WHAT NEXT" & PLAN CLOSURE ━━━

The `## 🧭 What's Next?` section MUST be updated dynamically on EVERY plan creation, edit, or task execution pass (`/wbPlan`, `/wbWork`, `/wbValid`, `/wbReview`, state overrides).

> ⚠️ **It is block 3 of 3 — never regenerate it alone.** The canonical order is `🌊 matrix` → `▶️ how-to-run` → `🧭 What's Next?` (`_shared/output_conventions.md` §10.4). This section *summarises* the other two, so writing it first states a conclusion about a schedule that has not been recomputed yet. Finish with the §10.4 sync oracle; it fails loudly when the progress line and the task table disagree.

1. **Analyze Current Progress**: Count completed vs open tasks (e.g. `Progress: 3/5 tasks completed, 2/5 validated`). **The wording is load-bearing** — the sync oracle greps for exactly `Progress: <D>/<T> tasks completed, <V>/<T> validated`, so a reworded line reads as drift. Derive `<D>`/`<V>` by counting `✅` in the `☐ Done` / `☐ Valid` columns, never by incrementing the previous number.
2. **If Plan Status is 🟢 OPEN**:
   - Provide dynamic next actions based on current live Wave A dispatches.
   - Re-embed/Update the live **▶️ How to run this plan** block (`wb-flow next <plan.md> --embed`).
   - Include a link to [`/wbNext <target_folder>`](../../wbNext/wbNext_template.md) for ranked next suggestions.
3. **If Plan Status is ✅ CLOSED**:
    - Report complete closure metrics using the oracle's form: `Progress: <D>/<T> tasks completed, <V>/<T> validated` (e.g., `Progress: 5/5 tasks completed, 5/5 validated`). **Never** use the incompatible `All N/N tasks completed & validated!` wording — the shared oracle requires the explicit done/validated counts.
   - Recommend the definitive closure & verification command:
     `Run /wbReview <target_folder> --plan=<plan.md> to perform final quality assurance scoring, verify invariants, and publish the final closure report.`
   - Follow with `/wbStandup <target_folder>` to scan project health after plan closure.

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
| Foundational | [context.md](../../../../../../../context.md) | Permanent Identity and Architecture (Source of Truth) |
| Snapshot | [context_<scope>_<date>.md](../contexts/context_<scope>_<date>.md) | Daily snapshot used for current session context |
| Foundational | [dev.md](../../../../../../../dev.md) | Permanent Development Commands and Status |

### Local Files

| Category | File (day N) | File (day N-1) | Source Command |
|---|---|---|---|
| Identity | [context.md](../../../../../../../context.md) | — | Foundational Identity & Architecture |
| Identity | [dev.md](../../../../../../../dev.md) | — | Foundational Dev Commands & Status |
| Reports | [audit_<scope>_<date>.md](../audits/audit_<scope>_<date>.md) | [audit_<scope>_<prev-date>.md](../../<prev-DD>/audits/audit_<scope>_<prev-date>.md) | `/wbAudit` |
| Reports | [context_<scope>_<date>.md](../contexts/context_<scope>_<date>.md) | [context_<scope>_<prev-date>.md](../../<prev-DD>/contexts/context_<scope>_<prev-date>.md) | `/wbContext` (Snapshot) |
| Reports | **plan_<scope>_<date>.md** *(this file)* | [plan_<scope>_<prev-date>.md](../../<prev-DD>/plans/plan_<scope>_<prev-date>.md) | `/wbPlan` |
| Reports | [next_<scope>_<date>.md](../nexts/next_<scope>_<date>.md) | [next_<scope>_<prev-date>.md](../../<prev-DD>/nexts/next_<scope>_<prev-date>.md) | `/wbNext` |
| Tracks | [track_<scope>_<date>.md](../../../../../tracks/<YYYY>/<MM>/<DD>/track_<scope>_<date>.md) | [track_<scope>_<prev-date>.md](../../../../../tracks/<YYYY>/<MM>/<prev-DD>/track_<scope>_<prev-date>.md) | `/wbTrack` |

### Global Files (`<monorepo-root>/` monorepo root)

| Category | File (day N) | File (day N-1) | Source Command |
|---|---|---|---|
| Reports | [audit_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_core2_<date>.md) | [audit_core2_<prev-date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<prev-DD>/audits/audit_core2_<prev-date>.md) | `/wbAudit <monorepo-root>/` |
| Reports | [plan_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_core2_<date>.md) | [plan_core2_<prev-date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<prev-DD>/plans/plan_core2_<prev-date>.md) | `/wbPlan <monorepo-root>/` |
| Tracks | [track_core2_<date>.md](../../../../../../../../../../.wb/workflows/tracks/<YYYY>/<MM>/<DD>/track_core2_<date>.md) | [track_core2_<prev-date>.md](../../../../../../../../../../.wb/workflows/tracks/<YYYY>/<MM>/<prev-DD>/track_core2_<prev-date>.md) | `/wbTrack <monorepo-root>/` |

<details>
  <summary>📂 Sub-Package: [Active Package Name]</summary>

| Category | File (day N) | File (day N-1) | Source Command |
|---|---|---|---|
| Reports | [audit_subpkg_<date>.md](../../../../../../../../../../apps/wb-core/subpkg/.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_subpkg_<date>.md) | [audit_subpkg_<prev-date>.md](../../../../../../../../../../apps/wb-core/subpkg/.wb/workflows/reports/<YYYY>/<MM>/<prev-DD>/audits/audit_subpkg_<prev-date>.md) | `/wbAudit` |

</details>
```
```

> ### ▶️ Regenerate the how-to-run block in the same pass
>
> The `▶️ How to run this plan` block is **derived from the matrix**, so recomputing one
> without the other leaves the plan telling you to dispatch a wave that has moved. After any
> Done/Valid change, cancellation, or task reshuffle, run:
>
> ```bash
> wb-flow next <plan.md> --embed
> ```
>
> It replaces the block between its markers — never appends. Same rule as §10.4 for the matrix.

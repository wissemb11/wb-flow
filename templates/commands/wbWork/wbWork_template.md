
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

# /wbWork: Execution Template

> Conforms to output_conventions v1.12 · template v1.0

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
/wbWork <path_to_plan.md> --id=1 --as="expert,fr" # Explain task 1 first, then execute it
/wbWork <path_to_plan.md> --p=P1          # Execute all tasks with P1 priority
/wbWork <path_to_plan.md> --est<=30       # Execute tasks with est. time <= 30 mins
/wbWork <path_to_plan.md> --valid=true    # Execute tasks that are already validated (re-work)
/wbWork <path_to_plan.md> --done=false    # Execute all open tasks
/wbWork <path_to_plan.md> --id=5 --open   # Set task 5 Done column to ⬜
/wbWork <path_to_plan.md> --worker=Gemini # Execute tasks assigned to Gemini
/wbWork <path_to_plan.md> --wave=A        # Run Wave A tasks directly
/wbWork <path_to_plan.md> --wave=A --as="expert,steps,graphs" # Explain each task in Wave A first, then execute
/wbWork <path_to_plan.md> --wave=all      # Loop and run ALL waves sequentially (--wave=* / --wave=all)
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
| `--as` | `-a` | **Explanation Mode.** Runs `/wbExplain <plan.md> --id=<i> --as="..."` BEFORE executing task `<i>`, creating `task_<i>_details_*.md` and updating the explanation link in the task table. |
| `--wave` | `-w` | **Orchestration mode.** Run every cell in a wave (`A`, `B`, `C`...) or all waves (`all`, `*`). If `--as="..."` is passed, each task is explained before execution. See below. |
| `--planner="<models>"` | `-p` | Set/override **Planner** model fallback chain (`1st,2nd`) for this wave execution. |
| `--validator="<models>"` | `-v` | Set/override **Validator** model fallback chain (`1st,2nd`) for this wave execution. |
| `--worker="<models>"` | `-w` | Set/override **Worker** model fallback chain (`1st,2nd`) for this wave execution. |
| `--mechanical="<models>"` | `-m` | Set/override **Mechanical** model fallback chain (`1st,2nd`) for this wave execution. |
| `--no-plan-update` | — | Execute and write the task report, but **do not touch the plan file** (no Done box, no matrix recompute). Set automatically for every agent spawned by `--wave`. |
| `--no-merge` | — | **Wave mode only.** Prevent this cell from being auto-merged with siblings of the same role and model into a single dispatch. Useful when tasks are large and serialize poorly. |
| `--summary` / `--no-summary` | — | **Wave mode only — pass-through to `wb-flow wave`.** `--summary` is **already the default** when you run `--wave`: only the decision lines (`▶ / G1 / G2 / G3 / VERDICT / PER-ID`) stream into the orchestrator's context, while each cell's full output still goes to its log file. Pass `--no-summary` to get the raw stream back when you are debugging one cell's behaviour. Without `--wave` these flags are no-ops — say so rather than silently ignoring them. |
| `--sessions` | — | **Wave mode only — pass-through to `wb-flow wave`.** Reuse one warm opencode session per (scope, model), resumed **and forked** so parallel cells don't share a conversation. Off by default: a resumed session replays its history, so it trades a cold re-read for a growing transcript. Measure with `opencode stats --days 1 --models` before adopting it. |
| `--open` | `-o` | Sets `☐ Done` state to `⬜` (Open). Overrides execution. |
| `--def` | `-d` | Sets `☐ Done` state to `⏸️ Deferred`. Overrides execution. |
| `--can` | `-c` | Sets `☐ Done` state to `🚫 Cancelled`. Overrides execution. |
| `--yes` | `-y` | **Autonomous Mode.** Auto-decide all plan ambiguities/held choices using recommended defaults without pausing for user confirmation. Automatically spawns wave scripts. |
| `--planner=` | `-p` | **Universal.** Set the 🧠 Planner model chain — persists via `/wbModel` to `model_recommendations.md`. |
| `--validator=` | `-v` | **Universal.** Set the ✅ Validator chain (same persistence). |
| `--worker=` | `-w` | **Universal.** Set the 🔨 Worker chain. ⚠️ `-w` is **not** `--wave`. |
| `--mechanical=` | `-m` | **Universal.** Set the 📋 Mechanical chain. |
| `--model=` | `-M` | **Universal, highest priority.** Delegate THIS run to one model — outranks role routing, the roster, and the executor≠validator rule. |
| `--wave=<L>:<R>` | `-W` | Narrow a wave to ONE cell by role: `P`/`V`/`W`/`M`. Unknown letters exit non-zero. |
| `--help` | `-h` | Prints this help block. |


**Autonomous Auto-Decision (`--yes` / `-y` flag):**
- When `--yes` or `-y` is present, auto-adopt recommended choices for all plan ambiguities or held decisions.
- Do NOT pause or ask the user for confirmation; immediately generate and spawn the wave execution script (`wave_<label>.sh`).

## 🌊 Wave Model Overrides & Auto-Correction

1. **Wave Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)**:
   - When `--wave` is invoked with role model flags (e.g. `/wbWork <plan.md> --wave=A --worker="modelC,modelD"`), tasks in that wave execute using `modelC` as 1st Worker; if it fails (`.wb/bin/wbRun`), falls back to `modelD` as 2nd Worker.
   - The selected model chain updates the plan's `> **Active Model Roster for this Plan:**` header block under `
## 🌊 Next Executable Sequence` for future runs.

2. **Auto-Correction Rule**:
   - If `/wbWork <plan.md> --wave` is run on a plan file **missing** the `## 🌊 Next Executable Sequence` section, `/wbWork` automatically repairs/adds the matrix section using the active models before launching the wave.


## Wave mode — `--wave=<label>`

```
/wbWork <plan.md> --wave=A                         # Run Wave A tasks directly
/wbWork <plan.md> --wave=A --as="expert,steps"    # Explain tasks in Wave A first, then execute
/wbWork <plan.md> --wave=all                       # Loop over ALL waves (wave=all / wave=*)
```

You become the **orchestrator, and you do the running** — in your own terminal, not by handing the user a script. One row of the matrix is collision-free by its own check, so you launch its cells as **backgrounded shells in parallel**, keep working while they run, and wait when something is slow or when the next step depends on it. The user types one command and gets the whole wave (or all waves).

**Explanation Gate (`--as` flag):**
- **Without `--as`**: Tasks are executed directly via `/wbWork` without generating a pre-flight `/wbExplain` blueprint.
- **With `--as="..."`**: Each task in the wave is preceded by `/wbExplain <plan.md> --id=<i> --as="..."`, creating the `task_<i>_details_*.md` artifact and updating the explanation link before running `/wbWork`.

**Multi-Wave Execution (`--wave=all` / `--wave=*`):**
- Passing `--wave=all` or `--wave=*` loops sequentially through all waves (`Wave A → Wave B → Wave C ...`).
- For each wave, execute its work dispatches (and paired validations), wait for completion, check status, recompute the wave matrix once, and automatically advance to the next wave until all tasks are complete.

Each cell is routed by role:

| Role | Who runs it |
|---|---|
| 🧠 Planner | **you, in this session** — decomposition is never delegated to a cheap model |
| 🔨 Worker | `opencode run -m <worker-model>` |
| 📋 Mechanical | `opencode run -m <fast-model>` |
| ✅ Validator | **you**, unless the cell pairs a 🔨 Worker / 📋 Mechanical row *you* executed — then a different model via `opencode run`. A 🧠 Planner row you executed you may validate yourself, in-session. |

**Your loop, per wave:**

1. `wb-flow wave <plan.md> --wave=<label> --list` → show the user the resolved routing.
2. **Ask before spawning** — real agents, permissions bypassed, real cost. Name the cell count and models.
3. `wb-flow wave <plan.md> --wave=<label> --summary` → generates the script; run it **in the background from your terminal** (it fans out, waits, writes one log per cell, exits with the failed-cell count). Or launch one background shell per cell if you need to react as each lands — copy the exact `opencode run …` lines out of the generated script.

   **Pass `--summary` by default.** Without it every cell streams its whole transcript — template reads, `ls -la` dumps, ANSI escapes — into *your* context, once per cell. Measured on a real 10-cell wave in this repo: **63,002 tokens**, of which one cell was 16,824, and none of it changed a single Done box. `--summary` keeps the `tee` to each log file and shows you only `▶ / G1 / G2 / G3 / VERDICT / PER-ID`. When a cell fails, read *that one* log. Drop the flag only while debugging a specific cell's behaviour.

   Add `--sessions` when the same model is dispatched repeatedly against one scope: it reuses a warm session per (scope, model), resumed **and forked** so parallel cells don't share a conversation. It is not automatically cheaper — a resumed session replays its history — so measure with `opencode stats --days 1 --models` before making it habit.
4. While they run, do your own 🧠 Planner and in-session ✅ Validator cells. That's free parallelism.
5. **Classify every cell by the three gates — never by its output text.**

   | Gate | Question | Signal |
   |---|---|---|
   | **1 · Infra** | did the agent run at all? | CLI exit code, plus *anchored* fatal patterns (`^Error: Model not found`, insufficient credits, rate limit, quota, authentication) |
   | **2 · Artifact** | did it write what it was required to write? | `tasks/task_<ID>/task_<ID>_report_<scope>_<date>.md` exists |
   | **3 · Oracle** | does the task's own `Verify` command pass? | run the row's `Verify` cell; exit 0 = pass |

   | G1 | G2 | G3 | Verdict | Done box |
   |---|---|---|---|---|
   | ✗ | — | — | **INFRA** — never ran | `⬜` |
   | ✓ | ✗ | — | **NO-OP** — ran, produced nothing | `⬜` |
   | ✓ | ✓ | ✗ | **ATTEMPTED** — needs a validator or the user | `⬜` |
   | ✓ | ✓ | ✓ | **DONE** | `✅<br><model>` |

   **Output string-matching is forbidden as a success signal.** A `/wbWork` log legitimately contains `Error:`, `failed` and `cannot` whenever the task is *about* error handling — and those are exactly the rows where a false verdict costs most. Neither channel is sufficient on its own: an unusable model can exit **0** having done nothing, and a fully successful cell can print `Error:` a dozen times.

   > **Why this rule exists.** On 2026-07-31 a wave cell fixing `wbRun`'s unanchored `grep -qi "error:"` was marked ❌ by the identical guard still inlined in `wave.js` — the bug classified its own fix as a failure. In the same run, three cells that never started were indistinguishable from it by output alone. Of four cells the harness called "failed", three had done nothing and one had fully succeeded.

6. **Check the Done box only on 1-2-3 green.** Everything else stays `⬜` with its verdict (INFRA / NO-OP / ATTEMPTED) and reason in Wave notes.

   **Merged cells (`--id=3,8`) are gated per id, and you check their boxes per id.** Two rows may share one dispatch when they share a plan file, a model, a role column **and** are both small enough that losing the parallelism costs less than paying the agent's start-up context twice. The generated script then runs **one** agent over both rows and prints a verdict per id plus a roll-up:

   ```
   G2 [3]: PASS          G3 [3]: PASS          VERDICT [3]: DONE
   G2 [8]: NO-OP — no task report at tasks/task_8/task_8_report_*.md
                                                VERDICT [8]: NO-OP
   PER-ID: DONE=[3] UNVERIFIED=[] ATTEMPTED=[] NO-OP=[8]
   VERDICT: NO-OP — 8
   ```

   The **cell** exits on its worst id, but the `PER-ID:` line is what you read: check `3`'s Done box, leave `8` at `⬜` with its verdict. Do not fail a merged cell wholesale — a red exit code there routinely carries a genuinely green id.

   Two things merging still costs, so weigh them per cell: the rows run **serially** inside one agent (the wave budget becomes their sum, which is what the heartbeat's `OVER est` is measured against), and one context spans both tasks. Merge small siblings freely; keep a wave's release blocker on its own dispatch whenever the sibling is big enough to serialize meaningfully behind it.
7. **Model fallback fires on Gate 1 only.** A Gate 2 or Gate 3 failure is reported, never retried with the next model in the chain: the blocker is the task, not the agent, so a second model meets the same wall and doubles the spend. Re-dispatch after a Gate 2/3 failure is a human decision.
8. **MANDATORY: Recompute the matrix in place, report per-cell outcomes.** Immediately after checking task boxes in the task table, you MUST recompute `## 🌊 Next Executable Sequence` (remove completed `Done` + `Valid` tasks, shift unblocked tasks to Wave A), update `tasks/waves.md`, and run `wb-flow next <plan.md> --embed`. If `--wave=all` / `--wave=*`, repeat for the next wave; otherwise stop.

**You own the plan file.** Spawned agents get `--no-plan-update` and write only their task report; you check the boxes and recompute the matrix once, after the wave settles. Parallel agents editing one markdown table corrupt it. Never leave closed tasks inside `## 🌊 Next Executable Sequence`.

**Give every spawned cell a wall-clock bound.** If one hangs, kill it, mark it failed, leave its box `⬜`. A wave that never returns is worse than a partial one.

**Progress reporting is a stated orchestrator duty, not an implementation accident.** The generated script streams every cell's output in real time and prints a **heartbeat every ~30 s** naming still-running ids, elapsed time, and — when the plan's `Est. Time (mins)` column has a value — **% of estimate, ETA, and an explicit `OVER est by Nm` state**. The `OVER` state, not raw elapsed, is what distinguishes *slow* from *hung*. The orchestrator watches this stream, but **must not kill a cell on `idle` alone**. `idle` measures how long since the log last grew, and agents buffer while composing — so a *thinking* cell is indistinguishable from a *dead* one by that metric. Judge liveness with a composite: the process is alive (`pgrep -f -- "--id=<id> "`) **and** its CPU time is advancing between samples (`ps -o times=`). Treat a stale log as informational only. **And note a third case the composite still misses: a cell that delegates to sub-agents.** Its parent process shows *low* CPU **and** a static log while the real work happens in children — neither signal sees it. Observed 2026-08-01: a worker sat at 26s CPU with a 10-minute-silent log while its own log's last lines read `• Find wrappers.js codebase  Explore Agent`. **When both signals look dead, read the log's final lines before concluding anything** — a delegating agent usually names what it dispatched. *(Measured 2026-08-01: ten concurrently-running validators all reported `idle ≈ 230s` simultaneously while every one was healthy — one had burned 56s of CPU. Acting on the idle heuristic would have killed all ten.)* A cell that is **`OVER est` and has flat CPU across two samples** is the real kill signal; either alone is not. Prior art (folded in): `waves/watch.sh`.

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
         🔨 Worker · task: Implement user authentication middleware... · model: opencode-go/deepseek-v4-pro · chain: opencode-go/deepseek-v4-pro || gemini-3.1-pro-high
  G13    🔄 ██████████ OVER est 20m by 2m   idle 1192s   15KB
         🔨 Worker · task: Update database schemas and migration... · model: opencode-go/deepseek-v4-pro
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


Do not auto-advance to the next wave unless `--wave=all` / `--wave=*` was explicitly requested. When running a single wave, Wave B validates Wave A's work, so a half-failed A makes B meaningless.

Full contract, including the generator (`wb-flow wave <plan.md> --wave=A`): [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §10.6.
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
- `-a` → `--as`
- `-o` → `--open`
- `-d` → `--def`
- `-c` → `--can`
- `-p` → `--planner`   *(universal — model roster)*
- `-v` → `--validator` *(universal — model roster)*
- `-w` → `--worker`    *(universal — model roster)*
- `-m` → `--mechanical`*(universal — model roster)*
- `-M` → `--model`     *(universal — delegate THIS run; highest priority)*
- `-W` → `--wave`      *(⚠️ `-w` is `--worker`, NOT `--wave` — superseded 2026-08-01)*
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
   - **The report goes beside the plan file you were given**, i.e. `<dir of that plan>/tasks/task_<ID>/…` — resolve it from the plan's *actual* directory, not by reconstructing the canonical `.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/` path from today's date. Those two agree for a plan in its normal location and diverge for one that isn't; the plan's own directory always wins, because that's what its `#`-column link is relative to.
5. **Plan Update:** — **SKIP THIS ENTIRE STEP if `--no-plan-update` was passed.** In that case write your task report, print the id + outcome, and stop. Something else owns the plan file (a `--wave` orchestrator running you in parallel with other agents); writing to it would race them.
   - Edit the original plan file. Change the `#` column to a markdown link pointing to your new task report (e.g., `[<ID>](tasks/task_<ID>/task_<ID>_report_<TARGET>_<YYYYMMDD>.md)`).
   - Change `☐ Done` to `✅<br>__YOUR_MODEL_NAME__`. **OVERWRITE rule:** The Done column is NOT cumulative. If another model's name is already there, completely overwrite it with yours. Only the final executor is tracked.
   - **Re-sync ALL THREE derived blocks** in that same file — mandatory, same pass, in this order, per `_shared/output_conventions.md` §10.4:
     **(0)** the `> **Status:**` callout · **(1)** `## 🌊 Next Executable Sequence` · **(2)** `## ▶️ How to run this plan` (`wb-flow next <plan.md> --embed`) · **(3)** `## 🧭 What's Next?` (progress line + next actions).
     You just changed the state all four are derived from, so leaving any of them untouched publishes a schedule that points at work you have already done. **Finish by running the §10.4 sync oracle** — it is the only thing that catches the block you forgot. After the three derived blocks re-sync, run `wb-flow lint <plan.md>` and **act on a non-zero exit rather than reporting success**.
     Rebuild the matrix whole (never hand-edit one cell):
     - the id you executed leaves its wave;
     - its paired `✅ /wbValid <this file> --id=<this id>` becomes **dispatchable now** — put it in the earliest wave, and assign it to a model **different from `__YOUR_MODEL_NAME__`** (§10.2 rule 10; the row's `Validator (Suggested)` column is the source, minus your own name). **Exception — 🧠 Planner rows:** a row whose `Requires` tag is 🧠 Planner may be validated by `__YOUR_MODEL_NAME__` itself, in-session. It produced a decision, not a diff, and the reasoning is already in context. Use a different model there only when you want a genuinely outside opinion;
     - any task whose only blocker was this id moves up a wave;
     - re-run the collision check on every parallel row you emit.
   - If the plan file has **no** `🌊 Next Executable Sequence` section, add one (§10.5) rather than leaving the plan without a schedule.

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

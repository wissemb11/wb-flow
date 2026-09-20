
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

<!-- CONSTRAINTS_START -->
## ⚠️ Hard Constraints & Execution Environment

- **Never run git commands**: Git operations (e.g. `git status`, `git diff`, `git commit`) are strictly forbidden during task execution.
- **Output paths**: All generated artifacts and reports must go under `.wb/workflows/reports/`, never `.agents/` and never `docs/ai_reference/`.
- **Spawned cell mode**: When `--no-plan-update` is specified, write only the task report and do not update the plan file or recompute matrices.
<!-- CONSTRAINTS_END -->

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
/wbWork <path_to_plan.md> --wave=all      # Loop ALL waves sequentially (aliases: --wave=* / --wave=auto)
/wbWork <path_to_plan.md> --wave=all --loop="/wbAudit >= 9.5"   # repeat the wave loop until an audit scores >= 9.5
/wbWork <path_to_plan.md> --loop="--id=10 and --Valid=true"      # repeat until 10 tasks exist and all are validated
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
| `--wave` | `-W` | **Orchestration mode.** Run every cell in a wave (`A`, `B`, `C`...) or all waves (`all`, `*`). If `--as="..."` is passed, each task is explained before execution. See below. |
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
| `--loop=<condition>` | — | **Repeat-until.** Re-runs the command while `<condition>` is unmet; body runs at least once, condition checked after each iteration. Conditions read plan state (`--id=10`, `--Valid=true`, joined by `and`/`or`) or a command's score (`/wbAudit >= 9.5`). **In a condition, `--wbPlan` is implied** for row-generating commands — that is what feeds the next iteration and makes the loop recursive; opt out with `--no-wbPlan`. Bounded by `--loop-max`, stops on no progress, and never overrides the body's own stop rules. Refused on read-only commands run alone. See **Loop mode**. |
| `--halt-on-red` | — | **Loop/wave mode — an orchestrator directive, there is no CLI flag on the dispatch path.** Restore pre-2026-09-14 behaviour: when the flag is present, the orchestrator must stop the entire loop on the first INFRA/NO-OP/ATTEMPTED cell instead of discarding that cell and continuing the iteration (see **Discard-and-continue rule 1** in Wave mode). Nothing in `bin/` parses this — it is read by the orchestrator running `/wbWork`. Attended runs only — it defeats the point of `-y`. |
| `--loop-max=<N>` | — | Iteration bound for `--loop`. **Default 3.** An unreachable condition is otherwise unbounded spend. |
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
/wbWork <plan.md> --wave=all                       # Loop ALL waves (aliases: wave=* / wave=auto)
```

You become the **orchestrator, and you do the running** — in your own terminal, not by handing the user a script. One row of the matrix is collision-free by its own check, so you launch its cells as **backgrounded shells in parallel**, keep working while they run, and wait when something is slow or when the next step depends on it. The user types one command and gets the whole wave (or all waves).

**Explanation Gate (`--as` flag):**
- **Without `--as`**: Tasks are executed directly via `/wbWork` without generating a pre-flight `/wbExplain` blueprint.
- **With `--as="..."`**: Each task in the wave is preceded by `/wbExplain <plan.md> --id=<i> --as="..."`, creating the `task_<i>_details_*.md` artifact and updating the explanation link before running `/wbWork`.

**Multi-Wave Execution (`--wave=all` / `--wave=*`):**

`--wave=all` is a **recompute loop**, not a walk over a list.

```
repeat {
    W ← the FIRST wave in the matrix, read fresh from the plan file
    dispatch W's cells · wait · classify every cell by the three gates
    transcribe the results into the task table (☐ Done / ☐ Valid)
    RECOMPUTE the 🌊 Next Executable Sequence and ▶️ How to run this plan from the updated table
} until the recomputed matrix is empty
```

**Never cache the wave list.** The labels printed when the loop starts — `A → B → C` — are a
**forecast of the current table, not a schedule.** After wave A runs, the recomputed matrix may hold
different waves (`A1`, `B1`, …), may contain rows postponed out of A, may have gained rows a cell added,
and may have dropped rows that closed. The next wave is *whatever the recomputed matrix now says is
first*, which is frequently not what the forecast predicted.

> **This is not theoretical — it is how validations go missing.** A wave list captured before wave A ran
> was walked as `for A, B, C`. Waves B and C dispatched validators built against the **pre-A** matrix, so
> they carried task ids that were no longer open; both returned `NO-OP` on an id absent from the table,
> four rows finished **done but unvalidated**, and the next audit scored a tree whose validation state
> was incomplete for reasons that had nothing to do with the code. The work was fine. The schedule was
> stale.

### ⛔ Dispatch ONE wave per pass. Never batch waves into a single run.

*(Added 2026-09-14 after the orchestrator chained five waves — `F G H I D` — into one shell loop.)*

The rule above says never cache the wave **list**. This says the operational form of it, because the
principle was stated and the batching still happened:

```bash
# ⛔ FORBIDDEN — the matrix is never recomputed between waves
for W in F G H I D; do wb-flow wave <plan> --wave=$W && bash waves/wave_${W}_*.sh; done

# ✅ REQUIRED — one wave, then re-derive, then read the matrix again
wb-flow wave <plan> --wave=<FIRST>   &&  bash waves/wave_<FIRST>_*.sh
#   → classify · transcribe ☐ Done / ☐ Valid · recompute matrix + run-book
#   → THEN read the plan again; the next wave is whatever is now FIRST
```

**Why batching is wrong even when it appears to work.** Wave F can close rows, re-open a row, or file
new ones — the condition check is not the only thing that mutates the plan; **a wave does too.** The
labels `G H I` were computed against the pre-F table. After F they may not exist, may have been
renumbered, or may have been replaced by new waves (`A B C`) covering work F revealed. Dispatching them
anyway sends validators at ids that closed and workers at rows that moved.

A batched run that succeeds does so **by luck** — because that particular wave happened to change
nothing the later waves depended on. It is not evidence the shortcut is safe.

**The loop is therefore:** dispatch the first wave → classify → transcribe → recompute → **re-read the
plan file** → repeat until the recomputed matrix is empty. Only then does the condition check run.

**Per wave, in order, every time:**

| # | Step | Why it cannot be skipped or reordered |
|---|---|---|
| 1 | Read the matrix **from the plan file** | the in-memory list from the previous pass is already stale |
| 2 | Take the **first wave only** | later waves were computed against a table that no longer exists |
| 3 | Dispatch · wait · classify by the three gates | a verdict is not a result; classify before writing anything |
| 4 | **Transcribe** `☐ Done` / `☐ Valid` into the task table | the next recompute reads the table, so an untranscribed result is invisible to it |
| 5 | **Rewrite the matrix, then regenerate the run-book** — `wb-flow next <plan> --embed` | the 🌊 matrix has no CLI writer; the orchestrator rewrites it from the updated task table, then `--embed` refreshes the run-book |
| 6 | Loop | the next wave is read fresh at step 1 |

**Step 5 is the one people drop**, because the loop appears to work without it — right up to the pass
where a validator is dispatched against an id that closed two waves ago.

Four rules govern the loop. They are not advisory — each exists because its absence caused a recorded incident.

1. **A red cell is DISCARDED, not a full stop — the iteration carries on.** *(Revised 2026-09-14 by the maintainer. The former rule was "advance only on all-green: stop the loop". It halted three separate runs on a single red cell while every sibling row was independent and ready, which is not what an unattended loop is for.)*

   When a cell returns **INFRA / NO-OP / ATTEMPTED**, do this, in order:

   | # | Step | Why |
   |---|---|---|
   | 1 | **Run the row's own oracle before deciding anything.** | A red verdict is not evidence the work is bad. On 2026-09-13 a cell was verdicted `INFRA — every model in the chain failed to run` **after** it had already written a correct, mutation-proven fix. Discarding on the gate line alone would have thrown that away. **If the oracle passes, KEEP the work and close the row** — the verdict was wrong, not the work. |
   | 2 | Oracle fails → **discard that cell's execution**: restore **only the files that cell targeted** from the pre-wave snapshot. | The tree must carry no half-work into the next cell. This session saw a `NO-OP` cell that had deleted a module's logic and truncated a 1,362-line test file to 770 — that is what discarding prevents. |
   | 3 | **Scope the restore to the cell's own files. Never restore the whole tree.** | A blanket restore silently reverts every fix newer than the snapshot, including green siblings that just landed. |
   | 4 | Leave the row `⬜`, and **record the verdict *and the issue discovered*** in the row and in Wave notes. | That record is the input the condition command turns into next iteration's rows. An unrecorded issue is one the loop can never fix. |
   | 5 | **Continue with the wave's remaining cells** — *except* any row whose `Dep` names a discarded row, which is deferred to the next iteration. | Independent siblings are unaffected: the old rule's premise ("its inputs are the previous wave's outputs") is true only for dependents, so only dependents need to wait. |
   | 6 | Finish the iteration. **Do not stop the loop.** | The discarded issues become rows at the condition check, below. |

   **A task that merely *discovers* an issue still runs to completion** — discovery is not failure. Only a task that **cannot complete** (its own oracle fails) is discarded.

   **This is what closes the loop.** The condition command runs with `--wbPlan` implied, so every issue recorded in step 4 — the one that stopped the task (A) and any other it surfaced (B) — becomes a task row in the plan. **Iteration N+1 then executes the rows that fix what iteration N could not.** That is the recursion; without step 4 the loop re-runs the same failing cell forever.

   `--halt-on-red` restores the old behaviour (stop the whole loop on the first non-green cell). It is the right choice for an attended run where you want to inspect a failure by hand; it is the wrong default for `-y`.

2. **`-y` is FULLY AUTONOMOUS. Decide, record, continue.** *(Revised 2026-09-14 by the maintainer — this supersedes the earlier "escalate when blocked" reading, which stopped the loop on every open trade-off and made unattended runs impossible.)*

   Under `-y` the orchestrator **takes the decision itself, adopts the recommended option, writes down what it chose and why, and keeps going.** It does **not** pause to ask. This explicitly includes the class that used to stop the loop:
   - **Ambiguity** — several defensible options exist → adopt the recommended one.
   - **An open trade-off the plan or an audit records as "surfaced, not resolved"** → **decide it.** Take the option the source recommends; if it recommends none, take the lower-risk, reversible one. Record the choice, the reasoning, and how to reverse it in the plan. *Examples that must NOT stop a `-y` run: "sweep the corpus or fix-on-touch?", "is this divergence an intentional pin?", "should this block be machine-written?"*
   - **An architectural choice internal to the scope** → decide it, prefer the reversible option, record it as an ADR-style note.

   **The only four things that still stop a `-y` run** — none of which is a matter of taste, and every one of which is irreversible or spends something that is not yours:
   1. **Irreversible loss outside the snapshot** — deleting user data, history, or anything not recoverable from the pre-wave snapshot.
   2. **Outward-facing publication** — npm publish, a git push to a public remote, a deploy, anything a third party can see.
   3. **Spending money or credentials** — a paid action, a new subscription, anything needing a secret the run does not already hold.
   4. **A cross-scope or product-direction call** — a change whose blast radius leaves the target scope, or that changes what the product *is* rather than how this scope works.

   When one of those four fires, stop and say which wave you reached, what is blocking, and the exact resume command. **Everything else: decide it and keep moving.**

3. **No waves remaining + rows still `⬜` is a terminal state, not an idle one.** Report it and stop. Do not re-run `/wbAudit` hoping new rows appear, and do not re-dispatch a wave that already failed. State which rows are open and why the matrix has nothing scheduled for them.

4. **A wave that edits the gate cannot grade itself.** If any cell targets `bin/wave_generator.js` or `bin/wave.js`, that cell's G3 verdict was produced by the **pre-edit** oracle baked into the script at dispatch. Treat the verdict as unreliable: regenerate the wave script and re-verify before believing it, and never close such a row on its gate line alone.
   > This is why `/wbWork <plan> --wave=all` on a plan that repairs the wave machinery is the one case where the loop is guaranteed to misreport. See `_shared/output_conventions.md` §10.7.

**Before each wave, snapshot what the wave can destroy.** Copy the files its cells target to a scratch path. Recovery from a snapshot is one command; reconstruction from logs is an afternoon. Note also that restoring a snapshot silently reverts any fix newer than it — after any restore, re-run the verification for every finding closed after that snapshot's timestamp.

**`--wave=all` is the loop.** `--wave=auto` is accepted as an alias for it; there is no second mode with different semantics, and adding one would leave two flags differing only in error policy.


## Loop mode — `--loop=<condition>`

```
/wbWork <plan.md> --wave=all -y --loop="--id=10"
/wbWork <plan.md> --wave=all -y --loop="--id=10 and --Valid=true"
/wbWork <plan.md> --wave=all -y --loop="/wbAudit >= 9.5"
[<wb-command-1> … <wb-command-N>] --loop="<condition>"
```

`--loop` turns a command into **repeat-until**. The body runs **at least once**; the condition is
evaluated **after** each iteration.

```
repeat {

    ── BODY ──  the re-derive loop, run to exhaustion
    repeat {
        W ← the FIRST wave in the matrix, read fresh from the plan file
        dispatch W · classify · transcribe · recompute
    } until the matrix is empty

    ── CONDITION ──  this step WRITES; it is not a read
    score ← the condition command, with --wbPlan implied
    recompute the matrix          ← the condition command may have added rows

} until  the matrix is empty  AND  the condition holds
```

**The terminal state is a conjunction, and both halves are required.**

An empty matrix is **not** the stop. The condition command runs with `--wbPlan` implied, so it *writes
task rows* — an audit that scores 9.6 and files three findings leaves you with a satisfied condition and
a non-empty matrix, which is more work, not a finish. Equally, an empty matrix with a score of 7.5 is
not a finish either: the body has nothing left to do only because the condition has not been re-run.

| Matrix after the condition check | Condition holds | Verdict |
|---|---|---|
| empty | yes | ✅ **satisfied** — the only exit that means "done" |
| empty | no | ↻ iterate — the next condition check may add the work |
| **not** empty | yes | ↻ **iterate** — the check found work while passing; do it |
| not empty | no | ↻ iterate |

> Stopping on an empty matrix alone reports success while the condition command's own findings sit
> unworked in the plan. Stopping on the score alone leaves the matrix as the thing nobody looked at.

**Recompute after the condition check, not just after each wave.** The condition command mutates the
same plan the body reads. Skipping that recompute is the same defect as walking a stale wave list, one
level up.

### Condition grammar

| Form | Reads | Holds when |
|---|---|---|
| `--id=N` | the plan's task table | the highest task id reaches **N** |
| `--done=N` | `☐ Done` column | **N** rows are checked |
| `--Valid=true` | `☐ Valid` column | every row carries a validation |
| `/wbAudit >= 9.5` | the score of a `/wbAudit` run after the body | the score satisfies the comparison |
| `/wbAudit <target> get score >= 9.5` | same, with an explicit target | same |
| `<a> and <b>` · `<a> or <b>` | both/either of the above | ordinary boolean |

Comparisons are `=`, `==`, `!=`, `>`, `>=`, `<`, `<=`. `=` and `==` are the same test.

### Five guards — each exists because its absence cost something

1. **A bound is mandatory.** Default **3** iterations, `--loop-max=N` to change it. A repeat-until whose
   condition is unreachable is unbounded spend against real agent quotas. Report the bound when it stops.

2. **No progress ends the loop.** If an iteration leaves the measured quantity unchanged — same task
   count, same score, no rows closed — **stop and report "stuck"**, do not iterate again.
   > Auditing unchanged code finds nothing: three consecutive passes over an unchanged tree produced
   > zero findings, and the score sat flat across three entries. A loop that cannot tell "nothing left
   > to find" from "nothing done" will spin until its bound.

3. **The body's own rules still govern.** Inside each iteration `--wave=all`'s four rules apply
   unchanged — advance only on all-green, escalate when blocked, stuck is terminal, a wave that edits
   the gate cannot grade itself. **A wave that stops, stops the loop.** `--loop` never overrides them;
   it only decides whether to run the body again.

4. **Only the four hard stops escalate through the loop.** Under `-y` the loop **decides every open
   trade-off itself** (rule 2) and runs to one of its two natural ends. It stops early *only* for
   irreversible loss, outward-facing publication, spending money/credentials, or a cross-scope
   product-direction call. An audit finding marked *"surfaced, not resolved"* is **not** a stop — it is
   a row to decide and close.

5. **The condition check must be visible to `wb-flow watch`.** `watch.js` scans
   `<root>/.wb/workflows/reports/waves/` only, so a condition command dispatched by hand as
   `claude -p …` is **invisible to it** — during a 19-minute audit on 2026-09-14, `wb-flow watch -1`
   reported `0 running` while an agent was in fact working, which is a false idle and exactly the signal
   an operator uses to decide whether to keep waiting. **Dispatch the condition check into a run
   directory under `reports/waves/` with a `_meta`** (`KIND=🔍 condition`, `COMMAND=` the loop's
   condition), so one command answers "is anything running?" for waves *and* condition checks alike.

6. **A score condition needs an evaluator that is not the author.**
   `--loop="/wbAudit >= 9.5"` makes an exit depend on a number the same agent assigns. `--wbPlan` is implied (see above), so the audit also feeds the next iteration. Dispatch it
   as a **separate process** (`.wb/bin/wbRun claude -p … "/wbAudit <target> …"`) and **pin the
   rubric** in that invocation, so the threshold means the same thing on every iteration.
   > Left unpinned, the same tree scored **8.5** by judgement and **7.0** by rubric on the same day.
   > An exit condition is only as stable as the scale behind it.



### Choosing `--loop-max` — the default is **3**, and why it is not higher

A bound is not a safety net you hope never to touch. For one class of condition it is **the actual stop**.

**Monotone conditions** — `--id=10`, `--done=N`, `--Valid=true`. Each iteration can only move toward the
target; rows do not un-write themselves. Raising the bound is safe, and `--loop-max=10` is reasonable
when you know the work is mechanical.

**Non-monotone conditions** — any `/wbAudit >= X`. These **cannot be assumed to converge**, and the
reason is the feature one section above: `--wbPlan` is implied, so the audit writes what it finds into
the plan. A more thorough audit finds more, and finding more *lowers* the score. The measurement
generates the work that moves the target away from you.

This is measured, not theorised. Sixteen consecutive audit entries on one package in one day:

```
8.0 7.5 7.5 8.0 8.0 8.0 8.0 6.5 7.0 8.5 7.0 9.5 9.0 9.0 9.0 7.5
```

It touched 9.5 exactly once, then fell back and **ended lower than it started** — while the codebase
got steadily better (suite 110 → 144, every finding mutation-proven). The score was not tracking
quality; it was tracking *quality minus whatever the latest audit noticed*.

A loop set to `>= 9.5` against that series exits only if it happens to check at the right moment.

**So the default is 3**, for four reasons:

1. **Three iterations reveal the trend.** Rising, flat, or oscillating — you can tell which, and that is
   the decision you actually need. A fourth iteration rarely changes the answer.
2. **An iteration is not one call.** It is a wave of agent dispatches plus a condition command, against
   real quota. Five iterations of a five-cell wave is thirty agent runs.
3. **Blast radius.** The worst incident on record — a cell that deleted a module's logic and truncated a
   1,362-line test file while reporting `NO-OP` — happened inside a *single* unattended iteration. Every
   additional unattended iteration multiplies that exposure.
4. **The no-progress guard usually fires first.** In practice a loop stops at iteration 2 because nothing
   changed, not at its bound.

**Raise it deliberately, and say why**: `--loop-max=10` for a monotone condition on mechanical work is
fine. Raising it for a score condition is usually the wrong instinct — if three passes have not
converged, the answer is not more passes.

**Always report the trajectory**, not just the verdict. `8.0 → 9.0 → 8.5` and `8.0 → 8.4 → 8.9` both
stop at the bound and mean opposite things: one is receding, one is converging and deserves a higher
bound. A loop that prints only *bound reached* has thrown away the one number that tells you what to do
next.

### `--wbPlan` is implied in a condition — this is what makes the loop recursive

When a condition invokes a command that can **generate plan rows** — `/wbAudit`, `/wbReview`, `/wbPlan`
— the `--wbPlan` flag is **on by default**. These two are the same command:

```
/wbWork $P --wave=all -y --loop="/wbAudit >= 9.5"            # --wbPlan implied
/wbWork $P --wave=all -y --loop="/wbAudit --wbPlan >= 9.5"   # --wbPlan written out
```

**Why it must be the default.** The condition command is not only a measurement — it is the thing that
**feeds the next iteration**. An audit that reports findings and discards them leaves the plan
unchanged, so iteration 2's body has nothing new to run, changes nothing measurable, and **guard 2 ends
the loop as `stuck` at iteration 2**. Technically correct and completely useless: the loop stops on its
first check having done one pass of work.

With `--wbPlan` the cycle closes:

```
body → condition command → new rows in the plan → body has work → condition command → …
        (measures)          (feeds the next pass)
```

That is the recursion. Without it there is no loop, only a repeat.

**Opting out** is explicit: `--loop="/wbAudit --no-wbPlan >= 9.5"`. That turns the loop into a pure
poll, which converges only if the body alone can satisfy the condition — a plan already holding enough
open rows to reach the threshold. State the reason when you use it.

**Commands this applies to:** any that accept `--wbPlan` — `/wbAudit`, `/wbReview`, `/wbPlan`,
`/wbActOn`. A condition command with no row-generating mode (a plain state predicate like `--id=10`)
is unaffected; there is nothing to imply.

### Where `--loop` is accepted, and where it is refused

| Command | `--loop` | Why |
|---|---|---|
| `/wbWork` | ✅ | changes state — each iteration can move the measured quantity |
| `/wbPlan` | ✅ | adds rows, so `--id=N` can advance |
| `[cmd … cmd] --loop=…` | ✅ | the general bracketed form |
| `/wbAudit`, `/wbExplain`, `/wbValid` **alone** | ❌ **refuse** | read-only. Looping one until its own number moves is either a no-op or an invitation to keep re-scoring until the answer is the desired one. Use them **inside** a condition, not as the body. |

Refuse with a message naming the reason and suggesting the composite form —
`[/wbWork … /wbAudit …] --loop=…` — which is what someone reaching for `/wbAudit --loop` almost always
means.

### The loop log — `loops/loop_<i>.md` (mandatory whenever `--loop` is used)

Every `--loop` invocation **must** maintain a trace file beside the plan:

```
<plan dir>/loops/loop_<i>.md
```

**It lives beside the plan it is tracking — not the plan the loop started from.** A condition check can move the active plan to a new date folder (its `--wbPlan` phase writes today's plan); when that happens, the loop log moves with it. A log left in the starting folder drifts away from the plan it describes. It is the loop's **DevTools console**: the run is long, unattended and multi-agent, and without it the
only record of *why* iteration 2 did what it did is chat scrollback. It sits alongside `tasks/`,
`waves/` and `explanations/`, and `<i>` is the loop invocation, not the iteration.

**Relocating a loop log requires sweeping its inbound links.** The log moves when a condition check
relocates the plan it tracks (see above). Two links broke when `loops/` moved this pass, so the move is
not `mv` alone: every inbound link to the old path — in the plan, the run-book, and prior iteration
sections — must be rewritten in the same pass, and re-verified with `lint --include-closed` (a broken
href is invisible to a content grep).

**`<i>` is the invocation counter for the scope, not the directory.** When a log migrates between date
folders, `<i>` does **not** reset to 1 in the new folder. It counts the loop invocations for the *scope*
across every date folder, so a scope's second loop is still `loop_2.md` after the first was written under
yesterday's date, and `loop_2.md` still names invocation 2 once it has moved.

**Required content**

| Section | Must contain |
|---|---|
| Header | the exact invocation, `--loop-max`, start time, current status |
| **The algorithm** | the repeat/until pseudo-code **and** an ASCII diagram of body → condition → next iteration |
| **Per iteration** | every wave, its cells, the model each ran on, and the per-cell verdict |
| **Issues discovered** | a table — issue → which task surfaced it → which row it became. *This is the load-bearing section:* it is the input the condition command turns into the next iteration's rows |
| **Condition check** | the command dispatched, the score, and **why it did or did not hold** |
| Verdict | iterations run · bound · **full trajectory** · goal reached or not |

**Write it as you go, not at the end.** A loop that is killed mid-iteration — by the operator, a crash,
or a quota wall — must still leave a readable trace of everything before the kill. Append each iteration
as it closes.

**Record orchestrator mistakes in it too.** A wrong measurement, a self-matching `pgrep`, a mis-read row
count: these change what the loop did and belong in the trace. A log that only records the agents'
errors is not a debug log.

### Reporting — the loop has exactly two normal endings, and each has a required headline

On exit, state **which condition ended it**, how many iterations ran, and the measured value at every
iteration. A loop that says only "done" hides whether it converged or gave up.

Under `-y` there are two normal endings, and the reply **must open with the matching headline** so the
outcome is readable without parsing the report:

| Ending | Required headline | Means |
|---|---|---|
| condition satisfied | **✅ MISSION COMPLETED — GOAL REACHED** | matrix empty **and** the condition holds |
| bound exhausted | **🛑 MAX-RECURSION REACHED — GOAL NOT REACHED** | `--loop-max` spent; name the bound, the final value, and the gap |

Two abnormal endings keep their own headlines: **⏸️ STUCK** (guard 2 — the measured quantity did not
move) and **🛑 HARD STOP** (one of rule 2's four). Always print the full trajectory — `4.5 → 5.0 → 8.0`
and `4.5 → 9.0 → 5.0` both end at the bound and mean opposite things.


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
8. **MANDATORY: Rewrite the matrix in place, report per-cell outcomes.** Immediately after checking task boxes in the task table, you MUST rewrite `## 🌊 Next Executable Sequence` yourself (remove completed `Done` + `Valid` tasks, shift unblocked tasks to Wave A), update `tasks/waves.md`, and run `wb-flow next <plan.md> --embed` to regenerate the run-book. The 🌊 matrix has no CLI writer; `--embed` reads it, it does not rebuild it. If `--wave=all` / `--wave=*`, repeat for the next wave; otherwise stop.
9. **Replay closed oracles before declaring the plan done.** A later row can silently undo an earlier row's fix and leave every gate green — that is
   how F8 was reopened on 2026-09-17. `wb-flow lint --replay-closed <plan.md>` re-runs every closed row's `Verify` and names any that now fail.
   **It replays the whole closed set (~350 s on a 17-row plan), so do not run it after every wave.** Run it (a) once when the matrix empties, and
   (b) after any wave that edited a file an earlier closed row asserts on. Record which of the two triggered it in the task report.

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

**3 · A "While you wait" list — MANDATORY, never omitted, and placed directly above the signoff.**
Two to four concrete commands the operator can run *now*, each with a one-line reason it is safe. Open it
with a line that offers the choice plainly, e.g.:

> *"While waiting, you can look behind the scenes or do one of the following:"*

Omitting this list is a defect, not a style choice: the operator is blocked on an agent they cannot see,
and these commands are the only way they can inspect the run without racing it.

> ⚠️ **The command `wb-flow watch` (or `node <core>/bin/watch.js -1`) MUST ALWAYS BE PRESENT in the "While you wait" list** to give the user immediate, zero-side-effect visibility into running cells, task descriptions, active models, and real-time ETAs.
> ⚠️ **Every other suggestion MUST be read-only, or touch files disjoint from every running cell — and you must say which.** Suggesting `npm test` while a worker rewrites `bin/wave.js` invites a failure that is not real; suggesting a `/wbWork` on the same lane invites file corruption. A suggestion that races the wave is worse than no suggestion.

**4 · A continuation signoff message — and it comes LAST, after the "While you wait" list.**

The order is fixed and is not cosmetic: **snapshot → ETA → While-you-wait → signoff**. The signoff is the
last line of the reply; the "While you wait" list must appear **immediately above it**. An operator who
reads "we'll be right back" and then has to scroll *up* to find out what they can do meanwhile has been
handed the wait without the remedy.

**The signoff line must name four things** *(operator rule, 2026-09-14)* — a bare `…` says something is
running but not whether to wait two minutes or an hour, nor who to chase if it never lands:

| Must carry | Example |
|---|---|
| **ETA in minutes**, from the row's `Est. Time (mins)` — never guessed | `ETA ~25 mnts` |
| **Which agent** | `codex gpt-5.5` · `agy gemini-3.6-flash-high` · `opus 5.x` |
| **Which task** is responsible | `--id=28 — wbRun 3-copy parity` |
| **A direct address** to the waiting operator | *"We'll be right back in ~25 mnts…"* |

```
(Waiting on --id=28 — wbRun 3-copy parity — running on codex gpt-5.5; ETA ~25 mnts.
 We'll be right back…)
```

If no `Est. Time` exists for the row, **say so** rather than inventing a number.

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

## ━━━ THE TRAILING-ELLIPSIS CONTRACT (mandatory) ━━━

**If work is still in flight when you finish speaking, the response MUST end with `…` (three dots).**
Its absence is a promise that nothing is running.

| Ending | Means | The reader should |
|---|---|---|
| `…` | ⏳ a dispatch, background job or agent is **still running** | wait — a result is coming |
| no `…` | ⏹️ you have **stopped** | act: resume, redirect, or accept the result |

**Why this is a rule and not a habit.** A turn can end between the two halves of one row — a file
written but its oracle not yet run, a cell dispatched but not yet reported — and read exactly like a
turn that finished. A habit is what fails there; it failed on 2026-09-02, mid-Wave C, and the owner
had to ask *"is it still running?"* to find out. The marker costs one character and removes the
question.

Three states, three shapes:

```
⏳ Running    …ends with an ellipsis, and names what is running and where its output lands…
⏸️ Paused     no ellipsis. State which row, WHICH HALF of it landed, and the exact resume command.
✅ Complete   no ellipsis. Rows closed, oracles re-run by hand, next command offered.
```

**Rules:**

1. **Only a real, live process earns the `…`.** Never as a stylistic trail-off, never on a finished
   turn. A false `…` is worse than none: it makes the reader wait for something that will never land.

   ⛔ **"I will do it next" is NOT running.** In-session work stops when the turn stops — there is no
   process continuing between messages. Only a genuinely detached job earns the marker: a spawned
   agent, a backgrounded shell command, a delegated CLI dispatch. If the next step is something *you*
   will do, the turn is **⏸️ Paused**, and it owes a resume command.

   | You are about to say | Correct marker |
   |---|---|
   | "dispatched row 19 to grok, output → `grok_v19.log`" | ⏳ `…` — a process is detached and alive |
   | "starting T21 now" | ⏸️ **Paused** — nothing is running; give the resume command |
   | "T3 and T4 landed, oracles green" | ✅ Complete |

   *Recorded because it happened: on 2026-09-02 this rule was written, and the very next message
   ended `Starting T21 now …` with no process running. The owner had to ask twice.*
2. **Name what is running** — the row id, the model or agent, and the file its output goes to. *"Still
   working…"* is not enough to act on.
3. **A paused turn owes a resume command**, copy-pasteable, with the `P=` and role assignments it
   needs. Pausing is legitimate; pausing silently is not.
4. **Not machine-checkable.** This is a rule about the chat response, not about a file, so `lint`
   cannot enforce it — stated plainly rather than pretending a gate covers it.

---

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
   - **Executor Provenance:** Write the executing model name (`Executor: <model_name>`) into the task report metadata/footer block so provenance never again depends on a log directory that may be swept.
5. **Plan Update:** — **SKIP THIS ENTIRE STEP if `--no-plan-update` was passed.** In that case write your task report, print the id + outcome, and stop. Something else owns the plan file (a `--wave` orchestrator running you in parallel with other agents); writing to it would race them.
   - Edit the original plan file. Change the `#` column to a markdown link pointing to your new task report (e.g., `[<ID>](tasks/task_<ID>/task_<ID>_report_<TARGET>_<YYYYMMDD>.md)`).
   - Change `☐ Done` to `✅<br>__YOUR_MODEL_NAME__`. **OVERWRITE rule:** The Done column is NOT cumulative. If another model's name is already there, completely overwrite it with yours. Only the final executor is tracked.
   - **Re-sync ALL THREE derived blocks** in that same file — mandatory, same pass, in this order, per `_shared/output_conventions.md` §10.4:
     **(0)** the `> **Status:**` callout · **(1)** `## 🌊 Next Executable Sequence` (orchestrator-written; the 🌊 matrix has no CLI writer) · **(2)** `## ▶️ How to run this plan` (`wb-flow next <plan.md> --embed`) · **(3)** `## 🧭 What's Next?` (progress line + next actions).
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

# /wbWork — Examples

> Annotated transcripts. Same shape as the `examples` file for any other command.

---

## Example 1 — `/wbWork plan_wb-core_20260503.md` (status check / self-correction)

**User:** `/wbWork plan_wb-core_20260503.md`

**Agent reads:** `wbWork_template.md`, sees no `--id` flag, enters self-correction mode.

**What it does:**
1. Locates the plan at `packages/wb-core/.agents/workflows/reports/2026/05/03/plans/plan_wb-core_20260503.md`.
2. Reads the task table.
3. For each `✅ Done` row, verifies `tasks/task_<ID>/task_<ID>_report_wb-core_<YYYYMMDD>.md` exists. Finds task 2's report missing.
4. Repairs broken markdown links in row 4.
5. Reformats row 6 (had 8 cells in a 7-column table).

**Output (excerpt):**

```
Self-correction summary for plan_wb-core_20260503.md:

✅ Repaired:
 - Row 4: 2 broken file links → relative paths
 - Row 6: column count 8 → 7
 
⚠️ Still missing:
 [REPORT] → `task_1_ai_reference_20260506.md`
 (task marked ✅ Done but no report)
 
Suggested next: /wbWork plan_wb-core_20260503.md --id=2 to regenerate the missing report.
```

**What to notice:** no execution happened. The plan got cleaner, and the agent surfaced a missing artifact instead of silently moving on.

---

## Example 2 — `/wbWork plan_wb-core_20260503.md --id=2` (single-task execution)

**User:** `/wbWork plan_wb-core_20260503.md --id=2`

**Agent does:**
1. Reads task 2 from the plan: *"Add a `version` getter to `WBCore.js` that returns the package.json version string."*
2. Edits `packages/wb-core/src/WBCore.js`, adds the getter.
3. Writes `tasks/task_2/task_2_report_wb-core.md` documenting the change.
4. Updates plan row 2: `#` cell becomes `` ``2`` `` (markdown link to task report), `Done` cell becomes `✅<br>claude-sonnet-4-6`.
5. Suggests `/wbValid plan_wb-core_20260503.md --id=2` to verify.

**What to notice:** one task, one report, one plan update. The atomic unit of work in the system.

---

## Example 3 — `/wbWork plan_wb-core_20260503.md --id=1,2,3` (batch)

**User:** `/wbWork plan_wb-core_20260503.md --id=1,2,3`

**Agent does:** executes tasks 1, 2, 3 in sequence. For each, generates a report, updates the plan row.

**Failure case:** task 2 fails because the file it wants to edit doesn't exist (task 1 was supposed to create it but used the wrong filename). 

**Output:**

```
Task 1: ✅ executed (created src/wbHelpers.js)
Task 2: ❌ FAILED — target file src/wbHelper.js (singular) not found.
 Suggestion: task 1 created src/wbHelpers.js (plural). Either fix
 task 2's target name OR rerun task 1 with the singular spelling.
Task 3: ⏸️ SKIPPED — depends on task 2.
```

**What to notice:** no rollback. Task 1 is committed. Task 2 failed cleanly with a diagnostic. Task 3 was skipped because the plan declared it depends on task 2.

The `Done` column for task 1 is updated (`✅`). Tasks 2 and 3 remain `⬜`. You can rerun once you fix the target name.

---

## Example 4 — `/wbWork plan_wb-core_20260503.md *` (execute all)

**User:** `/wbWork plan_wb-core_20260503.md *`

**Agent does:** finds every `⬜ Done` row, executes them in `#` order. For a 5-row plan with all rows pending, that's 5 reports + 5 plan updates.

**What to notice:** `*` is not `--id=*`. It's a positional argument the template recognizes specially. The flag-normalize block doesn't touch it; the template's task-selection logic does.

**When to use this:** when you wrote the plan yourself and trust every row. When `/wbPlan` wrote the plan and you haven't reviewed it, **don't run `*`** — read first.

---

## Example 5 — `/wbWork plan_wb-core_20260503.md --id>2&&--id<=5` (boolean range)

**User:** `/wbWork plan_wb-core_20260503.md --id>2&&--id<=5`

**Agent does:** evaluates the boolean — tasks 3, 4, 5 match. Executes them in order.

**What to notice:** the AND syntax with `&&`. The agent parses this as `(--id > 2) AND (--id <= 5)`. Comparators on `--id` are evaluated against integer task numbers.

**Mixing AND and OR is not supported.** `--id>2&&--id<5||--id=8` will be rejected with a parse error suggesting you split into two invocations.

---

## Example 6 — `/wbWork plan_X.md --id=2` after `/wbValid` rejected task 2

**Setup:** `/wbValid` previously failed task 2 and reset its `Done` cell to `⬜`. The validation report at the bottom of `tasks/task_2/task_2_report_*.md` says *"FAIL: getter returns hardcoded '1.0.0' instead of reading package.json."*

**User:** `/wbWork plan_X.md --id=2`

**Agent does:**
1. Reads task 2's row → `Task` is the original instruction.
2. Reads `tasks/task_2/task_2_report_*.md` (which exists from the prior run) → sees the FAIL note.
3. Re-implements the task accounting for the validator's feedback.
4. **Appends** to the existing report (does not overwrite) — the failure history stays visible.
5. Updates the plan row: `Done` → `✅<br>claude-sonnet-4-6` again.

**What to notice:** the failed validation history is preserved. The next `/wbValid` run sees both the old FAIL and the new attempt.

---

## Example 7 — `--loop` with a plain state condition (simple command)

**User:** `/wbWork $P --wave=all -y --loop="--id=10"`

**Reads as:**

```
repeat { /wbWork $P --wave=all -y } until the plan has 10 tasks
```

**What it does:**
1. Runs the body once — `--wave=all` walks every wave in order.
2. Counts task rows in the plan. 6 → condition unmet.
3. Runs again. Rows added by the iteration are picked up because the matrix is recomputed each pass.
4. At 10 rows the condition holds and the loop exits, reporting **satisfied · 3 iterations · 6 → 8 → 10**.

**What to notice:** the body runs **before** the first check. `--loop` is repeat-until, not while-do —
a condition already true at the start still costs one iteration.

---

## Example 8 — a compound condition (clear condition, two terms)

**User:** `/wbWork $P --wave=all -y --loop="--id=10 and --Valid=true"`

**What it does:**
1. After each iteration, evaluates both terms: 10 task rows **and** every row carrying a validation.
2. Iteration 3 reaches 10 rows but two rows are still `⬜` in `☐ Valid` → condition unmet, continue.
3. Iteration 4 validates them → both terms hold → exit.

**Output (excerpt):**

```
🔁 loop 4/5 — condition: --id=10 and --Valid=true
   --id=10      ✅ 10 rows
   --Valid=true ✅ 10/10 validated
   → satisfied after 4 iterations
```

**What to notice:** `and` / `or` join any two conditions. Both terms are reported separately, so a loop
that stops on its bound tells you *which* term never held.

---

## Example 9 — an external condition (a command's score)

**User:** `/wbWork $P --wave=all -y --loop="/wbAudit >= 9.5"`

**Reads as:**

```
repeat { /wbWork $P --wave=all -y ; /wbAudit <target> } until the audit score >= 9.5
```

**What it does:**
1. Runs the body, then dispatches `/wbAudit` **as a separate process** and parses its score.
2. 8.0 → unmet. The audit's `--wbPlan` phase adds rows for what it found, so the next iteration has work.
3. 9.0 → unmet. 9.5 → exit.

**What to notice — two things that are easy to get wrong:**

- The audit must be dispatched **independently** (`.wb/bin/wbRun claude -p … "/wbAudit …"`). Run in the
  same session that did the work, the exit depends on a number the author assigns itself.
- **Pin the rubric** in that invocation. Unpinned, the same unchanged tree scored **8.5** by holistic
  judgement and **7.0** against a line-by-line rubric — a 1.5 swing with no code change. If the
  threshold is 9.5, that gap decides whether the loop stops.

---

## Example 10 — multiple commands in one loop (bracketed form)

**User:** `[/wbWork $P --wave=all -y  /wbAudit $C --wbPlan -y] --loop="/wbAudit >= 9.5"`

**What it does:**
1. Runs each bracketed command in order, as one iteration.
2. Evaluates the condition once, after the whole set.
3. Repeats until satisfied, bounded, stuck or blocked.

**What to notice:** this is what someone reaching for `/wbAudit --loop` usually means. `--loop` is
**refused** on read-only commands run alone — looping an audit until its own number moves is either a
no-op (the code did not change, so the findings did not change) or a way to re-score until the answer
is the desired one. Put the audit in the body *and* the condition, not in the body alone.

---

## Example 11 — when the loop stops without satisfying the condition

**User:** `/wbWork $P --wave=all -y --loop="/wbAudit >= 9.5" --loop-max=3`

**Output (excerpt):**

```
🔁 loop 2/3 — condition: /wbAudit >= 9.5
   iteration 1: score 8.0 · 3 rows closed
   iteration 2: score 8.0 · 0 rows closed · no measurable change
   → STUCK after 2 iterations. Last score 8.0, threshold 9.5.
     Remaining findings need decisions the plan does not contain.
```

**What to notice:** three of the four exits are *not* "satisfied".

| Exit | Meaning |
|---|---|
| **satisfied** | the condition held |
| **bound reached** | `--loop-max` hit — the condition may still be reachable |
| **stuck** | an iteration changed nothing measurable — iterating again cannot help |
| **blocked** | a step needed a decision the plan does not contain, or a human hand — **reported even under `-y`** |

A loop that reports only "done" hides whether it converged or gave up.

---

## Example 12 — why `--wbPlan` is implied in a condition (recursion)

**User:** `/wbWork $P --wave=all -y --loop="/wbAudit >= 9.5"`

The condition command runs with `--wbPlan` **by default**, so this is identical to:

`/wbWork $P --wave=all -y --loop="/wbAudit --wbPlan >= 9.5"`

**Why that matters — the same loop, with and without it:**

| | With `--wbPlan` (default) | With `--no-wbPlan` |
|---|---|---|
| Iteration 1 | body runs wave J · audit scores 9.0 · **adds 2 rows** | body runs wave J · audit scores 9.0 · findings discarded |
| Iteration 2 | body has 2 new rows to run · audit scores 9.5 → **satisfied** | body has no open rows · nothing changes → **stuck** |

Without it the loop is not a loop. The audit measures, reports, throws the findings away, and the next
body runs against an unchanged plan — so guard 2 correctly ends it after one pass of real work.

```
body → condition command → new rows → body has work → condition command → …
        (measures)          (feeds the next pass)
```

**What to notice:** the condition command has two jobs, not one. It decides whether to stop **and** it
supplies what the next iteration will do. `--no-wbPlan` is available and rarely right — it turns the
loop into a poll that converges only if the plan already holds enough open rows to reach the threshold.

---

## Example 13 — the wave list is a forecast, not a schedule

**User:** `/wbWork $P --wave=all -y`

**The CLI prints:**

```
🌊 --wave=all is an orchestrator loop, not a single script.
   3 wave(s) in order: A → B → C

   ⚠️  This list is a FORECAST of the current table, not a schedule.
   Run the FIRST wave only, transcribe its results, then RECOMPUTE:
       wb-flow next <plan> --embed
   …and read the next wave fresh. Later labels may not survive the first wave.
```

**Wrong — walking the printed list:**

```bash
for W in A B C; do wb-flow wave $P --wave=$W; done   # ❌
```

**Right — recompute between waves:**

```bash
wb-flow wave $P --wave=A        # first wave only
# transcribe ☐ Done / ☐ Valid into the task table
wb-flow next $P --embed         # recompute matrix + run-book
wb-flow wave $P --wave=<whatever is first now>
```

**What goes wrong with the loop:** the `for` version dispatched waves B and C from a matrix computed
**before** A ran. Their validator cells carried task ids that A had already closed, so both reported
`NO-OP` on rows that were no longer in the table — and four rows ended **done but unvalidated**. Nothing
failed loudly. The next audit then scored a tree whose validation state was incomplete, for reasons
having nothing to do with the code.

**What to notice:** after a wave, the matrix can gain waves (`A1`, `B1`), lose waves whose rows closed,
and hold rows postponed out of the wave that just ran. Only the **first** wave of a freshly-read matrix
is ever safe to dispatch.

---

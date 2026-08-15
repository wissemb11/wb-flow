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

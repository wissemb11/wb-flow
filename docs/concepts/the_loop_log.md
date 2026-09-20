---
title: The loop log
description: Why an unattended --loop run writes a loops/loop_<i>.md trace, and what has to be in it.
---

# The loop log — `loops/loop_<i>.md`

`/wbWork <plan> --wave=all -y --loop="<condition>"` can run for hours, across several iterations, many
waves and a dozen agent dispatches. When it finishes — or is killed — the only question that matters is
*what happened, and why did it stop there?*

Without a trace, the answer lives in chat scrollback: unsearchable, unshareable, and gone when the
session ends. The loop log is the **DevTools console for a loop run**. It sits beside the plan, next to
`tasks/`, `waves/` and `explanations/`:

```
.wb/workflows/reports/<Y>/<M>/<D>/plans/
├── plan_<scope>_<date>.md
├── tasks/          one folder per task report
├── waves/          generated dispatch scripts
└── loops/
    └── loop_1.md   ← one file per --loop INVOCATION (not per iteration)
```

## What it must contain

| Section | Content |
|---|---|
| Header | the exact invocation, `--loop-max`, start time, current status |
| **Algorithm** | the repeat/until pseudo-code **and** an ASCII diagram of body → condition → next iteration |
| **Per iteration** | every wave, its cells, the model each ran on, the per-cell verdict |
| **Issues discovered** | a table: issue → the task that surfaced it → the row it became |
| **Condition check** | the command dispatched, the score, and **why it did or did not hold** |
| Verdict | iterations run · bound · **full trajectory** · goal reached or not |

## The load-bearing section is "Issues discovered"

A `--loop` condition runs with `--wbPlan` implied, which is what makes the loop *recursive* rather than
merely repeating:

```
body → condition command → new rows in the plan → body has work → condition command → …
        (measures)          (feeds the next pass)
```

An issue that a task discovers but nobody records cannot become a row, so the next iteration re-dispatches
the same failing cell and the loop spins until its bound. **The Issues table is the hand-off between
iterations** — iteration N's discovery is iteration N+1's task row. Everything else in the file is
context; this part is mechanism.

## Two rules learned the hard way

**Write it as you go, not at the end.** A loop can be killed mid-iteration — by the operator, a crash, or
a quota wall. Loop 1 of `plan_wb-flow_20260913.md` was stopped by its operator 19 minutes into iteration
3's condition check; because each iteration had been appended as it closed, the trace survived intact.

**Record the orchestrator's own mistakes, not just the agents'.** A wrong measurement, a `pgrep` pattern
that matched its own command line, a mis-read row count — these change what the loop did and belong in
the trace. A log that only records the agents' errors is not a debug log; it is a defence.

## Related

- [The re-derive loop](the_rederive_loop.md) — why the matrix is read fresh every wave
- [Report lifecycle](report_lifecycle.md) — where each artifact lives

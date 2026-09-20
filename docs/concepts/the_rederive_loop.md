---
title: "The Re-derive Loop: why a wave list is a forecast, not a schedule"
description: "The canonical execution model for multi-wave runs — read fresh, take the first wave only, transcribe, re-derive. Each line exists because skipping it caused a recorded, silent failure."
---

# The Re-derive Loop

> **Audience:** anyone running `--wave=all`, `--loop`, or building an orchestrator that plans then executes.
> **Related:** [Command Composition](command_composition.md) · [wbWork template](../commands/wbWork/wbWork.md)

## The loop

```
repeat {
    W ← the FIRST wave in the matrix, read fresh from the plan file
    dispatch W · wait · classify every cell by the three gates
    transcribe ☐ Done / ☐ Valid into the task table
    rewrite the 🌊 matrix from the updated task table, then regenerate the run-book:  wb-flow next <plan> --embed
} until the recomputed matrix is empty
```

**Tool-neutral form** — the same shape, for anyone not using wb-flow:

```
repeat {
  step ← FIRST item of the plan, re-read from durable state
  execute · classify the outcome
  write the outcome back to the plan
  re-derive the plan from the updated state
} until the re-derived plan is empty
```

## The outer loop: when is it actually finished?

The re-derive loop above exhausts the matrix. That is **not** the same as being done, because the
condition command that decides whether to stop **also writes work**:

```
repeat {
    <the re-derive loop above, run until the matrix is empty>
    score ← the condition command, with --wbPlan implied
    recompute the matrix          ← the condition command may have added rows
} until  the matrix is empty  AND  the condition holds
```

| Matrix after the condition check | Condition holds | Verdict |
|---|---|---|
| empty | yes | ✅ **satisfied** — the only exit meaning "done" |
| empty | no | ↻ iterate |
| **not** empty | yes | ↻ **iterate** — it found work while passing |
| not empty | no | ↻ iterate |

Stopping on an empty matrix alone reports success while the condition command's own findings sit
unworked. Stopping on the score alone leaves the matrix unexamined. **Both halves, every time.**

The recompute after the condition check matters for the same reason it matters after a wave: the
condition command mutates the plan the body reads. Skipping it is the stale-list defect one level up.

## Why each line is there

Every line prevents a failure that has actually occurred in this repository.

| Line | Skip it and… |
|---|---|
| read **fresh from the plan file** | you re-use the in-memory list — which is the thing that was already wrong |
| take the **FIRST** wave only | every later wave was computed against a table that no longer exists |
| **classify by the three gates** | you transcribe a *verdict* instead of a *result*; a cell has reported `NO-OP` while deleting a module's core logic |
| **transcribe** before re-deriving | the re-derive reads the task table; an untranscribed result is invisible to it, so you re-run the wave you just ran |
| **re-derive** both blocks | the 🌊 matrix has no CLI writer; if the orchestrator does not rewrite it before `wb-flow next <plan> --embed` refreshes the run-book, validators dispatch against rows that closed two waves ago, report `NO-OP` on a row that is not there, and rows finish *done but unvalidated* with nothing failing loudly |
| loop | the next wave is read fresh — it may be a label the first forecast never mentioned |

## The failure this is named after

A wave list was printed as `A → B → C` and walked with `for W in A B C`. The list had been computed
**before wave A ran**. Wave A closed several rows. Waves B and C then dispatched validator cells still
carrying pre-A task ids — ids that no longer existed. Each validator looked for its row, did not find
it, and correctly reported "nothing to do".

Every wave reported success. Four rows finished **done but unvalidated**. Nothing errored. The work was
fine; the schedule was stale.

## This is not a new idea

The loop is **continuous re-planning** — receding-horizon execution — which has been standard in
robotics and classical planning for decades. Nothing here is novel as an algorithm.

What is worth writing down is the *failure mode*: orchestrators print a schedule, the schedule looks
like a commitment, and walking it produces work that completes successfully against stale assumptions.
That failure is quiet, which is what makes it worth naming.

## The one-line test

> **Can executing a step change what comes after it?**

If yes, you do not have a schedule — you have a forecast, and any code shaped like
`for step in precomputed_list` is a latent version of the failure above.

For agent orchestration the answer is almost always yes: a task discovers a prerequisite, a review
generates follow-up work, a dependency slips and something is postponed, a wave closes rows a later
wave intended to check.

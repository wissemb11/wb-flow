---
title: "Plan State Management"
description: "Describes the five-state task machine for plans, with CLI flags for declarative state transitions without conversational parsing."
---

# Plan State Management — 

> A plan is a state machine, not a checklist. Tasks live in five states, not two. The CLI flags below let you transition between states declaratively — no conversational prompts, no parsing ambiguity.

---

<div align="center">
<StateTransitionAnimation />
*Five task states: Open ⬜ → Done ✅ / Deferred ⏸️ / Cancelled 🚫 / Blocked 🔄. Only ⬜ and 🔄 trigger standup flags.*
</div>

## The five states

A plan task carries two cells per row: `Done` (worker side) and `Valid` (validator side). Each cell can be in any of these states:

| State | Glyph | What it means | How `/wbStandup` reads it |
|---|---|---|---|
| **Open** | `⬜` | Pending. Worker (or validator) has not picked it up yet. | "Incomplete debt — schedule it." |
| **Done / Valid** | `✅` | Resolved. Worker shipped or validator approved. | Skip — done. |
| **Deferred** | `⏸️` | Intentionally postponed. Not a bug, not stale. | Skip — acknowledged. |
| **Cancelled** | `🚫` | No longer relevant. Won't be done, ever. | Skip — dead. |
| **Blocked** | `🔄` | Cannot proceed. External dependency / decision needed. | **Flag as CRITICAL.** |

`⬜` and `🔄` are the only two states that show up in standup as work-needing-attention. The other three are quiet by design — `/wbStandup` shouldn't keep nagging about a task you deliberately deferred or cancelled.

The distinction between **Deferred** and **Cancelled** matters: deferred tasks come back when their reason expires; cancelled tasks don't. If you cancel and later realize you needed it, you re-add it as a new row.

## The override flags

Three CLI flags transition state without executing the task:

| Long | Short | Sets | Notes |
|---|---|---|---|
| `--open` | `-o` | `⬜` | Re-opens a task. Use when validation rejected a worker's output and you want them to retry. |
| `--def` | `-d` | `⏸️ Deferred` | Postpones intentionally. The task is not lost — you can `--open` it later. |
| `--can` | `-c` | `🚫 Cancelled` | Kills the task. Comes back only as a *new* row. |

These are **declarative** — when present, the command **skips its normal execution** and only mutates the plan's state cells. No code is written. No QA is run.

Why the explicit flags rather than asking the AI? Because *"mark task 3 as deferred"* is parsed differently by every model on a bad day, and a misparse on a state transition silently corrupts the plan. The flag form is unambiguous; the conversational form is fragile.

## Which command touches which cell

Each plan row has a `Done` cell and a `Valid` cell. The override flags scope by command:

| Command | Cell(s) it mutates |
|---|---|
| `/wbWork` | `Done` only |
| `/wbValid` | `Valid` only |
| `/wbPlan` | `Done` AND `Valid` |

This is deliberate. `/wbWork` is the worker's mode of address; it has no business touching the validator's column. `/wbValid` is the validator's mode of address; same logic in reverse. `/wbPlan` is the plan's *owner* — it sees both columns.

So:

- `/wbWork plan.md --id=2 --open` → `Done` for task 2 reverts to `⬜`. `Valid` is untouched.
- `/wbValid plan.md --id=2 --can` → `Valid` for task 2 becomes `🚫`. `Done` is untouched.
- `/wbPlan plan.md --id=2 --def` → BOTH cells become `⏸️ Deferred` in one shot.

## Multi-flag and tie-breaking

If you pass multiple state flags in one call, **the rightmost wins**:

```
/wbWork plan.md --id=2 --open --def
```

→ Task 2 ends up `⏸️ Deferred`. The `--open` was a transient — it never landed.

This is by design: the same rule (left-to-right, last wins) is how shell flags compose. It also lets you script `--open --can` as "force-cancel even if currently re-opened" without thinking about precedence.

## ID expression syntax (same as `/wbWork`)

The `--id` argument accepts the full expression syntax:

| Form | Targets |
|---|---|
| `--id=2` | Task 2 only |
| `--id=1,2,3` | Tasks 1, 2, 3 |
| `--id>=5` | Task 5 and above |
| `--id<3` | Tasks below 3 |
| `--id!=4` | All tasks except 4 |
| `--id=1&&--id<5` | AND: tasks 1 through 4 (ish — see operator docs) |
| `--id=1\|\|--id>10` | OR: task 1 or anything above 10 |
| `*` (no flag) | All tasks |

So `/wbPlan plan.md --id>=5 --can` reads as: "in the plan, for tasks 5 and above, set both `Done` and `Valid` to `🚫 Cancelled`." Bulk cleanup in one call.

## When to use these flags

- **`--open`**: validator rejected a task. Reset `Done` so the worker re-runs.
- **`--def`**: priorities shifted; this task is real but not now. Defer instead of letting it become an `⬜` that nags every standup.
- **`--can`**: you wrote the task assuming X; X turned out wrong; the task is dead. Cancel rather than delete the row — the audit trail matters.

## When NOT to use them

- **As a substitute for `/wbWork` or `/wbValid`.** The state flags don't run the task; they just change its label. Marking a task `✅` without doing the work is lying to your future self.
- **On `✅ Valid` tasks without thinking.** Re-opening validated work undoes the validation; you'll need a fresh `/wbValid` pass after the worker re-runs. That's fine when intentional, costly when accidental.
- **In place of a plan rewrite.** If 8 of 10 rows need cancelling, the plan is wrong. Rewrite it; don't `--can` your way out.

## Worked examples

```
# Validator rejected task 1's output. Send it back.
/wbWork plan_core2_20260503.md --id=1 --open

# Defer the Vue 3 migration (task 3) — both worker and validator side, in one move.
/wbPlan plan_core2_20260503.md --id=3 --def

# Cancel everything from task 5 onward — they were planned against an old assumption.
/wbPlan plan_core2_20260503.md --id>=5 --can

# Validator only: cancel validation on tasks 8 and 9 (worker output was experimental).
/wbValid plan_core2_20260503.md --id=8,9 --can

# Re-open the whole plan (worker side only) — you want a fresh execution pass.
/wbWork plan_core2_20260503.md * --open
```

## The plan file's anatomy

A plan file is not a document with a table in it. It is **one authored table plus four derived projections of that table** — and knowing which is which tells you what you may edit by hand.

| # | Block | Derived from | Regenerated by |
|---|---|---|---|
| — | The task table | *authored* | you, `/wbWork`, `/wbValid` |
| 0 | `> **Status:** …` callout | the table | recompute by hand (counts) |
| 1 | `## 🌊 Next Executable Sequence` | the table (`Dep`, `Requires`, Done, Valid) | rebuilt whole, never cell-edited |
| 2 | `## ▶️ How to run this plan` | **block 1** | `wb-flow next <plan.md> --embed` |
| 3 | `## 🧭 What's Next?` | blocks 0–2 | recompute by hand |

**Note:** The task-table counts (T/D/V) are scoped to the task table, so an unrelated numbered table in a plan no longer inflates them.

**The order 0 → 1 → 2 → 3 is not optional.** Block 2 derives from block 1; block 3 summarises both. Regenerating block 3 first publishes a confident summary of a schedule that has already moved — worse than leaving it stale, because it *looks* current.

Blocks 1–3 sit in that order in the file: the matrix, then the how-to-run block **directly beneath its table**, then What's Next. The runbook belongs next to the schedule it was computed from.

**Wave notes live in `tasks/waves.md`.** Collision analysis, blocking priority and gate reasons are externalized; the plan carries a one-line pointer. Notes grow every wave — inline, they push the task table below a screen of prose about waves that already ran.

**Run the sync oracle after every edit:**

```bash
bash <core>/templates/commands/_shared/sync_check.sh <plan.md>
# ✓ SYNC OK — table 10/12 done, 4/12 valid; matrix, how-to-run and What's Next agree
```

**Important sync_check behaviors:**
- `sync_check` refuses rather than guesses when a plan has NO parseable task rows: `✗ SYNC: no task rows parsed — refusing to judge completeness`. Previously such a file was reported as 'all rows closed', i.e. a file it could not read was called finished.
- `sync_check` check #6 — the narrative 'Status is …' sentence in What's Next must agree with the table, and a What's Next dispatch bullet may not name a row that is already done+validated.

It exits non-zero and names the block that drifted. A plan that fails it is not "slightly out of date" — it is **actively misleading**, and every downstream dispatch inherits the error.

## Multi-ID merged dispatches (`--id=X,Y`)

Two dispatches in the same wave sharing a **scope**, a **role** and a **routed model** merge into one command:

```bash
/wbWork plan.md --id=5,6 -M="DeepSeek V4 Pro"   # not two separate invocations
```

One context read per model per wave instead of *N* — while per-ID report checking and gate verification stay independent, so a merged cell still reports `5 ✓ / 6 ✗`.

Validators merge on **their own** model and scope, not on how the work they check was grouped: `/wbValid plan.md --id=5` and `--id=6,7` on the same validator must render as `--id=5,6,7`.

> ⚠️ **Batching yields to executor≠validator, never the reverse.** Two `/wbValid` cells sharing a model must NOT merge if their ids had *different executors* — routing classifies a merged validate cell from one id and applies that verdict to the whole batch, silently producing a self-validation. Split the cell and pin the model with an explicit `-M`.

## `--wave=A` means work **then** validate

A wave is two rows — `A · 🔨 work` and `A · ✅ validate` — and running the label runs both, in order:

```bash
/wbWork plan.md --wave=A          # ≡ --wave=A.work, then --wave=A.valid
/wbWork plan.md --wave=A.work     # dispatches only
/wbWork plan.md --wave=A.valid    # pairings only
```

The pairing sits directly under the work it checks, so **a wave is a complete unit** — dispatch, then verdict — rather than a promise redeemed a wave later.

> ⚠️ **One label per invocation.** `--wave=C,D` does not exist: a comma list is read as the literal label `C,D`, matches no row, and exits non-zero.

## The four copy/paste scenarios

Below every matrix, four explicit non-overlapping scenarios — because "here is the matrix, work out what to run" is where readers stall:

| # | Scenario | Shape |
|---|---|---|
| 1 | Next wave, orchestrated | `/wbWork plan.md --wave=A -y` (work + valid) |
| 2 | Next wave, individual dispatches | grouped by model, each with its explicit `-M="…"` |
| 3 | All remaining waves, orchestrated | `--wave=all`, **or** its closest safe equivalent |
| 4 | All remaining waves, individual dispatches | every wave's commands, in order |

An individual dispatch always carries its model flag. A bare `/wbWork plan.md --id=5` inherits whatever roster is current — which is how a cell ends up run by a model nobody chose.

**Scenario 3 never offers and refuses in one breath.** No derived blocker → emit `--wave=all`, annotated. A blocker exists → emit the closest safe equivalent: one command per wave, in order, with a `⏸` pause line before each wave that needs a human. A wave gets a `⏸` line **iff** it contributed a bullet to *Why not `--wave=all`*, so the two cannot drift apart.

## Consolidating open tasks across days

The state machine above governs one file. Across days, `/wbPlan <plan_file.md>` sweeps the scope's whole `reports/` tree and pulls every row still `⬜` or `🔨` into today's plan, so one file answers *"what is open?"*. `⏸️ Deferred` and `🚫 Cancelled` rows do not come forward — they are decided, not open.

See [Report Lifecycle](report_lifecycle.md) for the full model, including `--archive`.

---

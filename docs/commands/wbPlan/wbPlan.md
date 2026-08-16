# /wbPlan — Generate execution plans from audits or ideas

Reads diagnostic reports and produces a ranked, prioritized task table with worker/validator assignments, model recommendations, and time estimates.

## When to Use

**Run this when:** You have an audit or idea and need a structured execution plan.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbPlan_eli5](wbPlan_eli5.md) | What this command does in plain English |
| Practical | [wbPlan_practical](wbPlan_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbPlan_expert](wbPlan_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbPlan_exhaustive_simulation.md](wbPlan_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbPlan_live_demo.md](wbPlan_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not execute any code — it only produces plan tables.
- ❌ Does not validate the plan — use /wbValid after execution.
- ❌ Does not handle multi-scope plans in one invocation.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbPlan` in a workflow


## How It Works

Uses scope decomposition, dependency resolution, and resource leveling.

## Key Options

| Flag | Description |
|---|---|
| `--resume` / `-r` | Re-read the existing plan file and pick up unfinished work |
| `--scope` / `-s` | Limit planning to a specific sub-tree or package |
| `--task` / `-t` | Explicit task description for inline planning |
| `--id` / `-i` | Target specific task indices for state manipulation |
| `--open` / `-o` | Set `☐ Done` and `☐ Valid` to `⬜` (Open) |
| `--def` / `-d` | Set `☐ Done` and `☐ Valid` to `⏸️` (Deferred) |
| `--can` / `-c` | Set `☐ Done` and `☐ Valid` to `🚫` (Cancelled) |
| `--archive` / `-A` | Consolidate, then retire superseded `<DD>/plans/` folders to `.wb/workflows/archives/` |
| `--dry-run` / `-n` | With `--archive`: print the move list, move nothing |
| `--keep=<N>` | With `--archive`: keep the N newest plan folders instead of 1 |

## Consolidate & Archive

Passing an existing plan file with **no other flags** means *"make this the one file I have to read."*

```bash
/wbPlan plan_packages_20260731.md              # absorb every older open task, then repair in place
/wbPlan plan_packages_20260731.md --archive    # …then retire the plan folders it just emptied
```

Six steps, in this order:

| # | Step | Detail |
|---|---|---|
| 0 | **Absorb** | Pull every row still `⬜` or `🔨` from every other `plan_<scope>_*.md` in this scope's `reports/` tree |
| 1 | **Repair links** | Canonical hrefs, basename labels |
| 2–3 | **Structure** | Sections present, in canonical order; insert any that are missing |
| 4 | **Gap-fill** | Tick `☐ Done` / `☐ Valid` where a task report exists |
| 5 | **Recompute** | Matrix over the *merged* table → `wb-flow next --embed` → What's Next → run the sync oracle |
| 6 | **Archive** *(`--archive` only)* | Preview with `wb-flow archive <this file> --dry-run`, show the list, then apply |

Step 0 has two rules that decide whether the merge is safe:

- **De-duplicate on the task's text, not its ID** — IDs restart per file, so de-duplicating by ID collapses unrelated tasks.
- **Renumber contiguously, then rewrite every `Dep` cell** — a `Dep` pointing at a pre-merge ID is the one way this step corrupts a plan.

`⏸️ Deferred` and `🚫 Cancelled` rows are decided, not open; they stay where they are. Source files are read, never modified.

> 🔴 **Step 6 never runs if steps 0–5 did not complete.** Archiving before unification does not delete a task — it makes it invisible: nothing live references it, and the next `/wbStandup` no longer scans the tree it sits in. Without `--archive`, step 5 merely *offers* the sweep.

Full model: [Report Lifecycle](../../concepts/report_lifecycle.md).

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../start_here/installation.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

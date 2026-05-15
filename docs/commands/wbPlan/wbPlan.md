# /wbPlan — Generate execution plans from audits or ideas

Reads diagnostic reports and produces a ranked, prioritized task table with worker/validator assignments, model recommendations, and time estimates.

## When to Use

**Run this when:** You have an audit or idea and need a structured execution plan.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbPlan_eli5.md](wbPlan_eli5.md) | What this command does in plain English |
| Practical | [wbPlan_practical.md](wbPlan_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbPlan_expert.md](wbPlan_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | ⏳ *Not yet written* | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | ⏳ *Not yet written* | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not execute any code — it only produces plan tables.
- ❌ Does not validate the plan — use /wbValid after execution.
- ❌ Does not handle multi-scope plans in one invocation.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbPlan/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

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

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

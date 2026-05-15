# /wbValid — Validate task completion

Verifies that a completed task meets its acceptance criteria. Reads the plan's Verify column and checks each condition.

## When to Use

**Run this when:** You finished a task and need to confirm it meets acceptance criteria.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | ⏳ *Not yet written* | What this command does in plain English |
| Practical | [wbValid_practical.md](wbValid_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbValid_expert.md](wbValid_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [wbValid_examples_part1.md](wbValid_examples_part1.md) | Annotated transcripts from actual sessions |
| Simulation | [wbValid_exhaustive_simulation.md](wbValid_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbValid_live_demo.md](wbValid_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not execute tasks — it only validates completed ones.
- ❌ Does not audit overall quality — use /wbAudit for that.
- ❌ Does not fix issues found — use /wbWork to remediate.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbValid/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbValid` in a workflow


## How It Works

Runs 7 categories: structure, config, deps, templates, permissions, cross-refs.

## Key Options

| Flag | Description |
|---|---|
| `--id` / `-i` | Universal column filter — validate specific tasks (e.g., `--id=1,2,3`) |
| `--p` | Filter by priority (`--p=P1`) |
| `--done` | Validate tasks that are already marked Done |
| `--worker` | Validate tasks worked on by a specific model |
| `--open` / `-o` | Set `☐ Valid` to `⬜` (Open) — state override |
| `--def` / `-d` | Set `☐ Valid` to `⏸️` (Deferred) — state override |
| `--can` / `-c` | Set `☐ Valid` to `🚫` (Cancelled) — state override |

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

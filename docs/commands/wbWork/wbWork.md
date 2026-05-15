# /wbWork — Execute a specific task from a plan

Picks up a task from a plan file and executes it. The core worker command that turns plan rows into completed deliverables.

## When to Use

**Run this when:** You have a plan with tasks and need to execute a specific one.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | ⏳ *Not yet written* | What this command does in plain English |
| Practical | [wbWork_practical.md](wbWork_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbWork_expert.md](wbWork_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbWork_exhaustive_simulation.md](wbWork_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbWork_live_demo.md](wbWork_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not plan — it only executes existing plan tasks.
- ❌ Does not validate its own output — use `/wbValid` after.
- ❌ Does not audit — use `/wbAudit` for quality assessment.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbWork/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbWork` in a workflow


## How It Works

Orchestrates sub-commands: understands task type, chains Plan→Check→Test→Review.

## Key Options

| Flag | Description |
|---|---|
| `--id` / `-i` | Universal column filter — target specific tasks (e.g., `--id=1,2,3`) |
| `--p` | Filter by priority (`--p=P1`) |
| `--est` | Filter by estimated time (`--est<=30`) |
| `--open` / `-o` | Set `☐ Done` to `⬜` (Open) — state override, no execution |
| `--def` / `-d` | Set `☐ Done` to `⏸️` (Deferred) — state override |
| `--can` / `-c` | Set `☐ Done` to `🚫` (Cancelled) — state override |

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

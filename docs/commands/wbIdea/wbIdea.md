# /wbIdea — Capture and manage improvement ideas

Registers new ideas into a scored pipeline, maintains the idea backlog, and promotes ideas to plan tasks when they mature.

## When to Use

**Run this when:** You have an improvement idea and want to register it for future action.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | ⏳ *Not yet written* | What this command does in plain English |
| Practical | ⏳ *Not yet written* | A step-by-step walkthrough on a real project |
| Expert | ⏳ *Not yet written* | Architecture, edge cases, and when NOT to use |
| Examples | [wbIdea_examples.md](wbIdea_examples.md) | Annotated transcripts from actual sessions |
| Simulation | [wbIdea_exhaustive_simulation.md](wbIdea_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbIdea_live_demo.md](wbIdea_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not execute ideas — it only captures and scores them.
- ❌ Does not plan execution — use /wbPlan to convert ideas to tasks.
- ❌ Does not validate ideas — use /wbValid after implementation.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbIdea/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbIdea` in a workflow


## How It Works

Stored in .wb/ideas/ with metadata. Scored automatically.

## Key Options

| Flag | Description |
|---|---|
| `--resume` / `-r` | Re-read existing idea file and re-score |
| `--scope` / `-s` | Scope override — limit to a sub-tree |
| `--task` / `-t` | Explicit idea description |
| `--id` / `-i` | Target specific idea indices |
| `--promote` / `-p` | Promote idea(s) to today's plan file |
| `--reject` / `-x` | Mark idea(s) as `🚫` Rejected |
| `--defer` / `-d` | Mark idea(s) as `⏸️` Deferred |

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

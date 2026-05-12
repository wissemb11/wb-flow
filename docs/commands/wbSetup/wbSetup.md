# /wbSetup — Initialize a new project or package

## Overview

`/wbSetup` scaffolds the initial file structure, configuration, and workflow files for a new project or package within the monorepo. It creates the `.wb/workflows/` directory tree, generates starter `context.md` and `dev.md` files, and sets up the report folder structure. The command is the entry point for any new project — it establishes the conventions that all subsequent `/wb*` commands will follow.

## When to Use

**Run this when:** You are starting a new project and need the standard monorepo structure and workflow files created.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbSetup_eli5.md](wbSetup_eli5.md) | What this command does in plain English |
| Practical | [wbSetup_practical.md](wbSetup_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbSetup_expert.md](wbSetup_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbSetup_exhaustive_simulation.md](wbSetup_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbSetup_live_demo.md](wbSetup_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not generate content — it only creates the skeleton structure.
- ❌ Does not configure CI/CD — use `/wbDeploy` for that.
- ❌ Does not plan work — use `/wbPlan` after setup.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbSetup/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbSetup` in a workflow


## How It Works

Idempotent, framework-aware, creates full .wb/ directory structure with templates.

## Key Options

| Flag | Description |
|---|---|
| `--focus` / `-f` | Focus on a specific area (e.g., `--focus=identity` for just context.md) |
| `--scope` / `-s` | Limit setup to a sub-tree or package |
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

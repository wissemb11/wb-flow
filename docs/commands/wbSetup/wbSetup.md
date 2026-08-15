---
title: "wbSetup — Initialize a new project or package"
description: "## Overview"
---

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

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbSetup` in a workflow


## How It Works

Idempotent, framework-aware, creates full .wb/ directory structure with templates.

## Flags & Shortcuts

Both forms are equivalent — pass either:
| Long form | Shortcut |
|---|---|
| `--focus` | `-f` |
| `--scope` | `-s` |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

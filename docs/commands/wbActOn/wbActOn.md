---
title: "wbActOn — Turn diagnostics into ranked actions"
description: "/wbActOn is the command reference resolver that bridges diagnosis and execution."
---

# /wbActOn — Turn diagnostics into ranked actions

## Overview

`/wbActOn` is the command reference resolver that bridges diagnosis and execution. It reads an audit, review, or plan file and produces a Ranked Execution Order — converting passive findings into active, prioritized tasks. It is read-only and never modifies the source diagnostic file.

## When to Use

**Run this when:** You have a diagnostic report and need to decide what to fix first.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbActOn_eli5.md](wbActOn_eli5.md) | What this command does in plain English |
| Practical | [wbActOn_practical.md](wbActOn_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbActOn_expert.md](wbActOn_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbActOn_exhaustive_simulation.md](wbActOn_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbActOn_live_demo.md](wbActOn_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not execute any code — it only ranks findings.
- ❌ Does not modify the source diagnostic file.
- ❌ Does not validate whether the ranked actions are correct — use `/wbValid`.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbActOn` in a workflow


## How It Works

Reads action items from JSON/text, executes them in dependency order, creates granular commits.

## Flags & Shortcuts

Both forms are equivalent — pass either:
| Long form | Shortcut |
|---|---|
| `--act` | `-a` |
| `--wbPlan` | `-P` |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

---
title: "wbValid — Validate task completion"
description: "Verifies that a completed task meets its acceptance criteria. Reads the plan's Verify column and checks each condition."
---
# /wbValid — Validate task completion

Verifies that a completed task meets its acceptance criteria. Reads the plan's Verify column and checks each condition.

## When to Use

**Run this when:** You finished a task and need to confirm it meets acceptance criteria.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbValid_eli5.md](wbValid_eli5.md) | What this command does in plain English |
| Practical | [wbValid_practical.md](wbValid_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbValid_expert.md](wbValid_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [wbValid_examples.md](wbValid_examples.md) | Annotated transcripts from actual sessions |
| Simulation | [wbValid_exhaustive_simulation.md](wbValid_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbValid_live_demo.md](wbValid_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not execute tasks — it only validates completed ones.
- ❌ Does not audit overall quality — use /wbAudit for that.
- ❌ Does not fix issues found — use /wbWork to remediate.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbValid` in a workflow


## How It Works

Runs 7 categories: structure, config, deps, templates, permissions, cross-refs.

---

## Flags & Shortcuts

| Flag | Alias | Description |
|---|---|---|
| `--id`, `--p`, `--done`, etc. | `-i`, etc. | Universal Column Filtering. Targets tasks based on any column in the plan table (supports `=, >, <, !=, *, &&, ||`). |
| `--no-plan-update` | — | Validate and append to the task report, but **do not touch the plan file** (no Valid cell, no matrix recompute). Set automatically for every agent spawned by `/wbWork --wave`. |
| `--open` | `-o` | Sets `☐ Valid` state to `⬜` (Open). Overrides validation execution. |
| `--def` | `-d` | Sets `☐ Valid` state to `⏸️ Deferred`. Overrides validation execution. |
| `--can` | `-c` | Sets `☐ Valid` state to `🚫 Cancelled`. Overrides validation execution. |
| `--help` | `-h` | Prints this help block. |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

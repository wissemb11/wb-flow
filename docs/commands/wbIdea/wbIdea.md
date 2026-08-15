---
title: "/wbIdea — Capture and manage improvement ideas"
description: Registers new ideas into a scored pipeline, maintains the idea backlog, and promotes ideas to plan tasks when they mature.
---
# /wbIdea — Capture and manage improvement ideas

Registers new ideas into a scored pipeline, maintains the idea backlog, and promotes ideas to plan tasks when they mature.

## When to Use

**Run this when:** You have an improvement idea and want to register it for future action.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbIdea_eli5.md](wbIdea_eli5.md) | What this command does in plain English |
| Practical | [wbIdea_practical.md](wbIdea_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbIdea_expert.md](wbIdea_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [wbIdea_examples.md](wbIdea_examples.md) | Annotated transcripts from actual sessions |
| Simulation | [wbIdea_exhaustive_simulation.md](wbIdea_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbIdea_live_demo.md](wbIdea_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not execute ideas — it only captures and scores them.
- ❌ Does not plan execution — use /wbPlan to convert ideas to tasks.
- ❌ Does not validate ideas — use /wbValid after implementation.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbIdea` in a workflow


## How It Works

Stored in .wb/ideas/ with metadata. Scored automatically.

---

## Flags & Shortcuts

Both forms are equivalent — pass either:
| Long form | Shortcut | Description |
|---|---|---|
| `--resume` | `-r` | Re-read existing idea file, re-score |
| `--scope` | `-s` | Scope override |
| `--task` | `-t` | Explicit idea description |
| `--id` | `-i` | Specifies idea indices to target |
| `--promote` | `-p` | Promote idea(s) to today's plan file |
| `--reject` | `-x` | Mark idea(s) as 🚫 Rejected |
| `--defer` | `-d` | Mark idea(s) as ⏸️ Deferred |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

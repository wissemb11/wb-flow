---
title: "wbContext — Generate or enhance context.md files"
description: "/wbContext reads actual source code — package."
---

# /wbContext — Generate or enhance context.md files

## Overview

`/wbContext` reads actual source code — `package.json`, entry points, configs — to produce accurate, code-aware `context.md` files that describe a folder's identity, dependencies, and rules. It is the foundational command for establishing agent awareness: before any planning or execution, the agent needs to understand what the folder is, what it depends on, and what conventions it follows. `/wbContext` produces that understanding as a structured document.

## When to Use

**Run this when:** You need to establish or update a folder's identity document before planning or executing work.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbContext_eli5.md](wbContext_eli5.md) | What this command does in plain English |
| Practical | [wbContext_practical.md](wbContext_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbContext_expert.md](wbContext_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbContext_exhaustive_simulation.md](wbContext_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbContext_live_demo.md](wbContext_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not generate `dev.md` — that is a separate companion file.
- ❌ Does not plan work — use `/wbPlan` after understanding context.
- ❌ Does not modify source code — it only reads and documents.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbContext` in a workflow


## How It Works

Prioritizes context by relevance: identity > changes > architecture > docs.

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

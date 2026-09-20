---
title: "wbReview — Code review on specific changes"
description: "/wbReview performs a targeted review of specific code changes, pull requests, or diffs."
---

# /wbReview — Code review on specific changes

## Overview

`/wbReview` performs a targeted review of specific code changes, pull requests, or diffs. It focuses on correctness, pattern adherence, and potential issues in the changed code. Unlike `/wbAudit` which evaluates an entire codebase holistically, `/wbReview` zooms in on a specific set of changes, making it faster and more focused for day-to-day code review workflows.

## When to Use

**Run this when:** You have specific changes — a PR, a diff, or a set of modified files — and need a quality assessment before merging.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbReview_eli5.md](wbReview_eli5.md) | What this command does in plain English |
| Practical | [wbReview_practical.md](wbReview_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbReview_expert.md](wbReview_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbReview_exhaustive_simulation.md](wbReview_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbReview_live_demo.md](wbReview_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not audit the entire package — use `/wbAudit` for that.
- ❌ Does not run tests — use `/wbTest` for runtime verification.
- ❌ Does not fix issues — it only identifies them.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbReview` in a workflow


## How It Works

Checks logic, coverage, style, performance, security, error handling, docs.

## Flags & Shortcuts

Both forms are equivalent — pass either:
| Long form | Shortcut |
|---|---|
| `--plan` | `-p` |
| `--act` | `-a` |
| `--wbPlan` | `-P` |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

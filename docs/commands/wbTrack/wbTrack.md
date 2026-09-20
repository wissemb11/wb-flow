---
title: "wbTrack — Start session tracking"
description: "/wbTrack initializes a session tracking file that records every /wb command invocation, creating a narrative of the work session."
---

# /wbTrack — Start session tracking

## Overview

`/wbTrack` initializes a session tracking file that records every `/wb*` command invocation, creating a narrative of the work session. It appends timestamped entries for each command run, capturing the command, target, and outcome. The tracking file serves as the session's audit trail, enabling `/wbStandup` to produce accurate summaries and `/wbNext` to make informed recommendations based on actual workflow history.

## When to Use

**Run this when:** You are starting a work session and want to track all actions for later review and handoff.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbTrack_eli5.md](wbTrack_eli5.md) | What this command does in plain English |
| Practical | [wbTrack_practical.md](wbTrack_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbTrack_expert.md](wbTrack_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbTrack_exhaustive_simulation.md](wbTrack_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbTrack_live_demo.md](wbTrack_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not summarize the session — use `/wbStandup` for that.
- ❌ Does not stop tracking — use `/wbStopTrack` for that.
- ❌ Does not plan work — use `/wbPlan` for that.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbTrack` in a workflow


## How It Works

Records timestamp, branch, task, project context, and billing metadata.

## Flags & Shortcuts

Both forms are equivalent — pass either:
| Long form | Shortcut |
|---|---|
| `--finalize` | `-f` |
| `--scope` | `-s` |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)


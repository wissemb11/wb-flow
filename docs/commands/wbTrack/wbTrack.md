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

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbTrack/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbTrack` in a workflow


## How It Works

Records timestamp, branch, task, project context, and billing metadata.

## Key Options

--issue <number> for ticket linking, --estimate for time budgeting


> **Usage tip:** Track at the task level, not the project level. Use `--issue` to link to tickets for billing.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

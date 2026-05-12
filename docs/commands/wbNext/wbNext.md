# /wbNext — Suggest the next best command to run

## Overview

`/wbNext` analyzes recent workflow state — audits, plans, task reports — and recommends the most impactful next action. It reads the report tree to understand what has been done, what is blocked, and what would create the most value if tackled next. Unlike `/wbPlan` which produces a full multi-step plan, `/wbNext` gives a single ranked suggestion optimized for the immediate decision point.

## When to Use

**Run this when:** You finished a command and want a data-driven recommendation for what to do next.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbNext_eli5.md](wbNext_eli5.md) | What this command does in plain English |
| Practical | [wbNext_practical.md](wbNext_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbNext_expert.md](wbNext_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbNext_exhaustive_simulation.md](wbNext_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbNext_live_demo.md](wbNext_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not execute the suggested command — it only recommends.
- ❌ Does not plan multi-step workflows — use `/wbPlan` for that.
- ❌ Does not track session state — use `/wbTrack` for that.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbNext/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbNext` in a workflow


## How It Works

Evaluates priority, dependencies, recency, effort, impact, and strategic alignment.

## Key Options

--focus bugs|features, --quick-wins for tasks under 30 minutes


> **Usage tip:** Run at the start of every work session. Combine with `wbTrack` for focused execution.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

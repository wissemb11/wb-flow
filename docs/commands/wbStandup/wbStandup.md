# /wbStandup — End-of-session summary

## Overview

`/wbStandup` produces a structured standup report summarizing what was done, what is blocked, and what is next. It reads recent workflow artifacts — task reports, audit findings, plan updates — to compile an accurate session summary without requiring manual note-taking. The command is designed for end-of-day handoffs, ensuring that the next session can pick up exactly where the current one left off.

## When to Use

**Run this when:** You are ending a work session and need to capture progress for the next person or session.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbStandup_eli5.md](wbStandup_eli5.md) | What this command does in plain English |
| Practical | [wbStandup_practical.md](wbStandup_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbStandup_expert.md](wbStandup_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbStandup_exhaustive_simulation.md](wbStandup_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbStandup_live_demo.md](wbStandup_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not plan next steps — use `/wbPlan` or `/wbNext` for that.
- ❌ Does not track session state — use `/wbTrack` for persistent tracking.
- ❌ Does not audit quality — it only summarizes activity.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbStandup/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbStandup` in a workflow


## How It Works

Queries git log, GitHub API, and issue tracker for comprehensive daily summary.

## Key Options

--team for multi-developer reports, --format slack for direct channel post


> **Usage tip:** Run at end of day for most accurate reporting. Review before posting to add missing context.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

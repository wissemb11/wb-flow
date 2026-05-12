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

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbActOn/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbActOn` in a workflow


## How It Works

Reads action items from JSON/text, executes them in dependency order, creates granular commits.

## Key Options

--interactive for manual approval, --dry-run to preview


> **Usage tip:** Pipe audit/review output directly: `wbAudit src/ | wbActOn` for a seamless analysis-to-action pipeline.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

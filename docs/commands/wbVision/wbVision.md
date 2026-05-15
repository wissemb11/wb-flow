# /wbVision — Strategic product vision and roadmap

## Overview

`/wbVision` produces high-level strategic analysis of a product's direction, competitive position, and roadmap recommendations. It evaluates the current state of a project against market opportunities, technical constraints, and user needs to produce a strategic framing. Unlike `/wbPlan` which produces tactical task lists, `/wbVision` operates at the product strategy level, answering *what should we build and why* rather than *how do we build it*.

## When to Use

**Run this when:** You need to step back from implementation details and evaluate product direction, competitive positioning, or roadmap priorities.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbVision_eli5.md](wbVision_eli5.md) | What this command does in plain English |
| Practical | [wbVision_practical.md](wbVision_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbVision_expert.md](wbVision_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbVision_exhaustive_simulation.md](wbVision_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbVision_live_demo.md](wbVision_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not plan tactical tasks — use `/wbPlan` for that.
- ❌ Does not audit code — use `/wbAudit` for technical assessment.
- ❌ Does not execute any changes — it only produces strategic analysis.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbVision/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbVision` in a workflow


## How It Works

Synthesizes from README, commits, issues, and architecture into structured document.

## Key Options

--refine <file> for iterative updates, --diff to check trajectory alignment


> **Usage tip:** Create at project start, refresh quarterly. Use `--diff` to check if development trajectory aligns.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

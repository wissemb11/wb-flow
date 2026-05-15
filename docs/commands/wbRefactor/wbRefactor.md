# /wbRefactor — Restructure code without changing behavior

## Overview

`/wbRefactor` analyzes code structure and produces a refactoring plan or executes targeted structural improvements while preserving behavior. It identifies code smells, architectural inconsistencies, and opportunities for cleaner abstractions. Unlike `/wbDebug` which fixes broken code, `/wbRefactor` improves working code — making it more maintainable, readable, and aligned with established patterns without altering its external behavior.

## When to Use

**Run this when:** You need to improve code structure, reduce complexity, or align with architectural patterns without changing functionality.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbRefactor_eli5.md](wbRefactor_eli5.md) | What this command does in plain English |
| Practical | [wbRefactor_practical.md](wbRefactor_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbRefactor_expert.md](wbRefactor_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbRefactor_exhaustive_simulation.md](wbRefactor_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbRefactor_live_demo.md](wbRefactor_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not add features — it only restructures existing code.
- ❌ Does not fix bugs — use `/wbDebug` for root cause analysis.
- ❌ Does not clean dead code — use `/wbClean` for that.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbRefactor/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbRefactor` in a workflow


## How It Works

Evaluates cyclomatic complexity, coupling, cohesion, and code clones.

## Key Options

--min-confidence <0-1> for noise filtering, --auto-fix --safe-only for automation


> **Usage tip:** Start with `--min-confidence 0.8` to get only high-confidence findings and avoid noise.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

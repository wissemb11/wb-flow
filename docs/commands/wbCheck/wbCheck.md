# /wbCheck — Quick pre-flight validation

## Overview

`/wbCheck` runs a lightweight, fast validation on a target to catch obvious issues before heavier commands like `/wbAudit` or `/wbRelease`. Think of it as a linter pass for your workflow state — it verifies that required files exist, configurations are sane, and there are no glaring blockers. It is designed to be cheap and quick, trading depth for speed.

## When to Use

**Run this when:** You want a quick sanity check before running `/wbAudit` or `/wbRelease`.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbCheck_eli5.md](wbCheck_eli5.md) | What this command does in plain English |
| Practical | [wbCheck_practical.md](wbCheck_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbCheck_expert.md](wbCheck_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbCheck_exhaustive_simulation.md](wbCheck_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbCheck_live_demo.md](wbCheck_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not produce a scored audit — use `/wbAudit` for that.
- ❌ Does not fix issues — it only flags them.
- ❌ Does not replace `/wbTest` — it checks workflow state, not runtime behavior.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbCheck/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbCheck` in a workflow


## How It Works

Runs 7 lightweight checks on changed files only for sub-5-second execution.

## Key Options

--staged for pre-commit, --strict for CI, --fix for auto-correction


> **Usage tip:** Configure as a git pre-commit hook for automatic enforcement on every commit.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

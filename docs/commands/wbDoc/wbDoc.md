# /wbDoc — Generate or update documentation

## Overview

`/wbDoc` produces or refreshes documentation files — READMEs, API docs, guides — from source code and existing workflow artifacts. It reads the actual codebase structure, extracts meaningful patterns, and generates documentation that matches the current state of the project. Unlike `/wbContext` which focuses on agent-facing identity files, `/wbDoc` targets human-facing documentation.

## When to Use

**Run this when:** You need to create or update documentation for a package and want it grounded in actual code.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbDoc_eli5.md](wbDoc_eli5.md) | What this command does in plain English |
| Practical | [wbDoc_practical.md](wbDoc_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbDoc_expert.md](wbDoc_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbDoc_exhaustive_simulation.md](wbDoc_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbDoc_live_demo.md](wbDoc_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not generate `context.md` — use `/wbContext` for that.
- ❌ Does not plan documentation structure — use `/wbPlan` for that.
- ❌ Does not translate — use `/wbTranslate` for multi-language docs.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbDoc/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbDoc` in a workflow


## How It Works

Extracts from JSDoc, conventional commits, package.json, and source structure.

## Key Options

--readme, --api, --changelog flags for targeted generation


> **Usage tip:** Run `--changelog` before every release to ensure release notes are complete and accurate.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

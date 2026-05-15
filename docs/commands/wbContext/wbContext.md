# /wbContext — Generate or enhance context.md files

## Overview

`/wbContext` reads actual source code — `package.json`, entry points, configs — to produce accurate, code-aware `context.md` files that describe a folder's identity, dependencies, and rules. It is the foundational command for establishing agent awareness: before any planning or execution, the agent needs to understand what the folder is, what it depends on, and what conventions it follows. `/wbContext` produces that understanding as a structured document.

## When to Use

**Run this when:** You need to establish or update a folder's identity document before planning or executing work.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbContext_eli5.md](wbContext_eli5.md) | What this command does in plain English |
| Practical | [wbContext_practical.md](wbContext_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbContext_expert.md](wbContext_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbContext_exhaustive_simulation.md](wbContext_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbContext_live_demo.md](wbContext_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not generate `dev.md` — that is a separate companion file.
- ❌ Does not plan work — use `/wbPlan` after understanding context.
- ❌ Does not modify source code — it only reads and documents.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbContext/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbContext` in a workflow


## How It Works

Prioritizes context by relevance: identity > changes > architecture > docs.

## Key Options

--focus <path> for targeted depth, --out <file> for JSON export


> **Usage tip:** Pipe output directly to your LLM: `wbContext | pbcopy` (macOS) or `wbContext | xclip` (Linux).
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

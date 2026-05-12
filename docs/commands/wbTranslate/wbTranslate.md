# /wbTranslate — Translate documentation to other languages

## Overview

`/wbTranslate` produces translations of documentation files while preserving markdown structure, code blocks, and technical terminology. It handles the mechanical work of converting content between languages while maintaining the formatting and structural integrity of the source document. The command is designed for teams that need multi-language documentation without manually reformatting each translation.

## When to Use

**Run this when:** You need documentation translated into additional languages while preserving markdown formatting and technical accuracy.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbTranslate_eli5.md](wbTranslate_eli5.md) | What this command does in plain English |
| Practical | [wbTranslate_practical.md](wbTranslate_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbTranslate_expert.md](wbTranslate_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbTranslate_exhaustive_simulation.md](wbTranslate_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbTranslate_live_demo.md](wbTranslate_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not generate original documentation — use `/wbDoc` for that.
- ❌ Does not verify translation quality — manual review is still required.
- ❌ Does not handle RTL layout — only content translation is supported.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbTranslate/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbTranslate` in a workflow


## How It Works

AST-level translation preserves semantics across programming and human languages.

## Key Options

--from --to for language pairs, --in-place for batch conversion


> **Usage tip:** Review output carefully for edge cases. Run `wbTest` after language translation to catch regressions.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

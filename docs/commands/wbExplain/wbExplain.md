# /wbExplain — Deep-dive explanation of code

## Overview

`/wbExplain` produces a detailed explanation of a specific file, function, module, or task. It supports multiple depth levels — ELI5 for plain-language summaries, practical for usage-focused walkthroughs, and expert for architectural deep-dives. The command is designed for onboarding and code review scenarios where understanding *why* code works matters as much as *what* it does.

## When to Use

**Run this when:** You need to understand how a specific piece of code works at a chosen depth level.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | ⏳ *Not yet written* | What this command does in plain English |
| Practical | ⏳ *Not yet written* | A step-by-step walkthrough on a real project |
| Expert | ⏳ *Not yet written* | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbExplain_exhaustive_simulation.md](wbExplain_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbExplain_live_demo.md](wbExplain_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not modify code — it only explains.
- ❌ Does not audit quality — use `/wbAudit` for that.
- ❌ Does not generate documentation — use `/wbDoc` for that.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbExplain/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbExplain` in a workflow



## Quick Reference

Use `wbExplain` before `wbDebug` to understand code first. For project overviews, start with `wbExplain src/` at the architecture depth.



> **Tip:** Use `--depth architecture` for system-level understanding, or omit for line-level details.

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

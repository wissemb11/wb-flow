# /wbDebug — Find root causes of bugs

## Overview

`/wbDebug` investigates a reported bug or unexpected behavior by reading code, tracing data flow, and identifying the root cause. It produces a diagnosis with a fix recommendation, not the fix itself. The command works by following the execution path from symptom to source, examining assumptions at each layer until it finds the point where reality diverges from intent.

## When to Use

**Run this when:** You have a bug and need to understand why it happens before attempting a fix.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbDebug_eli5.md](wbDebug_eli5.md) | What this command does in plain English |
| Practical | [wbDebug_practical.md](wbDebug_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbDebug_expert.md](wbDebug_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbDebug_exhaustive_simulation.md](wbDebug_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbDebug_live_demo.md](wbDebug_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not fix the bug — it only diagnoses. Use `/wbWork` to apply the fix.
- ❌ Does not test — use `/wbTest` to verify the fix works.
- ❌ Does not audit overall quality — use `/wbAudit` for that.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbDebug/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbDebug` in a workflow


## How It Works

Traces execution path backward from crash point using static analysis.

## Key Options

--bisect for git bisect integration, include full stack trace for best results


> **Usage tip:** Paste the full stack trace for most accurate diagnosis. Include reproduction steps for logic bugs.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

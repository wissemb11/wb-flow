# /wbToWBC — Convert code to WBC component format

## Overview

`/wbToWBC` transforms standard Vue/JS code into the WBC (Web Component) format used by the `wb-core` engine. It analyzes the source component's structure — props, data, methods, lifecycle hooks — and maps them to the WBC architecture's declarative primitives. The conversion preserves behavior while adapting the implementation to the component model that powers the `@wbc-ui2` ecosystem.

## When to Use

**Run this when:** You need to convert an existing Vue component to the WBC architecture for use in the `@wbc-ui2` library.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbToWBC_eli5.md](wbToWBC_eli5.md) | What this command does in plain English |
| Practical | [wbToWBC_practical.md](wbToWBC_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbToWBC_expert.md](wbToWBC_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbToWBC_exhaustive_simulation.md](wbToWBC_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbToWBC_live_demo.md](wbToWBC_live_demo.md) | Real-time execution on an actual codebase |

> **Note:** `/wbToWBC` (#21) is Vue-specific. The other 32 commands work with any codebase.

## What This Command Does NOT Do

- ❌ Does not create new components — it only converts existing ones.
- ❌ Does not validate the result — use `/wbValid` after conversion.
- ❌ Does not audit quality — use `/wbAudit` for that.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbToWBC/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbToWBC` in a workflow


## How It Works

Detects framework automatically, generates loaders, plugins, and optimization config.

## Key Options

--from <bundler> for migration assist, --diff to compare configs

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

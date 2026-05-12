# /wbLicense — Manage licensing and compliance

## Overview

`/wbLicense` scans project dependencies for license compatibility, generates license headers for source files, and produces compliance reports. It identifies potential conflicts between your project's license and those of its dependencies, flagging incompatible combinations before they become legal liabilities. The command is essential for any project that ships to external users or integrates third-party packages.

## When to Use

**Run this when:** You need to verify license compatibility across dependencies or add license headers to source files.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbLicense_eli5.md](wbLicense_eli5.md) | What this command does in plain English |
| Practical | [wbLicense_practical.md](wbLicense_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbLicense_expert.md](wbLicense_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbLicense_exhaustive_simulation.md](wbLicense_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbLicense_live_demo.md](wbLicense_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not change licenses — it only reports and suggests compatible alternatives.
- ❌ Does not audit code quality — use `/wbAudit` for that.
- ❌ Does not handle security — use `/wbSecure` for vulnerability scanning.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbLicense/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbLicense` in a workflow


## How It Works

Supports MIT, Apache-2.0, GPL-3.0, MPL-2.0. Generates SPDX headers.

## Key Options

--check for compliance audit, --headers for source file annotation


> **Usage tip:** MIT is the safest choice for most projects. Use `--check` when adding new dependencies.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

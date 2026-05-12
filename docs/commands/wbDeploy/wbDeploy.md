# /wbDeploy — Deploy an app to production

## Overview

`/wbDeploy` generates deployment configuration, scripts, or procedures for taking an app from a tested state to a live production environment. It handles environment-specific settings, pre-flight checks, and deployment strategy selection. The command bridges the gap between a verified codebase and a running service, producing the artifacts needed for a safe, repeatable deployment.

## When to Use

**Run this when:** You have a tested, audited app ready for production deployment.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbDeploy_eli5.md](wbDeploy_eli5.md) | What this command does in plain English |
| Practical | [wbDeploy_practical.md](wbDeploy_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbDeploy_expert.md](wbDeploy_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbDeploy_exhaustive_simulation.md](wbDeploy_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbDeploy_live_demo.md](wbDeploy_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not build the app — use the build system for that.
- ❌ Does not audit code quality — use `/wbAudit` before deploying.
- ❌ Does not monitor post-deploy — use `/wbCheck` for health checks.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbDeploy/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbDeploy` in a workflow


## How It Works

Runs build, optimizes assets, injects env vars, uploads, purges CDN, smoke tests.

## Key Options

--target gh-pages|vercel|netlify, --preview for branches, --prod for production


> **Usage tip:** Always verify the smoke test output after deployment — a 200 response is not enough.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

# /wbMonetize — Freemium tier strategy and gating

## Overview

`/wbMonetize` analyzes a package's feature set and produces tier recommendations for free, pro, and enterprise plans with specific gating strategies. It evaluates which features create genuine value for paying users versus which should remain accessible to drive adoption. The command bridges product strategy and technical implementation, producing actionable recommendations for feature flags, API limits, and access controls.

## When to Use

**Run this when:** You need to decide which features go in which pricing tier and how to gate them technically.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbMonetize_eli5.md](wbMonetize_eli5.md) | What this command does in plain English |
| Practical | [wbMonetize_practical.md](wbMonetize_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbMonetize_expert.md](wbMonetize_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbMonetize_exhaustive_simulation.md](wbMonetize_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbMonetize_live_demo.md](wbMonetize_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not implement paywalls — it only recommends strategy.
- ❌ Does not audit code — use `/wbAudit` for technical assessment.
- ❌ Does not handle licensing — use `/wbLicense` for compliance.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbMonetize/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbMonetize` in a workflow


## How It Works

Profiles project, segments users, evaluates feature value, benchmarks pricing.

## Key Options

--license-only for license recommendation, --adjust for pricing updates


> **Usage tip:** Run early in the project lifecycle before making irreversible licensing or architecture decisions.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

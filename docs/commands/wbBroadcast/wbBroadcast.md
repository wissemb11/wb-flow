# /wbBroadcast — Announce releases to external channels

## Overview

`/wbBroadcast` generates announcement content for npm, GitHub, social media, and documentation sites after a successful `/wbRelease`. It takes release artifacts — changelogs, version numbers, and feature summaries — and formats them into channel-specific posts. The command handles the communication layer of shipping, ensuring stakeholders and users hear about new releases in the right format.

## When to Use

**Run this when:** You have a published release and need to notify the ecosystem.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbBroadcast_eli5.md](wbBroadcast_eli5.md) | What this command does in plain English |
| Practical | [wbBroadcast_practical.md](wbBroadcast_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbBroadcast_expert.md](wbBroadcast_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbBroadcast_exhaustive_simulation.md](wbBroadcast_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbBroadcast_live_demo.md](wbBroadcast_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not publish packages — use `/wbPublish` for that.
- ❌ Does not create changelogs — those come from `/wbRelease`.
- ❌ Does not verify the release is valid — use `/wbValid` first.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbBroadcast/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbBroadcast` in a workflow


## How It Works

Sends formatted notifications to Slack, Discord, or email via configured webhooks.

## Key Options

--channel to target specific channels, --dry-run to preview format


> **Usage tip:** Configure channels once in `.wb/broadcast.json`, then chain after releases and deploys.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

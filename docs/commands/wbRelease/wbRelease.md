# /wbRelease — Orchestrate a versioned release

## Overview

`/wbRelease` manages the full release workflow: version bumping, changelog generation, git tagging, and pre-publish validation. It coordinates the transition from development HEAD to a versioned artifact, ensuring that all release prerequisites are met — tests pass, audits are clean, changelogs are current. The command produces a tagged release ready for `/wbPublish` and `/wbBroadcast`.

## When to Use

**Run this when:** You are ready to cut a new version of a package and need the full release workflow automated.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbRelease_eli5.md](wbRelease_eli5.md) | What this command does in plain English |
| Practical | [wbRelease_practical.md](wbRelease_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbRelease_expert.md](wbRelease_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbRelease_exhaustive_simulation.md](wbRelease_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbRelease_live_demo.md](wbRelease_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not publish to npm — use `/wbPublish` after releasing.
- ❌ Does not deploy — use `/wbDeploy` for production deployment.
- ❌ Does not broadcast — use `/wbBroadcast` to announce the release.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbRelease/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbRelease` in a workflow


## How It Works

Calculates semver from conventional commits, generates changelog, tags, publishes.

## Key Options

--tag beta for pre-releases, --dry-run to preview, --otp for 2FA packages


> **Usage tip:** Always run `--dry-run` first for major or breaking releases to verify version calculation.
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

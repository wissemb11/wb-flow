---
title: "wbRelease — Orchestrate a versioned release"
description: "## Overview"
---

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

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbRelease` in a workflow


## How It Works

Calculates semver from conventional commits, generates changelog, tags, publishes.

## Flags & Shortcuts

Both forms are equivalent — pass either:
| Long form | Shortcut |
|---|---|
| `--dry-run` | `-d` |
| `--prerelease` | `-p` |
| `--restore` | `-r` |
| `--tag` | `-t` |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

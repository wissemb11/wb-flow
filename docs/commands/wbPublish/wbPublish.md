---
title: "wbPublish — Publish a package to npm"
description: "## Overview"
---

# /wbPublish — Publish a package to npm

## Overview

`/wbPublish` handles the npm publish workflow including version bumping, pre-publish checks, and registry configuration. It validates that the package is in a publishable state — correct version format, all required fields in `package.json`, no uncommitted changes — before executing the publish. The command is the final step in the package distribution pipeline, turning a tested and audited codebase into a publicly installable module.

## When to Use

**Run this when:** You have a tested, audited package ready for npm publication.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbPublish_eli5.md](wbPublish_eli5.md) | What this command does in plain English |
| Practical | [wbPublish_practical.md](wbPublish_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbPublish_expert.md](wbPublish_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbPublish_exhaustive_simulation.md](wbPublish_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbPublish_live_demo.md](wbPublish_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not run tests — use `/wbTest` before publishing.
- ❌ Does not create changelogs — use `/wbRelease` for that.
- ❌ Does not announce the release — use `/wbBroadcast` after.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbPublish` in a workflow


## How It Works

Handles GitHub Pages base URL, .nojekyll, CNAME, and CDN purge.

## Flags & Shortcuts

Both forms are equivalent — pass either:
| Long form | Shortcut |
|---|---|
| `--all` | `-A` |
| `--dry-run` | `-d` |
| `--prerelease` | `-p` |
| `--restore` | `-r` |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

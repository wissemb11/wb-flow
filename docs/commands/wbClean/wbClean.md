# /wbClean — Remove dead code and stale artifacts

Scans a package for unused exports, orphan files, stale reports, and dead workflow state. Produces a cleanup plan or executes it directly.

## When to Use

**Run this when:** You suspect dead code or stale files are accumulating.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbClean_eli5.md](wbClean_eli5.md) | What this command does in plain English |
| Practical | [wbClean_practical.md](wbClean_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbClean_expert.md](wbClean_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbClean_exhaustive_simulation.md](wbClean_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbClean_live_demo.md](wbClean_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not refactor live code — use /wbRefactor for structural changes.
- ❌ Does not audit quality — use /wbAudit for that.
- ❌ Does not delete files without confirmation unless --force is set.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbClean/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbClean` in a workflow


## How It Works

Framework-aware cleaner — knows .next/, dist/, target/ per project type.

## Key Options

--dry-run to preview, --deep for full clean including node_modules


> **Usage tip:** Run `--dry-run` first to preview what will be deleted before actually cleaning.

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

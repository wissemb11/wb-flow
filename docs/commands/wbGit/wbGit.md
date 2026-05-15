# /wbGit — Generate commit messages

Produces structured, conventional-commit-format messages from staged changes or a description. Never runs git commands directly.

## When to Use

**Run this when:** You have changes ready to commit and need a well-structured message.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbGit_eli5.md](wbGit_eli5.md) | What this command does in plain English |
| Practical | [wbGit_practical.md](wbGit_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbGit_expert.md](wbGit_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [wbGit_examples_part1.md](wbGit_examples_part1.md) | Annotated transcripts from actual sessions |
| Simulation | [wbGit_exhaustive_simulation.md](wbGit_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbGit_live_demo.md](wbGit_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not run git commands — the user runs git manually.
- ❌ Does not review code quality — use /wbReview for that.
- ❌ Does not track session state — use /wbTrack for that.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbGit/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbGit` in a workflow


## How It Works

Inspects diffs, classifies change type, detects breaking changes, infers scope.

## Key Options

--review for confirmation, --breaking to force breaking change detection


> **Usage tip:** Use `--review` initially to build trust in generated messages before switching to direct commit.

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

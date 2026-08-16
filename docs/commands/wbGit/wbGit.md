# /wbGit — Generate commit messages

Produces structured, conventional-commit-format messages from staged changes or a description. Never runs git commands directly.

## When to Use

**Run this when:** You have changes ready to commit and need a well-structured message.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbGit_eli5](wbGit_eli5.md) | What this command does in plain English |
| Practical | [wbGit_practical](wbGit_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbGit_expert](wbGit_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [wbGit_examples](wbGit_examples.md) | Annotated transcripts from actual sessions |
| Simulation | [wbGit_exhaustive_simulation](wbGit_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbGit_live_demo](wbGit_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not run git commands — the user runs git manually.
- ❌ Does not review code quality — use /wbReview for that.
- ❌ Does not track session state — use /wbTrack for that.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbGit` in a workflow

## How It Works

Inspects diffs, classifies change type, detects breaking changes, infers scope.

## Key Options

Generates the commit message; you run the commit yourself.

---

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../start_here/installation.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

---
title: "wbTest — Run and verify tests"
description: "/wbTest manages test execution, coverage reporting, and test result analysis."
---

# /wbTest — Run and verify tests

## Overview

`/wbTest` manages test execution, coverage reporting, and test result analysis. It validates that code changes don't break existing functionality and produces structured reports on pass/fail status, coverage metrics, and regression risks. The command integrates with the project's existing test framework, wrapping execution with pre-flight checks and post-run analysis that feed directly into the `/wb*` workflow pipeline.

## When to Use

**Run this when:** You need to verify code correctness through automated tests before merging or releasing.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbTest_eli5.md](wbTest_eli5.md) | What this command does in plain English |
| Practical | [wbTest_practical.md](wbTest_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbTest_expert.md](wbTest_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbTest_exhaustive_simulation.md](wbTest_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbTest_live_demo.md](wbTest_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not fix failing tests — use `/wbDebug` for root cause analysis.
- ❌ Does not audit code quality — use `/wbAudit` for that.
- ❌ Does not review code changes — use `/wbReview` for that.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbTest` in a workflow


## How It Works

Classifies failures as flaky, regression, bug, config, or timing issue.

## Flags & Shortcuts

Both forms are equivalent — pass either:
| Long form | Shortcut |
|---|---|
| `--profile` | `-p` |
| `--task` | `-t` |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

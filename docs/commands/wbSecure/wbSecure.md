---
title: "wbSecure — Security vulnerability scanning"
description: "## Overview"
---

# /wbSecure — Security vulnerability scanning

## Overview

`/wbSecure` performs adversarial security analysis on code, dependencies, and configurations. It identifies vulnerabilities — from known CVEs in dependencies to injection risks in application code — and produces prioritized remediation recommendations. Unlike `/wbAudit` which evaluates general code quality, `/wbSecure` takes an attacker's perspective, looking specifically for exploitable weaknesses that could compromise the system.

## When to Use

**Run this when:** You need to check for security vulnerabilities before deployment or after adding new dependencies.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbSecure_eli5.md](wbSecure_eli5.md) | What this command does in plain English |
| Practical | [wbSecure_practical.md](wbSecure_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbSecure_expert.md](wbSecure_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbSecure_exhaustive_simulation.md](wbSecure_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbSecure_live_demo.md](wbSecure_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not fix vulnerabilities — it only identifies and recommends remediation.
- ❌ Does not audit general quality — use `/wbAudit` for that.
- ❌ Does not handle licensing — use `/wbLicense` for compliance.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbSecure` in a workflow


## How It Works

Layered detection: regex patterns, static analysis, and CVE database lookups.

## Flags & Shortcuts

Both forms are equivalent — pass either:
| Long form | Shortcut |
|---|---|
| `--focus` | `-f` |
| `--force-past-security` | `-F` |
| `--snap` | — | **Universal.** Pin this run's output into `.wb/snaps/<YYYYMMDD>_<label>/` (symlink). `--snap=<label>` names it; `--snap-copy` freezes the content instead. Shell out to `wb-flow snap` — never hand-roll the link. See `_shared/output_conventions.md` §11. |
| `--next` | — | **Universal.** After the command's own output, print what to run next: the `/wbNext <scope>` recommendation, plus — when a plan is in play — the derived **▶️ How to run this plan** block (wave inventory · ordered command list · why not `--wave=all` · flags). Shell out to `wb-flow next <plan.md>`; do not hand-write it. See `_shared/output_conventions.md` §12. |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [wb-flow on npm](https://www.npmjs.com/package/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

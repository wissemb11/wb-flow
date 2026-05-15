# /wbAudit — Deep code-based technical audit

## Overview

`/wbAudit` inspects actual source code to produce an honest, scored assessment of a package or file. It reads real files — not summaries — and outputs a structured report with findings ranked by severity and a ship/don't-ship recommendation. Unlike `/wbReview` which targets specific changes, `/wbAudit` evaluates the entire codebase holistically.

## When to Use

**Run this when:** You need to know if code is ready to ship or where the technical debt is hiding.

## 📚 Layer Files

| Layer | File | What you'll learn |
|---|---|---|
| ELI5 | [wbAudit_eli5.md](wbAudit_eli5.md) | What this command does in plain English |
| Practical | [wbAudit_practical.md](wbAudit_practical.md) | A step-by-step walkthrough on a real project |
| Expert | [wbAudit_expert.md](wbAudit_expert.md) | Architecture, edge cases, and when NOT to use |
| Examples | [README.md](README.md) *(merged)* | Annotated transcripts from actual sessions |
| Simulation | [wbAudit_exhaustive_simulation.md](wbAudit_exhaustive_simulation.md) | Exhaustive flag-matrix and failure-mode coverage |
| Live Demo | [wbAudit_live_demo.md](wbAudit_live_demo.md) | Real-time execution on an actual codebase |

## What This Command Does NOT Do

- ❌ Does not fix any issues — it only describes reality.
- ❌ Does not run tests — use `/wbTest` for runtime verification.
- ❌ Does not check security adversarially — use `/wbSecure`.

## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../../../apps/wb-flow/flow.wbc-ui.com/src/commands/wbAudit/) <!-- [CROSS-EDITION] Phase=A --> covers the same command in a self-help, opinionated register.

## What's Next?

After reading this hub, either:
- Pick a **layer file** above for deep reading
- Run `/wbNext` to see what commands naturally follow `/wbAudit` in a workflow


## How It Works

The audit runs in three phases:

1. **Map** — Discovers project anatomy: file tree, entry points, language distribution, dependency graph, test structure
2. **Check** — Executes ~40 individual heuristics across 5 dimensions (code quality, security, maintainability, documentation, dependencies)
3. **Score** — Aggregates findings into a weighted score (0–100) with a ship / don't-ship recommendation

### Self-Correct Mode

If the target is an existing audit report file (detected by its H1 header), `/wbAudit` runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, checks that done/valid checkboxes have corresponding task reports — never rewrites authored content.

### Smart Merge Protocol

When appending to an existing audit file (2nd+ model on the same scope/day), the command:
1. Reads all prior entries
2. Extracts and deduplicates findings against existing ones (match: ≥2 of same file, same function, >70% title overlap)
3. Appends new findings; enriches duplicates with a **Model Votes** detail section
4. Updates a **Consensus Table** at the top with confidence scores (`🟢 N/N` all agree, `🟡 K/N` partial)
5. Adds a merge log at the bottom

### Unified Backlog Integration

After writing the audit, findings with severity ≥ P2 are auto-sent to the plan file (`plans/plan_<scope>_<YYYYMMDD>.md`). P3/cosmetic items are routed to the idea file when `--ideas` is set.

### "Don't Resolve Open Decisions" Rule

If `context.md` contains an open architectural decision, the audit surfaces it ("still open; don't let new consumers lock it in") — it never resolves it. Audits describe reality, not decide architecture.

### Rubber-Stamp Counter-Prompt

Default LLM agreeableness produces audits that say "looks good, minor issues." This is always wrong for non-trivial packages. The template includes a counter-prompt: *"Assume a paying customer who hates this codebase is about to file a bug report."*

## Key Options

| Flag | Description |
|---|---|
| `--profile` / `-p` | Performance profile — reads runtime data, not just code |
| `--scope` / `-s` | Scoped audit — limit to a specific area (e.g., `--scope=README`) |
| `--security` / `-S` | Adversarial security check — deeper than default |
| `--act` / `-a` | After audit, run the /wbActOn engine to triage findings |
| `--wbPlan` / `-P` | After audit, generate a plan from findings |
| `--ideas` / `-I` | Route P3 findings to idea pipeline instead of discarding |
| `--help` / `-h` | Print help block |
---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

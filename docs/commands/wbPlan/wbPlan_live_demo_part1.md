# /wbPlan — Live Demo: Creating a Plan

> This is a real-time demonstration of `/wbPlan` executed on the `wb-flow-docs` package itself — the very documentation suite you're reading.

---

## Context

- **Target:** `apps/wb-flow/wb-flow-docs/`
- **Date:** 2026-05-11
- **Source:** Audit report from 2026-05-10 (structural audit, 10/10 score)
- **Goal:** Rewrite 51 content stubs to finalize the documentation

---

## The Command

```text
$ /wbPlan frontEnd/wbc-ui/core2/apps/wb-flow/wb-flow-docs/ --focus="content_rewrite"

[AI] Reading .wb/workflows/context.md for wb-flow-docs...
[AI] Reading recent audit: audit_wb-flow-docs_20260510.md (10/10 structural)
[AI] Focus filter: "content_rewrite" — targeting stub files only
[AI] Scanning src/ for stub markers...
[AI]   Found: 51 files with content stubs
[AI] Grouping by directory...
[AI]   - commands/: 21 stubs
[AI]   - concepts/: 16 stubs
[AI]   - start_here/ + daily_use/: 8 stubs
[AI]   - _specs/ + demo_apps/ + root: 6 stubs
[AI]
[AI] Generating plan with 4 parent tasks + recursive expansion option...
[AI] Writing plan_wb-flow-docs_20260511.md
```

---

## The Generated Plan

```markdown
# Plan: wb-flow-docs — 2026-05-11

## Entry #1 — AI via wb-flow — 01:15
> **Model:** AI
> **Scope:** apps/wb-flow/wb-flow-docs/
> **Source:** [audit_wb-flow-docs_20260510.md](../audits/...)
> **Focus:** content_rewrite

### Task Table

| # | Requires | Dep | Task | P | Est. Time |
|---|---|---|---|---|---|
| 7 | 🧠 Planner | — | Rewrite 21 command stubs | P1 | 110 min |
| 8 | 🧠 Planner | — | Rewrite 16 concept stubs | P1 | 120 min |
| 9 | 🧠 Planner | — | Rewrite 8 start_here/daily_use stubs | P1 | 80 min |
| 10 | 🧠 Planner | — | Rewrite 6 misc stubs | P2 | 35 min |
```

---

## Observations

1. **The `--focus` flag** filtered the plan to content rewrite tasks only, excluding structural changes (which were already completed in the audit).

2. **Parent tasks are 🧠 Planner** because they're too large for a single execution — they need recursive expansion into sub-tasks.

3. **No dependencies** between parent tasks — commands, concepts, and start_here can be rewritten in any order.

4. **Priority assignment** — P1 for content that other pages reference (commands, concepts, start_here), P2 for standalone content (misc).

---

## What Happened Next

Each parent task was expanded using `/wbPlan --id=N`:

```bash
/wbPlan plan_wb-flow-docs_20260511.md --id=7   # → 7.1–7.7 (7 sub-tasks)
/wbPlan plan_wb-flow-docs_20260511.md --id=8   # → 8.1–8.8 (8 sub-tasks)
/wbPlan plan_wb-flow-docs_20260511.md --id=9   # → 9.1–9.4 (4 sub-tasks)
/wbPlan plan_wb-flow-docs_20260511.md --id=10  # → 10.1–10.3 (3 sub-tasks)
```

Total: 22 sub-tasks, all independently executable.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

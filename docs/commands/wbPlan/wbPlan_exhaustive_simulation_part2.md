# /wbPlan — Exhaustive Simulation: Recursive Plans & Cross-Reference

> Part 2 covers recursive plan expansion, the --resume workflow simulation, and the cross-reference table.

---

## 6. Recursive Plan Expansion

When a parent task is too complex for a single execution:

```text
$ /wbPlan plan_wb-core_20260511.md --id=7

[AI] Task #7: "Rewrite all command documentation" (estimated 120 min)
[AI] This task exceeds the single-execution threshold (>30 min).
[AI] Expanding into sub-tasks...
[AI] Created sub-plan with 4 sub-tasks (7.1, 7.2, 7.3, 7.4)
```

### Expansion Rules

| Rule | Threshold |
|---|---|
| Auto-suggest expansion | Task > 30 minutes estimated |
| Force expansion | User runs `/wbPlan --id=N` on a specific task |
| Max depth | 2 levels (e.g., 7.1.1 is NOT supported) |
| Sub-task naming | `parent.child` (e.g., 7.1, 7.2, 7.3) |

### Parent State After Expansion

The parent row is updated to show expansion:

```markdown
| 7 | 🧠 Planner | — | 📄 | ⬜ Expanded → 7.1–7.4 | ... | ⬜ | ⬜ |
```

The parent's Done column is only set to ✅ when ALL sub-tasks are ✅.

---

## 7. Resume Workflow Simulation

```text
$ /wbPlan packages/wb-core --resume

[AI] Searching for latest plan...
[AI] Found: plan_wb-core_20260509.md (2 days ago)
[AI] Scanning task table...
[AI]   Tasks: 7 total | 4 ✅ Done | 3 ⬜ Open
[AI] Stale check: 2 days — within tolerance (< 7 days)
[AI]
[AI] Creating plan_wb-core_20260511.md — Entry #1:
[AI]   Carrying forward:
[AI]     #5 — Refactor auth module (P1, ⬜)
[AI]     #6 — Add unit tests (P1, ⬜)
[AI]     #7 — Update documentation (P2, ⬜)
[AI]
[AI] Recommendation: Start with #5 (highest priority, no dependencies)
```

### Resume vs. Fresh Plan

| Aspect | `--resume` | Fresh (no flags) |
|---|---|---|
| Source | Last plan file | Audit report / context.md |
| Tasks | Carried forward (open only) | Freshly generated |
| Numbering | Preserved from original | Starts at 1 |
| Budget | Recalculated for remaining tasks | Full budget |
| When to use | Continuing ongoing work | Starting a new initiative |

---

## 8. The Plan Output Schema

Every plan file follows this exact structure:

```markdown
# Plan: <scope> — <YYYY-MM-DD>

## Entry #N — <Model> via wb-flow — HH:MM
> **Model:** <model name>
> **Scope:** <target path>
> **Source:** [link to audit/idea file]

### Task Table

| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time | Worker | Validator | ☐ Done | ☐ Valid |
|---|---|---|---|---|---|---|---|---|---|---|---|

### 💰 Budget
| Metric | Value |
|---|---|
| **Total tasks** | N |
| **Total time** | X min |
```

---

## 9. Cross-Reference Table

| Related Command | Relationship to `/wbPlan` |
|---|---|
| `/wbAudit` | Produces findings that `/wbPlan` decomposes into tasks |
| `/wbIdea` | Produces scored ideas that `/wbPlan --ingest` converts to tasks |
| `/wbWork` | Executes individual tasks from the plan |
| `/wbValid` | Validates completed tasks in the plan |
| `/wbNext` | Reads plan state to suggest next actions |
| `/wbTrack` | Reads plan state for session narratives |
| `/wbClean` | Can generate cleanup tasks ingested via `/wbPlan` |
| `/wbContext` | Provides scope identity used for plan generation |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

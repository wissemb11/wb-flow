# /wbPlan — Exhaustive Simulation: Flag Processing

> This exhaustive simulation documents the expected behavior of `/wbPlan` across all flag combinations.

---

## 1. Flag Inventory

| Flag | Short | Type | Description |
|---|---|---|---|
| `--resume` | `-r` | Mode | Carry forward open tasks from last plan |
| `--open` | — | State | Reset task(s) to ⬜ Open |
| `--def` | `-d` | State | Set task(s) to ⏸️ Deferred |
| `--can` | `-c` | State | Set task(s) to 🚫 Cancelled |
| `--id` | `-i` | Target | Specify task number(s) to operate on |
| `--focus` | `-f` | Filter | Focus plan on a specific topic |
| `--ingest` | — | Input | Ingest an idea file as plan source |

---

## 2. Flag Processing Matrix

| # | Input | Flags | Expected Behavior | Output |
|---|---|---|---|---|
| 1 | Folder path | (none) | Full audit-based plan generation | New `plan_<scope>_<date>.md` |
| 2 | Folder path | `--resume` | Find last plan, carry forward open tasks | Appended entry or new daily file |
| 3 | Folder path | `--focus=security` | Plan focused on security-related findings | Plan with security-filtered tasks |
| 4 | Idea file | `--ingest` | Convert scored ideas into plan tasks | Plan with `💡` task origins |
| 5 | Plan file | (none) | Self-correct mode: gap-fill, link-fix | Modified existing plan |
| 6 | Plan file | `--id=3 --open` | Reset Task #3 to ⬜ | Modified plan table row |
| 7 | Plan file | `--id=3 --def` | Defer Task #3 to ⏸️ | Modified plan table row |
| 8 | Plan file | `--id=3 --can` | Cancel Task #3 to 🚫 | Modified plan table row |
| 9 | Plan file | `--id=1,2,3 --open` | Batch reset Tasks #1–3 | Modified 3 plan rows |
| 10 | Folder path | `--resume --focus=perf` | Resume + filter for performance tasks | Filtered carry-forward |

---

## 3. Self-Correct Simulation

When `/wbPlan` receives an existing plan file as input:

```text
$ /wbPlan plan_wb-core_20260511.md

[AI] Detected existing plan (H1: "Plan: wb-core")
[AI] Entering self-correct mode...
[AI] Checking task table integrity...
[AI]   ⚠️ Task #3: Done=✅ but report file missing → resetting to ⬜
[AI]   ✅ Task #5: Done=✅, report exists — consistent
[AI]   ⚠️ Task #7: Dep references Task #99 (doesn't exist) → removing dep
[AI] Checking links...
[AI]   ⚠️ Link to audit_wb-core_20260509.md is broken → updated path
[AI] Self-correct complete. 3 issues fixed.
```

### Self-Correct Actions

| Check | Fix |
|---|---|
| Done=✅ but no report file | Reset to ⬜ |
| Valid=✅ but Done=⬜ | Reset Valid to ⬜ |
| Dep references non-existent task | Remove dependency |
| Broken relative links | Search and repair path |
| Missing budget section | Generate from task estimates |
| Stale date in header | Update to current date |

---

## 4. Flag Conflict Resolution

| Combination | Behavior |
|---|---|
| `--open` + `--def` | Error: contradictory state flags |
| `--open` + `--can` | Error: contradictory state flags |
| `--def` + `--can` | Error: contradictory state flags |
| `--resume` + `--id` | Error: `--resume` operates on all tasks, `--id` targets specific ones |
| `--resume` + `--ingest` | Valid: resume existing + ingest new ideas |
| `--focus` + `--ingest` | Valid: filter ingested ideas by focus topic |

---

## 5. Edge Cases

| Scenario | Behavior |
|---|---|
| No audit report exists | Plan is generated from context.md alone (lower quality) |
| Scope has no context.md | `⚠️ Warning: No context.md. Run /wbContext first.` |
| All tasks are ✅ Done | Plan summary: "All tasks complete. Consider /wbAudit for new work." |
| `--id=99` (doesn't exist) | `❌ Error: Task #99 not found in plan table.` |
| Plan is >7 days old | `⚠️ Warning: Plan is stale. Consider full regeneration.` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)
